import Ship from './ship';
import { Attack, AddShipInfo, Position } from '../types/types';

export default class Battle {
  private ship: Ship;
  private gameId: number;
  private playerId: number;

  constructor(data: AddShipInfo) {
    this.gameId = data.gameId;
    this.playerId = data.indexPlayer;
    this.ship = new Ship(data.ships);
  }

  public getGameId(): number {
    return this.gameId;
  }

  public getPlayerId(): number {
    return this.playerId;
  }

  public shoot(item: Position): Attack {
    const result = this.ship.checkShoot(item);
    return result;
  }

  public checkForWin(): boolean {
    return this.ship.checkAllSink();
  }

  public botAttack(): Position {
    return this.ship.createRandomAttack();
  }
}