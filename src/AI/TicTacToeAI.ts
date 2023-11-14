import { TicTacToeGame } from "../gameLogic/ticTacToe"
import { ITicTacToeMove, ITicTacToeAIMoveProps } from '../types/types'


type TDir = (
    prevCOORD: [number, number],
    i: number
) => [number, number]

const isOutOfBounds = ([X, Y]: [number, number], size: number) => {
    return (
        X < 0 || X >= size ||
        Y < 0 || Y >= size
    )
}

const lines: [TDir, TDir][] = [
    [([x, y], i) => [x + i, y], ([x, y], i) => [x - i, y]],
    [([x, y], i) => [x + i, y + i], ([x, y], i) => [x - i, y - i]],
    [([x, y], i) => [x, y + i], ([x, y], i) => [x, y - i]],
    [([x, y], i) => [x - i, y + i], ([x, y], i) => [x + i, y - i]]
]

const getLineLength = (line: [TDir, TDir], origin: [number, number], board: ('X' | 'O' | null)[][]) => {
    const [X, Y] = origin
    const side = board[X][Y]
    if (!side) return 0
    let length = 1

    line.forEach(dir => {
        let pos: [number, number] = [X, Y]
        for (let i = 1; i < board.length; i++) {
            pos = dir([X, Y], i)
            if (
                isOutOfBounds(pos, board.length) ||
                board[pos[0]][pos[1]] !== side
            )
                break

            length += 1;
        }
    })

    return length
}

// returns length of longest line in position
export const getMaxLineLength = (origin: [number, number], board: ('X' | 'O' | null)[][]) => {
    let maxLength = 0
    lines.forEach(line => {
        const length = getLineLength(line, origin, board)
        maxLength = Math.max(maxLength, length)
    })

    return maxLength
}

const evaluateState = (
    board: ('O' | 'X' | null)[][],
) => {

    let scoreX = 0
    let scoreO = 0

    board.forEach((row, X) => row.forEach((square, Y) => {
        const maxLength = getMaxLineLength([X, Y], board)
        if (square === 'O')
            scoreO = Math.max(scoreO, maxLength)

        if (square === 'X')
            scoreX = Math.max(scoreX, maxLength)

    }))
    return scoreO - scoreX
}

const isBoardEmpty = (board: ('X' | 'O' | null)[][]) => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j]) return false
        }
    }
    return true
}

const isMoveViable = (X: number, Y: number, board: ('X' | 'O' | null)[][]) => {

    const isPosNonEmpty = (X: number, Y: number) => {
        return Boolean(!isOutOfBounds([X, Y], board.length) && board[X][Y])
    }

    return (
        board[X][Y] === null &&
        (
            isPosNonEmpty(X + 1, Y) ||
            isPosNonEmpty(X + 1, Y + 1) ||
            isPosNonEmpty(X, Y + 1) ||
            isPosNonEmpty(X - 1, Y + 1) ||
            isPosNonEmpty(X - 1, Y) ||
            isPosNonEmpty(X - 1, Y - 1) ||
            isPosNonEmpty(X, Y - 1) ||
            isPosNonEmpty(X + 1, Y - 1)
        )
    )
}

export const suggestTicTacToeMove = ({
    board,
    activePlayer,
    winCondition = Math.floor(board.length / 2),
    skill = Infinity
}: ITicTacToeAIMoveProps) => {

    const size = board.length
    if (!winCondition)
        winCondition = size <= 5 ? 3 : 5
    const game = new TicTacToeGame(size, winCondition, activePlayer)

    game.updateState({
        board: structuredClone(board),
        activePlayer,
        winner: null,
        winSegments: [],
    })
    return minimax(game, skill, activePlayer === 'O', true) as ITicTacToeMove
}

const minimax = (
    instance: TicTacToeGame,
    length: number,
    maximizing: boolean,
    isFirstIteration: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
) => {

    if (isFirstIteration && isBoardEmpty(instance.state.board)) return {
        X: Math.floor(instance.state.board.length / 2),
        Y: Math.floor(instance.state.board.length / 2)
    }

    if (instance.state.winner || length === 0) {
        let output = 0
        if (instance.winner) output = instance.winner === 'O' ? Infinity : -Infinity
        else output = evaluateState(instance.state.board)
        instance.revert()
        return output
    }

    const viableMoves: ITicTacToeMove[] = []
    instance.state.board.forEach((row, X) => row.forEach((square, Y) => {
        if (isMoveViable(X, Y, instance.state.board)) viableMoves.push({ X, Y })
    }))


    if (maximizing) {
        let bestMove: ITicTacToeMove = viableMoves[0]
        let max = -Infinity


        for (let i = 0; i < viableMoves.length; i++) {
            const move = viableMoves[i]
            instance.move(move, 'O')
            const value = minimax(instance, length - 1, false, false, alpha, beta) as number
            if (value > alpha) alpha = value
            if (value > max) {
                max = value
                bestMove = move
            }
            if (alpha >= beta) {
                instance.revert()
                return value
            }
        }

        instance.revert()

        if (isFirstIteration) return bestMove
        return max
    }

    else {
        let bestMove: ITicTacToeMove = viableMoves[0]
        let min = Infinity

        for (let i = 0; i < viableMoves.length; i++) {
            const move = viableMoves[i]
            instance.move(move, 'X')
            const value = minimax(instance, length - 1, true, false, alpha, beta) as number
            if (value < beta) beta = value
            if (value < min) {
                min = value
                bestMove = move
            }
            if (alpha >= beta) {
                instance.revert()
                return value
            }
        }

        instance.revert()

        if (isFirstIteration) return bestMove
        return min
    }
}
