import { TTicTacToeState, TUltimateTicTacToeState } from './types'

export const initializeTicTacToeState = (size: number): TTicTacToeState => {
    const state: TTicTacToeState = [];
    for (let i = 0; i < size; i++) {
        state[i] = []
        for (let j = 0; j < size; j++) {
            state[i][j] = null
        }
    }
    return state
}

export const initializeUltimateTicTacToeState = (): TUltimateTicTacToeState => {
    const state: TUltimateTicTacToeState = [];
    for (let i = 0; i < 3; i++) {
        state[i] = []
        for (let j = 0; j < 3; j++) {
            state[i][j] = initializeTicTacToeState(3)
        }
    }
    return state
}