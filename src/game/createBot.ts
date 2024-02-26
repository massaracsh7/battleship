import { AddShipInfo, Position, ShipsTypes, CreatedShip } from '../types/types';

export default class CreateBot {
  private battle: AddShipInfo;
  private ships: CreatedShip[] = [];

  constructor(idGame: number, indexPlayer: number) {
    this.battle = this.create(idGame, indexPlayer);
  }

  public getBattle(): AddShipInfo {
    return this.battle;
  }

  private create(idGame: number, indexPlayer: number): AddShipInfo {
    for (let i = 0; i < 10; i++) {
      const direct: boolean = this.botDir();
      const [type, typeString]: [number, string] = this.getType(i);
      let answer: boolean = false;
      let result: CreatedShip;
      while (!answer) {
        result = this.createData(direct, type, typeString);
        answer = this.checkPos(result);
      }
      this.ships.push(result);
    }
    return this.createInfoAdd(indexPlayer, idGame);
  }

  private createData(dir: boolean, type: number, size: string): CreatedShip {
    const start: Position = this.botStart(type, dir);
    const shipPoints: Position[] = this.shipCreated(start, dir, type);
    const data: CreatedShip = {
      ship: {
        position: start,
        direction: dir,
        length: type,
        type: size as "small" | "medium" | "large" | "huge"
      },
      shipPoints: shipPoints,
      banPoints: []
    };

    const result: CreatedShip = this.createBan(data);
    return result;
  }

  private botDir(): boolean {
    return Math.random() < 0.5;
  }

  private botStart(type: number, dir: boolean): Position {
    const x: number = dir ? 0 : 10 - type;
    const y: number = dir ? 10 - type : 0;
    return this.getRandomPoint(x, y);
  }

  private getType(i: number): [number, string] {
    if (i === 0) return [ShipsTypes.huge, 'huge'];
    if (i < 3) return [ShipsTypes.large, 'large'];
    if (i < 6) return [ShipsTypes.medium, 'medium'];
    return [ShipsTypes.small, 'small'];
  }

  private getRandomPoint(xM: number, yM: number): Position {
    return {
      x: Math.floor(Math.random() * xM),
      y: Math.floor(Math.random() * yM)
    };
  }

  private shipCreated(start: Position, dir: boolean, type: number): Position[] {
    const shipPoints: Position[] = [start];
    for (let i = 1; i < type; i++) {
      const x: number = dir ? start.x : start.x + i;
      const y: number = dir ? start.y + i : start.y;
      shipPoints.push({ x: x, y: y });
    }
    return shipPoints;
  }

  private createBan(info: CreatedShip): CreatedShip {
    for (let i = 0; i < info.shipPoints.length; i++) {
      const point: Position = info.shipPoints[i];
      const nearPos: Position[] = [];
      nearPos.push(point);
      for (let px = -1; px <= 1; px++) {
        for (let py = -1; py <= 1; py++) {
          if (px !== 0 || py !== 0) {
            nearPos.push(this.points(point.x + px, point.y + py));
          }
        }
      }
      info.banPoints = [...info.banPoints, ...nearPos];
    }

    info.banPoints = info.banPoints.filter((item: Position) => {
      return !info.shipPoints.some((point: Position) => item.x === point.x && item.y === point.y);
    });
    return info;
  }

  private checkPos(info: CreatedShip): boolean {
    if (!this.ships.length) return true;
    for (let i = 0; i < this.ships.length; i++) {
      const result = this.ships[i];
      const ban = result.banPoints;
      for (let j = 0; j < info.shipPoints.length; j++) {
        const resultPoints = info.shipPoints[j];
        const result: boolean = ban.some((item) => {
          return resultPoints.x === item.x && resultPoints.y === item.y;
        });

        if (result) return false;
      }
    }
    return true;
  }

  private points(x: number, y: number): Position {
    return { x: x, y: y };
  }

  private createInfoAdd(indexPlayer: number, idGame: number): AddShipInfo {
    return {
      gameId: idGame,
      ships: this.ships.map((shipData: CreatedShip) => shipData.ship),
      indexPlayer: indexPlayer
    };
  }
}
