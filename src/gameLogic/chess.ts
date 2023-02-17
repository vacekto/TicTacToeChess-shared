import { IChessState, TChessBoard, TChessSide } from "../types"

type TLinearDir = (COORD: [number, number], i: number) => [number, number]

type TKnightDir = (COORD: [number, number]) => [number, number]

type TDir = TLinearDir | TKnightDir

type TInitChessState = (
    topSidePlayer?: TChessSide,
) => IChessState

interface IPieceDirs {
    [key: string]: TDir[],
}

const isOutOfBounds = ([X, Y]: [number, number]) => (X < 0 || Y < 0 || X > 7 || Y > 7)

const diagonal: TLinearDir[] = [
    ([X, Y], i) => [X + i, Y + i],
    ([X, Y], i) => [X + i, Y - i],
    ([X, Y], i) => [X - i, Y + i],
    ([X, Y], i) => [X - i, Y - i],
]
const orthogonal: TLinearDir[] = [
    ([X, Y], i) => [X + i, Y],
    ([X, Y], i) => [X - i, Y],
    ([X, Y], i) => [X, Y + i],
    ([X, Y], i) => [X, Y - i],
]
const knight: TKnightDir[] = [
    ([X, Y]) => [X - 2, Y + 1],
    ([X, Y]) => [X - 2, Y - 1],
    ([X, Y]) => [X + 1, Y + 2],
    ([X, Y]) => [X - 1, Y + 2],
    ([X, Y]) => [X + 2, Y + 1],
    ([X, Y]) => [X + 2, Y - 1],
    ([X, Y]) => [X + 1, Y - 2],
    ([X, Y]) => [X - 1, Y - 2],
]

const pieceDirs: IPieceDirs = {
    k: [...diagonal, ...orthogonal],
    q: [...diagonal, ...orthogonal],
    r: orthogonal,
    b: diagonal,
    n: knight,
    p: []
}

export class ChessGame {
    private board: TChessBoard
    private topSidePlayer: TChessSide
    private activePlayer: TChessSide
    private kings: {
        w: [number, number]
        b: [number, number]
    }
    private winner: TChessSide | null | 'stalemate'


    get state() {
        return structuredClone({
            board: this.board,
            topSidePlayer: this.topSidePlayer,
            activePlayer: this.activePlayer,
            kings: this.kings,
            winner: this.winner
        })
    }


    constructor(topSidePlayer: TChessSide = 'black') {
        const [w, b] = topSidePlayer === 'black' ? [0, 7] : [7, 0]
        this.board = initChessBoard(topSidePlayer)
        this.activePlayer = 'white'
        this.topSidePlayer = topSidePlayer
        this.kings = { w: [w, 4], b: [b, 4] }
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


    private isKingEndangered() {
        const AP = this.activePlayer[0] as 'w' | 'b'
        const [X, Y] = this.kings[AP]

    }

    private getMovesInDir(moveInDir: TDir, [X, Y]: [number, number], limit: number) {
        const [piece, board] = [this.board[X][Y], this.board]
        const moves = []

        for (let i = 1; i < limit; i++) {
            const [A, B] = moveInDir([X, Y], i)
            if (isOutOfBounds([A, B]) || board[A][B][0] === piece[0]) break
            moves.push([A, B])
            if (board[A][B] !== 'ee') break
        }
        return moves
    }


    private addMoveIfLegal([X, Y]: [number, number], moveList: [number, number,][]) {
        if (isOutOfBounds([X, Y])) return
        if (this.board[X][Y][0] === this.activePlayer[0]) return
        moveList.push([X, Y])
    }

    private addMovesIfLegal(moves: [number, number][], moveList: [number, number][]) {
        moves.forEach(move => this.addMoveIfLegal(move, moveList))
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

        if (board[X + i][Y] === 'ee') {
            this.addMoveIfLegal([X + i, Y], moves)
        }

        /* is shorter always??
    
        [Y + i, Y - i].forEach((column) => {
            if (!isOutOfBounds([X + i, column])
                && board[X + i][column][0] !== piece[0]
                && board[X + i][column] !== 'ee'
            ) this.addMoveIfLegal([X + i, column], moves)
        })
        */

        if (!isOutOfBounds([X + i, Y + 1])
            && board[X + i][Y + 1][0] !== piece[0]
            && board[X + i][Y + 1] !== 'ee'
        ) this.addMoveIfLegal([X + i, Y + 1], moves)

        if (!isOutOfBounds([X + i, Y - 1])
            && board[X + i][Y - 1][0] !== piece[0]
            && board[X + i][Y - 1] !== 'ee'
        ) this.addMoveIfLegal([X + i, Y - 1], moves)


        if ([1, 6].includes(X)
            && board[X + i][Y] === 'ee'
            && board[X + i + i][Y] === 'ee'
        ) this.addMoveIfLegal([X + i + i, Y], moves)


        return moves
    }


    /*private getKnightMoves([X, Y]: [number, number]) {
        let moves: [number, number][] = []
        if (isOutOfBounds([X, Y])) moves
        const piece = this.board[X][Y]
        if (piece[1] !== 'n') moves

        for (let dir of pieceDirs[piece[1]]) {
            const movesInDir = this.getMovesInDir(dir, [X, Y]) as [number, number][]
            moves = [...moves, ...movesInDir]
        }
        return moves
    }*/

    private getKingMoves() {

    }

    getPotentialMoves([X, Y]: [number, number]) {
        if (isOutOfBounds([X, Y])) return []
        const piece = this.board[X][Y]

        if (piece[1] === 'p') {
            const moves = structuredClone(this.getPawnMoves([X, Y]))
            return moves as [number, number][]
        }

        let limit = 8
        if (piece[1] === 'n' || piece[1] === 'k') limit = 2
        let moves: number[][] = []
        for (let dir of pieceDirs[piece[1]]) {
            const movesInDir = this.getMovesInDir(dir, [X, Y], limit)
            moves = [...moves, ...movesInDir]
        }

        return structuredClone(moves) as [number, number][]
    }

    move([X, Y]: [number, number], [A, B]: [number, number]) {
        const originPiece = this.board[X][Y]
        if (originPiece[0] !== this.activePlayer[0]) return
        this.board[A][B] = this.board[X][Y]
        this.board[X][Y] = 'ee'
        this.activePlayer = this.activePlayer === 'black' ? 'white' : 'black'
    }

    resetState() {
        this.board = initChessBoard('black')
        this.activePlayer = 'white'
        this.topSidePlayer = 'black'
        this.kings = { w: [7, 4], b: [0, 4] }
        this.winner = null
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