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
        this.length = 8;
        // create and initialise the board array
        this.board = [...new Array(this.length)].map(_ => new Array(this.length));
        this.element = elem;
        this.turn = Turn.BLACK;
        this.validPositions = [];

        // visual indication of whose turn it is
        document.getElementById(`player${this.turn.turnId + 1}`).classList.add("is-player-turn")
    }

    init() {
        // make sure there is no preexisting board
        for(let c of this.element.children) {
            this.element.removeChild(c);
        }

        // for every row
        for(let i = 0; i < this.length; ++i) {
            // create a div corresponding to the row
            let row = document.createElement("div");

            // then for every possible tile on the row 
            for(let j = 0; j < this.length; ++j) {

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
        this.board[3][3].setState = TileState.WHITE;
        this.board[4][4].setState = TileState.WHITE;
        this.board[3][4].setState = TileState.BLACK;
        this.board[4][3].setState = TileState.BLACK;

        this.updateBanners();
        this.validPositions = this.getAllValidPositions(TileState.BLACK);
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
     * Returns the tiles of a given row of the board
     * @param {number} y The y coordonate of the row
     * @returns {Tile[]} The row at y
     */
    getRowTiles(y) {
        let r = new Array(this.length);
        for(let i = 0; i < this.length; i++) {
            r[i] = this.board[y][i];
        }
        return r;
    }
    getColumnTiles(x) {
        let r = new Array(this.length);
        for(let i = 0; i < this.length; i++) {
            r[i] = this.board[i][x];
        }
        return r;
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
     * Returns tiles around a certain tile
     * @param {number} x The x coordonate of a tile on the board
     * @param {number} y The y coordonate of a tile on the board
     * @returns {Tile[]} Tiles around the tile [x, y]
     */
    getTilesAround(x, y) {
        let ret = [];
        let offsetYTop = y === 0 ? 0 : 1;
        let offsetYBottom = y === this.board.length - 1 ? 0 : 1;
        let offsetXLeft = x === 0 ? 0 : 1;
        let offsetXRight = x === this.board[0].length - 1 ? 0 : 1;

        for(let i = y - offsetYTop; i <= y + offsetYBottom; i++) {
			for(let j = x - offsetXLeft; j <= x + offsetXRight; j++) {
				if(! (i == y && j == x) ) {
					ret.push(this.board[i][j]);
				}
			}
		}

        return ret;
    }

    /**
     * Returns an Array of all the possible positions the player could place his tile depending on the turn
     * @param {TileState} turnState The state to which the tiles shall be flipped 
     * @returns {Tile[]} All of the tiles that could be possible moves
     */
    getAllValidPositions(turnState) {
        for(let r of this.board) {
            for(let t of r) {
                if(t.isFull()) continue;
                t.setState = TileState.EMPTY;
            }
        }

        let allPositions = [];

        for(let i = 0; i < this.length; i++) {
            for(let j = 0; j < this.length; j++) {
                let e = this.board[i][j];
                let around = this.getTilesAround(j, i); 

                if(e.isFull()) {
                    continue;
                }
                
                // if every tile around the tile is in empty state then it cannot possibly a possible move 
                if(
                    around.filter(t => t.getState === TileState.EMPTY).length 
                    === around.length) {
                    continue;
                }

                // quiet setting of current tile state to the other state (black => white and vise-verça)
                // this is to avoid really fricking annoying behaviour when tile is placed in between two others
                // hard to explain but say 0 is black and 1 is white tile (space is empty)
                // say tState=black and the row is something like this : 011 1110
                // you want to place the tile in the empty spot but it says you cant cause 
                // it doesn't verify bounds [0, 7] cause of the empty space
                // silently replacing to a full space doesn't trigger the showing of a tile and fixes everything
                // do it before evaluation that happens in the move object
                e.state = TileState.TILE_PLACED_STATES[+!turnState.stateId];

                let move = new Move(j, i, e, turnState, this, true);

                if(move.isValid()) {
                    allPositions.push(move.tile);
                    move.tile.setState = TileState.POSSIBLE_PLACEMENT;
                } else {
                    move.tile.setState = TileState.EMPTY;
                }
            }
        }

        return allPositions;
    }

    checkForWin() {
        let [b, w] = this.count([TileState.BLACK, TileState.WHITE]);
        if(b + w === 64) {
            if(b > w)
                Popup.BLACK_WINS.show();
            else 
                Popup.WHITE_WINS.show();
        }
    }

    nextTurn() {
        this.turn = Turn.other(this.turn);
        this.updateBanners();
        this.checkForWin();
        this.validPositions = this.getAllValidPositions(TileState.TILE_PLACED_STATES[this.turn.turnId]);
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
     * Determines the upper and lower bounds in between which Tiles shall be flipped
     * @param {Tile[]} tiles The tiles of the given direction you are checking
     * @param {number} position The index of the Tile in the {states}
     * @param {Turn} turnState The given turn
     * @returns {number[]} The lower and upper bound
    */
    static getFlipBounds(tiles, position, turnState) {
        // get the states of the tiles
        let states = tiles.map(e => e.getState);

        // determine lower bound e.g last correct state in between begining and position
        let lowerBound = states.slice(0, position).lastIndexOf(turnState);
        // determine upper bound e.g first correct state in between position and end
        let upperBound = states.slice(position + 1, states.length).indexOf(turnState);

        // if no correct states found, set upper to position
        if(upperBound === -1) {
            upperBound = position;
        } else {
            // otherwise correct it to accuretly point to position
            upperBound += position + 1;
        }
        // same with lower but nothing to correct
        if(lowerBound === -1) {
            lowerBound = position;
        }

        if(!Board.isValidFlip(turnState, tiles, lowerBound, position)) {
            lowerBound = position;
        }
        if(!Board.isValidFlip(turnState, tiles, position, upperBound)) {
            upperBound = position;
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
     * @param {TileState} turnState The state to which tiles shall be flip
     * @param {Tile[]} tiles The tiles in the direction you are checking
     * @param {number} startFlip The lower bound of the tiles to flip
     * @param {number} endFlip The upper bound of the tiles to flip
     * @returns {bool} The validity of the flip
     */
    static isValidFlip(turnState, tiles, startFlip, endFlip) {
        // get the states of the tiles
        let states = tiles.map(e => e.getState);

        // if there is nothing to flip then it is not valid
        if(startFlip === endFlip) {
            return false;
        }

        // for every index in between bounds
        for(let i = 0; i < states.length; i++) {
            // if the index is in between the flip bounds and is EMPTY state or current state
            if(startFlip < i && i < endFlip && 
                (states[i] === TileState.EMPTY || states[i] === turnState || states[i] === TileState.POSSIBLE_PLACEMENT)) {
                // then it cannot be a valid flip
                return false;
            }
        }

        return true;
    }
}