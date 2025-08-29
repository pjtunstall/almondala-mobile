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
    requestReset() {
        if (cooldownTimer)
            clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
            Object.assign(this, {
                ...new State(this.grayscale, this.workerPool),
            });
            canvas.style.transition = "none";
            canvas.style.opacity = "0";
            setTimeout(() => {
                canvas.style.transition = "opacity 2s ease-in-out";
                canvas.style.opacity = "1";
            }, 10);
            this.reset();
            this.render();
        }, 256);
    }
    reset() {
        resetId++;
        let width = 0.8 * document.body.clientWidth;
        let height = 0.8 * document.body.clientHeight;
        const phi = this.ratio;
        const controls = document.getElementById("controls");
        if (width > height) {
            controls.style.flexDirection = "column";
            width = Math.min(height * phi, width);
        }
        else {
            controls.style.flexDirection = "row";
            height = Math.min(width * phi, height);
            this.scale = 2;
        }
        this.ratio = width / height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const intrinsicWidth = Math.floor(width * dpr);
        const intrinsicHeight = Math.floor(height * dpr);
        if (width <= 0 || height <= 0) {
            console.error("Invalid main canvas width and height:", width, height);
        }
        canvas.width = intrinsicWidth;
        canvas.height = intrinsicHeight;
        this.width = intrinsicWidth;
        this.height = intrinsicHeight;
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
}
//# sourceMappingURL=state.js.map