import { WebSocket } from 'ws';
import { ConsoleMessage } from '../types/types';
import { logRequest } from '../utils/logMessage';
import Game from '../game/game';
import GameSocket from '../game/gameSocket';

export default class BaseSocket {
  public socket: WebSocket;
  private gameSocket: GameSocket;
  private game: Game;
  private nameSocket: string;

  constructor(socket: WebSocket, game: Game) {
    this.socket = socket;
    this.game = game;
    this.gameSocket = new GameSocket(this, this.game);
    this.nameSocket = '';

    this.socket.on('message', (data) => {
      const recivedData = data.toString();

      const command: ConsoleMessage = JSON.parse(recivedData);

      if (!logRequest(command, socket)) return;

      this.gameSocket.handle(command, this.socket);
    });

    this.socket.on('close', () => {
      console.log(`Socket of user ${this.nameSocket} was closed`);

      this.game.removeClosed();
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