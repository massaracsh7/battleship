import WebSocket from 'ws';
import BaseSocket from '../db/baseSocket';
import Handlers from '../ws/handler';
import { logResponse } from '../utils/logMessage';
import Game from './game';
import Player from '../db/player';
import RoomsBase from '../db/roomsHandler';
import { PlayerLogin, Command, ShipPlacementData, AttackRequest, RandomAttackRequest, RoomData, ConsoleMessage } from '../types/types';

export default class GameSocket {
  private handler: Handlers;
  private socket: BaseSocket;
  private game: Game;

  constructor(socket: BaseSocket, game: Game) {
    this.socket = socket;
    this.game = game;
    this.handler = new Handlers();
  }

  public handle(command: ConsoleMessage, socket: WebSocket): void {
    let user: Player;

    switch (command.type) {
      case Command.REG:
        const data: PlayerLogin = JSON.parse(command.data);

        if (!this.socket.checkSocketName()) {
          this.socket.setName(data.name);
        }

        const regResponse: string = this.handler.register(data, this.game.getDB(), this.socket);

        logResponse(regResponse);
        socket.send(regResponse);

        const updateRoomsResponse: string = this.handler.updateRoom(this.game.getRooms());
        socket.send(updateRoomsResponse);

        this.handler.updateWinners(this.game.getDB(), this.game.getSockets());
        break;

      case Command.CREATE_ROOM:
        user = this.game.getDB().findUserBySocket(socket);
        const rooms: RoomsBase = this.game.getRooms();
        rooms.addRoom(user);

        this.handler.updateAllRooms(rooms, this.game.getSockets());
        break;

      case Command.ADD_USER_TO_ROOM:
        const roomIdObj = JSON.parse(command.data) as RoomData;
        user = this.game.getDB().findUserBySocket(socket);

        if (roomIdObj.roomId !== user.getIndexRoom()) {
          const fUser: Player = this.game.getDB().findUserByIdRoom(roomIdObj.roomId);
          const responses: Array<string> = this.handler.addUserToRoom(fUser, user, this.game.getRooms());

          fUser.getNamedSocket().getSocket().send(responses[0]);
          user.getNamedSocket().getSocket().send(responses[1]);

          this.handler.updateAllRooms(this.game.getRooms(), this.game.getSockets());
        }
        break;

      case Command.ADD_SHIPS:
        const shipsData = JSON.parse(command.data) as ShipPlacementData;
        const resultOperation = this.handler.addShips(shipsData, this.game.getRooms());

        if (resultOperation) {
          this.handler.sendTurn(shipsData.gameId, this.game.getRooms(), this.game.getDB(), this.game.getSockets());
        }
        break;

      case Command.ATTACK:
        const targetAttack = JSON.parse(command.data) as AttackRequest;
        this.handler.handleAttack(targetAttack, this.game.getRooms(), this.game.getDB(), this.game.getSockets());
        break;

      case Command.RANDOM_ATTACK:
        const randomAttack = JSON.parse(command.data) as RandomAttackRequest;
        this.handler.handleRandomAttack(randomAttack, this.game.getRooms(), this.game.getDB(), this.game.getSockets());
        break;

    }
  }
}
