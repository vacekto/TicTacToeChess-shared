import { ChessGame } from "../gameLogic/chess"
import { TicTacToeGame } from '../gameLogic/ticTacToe'
import { UTicTacToeGame } from "../gameLogic/uTicTacToe"

export type TGameName = 'ticTacToe' | 'uTicTacToe' | 'chess'
export type TTicTacToeBoard = (TTicTacToeSide | null)[][]
export type TTicTacToeSide = 'X' | 'O'
export type TChessSide = 'w' | 'b'
export type TChessPiece =
    | 'bk' | 'bq' | 'br' | 'bb' | 'bn' | 'bp'
    | 'wk' | 'wq' | 'wr' | 'wb' | 'wn' | 'wp'
    | 'ee'
export type TChessBoard = TChessPiece[][]
export type TGameInstance = ChessGame | TicTacToeGame | UTicTacToeGame
export type TPlayerSide = TChessSide | TTicTacToeSide
export type TGameSide = TChessSide | TTicTacToeSide
export type TGameMode = 'hotseat' | 'multiplayer' | 'vsPC'

export interface IGameInvite {
    invitee: string
    sender: string
    game: TGameName
}

export interface IChessMove {
    from: [number, number]
    to: [number, number]
}

export interface IUTicTacToeMove {
    X: number
    Y: number
    SX: number
    SY: number
}

export interface ITicTacToeMove {
    X: number
    Y: number
}

export type TGameMove = (
    move: IChessMove | ITicTacToeMove | IUTicTacToeMove,
    side?: TTicTacToeSide
) => void

export interface ITicTacToeState {
    board: ('X' | 'O' | null)[][],
    activePlayer: 'X' | 'O',
    winner: 'X' | 'O' | null | 'draw'
    winSegments: [[number, number], [number, number]][]
}

export interface IUTicTacToeState {
    board: ('X' | 'O' | null)[][][][],
    segmentBoard: ('X' | 'O' | 'draw' | null)[][],
    activeSegment: [number, number] | null
    activePlayer: 'X' | 'O',
    winner: 'X' | 'O' | 'draw' | null
}

export interface IChessState {
    board: TChessBoard,
    activePlayer: TChessSide,
    winner: TChessSide | 'stalemate' | null
    figuresTaken: {
        w: TChessPiece[]
        b: TChessPiece[]
    }
    lastMove?: {
        from: [number, number]
        to: [number, number]
    }
    castlingAvailable: {
        w: boolean
        b: boolean
    }
}