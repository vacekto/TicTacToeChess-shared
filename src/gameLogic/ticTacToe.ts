import { TTicTacToeBoard, TTicTacToeSide } from '../types'

export const initializeTicTacToeBoard = (size: number): TTicTacToeBoard => {
    const state: TTicTacToeBoard = [];
    for (let i = 0; i < size; i++) {
        state[i] = []
        for (let j = 0; j < size; j++) {
            state[i][j] = null
        }
    }
    return state
}

export const checkForWinnerTicTacToe = (state: TTicTacToeBoard, lastMove: [number, number], winCondition: number) => {
    const [x, y] = lastMove
    const player = state[x][y] as TTicTacToeSide
    const size = state.length

    type TDir = (i: number) => [number, number]

    const dirs: TDir[][] = [
        [i => [x + i, y], i => [x - i, y]],
        [i => [x + i, y + i], i => [x - i, y - i]],
        [i => [x, y + i], i => [x, y - i]],
        [i => [x - i, y + i], i => [x + i, y - i]]
    ]


    type rec = (dir: TDir, prevMove: [number, number], step: number) => [number, number]

    const checkDir: rec = (dir, prevMove, step) => {
        const [a, b] = dir(step + 1)
        if (a < 0 || a >= size || b < 0 && b >= size) return prevMove
        if (state[a][b] !== player) return prevMove
        return checkDir(dir, [a, b], step + 1)
    }


    const winStreaks: [number, number][][] = []

    dirs.forEach(dir => {
        const [a, b] = checkDir(dir[0], lastMove, 0)
        const [c, d] = checkDir(dir[1], lastMove, 0)
        const distance = Math.max(Math.abs(a - c), Math.abs(b - d)) + 1
        if (distance >= winCondition) winStreaks.push([[a, b], [c, d]])
    })

    return winStreaks
}