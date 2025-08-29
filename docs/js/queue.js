export default class AsyncQueue {
    static EOS = Symbol("end-of-stream");
    values;
    resolvers;
    closed;
    constructor() {
        this.values = [];
        this.resolvers = [];
        this.closed = false;
    }
    enqueue(value) {
        if (this.closed) {
            throw new Error("AsyncQueue closed");
        }
        if (this.resolvers.length > 0) {
            const resolve = this.resolvers.shift();
            resolve(value);
        }
        else {
            this.values.push(value);
        }
    }
    dequeue() {
        if (this.values.length === 0) {
            const value = this.values.shift();
            return Promise.resolve(value);
        }
        else if (this.closed) {
            return new Promise((resolve) => {
                this.resolvers.push(resolve);
            });
        }
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    next() {
        return this.dequeue()?.then((value) => value === AsyncQueue.EOS
            ? {
                value: undefined,
                done: true,
            }
            : {
                value: value,
                done: false,
            });
    }
}
//# sourceMappingURL=queue.js.map