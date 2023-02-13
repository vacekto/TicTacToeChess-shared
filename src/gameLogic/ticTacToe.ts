import {
    TTicTacToeBoard,
    TTicTacToeSide,
} from '../types'

type lineCOORD = [[number, number], [number, number]]

interface ITicTacToeOutcome {
    winner: TTicTacToeSide | 'draw' | null,
    winSegments: lineCOORD[],
}
type TDir = (
    prevCOORD: [number, number]
) => [number, number]

type TCheckDir = (
    dir: TDir,
    board: TTicTacToeBoard,
    prevMove: [number, number],
    side: TTicTacToeSide
) => [number, number]

type TCheckForWinnerTicTacToe = (
    board: TTicTacToeBoard,
    winCondition: number,
    lastMove?: [number, number]
) => ITicTacToeOutcome

const dirs: TDir[][] = [
    [([x, y]) => [x + 1, y], ([x, y]) => [x - 1, y]],
    [([x, y]) => [x + 1, y + 1], ([x, y]) => [x - 1, y - 1]],
    [([x, y]) => [x, y + 1], ([x, y]) => [x, y - 1]],
    [([x, y]) => [x - 1, y + 1], ([x, y]) => [x + 1, y - 1]]
]
const isOutOfBounds = (moveCOORD: [number, number], size: number) => {
    for (let COORD of moveCOORD) {
        if (COORD < 0 || COORD >= size) return true
    }
    return false
}
const checkDir: TCheckDir = (dir, board, prevMove, side) => {
    const [a, b] = dir(prevMove)
    if (isOutOfBounds([a, b], board.length)) return prevMove
    if (board[a][b] !== side) return prevMove
    return checkDir(dir, board, [a, b], side)
}

export const checkForWinnerTicTacToe: TCheckForWinnerTicTacToe = (
    board, winCondition, lastMove
) => {
    const size = board.length
    let outcome: ITicTacToeOutcome = {
        winner: null,
        winSegments: []
    }

    if (!lastMove) {
        let potentialOutcome: ITicTacToeOutcome
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                potentialOutcome = checkForWinnerTicTacToe(board, winCondition, [i, j])
                if (outcome.winSegments.length < potentialOutcome.winSegments.length) {
                    outcome = potentialOutcome
                }
            }
        }
        return outcome
    }

    const [X, Y] = lastMove

    if (isOutOfBounds(lastMove, size)) {
        console.error('ILLEGAL CHECK_FOR_WINNER INPUT!!')
        return outcome
    }
    if (board[X][Y] === null || board[X][Y] === 'draw') return outcome

    const player = board[X][Y] as TTicTacToeSide

    dirs.forEach(dir => {
        const [a, b] = checkDir(dir[0], board, lastMove, player)
        const [c, d] = checkDir(dir[1], board, lastMove, player)
        const sequence = Math.max(Math.abs(a - c), Math.abs(b - d)) + 1
        if (sequence >= winCondition) outcome.winSegments.push([[a, b], [c, d]])
    })

    if (outcome.winSegments[0]) outcome.winner = player

    return outcome
}