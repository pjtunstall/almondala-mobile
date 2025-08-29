import Renderer from ".././draw.js";
import State from ".././state.js";
let cooldownTimer = null;
export default function requestReset(canvas, ctx, renderer, state) {
    if (cooldownTimer)
        clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
        Object.assign(state, {
            ...new State(state.grayscale),
        });
        reset(canvas, ctx, state);
        renderer.draw(state);
    }, 256);
}
export function reset(canvas, ctx, state) {
    let width = 0.8 * document.body.clientWidth;
    let height = 0.8 * document.body.clientHeight;
    const phi = state.ratio;
    const controls = document.getElementById("controls");
    if (width > height) {
        controls.style.flexDirection = "column";
        width = Math.min(height * phi, width);
    }
    else {
        controls.style.flexDirection = "row";
        height = Math.min(width * phi, height);
        state.zoom = 2;
    }
    state.ratio = width / height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const dpr = window.devicePixelRatio;
    const intrinsicWidth = Math.floor(width * dpr);
    const intrinsicHeight = Math.floor(height * dpr);
    if (width <= 0 || height <= 0) {
        console.error("Invalid main canvas width and height:", width, height);
    }
    canvas.width = intrinsicWidth;
    canvas.height = intrinsicHeight;
    state.width = intrinsicWidth;
    state.height = intrinsicHeight;
    const renderer = new Renderer(ctx);
    return renderer;
}
//# sourceMappingURL=reset.js.map