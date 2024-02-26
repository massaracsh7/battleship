import DataBase from '../db/database';
import ResponseBuilder from '../utils/responseBuilder';
import RoomsHandler from '../db/roomsHandler';
import BaseSocket from '../db/baseSocket';
import { logResponse } from '../utils/logMessage';
import Player from '../db/player';
import Arena from '../game/gameArena';
import { AddShipInfo, StartInfo, AttackReqInfo, AttackResInfo, RandomReq, FinishInfo, Turn, PlayerData, PlayerLogin, Command } from '../types/types';
import Game from '../game/game';

export default class Handlers {
  public register(player: PlayerLogin, database: DataBase, socket: BaseSocket): string {
    let result: Player = database.findPlayer(player);
    if (!result) {
      result = database.setPlayer(player, socket);
    }
    if (!database.authenticatePlayer(player)) {
      const errObj: PlayerData = {
        name: player.name,
        index: -1,
        error: true,
        errorText: 'Wrong login or password'
      };
      return new ResponseBuilder(Command.REG, JSON.stringify(errObj), -1).getResult();
    }
    return new ResponseBuilder(Command.REG, JSON.stringify(result.getPlayerData()), result.getIndex()).getResult();
  }

  public updateRoom(rooms: RoomsHandler): string {
    return new ResponseBuilder(Command.UPDATE_ROOM, JSON.stringify(rooms.getUpdate()), 0).getResult();
  }

  public updateWinners(database: DataBase, sockets: BaseSocket[]) {
    const result = new ResponseBuilder(Command.UPDATE_WINNERS, JSON.stringify(database.getAllWinners()), 0).getResult();
    logResponse(result);
    sockets.forEach((socket: BaseSocket) => {
      socket && socket.getSocket().send(result);
    });
  }

  public updateAllRooms(rooms: RoomsHandler, sockets: BaseSocket[]): void {
    const res: string = new ResponseBuilder(Command.UPDATE_ROOM, JSON.stringify(rooms.getUpdate()), 0).getResult();
    logResponse(res);
    sockets.forEach((socket: BaseSocket) => socket.getSocket().send(res));
  }

  public addPlayerRoom(first: Player, second: Player, rooms: RoomsHandler): string[] {
    const newArena: Arena = rooms.createArena(first, second);
    const result1: string = new ResponseBuilder(
      Command.CREATE_GAME,
      JSON.stringify(newArena.getGameFirst()),
      newArena.getArenaId()).getResult();

    const result2 = new ResponseBuilder(
      Command.CREATE_GAME,
      JSON.stringify(newArena.getGameSecond()),
      newArena.getArenaId()).getResult();

    return [result1, result2];
  }

  public addSingle(user: Player, game: Game): string {
    const newArena: Arena = game.getRooms().createArenaSingle(user, game);
    const result = new ResponseBuilder(
      Command.CREATE_GAME,
      JSON.stringify(newArena.getGameFirst()),
      newArena.getArenaId()
    );

    return result.getResult();
  }

  public addShips(shipsData: AddShipInfo, rooms: RoomsHandler): boolean {
    const socket: BaseSocket = rooms.addShipsArena(shipsData);
    let res: StartInfo;
    let result: boolean;

    if (socket.getSocket()) {
      res = {
        currentPlayerIndex: shipsData.indexPlayer,
        ships: shipsData.ships
      };
    } else {
      res = {
        currentPlayerIndex: -1,
        ships: []
      };
    }

    if (rooms.checkArenaStart(shipsData.gameId)) {
      const stringResponse = new ResponseBuilder(
        Command.START_GAME,
        JSON.stringify(res),
        shipsData.gameId);

      const sockets: BaseSocket[] = rooms.getSocketArena(shipsData.gameId);

      sockets.forEach((socket: BaseSocket) => {
        logResponse(stringResponse.getResult());
        socket.getSocket().send(stringResponse.getResult());
      });

      result = true;
    } else {
      result = false;
    }

    return result;
  }

  public sendTurn(gameId: number, rooms: RoomsHandler, databse: DataBase, allSockets: BaseSocket[]): void {
    if (rooms.checkArenaStart(gameId)) {
      const sockets: BaseSocket[] = rooms.getSocketArena(gameId);
      const turn: boolean = Math.random() < 0.5 ? true : false;
      const ids: number[] = rooms.getPlayId(gameId);
      const currentPlayerTurn: number = turn ? ids[0] : ids[1];
      const resTurn: Turn = {
        currentPlayer: currentPlayerTurn
      };

      rooms.setFirstPlayerId(resTurn.currentPlayer, gameId);
      const data = new ResponseBuilder(Command.TURN, JSON.stringify(resTurn), gameId);
      sockets.forEach((socket: BaseSocket) => {
        logResponse(data.getResult());
        socket.getSocket().send(data.getResult());
      });

      if (resTurn.currentPlayer === -1) {
        const info: AttackReqInfo = this.attackSingle(gameId, rooms);
        this.handleAttack(info, rooms, databse, allSockets);
      }
    }
  }

  public handleAttack(info: AttackReqInfo, rooms: RoomsHandler, databse: DataBase, allSockets: BaseSocket[]): void {
    const playersID: number[] = rooms.getPlayId(info.gameId);
    const idPlay = rooms.getTurn(info.gameId, info.indexPlayer);
    if (idPlay.currentPlayer !== info.indexPlayer) {
      const result: AttackResInfo = rooms.checkArena(info);
      const sockets: BaseSocket[] = rooms.getSocketArena(info.gameId);
      const resAttack = new ResponseBuilder(Command.ATTACK, JSON.stringify(result), info.indexPlayer);
      sockets.forEach((socket: BaseSocket) => {
        logResponse(resAttack.getResult());
        socket.getSocket().send(resAttack.getResult());
      });
      const wins: boolean = rooms.checkWins(info);
      if (wins) {
        const winner: FinishInfo = rooms.getWinners(info);
        rooms.removeArena(info.gameId);
        databse.setNewWinner(winner.winPlayer);
        const responseWin = new ResponseBuilder(Command.FINISH, JSON.stringify(winner), info.gameId);
        sockets.forEach((socket: BaseSocket) => {
          logResponse(responseWin.getResult());
          socket.getSocket().send(responseWin.getResult());
        });
        this.updateWinners(databse, allSockets);
        this.updateAllRooms(rooms, allSockets);
      } else {
        const res = new ResponseBuilder(Command.TURN, JSON.stringify(idPlay), info.indexPlayer);
        sockets.forEach((socket: BaseSocket) => {
          logResponse(res.getResult());
          socket.getSocket().send(res.getResult());
        });

        if (playersID[1] === -1) {
          const result: AttackReqInfo = this.attackSingle(info.gameId, rooms);
          console.log(result);
          this.handleAttack(result, rooms, databse, allSockets);
        }

      }
    }
  }

  public handleRandomAttack(random: RandomReq, rooms: RoomsHandler, database: DataBase, allSockets: BaseSocket[]) {
    const x: number = Math.ceil(Math.random() * 10);
    const y: number = Math.ceil(Math.random() * 10);

    const info: AttackReqInfo = {
      x: x,
      y: y,
      ...random
    };

    this.handleAttack(info, rooms, database, allSockets);
  }

  public attackSingle(gameId: number, rooms: RoomsHandler): AttackReqInfo {
    return rooms.attackSingle(gameId);
  }

}