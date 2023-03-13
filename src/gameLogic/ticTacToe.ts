import {
    ITicTacToeMove,
    ITicTacToeState,
    TGameMove,
    TTicTacToeBoard,
    TTicTacToeSide,
} from '../types/types'

type TDir = (
    prevCOORD: [number, number]
) => [number, number]

type TCheckDir = (
    dir: TDir,
    prevMove: [number, number],
    side: TTicTacToeSide
) => [number, number]


export class TicTacToeGame {
    private board: TTicTacToeBoard
    private size: number
    private winCondition: number
    activePlayer: TTicTacToeSide
    winner: TTicTacToeSide | null | 'draw'
    winSegments: [[number, number], [number, number]][]

    constructor(size: number = 10, winCondition: number = 5, startingSide: TTicTacToeSide = 'O') {
        this.board = this.initNewBoard(size)
        this.size = size
        this.winCondition = winCondition
        this.activePlayer = startingSide
        this.winner = null
        this.winSegments = []
    }

    get state() {
        return structuredClone({
            board: this.board,
            activePlayer: this.activePlayer,
            winner: this.winner,
            winSegments: this.winSegments
        }) as ITicTacToeState
    }

    resetState() {
        this.board = this.initNewBoard(this.size)
        this.activePlayer = this.activePlayer === 'O' ? 'X' : 'O'
        this.winner = null
        this.winSegments = []
    }

    private dirs: TDir[][] = [
        [([x, y]) => [x + 1, y], ([x, y]) => [x - 1, y]],
        [([x, y]) => [x + 1, y + 1], ([x, y]) => [x - 1, y - 1]],
        [([x, y]) => [x, y + 1], ([x, y]) => [x, y - 1]],
        [([x, y]) => [x - 1, y + 1], ([x, y]) => [x + 1, y - 1]]
    ]

    private isOutOfBounds([A, B]: [number, number]) {
        if (
            A < 0 || A >= this.size ||
            B < 0 || B >= this.size
        )
            return true
        return false
    }

    private checkDir: TCheckDir = (dir, prevMove, side) => {
        const [X, Y] = dir(prevMove)
        if (this.isOutOfBounds([X, Y])) return prevMove
        if (this.board[X][Y] !== side) return prevMove
        return this.checkDir(dir, [X, Y], side)
    }

    private initNewBoard = (size: number) => {
        return new Array(size).fill(null).map(_ => {
            return new Array(size).fill(null)
        })
    }

    move: TGameMove = (move, side = this.activePlayer) => {
        const { X, Y } = move as ITicTacToeMove
        if (
            this.isOutOfBounds([X, Y]) ||
            this.winner
        )
            return

        this.board[X][Y] = side
        this.activePlayer = side === 'O' ? 'X' : 'O'
        this.checkForWinner([X, Y])
    }

    private isDraw() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.board[i][j]) return false
            }
        }
        return true
    }

    private checkForWinner(lastMove?: [number, number]) {
        if (this.isDraw()) {
            this.winner = 'draw'
            return
        }
        if (!lastMove) {
            for (let [row, rowIndex] of Object.entries(this.board)) {
                for (let [square, squareIndex] of Object.entries(row)) {
                    this.checkForWinner([+rowIndex, +squareIndex])
                }
            }
            return
        }

        if (this.isOutOfBounds(lastMove)) return
        const [X, Y] = lastMove

        if (this.board[X][Y] === null) return

        const player = this.board[X][Y] as TTicTacToeSide

        this.dirs.forEach(dir => {
            const [A, B] = this.checkDir(dir[0], [X, Y], player)
            const [C, D] = this.checkDir(dir[1], [X, Y], player)
            const sequenceLength = Math.max(Math.abs(A - C), Math.abs(B - D)) + 1
            if (sequenceLength >= this.winCondition) {
                this.winner = player
                this.winSegments.push([[A, B], [C, D]])
            }
        })
    }
}
