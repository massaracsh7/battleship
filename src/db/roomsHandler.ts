import randomNumber from '../utils/randomNumber';
import Arena from '../game/gameArena';
import Room from './room';
import Player from './player';
import BaseSocket from './baseSocket';
import Game from '../game/game';
import { WebSocket } from 'ws';
import CreateBot from '../game/createBot';
import { UpdateRoom, RoomPlayers, AddShipInfo, AttackReqInfo, AttackResInfo, FinishInfo, Turn, PlayerLogin, Position } from '../types/types';

export default class RoomsBase {
  private rooms: Room[];
  private arenas: Arena[];

  constructor() {
    this.rooms = [];
    this.arenas = [];
  }

  public addRoom(player: Player): void {
    const isInRoom = this.rooms.some((room: Room) => {
      return room.getPlayers().some((roomPlayer: RoomPlayers) => roomPlayer.name === player.getName());
    });

    if (!isInRoom) {
      const index = new randomNumber(this.rooms.map((room: Room) => room.getRoomId())).id;
      const newRoom = new Room(index);
      player.setRoom(newRoom);
      newRoom.addPlayer(player);
      this.rooms.push(newRoom);
    }
  }

  public getUpdate(): UpdateRoom[] {
    return this.rooms.map((room: Room) => {
      return {
        roomId: room.getRoomId(),
        roomUsers: room.getPlayers()
      };
    });
  }

  public findRoom(id: number): Room | undefined {
    return this.rooms.find((room: Room) => room.getRoomId() === id);
  }

  public removeRoom(id: number): void {
    this.rooms = this.rooms.filter((room: Room) => room.getRoomId() !== id);
  }

  private findArena(gameId: number): Arena {
    return this.arenas.find((arena: Arena) => arena.getGameId() === gameId);
  }

  public createArena(firstPl: Player, secondPl: Player): Arena {
    const first = firstPl.getRoom();
    const second = secondPl.getRoom();
    const newArena = new Arena(firstPl, secondPl, first);
    this.arenas.push(newArena);
    this.rooms = this.rooms.filter((room: Room) => room.getRoomId() !== first.getRoomId() && room.getRoomId() !== second.getRoomId());
    return newArena;
  }

  public addShipsArena(shipsData: AddShipInfo): BaseSocket {
    const arena = this.findArena(shipsData.gameId);
    const newSocket = arena.addBattle(shipsData);
    const secondPlayer = arena.getGameSecond();
    if (secondPlayer.idPlayer === -1) {
      const result = new CreateBot(secondPlayer.idGame, secondPlayer.idPlayer).getBattle();
      arena.addBattle(result);
    }
    return newSocket;
  }

  public checkArenaStart(gameId: number): boolean {
    const arena = this.findArena(gameId);
    return !!arena && arena.checkBattle();
  }

  public getSocketArena(gameId: number): BaseSocket[] {
    const arena = this.findArena(gameId);
    if (arena) {
      return [arena.getSocketFirst(), arena.getSocketSecond()];
    }
  }

  public getPlayId(gameId: number): number[] {
    const result = this.findArena(gameId);
    const ownerID: number = result.getGameFirst().idPlayer;
    const secondPlayerId: number = result.getGameSecond().idPlayer;
    return [ownerID, secondPlayerId];
  }

  public getTurn(gameId: number, playerId: number): Turn {
    const result = this.findArena(gameId);
    const id = result.switchTurn(playerId);
    return {
      currentPlayer: id
    }
  }

  public checkArena(info: AttackReqInfo): AttackResInfo {
    return this.findArena(info.gameId).checkShoot(info);
  }

  public checkWins(info: AttackReqInfo): boolean {
    return this.findArena(info.gameId).checkForWins(info);
  }

  public setFirstPlayerId(playerId: number, gameId: number): void {
    const result = this.findArena(gameId);
    if (result) {
      result.setTurn(playerId);
    }
  }

  public getWinners(info: AttackReqInfo): FinishInfo {
    const result = this.findArena(info.gameId);
    if (result) {
      const idWinner = result.chooseWinner();
      return { winPlayer: idWinner };
    }
  }

  public removeArena(gameId: number): void {
    this.arenas = this.arenas.filter((item: Arena) => item.getGameId() === gameId);
  }

  public createArenaSingle(player: Player, game: Game): Arena {
    const random = new randomNumber(this.rooms.map((item: Room) => item.getRoomId()));
    const index = random.id;
    const alone = new Room(index);
    alone.addPlayer(player);
    const botSocket = new WebSocket('ws://localhost:3000');
    botSocket.send = function (param: string): null {
      console.log(`Trying to send: ${param} to the bot`);
      return null;
    };
    const botBaseSocket = new BaseSocket(botSocket, game);
    const botLogin: PlayerLogin = { name: 'bot', password: '' };
    const botPlayer = new Player(botLogin, -1, botBaseSocket);
    botPlayer.setRoom(alone);
    const newArena = new Arena(player, botPlayer, alone);
    this.arenas.push(newArena);
    const roomFirst = this.findRoom(player.getIndexRoom());
    if (roomFirst) {
      this.removeRoom(roomFirst.getRoomId());
    }
    return newArena;
  }

  public attackSingle(gameId: number): AttackReqInfo {
    const newArena = this.findArena(gameId);
    const result: Position = newArena.botAttack();
    return {
      gameId: gameId,
      indexPlayer: newArena.getGameSecond().idPlayer,
      ...result
    };
  }

}