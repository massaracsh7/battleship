import DataBase from "../db/database";
import DataSocket from "../db/datasocket";
import { Player, PlayerInfo } from "../types/types";
import { Room } from "./room";

export class Game {
  private gameRooms: Room[] = [];
  private database: DataBase;
  private sockets: Array<DataSocket>;
  constructor() {
    this.database = new DataBase();
    this.sockets = [];
  }
  public createGameRoom(players: PlayerInfo[]): void {
    const room = new Room(players);
    this.gameRooms.push(room);
  }

  public setSocket(socket: WebSocket): void {
    this.addSockets(socket);
  }

  public getCurrentGameRoom(playerIndex: number): Room | undefined {
    return this.gameRooms.find(
      (room) => room.players.findIndex((player) => player.index === playerIndex) !== -1
    );
  }
  private addSockets(socket): void {
    const newSocket = new DataSocket(socket, this);
    this.sockets.push(newSocket);
  }

}