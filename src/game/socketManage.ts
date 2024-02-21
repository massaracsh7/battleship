import WebSocket from 'ws';
import { dataTypes } from '../types/types';
import { Player } from '../types/types';
import GameSocket from './gameSocket';
import Manager from '../websocket/manager';
import { responseRes } from '../ws/consoleResults';
import GameManage from './gameManage';
import PlayerData from '../db/player';
import { RoomData2 } from './room';

export default class SocketManage {
  private manager: Manager;
  private nSocket: GameSocket;
  private game: GameManage;

  constructor(nSocket: GameSocket, game: GameManage) {
    this.nSocket = nSocket;
    this.game = game;
    this.manager = new Manager();
  }

  public handler(command, socket: WebSocket): void {
    let findUser: Player;

    switch (command.type) {

      case dataTypes.REG:

        const data: Player = JSON.parse(command.data);

        if (!this.nSocket.checkSocketName()) {

          this.nSocket.setName(data.name);
        }

        const response: string = this.manager.regHandler(data, this.game.getDB(), this.nSocket);

        responseRes(response);

        socket.send(response);

        const updateRooms: string = this.manager.updateRoom(this.game.getRooms());

        socket.send(updateRooms);

        this.manager.allWinnersUpdate(this.game.getDB(), this.game.getAllSockets());

        break;

      case dataTypes.CREATE_ROOM:
        findUser = this.game.getDB().findUserBySocket(socket);

        const rooms: RoomData = this.game.getRooms();

        rooms.addRoom(findUser);

        this.manager.allRoomsUpdate(rooms, this.game.getAllSockets());

        break;

      case dataTypes.ADD_USER_TO_ROOM:
        const roomIdObj = JSON.parse(command.data) as RoomData;
        findUser = this.game.getDB().findUserBySocket(socket);
        if (roomIdObj.indexRoom !== findUser.getIndexRoom()) {
          const fUser: Player = this.game.getDB().findUserByIdRoom(roomIdObj.indexRoom);
          const responses: Array<string> = this.manager.addUserToRoom(fUser, findUser, this.game.getRooms());

          fUser.getNamedSocket().getSocket().send(responses[0]);
          findUser.getNamedSocket().getSocket().send(responses[1]);

          this.manager.allRoomsUpdate(this.game.getRooms(), this.game.getAllSockets());
        }
        break;

      case dataTypes.ADD_SHIPS:
        const shipsData = JSON.parse(command.data);
        const resultOperation = this.manager.addShips(shipsData, this.game.getRooms());

        if (resultOperation) {
          this.manager.sendTurnPlayer(shipsData.gameId, this.game.getRooms(), this.game.getDB(), this.game.getAllSockets());
        }
        break;

      case dataTypes.ATTACK:
        const targetAttack = JSON.parse(command.data);

        this.manager.handleTagetAttack(targetAttack, this.game.getRooms(), this.game.getDB(), this.game.getAllSockets());
        break;

      case dataTypes.RANDOM_ATTACK:
        const randomAttack = JSON.parse(command.data);
        this.manager.handleRandomAttack(randomAttack, this.game.getRooms(), this.game.getDB(), this.game.getAllSockets());
        break;

      case dataTypes.SINGLE_PLAY:
        console.log('default command---->', command.data);

        findUser = this.game.getDB().findUserBySocket(socket);

        const responseForSingleUser = this.manager.addUserToSinglePlayer(findUser, this.game);

        socket.send(responseForSingleUser);

        this.manager.allRoomsUpdate(this.game.getRooms(), this.game.getAllSockets());
        break;
    }
  }
}