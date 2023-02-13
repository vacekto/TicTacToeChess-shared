export type TGameName = 'TicTacToe' | 'UTicTacToe' | 'Chess'
export type TTicTacToeBoard = (TTicTacToeSide | null | 'draw')[][]
export type TUTicTacToeBoard = (TTicTacToeBoard)[][]
export type TTicTacToeSide = 'X' | 'O'
export type TChessSide = 'white' | 'black'
export type TChessState = (TChessSide | null)[][]

export interface ITicTacToeState {
    board: TTicTacToeBoard,
    winCondition: number,
    currentlyPlaying: TTicTacToeSide,
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
    currentlyPlaying: TTicTacToeSide,
    score: {
        X: number
        O: number
        draw: number
    },
    winner: TTicTacToeSide | 'draw' | null
}