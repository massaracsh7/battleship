import { Player } from '../types/types';
import DataSocket from './datasocket';

export default class PlayerData {
  private player: Player;
  private index: number;
  private socket: DataSocket;

  constructor(player: Player, index: number, socket: DataSocket) {
    this.player = player;
    this.index = index;
    this.socket = socket;
  }

  public getNamePlayer(): string {
    return this.player.name;
  }

  public getIndexPlayer(): number {
    return this.index;
  }

  public getNamedSocket(): DataSocket {
    return this.socket;
  }

  public getPlayerInfo(): PlayerInfo {
    return {
      name: this.player.name,
      index: this.index,
      error: false,
      errorText: '',
    };
  }
}

interface PlayerInfo {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
