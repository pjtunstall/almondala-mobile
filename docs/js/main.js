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

initializeControlVisibility();

function initializeControlVisibility() {
  const controls = document.getElementById("controls");
  if (!controls) return;

  const fadeIn = () => {
    controls.classList.add("visible");
  };

  const handleOrientationChange = () => {
    controls.classList.remove("visible");
    controls.addEventListener("transitionend", fadeIn, { once: true });
  };

  const orientationQuery = window.matchMedia("(orientation: landscape)");
  orientationQuery.addEventListener("change", handleOrientationChange);

  fadeIn();
}
