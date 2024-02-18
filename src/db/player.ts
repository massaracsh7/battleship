import { Player } from '../types/types';

export default class PlayerData {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public getPlayerName(): string {
    return this.player.name;
  }
}
