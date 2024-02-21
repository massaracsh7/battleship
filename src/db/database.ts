import PlayerData from './player';
import { Player } from '../types/types';
import GameSocket from '../game/gameSocket';
import RandomNumber from '../utils/newId';
import { WebSocket } from 'ws';

export default class DataBase {
  private allUsers: PlayerData[] = [];

  public setUser(playerInfo: Player, socket: GameSocket): PlayerData {
    let playerData = this.findPlayer(playerInfo.name);
    if (!playerData) {
      const index = this.createId();
      playerData = new PlayerData(playerInfo, index, socket);
      this.allUsers.push(playerData);
    }
    return playerData;
  }

  private createId(): number {
    const usedIndexes = this.allUsers.map((playerData) => playerData.getIndexPlayer());
    const random = new RandomNumber(usedIndexes);
    return random.create();
  }

  private findPlayer(name: string): PlayerData | undefined {
    return this.allUsers.find((player) => player.getNamePlayer() === name);
  }
}