import { IChessMove, IChessState, ITicTacToeMove, ITicTacToeState, IUTicTacToeMove, IUTicTacToeState, TGameInstance, TGameMove, TGameName, TGameSide, TTicTacToeSide } from "./types";


export interface ServerToClientEvents {
    setUsername: (
        status: 'ok' | 'error',
        message: 'Success' | 'This username is already taken',
        username: string
    ) => void
    startGame: (
        gameName: TGameName,
        opponentUsername: string,
        gameSide: TGameSide
    ) => void
    opponentLeft: () => void
    gameStateUpdate: (
        state: IChessState | ITicTacToeState | IUTicTacToeState,
        lastMove: IChessMove | ITicTacToeMove | IUTicTacToeMove
    ) => void
    test: () => void
}

export interface ClientToServerEvents {
    setUsername: (username: string) => void;
    joinLobby: (game: TGameName) => void
    leaveLobby: () => void
    leaveGame: () => void
    gameMove: (move: IChessMove | ITicTacToeMove | IUTicTacToeMove) => void
    test: () => void
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    username: string;
    gameInstance: TGameInstance & {
        move: TGameMove

    };
    gameRoom: string;
}