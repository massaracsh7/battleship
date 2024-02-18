export default class newId {
  private usedIds: number[];

  constructor(usedIds: number[]) {
    this.usedIds = usedIds;
  }

  public createId(): number {
    let newId: number;
    do {
      newId = Math.floor(Math.random() * 1000);
    } while (this.usedIds.includes(newId));

    return newId;
  }
}

