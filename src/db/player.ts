import { PlayerData, PlayerLogin, PlayerWin } from '../types/types';
import Room from './room';
import NamedSocket from './baseSocket';

export default class Player {
  private player: PlayerLogin;
  private winsData: PlayerWin;
  private index: number | null;
  private socket: NamedSocket;
  private room: Room = undefined;

  constructor(player: PlayerLogin, index: number, socket: NamedSocket) {
    this.player = player;
    this.winsData = {
      name: player.name,
      wins: 0
    }
    this.index = index;
    this.socket = socket;
  }

  public getUserRecord(): PlayerLogin {
    return this.player;
  }

  public getAllWins(): PlayerWin {
    return this.winsData;
  }

  public setWins(): PlayerWin {
    this.winsData.wins += 1;
    return this.winsData;
  }

  public getIndex(): number {
    return this.index
  }

  public getName(): string {
    return this.player.name;
  }

  public isUser(player: PlayerLogin): boolean {
    if (player.name === this.player.name && player.password === this.player.password) return true;

    return false;
  }

  public getNamedSocket(): NamedSocket {
    return this.socket;
  }

  public getPlayerData(): PlayerData {
    return {
      name: this.player.name,
      index: this.index,
      hasError: false,
      errorText: '',
    }
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

  public getRoom(): Room {
    return this.room;
  }

  public deleteRoom(): void {
    this.room = undefined;
  }

  public getIndexRoom(): number {
    return this.room ? this.room.getId() : null;
  }
}