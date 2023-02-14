import { IChessState, TChessBoard, TChessSide } from "../types"

export const initChessBoard = (bottomSide: TChessSide) => {
    const board: TChessBoard = [];
    for (let i = 0; i < 8; i++) {
        board[i] = []
        for (let j = 0; j < 8; j++) {
            board[i][j] = null
        }
    }

    const [w, b] = bottomSide === 'black' ? [0, 7] : [7, 0]

    board[w][0] = 'wr'
    board[w][1] = 'wn'
    board[w][2] = 'wb'
    board[w][3] = 'wq'
    board[w][4] = 'wk'
    board[w][5] = 'wb'
    board[w][6] = 'wn'
    board[w][7] = 'wr'
    for (let k = 0; k < 8; k++) board[w][k] = 'wp'

    board[b][0] = 'br'
    board[b][1] = 'bn'
    board[b][2] = 'bb'
    board[b][3] = 'bq'
    board[b][4] = 'bk'
    board[b][5] = 'bb'
    board[b][6] = 'bn'
    board[b][7] = 'br'
    for (let k = 0; k < 8; k++) board[b][k] = 'bp'

    return board
}

type TInitChessState = (
    bottomSide: TChessSide,
    startingSide: TChessSide
) => IChessState

export const initChessState: TInitChessState = (
    bottomSide, startingSide
) => {
    const [w, b] = bottomSide === 'black' ? [0, 7] : [7, 0]
    return {
        board: initChessBoard(bottomSide),
        bottomSide,
        currentlyPlaying: startingSide,
        kingsPos: { w: [w, 4], b: [b, 4] },
        winner: null
    }
}


class ChessGame {
    state: IChessState

    constructor(bottomSide: TChessSide, startingSide: TChessSide) {
        this.state = (initChessState(bottomSide, startingSide))

    }

    flip() {
        const copy = new Array(7).fill(null)
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.state.board[i][j]) {
                    copy[7 - i][j] = this.state.board[i][j]
                }
            }
        }
        this.state.bottomSide =
            this.state.bottomSide === 'black' ? 'white' : 'black'
        this.state.board = copy
    }
}