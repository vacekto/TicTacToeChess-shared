import { TicTacToeGame } from "./ticTacToe";
import {
    TTicTacToeSide,
    IUTicTacToeState,
    IUTicTacToeMove,
} from "../types/types";



export class UTicTacToeGame {

    board: TicTacToeGame[][]
    segmentInstance: TicTacToeGame
    activeSegment: [number, number] | null
    activePlayer: TTicTacToeSide
    winner: TTicTacToeSide | 'draw' | null

    constructor(startingSide: TTicTacToeSide = 'O') {
        this.board = this.initBoard(startingSide)
        this.segmentInstance = new TicTacToeGame(3, 3, startingSide)
        this.activeSegment = null
        this.activePlayer = startingSide
        this.winner = null
    }

    private createNullMatrix = () => {
        return new Array(3).fill(null).map(() => {
            return new Array(3).fill(null)
        })
    }
    get state() {
        const board = this.createNullMatrix()
        let segmentBoard = this.createNullMatrix()

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[i][j] = this.board[i][j].state.board
                segmentBoard[i][j] = this.board[i][j].state.winner
            }
        }

        return structuredClone({
            board,
            segmentBoard,
            winner: this.winner,
            activePlayer: this.activePlayer,
            activeSegment: this.activeSegment
        }) as IUTicTacToeState
    }

    // export interface IUTicTacToeState {
    //     board: ('X' | 'O' | null)[][][][];
    //     segmentBoard: ('X' | 'O' | 'draw' | null)[][];
    //     activeSegment: [number, number] | null;
    //     activePlayer: 'X' | 'O';
    //     winner: 'X' | 'O' | 'draw' | null;
    // }

    updateState(state: IUTicTacToeState) {
        const newState = structuredClone(state) as IUTicTacToeState
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.board[i][j].updateState({
                    board: newState.board[i][j],
                    activePlayer: newState.activePlayer,
                    winner: null,
                    winSegments: []
                })

                const winner = this.board[i][j].winner
                if (winner === 'O' || winner === 'X') {
                    this.segmentInstance.move({ X: i, Y: j }, winner)
                    this.winner = this.segmentInstance.winner
                }
            }
        }

        this.activePlayer = newState.activePlayer
        this.activeSegment = newState.activeSegment
    }

    resetState(startingSide: TTicTacToeSide = 'O') {
        this.board = this.initBoard(this.activePlayer)
        this.segmentInstance = new TicTacToeGame(3, 3, this.activePlayer)
        this.activeSegment = null
        this.activePlayer = startingSide
        this.winner = null
    }

    private initBoard(startingSide: TTicTacToeSide) {
        return new Array(3).fill(null).map(() => {
            return new Array(3).fill(null).map(() => {
                return new TicTacToeGame(3, 3, startingSide)
            })
        }) as TicTacToeGame[][]
    }

    private isDraw() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j].state.winner === null) return false
            }
        }
        return true
    }

    move(move: IUTicTacToeMove) {
        const { SX, SY, X, Y } = move
        const AS = this.activeSegment
        if (AS && (SX !== AS[0] || SY !== AS[1]))
            if (this.board[SX][SY].state.board[X][Y]) return
        if (this.board[SX][SY].winner) return

        this.board[SX][SY].move({ X, Y }, this.activePlayer)
        this.activePlayer = this.activePlayer === 'O' ? 'X' : 'O'
        const segmentWinner = this.board[SX][SY].state.winner
        if (segmentWinner === 'O' || segmentWinner === 'X')
            this.segmentInstance.move({ X: SX, Y: SY }, segmentWinner)

        this.winner = this.segmentInstance.winner
        if (this.isDraw()) this.winner = 'draw'

        if (this.winner) return

        if (this.segmentInstance.state.board[X][Y])
            this.activeSegment = null
        else (this.activeSegment = [X, Y])
    }
}

