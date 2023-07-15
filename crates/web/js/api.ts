/**
 * This serves as an api for any types that wish to be exposed at the rust layer.
 */

export type ProtoRequest = InitRequest;

export type ProtoNotification = NotifyInitialized;

export type InitRequest = {
  type: string;
  addr: string;
  workspacePath?: string;
}

export type NotifyInitialized = {
  window_id: number;
};

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

export class StreamReader<T> {
  private consumer: AsyncIterator<T, void, T>;

  constructor(iterator: AsyncIterator<T>) {
      this.consumer = iterator;
  }

  /**
   * Yields values of T in a on-demand fashion instead of blocking until the entire operation either runs completely or
   * exits early.
   */
  async* next(): AsyncGenerator<T, null, T> {
      for await (const next of this.consumer.next()[Symbol.asyncIterator]) {
          yield next
      }
      return null
  }
}