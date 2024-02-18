import PlayerData from './player';
import { Player } from '../types/types';

export default class DataBase {
  private allUsers: PlayerData[];

  constructor() {
    this.allUsers = [];
  }

  public setUser(player: Player): PlayerData {
    const playerData = new PlayerData(player);
    this.allUsers.push(playerData);
    return playerData;
  }
}
