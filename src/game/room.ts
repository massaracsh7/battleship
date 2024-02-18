import { Player, Ship } from "../types/types";

export class Room {
  public players: Player[];
  public ships: Ship[][] = []; // Ships for each player
  public currentPlayerIndex: number = 0;
  public turnCount: number = 0;

  constructor(players: Player[]) {
    this.players = players;
  }

  // Add ships to the specified player's ship array
  public addShips(playerIndex: number, ships: Ship[]): void {
    this.ships[playerIndex] = ships;
  }
}