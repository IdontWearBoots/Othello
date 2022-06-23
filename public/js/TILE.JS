class TileState {
    static EMPTY = new TileState(-1);
    static WHITE = new TileState(1);
    static BLACK = new TileState(0);
    
    static TILE_PLACED_STATES = [this.BLACK, this.WHITE];

    /**
     * Creates a new State for any given Tile
     * @param {number} id the id of that specific state 
     */
    constructor(id) {
        this.stateId = id;
    }
}

class Tile {
    /**
     * Creates a new Tile object
     * @param {number} x column coordonate of the Tile on the board
     * @param {number} y row coordonate of the Tile on the board
     * @param {TileState} state the state of the Tile 
     * @param {HTMLButtonElement} elem the corresponding HTML element of the Tile 
     */
    constructor(x, y, state, elem) {
        this.x = x;
        this.y = y;
        this.element = elem;
        this.state = state;
    }

    set setState(s) {

        switch(s) {
            case TileState.BLACK:
                this.element.classList.add("black-tile");
                this.element.classList.remove("white-tile");
            break;

            case TileState.WHITE:
                this.element.classList.add("white-tile");
                this.element.classList.remove("black-tile");
            break;
                
            default:
                this.element.classList.remove("white-tile");
                this.element.classList.remove("black-tile");
            break;
        }

        this.state = s;

    }

    get getState() {
        return this.state;
    }

    click(b) {
        if(this.state !== TileState.EMPTY) return;

        // get the turn state
        let tState = TileState.TILE_PLACED_STATES[b.turn.turnId];

        // then set the state to the turn state
        this.setState = tState;
        
        // get the states on the horizontal and vertical axis
        let rowStates = b.board[this.y].map(e => e.getState);
        let colStates = new Array(8);
        for(let i = 0; i < b.board.length; i++) {
            colStates[i] = b.board[i][this.x].getState;
        }

        let [lrdTiles, rldTiles] = b.getDiagonalTiles(this.x, this.y);
        let lrdStates = lrdTiles.map(e => e.getState);
        let rldStates = rldTiles.map(e => e.getState);
        
        // get the flipping bounds and check they are usable
        // row start flip / end flip 
        // column and diags same thing
        let [rowsf, rowef] = Board.getFlipBounds(rowStates, this.x, tState);
        let [colsf, colef] = Board.getFlipBounds(colStates, this.y, tState);
        let [lrdsf, lrdef] = Board.getFlipBounds(lrdStates, lrdTiles.indexOf(this), tState);
        let [rldsf, rldef] = Board.getFlipBounds(rldStates, rldTiles.indexOf(this), tState);

        if(!Board.isValidPlacement(tState,
            [rowStates, rowsf, rowef], [colStates, colsf, colef], 
            [lrdStates, lrdsf, lrdef], [rldStates, rldsf, rldef]
        )) {
            Popup.INVALID_PLACEMENT.show();
            this.setState = TileState.EMPTY;            
            return;
        }

        if(Board.isValidFlip(tState, rowStates, rowsf, rowef)) {
            b.flipRow(this.y, tState, rowsf, rowef);
        }
        if(Board.isValidFlip(tState, colStates, colsf, colef)) {
            b.flipColumn(this.x, tState, colsf, colef);
        }
        if(Board.isValidFlip(tState, lrdStates, lrdsf, lrdef)) {
            b.flipDiag(lrdTiles, tState, lrdsf, lrdef);
        }
        if(Board.isValidFlip(tState, rldStates, rldsf, rldef)) {
            b.flipDiag(rldTiles, tState, rldsf, rldef);
        }
        
        // change turn
        b.turn = Turn.other(b.turn);
        b.updateBanners();
    }

}