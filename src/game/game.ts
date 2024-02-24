import WebSocket, { RawData, WebSocketServer } from 'ws';
import DataBase from '../db/database';
import RoomsHandler from '../db/roomsHandler';
import BaseSocket from '../db/baseSocket';

export default class Game {
  private db: DataBase;
  private rooms: RoomsHandler;
  private sockets: Array<BaseSocket>;

  constructor() {
    this.db = new DataBase();
    this.rooms = new RoomsHandler();
    this.sockets = [];
  }

  public addSocket(socket: WebSocket): void {
    const newSocket = new BaseSocket(socket, this);
    this.sockets.push(newSocket);
  }

  public getSockets(): Array<BaseSocket> {
    return this.sockets;
  }

  public getDB(): DataBase {
    return this.db;
  }

  public getRooms(): RoomsHandler {
    return this.rooms;
  }

  public findBySocket(socket: WebSocket): BaseSocket {
    return this.sockets.find((s: BaseSocket) => s.isSocketUser(socket));
  }

  public findByName(name: string): BaseSocket {
    return this.sockets.find((s: BaseSocket) => s && s.getName() === name);
  }

  public removeSocket(socket: BaseSocket): void {
    this.sockets = this.sockets.filter((s: BaseSocket) => s.getName() !== socket.getName());
  }

  public removeClosed(): void {
    this.sockets = this.sockets.filter((s: BaseSocket) => s.getSocket().readyState === 1);
  }
}
