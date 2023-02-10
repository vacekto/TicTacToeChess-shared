import { TUltimateTicTacToeBoard } from "../types";
import { TicTacToe } from "../index";

export const initializeBoard = (): TUltimateTicTacToeBoard => {
    const state: TUltimateTicTacToeBoard = [];
    for (let i = 0; i < 3; i++) {
        state[i] = []
        for (let j = 0; j < 3; j++) {
            state[i][j] = TicTacToe.initializeBoard(3)
        }
    }
    return state
}

export const checkForWinner = (state: TUltimateTicTacToeBoard, lastMove: [number, number, number, number]) => {

}
