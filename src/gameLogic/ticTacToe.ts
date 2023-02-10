import { TTicTacToeBoard, TTicTacToeSide } from '../types'

export const initBoard = (size: number): TTicTacToeBoard => {
    const state: TTicTacToeBoard = [];
    for (let i = 0; i < size; i++) {
        state[i] = []
        for (let j = 0; j < size; j++) {
            state[i][j] = null
        }
    }
    return state
}

export const checkForWinner = (state: TTicTacToeBoard, lastMove: [number, number], winCondition: number) => {
    const [x, y] = lastMove
    const player = state[x][y] as TTicTacToeSide
    const size = state.length

    type TDir = () => [number, number]

    const dirs: TDir[][] = [
        [() => [x + 1, y], () => [x - 1, y]],
        [() => [x + 1, y + 1], () => [x - 1, y - 1]],
        [() => [x, y + 1], () => [x, y - 1]],
        [() => [x - 1, y + 1], () => [x + 1, y - 1]]
    ]


    type rec = (dir: TDir, prevMove: [number, number]) => [number, number]

    const checkDir: rec = (dir, prevMove) => {
        const [a, b] = dir()
        if (a < 0 || a >= size || b < 0 && b >= size) return prevMove
        if (state[a][b] !== player) return prevMove
        return checkDir(dir, [a, b])
    }


    const winStreaks: [number, number][][] = []

    dirs.forEach(dir => {
        const [a, b] = checkDir(dir[0], lastMove)
        const [c, d] = checkDir(dir[1], lastMove)
        const distance = Math.max(Math.abs(a - c), Math.abs(b - d)) + 1
        if (distance >= winCondition) winStreaks.push([[a, b], [c, d]])
    })
    if (winStreaks[0]) return {
        winner: state[x][y],
        winStreaks
    }
    return null
}