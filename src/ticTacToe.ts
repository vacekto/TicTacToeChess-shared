import { TTicTacToeState } from './types'

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