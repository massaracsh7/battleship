import Room from '../db/room';
import Player from '../db/player';
import Battle from './gameBattle';
import BaseSocket from '../db/baseSocket';
import { AddShipInfo, AttackReqInfo, AttackResInfo, GameData, Position } from '../types/types';

export default class GameArena {
  private gameFirst: GameData;
  private gameSecond: GameData;
  private room: Room | null;
  private firstPlayer: Player;
  private secondPlayer: Player;
  private firstBattle: Battle | null;
  private secondBattle: Battle | null;
  private curPlayerId: number | null;

  constructor(firstPl: Player, secondPl: Player, room: Room) {
    this.firstPlayer = firstPl;
    this.secondPlayer = secondPl;
    this.room = room;
    this.firstBattle = null;
    this.secondBattle = null;
    this.curPlayerId = null;

    this.createGame();
  }

  public getGameFirst(): GameData {
    return this.gameFirst;
  }

  public getGameSecond(): GameData {
    return this.gameSecond;
  }

  public getArenaId(): number {
    return this.gameFirst.idGame;
  }

  public getGameId(): number {
    return this.gameFirst.idGame;
  }

  public addBattle(info: AddShipInfo): BaseSocket {
    if (info.gameId !== this.gameFirst.idGame) return;
    const result = new Battle(info);
    if (info.indexPlayer === this.gameFirst.idPlayer) {
      this.secondBattle = result;
      return this.secondPlayer.getSocket();
    } else {
      this.firstBattle = result;;
      return this.firstPlayer.getSocket();
    }
  }

  public checkBattle(): boolean {
    return !!this.firstBattle && !!this.secondBattle;
  }

  public getSocketFirst(): BaseSocket {
    return this.firstPlayer.getSocket();
  }

  public getSocketSecond(): BaseSocket {
    return this.secondPlayer.getSocket();
  }

  public setTurn(playerId: number): void {
    if (!this.curPlayerId) {
      this.curPlayerId = playerId;
    } else if (playerId === this.gameFirst.idPlayer || playerId === this.gameSecond.idPlayer) {
      this.curPlayerId = playerId;
    }
  }

  public switchTurn(playerId: number): number {
    if (playerId === this.curPlayerId) {
      this.curPlayerId = this.gameFirst.idPlayer === this.curPlayerId ? this.gameSecond.idPlayer : this.gameFirst.idPlayer;
      return this.curPlayerId;
    }
    return playerId;
  }

  public checkShoot(info: AttackReqInfo): AttackResInfo {
    const result = this.secondBattle.getPlayerId() === info.indexPlayer ? this.firstBattle : this.secondBattle;
    const points: Position = {
      x: info.x,
      y: info.y
    };
    return {
      currentPlayer: info.indexPlayer,
      ...result.shoot(points)
    }
  }

  public checkForWins(info: AttackReqInfo): boolean {
    const result = this.secondBattle.getPlayerId() === info.indexPlayer ? this.firstBattle : this.secondBattle;
    return result.checkForWin();
  }

  public getSocketPlayer(playerId: number): BaseSocket {
    return this.gameFirst.idPlayer === playerId ? this.firstPlayer.getSocket() : this.secondPlayer.getSocket();
  }

  public chooseWinner(): number {
    const firstWin = this.firstBattle.checkForWin();
    const secondWin = this.secondBattle.checkForWin();
    if (firstWin) {
      return this.secondBattle.getPlayerId();
    } else if (secondWin) {
      return this.firstBattle.getPlayerId();
    }
  }

  public botAttack(): Position {
    return this.secondBattle.botAttack()
  }

  private createGame(): void {
    const roomId = this.room.getRoomId();

    this.gameFirst = {
      idGame: roomId,
      idPlayer: this.firstPlayer.getIndex(),
    };

    this.gameSecond = {
      idGame: roomId,
      idPlayer: this.secondPlayer.getIndex()
    };
  }
}