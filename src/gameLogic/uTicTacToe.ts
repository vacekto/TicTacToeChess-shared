import { TicTacToeGame } from "./ticTacToe";
import {
    TTicTacToeSide,
    IUTicTacToeState,
    IUTicTacToeMove,
    TGameMove,
} from "../types/types";



export class UTicTacToeGame {

    // Matrix coordinates [X, Y] describe X-th row and Y-th column. To Access 
    // an element at [X, Y] on matrix variable named myMatrix, use myMatrix[X][Y]

    // Board property is 3x3 matrix representing overall state of game
    // comprised of 9 distinct segments. Board[X][Y] is TicTacToeGame instance
    // representing segment at [X, Y] that is used to track segments state. 


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

    resetState() {
        this.board = this.initBoard(this.activePlayer)
        this.segmentInstance = new TicTacToeGame(3, 3, this.activePlayer)
        this.activeSegment = null
        this.activePlayer = this.activePlayer
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

    move: TGameMove = (move) => {
        const { SX, SY, X, Y } = move as IUTicTacToeMove
        const AS = this.activeSegment
        if (AS && (SX !== AS[0] || SY !== AS[1])) return
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

