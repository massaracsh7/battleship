export default class RandomNumber {
  private numberArr: number[];

  constructor(numberNew: number[]) {
    this.numberArr = numberNew;
  }

  public create(): number {
    let newNumber: number;
    do {
      newNumber = Math.floor(Math.random() * 1000);
    } while (this.numberArr.includes(newNumber));

    return newNumber;
  }
}

