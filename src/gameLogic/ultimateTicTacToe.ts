import { TUltimateTicTacToeBoard } from "../types";
import { initializeTicTacToeBoard } from "./ticTacToe";

export const initializeUltimateTicTacToeBoard = (): TUltimateTicTacToeBoard => {
    const state: TUltimateTicTacToeBoard = [];
    for (let i = 0; i < 3; i++) {
        state[i] = []
        for (let j = 0; j < 3; j++) {
            state[i][j] = initializeTicTacToeBoard(3)
        }
    }
    return state
}

