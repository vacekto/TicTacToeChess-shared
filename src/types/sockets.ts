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
    IGameInvite
} from "./types";


export interface ServerToClientEvents {
    username_accepted: (username: string) => void
    username_denied: (errorMessage: string) => void
    start_game: (
        gameName: TGameName,
        opponentUsername: string,
        gameSide: TGameSide
    ) => void
    leave_game: () => void
    game_state_update: (
        state: IChessState | ITicTacToeState | IUTicTacToeState,
        lastMove: IChessMove | ITicTacToeMove | IUTicTacToeMove
    ) => void
    online_users_update: (usernames: string[]) => void
    game_invite: (invite: IGameInvite) => void
    test: () => void
}

export interface ClientToServerEvents {
    change_username: (username: string) => void;
    join_lobby: (game: TGameName) => void
    leave_lobby: () => void
    leave_game: () => void
    game_move: (move: IChessMove | ITicTacToeMove | IUTicTacToeMove) => void
    game_invite: (invite: IGameInvite) => void
    fetch_online_users: () => void
    accept_invite: (invite: IGameInvite) => void
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