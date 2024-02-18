import PlayerData from './player';
import { Player } from '../types/types';
import RandomNumber from '../utils/newId';
import DataSocket from './datasocket';

export default class DataBase {
  private allUsers: PlayerData[];

  constructor() {
    this.allUsers = [];
  }

  public setUser(player: Player, socket: DataSocket): PlayerData {
    const index = this.createId();
    const playerData = new PlayerData(player, index, socket);
    this.allUsers.push(playerData);
    return playerData;
  }

  private createId(): number {
    const usedIndexes = this.allUsers.map((playerData) => playerData.getIdPlayer());
    const random = new RandomNumber(usedIndexes);
    return random.create();
  }
}
