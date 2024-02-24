import { Attack, ShipPlacementData, GridPoint } from '../types/types';
import Ship from './ship';

export default class Battle {
  private shipField: Ship;
  private gameId: number;
  private playerId: number;

  constructor(data: ShipPlacementData) {
    this.gameId = data.gameId;
    this.playerId = data.indexPlayer;
    this.shipField = new Ship(data.ships);
  }

  public getGameId(): number {
    return this.gameId;
  }

  public getPlayerId(): number {
    return this.playerId;
  }

  public shoot(target: GridPoint): Attack {
    const result = this.shipField.checkShoot(target);
    return result;
  }

  public checkForWin(): boolean {
    return this.shipField.checkAllShipsDead();
  }

}
