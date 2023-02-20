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
        this.winner = null
    }

    getPotentialMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const piece = this.board[X][Y]

        if (piece[1] === 'e') return []
        if (piece[1] === 'p') return this.getPawnMoves([X, Y])

        let limit = 8
        let moves: [number, number][] = []
        if (piece[1] === 'n' || piece[1] === 'k') limit = 2
        for (let dir of pieceDirs[piece[1]]) {
            const movesInDir = this.getMovesInDir(dir, [X, Y], limit)
            moves = [...moves, ...movesInDir]
        }

        return moves
    }

    getLegalMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const [piece, AP] = [this.board[X][Y], this.activePlayer]
        if (piece[0] !== AP[0]) return []

        let moves = this.getPotentialMoves([X, Y])
        for (let [A, B] of moves) {
            const save = this.board[A][B]
            this.move([X, Y], [A, B], false)
            if (this.isKingEndangered(piece[0] as ('w' | 'b'))) {
                moves = moves.filter(coord => {
                    return (coord[0] !== A || B !== coord[1])
                })
            }
            this.move([A, B], [X, Y], false)
            this.board[A][B] = save
        }

        return moves
    }

    isKingEndangered(side: 'w' | 'b') {
        const [A, B] = this.kingsCoord[side]
        let moves: [number, number][]
        const enemy = side === 'w' ? 'b' : 'w'
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

    move(moveFrom: [number, number], moveTo: [number, number], toggleActivePlayer: boolean = true) {
        const [X, Y] = moveFrom
        const [A, B] = moveTo
        const [piece, AP] = [this.board[X][Y], this.activePlayer]
        this.board[A][B] = piece
        this.board[X][Y] = 'ee'
        if (piece[1] === 'k') this.kingsCoord[piece[0] as ('w' | 'b')] = [A, B]
        if (toggleActivePlayer) this.toggleActivePlayer()

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

    private isOutOfBounds([X, Y]: [number, number]) {
        return (X < 0 || Y < 0 || X > 7 || Y > 7)
    }

    private toggleActivePlayer() {
        this.activePlayer = this.activePlayer === 'black' ? 'white' : 'black'
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
        try {

            if (board[X + i][Y] === 'ee') {
                moves.push([X + i, Y])
            }
        } catch (err) {
            console.error('error! coord: ', X, Y)
            throw err
        }

        if (!this.isOutOfBounds([X + i, Y + 1])
            && board[X + i][Y + 1][0] !== piece[0]
            && board[X + i][Y + 1] !== 'ee'
        ) moves.push([X + i, Y + 1])

        if (!this.isOutOfBounds([X + i, Y - 1])
            && board[X + i][Y - 1][0] !== piece[0]
            && board[X + i][Y - 1] !== 'ee'
        ) moves.push([X + i, Y - 1])


        if ([1, 6].includes(X)
            && board[X + i][Y] === 'ee'
            && board[X + i + i][Y] === 'ee'
        ) moves.push([X + i + i, Y])


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