import { Player, Ship } from "../types/types";


export class Room {
  public players: Player[];
  public ships: Ship[][]; // Ships for each player
  public currentPlayerIndex: number;
  public turnCount: number;

  constructor(players: Player[]) {
    this.players = players;
    this.ships = players.map(() => []);
    this.currentPlayerIndex = 0;
    this.turnCount = 0;
  }

  // Add ships to the specified player's ship array
  public addShips(playerIndex: number, ships: Ship[]): void {
    this.ships[playerIndex] = ships;
  }
}
