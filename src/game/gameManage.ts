import WebSocket, { RawData, WebSocketServer } from 'ws';
import DataBase from '../db/database';
import { RoomsData } from './room';
import GameSocket from './gameSocket';


export default class GameManage {
  private database: DataBase;
  private roomData: RoomsData;
  private allSockets: Array<GameSocket>;

  constructor() {
    this.database = new DataBase();
    this.roomData = new RoomsData();
    this.allSockets = [];
  }

  public setSocket(socket: WebSocket): void {
    this.addToAllSockets(socket);
  }

  public getAllSockets(): Array<GameSocket> {
    return this.allSockets;
  }

  public getDB(): DataBase {
    return this.database;
  }

  public getRooms(): RoomsData {
    return this.roomData;
  }

  public findGameSocket(socket: WebSocket): GameSocket {
    return this.allSockets.find((nSocket: GameSocket) => nSocket.isSocketUser(socket));
  }

  public findSocketByName(name: string): GameSocket {
    return this.allSockets.find((item: GameSocket) => item && item.getName() === name);
  }

}