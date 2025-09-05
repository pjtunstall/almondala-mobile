import { ComplexPoint } from "./points.js";
import Tile from "./tile.js";
const dpr = window.devicePixelRatio;
const panDelta = 0.1;
const rows = 8;
const cols = 5;
let cooldownTimer = null;
let resetId = 0;
let batchId = 0;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
window.onload = function () {
  canvas.classList.add("visible");
};
export default class State {
  scale = 1;
  mid = new ComplexPoint(-0.6, 0);
  width = 0;
  height = 0;
  ratio = 1.618033988749895;
  power = 2;
  grayscale;
  maxIterations = 128;
  fullMaxIterations = 1024;
  canvas = canvas;
  tiles = [];
  workerPool;
  pendingRenders = null;
  wantsRender = false;
  constructor(grayscale, workerPool) {
    this.grayscale = grayscale;
    this.workerPool = workerPool;
    this.setupVisibility();
  }
  changeColor() {
    this.grayscale = !this.grayscale;
  }
  panLeft() {
    this.mid.x -= this.scale * panDelta;
  }
  panRight() {
    this.mid.x += this.scale * panDelta;
  }
  panUp() {
    this.mid.y += this.scale * panDelta;
  }
  panDown() {
    this.mid.y -= this.scale * panDelta;
  }
  zoomIn() {
    this.scaleBy(0.96);
  }
  zoomInBig() {
    this.scaleBy(Math.pow(0.96, 12));
  }
  zoomOut() {
    this.scaleBy(1 / 0.96);
  }
  scaleBy(ds) {
    // // Zooming in further reaches the limits of floating point precision. But preventing it could give the impression that the controls are just not responding, unless some warning is given.
    // if (ds <= 1 && this.scale < 2e-13) {
    //   return;
    // }
    this.scale *= ds;
  }
  getWork(tile) {
    return {
      type: "render",
      batchId,
      resetId,
      tileWidth: tile.width,
      tileHeight: tile.height,
      canvasWidth: this.width,
      canvasHeight: this.height,
      maxIterations: this.maxIterations,
      tileLeft: tile.x,
      tileTop: tile.y,
      mid: this.mid,
      scale: this.scale,
      ratio: this.ratio,
      power: this.power,
      grayscale: this.grayscale,
    };
  }
  fakeRender(ds, dx, dy) {
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(ds, ds);
    ctx.translate((dx *= dpr), (dy *= dpr * this.ratio));
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
  incrementPowerBy(increment) {
    this.power += increment;
    this.resetView();
  }
  resetView() {
    this.scale = 1;
    this.mid.x = this.power === 2 ? -0.6 : 0;
    this.mid.y = 0;
    const exponentText = document.getElementById("exponent-text");
    if (exponentText) {
      exponentText.textContent = `Exponent: ${this.power}`;
    }
  }
  prepareReset() {
    Object.assign(this, {
      ...new State(this.grayscale, this.workerPool),
    });
    this.reset();
    this.render();
  }
  isMobileDevice() {
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    return hasCoarsePointer || hasTouchPoints;
  }
  requestReset() {
    if (this.isMobileDevice()) {
      this.prepareReset();
    } else {
      if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
      this.cooldownTimer = setTimeout(() => {
        this.prepareReset();
      }, 256);
    }
  }
  reset() {
    let resetId = 0;
    resetId++;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const controls = document.getElementById("controls");
    let controlsWidth = 0;
    let controlsHeight = 0;

    if (controls) {
      const controlsRect = controls.getBoundingClientRect();
      controlsWidth = controlsRect.width;
      controlsHeight = controlsRect.height;
    }

    const targetAspectRatio = this.ratio || 1.0;

    let availableWidth, availableHeight;
    const isLandscape = viewportWidth > viewportHeight;

    if (isLandscape) {
      if (controls) {
        availableWidth = viewportWidth - controlsWidth - 40;
        availableHeight = viewportHeight - 20;
      } else {
        availableWidth = viewportWidth - 20;
        availableHeight = viewportHeight - 20;
      }
    } else {
      if (controls) {
        availableWidth = viewportWidth - 20;
        availableHeight = viewportHeight - controlsHeight - 40;
      } else {
        availableWidth = viewportWidth - 20;
        availableHeight = viewportHeight - 20;
      }
    }

    let canvasWidth, canvasHeight;

    if (availableWidth / availableHeight > targetAspectRatio) {
      canvasHeight = availableHeight;
      canvasWidth = canvasHeight * targetAspectRatio;
    } else {
      canvasWidth = availableWidth;
      canvasHeight = canvasWidth / targetAspectRatio;
    }

    const minSize = 200;
    if (canvasWidth < minSize) {
      canvasWidth = minSize;
      canvasHeight = minSize / targetAspectRatio;
    }
    if (canvasHeight < minSize) {
      canvasHeight = minSize;
      canvasWidth = minSize * targetAspectRatio;
    }

    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${Math.floor(canvasWidth)}px`;
    canvas.style.height = `${Math.floor(canvasHeight)}px`;

    const intrinsicWidth = Math.floor(canvasWidth * dpr);
    const intrinsicHeight = Math.floor(canvasHeight * dpr);

    if (intrinsicWidth <= 0 || intrinsicHeight <= 0) {
      return;
    }

    canvas.width = intrinsicWidth;
    canvas.height = intrinsicHeight;

    this.width = intrinsicWidth;
    this.height = intrinsicHeight;
    this.ratio = canvasWidth / canvasHeight;

    this.tiles = [...Tile.tiles(intrinsicWidth, intrinsicHeight, rows, cols)];

    const iterationsText = document.getElementById("iterations-text");
    if (iterationsText) {
      iterationsText.textContent = `Max iterations: ${this.maxIterations}`;
    }

    const exponentText = document.getElementById("exponent-text");
    if (exponentText) {
      exponentText.textContent = `Exponent: ${this.power}`;
    }
  }
  render() {
    if (this.pendingRenders) {
      this.wantsRender = true;
      return;
    }
    let promises = this.tiles.map((tile) => {
      return this.workerPool.addWork(this.getWork(tile));
    });
    batchId++;
    this.pendingRenders = Promise.all(promises)
      .then((responses) => {
        const { dataBatchId, dataResetId } = responses[0];
        if (dataResetId !== resetId || (batchId - dataBatchId) % 8 !== 1) {
          return;
        }
        requestAnimationFrame(() => {
          for (const data of responses) {
            this.handleWorkerMessage(data);
          }
        });
      })
      .finally(() => {
        this.pendingRenders = null;
        if (this.wantsRender) {
          this.wantsRender = false;
          this.render();
        }
      });
  }
  handleWorkerMessage(data) {
    const { tileLeft, tileTop, imageBitmap } = data;
    if (data.type === "render") {
      ctx.drawImage(imageBitmap, tileLeft, tileTop);
    }
  }
  setupVisibility() {
    const controls = document.getElementById("controls");
    const canvas = document.getElementById("canvas");
    if (!controls || !canvas) return;

    controls.classList.add("visible");
    canvas.classList.add("visible");

    const orientationQuery = window.matchMedia("(orientation: landscape)");

    const handleOrientationChange = () => {
      controls.style.transition = "none";
      canvas.style.transition = "none";
      controls.classList.remove("visible");
      canvas.classList.remove("visible");

      void document.body.offsetHeight;

      this.requestReset();

      setTimeout(() => {
        controls.style.transition = "opacity 2s ease-in-out";
        canvas.style.transition = "opacity 2s ease-in-out";

        setTimeout(() => {
          controls.classList.add("visible");
          canvas.classList.add("visible");
        }, 10);
      }, 50);
    };

    orientationQuery.addEventListener("change", handleOrientationChange);
  }
}
//# sourceMappingURL=state.js.map
