import {
    IChessMove,
    IChessState,
    ITicTacToeMove,
    ITicTacToeState,
    IUTicTacToeMove,
    IUTicTacToeState,
    TGameInstance,
    TGameMove,
    TGameName,
    TGameSide,
} from "./types";


export interface ServerToClientEvents {
    username_accepted: (username: string) => void
    username_denied: (errorMessage: string) => void
    start_game: (
        gameName: TGameName,
        opponentUsername: string,
        gameSide: TGameSide
    ) => void
    opponent_left: () => void
    game_state_update: (
        state: IChessState | ITicTacToeState | IUTicTacToeState,
        lastMove: IChessMove | ITicTacToeMove | IUTicTacToeMove
    ) => void
    users_online_update: (usernames: string[]) => void
    test: () => void
}

export interface ClientToServerEvents {
    set_username: (username: string) => void;
    join_lobby: (game: TGameName) => void
    leave_lobby: () => void
    leave_game: () => void
    game_move: (move: IChessMove | ITicTacToeMove | IUTicTacToeMove) => void
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