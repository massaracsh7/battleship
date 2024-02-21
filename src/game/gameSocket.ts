import { WebSocket } from 'ws';
import PlayerData from '../db/player';
import { Player } from '../types/types';
import { requestRes } from '../ws/consoleResults';
import GameManage from './gameManage';
import SocketManage from './socketManage';

export default class GameSocket {
  public socket: WebSocket;
  private handlerSocket: SocketManage;
  private gameManage: GameManage;
  private nameSocket: string;

  constructor(socket: WebSocket, gameManage: GameManage) {
    this.socket = socket;
    this.gameManage = gameManage;
    this.handlerSocket = new SocketManage(this, this.gameManage);
    this.nameSocket = '';

    this.socket.on('message', (data) => {
      const recivedData = data.toString();

      const command = JSON.parse(recivedData);

      if (!requestRes(command, socket)) return;

      this.handlerSocket.handler(command, this.socket);
    });

    this.socket.on('close', () => {
      console.log(`Socket of user ${this.nameSocket} was closed`);

      this.gameManage.deleteSockets();
    });
  }

  public setName(name: string) {
    this.nameSocket = name;
  }

  public getName(): string {
    return this.nameSocket;
  }

  public getSocket(): WebSocket {
    return this.socket ? this.socket : undefined;
  }

  public isSocketUser(socket: WebSocket): boolean {
    if (socket === this.socket) return true;

    return false;
  }

  public setNewSocket(socket: WebSocket): void {
    this.socket = socket;
  }

  public checkSocketName(): boolean {
    return !!this.nameSocket
  }
}