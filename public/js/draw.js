let isWorkerInitialized = false;
let isRenderPending = false;
let isRenderScheduled = false;
let attempts = 0;
export default class Renderer {
    ctx;
    worker = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
    });
    constructor(ctx) {
        this.ctx = ctx;
        this.worker.onmessage = (event) => {
            const data = event.data;
            // console.log(
            //   "Hi, I'm main and I just received a message with data:",
            //   data
            // );
            if (data.type === "init") {
                // console.log("Init message received in main.");
                isWorkerInitialized = true;
                // this.draw(2024, new State(17));
            }
            if (data.type === "render") {
                if (!isWorkerInitialized) {
                    console.error("Worker is not initialized but still has sent us a rendered message. This shouldn't happen.");
                    return;
                }
                ctx.drawImage(data.imageBitmap, 0, 0);
                isRenderPending = false;
                // // I need to make state available here and pick a maxIterations. Maybe make draw a method of state.
                // if (isRenderScheduled) {
                //   this.draw(1024, new State(17));
                // }
            }
        };
    }
    draw(state) {
        if (!isWorkerInitialized) {
            console.error("Request to render before worker is initialized. Attempt:", ++attempts);
            setTimeout(() => this.draw(state), 360);
            return false;
        }
        if (isRenderPending) {
            isRenderScheduled = true;
            return false;
        }
        isRenderPending = true;
        this.worker.postMessage({ type: "render", state });
        return true;
    }
}
//# sourceMappingURL=draw.js.map