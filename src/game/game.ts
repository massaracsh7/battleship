export namespace GameConstants {
  export const MAX_PLAYERS = 2;
  export const FIELD_SIDE_LENGTH = 10;
  export const SHIP_CROSS_AXIS_LENGTH_WITH_SPACE = 3;
  export const MISS_SPACE_OFFSET = 1;

  export interface ShipDto {
    position: Position;
    direction: boolean;
    length: number;
    type: 'small' | 'medium' | 'large' | 'huge';
  }

  export interface Game {
    gameId: number;
    players: GamePlayer[];
    currentPlayer: number;
  }

  export interface GamePlayer {
    ships: ShipDto[];
    indexPlayer: number;
    gameMap: GameMap;
  }

  export interface GameDto {
    gameId: number;
    ships: ShipDto[];
    indexPlayer: number;
  }

  export interface AttackRequestDto {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number /* id of the player in the current game */;
  }

  export interface RandomAttackRequestDto {
    gameId: number;
    indexPlayer: number /* id of the player in the current game */;
  }

  export interface AttackResponseDto {
    position: Position;
    currentPlayer: number /* id of the player in the current game */;
    status: CellStatus;
  }

  export type CellStatus = 'miss' | 'killed' | 'shot';
  export type GameMap = (CellStatus | null)[][];

  export interface Position {
    x: number;
    y: number;
  }

  export class GameData {
    constructor(private activeGames: Game[] = []) { }

    public addShips(gameDto: GameDto) {
      let game = this.activeGames.find((game) => game.gameId === gameDto.gameId);

      if (!game) {
        game = this.createActiveGame(gameDto);
        this.activeGames.push(game);
      }

      game.players.push({
        indexPlayer: gameDto.indexPlayer,
        ships: gameDto.ships,
        gameMap: this.createGameMap(),
      });

      return {
        isGameReady: this.checkIsGameReady(game),
        gameId: game.gameId,
      };
    }

    private createGameMap(): GameMap {
      return new Array(FIELD_SIDE_LENGTH)
        .fill(null)
        .map(() => new Array(FIELD_SIDE_LENGTH).fill(null));
    }

    private createActiveGame({ gameId, indexPlayer }: GameDto) {
      return {
        gameId,
        players: [],
        currentPlayer: indexPlayer,
      };
    }

    public startGame(gameId: number) {
      const game = this.activeGames.find((game) => game.gameId === gameId);
      if (!game) throw new Error(`Game doesn't exist`);
      if (!this.checkIsGameReady(game)) throw new Error('Game is not ready');

      return {
        players: game.players,
        currentPlayer: game.currentPlayer,
      };
    }

    private checkIsGameReady(game: Game) {
      return game.players.length === MAX_PLAYERS;
    }

    public handleAttack({ gameId, indexPlayer, x, y }: AttackRequestDto): {
      attackResponse: AttackResponseDto;
      missedCellsResponses?: AttackResponseDto[];
      gameId: number;
    } {
      const game = this.activeGames.find((game) => game.gameId === gameId);
      if (!game) throw new Error(`Game doesn't exist`);
      if (game.currentPlayer !== indexPlayer)
        throw new Error(`Player with this id can't make actions yet`);

      const player = game.players.find((player) => player.indexPlayer === indexPlayer);
      if (!player) throw Error('No such player');

      const opponent = game.players.find((player) => player.indexPlayer !== indexPlayer);
      if (!opponent) throw Error('No such player');

      const { status, missedCells } = this.handleShot(player, opponent, { x, y });

      if (status === 'killed' && missedCells) {
        return {
          attackResponse: this.createAttackResponseDto({ x, y }, indexPlayer, status),
          missedCellsResponses: missedCells.map((position) =>
            this.createAttackResponseDto(position, indexPlayer, 'miss'),
          ),
          gameId,
        };
      }

      return {
        attackResponse: this.createAttackResponseDto({ x, y }, indexPlayer, status),
        gameId,
      };
    }

    private handleShot(
      player: GamePlayer,
      opponent: GamePlayer,
      hitPosition: Position,
    ): {
      status: CellStatus;
      missedCells?: Position[];
    } {
      const hitCell = player.gameMap[hitPosition.y]?.[hitPosition.x];
      if (hitCell === undefined) throw Error('Hit position is out of bounds');
      if (hitCell === 'miss' || hitCell === 'shot' || hitCell === 'killed') {
        throw new Error('Cell has already been targeted');
      }

      const damagedShip = opponent.ships.find((ship) =>
        this.checkShipForHit(ship, hitPosition),
      );
      if (!damagedShip) return { status: 'miss' };

      player.gameMap[hitPosition.y][hitPosition.x] = 'shot';
      const isShipKilled = this.checkShipForKill(damagedShip, player.gameMap);
      if (!isShipKilled) return { status: 'shot' };

      this.killShip(damagedShip, player.gameMap);
      this.markMissedCells(damagedShip, player.gameMap);
      return {
        status: 'killed',
        missedCells: this.getMissedCells(damagedShip, player.gameMap),
      };
    }

    private checkShipForHit(ship: ShipDto, hitPosition: Position) {
      const isVerticalDirection = ship.direction;

      if (isVerticalDirection) {
        for (let cell = ship.position.y; cell < ship.position.y + ship.length; cell += 1) {
          if (cell === hitPosition.y && ship.position.x === hitPosition.x) return true;
        }
      } else {
        for (let cell = ship.position.x; cell < ship.position.x + ship.length; cell += 1) {
          if (cell === hitPosition.x && ship.position.y === hitPosition.y) return true;
        }
      }

      return false;
    }

    private checkShipForKill(ship: ShipDto, gameMap: GameMap) {
      const shipCellsStatuses: string[] = [];
      const isVerticalDirection = ship.direction;

      if (isVerticalDirection) {
        for (
          let rowIndex = ship.position.y;
          rowIndex < ship.position.y + ship.length;
          rowIndex += 1
        ) {
          const cell = gameMap[rowIndex][ship.position.x];
          if (cell) shipCellsStatuses.push(cell);
        }
      } else {
        for (
          let cellIndex = ship.position.x;
          cellIndex < ship.position.x + ship.length;
          cellIndex += 1
        ) {
          const cell = gameMap[ship.position.y][cellIndex];
          if (cell) shipCellsStatuses.push(cell);
        }
      }

      return shipCellsStatuses.every((status) => status === 'shot');
    }

    private killShip(ship: ShipDto, gameMap: GameMap) {
      const isVerticalDirection = ship.direction;

      if (isVerticalDirection) {
        for (
          let rowIndex = ship.position.y;
          rowIndex < ship.position.y + ship.length;
          rowIndex += 1
        ) {
          gameMap[rowIndex][ship.position.x] = 'killed';
        }
      } else {
        for (
          let cellIndex = ship.position.x;
          cellIndex < ship.position.x + ship.length;
          cellIndex += 1
        ) {
          gameMap[ship.position.y][cellIndex] = 'killed';
        }
      }
    }

    private markMissedCells(ship: ShipDto, gameMap: GameMap) {
      this.iterateAroundShip(ship, (position) => this.markMissedCell(position, gameMap));
    }

    private markMissedCell(position: Position, gameMap: GameMap) {
      const row = gameMap[position.y];
      if (!row) return;

      const cell = row[position.x];
      if (cell !== null) return;

      gameMap[position.y][position.x] = 'miss';
    }

    private getMissedCells(ship: ShipDto, gameMap: GameMap) {
      const missedCells: Position[] = [];

      this.iterateAroundShip(ship, (position) => {
        const row = gameMap[position.y];
        if (!row) return;

        const isMissedCell = row[position.x] === 'miss';
        if (isMissedCell) missedCells.push(position);
      });

      return missedCells;
    }

    private createAttackResponseDto(
      position: Position,
      currentPlayer: number,
      status: CellStatus,
    ) {
      return {
        position,
        currentPlayer,
        status,
      };
    }

    private iterateAroundShip(ship: ShipDto, callback: (position: Position) => void) {
      const isVerticalDirection = ship.direction;

      if (isVerticalDirection) {
        for (
          let row = ship.position.y - MISS_SPACE_OFFSET;
          row <= ship.position.y + ship.length;
          row += 1
        ) {
          for (
            let cell = ship.position.x - MISS_SPACE_OFFSET;
            cell < ship.position.x - MISS_SPACE_OFFSET + SHIP_CROSS_AXIS_LENGTH_WITH_SPACE;
            cell += 1
          ) {
            callback({ x: cell, y: row });
          }
        }
      } else {
        for (
          let row = ship.position.y - MISS_SPACE_OFFSET;
          row < ship.position.y - 1 + SHIP_CROSS_AXIS_LENGTH_WITH_SPACE;
          row += 1
        ) {
          for (
            let cell = ship.position.x - MISS_SPACE_OFFSET;
            cell <= ship.position.x + ship.length;
            cell += 1
          ) {
            callback({ x: cell, y: row });
          }
        }
      }
    }

    public switchTurn(gameId: number) {
      const game = this.activeGames.find((game) => game.gameId === gameId);
      if (!game) throw new Error('No active game with this id');

      const otherPlayer = game.players.find(
        (player) => player.indexPlayer !== game.currentPlayer,
      );
      if (!otherPlayer) throw new Error('Game is not full');

      game.currentPlayer = otherPlayer.indexPlayer;
      return game.currentPlayer;
    }

    public getPlayers(gameId: number) {
      const game = this.activeGames.find((game) => game.gameId === gameId);
      if (!game) throw new Error('No active game with this id');

      return game.players;
    }

    public createRandomAttackDto({
      gameId,
      indexPlayer,
    }: RandomAttackRequestDto): AttackRequestDto {
      const game = this.activeGames.find((game) => game.gameId === gameId);
      if (!game) throw new Error('No active game with this id');

      const player = game.players.find((player) => player.indexPlayer === indexPlayer);
      if (!player) throw Error('No such player');

      let position: Position;

      do {
        position = {
          x: Math.floor(Math.random() * FIELD_SIDE_LENGTH),
          y: Math.floor(Math.random() * FIELD_SIDE_LENGTH),
        };
      } while (!this.checkIfEmptyCell(position, player.gameMap));

      return {
        x: position.x,
        y: position.y,
        gameId,
        indexPlayer,
      };
    }

    private checkIfEmptyCell(position: Position, gameMap: GameMap) {
      return gameMap[position.y][position.x] === null;
    }

    public getWinner(gameId: number) {
      const game = this.activeGames.find((game) => game.gameId === gameId);
      if (!game) throw new Error('No active game with this id');

      const [player1, player2] = game.players;

      const isPlayer1Won = player2.ships.every((ship) =>
        this.checkShipCells(ship, player1.gameMap, (status) => status === 'killed'),
      );

      const isPlayer2Won = player1.ships.every((ship) =>
        this.checkShipCells(ship, player2.gameMap, (status) => status === 'killed'),
      );

      let winner: GamePlayer | undefined = undefined;

      if (isPlayer1Won) winner = player1;
      if (isPlayer2Won) winner = player2;

      this.activeGames.filter((game) => game.gameId === gameId);
      return winner;
    }

    private checkShipCells(
      ship: ShipDto,
      gameMap: GameMap,
      predicate: (status: string | null) => boolean,
    ) {
      const shipCellsStatuses: string[] = [];
      const isVerticalDirection = ship.direction;
      if (isVerticalDirection) {
        for (
          let rowIndex = ship.position.y;
          rowIndex < ship.position.y + ship.length;
          rowIndex += 1
        ) {
          const cell = gameMap[rowIndex][ship.position.x];
          if (cell) shipCellsStatuses.push(cell);
        }
      } else {
        for (
          let cellIndex = ship.position.x;
          cellIndex < ship.position.x + ship.length;
          cellIndex += 1
        ) {
          const cell = gameMap[ship.position.y][cellIndex];
          if (cell) shipCellsStatuses.push(cell);
        }
      }

      return shipCellsStatuses.every(predicate);
    }
  }
}

export class GameApi {
  constructor(private model = new GameConstants.GameData()) { }

  public addShips(gameDto: unknown) {
    if (!this.isValidGameDto(gameDto)) {
      throw Error('Invalid game data');
    }

    return this.model.addShips(gameDto);
  }

  public startGame(gameId: number) {
    return this.model.startGame(gameId);
  }

  public handleAttack(attackDto: unknown) {
    if (!this.isValidAttackRequestDto(attackDto)) {
      throw Error('Invalid attack data');
    }

    return this.model.handleAttack(attackDto);
  }

  public getRandomAttack(dto: unknown): GameConstants.AttackRequestDto {
    if (!this.isValidRandomAttackRequestDto(dto)) {
      throw Error('Invalid attack data');
    }

    return this.model.createRandomAttackDto(dto);
  }

  public switchTurn(gameId: number) {
    return this.model.switchTurn(gameId);
  }

  public getPlayers(gameId: number) {
    return this.model.getPlayers(gameId);
  }

  public getWinner(gameId: number) {
    return this.model.getWinner(gameId);
  }

  private isValidGameDto(dto: unknown): dto is GameConstants.GameDto {
    if (typeof dto !== 'object' || dto == null) return false;
    if (!('indexPlayer' in dto) || typeof dto.indexPlayer !== 'number') return false;
    if (!('gameId' in dto) || typeof dto.gameId !== 'number') return false;
    if (
      !('ships' in dto) ||
      !(dto.ships instanceof Array) ||
      !dto.ships.every(this.isValidShipDto)
    )
      return false;

    return true;
  }

  private isValidShipDto(dto: unknown): dto is GameConstants.ShipDto {
    if (typeof dto !== 'object' || dto == null) return false;

    if (!('position' in dto) || typeof dto.position !== 'object' || dto.position == null)
      return false;
    if (!('x' in dto.position) || typeof dto.position.x !== 'number') return false;
    if (!('y' in dto.position) || typeof dto.position.y !== 'number') return false;

    if (!('direction' in dto) || typeof dto.direction !== 'boolean') return false;
    if (!('length' in dto) || typeof dto.length !== 'number') return false;

    if (
      !('type' in dto) ||
      (dto.type !== 'small' &&
        dto.type !== 'medium' &&
        dto.type !== 'large' &&
        dto.type !== 'huge')
    )
      return false;

    return true;
  }

  private isValidAttackRequestDto(dto: unknown): dto is GameConstants.AttackRequestDto {
    if (typeof dto !== 'object' || dto == null) return false;

    if (!('gameId' in dto) || typeof dto.gameId !== 'number') return false;
    if (!('x' in dto) || typeof dto.x !== 'number') return false;
    if (!('y' in dto) || typeof dto.y !== 'number') return false;
    if (!('indexPlayer' in dto) || typeof dto.indexPlayer !== 'number') return false;

    return true;
  }

  private isValidRandomAttackRequestDto(dto: unknown): dto is GameConstants.RandomAttackRequestDto {
    if (typeof dto !== 'object' || dto == null) return false;

    if (!('gameId' in dto) || typeof dto.gameId !== 'number') return false;
    if (!('indexPlayer' in dto) || typeof dto.indexPlayer !== 'number') return false;

    return true;
  }
}
