import { IChessState, TChessBoard, TChessSide, IChessMove } from "../types"

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
    private history: {
        moves: IChessMove[]
        currentIndex: number
    }
    private kingsCoord: {
        w: [number, number]
        b: [number, number]
    }
    private castling: {
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
        this.history = {
            moves: [{
                encodedBoard: this.encodeBoard()
            }],
            currentIndex: 0
        }
        this.kingsCoord = { w: [w, 4], b: [b, 4] }
        this.castling = { w: true, b: true }
        this.winner = null
    }


    getLegalMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const AP = this.activePlayer
        const piece = this.board[X][Y]
        if (piece[0] !== AP[0]) return []

        let moves = this.getPotentialMoves([X, Y])

        for (let [A, B] of moves) {
            const save = this.encodeBoard()
            this._move([X, Y], [A, B])

            if (this.isCheck()) {
                moves = moves.filter(coord => {
                    return (coord[0] !== A || B !== coord[1])
                })
            }
            this.board = this.decodeBoard(save)
        }

        if (piece[1] === 'k')
            this.checkForCastling(piece[0] as 'w' | 'b', moves)

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

    canPlayerMove(side: 'w' | 'b') {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j][0] === side) {
                    const moves = this.getLegalMoves([i, j])
                    if (moves[0]) return true
                }
            }
        }
        return false
    }

    isCheck() {
        const side = this.activePlayer[0] as 'w' | 'b'
        const kingCoord = this.kingsCoord[side]
        return this.isPosEndangered(kingCoord)
    }

    checkForWinner() {
        const side = this.activePlayer[0] as 'w' | 'b'
        const hasLegalMoves = this.canPlayerMove(side)
        if (hasLegalMoves) return
        const check = this.isCheck()
        if (check) this.winner = side === 'w' ? 'black' : 'white'
        else this.winner = 'stalemate'
    }


    move(from: [number, number], to: [number, number]) {
        if (this.isOutOfBounds(from)) return
        if (this.isOutOfBounds(to)) return
        const [X, Y] = from
        const [A, B] = to
        const [piece, AP] = [this.board[X][Y], this.activePlayer]
        if (piece[0] !== AP[0]) return

        this._move(from, to)

        this.activePlayer = this.activePlayer === 'black' ? 'white' : 'black'
        this.history.moves.push({ encodedBoard: this.encodeBoard(), from, to })
        this.history.currentIndex += 1
        if (piece[1] === 'k' || piece[1] === 'r')
            this.castling[piece[0] as 'w' | 'b'] = false

        this.checkForWinner()
        if (this.winner) console.log(this.winner)
    }

    private encodeBoard() {
        let encodedBoard = ''
        this.board.forEach(row => row.forEach(piece => {
            encodedBoard += piece + '/'
        }))
        return encodedBoard
    }

    private decodeBoard(encodedBoard: string) {
        const pieces = encodedBoard.split('/', 64)
        const board = new Array(8).fill(null)
            .map(() => new Array(8).fill(null))

        pieces.forEach((piece, pieceIndex) => {
            const row = Math.floor(pieceIndex / 8)
            const column = pieceIndex % 8
            board[row][column] = piece
        })
        return board
    }

    forward() {
        const [moves, index] = [
            this.history.moves,
            this.history.currentIndex
        ]

        if (index + 1 === moves.length) return

        const decodedBoard = this.decodeBoard(
            moves[index + 1].encodedBoard
        )

        this.board = decodedBoard
        this.history.currentIndex += 1
    }

    backward() {
        const [moves, index] = [
            this.history.moves,
            this.history.currentIndex
        ]

        if (index === 0) return

        const decodedBoard = this.decodeBoard(
            moves[index - 1].encodedBoard
        )

        this.board = decodedBoard
        this.history.currentIndex -= 1
    }


    fastForward() {
        const moves = this.history.moves
        const decodedBoard = this.decodeBoard(
            moves.at(-1)!.encodedBoard
        )
        this.board = decodedBoard
        this.history.currentIndex = moves.length - 1
    }

    fastBackward() {
        const moves = this.history.moves
        const decodeBoard = this.decodeBoard(
            moves[0].encodedBoard
        )
        this.board = decodeBoard
        this.history.currentIndex = 0
    }


    private _move(from: [number, number], to: [number, number]) {
        const [X, Y] = from
        const [A, B] = to
        const piece = this.board[X][Y]

        if (piece[1] === 'p') {
            if (
                Y + 1 === B &&
                this.board[A][B] === 'ee'
            )
                this.board[X][Y + 1] = 'ee'

            if (
                Y - 1 === B &&
                this.board[A][B] === 'ee'
            )
                this.board[X][Y - 1] = 'ee'
        }

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
        if (!this.castling[side]) return
        if (side !== this.activePlayer[0]) return
        const rowIndex = this.topSidePlayer[0] === side ? 0 : 7

        if (
            this.board[rowIndex][5] === 'ee' &&
            this.board[rowIndex][6] === 'ee' &&
            !this.isPosEndangered([rowIndex, 5]) &&
            !this.isPosEndangered([rowIndex, 6])
        )
            list.push([rowIndex, 6])



        if (
            this.board[rowIndex][1] === 'ee' &&
            this.board[rowIndex][2] === 'ee' &&
            this.board[rowIndex][3] === 'ee' &&
            !this.isPosEndangered([rowIndex, 1]) &&
            !this.isPosEndangered([rowIndex, 2]) &&
            !this.isPosEndangered([rowIndex, 3])
        )
            list.push([rowIndex, 2])


    }

    private getPotentialMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const piece = this.board[X][Y]
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

    private isPosEndangered([A, B]: [number, number]) {
        const square = this.board[A][B]
        const AP = this.activePlayer
        let enemy
        if (square === 'ee') enemy = AP[0] === 'w' ? 'b' : 'w'
        else enemy = square[0] === 'w' ? 'b' : 'w'
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
        const enemy = piece[0] === 'w' ? 'b' : 'w'
        if (piece[1] !== 'p') return []

        if (board[X + i][Y] === 'ee') moves.push([X + i, Y])

        if (
            !this.isOutOfBounds([X + i, Y + 1]) &&
            board[X + i][Y + 1][0] === enemy
        )
            moves.push([X + i, Y + 1])

        if (
            !this.isOutOfBounds([X + i, Y - 1]) &&
            board[X + i][Y - 1][0] === enemy
        )
            moves.push([X + i, Y - 1])


        if (
            [1, 6].includes(X) &&
            board[X + i][Y] === 'ee' &&
            board[X + i + i][Y] === 'ee'
        )
            moves.push([X + i + i, Y])


        if (this.history.currentIndex === 0) return moves

        const lastMove = this.history.moves.at(-1)!
        const [A, B] = [lastMove.to![0], lastMove.to![1]]
        const C = lastMove.from![0]

        if (
            this.board[A][B] === `${enemy}p` &&
            A === X && B === Y + 1 &&
            Math.abs(A - C) === 2
        )
            moves.push([X + i, Y + 1])

        if (
            this.board[A][B] === `${enemy}p` &&
            A === X && B === Y - 1 &&
            Math.abs(A - C) === 2
        )
            moves.push([X + i, Y - 1])


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