import { RoomPlayers } from '../types/types';
import Player from './player';

export default class Room {
  private roomId: number;
  private roomPlayers: RoomPlayers[]

  constructor(id: number) {
    this.roomId = id;
    this.roomPlayers = [] as RoomPlayers[];
  }

  public addPlayer(player: Player): boolean {
    if (this.roomPlayers.length >= 2) return false;
    if (this.roomPlayers.some((item) => item.name === player.getName())) return false;
    this.roomPlayers.push(this.createPlayerRoom(player));
    return true;
  }

  public deletePlayer(player: Player): RoomPlayers | null {
    if (this.roomPlayers.length < 2) return null;
    const deletedPlayer = this.roomPlayers.find((item: RoomPlayers) => item.name === player.getName());
    this.roomPlayers = this.roomPlayers.filter((item: RoomPlayers) => item.name !== player.getName());
    return deletedPlayer || null;
  }

  public getRoomId(): number {
    return this.roomId;
  }

  public getPlayers(): RoomPlayers[] {
    return this.roomPlayers;
  }

  private createPlayerRoom(player: Player): RoomPlayers {
    return {
      name: player.getName(),
      index: player.getIndex()
    };
  }

  public getPlayersCount(): number {
    return this.roomPlayers.length;
  }

  public getAllPlayers(): RoomPlayers[] {
    return this.roomPlayers;
  }
}