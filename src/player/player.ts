
export interface Player {
  name: string;
  password: string;
  wins: number;
  index: number;
}

export interface PlayerData {
  players: Player[];

  loginPlayer(data: { name: string; password: string }): { name: string; index: number };

  createPlayer(data: { name: string; password: string }): { name: string; index: number };

  incrementPlayerWins(winnerIndex: number): Player;

  findAllWinners(): { name: string; wins: number }[];

  getPlayerByIndex(index: number): Player | undefined;

  getPlayerByName(name: string): Player | undefined;

  getPlayerWins(index: number): number;

  setPlayerWins(index: number, wins: number): void;

  getAllPlayers(): Player[];
}

export class PlayerModel {
  private players: Player[];

  constructor(players: Player[] = []) {
    this.players = players;
  }

  public loginPlayer(data: Omit<Player, 'wins' | 'index'>) {
    const searchIndex = this.players.findIndex((player) => player.name === data.name);
    const isPlayerFound = searchIndex >= 0;

    const player = isPlayerFound ? this.players[searchIndex] : this.createPlayer(data);

    if (player.password !== data.password) {
      throw new Error('User password is incorrect');
    }

    return {
      name: player.name,
      index: player.index,
    };
  }

  private createPlayer({ name, password }: Omit<Player, 'wins' | 'index'>) {
    const player: Player = {
      name,
      password,
      wins: 0,
      index: this.players.length,
    };
    this.players.push(player);

    return player;
  }

  public incrementPlayerWins(winnerIndex: number) {
    const player = this.findPlayerByIndex(winnerIndex);
    player.wins += 1;

    return player;
  }

  private findPlayerByIndex(index: number): Player {
    const player = this.players.find((p) => p.index === index);
    if (!player) {
      throw new Error('Player with this index does not exist');
    }
    return player;
  }

  public findAllWinners(): { name: string; wins: number }[] {
    return this.players.map(({ name, wins }) => ({ name, wins }));
  }

  public getPlayerByIndex(index: number): Player | undefined {
    return this.players.find((player) => player.index === index);
  }

  public getPlayerByName(name: string): Player | undefined {
    return this.players.find((player) => player.name === name);
  }

  public getPlayerWins(index: number): number {
    const player = this.getPlayerByIndex(index);
    if (!player) {
      throw new Error('Player with this index does not exist');
    }
    return player.wins;
  }

  public setPlayerWins(index: number, wins: number): void {
    const player = this.getPlayerByIndex(index);
    if (!player) {
      throw new Error('Player with this index does not exist');
    }
    player.wins = wins;
  }

  public getAllPlayers(): Player[] {
    return this.players;
  }
}
