import { PlayerInfo, Ship } from "../types/types";

export class Room {
  public players: PlayerInfo[];
  public ships: Ship[][] = []; // Ships for each player
  public currentPlayerIndex: number = 0;
  public turnCount: number = 0;

  constructor(players: PlayerInfo[]) {
    this.players = players;
  }
  public addShips(playerIndex: number, ships: Ship[]): void {
    this.ships[playerIndex] = ships;
  }
}