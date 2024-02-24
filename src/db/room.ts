import { RoomPlayerData } from '../types/types';
import Player from './player';

export default class Room {
  private roomId: number;
  private players: Array<RoomPlayerData>;

  constructor(id: number) {
    this.roomId = id;
    this.players = [];
  }

  public addPlayer(player: Player): boolean {
    if (this.players.length >= 2) return false;

    if (this.isPlayerInRoom(player)) return false;

    this.players.push(this.createPlayerRoomData(player));
    return true;
  }

  public removePlayer(player: Player): RoomPlayerData | null {
    if (this.players.length < 2) return null;

    this.players = this.players.filter((playerData: RoomPlayerData) => playerData.name !== player.getName());
    return this.createPlayerRoomData(player);
  }

  public getId(): number {
    return this.roomId;
  }

  public getPlayers(): Array<RoomPlayerData> {
    return this.players;
  }

  public getPlayerCount(): number {
    return this.players.length;
  }

  private isPlayerInRoom(player: Player): boolean {
    console.log(this.players.some((playerData: RoomPlayerData) => playerData.name === player.getName()));
    return this.players.some((playerData: RoomPlayerData) => playerData.name === player.getName());
  }

  private createPlayerRoomData(player: Player): RoomPlayerData {
    return {
      name: player.getName(),
      index: player.getIndex()
    };
  }

  public getAllPlayers(): Array<RoomPlayerData> {
    return this.players;
  }
}
