import {
    IChessMove,
    IChessState,
    ITicTacToeMove,
    ITicTacToeState,
    IUTicTacToeMove,
    IUTicTacToeState,
    TGameInstance,
    TGameName,
    TGameSide,
    IGameInvite,
    TGameMove,
    TAIMoveProps
} from "./types";

export interface IGameData {
    instance: TGameInstance
    opponentUsername: string
    roomId: string
    playAgain: boolean
    side?: TGameSide
    opponentSide?: TGameSide
}

export interface ServerToClientEvents {
    username_accepted: (username: string) => void
    username_denied: (errorMessage: string) => void
    start_game: (
        gameName: TGameName,
        opponentUsername: string,
        ticTacToeBoardSize?: number,
        ticTacToeWinCondition?: number
    ) => void
    leave_game: () => void
    game_state_update: (state: IChessState | ITicTacToeState | IUTicTacToeState) => void
    online_users_update: (usernames: string[]) => void
    game_invite: (invite: IGameInvite) => void
    set_side: (side: TGameSide) => void
    new_game: () => void
    ai_move: (move: TGameMove) => void
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
    select_side: (side: TGameSide) => void
    play_again: () => void
    get_ai_move: (game: TGameName, props: TAIMoveProps) => void
    test: () => void
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    username: string;
    game: IGameData;
}