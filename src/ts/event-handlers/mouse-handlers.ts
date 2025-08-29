import { CanvasPoint, Point } from "../points.js";
import State from ".././state.js";

let dragStartX: number, dragStartY: number;
let singleClickTimeoutId: number;

export function handleMousedown(event: MouseEvent, canvas: HTMLCanvasElement) {
  event.preventDefault();
  const canvasRect = canvas.getBoundingClientRect();
  dragStartX = (event.clientX - canvasRect.left) * window.devicePixelRatio;
  dragStartY = (event.clientY - canvasRect.top) * window.devicePixelRatio;
}

export function handleDrag(event: MouseEvent, state: State) {
  const canvasRect = state.canvas.getBoundingClientRect();
  const currentX = (event.clientX - canvasRect.left) * window.devicePixelRatio;
  const currentY = (event.clientY - canvasRect.top) * window.devicePixelRatio;
  const dragEnd = new CanvasPoint(currentX, currentY, state).toComplexPoint();
  const dragStart = new CanvasPoint(
    dragStartX,
    dragStartY,
    state
  ).toComplexPoint();
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

function handleClick(event: MouseEvent, state: State) {
  const canvasRect = state.canvas.getBoundingClientRect();
  const x = (event.clientX - canvasRect.left) * window.devicePixelRatio;
  const y = (event.clientY - canvasRect.top) * window.devicePixelRatio;
  const mid = new CanvasPoint(x, y, state).toComplexPoint();
  state.mid = mid;
}

export function handleSingleClick(event: MouseEvent, state: State) {
  if (handleDrag(event, state)) {
    return;
  }
  clearTimeout(singleClickTimeoutId);
  singleClickTimeoutId = window.setTimeout(() => {
    handleClick(event, state);
    state.render();
  }, 200);
}

export function handleDoubleClick(event: MouseEvent, state: State) {
  clearTimeout(singleClickTimeoutId);
  handleClick(event, state);
  state.zoomInBig();
  state.render();
}
