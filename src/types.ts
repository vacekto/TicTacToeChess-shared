export type TGameName = 'TicTacToe' | 'UTicTacToe' | 'Chess'
export type TTicTacToeBoard = (TTicTacToeSide | null | 'draw')[][]
export type TUTicTacToeBoard = (TTicTacToeBoard)[][]
export type TTicTacToeSide = 'X' | 'O'
export type TChessSide = 'white' | 'black'
export type TChessPiece =
    | 'bk' | 'bq' | 'br' | 'bb' | 'bn' | 'bp'
    | 'wk' | 'wq' | 'wr' | 'wb' | 'wn' | 'wp'
    | 'ee'
export type TChessBoard = TChessPiece[][]


export interface ITicTacToeState {
    board: TTicTacToeBoard,
    winCondition: number,
    activePlayer: TTicTacToeSide,
    score: {
        X: number
        O: number
        draw: number
    },
    winner: TTicTacToeSide | 'draw' | null
}

export interface IUTicTacToeState {
    board: TUTicTacToeBoard,
    segmentBoard: (TTicTacToeSide | 'draw' | null)[][],
    activeSegment: [number, number] | null
    activePlayer: TTicTacToeSide,
    score: {
        X: number
        O: number
        draw: number
    },
    winner: TTicTacToeSide | 'draw' | null
}

export interface IChessState {
    board: TChessBoard,
    topSidePlayer: TChessSide,
    activePlayer: TChessSide,
    kingsPos: {
        w: [number, number],
        b: [number, number]
    },
    winner: TTicTacToeSide | 'draw' | null
}