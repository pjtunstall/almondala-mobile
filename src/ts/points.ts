import State from "./state.js";

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static dotProduct(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
  }
}

export class CanvasPoint extends Point {
  state: State;

  constructor(x: number, y: number, state: State) {
    super(x, y);
    this.state = state;
  }

  subtract(p: CanvasPoint): CanvasPoint {
    return new CanvasPoint(this.x - p.x, this.y - p.y, this.state);
  }

  complexSubtract(p: CanvasPoint): ComplexPoint {
    return this.toComplexPoint().subtract(p.toComplexPoint());
  }

  toComplexPoint() {
    const { scale, mid, ratio, width, height } = this.state;

    const x = ratio * (this.x / width - 0.5) * 3 * scale + mid.x;
    const y = -(this.y / height - 0.5) * 3 * scale + mid.y;

    return new ComplexPoint(x, y);
  }
}

export class ComplexPoint extends Point {
  constructor(x: number, y: number) {
    super(x, y);
  }

  add(p: ComplexPoint): ComplexPoint {
    return new ComplexPoint(this.x + p.x, this.y + p.y);
  }

  subtract(p: ComplexPoint): ComplexPoint {
    return new ComplexPoint(this.x - p.x, this.y - p.y);
  }
}
