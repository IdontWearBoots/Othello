class TileState {
    static POSSIBLE_PLACEMENT = new TileState(-2);
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
                this.element.classList.remove("possible-tile");
            break;

            case TileState.WHITE:
                this.element.classList.add("white-tile");
                this.element.classList.remove("black-tile");
                this.element.classList.remove("possible-tile");
            break;

            case TileState.POSSIBLE_PLACEMENT:
                this.element.classList.add("possible-tile");
            break;

            default:
                this.element.classList.remove("white-tile");
                this.element.classList.remove("black-tile");
                this.element.classList.remove("possible-tile");
            break;
        }

        this.state = s;

    }

    get getState() {
        return this.state;
    }

    click(b) {
        if(b.validPositions.length === 0) {
            if(b.turn === Turn.BLACK)
                Popup.SKIP_BLACK_TURN.show();
            else
                Popup.SKIP_WHITE_TURN.show();
            b.nextTurn();
        }

        if(!b.validPositions.includes(this)) {
            Popup.INVALID_PLACEMENT.show();
            return;
        }
        
        // get the turn state
        let turnState = TileState.TILE_PLACED_STATES[b.turn.turnId];

        // silent state setting for same reason as in the board.getAllValidPositions line smth
        this.state = TileState.TILE_PLACED_STATES[+!turnState.stateId];

        let move = new Move(this.x, this.y, this, turnState, b);
        
        if(Board.isValidFlip(turnState, move.rowTiles, ...move.rowBounds))
            b.flipRow(this.y, turnState, ...move.rowBounds);
        if(Board.isValidFlip(turnState, move.colTiles, ...move.colBounds))
            b.flipColumn(this.x, turnState, ...move.colBounds);
        if(Board.isValidFlip(turnState, move.lrdTiles, ...move.lrdBounds))
            b.flipDiag(move.lrdTiles, turnState, ...move.lrdBounds);
        if(Board.isValidFlip(turnState, move.rldTiles, ...move.rldBounds))
            b.flipDiag(move.rldTiles, turnState, ...move.rldBounds);
        
        // then set the state to the turn state
        this.setState = turnState;
        
        // change turn
        b.nextTurn();
    }

    isFull() {
        return !(this.getState === TileState.EMPTY || this.getState === TileState.POSSIBLE_PLACEMENT);
    }
}