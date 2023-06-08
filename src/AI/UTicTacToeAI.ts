import { suggestTicTacToeMove } from "./TicTacToeAI";
import { IUTicTacToeMove, IUTicTacToeAIMoveProps } from '../types/types'
interface IPotentialSegment {
    coord: [number, number]
}

type TSuggestUTicTacToeMove = (props: IUTicTacToeAIMoveProps) => IUTicTacToeMove

export const suggestUTicTacToeMove: TSuggestUTicTacToeMove = ({
    board,
    activeSegment,
    activePlayer,
    segmentBoard
}) => {
    if (activeSegment) {
        const [SX, SY] = activeSegment
        const { X, Y } = suggestTicTacToeMove({ board: board[SX][SY], activePlayer, winCondition: 3 })
        return { SX, SY, X, Y }
    }

    const potentialSegments: IPotentialSegment[] = []

    segmentBoard.forEach((SRow, SX) => SRow.forEach((SSquare, SY) => {
        if (SSquare) return
        potentialSegments.push({ coord: [SX, SY] })
    }))

    const randIndex = Math.floor(Math.random() * potentialSegments.length)
    const [SX, SY] = potentialSegments[randIndex].coord
    const { X, Y } = suggestTicTacToeMove({ board: board[SX][SY], activePlayer, winCondition: 3 })
    return { SX, SY, X, Y }
}