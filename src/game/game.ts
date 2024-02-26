import WebSocket from 'ws';
import DataBase from '../db/database';
import RoomsBase from '../db/roomsHandler';
import BaseSocket from '../db/baseSocket';

export default class Game {
  private database: DataBase;
  private roomBase: RoomsBase;
  private allSockets: BaseSocket[];

  constructor() {
    this.database = new DataBase();
    this.roomBase = new RoomsBase();
    this.allSockets = [];
  }

  public setSocket(socket: WebSocket): void {
    this.addAllSockets(socket);
  }

  public getAllSockets(): BaseSocket[] {
    return this.allSockets;
  }

  public getDb(): DataBase {
    return this.database;
  }

  public getRooms(): RoomsBase {
    return this.roomBase;
  }

  public findSocket(socket: WebSocket): BaseSocket | undefined {
    return this.allSockets.find((item: BaseSocket) => item.isSocketPl(socket));
  }

  public findByName(name: string): BaseSocket | undefined {
    return this.allSockets.find((item: BaseSocket) => item && item.getName() === name);
  }

  public removeSocket(socket: BaseSocket): void {
    this.allSockets = this.allSockets.filter((item: BaseSocket) => item.getName() !== socket.getName());
  }

  private addAllSockets(socket: WebSocket): void {
    const newSocket = new BaseSocket(socket, this);
    this.allSockets.push(newSocket);
  }

  public removeClose(): void {
    this.allSockets = this.allSockets.filter((socket: BaseSocket) => socket.getSocket().readyState === 1);
  }
}
