import { Attack, Position, ShipInfo, Cell, Grid } from '../types/types';

export default class Ship {
  private grid: Grid[];
  private doneShoots: Attack[];
  constructor(ships: ShipInfo[]) {
    this.grid = this.createGrid(ships);
    this.doneShoots = [] as Attack[];
  }

  public checkShoot(info: Position): Attack {
    const isShotDone = this.doneShoots.some((shoot: Attack) => shoot.position.x === info.x && shoot.position.y === info.y);
    if (isShotDone) {
      return this.doneShoots.find((shoot: Attack) => shoot.position.x === info.x && shoot.position.y === info.y)!;
    }
    let resultShoot: Attack;
    const result = this.grid.find((ship: Grid) => {
      const coor = ship.position.find((pos: Position) => pos.x === info.x && pos.y === info.y);
      if (!ship.sink && coor) {
        return ship;
      }
    });
    this.grid.forEach((i: Grid) => console.log(i.position));
    if (result) {
      const cell: Cell | undefined = result.position.find((pos: Position) => pos.x === info.x && pos.y === info.y);

      if (cell && !cell.disrupt) {
        cell.disrupt = true;
      }
      result.sink = result.position.every((cell: Cell) => cell.disrupt);
      const status = this.checkStatus(result);
      resultShoot = {
        position: info,
        status: status
      };
      this.doneShoots.push(resultShoot);
      return resultShoot;
    }

    resultShoot = {
      position: info,
      status: 'miss'
    };
    this.doneShoots.push(resultShoot);
    return resultShoot;
  }


  public checkAllSink(): boolean {
    return this.grid.every((ship: Grid) => ship.sink);
  }

  private randomPoints(): Position {
    const x = Math.floor(Math.random() * 9);
    const y = Math.floor(Math.random() * 9);
    return { x, y };
  }

  public createRandomAttack(): Position {
    return this.randomPoints();
  }

  private createGrid(ships: ShipInfo[]): Grid[] {
    return ships.map((ship: ShipInfo) => {
      let points: Cell[] = [];

      switch (ship.direction) {
        case false:
          for (let i = 0; i < ship.length; i += 1) {
            const cells: Cell = {
              x: ship.position.x + i,
              y: ship.position.y,
              disrupt: false
            }
            points.push(cells);
          }
          break;

        case true:
          for (let i = 0; i < ship.length; i += 1) {
            const cells: Cell = {
              x: ship.position.x,
              y: ship.position.y + i,
              disrupt: false
            }
            points.push(cells);
          }
          break;
      }
      const pointGrid: Grid = {
        position: points,
        type: ship.type,
        sink: false
      };
      return pointGrid;
    });
  }

  private checkStatus(ship: Grid): "killed" | "shot" {
    if (ship.position.every((item: Cell) => item.disrupt)) return 'killed';
    return 'shot';
  }

}