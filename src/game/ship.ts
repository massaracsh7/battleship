import { Cell, Grid, GridPoint, ShipData, Attack } from '../types/types';

export default class Ship {
  private grid: Array<Grid>;
  private doneShoots: Array<Attack>;

  constructor(ships: Array<ShipData>) {
    this.grid = this.createGrid(ships);
    this.doneShoots = [];
  }

  public checkShoot(target: GridPoint): Attack {
    const isShotDone = this.doneShoots.some((shoot: Attack) => shoot.position.x === target.x && shoot.position.y === target.y);

    if (isShotDone) {
      return this.doneShoots.find((shoot: Attack) => shoot.position.x === target.x && shoot.position.y === target.y) || { position: target, status: 'miss' };
    }

    const result = this.grid.find((ship: Grid) => {
      const coor = ship.cells.find((pos: GridPoint) => pos.x === target.x && pos.y === target.y)
      if (!ship.isDead && coor) {
        return ship;
      }
    });

    if (result) {
      const cell: Cell | undefined = result.cells.find((pos: GridPoint) => pos.x === target.x && pos.y === target.y);

      if (cell && !cell.isHole) {
        cell.isHole = true;
      }
      result.isDead = result.cells.every((cell: Cell) => cell.isHole);

      const status = this.checkShipStatus(result);

      const attack: Attack = {
        position: target,
        status: status
      };

      this.doneShoots.push(attack);
      return attack;
    }

    const attack: Attack = {
      position: target,
      status: 'miss'
    };

    this.doneShoots.push(attack);
    return attack;
  }

  public checkAllShipsDead(): boolean {
    return this.grid.every((ship: Grid) => ship.isDead);
  }

  private createGrid(ships: Array<ShipData>): Array<Grid> {
    return ships.map((ship: ShipData) => {
      let cells: Array<Cell>;
      const isHorizontal = !ship.direction;

      cells = this.calculateCells(ship.position, ship.length, isHorizontal);

      return {
        cells: cells,
        size: ship.size,
        isDead: false
      };
    });
  }

  private calculateCells(startPos: GridPoint, length: number, isHorizontal: boolean): Array<Cell> {
    const cells: Array<Cell> = [];

    for (let i = 0; i < length; i++) {
      const x = isHorizontal ? startPos.x + i : startPos.x;
      const y = isHorizontal ? startPos.y : startPos.y + i;

      const cell: Cell = {
        x: x,
        y: y,
        isHole: false
      };

      cells.push(cell);
    }

    return cells;
  }

  private checkShipStatus(ship: Grid): "killed" | "shot" {
    if (ship.cells.every((cell: Cell) => cell.isHole)) return 'killed';

    return 'shot';
  }

}
