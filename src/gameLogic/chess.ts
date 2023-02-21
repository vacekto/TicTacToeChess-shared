import { IChessState, TChessBoard, TChessSide } from "../types"

type TDir = (COORD: [number, number], i: number) => [number, number]
interface IPieceDirs {
    [key: string]: TDir[],
}
const diagonal: TDir[] = [
    ([X, Y], i) => [X + i, Y + i],
    ([X, Y], i) => [X + i, Y - i],
    ([X, Y], i) => [X - i, Y + i],
    ([X, Y], i) => [X - i, Y - i],
]
const orthogonal: TDir[] = [
    ([X, Y], i) => [X + i, Y],
    ([X, Y], i) => [X - i, Y],
    ([X, Y], i) => [X, Y + i],
    ([X, Y], i) => [X, Y - i],
]
const knight: TDir[] = [
    ([X, Y], i) => [X - 2 * i, Y + 1 * i],
    ([X, Y], i) => [X - 2 * i, Y - 1 * i],
    ([X, Y], i) => [X + 1 * i, Y + 2 * i],
    ([X, Y], i) => [X - 1 * i, Y + 2 * i],
    ([X, Y], i) => [X + 2 * i, Y + 1 * i],
    ([X, Y], i) => [X + 2 * i, Y - 1 * i],
    ([X, Y], i) => [X + 1 * i, Y - 2 * i],
    ([X, Y], i) => [X - 1 * i, Y - 2 * i],
]

const pieceDirs: IPieceDirs = {
    k: [...diagonal, ...orthogonal],
    q: [...diagonal, ...orthogonal],
    r: orthogonal,
    b: diagonal,
    n: knight,
    p: [],
    e: []
}

export class ChessGame {
    private board: TChessBoard
    private topSidePlayer: TChessSide
    private activePlayer: TChessSide
    private kingsCoord: {
        w: [number, number]
        b: [number, number]
    }
    private canCastle: {
        w: boolean
        b: boolean
    }
    private winner: TChessSide | null | 'stalemate'

    get state() {
        return structuredClone({
            board: this.board,
            topSidePlayer: this.topSidePlayer,
            activePlayer: this.activePlayer,
            kingsCoord: this.kingsCoord,
            winner: this.winner
        }) as IChessState
    }

    constructor(topSidePlayer: TChessSide = 'black') {
        const [w, b] = topSidePlayer === 'black' ? [7, 0] : [0, 7]
        this.board = initChessBoard(topSidePlayer)
        this.activePlayer = 'white'
        this.topSidePlayer = topSidePlayer
        this.kingsCoord = { w: [w, 4], b: [b, 4] }
        this.canCastle = { w: true, b: true }
        this.winner = null
    }

    getLegalMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const AP = this.activePlayer
        const piece = this.board[X][Y]
        if (piece[0] !== AP[0]) return []
        const side = piece[0] as 'w' | 'b'
        const enemy = side === 'b' ? 'w' : 'b'
        const kingCoord = this.kingsCoord[side]
        const boardSave = this.board

        let moves = this.getPotentialMoves([X, Y])
        if (piece[1] === 'k')
            this.checkForCastling(side, moves)
        for (let [A, B] of moves) {
            const copy = structuredClone(boardSave)
            this.board = copy as TChessBoard

            this._move([X, Y], [A, B])

            if (this.isPosEndangered(kingCoord, enemy)) {
                moves = moves.filter(coord => {
                    return (coord[0] !== A || B !== coord[1])
                })
            }

        }
        this.board = boardSave

        return moves
    }

    resetState() {
        this.board = initChessBoard('black')
        this.activePlayer = 'white'
        this.topSidePlayer = 'black'
        this.kingsCoord = { w: [7, 4], b: [0, 4] }
        this.winner = null
    }

    flip() {
        const copy = new Array(7).fill(null)
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j]) {
                    copy[7 - i][j] = this.board[i][j]
                }
            }
        }

        this.topSidePlayer = this.topSidePlayer === 'black' ? 'white' : 'black'
        this.board = copy
    }

    doesPlayerHaveMovesLeft(side: 'w' | 'b') {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j]
                if (piece[0] === side) {
                    const moves = this.getLegalMoves([i, j])
                    if (moves[0]) return true
                }
            }
        }
        return false
    }

    isCheck() {

    }

    isCheckMate() {

    }
    /*
        checkForWinner() {
            const side = this.activePlayer[0] as 'w' | 'b'
            const canMove = this.canPlayerMove(side)
            if (canMove) return
            const check = this.isPosEndangered(side)
            if (check) {
                console.log('')
                this.winner = this.activePlayer === 'black' ? 'white' : 'black'
                console.log(this.winner + ' wins!')
                return
            }
            console.log('stalemate')
            this.winner = 'stalemate'
    
        }*/


    move(moveFrom: [number, number], moveTo: [number, number]) {
        if (this.isOutOfBounds(moveFrom)) return
        if (this.isOutOfBounds(moveTo)) return
        const [X, Y] = moveFrom
        const [piece, AP] = [this.board[X][Y], this.activePlayer]
        if (piece[0] !== AP[0]) return
        this._move(moveFrom, moveTo)
        this.activePlayer = this.activePlayer === 'black' ? 'white' : 'black'
    }

    private _move(moveFrom: [number, number], moveTo: [number, number]) {
        const [X, Y] = moveFrom
        const [A, B] = moveTo
        const piece = this.board[X][Y]
        this.board[A][B] = piece
        this.board[X][Y] = 'ee'
        if (piece[1] === 'k') {
            this.kingsCoord[piece[0] as ('w' | 'b')] = [A, B]
            if (X === A) {
                if (Y - B === -2) this._move([X, 7], [X, 5])
                if (Y - B === 2) this._move([X, 0], [X, 3])
            }

        }
    }

    private checkForCastling(side: 'w' | 'b', list: [number, number][]) {
        if (!this.canCastle[side]) return
        if (side !== this.activePlayer[0]) return
        const rowIndex = this.topSidePlayer[0] === side ? 0 : 7
        const enemy = side === 'b' ? 'w' : 'b'

        if (
            this.board[rowIndex][5] === 'ee' &&
            this.board[rowIndex][6] === 'ee' &&
            !this.isPosEndangered([rowIndex, 5], enemy) &&
            !this.isPosEndangered([rowIndex, 6], enemy)
        )
            list.push([rowIndex, 6])

        if (
            this.board[rowIndex][1] === 'ee' &&
            this.board[rowIndex][2] === 'ee' &&
            this.board[rowIndex][3] === 'ee' &&
            !this.isPosEndangered([rowIndex, 1], enemy) &&
            !this.isPosEndangered([rowIndex, 2], enemy) &&
            !this.isPosEndangered([rowIndex, 3], enemy)
        )
            list.push([rowIndex, 2])

    }

    private getPotentialMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const piece = this.board[X][Y]
        const AP = this.activePlayer
        const side = piece[0] as 'w' | 'b'
        let limit = 8
        let moves: [number, number][] = []

        if (piece[1] === 'e') return []
        if (piece[1] === 'p') return this.getPawnMoves([X, Y])


        if (
            piece[1] === 'n' ||
            piece[1] === 'k'
        )
            limit = 2

        for (let dir of pieceDirs[piece[1]]) {
            const movesInDir = this.getMovesInDir(dir, [X, Y], limit)
            moves = [...moves, ...movesInDir]
        }

        return moves
    }

    private isPosEndangered([A, B]: [number, number], enemy: 'w' | 'b') {
        let moves: [number, number][]
        for (const [X, row] of Object.entries(this.board)) {
            for (const [Y, square] of Object.entries(row)) {
                if (square[0] === enemy) {
                    moves = this.getPotentialMoves([+X, +Y])
                    for (let move of moves) {
                        if (move[0] === A && move[1] === B) return true
                    }
                }
            }
        }
        return false
    }

    private isOutOfBounds([X, Y]: [number, number]) {
        return (X < 0 || Y < 0 || X > 7 || Y > 7)
    }

    private getMovesInDir(moveInDir: TDir, [X, Y]: [number, number], limit: number) {
        const [piece, board] = [this.board[X][Y], this.board]
        const moves: [number, number][] = []

        for (let i = 1; i < limit; i++) {
            const [A, B] = moveInDir([X, Y], i)
            if (this.isOutOfBounds([A, B])) break
            if (board[A][B][0] === piece[0]) break
            moves.push([A, B])
            if (board[A][B] !== 'ee') break
        }
        return moves
    }


    private getPawnMoves([X, Y]: [number, number]) {
        const moves: [number, number][] = []
        const [board, piece, topSide] = [
            this.board,
            this.board[X][Y],
            this.topSidePlayer
        ]
        const i = piece[0] === topSide[0] ? 1 : -1
        if (piece[1] !== 'p') return []


        if (board[X + i][Y] === 'ee') moves.push([X + i, Y])

        if (
            !this.isOutOfBounds([X + i, Y + 1]) &&
            board[X + i][Y + 1][0] !== piece[0] &&
            board[X + i][Y + 1] !== 'ee'
        )
            moves.push([X + i, Y + 1])

        if (
            !this.isOutOfBounds([X + i, Y - 1]) &&
            board[X + i][Y - 1][0] !== piece[0] &&
            board[X + i][Y - 1] !== 'ee'
        )
            moves.push([X + i, Y - 1])


        if (
            [1, 6].includes(X) &&
            board[X + i][Y] === 'ee' &&
            board[X + i + i][Y] === 'ee'
        )
            moves.push([X + i + i, Y])


        return moves
    }

}

export const initChessBoard = (topSidePlayer: TChessSide) => {
    const board: TChessBoard = [];
    for (let i = 0; i < 8; i++) {
        board[i] = []
        for (let j = 0; j < 8; j++) {
            board[i][j] = 'ee'
        }
    }

    const [w, b] = topSidePlayer === 'black' ? [7, 0] : [0, 7]
    const i = topSidePlayer === 'black' ? -1 : 1


    board[w][0] = 'wr'
    board[w][1] = 'wn'
    board[w][2] = 'wb'
    board[w][3] = 'wq'
    board[w][4] = 'wk'
    board[w][5] = 'wb'
    board[w][6] = 'wn'
    board[w][7] = 'wr'
    for (let k = 0; k < 8; k++) board[w + i][k] = 'wp'

    board[b][0] = 'br'
    board[b][1] = 'bn'
    board[b][2] = 'bb'
    board[b][3] = 'bq'
    board[b][4] = 'bk'
    board[b][5] = 'bb'
    board[b][6] = 'bn'
    board[b][7] = 'br'
    for (let k = 0; k < 8; k++) board[b - i][k] = 'bp'

    return board
}