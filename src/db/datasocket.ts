import { WebSocket } from 'ws';
import { Game } from '../game/game';

export default class DataSocket {
  public socket: WebSocket;
  private nameSocket: string;
  private game: Game;

  constructor(socket: WebSocket, game: Game) {
    this.socket = socket;
    this.nameSocket = '';
    this.game = game;

    this.socket.on('message', (data) => {
      const result = data.toString();
      const command = JSON.parse(result);
    });

    this.socket.on('close', () => {
      console.log(`Socket ${this.nameSocket} was closed`);
    });
  }

  public setName(name: string): void {
    this.nameSocket = name;
  }

  public getName(): string {
    return this.nameSocket;
  }

  public getSocket(): WebSocket | undefined {
    return this.socket ? this.socket : undefined;
  }

  public setNewSocket(socket: WebSocket): void {
    this.socket = socket;
  }
}
