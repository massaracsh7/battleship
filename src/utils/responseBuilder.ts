export default class ResponseBuilder {
  private type: string;
  private data: string;
  private id: number;

  constructor(type: string, data: string, id: number = 0) {
    this.type = type;
    this.data = data;
    this.id = id;
  }

  public buildResponse(): string {
    const response = {
      type: this.type,
      data: this.data,
      id: this.id
    };
    return JSON.stringify(response);
  }
}
