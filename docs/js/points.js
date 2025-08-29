export class Point {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static dotProduct(a, b) {
        return a.x * b.x + a.y * b.y;
    }
}
export class CanvasPoint extends Point {
    state;
    constructor(x, y, state) {
        super(x, y);
        this.state = state;
    }
    subtract(p) {
        return new CanvasPoint(this.x - p.x, this.y - p.y, this.state);
    }
    complexSubtract(p) {
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
    constructor(x, y) {
        super(x, y);
    }
    add(p) {
        return new ComplexPoint(this.x + p.x, this.y + p.y);
    }
    subtract(p) {
        return new ComplexPoint(this.x - p.x, this.y - p.y);
    }
}
//# sourceMappingURL=points.js.map