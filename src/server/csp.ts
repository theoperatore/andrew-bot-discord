const messages = Symbol('messages');
const putters = Symbol('putters');
const takers = Symbol('takers');

export type Channel<T> = {
  [messages]: T[];
  [putters]: (() => void)[];
  [takers]: ((msg: T) => void)[];
  readonly length: number;
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;
};

export type IterablePromise<T> = Promise<T> & {
  [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;
};

/* public methods */

function channel<T>(): Channel<T> {
  return {
    [messages]: [],
    [putters]: [],
    [takers]: [],
    get length() {
      return this[messages].length;
    },
    async *[Symbol.asyncIterator]() {
      while (true) {
        yield await _take(this);
      }
    },
  };
}

function put<T>(ch: Channel<T>, msg: T): Promise<void> {
  return new Promise(resolve => {
    ch[messages].unshift(msg);
    ch[putters].unshift(resolve);
    if (ch[takers].length) {
      ch[putters].pop()!();
      ch[takers].pop()!(ch[messages].pop() as T);
    }
  });
}

function _take<T>(ch: Channel<T>): Promise<T> {
  return new Promise(resolve => {
    ch[takers].unshift(resolve);
    if (ch[putters].length) {
      ch[putters].pop()!();
      ch[takers].pop()!(ch[messages].pop() as T);
    }
  });
}

function take<T>(ch: Channel<T>): IterablePromise<T> {
  const promise = _take(ch);
  return Object.assign(promise, {
    async *[Symbol.asyncIterator]() {
      yield await promise;
      while (true) {
        yield await _take(ch);
      }
    },
  }) as IterablePromise<T>;
}

export { channel, put, take };
