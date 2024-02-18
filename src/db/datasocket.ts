import { WebSocket } from 'ws';

export default class DataSocket {
  public socket: WebSocket;
  private nameSocket: string;

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.nameSocket = '';

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
    return this.socket;
  }

  public setNewSocket(socket: WebSocket): void {
    this.socket = socket;
  }
}