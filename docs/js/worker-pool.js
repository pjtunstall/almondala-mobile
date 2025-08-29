export default class WorkerPool {
    idleWorkers = [];
    initPromises = [];
    initResolvers = [];
    numWorkers;
    busyWorkersMap = new Map();
    workQueue = [];
    constructor(numWorkers) {
        this.numWorkers = numWorkers;
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(new URL("./worker.js", import.meta.url), {
                type: "module",
            });
            this.idleWorkers.push(worker);
            this.initPromises.push(new Promise((resolve) => {
                this.initResolvers.push(resolve);
            }));
            // Once all initPromises have resolved, this will be replaced with a handler to deal with the actual work.
            worker.onmessage = (event) => {
                this.handleWorkerInitMessage(event);
            };
        }
    }
    handleWorkerInitMessage(event) {
        const data = event.data;
        if (data.type === "init") {
            const resolver = this.initResolvers.pop();
            if (!resolver) {
                throw new Error("'init' messsage received, but no resolver found");
            }
            resolver(data); // Worker reports that it's successfully initialized the Wasm module.
            return;
        }
        else {
            throw new Error("Expected message type 'init', got", data.type);
        }
    }
    // Called from the `main` module after all initPromises have resolved.
    changeOnmessageHandlers() {
        for (const worker of this.idleWorkers) {
            worker.onmessage = (event) => {
                this.workerDone(worker, null, event.data);
            };
            worker.onerror = (event) => {
                this.workerDone(worker, event.error, null);
            };
        }
    }
    workerDone(worker, error, response) {
        const [resolver, rejector] = this.busyWorkersMap.get(worker);
        this.busyWorkersMap.delete(worker);
        if (this.workQueue.length === 0) {
            this.idleWorkers.push(worker);
        }
        else {
            const tuple = this.workQueue.shift();
            const [work, resolver, rejector] = tuple;
            this.busyWorkersMap.set(worker, [resolver, rejector]);
            worker.postMessage(work);
        }
        error === null ? resolver(response) : rejector(error);
    }
    addWork(work) {
        return new Promise((resolve, reject) => {
            if (this.idleWorkers.length > 0) {
                const worker = this.idleWorkers.pop();
                this.busyWorkersMap.set(worker, [resolve, reject]);
                worker?.postMessage(work);
            }
            else {
                this.workQueue.push([work, resolve, reject]);
            }
        });
    }
}
//# sourceMappingURL=worker-pool.js.map