export default class RandomNumber {
  private result: number;

  constructor(ids: Array<number>) {
    this.result = this.create(ids);
  }

  get id(): number {
    return this.result;
  }

  private create(ids: Array<number>): number {
    let number: string;
    do {
      number = this.createNumberStr();
    } while (ids.includes(Number(number)));
    return Number(number);
  }

  private createNumberStr(): string {
    return Array.from({ length: 4 }, () => String(Math.ceil(Math.random() * 100))).join('');
  }
}
