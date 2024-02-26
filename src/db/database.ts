import { WebSocket } from 'ws';
import { PlayerLogin, PlayerWin } from '../types/types';
import Player from './player';
import BaseSocket from './baseSocket';
import randomNumber from '../utils/randomNumber';

export default class DataBase {
  private allPlayers: Player[]
  constructor() {
    this.allPlayers = [];
  }

  public setPlayer(player: PlayerLogin, socket: BaseSocket): Player {
    const existingPlayer = this.findPlayer(player);
    if (existingPlayer) return existingPlayer;
    const index = this.generateUniqueIndex();
    const newPlayer = new Player(player, index, socket);
    this.allPlayers.push(newPlayer);
    return newPlayer;
  }

  private generateUniqueIndex(): number {
    const existingIndexes = this.allPlayers.map((player) => player.getIndex());
    const result = new randomNumber(existingIndexes);
    return result.id;
  }

  public hasPlayer(player: PlayerLogin): boolean {
    return !!this.allPlayers.find((item: Player) => item.isPlayer(player));
  }

  public findPlayer(player: PlayerLogin): Player {
    return this.allPlayers.find((item: Player) => item.isPlayer(player));
  }

  public findPlayerSocket(socket: WebSocket): Player {
    return this.allPlayers.find((item: Player) => item.getSocket().getSocket() === socket);
  }

  public getAllWinners(): PlayerWin[] {
    return this.allPlayers.map((item: Player) => item.getAllWins());
  }

  public authenticatePlayer(player: PlayerLogin): boolean {
    return this.allPlayers.some((item: Player) => item.checkName(player.name) && item.checkPassword(player.password));
  }

  public findPlayerRoom(id: number): Player {
    return this.allPlayers.find((item: Player) => item.getIndexRoom() === id);
  }

  public setNewWinner(playerId: number): void {
    const result = this.allPlayers.find((item: Player) => item.getIndex() === playerId);
    result.setWins();
  }
}
