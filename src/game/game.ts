import { Player } from "../types/types";
import { Room } from "./room";

export class Game {
  private gameRooms: Room[] = [];

  public createGameRoom(players: Player[]): void {
    const room = new Room(players);
    this.gameRooms.push(room);
  }

  public getCurrentGameRoom(playerIndex: number): Room | undefined {
    return this.gameRooms.find(
      (room) => room.players.findIndex((player) => player.index === playerIndex) !== -1
    );
  }
}