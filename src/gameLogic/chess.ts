import { IChessState, TChessBoard, TChessSide, IChessMove, TChessPiece } from "../types/types"

type TDir = (COORD: [number, number], i: number) => [number, number]

interface IPieceDirs {
    [key: string]: TDir[],
}

export class ChessGame {
    private board: TChessBoard
    private activePlayer: TChessSide
    private winner: TChessSide | null | 'draw'
    private castlingAvailable: {
        w: {
            left: boolean
            right: boolean
        }
        b: {
            left: boolean
            right: boolean
        }
    }
    private lastMove?: {
        from: [number, number]
        to: [number, number]
    }
    private figuresTaken: {
        w: TChessPiece[],
        b: TChessPiece[]
    }

    private history: {
        stateList: IChessState[]
        currentIndex: number
    }

    private halfmoveClock: number

    convertCoord: {
        numericToConventional: (coord: [number, number]) => string,
        conventionalToNumeric: (coord: string) => [number, number]
    }

    get state() {
        return structuredClone({
            board: this.board,
            activePlayer: this.activePlayer,
            winner: this.winner,
            figuresTaken: this.figuresTaken,
            lastMove: this.lastMove,
            castlingAvailable: this.castlingAvailable,
        }) as IChessState
    }

    constructor() {

        this.board = this.createBoard()
        this.activePlayer = 'w'
        this.castlingAvailable = {
            w: {
                left: true,
                right: true
            }, b: {
                left: true,
                right: true
            }
        }
        this.winner = null
        this.figuresTaken = {
            b: [],
            w: []
        }
        this.history = {
            stateList: [this.createDefaulState()],
            currentIndex: 0
        }
        this.halfmoveClock = 0
        this.convertCoord = (() => {
            const boardLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

            return {
                numericToConventional: ([X, Y]: [number, number]) => {
                    return (boardLetters[Y] + String(7 - X + 1))
                },

                conventionalToNumeric: (coord: string) => {
                    return [7 - (+coord[1] - 1), boardLetters.indexOf(coord[0])] as [number, number]
                }
            }
        })()

    }

    getFEN() {

        let positions = ''
        this.board.forEach((row, rowIndex) => {
            let emptyCount = 0

            row.forEach(square => {
                if (square === 'ee') {
                    emptyCount++
                    return
                }
                let piece = square[0] === 'b' ? square[1] : square[1].toUpperCase()
                if (emptyCount > 0) piece = emptyCount + piece
                positions += piece
                emptyCount = 0
            })

            if (emptyCount > 0) positions += emptyCount
            if (rowIndex !== 7) positions += '/'
        })


        let castling = ''
        if (this.castlingAvailable.w.right) castling += 'K'
        if (this.castlingAvailable.w.left) castling += 'Q'
        if (this.castlingAvailable.w.right) castling += 'k'
        if (this.castlingAvailable.w.left) castling += 'q'
        if (!castling) castling = '-'


        let enPassant = '-'
        if (this.lastMove) {
            const [X, Y] = this.lastMove.to
            const distance = Math.abs(X - this.lastMove.from[0])
            if (
                this.board[X][Y][1] === 'p' &&
                distance === 2
            ) {
                const coord: [number, number] = this.activePlayer === 'b' ? [5, Y] : [2, Y]
                enPassant = this.convertCoord.numericToConventional(coord)
            }
        }

        return `${positions} ${this.activePlayer} ${castling} ${enPassant} ${this.halfmoveClock} ${this.history.currentIndex % 2}`
    }

    getLegalMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const AP = this.activePlayer
        const piece = this.board[X][Y]
        if (piece[0] !== AP[0]) return []

        let moves = this.getPotentialMoves([X, Y])
        const boardSave = this.encodeBoard()

        for (let [A, B] of moves) {
            this._move([X, Y], [A, B])

            if (this.isCheck()) {
                moves = moves.filter(coord => {
                    return (coord[0] !== A || coord[1] !== B)
                })
            }

            this.board = this.decodeBoard(boardSave)
        }

        if (piece[1] === 'k')
            this.checkForCastling(piece[0] as 'w' | 'b', moves)

        return moves
    }

    move(move: IChessMove) {
        const { from, to } = move
        const [X, Y] = from
        const [A, B] = to

        if (this.isOutOfBounds([X, Y])) return
        if (this.isOutOfBounds([A, B])) return

        const legalMoves = this.getLegalMoves([X, Y])
        let isLegal = false

        for (const [C, D] of legalMoves) {
            if (C === A && D === B) {
                isLegal = true
                break
            }
        }

        if (!isLegal) return

        const side = this.board[X][Y][0] as TChessSide
        const piece = this.board[X][Y][1]
        const opponent = side === 'w' ? 'b' : 'w' as TChessSide

        if (opponent === this.activePlayer) return
        if (piece === 'e') return

        let pieceCaptured = this.board[A][B]

        // checks here for En Passant move
        if (
            piece === 'p' &&
            Y + 1 === B &&
            this.board[A][B] === 'ee'
        ) {
            pieceCaptured = this.board[X][Y + 1]
            this.board[X][Y + 1] = 'ee'
        }

        if (
            piece === 'p' &&
            Y - 1 === B &&
            this.board[A][B] === 'ee'
        ) {
            pieceCaptured = this.board[X][Y - 1]
            this.board[X][Y - 1] = 'ee'
        }

        this._move([X, Y], [A, B])

        if (piece === 'p' || pieceCaptured !== 'ee')
            this.halfmoveClock = 0

        this.activePlayer = this.activePlayer === 'b' ? 'w' : 'b'

        if (pieceCaptured !== 'ee')
            this.figuresTaken[opponent].push(pieceCaptured)

        this.lastMove = { from, to }

        if (piece === 'k') {
            this.castlingAvailable[side].left = false
            this.castlingAvailable[side].right = false
        }

        if (piece === 'r' && Y === 0)
            this.castlingAvailable[side].left = false

        if (piece === 'r' && Y === 7)
            this.castlingAvailable[side].right = false

        this.checkForWinner()

        const newState = this.state
        this.history.stateList.push(newState)
        this.history.currentIndex += 1

    }

    resetState() {
        this.board = this.createBoard()
        this.activePlayer = 'w'
        this.castlingAvailable = {
            w: {
                left: true,
                right: true
            },
            b: {
                left: true,
                right: true
            }
        }
        this.winner = null
        this.figuresTaken = {
            b: [],
            w: []
        }

        this.history = {
            stateList: [this.createDefaulState()],
            currentIndex: 0
        }
        delete this.lastMove
    }

    updateState(state: IChessState, addToHistory?: boolean) {
        const stateClone = structuredClone(state)
        this.board = stateClone.board
        this.activePlayer = stateClone.activePlayer
        this.figuresTaken = stateClone.figuresTaken
        this.lastMove = stateClone.lastMove
        this.castlingAvailable = stateClone.castlingAvailable

        if (!addToHistory) return

        const index = ++this.history.currentIndex
        this.history.stateList.splice(index, Infinity, state)
    }

    forward() {
        const newIndex = this.history.currentIndex + 1
        if (newIndex === this.history.stateList.length) return
        this.history.currentIndex += 1
        const state = this.history.stateList[newIndex]
        this.updateState(state)
    }

    backward() {
        const newIndex = this.history.currentIndex - 1
        if (newIndex === -1) return
        this.history.currentIndex -= 1
        const state = this.history.stateList[newIndex]
        this.updateState(state)
    }


    fastForward() {
        const newIndex = this.history.stateList.length - 1
        this.history.currentIndex = newIndex
        const state = this.history.stateList[newIndex]
        this.updateState(state)
    }

    fastBackward() {
        const state = this.history.stateList[0]
        this.history.currentIndex = 0
        this.updateState(state)
    }

    private canPlayerMove(side: 'w' | 'b') {
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

    private isCheck() {
        const side = this.activePlayer[0] as 'w' | 'b'
        const kingCoord = this.getKingCoord(side) as [number, number]
        return this.isPosEndangered(kingCoord)
    }

    private checkForWinner() {
        const APSide = this.activePlayer[0] as 'w' | 'b'
        const hasLegalMoves = this.canPlayerMove(APSide)
        if (hasLegalMoves) return
        const check = this.isCheck()
        if (check) this.winner = APSide === 'w' ? 'b' : 'w'
        else this.winner = 'draw'
    }


    encodeBoard() {
        let encodedBoard = ''
        this.board.forEach(row => row.forEach(piece => {
            encodedBoard += piece + '/'
        }))
        return encodedBoard
    }

    decodeBoard(encodedBoard: string) {
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


    private _move(from: [number, number], to: [number, number]) {
        const [X, Y] = from
        const [A, B] = to
        const movingPiece = this.board[X][Y]

        this.board[A][B] = movingPiece
        this.board[X][Y] = 'ee'

        if (
            movingPiece === 'wp' &&
            A === 0
        )
            this.board[A][B] = 'wq'

        if (
            movingPiece === 'bp' &&
            A === 7
        )
            this.board[A][B] = 'bq'

        if (movingPiece[1] === 'k' && X === A) {
            if (Y - B === -2) this._move([X, 7], [X, 5])
            if (Y - B === 2) this._move([X, 0], [X, 3])
        }
    }

    private getKingCoord(side: 'w' | 'b') {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === `${side}k`)
                    return [i, j]
            }
        }
    }

    private checkForCastling(side: 'w' | 'b', list: [number, number][]) {
        if (side !== this.activePlayer[0]) return

        const rowIndex = 'b' === side ? 0 : 7

        if (
            this.castlingAvailable[side].right &&
            this.board[rowIndex][5] === 'ee' &&
            this.board[rowIndex][6] === 'ee' &&
            this.board[rowIndex][7] === `${side}r` &&
            !this.isPosEndangered([rowIndex, 4]) &&
            !this.isPosEndangered([rowIndex, 5]) &&
            !this.isPosEndangered([rowIndex, 6])
        )
            list.push([rowIndex, 6])

        if (
            this.castlingAvailable[side].left &&
            this.board[rowIndex][0] === `${side}r` &&
            this.board[rowIndex][1] === 'ee' &&
            this.board[rowIndex][2] === 'ee' &&
            this.board[rowIndex][3] === 'ee' &&
            !this.isPosEndangered([rowIndex, 1]) &&
            !this.isPosEndangered([rowIndex, 2]) &&
            !this.isPosEndangered([rowIndex, 3]) &&
            !this.isPosEndangered([rowIndex, 4])
        )
            list.push([rowIndex, 2])


    }

    private getPotentialMoves([X, Y]: [number, number]) {
        if (this.isOutOfBounds([X, Y])) return []
        const piece = this.board[X][Y]
        let moveLimit = 8
        let moves: [number, number][] = []

        if (piece[1] === 'e') return []
        if (piece[1] === 'p') return this.getPawnPotentialMoves([X, Y])

        if (
            piece[1] === 'n' ||
            piece[1] === 'k'
        )
            moveLimit = 2

        for (let dir of this.pieceDirs[piece[1]]) {
            const movesInDir = this.getMovesInDir(dir, [X, Y], moveLimit)
            moves = [...moves, ...movesInDir]
        }


        return moves
    }

    private isPosEndangered([A, B]: [number, number]) {
        const square = this.board[A][B]
        const AP = this.activePlayer
        let enemy: TChessSide
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


    private getPawnPotentialMoves([X, Y]: [number, number]) {
        const moves: [number, number][] = []
        const board = this.board
        const piece = this.board[X][Y]

        if (piece[1] !== 'p') return []
        const i = piece[0] === 'b' ? 1 : -1
        const enemy = piece[0] === 'b' ? 'w' : 'b'

        if (!this.isOutOfBounds([X + i, Y]) &&
            board[X + i][Y] === 'ee'
        )
            moves.push([X + i, Y])

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
            (
                (piece[0] === 'w' && X === 6) ||
                (piece[0] === 'b' && X === 1)
            ) &&
            board[X + i][Y] === 'ee' &&
            board[X + 2 * i][Y] === 'ee'
        )
            moves.push([X + 2 * i, Y])


        if (this.history.currentIndex === 0) return moves


        const [A, B] = this.lastMove!.to
        const C = this.lastMove!.from[0]

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

    private createBoard() {
        const board: TChessBoard = new Array(8).fill(null)
            .map(() => new Array(8).fill('ee'))


        board[7][0] = 'wr'
        board[7][1] = 'wn'
        board[7][2] = 'wb'
        board[7][3] = 'wq'
        board[7][4] = 'wk'
        board[7][5] = 'wb'
        board[7][6] = 'wn'
        board[7][7] = 'wr'
        for (let k = 0; k < 8; k++) board[6][k] = 'wp'

        board[0][0] = 'br'
        board[0][1] = 'bn'
        board[0][2] = 'bb'
        board[0][3] = 'bq'
        board[0][4] = 'bk'
        board[0][5] = 'bb'
        board[0][6] = 'bn'
        board[0][7] = 'br'
        for (let k = 0; k < 8; k++) board[1][k] = 'bp'

        return board
    }

    private createDefaulState = () => {
        return structuredClone({
            board: this.createBoard(),
            activePlayer: 'w',
            castlingAvailable: {
                w: {
                    left: true,
                    right: true
                },
                b: {
                    left: true,
                    right: true
                }
            },
            winner: null,
            figuresTaken: {
                b: [],
                w: []
            }
        })
    }

    private diagonal: TDir[] = [
        ([X, Y], i) => [X + i, Y + i],
        ([X, Y], i) => [X + i, Y - i],
        ([X, Y], i) => [X - i, Y + i],
        ([X, Y], i) => [X - i, Y - i],
    ]
    private orthogonal: TDir[] = [
        ([X, Y], i) => [X + i, Y],
        ([X, Y], i) => [X - i, Y],
        ([X, Y], i) => [X, Y + i],
        ([X, Y], i) => [X, Y - i],
    ]
    private knight: TDir[] = [
        ([X, Y], i) => [X - 2 * i, Y + 1 * i],
        ([X, Y], i) => [X - 2 * i, Y - 1 * i],
        ([X, Y], i) => [X + 1 * i, Y + 2 * i],
        ([X, Y], i) => [X - 1 * i, Y + 2 * i],
        ([X, Y], i) => [X + 2 * i, Y + 1 * i],
        ([X, Y], i) => [X + 2 * i, Y - 1 * i],
        ([X, Y], i) => [X + 1 * i, Y - 2 * i],
        ([X, Y], i) => [X - 1 * i, Y - 2 * i],
    ]

    private pieceDirs: IPieceDirs = {
        k: [...this.diagonal, ...this.orthogonal],
        q: [...this.diagonal, ...this.orthogonal],
        r: this.orthogonal,
        b: this.diagonal,
        n: this.knight,
        p: [],
        e: []
    }

}
