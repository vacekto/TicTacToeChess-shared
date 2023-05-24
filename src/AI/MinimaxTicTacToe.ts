import { TicTacToeGame } from "../gameLogic/ticTacToe"
import { ITicTacToeMove } from '../types/types'


const evaluateState = () => 0

const isFinalState = () => false

export const getMoveSuggestion = (
    board: ('X' | 'O' | null)[][],
    activePlayer: 'X' | 'O'
) => {
    const game = new TicTacToeGame(3, 3, activePlayer)
    game.updateState({
        board: structuredClone(board),
        activePlayer,
        winner: null,
        winSegments: [],
    })

    const start = Date.now()
    const move = minimax(game, Infinity, activePlayer === 'O', true)
    const end = Date.now()
    const diff = end - start
    console.log(move)
    console.group(diff / 1000)
}

// O is maximazing and X is minimizing
const minimax = (
    instance: TicTacToeGame,
    length: number,
    maximizing: boolean,
    isFirstIteration: boolean
) => {
    // console.log(instance.state.board)
    if (instance.state.winner || length === 0) {
        let output: number = 0
        if (instance.state.winner === 'O') output = 1
        if (instance.state.winner === 'X') output = -1
        if (instance.state.winner === 'draw') output = 0
        instance.revert()
        return output
    }

    const viableMoves: ITicTacToeMove[] = [] // TODO: get viableMoves somehow
    instance.state.board.forEach((row, X) => row.forEach((square, Y) => {
        if (instance.state.board[X][Y] === null)
            viableMoves.push({ X, Y })
    }))
    if (viableMoves.length === 0) console.log('no viable move')

    if (maximizing) {
        let max = -1
        let bestMove: ITicTacToeMove = viableMoves[0]
        viableMoves.forEach((move, index) => {

            // if (instance.state.board[move.X][move.Y]) console.log('O into ', instance.state.board[move.X][move.Y], [move.X, move.Y], instance.state.board)

            instance.move(move, 'O')
            const value = minimax(instance, length - 1, false, false) as number
            if (value > max) {
                max = value
                bestMove = move
            }
        })
        instance.revert()
        if (isFirstIteration) return bestMove
        return max
    }

    else {
        let min = 1
        let bestMove: ITicTacToeMove = viableMoves[0]
        viableMoves.forEach((move, index) => {

            // if (instance.state.board[move.X][move.Y]) console.log('X into ', instance.state.board[move.X][move.Y], [move.X, move.Y], instance.state.board)

            instance.move(move, 'X')
            const value = minimax(instance, length - 1, true, false) as number
            if (value < min) {
                min = value
                bestMove = move
            }
        })
        instance.revert()
        if (isFirstIteration) return bestMove
        return min
    }
}