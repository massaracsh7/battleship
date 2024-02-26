import WebSocket from 'ws';
import BaseSocket from '../db/baseSocket';
import Handlers from '../ws/handler';
import { logResponse } from '../utils/logMessage';
import Game from './game';
import Player from '../db/player';
import RoomsBase from '../db/roomsHandler';
import { ConsoleMessage, Command, PlayerLogin, RoomInfo, AddShipInfo, AttackReqInfo, RandomReq } from '../types/types';

export default class GameSocket {
  private handler: Handlers;
  private socketBase: BaseSocket;
  private game: Game;

  constructor(socket: BaseSocket, game: Game) {
    this.socketBase = socket;
    this.game = game;
    this.handler = new Handlers();
  }

  public handle(command: ConsoleMessage, socket: WebSocket): void {
    let playerF: Player;
    switch (command.type) {
      case Command.REG:
        const data: PlayerLogin = JSON.parse(command.data);
        if (!this.socketBase.hasSocket()) {
          this.socketBase.setName(data.name);
        }
        const response: string = this.handler.register(data, this.game.getDb(), this.socketBase);
        logResponse(response);
        socket.send(response);
        const updateRooms: string = this.handler.updateRoom(this.game.getRooms());
        socket.send(updateRooms);
        this.handler.updateWinners(this.game.getDb(), this.game.getAllSockets());
        break;

      case Command.CREATE_ROOM:
        playerF = this.game.getDb().findPlayerSocket(socket);
        const rooms: RoomsBase = this.game.getRooms();
        rooms.addRoom(playerF);
        this.handler.updateAllRooms(rooms, this.game.getAllSockets());
        break;

      case Command.ADD_USER_TO_ROOM:
        const roomObj = JSON.parse(command.data) as RoomInfo;
        playerF = this.game.getDb().findPlayerSocket(socket);
        if (roomObj.indexRoom !== playerF.getIndexRoom()) {
          const first: Player = this.game.getDb().findPlayerRoom(roomObj.indexRoom);
          const responses: string[] = this.handler.addPlayerRoom(first, playerF, this.game.getRooms());
          first.getSocket().getSocket().send(responses[0]);
          playerF.getSocket().getSocket().send(responses[1]);
          this.handler.updateAllRooms(this.game.getRooms(), this.game.getAllSockets());
        }
        break;

      case Command.ADD_SHIPS:
        const shipsData = JSON.parse(command.data) as AddShipInfo;
        const resultShips = this.handler.addShips(shipsData, this.game.getRooms());
        if (resultShips) {
          this.handler.sendTurn(shipsData.gameId, this.game.getRooms(), this.game.getDb(), this.game.getAllSockets());
        }
        break;

      case Command.ATTACK:
        const resAttack = JSON.parse(command.data) as AttackReqInfo;
        this.handler.handleAttack(resAttack, this.game.getRooms(), this.game.getDb(), this.game.getAllSockets());
        break;

      case Command.RANDOM_ATTACK:
        const randomAttack = JSON.parse(command.data) as RandomReq;
        this.handler.handleRandomAttack(randomAttack, this.game.getRooms(), this.game.getDb(), this.game.getAllSockets());
        break;

      case Command.SINGLE_PLAY:
        console.log('Handling single play command:', command.data);
        playerF = this.game.getDb().findPlayerSocket(socket);
        const singlePlayResponse = this.handler.addSingle(playerF, this.game);
        socket.send(singlePlayResponse);
        this.handler.updateAllRooms(this.game.getRooms(), this.game.getAllSockets());
        break;

      default:
        console.log('Unknown command:', command.type);
        break;
    }
  }
}
