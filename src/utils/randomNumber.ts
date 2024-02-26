export default class RandomNumber {
  private result: number;

  constructor(ids: Array<number>) {
    this.result = this.create(ids);
  }

  get id(): number {
    return this.result;
  }

  private create(ids: Array<number>): number {
    let number: string = '';
    while (!number || this.checkRoom(Number(number), ids)) {
      number = '';
      let i = 0;
      while (i < 4) {
        number += String(Math.ceil(Math.random() * 100));
        i += 1;
      }
    }
    return Number(number);
  }

  private checkRoom(id: number, ids: Array<number>): boolean {
    return ids.some((item: number) => item === id);
  }
}
