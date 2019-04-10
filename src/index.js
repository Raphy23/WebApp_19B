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

function formatClock(seconds) {
    if (seconds%60 < 10){
        return `${Math.floor(seconds / 60)}:0${seconds%60}`;
    }
    else{
        return `${Math.floor(seconds / 60)}:${seconds%60}`;
    }
}

function getDirections() {
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


function Player(type, turns, score, numOf2DisksLeft){
    this.score = score;
    this.turns = turns;
    this.averageDuration = 0;
    this.type = type;
    this.numOf2DisksLeft = numOf2DisksLeft;
    this.turnStartTime = 0;
}

function getDocElementById(id) {
    return document.getElementById(id);
}

class Game {
    constructor(n) {
        this.n = n;
        this.board = Array(n).fill(Array(n).fill(''));
        this.playerBlack = new Player('A', 0, 2, 1);
        this.playerWhite = new Player('B', 0, 2, 1);
        this.currentPlayer = this.playerBlack; //'A';
        this.enabledCells = {};
        this.initGameBoard();
        this.populateEnabledCells();
        this.startTimer();
        this.render();
    }

    destroy() {
        clearInterval(this.timerId);
        emptyElement(getDocElementById('game-board'));
        emptyElement(getDocElementById('elapsed-time'));
    }

    updateScoreStats() {
        getDocElementById('white-score').textContent = this.playerWhite.score;
        getDocElementById('black-score').textContent = this.playerBlack.score;
        if (this.playerWhite.score === 2){
            this.playerWhite.numOf2DisksLeft += 1;
            getDocElementById('white-2-disks-left').textContent = this.playerWhite.numOf2DisksLeft;
        }
        if (this.playerBlack.score === 2){
            this.playerBlack.numOf2DisksLeft += 1;
            getDocElementById('black-2-disks-left').textContent = this.playerBlack.numOf2DisksLeft;
        }
    }

    updateTurns() {
        if (this.currentPlayer === this.playerBlack) {
            let id = 'black-turns-count';
            getDocElementById(id).textContent = this.currentPlayer.turns;
            id = 'black-turns-avg';
            getDocElementById(id).textContent = this.currentPlayer.averageDuration.toFixed(2);
        }
        else{
            let id = 'white-turns-count';
            getDocElementById(id).textContent = this.currentPlayer.turns;
            id = 'white-turns-avg';
            getDocElementById(id).textContent = this.currentPlayer.averageDuration.toFixed(2);
        }
    }

    updateStatsBoard() {
        this.updateTurns();
        this.updateScoreStats();
    }

    updatePlayerAverageTime() {
        let elapsedTurnTime = this.duration - this.currentPlayer.turnStartTime;
        this.currentPlayer.averageDuration = 
            this.currentPlayer.averageDuration + ((elapsedTurnTime - this.currentPlayer.averageDuration) / this.currentPlayer.turns);
    }

    startTimer() {
        this.duration = 0;
        this.timerId = setInterval(() => {
            this.duration++;
            getDocElementById('elapsed-time').textContent = formatClock(this.duration);
        }, 1000);
    }

    initGameBoard(){
        this.placePiece(this.n/2 - 1, this.n/2 - 1, 'A');
        this.placePiece(this.n/2, this.n/2, 'A');
        this.placePiece(this.n/2, this.n/2 - 1, 'B');
        this.placePiece(this.n/2 - 1, this.n/2, 'B');
    }

    

    checkEndGameCondition(){

    }

    hasValidPath(x, y, step) {
        if (!this.isValidPosition(x + step.x, y + step.y)) {
            return false;
        }
        const dest = this.board[y + step.y][x + step.x];
        if (dest) {
            if (dest === this.currentPlayer.type) {
                if ((this.board[y][x] || this.currentPlayer.type) !== dest) {
                    return true;
                }
            } else {
                return this.hasValidPath(x + step.x, y + step.y, step);
            }
        }
        return false;
    }

    getOppositePlayer() {
        return this.currentPlayer === this.playerBlack ? this.playerWhite : this.playerBlack;
    }

    populateEnabledCells() {
        this.enabledCells = {};

        for (let x = 0; x < this.n; x++) {
            for (let y = 0; y < this.n; y++) {
                if (getDirections().some(dir => this.hasValidPath(x, y, dir))) {
                    this.enabledCells[`${x}*${y}`] = true;
                }
            }
        }
    }

    nextTurn() {
        this.currentPlayer = this.currentPlayer === this.playerBlack ? this.playerWhite : this.playerBlack;
        this.currentPlayer.turnStartTime = this.duration.valueOf();
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
        
        if (dest === this.currentPlayer.type) {
            return;
        }

        this.placePiece(x + step.x, y + step.y, this.currentPlayer.type);
        this.currentPlayer.score += 1;
        this.getOppositePlayer().score -= 1;

        this.eatDirection(x + step.x, y + step.y, step);
    }

    makeMove(x, y) {
        this.placePiece(x, y, this.currentPlayer.type);
        this.currentPlayer.score += 1;

        getDirections().forEach(dir => {
            if (this.hasValidPath(x, y, dir)) {
                this.eatDirection(x, y, dir);
            }
        });

        this.currentPlayer.turns += 1;
        this.updatePlayerAverageTime();
        this.updateStatsBoard();
        this.nextTurn();
        this.populateEnabledCells();
        this.render();
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
        parent.classList.add(this.currentPlayer.type === 'A' ? 'black' : 'white');

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
