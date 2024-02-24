import { WebSocket } from 'ws';
import { PlayerLogin, PlayerWin } from '../types/types';
import Player from './player';
import BaseSocket from './baseSocket';
import RandomId from '../utils/randomNumber';

export default class DataBase {
  private allPlayers: Player[];

  constructor() {
    this.allPlayers = [];
  }

  public registerUser(playerData: PlayerLogin, socket: BaseSocket): Player {
    const existingPlayer = this.findUser(playerData);

    if (existingPlayer) {
      return existingPlayer;
    }

    const randomIndex = new RandomId(this.allPlayers.map((player) => player.getIndex()));
    const index = randomIndex.id;

    const newPlayer = new Player(playerData, index, socket);
    this.allPlayers.push(newPlayer);

    return newPlayer;
  }

  public hasUser(playerData: PlayerLogin): boolean {
    return this.allPlayers.some((player) => player.isUser(playerData));
  }

  public findUser(playerData: PlayerLogin): Player | undefined {
    return this.allPlayers.find((player) => player.isUser(playerData));
  }

  public findUserBySocket(socket: WebSocket): Player | undefined {
    return this.allPlayers.find((player) => player.getNamedSocket().getSocket() === socket);
  }

  public getAllWinners(): PlayerWin[] {
    return this.allPlayers.map((player) => player.getAllWins());
  }

  public authenticateUser(playerData: PlayerLogin): boolean {
    const userExists = this.allPlayers.some((player) => player.checkName(playerData.name));

    if (!userExists) {
      return false;
    }

    const correctPass = this.allPlayers.some((player) => player.checkPassword(playerData.password));

    return correctPass;
  }

  public findUserByIdRoom(roomId: number): Player | undefined {
    return this.allPlayers.find((player) => player.getIndexRoom() === roomId);
  }

  public declareWinner(playerId: number): void {
    const player = this.allPlayers.find((item) => item.getIndex() === playerId);

    if (player) {
      player.setWins();
    }
  }
}
