import { ComplexPoint } from "./points";

type ErrorOrNull = Error | null;

export interface Work {
  type: "render";
  batchId: number;
  resetId: number;
  tileWidth: number;
  tileHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  maxIterations: number;
  tileLeft: number;
  tileTop: number;
  mid: ComplexPoint;
  scale: number;
  ratio: number;
  rFactor: number;
  gFactor: number;
  bFactor: number;
  power: number;
  grayscale: boolean;
}

export default class WorkerPool {
  idleWorkers: Worker[] = [];
  initPromises: Promise<unknown>[] = [];
  initResolvers: ((value: unknown) => void)[] = [];
  numWorkers: number;
  busyWorkersMap = new Map();
  private workQueue: [
    Work,
    (value: unknown) => void,
    (reason?: string) => void
  ][] = [];

  constructor(numWorkers: number) {
    this.numWorkers = numWorkers;

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
      this.idleWorkers.push(worker);
      this.initPromises.push(
        new Promise((resolve) => {
          this.initResolvers.push(resolve);
        })
      );

      // Once all initPromises have resolved, this will be replaced with a handler to deal with the actual work.
      worker.onmessage = (event: MessageEvent) => {
        this.handleWorkerInitMessage(event);
      };
    }
  }

  private handleWorkerInitMessage(event: MessageEvent) {
    const data = event.data;
    if (data.type === "init") {
      const resolver = this.initResolvers.pop();
      if (!resolver) {
        throw new Error("'init' messsage received, but no resolver found");
      }
      resolver(data); // Worker reports that it's successfully initialized the Wasm module.
      return;
    } else {
      throw new Error("Expected message type 'init', got", data.type);
    }
  }

  // Called from the `main` module after all initPromises have resolved.
  changeOnmessageHandlers() {
    for (const worker of this.idleWorkers) {
      worker.onmessage = (event: MessageEvent) => {
        this.workerDone(worker, null, event.data);
      };
      worker.onerror = (event: ErrorEvent) => {
        this.workerDone(worker, event.error, null);
      };
    }
  }

  private workerDone(
    worker: Worker,
    error: ErrorOrNull,
    response: MessageEvent | null
  ) {
    const [resolver, rejector] = this.busyWorkersMap.get(worker);
    this.busyWorkersMap.delete(worker);
    if (this.workQueue.length === 0) {
      this.idleWorkers.push(worker);
    } else {
      const tuple = this.workQueue.shift() as unknown as [
        Work,
        (value: unknown) => void,
        (reason?: string) => void
      ];
      const [work, resolver, rejector] = tuple;
      this.busyWorkersMap.set(worker, [resolver, rejector]);
      worker.postMessage(work);
    }

    error === null ? resolver(response) : rejector(error);
  }

  addWork(work: Work) {
    return new Promise((resolve, reject) => {
      if (this.idleWorkers.length > 0) {
        const worker = this.idleWorkers.pop();
        this.busyWorkersMap.set(worker, [resolve, reject]);
        worker?.postMessage(work);
      } else {
        this.workQueue.push([work, resolve, reject]);
      }
    });
  }
}
