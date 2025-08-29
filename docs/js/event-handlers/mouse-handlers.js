import { CanvasPoint, Point } from "../points.js";
let dragStartX, dragStartY;
let singleClickTimeoutId;
export function handleMousedown(event, canvas) {
    event.preventDefault();
    const canvasRect = canvas.getBoundingClientRect();
    dragStartX = (event.clientX - canvasRect.left) * window.devicePixelRatio;
    dragStartY = (event.clientY - canvasRect.top) * window.devicePixelRatio;
}
export function handleDrag(event, state) {
    const canvasRect = state.canvas.getBoundingClientRect();
    const currentX = (event.clientX - canvasRect.left) * window.devicePixelRatio;
    const currentY = (event.clientY - canvasRect.top) * window.devicePixelRatio;
    const dragEnd = new CanvasPoint(currentX, currentY, state).toComplexPoint();
    const dragStart = new CanvasPoint(dragStartX, dragStartY, state).toComplexPoint();
    const dragDelta = dragStart.subtract(dragEnd);
    if (Point.dotProduct(dragDelta, dragDelta) === 0) {
        return false;
    }
    state.mid = state.mid.add(dragDelta);
    dragStartX = currentX;
    dragStartY = currentY;
    state.render();
    return true;
}
function handleClick(event, state) {
    const canvasRect = state.canvas.getBoundingClientRect();
    const x = (event.clientX - canvasRect.left) * window.devicePixelRatio;
    const y = (event.clientY - canvasRect.top) * window.devicePixelRatio;
    const mid = new CanvasPoint(x, y, state).toComplexPoint();
    state.mid = mid;
}
export function handleSingleClick(event, state) {
    if (handleDrag(event, state)) {
        return;
    }
    clearTimeout(singleClickTimeoutId);
    singleClickTimeoutId = window.setTimeout(() => {
        handleClick(event, state);
        state.render();
    }, 200);
}
export function handleDoubleClick(event, state) {
    clearTimeout(singleClickTimeoutId);
    handleClick(event, state);
    state.zoomInBig();
    state.render();
}
//# sourceMappingURL=mouse-handlers.js.map