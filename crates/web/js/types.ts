export class Receiver<T> {
  private generator: AsyncGenerator<T, void, void>;

  constructor(generator: AsyncGenerator<T, void, void>) {
    this.generator = generator;
  }

  async next(): Promise<T>{
    for await (const value of this.generator) {
      return value;
    }
  }
}