import { PlayerData, PlayerLogin, PlayerWin } from '../types/types';
import Room from './room';
import BaseSocket from './baseSocket';

export default class Player {
  private player: PlayerLogin;
  private winInfo: PlayerWin;
  private socket: BaseSocket;
  private room: Room | undefined;
  private index: number | null;

  constructor(player: PlayerLogin, index: number, socket: BaseSocket) {
    this.player = player;
    this.winInfo = {
      name: player.name,
      wins: 0
    };
    this.index = index;
    this.socket = socket;
  }

  public getPlayer(): PlayerLogin {
    return this.player;
  }

  public getAllWins(): PlayerWin {
    return this.winInfo;
  }

  public isPlayer(player: PlayerLogin): boolean {
    return player.name === this.player.name && player.password === this.player.password;
  }

  public setWins(): PlayerWin {
    this.winInfo.wins += 1;
    return this.winInfo;
  }

  public getIndex(): number | null {
    return this.index;
  }

  public getName(): string {
    return this.player.name;
  }


  public getSocket(): BaseSocket {
    return this.socket;
  }

  public getPlayerData(): PlayerData {
    return {
      name: this.player.name,
      index: this.index,
      error: false,
      errorText: '',
    };
  }

  public checkName(name: string): boolean {
    return name === this.player.name;
  }

  public checkPassword(pw: string): boolean {
    return pw === this.player.password;
  }

  public setRoom(room: Room): void {
    this.room = room;
  }

  public getRoom(): Room | undefined {
    return this.room;
  }

  public getIndexRoom(): number | null {
    return this.room ? this.room.getRoomId() : null;
  }
}
