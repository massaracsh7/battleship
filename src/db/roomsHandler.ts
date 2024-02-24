import { WebSocket } from 'ws';
import RandomNumber from '../utils/randomNumber';
import Arena from '../game/gameArena';
import Room from './room';
import Player from './player';
import { ShipPlacementData, AttackRequest, AttackResponse, GameEndData, TurnData, RoomUpdate, RoomPlayerData } from '../types/types';
import BaseSocket from './baseSocket';
import { PlayerLogin, GridPoint } from '../types/types';
import Game from '../game/game';

export default class RoomsHandler {
  private rooms: Array<Room>;
  private arenas: Array<Arena>;

  constructor() {
    this.rooms = [];
    this.arenas = [];
  }

  public addRoom(player: Player): void {
    const playerInRoom: boolean = this.rooms.some((room: Room) => {
      const roomPlayers = room.getAllPlayers();
      return roomPlayers.some((roomPlayer: RoomPlayerData) => roomPlayer.name === player.getName());
    });

    if (!playerInRoom) {
      const randomRoomId = new RandomNumber(this.rooms.map((room: Room) => room.getId())).id;
      const newRoom = new Room(randomRoomId);
      player.setRoom(newRoom);

      const playerAdded: boolean = newRoom.addPlayer(player);

      if (playerAdded) this.rooms.push(newRoom);
    }
  }

  public getRoomUpdates(): Array<RoomUpdate> {
    if (this.rooms.length === 0) return [];

    return this.rooms.map((room: Room) => ({
      roomId: room.getId(),
      players: room.getAllPlayers()
    }));
    
  }

  public findRoomById(id: number): Room {
    return this.rooms.find((room: Room) => room.getId() === id);
  }

  public removeRoomById(id: number): void {
    this.rooms = this.rooms.filter((room: Room) => room.getId() !== id);
  }

  public createArena(firstPlayer: Player, secondPlayer: Player): Arena {
    const roomOwner = firstPlayer.getRoom();
    const roomSecond = secondPlayer.getRoom();

    const arena = new Arena(firstPlayer, secondPlayer, roomOwner);
    this.arenas.push(arena);

    this.rooms = this.rooms.filter((room: Room) => room.getId() !== roomOwner.getId() && room.getId() !== roomSecond.getId());

    return arena;
  }

  public addShipsToArena(shipsData: ShipPlacementData): BaseSocket {
    const arena = this.findArena(shipsData.gameId);
    const baseSocket = arena.addBattleField(shipsData);

    const secondPlayerData = arena.getSecondGameData();

    return baseSocket;
  }

  public arenaReady(gameId: number): boolean {
    const arena = this.findArena(gameId);
    return arena ? arena.checkBattleFields() : false;
  }

  public fetchSockets(gameId: number): Array<BaseSocket> {
    const arena = this.findArena(gameId);
    return arena ? [arena.getOwnerSocket(), arena.getSecondPlayerSocket()] : [];
  }

  public getPlayerIds(gameId: number): Array<number> {
    const arena = this.findArena(gameId);
    const ownerId: number = arena.getFirstGameData().playerId;
    const secondPlayerId: number = arena.getSecondGameData().playerId;
    return [ownerId, secondPlayerId];
  }

  public getPlayerTurn(gameId: number, playerId: number): TurnData {
    const arena = this.findArena(gameId);
    const currentPlayerId = arena.switchPlayerTurn(playerId);
    return { currentPlayer: currentPlayerId };
  }

  public checkAttack(gameId: number, request: AttackRequest): AttackResponse {
    const arena = this.findArena(gameId);
    return arena.checkShoot(request);
  }

  public checkWin(gameId: number, request: AttackRequest): boolean {
    const arena = this.findArena(gameId);
    return arena.checkForWins(request);
  }

  public setFirstPlayerTurn(playerId: number, gameId: number): void {
    const arena = this.findArena(gameId);
    arena.setPlayerTurn(playerId);
  }

  public getWinnerData(gameId: number, request: AttackRequest): GameEndData {
    const arena = this.findArena(gameId);
    const winnerId = arena.determineWinner();
    return { winningPlayer: winnerId };
  }

  public deleteArena(gameId: number): void {
    this.arenas = this.arenas.filter((arena: Arena) => arena.getGameId() !== gameId);
  }

  private findArena(gameId: number): Arena {
    return this.arenas.find((arena: Arena) => arena.getGameId() === gameId);
  }
}
