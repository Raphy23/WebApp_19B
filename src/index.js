/*
    <div class="cell"></div>
    <div class="cell"></div>
    <div class="cell">
        <div class="piece black"></div>
    </div>
    <div class="cell">
        <div class="piece white"></div>
    </div>
    <div class="cell"></div>
    <div class="cell"></div>
    <div class="cell"></div>
    <div class="cell"></div>
    <div class="cell"></div>
*/

function makeDiv(...classes) {
    const div = document.createElement('div');
    classes
        .filter(cls => cls)
        .forEach(cls => div.classList.add(cls));
    return div;
}

function emptyElement(elem) {
    let temp = elem.firstChild;
    while (temp) {
        elem.removeChild(temp);
        temp = elem.firstChild;
    }
}

// const firstBoard = [
//     ['', 'A', '', ''],
//     ['', '', 'B', ''],
//     ['', '', '', 'A'],
//     ['B', '', '', ''],
// ];

// const secondBoard = [
//     ['', 'A', '', ''],
//     ['', 'A', 'B', ''],
//     ['', '', '', 'A'],
//     ['B', '', '', ''],
// ];

class Game {
    constructor(n) {
        this.n = n;
        this.board = Array(n).fill(Array(n).fill(''));
        this.currentPlayer = 'A';
        this.enabledCells = {};
        this.initGameBoard();
        this.populateEnabledCells();
        this.startTimer();
        this.render();
    }

    // playerBlack = {
    //     type = 'A',
    //     turns: 0,
    //     score: 0,
    //     avgerageDuration = 0
    // }

    destroy() {
        clearInterval(this.timerId);
        emptyElement(document.getElementById('game-board'));
        emptyElement(document.getElementById('elapsed-time'));
    }

    formatClock(seconds) {
        return `${Math.floor(seconds / 60)}:${seconds%60}`;
    }

    startTimer() {
        this.duration = 0;
        this.timerId = setInterval(() => {
            this.duration++;
            document.getElementById('elapsed-time').textContent = this.formatClock(this.duration);
        }, 1000);
    }

    initGameBoard(){
        this.placePiece(this.n/2 - 1, this.n/2 - 1, 'A');
        this.placePiece(this.n/2, this.n/2, 'A');
        this.placePiece(this.n/2, this.n/2 - 1, 'B');
        this.placePiece(this.n/2 - 1, this.n/2, 'B');
    }

    hasValidPath(x, y, step) {
        if (!this.isValidPosition(x + step.x, y + step.y)) {
            return false;
        }
        const dest = this.board[y + step.y][x + step.x];
        if (dest) {
            if (dest === this.currentPlayer) {
                if ((this.board[y][x] || this.currentPlayer) !== dest) {
                    return true;
                }
            } else {
                return this.hasValidPath(x + step.x, y + step.y, step);
            }
        }
        return false;
    }

    getDirections() {
        const dirs = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (y || x) {
                    dirs.push({x, y});
                }
            }
        }
        return dirs;
    }

    populateEnabledCells() {
        this.enabledCells = {};

        for (let x = 0; x < this.n; x++) {
            for (let y = 0; y < this.n; y++) {
                if (this.getDirections().some(dir => this.hasValidPath(x, y, dir))) {
                    this.enabledCells[`${x}*${y}`] = true;
                }
            }
        }
    }

    nextTurn() {
        this.currentPlayer = this.currentPlayer === 'A' ? 'B' : 'A';
    }

    placePiece(x, y, type){
        this.board = this.board.map((row, i) => row.map((cell, j) => {
            if (i === y && j === x) {
                return type;
            }
            return cell;
        }));
    }

    eatDirection(x, y, step) {
        if (!this.isValidPosition(x + step.x, y + step.y)) {
            return;
        }
        const dest = this.board[y + step.y][x + step.x];
        
        if (dest === this.currentPlayer) {
            return;
        }

        this.placePiece(x + step.x, y + step.y, this.currentPlayer);
        this.eatDirection(x + step.x, y + step.y, step);
    }

    makeMove(x, y) {
        this.placePiece(x, y, this.currentPlayer);

        this.getDirections().forEach(dir => {
            if (this.hasValidPath(x, y, dir)) {
                this.eatDirection(x, y, dir);
            }
        });

        this.nextTurn();
        this.populateEnabledCells();
        this.render();
    }

    // Enable the valid cells per the current board and per current user.
    validateCells(){

    }

    isValidPosition(x, y) {
        return (y >= 0 && y < this.n) && (x >= 0 && x < this.n);
    }

    render() {
        const parent = document.getElementById('game-board');
        parent.style.gridTemplateRows = `repeat(${this.n}, 1fr)`;
        parent.style.gridTemplateColumns = `repeat(${this.n}, 1fr)`;
        emptyElement(parent);
        parent.classList.remove('black', 'white');
        parent.classList.add(this.currentPlayer === 'A' ? 'black' : 'white');

        this.board.map(
            (row, y) => 
                row.map((cell, x) => {
                    const disabled = !this.enabledCells[`${x}*${y}`];

                    const cellElem = makeDiv('cell', disabled ? 'disabled' : undefined);

                    if (!disabled) {
                        cellElem.addEventListener('click', () => this.makeMove(x, y));
                    }

                    if (cell) {
                        const piece = makeDiv('piece', cell === 'A' ? 'black' : 'white');
                        cellElem.appendChild(piece);
                    }

                    return cellElem;
                })
        ).flat().forEach(cell => parent.appendChild(cell));
    }
}

let game = new Game(10);
