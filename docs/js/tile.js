export default class Tile {
    x;
    y;
    width;
    height;
    row;
    constructor(x, y, width, height, row) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.row = row;
    }
    static *tiles(width, height, numRows, numCols) {
        const columnWidth = Math.ceil(width / numCols);
        const rowHeight = Math.ceil(height / numRows);
        for (let row = 0; row < numRows; row++) {
            const tileHeight = row < numRows - 1 ? rowHeight : height - rowHeight * (numRows - 1);
            for (let col = 0; col < numCols; col++) {
                const tileWidth = col < numCols - 1 ? columnWidth : width - columnWidth * (numCols - 1);
                yield new Tile(col * columnWidth, row * rowHeight, tileWidth, tileHeight, row);
            }
        }
    }
}
//# sourceMappingURL=tile.js.map