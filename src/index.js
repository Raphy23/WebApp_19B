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

const firstBoard = [
    ['', 'A', '', ''],
    ['', '', 'B', ''],
    ['', '', '', 'A'],
    ['B', '', '', ''],
];

const secondBoard = [
    ['', 'A', '', ''],
    ['', 'A', 'B', ''],
    ['', '', '', 'A'],
    ['B', '', '', ''],
];

class Game {
    constructor(n) {
        this.n = n;
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
        this.currentPlayer = 'A';
        this.render();
    }

    nextTurn() {
        this.currentPlayer = this.currentPlayer === 'A' ? 'B' : 'A';
    }

    makeMove(y, x) {
        this.board = this.board.map((row, i) => row.map((cell, j) => {
            if (i === y && j === x) {
                return this.currentPlayer;
            }
            return cell;
        }));

        this.nextTurn();

        this.render();
    }

    handleCellClick(i) {
        const row = i === 0 ? 0 : Math.floor(i / this.n);
        const col = i === 0 ? 0 : i % this.n;
        
        this.makeMove(row, col, 'A');
    }

    render() {
        const parent = document.getElementById('game-board');
        parent.style.gridTemplateRows = `repeat(${this.n}, 1fr)`;
        parent.style.gridTemplateColumns = `repeat(${this.n}, 1fr)`;
        emptyElement(parent);

        this.board.flat()
            .map((cell, i) => {
                const cellElem = makeDiv('cell', !cell ? 'enabled' : undefined);

                if (!cell) {
                    cellElem.addEventListener('click', () => this.handleCellClick(i));
                }

                if (cell) {
                    const piece = makeDiv('piece', cell === 'A' ? 'black' : 'white');
                    cellElem.appendChild(piece);
                }

                return cellElem;
            })
            .forEach(cell => parent.appendChild(cell));
    }
}

const game = new Game(3);