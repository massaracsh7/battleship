import { WebSocket } from 'ws';
import { ConsoleMessage } from '../types/types';
import { logRequest } from '../utils/logMessage';
import Game from '../game/game';
import GameSocket from '../game/gameSocket';

export default class BaseSocket {
  public socket: WebSocket;
  private gameSocket: GameSocket;
  private game: Game;
  private name: string;

  constructor(socket: WebSocket, game: Game) {
    this.socket = socket;
    this.game = game;
    this.gameSocket = new GameSocket(this, this.game);
    this.name = '';

    this.socket.on('message', (data) => {
      const result = data.toString();
      const command: ConsoleMessage = JSON.parse(result);
      if (!logRequest(command, socket)) return;
      this.gameSocket.handle(command, this.socket);
    });

    this.socket.on('close', () => {
      console.log(`Socket of ${this.name} was closed`);
      this.game.removeClose();
    });
  }

  public setName(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public getSocket(): WebSocket {
    return this.socket ? this.socket : undefined;
  }

  public isSocketPl(socket: WebSocket): boolean {
    if (socket === this.socket) return true;
    return false;
  }

  public setNewSocket(socket: WebSocket): void {
    this.socket = socket;
  }

  public hasSocket(): boolean {
    return !!this.name
  }
}