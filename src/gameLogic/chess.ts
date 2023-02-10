import { TChessState } from "../types";

export const initializeChessBoard = () => {
    const state: TChessState = [];
    for (let i = 0; i < 8; i++) {
        state[i] = []
        for (let j = 0; j < 8; j++) {
            state[i][j] = null
        }
    }
    return state
}