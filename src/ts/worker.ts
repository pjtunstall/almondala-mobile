import init, { calculate_mandelbrot } from "../../public/wasm/almondala.js";
import { DataFromWorker } from "./state.js";

declare const self: Worker;
interface DedicatedWorkerGlobalScope {
  postMessage(message: DataFromWorker, transfer?: Transferable[]): void;
}

init().then(() => {
  self.postMessage({ type: "init" });
  onmessage = function (message) {
    const data = message.data;

    const {
      batchId,
      resetId,
      tileWidth,
      tileHeight,
      canvasWidth,
      canvasHeight,
      maxIterations,
      tileLeft,
      tileTop,
      mid,
      scale,
      ratio,
      power,
      grayscale,
    } = data;

    const pixels = new Uint8ClampedArray(
      calculate_mandelbrot(
        tileWidth,
        tileHeight,
        canvasWidth,
        canvasHeight,
        maxIterations,
        tileLeft,
        tileTop,
        mid.x,
        mid.y,
        scale,
        ratio,
        power,
        grayscale
      )
    );

    if (pixels.length !== tileWidth * tileHeight * 4) {
      console.error(
        `Lengths out of sync: pixels.length: ${
          pixels.length
        }, tile_width * tile_height * 4: ${tileWidth * tileHeight * 4}`
      );
      return;
    }

    const imageData = new ImageData(pixels, tileWidth, tileHeight);

    createImageBitmap(imageData).then((imageBitmap) => {
      (self as DedicatedWorkerGlobalScope).postMessage(
        {
          type: "render",
          dataBatchId: batchId,
          dataResetId: resetId,
          tileLeft,
          tileTop,
          imageBitmap,
        },
        [imageBitmap]
      );
    });
  };
});
