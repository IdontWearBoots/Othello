class Move {

    /**
     * Creates an object representing a move to avoid recalculating the same thisng multiple times 
     * @param {number} x The x coordonate of the tile on the board
     * @param {number} y The y coordonate of the tile on the board
     * @param {Tile} tile The corresponding tile on the Board
     * @param {TileState} turnState The state to which the tiles shall be set if flipped
     * @param {Board} board The playing board
     */
    constructor(x, y, tile, turnState, board) {
        this.x = x;
        this.y = y;
        this.tile = tile;
        this.turnState = turnState;
        this.rowTiles = board.getRowTiles(this.y);
        this.colTiles = board.getColumnTiles(this.x);
        [this.lrdTiles, this.rldTiles] = board.getDiagonalTiles(this.x, this.y);
        this.rowBounds = Board.getFlipBounds(this.rowTiles, this.x, this.turnState);
        this.colBounds = Board.getFlipBounds(this.colTiles, this.y, this.turnState);
        this.lrdBounds = Board.getFlipBounds(this.lrdTiles, this.lrdTiles.indexOf(this.tile), this.turnState);
        this.rldBounds = Board.getFlipBounds(this.rldTiles, this.rldTiles.indexOf(this.tile), this.turnState);
    }

    isValid() {
        let rowvf = Board.isValidFlip(this.turnState, this.rowTiles, ...this.rowBounds);
        let colvf = Board.isValidFlip(this.turnState, this.colTiles, ...this.colBounds);
        let lrdvf = Board.isValidFlip(this.turnState, this.lrdTiles, ...this.lrdBounds);
        let rldvf = Board.isValidFlip(this.turnState, this.rldTiles, ...this.rldBounds);

        return rowvf || colvf || lrdvf || rldvf;

    }
}