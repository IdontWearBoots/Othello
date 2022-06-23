class Turn {
    static WHITE = new Turn(1);
    static BLACK = new Turn(0);

    constructor(id) {
        this.turnId = id;
    }

    /**
     * Returns the opposing turn to the current one
     * @param {Turn} turn the current turn 
     * @returns {Turn} the opposing turn
     */
    static other(turn) {
        return turn.turnId ? Turn.BLACK : Turn.WHITE;
    }
}

class Board {
    /**
     * Creates a Board object, initialising the game
     * @param {HTMLDivElement} elem The HTML element corresponding to the board on the page
     */
    constructor(elem) {
        // create and initialise the board array
        this.board = [...new Array(8)].map(_ => new Array(8));
        this.element = elem;
        this.turn = Turn.BLACK;

        // visual indication of whose turn it is
        document.getElementById(`player${this.turn.turnId + 1}`).classList.add("is-player-turn")
    }

    init() {
        // make sure there is no preexisting board
        for(let c of this.element.children) {
            this.element.removeChild(c);
        }

        // for every row
        for(let i = 0; i < this.board.length; ++i) {
            // create a div corresponding to the row
            let row = document.createElement("div");

            // then for every possible tile on the row 
            for(let j = 0; j < this.board[i].length; ++j) {

                // create its element with corresponding class
                let e = document.createElement("button");
                e.classList.add("game-tile");

                // the tile inside each tile is actually a circular div
                let t = document.createElement("div");

                // create a tile at the correct place in the board array
                this.board[i][j] = new Tile(j, i, TileState.EMPTY, e);
                
                // bind the click function built in to Tile obj with the context
                e.addEventListener("click", () => this.board[i][j].click(this));

                // then stick'em on the DOM
                e.appendChild(t);
                row.appendChild(e);
            }
            this.element.appendChild(row);
        }

        // set the specific center begining tiles to their correct state
        this.board[3][3].setState = TileState.BLACK;
        this.board[4][4].setState = TileState.BLACK;
        this.board[3][4].setState = TileState.WHITE;
        this.board[4][3].setState = TileState.WHITE;

        this.updateBanners();
    }
    /**
     * 
     * @param {number} x the x coordonate of the tile
     * @param {number} y the y coordonate of the tile on the board
     * @returns {Tile[][]} the tiles in the left to right and right to left diagonals
     */
    getDiagonalTiles(x, y) {
        // left right diag / right left diag
        let lrdTiles = [];
        let rldTiles = [];
        let i, j;
        // get the coordonates for the beggining of the diagonal
        for(i = y, j = x; i > 0 && j > 0; --i, --j);
        // then for every tile on the diagonal, add it to the tiles array
        while(i < 8 && j < 8)
            lrdTiles.push(this.board[i++][j++]);
        // same here but different direction
        for(i = x, j = y; i < 7 && j > 0; i++, j--);
        while(i >= 0 && j < 8)
            rldTiles.push(this.board[i--][j++]);

        // then return the two arrays
        return [lrdTiles, rldTiles];
    }
    
    /**
     * Flips certain tiles in between two indexes of a given row
     * @param {number} y the y coordonate of the row
     * @param {TileState} turnState the state to which a tile shall be set
     * @param {number} startFlip begining index to flip at
     * @param {number} endFlip ending index where the flip stops
     */
    flipRow(y, turnState, startFlip, endFlip) {
        for(let i = startFlip; i <= endFlip; i++) {
            this.board[y][i].setState = turnState;
        }
    }
    /**
     * Flips certain tiles in between two indexes of a given column
     * @param {number} x the x coordonate of the column
     * @param {TileState} turnState the state to which a tile shall be set
     * @param {number} startFlip begining index to flip at
     * @param {number} endFlip ending index where the flip stops
     */
    flipColumn(x, turnState, startFlip, endFlip) {
        for(let i = startFlip; i <= endFlip; i++) {
            this.board[i][x].setState = turnState;
        }
    }
    /**
     * Flips certain tiles in between two indexes of a given diagonal
     * @param {Tile[]} diagTiles the tiles in a given diagonal
     * @param {TileState} turnState the state to which the tiles shall be set depending on the turn
     * @param {number} startFlip begining index to flip at
     * @param {number} endFlip ending index where the flip stops
     */
    flipDiag(diagTiles, turnState, startFlip, endFlip) {
        for(let i = startFlip; i <= endFlip; i++) {
            diagTiles[i].setState = turnState;
        }
    }

    /**
     * Counts all given tiles corrsponding to specified states
     * @param {TileState[]} states the types of tiles you want to count
     * @returns {number[]} the corresponding counts
     */
    count(states) {
        let c = new Array(states.length).fill(0);
        for(let row of this.board) {
            for(let t of row) {
                for(let i = 0; i < states.length; i++) {
                    c[i] += t.getState === states[i];
                }
            }
        }

        return c;
    }

    /**
     * Updates the banners of each players
     */
    updateBanners() {
        // initialise counts
        let [b, w] = this.count([TileState.BLACK, TileState.WHITE]);

        // animate the player banners depending on the turn
        document.getElementById(`player${this.turn.turnId + 1}`)
                .classList.add("is-player-turn");
        document.getElementById(`player${Turn.other(this.turn).turnId + 1}`)
                .classList.remove("is-player-turn");

        // update each respective player count
        document.getElementById("black-tile-count").firstChild.textContent = b;
        document.getElementById("white-tile-count").firstChild.textContent = w;
    }

    /**
     * Check if a given placement on the board is valid or not
     * @param {TileState} t The current state of the tile 
     * @param {Array} row Array composed of the rowStates, rowsf and rowef
     * @param {Array} col Array composed of the colStates, colsf and colef
     * @param {Array} lrd Array composed of the lrdStates, lrdsf and lrdef
     * @param {Array} rld Array composed of the rldStates, rldsf and rldef
     * @returns {bool} The validity of the placement
     */
    static isValidPlacement(t, row, col, lrd, rld) {        
        let rowvf = Board.isValidFlip(t, ...row);
        let colvf = Board.isValidFlip(t, ...col); 
        let lrdvf = Board.isValidFlip(t, ...lrd);
        let rldvf = Board.isValidFlip(t, ...rld); 

        return rowvf || colvf || lrdvf || rldvf;
    }

    /**
     * Determines the upper and lower bounds in between which Tiles shall be flipped
     * @param {TileState[]} states The states of the given direction you are checking
     * @param {number} position The index of the Tile in the {states}
     * @param {Turn} turnState The given turn
     * @returns {number[]} The lower and upper bound
    */
    static getFlipBounds(states, position, turnState, g = 1) {

        // determine lower bound e.g last correct state in between begining and position
        let lowerBound = states.slice(0, position).lastIndexOf(turnState);
        // determine upper bound e.g first correct state in between position and end
        let upperBound = states.slice(position + 1, states.length).indexOf(turnState);

        // if no correct states found, set upper to position
        if(upperBound === -1) {
            upperBound = position;
        } else {
            // otherwise correct it to accuretly point to position
            upperBound += position + g;
        }
        // same with lower
        if(lowerBound === -1) {
            lowerBound = position;
        }

        // if the two indexes are one appart then it cannot possibly be a valid 
        // move so just reset to position  
        if(upperBound === lowerBound + 1) {
            return [position, position];
        }
        
        return [lowerBound, upperBound];
    }

    /**
     * Determines if you can actually flip all tiles between two bounds
     * @param {TileState[]} states The states of the tils in the direction you are checking
     * @param {number} startFlip The lower bound of the tiles to flip
     * @param {number} endFlip The upper bound of the tiles to flip
     * @returns 
     */
    static isValidFlip(turnState, states, startFlip, endFlip) {

        if(startFlip === endFlip) {
            return false;
        }

        // for every index
        for(let i = 0; i < states.length; i++) {
            // if the index is in between the flip bounds and is EMPTY state
            if(startFlip < i && i < endFlip && (states[i] === TileState.EMPTY || states[i] === turnState)) {
                // then it cannot be a valid flip
                return false;
            }
        }

        return true;
    }

    static checkForWin(board) {

        let [b, w] = board.count([TileState.BLACK, TileState.WHITE]);
        if(b + w === 64) {
            if(b > w)
                Popup.BLACK_WINS.show();
            else 
                Popup.WHITE_WINS.show();
        }
    }

}