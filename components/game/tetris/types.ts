// 테트리스 게임 타입 정의

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type CellState = TetrominoType | null

export interface Position {
  x: number
  y: number
}

export interface Tetromino {
  type: TetrominoType
  shape: number[][]
  position: Position
  rotation: number
}

export interface GameState {
  board: CellState[][]
  currentPiece: Tetromino | null
  nextPieces: TetrominoType[]
  heldPiece: TetrominoType | null
  canHold: boolean
  score: number
  level: number
  linesCleared: number
  isPaused: boolean
  isGameOver: boolean
  dropTimer: number
  lastDropTime: number
}

export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE' }
  | { type: 'HOLD' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'RESTART' }


