import DataBase from '../db/database';
import ResponseBuilder from '../utils/responseBuilder';
import RoomsBase from '../db/roomsHandler';
import BaseSocket from '../db/baseSocket';
import { logResponse } from '../utils/logMessage';
import Player from '../db/player';
import Arena from '../game/gameArena';
import Game from '../game/game';
import {
  ShipPlacementData,
  GameStartData,
  AttackRequest,
  AttackResponse,
  RandomAttackRequest,
  GameEndData,
  PlayerLogin,
  TurnData,
  Command,
  PlayerData
} from '../types/types';

export default class GameHandler {
  public register(user: PlayerLogin, database: DataBase, socket: BaseSocket): string {

    let result: Player = database.findUser(user);

    if (!result) {
      result = database.registerUser(user, socket);
    }

    if (!database.authenticateUser(user)) {
      const err: PlayerData = {
        name: user.name,
        index: -1,
        hasError: true,
        errorText: 'Wrong player login or password'
      };
      return new ResponseBuilder(Command.REG, JSON.stringify(err), -1).buildResponse();
    }

    return new ResponseBuilder(Command.REG, JSON.stringify(result.getPlayerData()), result.getIndex()).buildResponse();
  }

  public updateRoom(rooms: RoomsBase): string {
    return new ResponseBuilder(Command.UPDATE_ROOM, JSON.stringify(rooms.getRoomUpdates()), 0).buildResponse();
  }

  public updateWinners(database: DataBase, sockets: Array<BaseSocket>) {
    const resp = new ResponseBuilder(Command.UPDATE_WINNERS, JSON.stringify(database.getAllWinners()), 0).buildResponse();
    logResponse(resp);
    sockets.forEach((socket: BaseSocket) => {
      socket && socket.getSocket().send(resp);
    });
  }

  public updateAllRooms(rooms: RoomsBase, sockets: Array<BaseSocket>) {

    const roomsResponse: string = new ResponseBuilder(Command.UPDATE_ROOM, JSON.stringify(rooms.getRoomUpdates()), 0).buildResponse();

    logResponse(roomsResponse);

    sockets.forEach((socket: BaseSocket) => socket.getSocket().send(roomsResponse));
  }

  public addUserToRoom(fUser: Player, sUser: Player, rooms: RoomsBase): Array<string> {
    const arena: Arena = rooms.createArena(fUser, sUser);

    const responseToOwner: string = new ResponseBuilder(
      Command.CREATE_GAME,
      JSON.stringify(arena.getFirstGameData()),
      arena.getId()).buildResponse();

    const responseToSecondPlayer = new ResponseBuilder(
      Command.CREATE_GAME,
      JSON.stringify(arena.getSecondGameData()),
      arena.getId()).buildResponse();

    return [responseToOwner, responseToSecondPlayer];
  }

  public addShips(shipsData: ShipPlacementData, rooms: RoomsBase): boolean {
    const socket: BaseSocket = rooms.addShipsToArena(shipsData);

    let response: GameStartData;
    let returnResult: boolean;

    if (socket.getSocket()) {
      response = {
        currentPlayerIndex: shipsData.indexPlayer,
        ships: shipsData.ships
      };
    } else {
      response = {
        currentPlayerIndex: -1,
        ships: []
      };
    }

    if (rooms.arenaReady(shipsData.gameId)) {
      const stringResponse = new ResponseBuilder(
        Command.START_GAME,
        JSON.stringify(response),
        shipsData.gameId);

      const sockets: Array<BaseSocket> = rooms.fetchSockets(shipsData.gameId);

      sockets.forEach((socket: BaseSocket) => {
        logResponse(stringResponse.buildResponse());
        socket.getSocket().send(stringResponse.buildResponse());
      });

      returnResult = true;
    } else {
      returnResult = false;
    }

    return returnResult;
  }

  public sendTurn(gameId: number, rooms: RoomsBase, databse: DataBase, allSockets: BaseSocket[]): void {
    if (rooms.arenaReady(gameId)) {
      const sockets: Array<BaseSocket> = rooms.fetchSockets(gameId);
      const turn: boolean = Math.random() < 0.5 ? true : false;
      const IdsOfPlayers: Array<number> = rooms.getPlayerIds(gameId);
      const currentPlayerTurn: number = turn ? IdsOfPlayers[0] : IdsOfPlayers[1];

      const turnResponse: TurnData = {
        currentPlayer: currentPlayerTurn
      };

      rooms.setFirstPlayerTurn(turnResponse.currentPlayer, gameId);

      const responseData = new ResponseBuilder(Command.TURN, JSON.stringify(turnResponse), gameId);

      sockets.forEach((socket: BaseSocket) => {
        logResponse(responseData.buildResponse());
        socket.getSocket().send(responseData.buildResponse());
      });
    }
  }

  public handleAttack(target: AttackRequest, rooms: RoomsBase, databse: DataBase, allSockets: BaseSocket[]): void {
    const playersID: Array<number> = rooms.getPlayerIds(target.gameId);

    const idPlayersAttack = rooms.getPlayerTurn(target.gameId, target.indexPlayer);

    if (idPlayersAttack.currentPlayer !== target.indexPlayer) {
      const attack: AttackResponse = rooms.checkAttack(target.gameId, target);

      const sockets: BaseSocket[] = rooms.fetchSockets(target.gameId);

      const attackResponse = new ResponseBuilder(Command.ATTACK, JSON.stringify(attack), target.indexPlayer);

      sockets.forEach((socket: BaseSocket) => {
        logResponse(attackResponse.buildResponse());
        socket.getSocket().send(attackResponse.buildResponse());
      });

      const wins: boolean = rooms.checkWin(target.gameId, target);

      if (wins) {
        const winner: GameEndData = rooms.getWinnerData(target.gameId, target);

        rooms.deleteArena(target.gameId);

        databse.declareWinner(winner.winningPlayer);

        const responseWin = new ResponseBuilder(Command.FINISH, JSON.stringify(winner), target.gameId);

        sockets.forEach((socket: BaseSocket) => {
          logResponse(responseWin.buildResponse());
          socket.getSocket().send(responseWin.buildResponse());
        });

        this.updateWinners(databse, allSockets);
        this.updateAllRooms(rooms, allSockets);

      } else {

        const turnResponse = new ResponseBuilder(Command.TURN, JSON.stringify(idPlayersAttack), target.indexPlayer);

        sockets.forEach((socket: BaseSocket) => {
          logResponse(turnResponse.buildResponse());
          socket.getSocket().send(turnResponse.buildResponse());
        });
      }
    }
  }

  public handleRandomAttack(random: RandomAttackRequest, rooms: RoomsBase, database: DataBase, allSockets: BaseSocket[]) {
    const x: number = Math.ceil(Math.random() * 10);
    const y: number = Math.ceil(Math.random() * 10);

    const target: AttackRequest = {
      x: x,
      y: y,
      ...random
    };

    this.handleAttack(target, rooms, database, allSockets);
  }

}