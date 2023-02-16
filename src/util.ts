import {
    ITicTacToeState,
    TTicTacToeBoard,
    TUTicTacToeBoard,
    IUTicTacToeState,
    TChessBoard
} from "./types";

export const initTicTacToeBoard = (size: number) => {
    const state: TTicTacToeBoard = [];
    for (let i = 0; i < size; i++) {
        state[i] = []
        for (let j = 0; j < size; j++) {
            state[i][j] = null
        }
    }
    return state
}

export const initTicTacToeState = (): ITicTacToeState => {
    return {
        board: initTicTacToeBoard(12),
        winCondition: 5,
        activePlayer: 'O',
        score: {
            X: 0,
            O: 0,
            draw: 0,
        },
        winner: null
    }
}

export const initUTicTacToeBoard = () => {
    const state: TUTicTacToeBoard = [];
    for (let i = 0; i < 3; i++) {
        state[i] = []
        for (let j = 0; j < 3; j++) {
            state[i][j] = initTicTacToeBoard(3)
        }
    }
    return state
}

export const initUTicTacToeState = (): IUTicTacToeState => {
    return {
        board: initUTicTacToeBoard(),
        segmentBoard: initTicTacToeBoard(3),
        activeSegment: null,
        activePlayer: 'O',
        score: {
            X: 0,
            O: 0,
            draw: 0,
        },
        winner: null
    }
}


