import { Attack, ShipPlacementData, AttackRequest, AttackResponse, GameData, GridPoint } from '../types/types';
import Room from '../db/room';
import Player from '../db/player';
import BattleField from './gameBattle';
import NamedSocket from '../db/baseSocket';

export default class GameArena {
  private firstGame: GameData;
  private secondGame: GameData;
  private room: Room | null;
  private firstUser: Player;
  private secondUser: Player;
  private firstBattleField: BattleField | null;
  private secondBattleField: BattleField | null;
  private currentPlayerId: number | null;

  constructor(ownerUser: Player, secondUser: Player, room: Room) {
    this.firstUser = ownerUser;
    this.secondUser = secondUser;
    this.room = room;
    this.firstBattleField = null;
    this.secondBattleField = null;
    this.currentPlayerId = null;

    this.setupGameData();
  }

  public getFirstGameData(): GameData {
    return this.firstGame;
  }

  public getSecondGameData(): GameData {
    return this.secondGame;
  }

  public getId(): number {
    return this.firstGame.gameId;
  }

  public getGameId(): number {
    return this.firstGame.gameId;
  }

  public addBattleField(placementData: ShipPlacementData): NamedSocket {

    if (placementData.gameId !== this.firstGame.gameId) return;

    const battleField = new BattleField(placementData);

    if (placementData.indexPlayer === this.firstGame.playerId) {
      this.secondBattleField = battleField;
      return this.secondUser.getNamedSocket();
    } else {
      this.firstBattleField = battleField;;
      return this.firstUser.getNamedSocket();
    }
  }

  public checkBattleFields(): boolean {
    return !!this.firstBattleField && !!this.secondBattleField;
  }

  public getOwnerSocket(): NamedSocket {
    return this.firstUser.getNamedSocket();
  }

  public getSecondPlayerSocket(): NamedSocket {
    return this.secondUser.getNamedSocket();
  }

  public setPlayerTurn(playerId: number): void {
    if (!this.currentPlayerId) {
      this.currentPlayerId = playerId;
      return;
    }
    if (playerId === this.firstGame.playerId || playerId === this.secondGame.playerId) {
      this.currentPlayerId = playerId;
    }
  }

  public switchPlayerTurn(playerId: number): number {

    if (playerId === this.currentPlayerId) {
      this.currentPlayerId = this.firstGame.playerId === this.currentPlayerId ? this.secondGame.playerId : this.firstGame.playerId;
      return this.currentPlayerId;
    }

    return playerId;
  }

  public checkShoot(target: AttackRequest): AttackResponse {
    const field = this.secondBattleField.getPlayerId() === target.indexPlayer ? this.firstBattleField : this.secondBattleField;

    const position: GridPoint = {
      x: target.x,
      y: target.y
    };

    const shootStatus: Attack = field.shoot(position);

    return {
      currentPlayer: target.indexPlayer,
      position: shootStatus.position,
      result: shootStatus.status
    }
  }

  public checkForWins(target: AttackRequest): boolean {
    const field = this.secondBattleField.getPlayerId() === target.indexPlayer ? this.firstBattleField : this.secondBattleField;
    return field.checkForWin();
  }

  public getSocketByPlayerId(playerId: number): NamedSocket {
    return this.firstGame.playerId === playerId ? this.firstUser.getNamedSocket() : this.secondUser.getNamedSocket();
  }

  public getPlayedUsers(): Array<Player> {
    return [this.firstUser, this.secondUser];
  }

  public determineWinner(): number {
    const firstWin = this.firstBattleField.checkForWin();

    return firstWin ? this.secondBattleField.getPlayerId() : this.firstBattleField.getPlayerId();
  }

  public botAttack(): GridPoint {
    return this.secondBattleField.botAttack()
  }

  private setupGameData(): void {
    this.firstGame = {
      gameId: this.room.getId(),
      playerId: this.firstUser.getIndex(),
    };

    this.secondGame = {
      gameId: this.room.getId(),
      playerId: this.secondUser.getIndex()
    };
  }
}
