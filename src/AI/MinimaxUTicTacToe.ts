import { IUTicTacToeMove } from "../types/types"

const evaluateState = () => {
    return 0
}

const isFinalState = () => {
    return false
}



const getAiMove = (state: {
    board: ('X' | 'O' | null)[][][][]
    activePlayer: 'X' | 'O'
    activeSegment: [number, number]
}) => {

    const moves: IUTicTacToeMove[] = []
    state.board.forEach((_, SX) => _.forEach((_, SY) => _.forEach((_, X) => _.forEach((target, Y) => {
        if (!target) moves.push({ SX, SY, X, Y })
    }))))
}

const minimax = (
    board: ('X' | 'O' | null)[][][][],
    activeSegment: [number, number] | null,
    length: number,
    maximizing: boolean
) => {

    if (
        length === 0 ||
        isFinalState()
    )
        return evaluateState()
    if (maximizing) {
        // makeRandomMove
        minimax(board, activeSegment, length - 1, !maximizing)
    }
    else {
        // makeRandomMove
        minimax(board, activeSegment, length - 1, !maximizing)
    }
}