export type TGameName = 'TicTacToe' | 'UltimateTicTacToe' | 'Chess'
export type TTicTacToeBoard = (TTicTacToeSide | null)[][]
export type TUltimateTicTacToeBoard = (TTicTacToeBoard)[][]
export type TTicTacToeSide = 'X' | 'O'
export type TChessSide = 'white' | 'black'
export type TChessState = (TChessSide | null)[][]