import { checkForWinnerTicTacToe } from "./ticTacToe";
import { initTicTacToeBoard } from "../util";
import {
    TTicTacToeSide,
    TUTicTacToeBoard,
} from "../types";



interface IUTicTacToeOutcome {
    winner: TTicTacToeSide | null | 'draw'
}

type TCheckForWinnerUTicTacToe = (
    board: TUTicTacToeBoard,
) => IUTicTacToeOutcome


export const checkForWinnerUTicTacToe: TCheckForWinnerUTicTacToe = (board) => {
    const segmentBoard = initTicTacToeBoard(3) 
        const outcome: IUTicTacToeOutcome = { winner: null }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const segmentState = checkForWinnerTicTacToe(board[i][j], 3)
            segmentBoard[i][j] = segmentState.winner
        }
    }
    outcome.winner = checkForWinnerTicTacToe(segmentBoard, 3).winner
    return outcome
}

