import MandelbrotExplorer from "./mandelbrot-explorer.js";
import State from "./state.js";
import WorkerPool from "./worker-pool.js";
const numWorkers = navigator.hardwareConcurrency || 2;
const workerPool = new WorkerPool(numWorkers);
await Promise.all(workerPool.initPromises);
workerPool.changeOnmessageHandlers();
let state = new State(true, workerPool);
new MandelbrotExplorer(state);
//# sourceMappingURL=main.js.map