// 테트리스 게임 로직

import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_SHAPES,
  SCORE_POINTS,
  LINES_PER_LEVEL,
  LEVEL_SPEED,
  BASE_SPEED,
  NEXT_QUEUE_SIZE,
} from './constants'
import {
  TetrominoType,
  CellState,
  Position,
  Tetromino,
  GameState,
} from './types'

// Bag 알고리즘: 7개 블록을 섞어서 무작위로 선택
export class PieceBag {
  private bag: TetrominoType[] = []
  private refillBag() {
    const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
    // Fisher-Yates 셔플
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pieces[i], pieces[j]] = [pieces[j], pieces[i]]
    }
    this.bag = pieces
  }

  getNext(): TetrominoType {
    if (this.bag.length === 0) {
      this.refillBag()
    }
    return this.bag.pop()!
  }

  peekMultiple(count: number): TetrominoType[] {
    const result: TetrominoType[] = []
    const tempBag = [...this.bag]
    
    while (result.length < count) {
      if (tempBag.length === 0) {
        const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
        for (let i = pieces.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[pieces[i], pieces[j]] = [pieces[j], pieces[i]]
        }
        tempBag.push(...pieces)
      }
      result.push(tempBag.pop()!)
    }
    
    return result
  }
}

// 빈 보드 생성
export function createEmptyBoard(): CellState[][] {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null))
}

// 새 테트로미노 생성
export function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type][0],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    rotation: 0,
  }
}

// 테트로미노의 모든 셀 위치 가져오기
export function getTetrominoCells(tetromino: Tetromino): Position[] {
  const cells: Position[] = []
  const shape = tetromino.shape

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        cells.push({
          x: tetromino.position.x + x,
          y: tetromino.position.y + y,
        })
      }
    }
  }

  return cells
}

// 충돌 체크
export function checkCollision(
  board: CellState[][],
  tetromino: Tetromino
): boolean {
  const cells = getTetrominoCells(tetromino)

  for (const cell of cells) {
    // 보드 경계 체크
    if (
      cell.x < 0 ||
      cell.x >= BOARD_WIDTH ||
      cell.y < 0 ||
      cell.y >= BOARD_HEIGHT
    ) {
      return true
    }

    // 다른 블록과의 충돌 체크
    if (board[cell.y][cell.x] !== null) {
      return true
    }
  }

  return false
}

// 회전 (벽킥 포함)
export function rotateTetromino(
  board: CellState[][],
  tetromino: Tetromino
): Tetromino | null {
  const type = tetromino.type
  const nextRotation = (tetromino.rotation + 1) % 4
  const nextShape = TETROMINO_SHAPES[type][nextRotation]

  const rotated: Tetromino = {
    ...tetromino,
    shape: nextShape,
    rotation: nextRotation,
  }

  // 기본 회전 시도
  if (!checkCollision(board, rotated)) {
    return rotated
  }

  // 벽킥 시도 (좌우 이동)
  const kickOffsets = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
  ]

  for (const offset of kickOffsets) {
    const kicked: Tetromino = {
      ...rotated,
      position: {
        x: rotated.position.x + offset.x,
        y: rotated.position.y + offset.y,
      },
    }

    if (!checkCollision(board, kicked)) {
      return kicked
    }
  }

  return null // 회전 불가
}

// 블록을 보드에 배치
export function placeTetromino(
  board: CellState[][],
  tetromino: Tetromino
): CellState[][] {
  const newBoard = board.map((row) => [...row])
  const cells = getTetrominoCells(tetromino)

  for (const cell of cells) {
    if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
      newBoard[cell.y][cell.x] = tetromino.type
    }
  }

  return newBoard
}

// 완성된 라인 찾기
export function findFullLines(board: CellState[][]): number[] {
  const fullLines: number[] = []

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every((cell) => cell !== null)) {
      fullLines.push(y)
    }
  }

  return fullLines
}

// 라인 제거
export function clearLines(board: CellState[][], lines: number[]): CellState[][] {
  const newBoard = board.map((row) => [...row])

  // 제거할 라인을 위에서부터 정렬
  const sortedLines = [...lines].sort((a, b) => a - b)

  // 라인 제거
  for (const line of sortedLines) {
    newBoard.splice(line, 1)
  }

  // 빈 라인을 위에 추가
  for (let i = 0; i < sortedLines.length; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null))
  }

  return newBoard
}

// 점수 계산
export function calculateScore(linesCleared: number, isHardDrop: boolean = false, dropDistance: number = 0): number {
  let score = 0

  // 드롭 점수
  if (isHardDrop) {
    score += SCORE_POINTS.HARD_DROP * dropDistance
  }

  // 라인 클리어 점수
  switch (linesCleared) {
    case 1:
      score += SCORE_POINTS.SINGLE_LINE
      break
    case 2:
      score += SCORE_POINTS.DOUBLE_LINE
      break
    case 3:
      score += SCORE_POINTS.TRIPLE_LINE
      break
    case 4:
      score += SCORE_POINTS.TETRIS
      break
  }

  return score
}

// 레벨 계산
export function calculateLevel(linesCleared: number): number {
  return Math.floor(linesCleared / LINES_PER_LEVEL) + 1
}

// 레벨별 낙하 속도 가져오기
export function getDropSpeed(level: number): number {
  return LEVEL_SPEED[level] || BASE_SPEED
}

// 게임 오버 체크
export function checkGameOver(board: CellState[][]): boolean {
  // 상단 2줄에 블록이 있으면 게임 오버
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x] !== null) {
        return true
      }
    }
  }
  return false
}

// 하드 드롭 위치 계산
export function getHardDropPosition(
  board: CellState[][],
  tetromino: Tetromino
): Position {
  let dropY = tetromino.position.y

  while (true) {
    const testTetromino: Tetromino = {
      ...tetromino,
      position: { ...tetromino.position, y: dropY + 1 },
    }

    if (checkCollision(board, testTetromino)) {
      break
    }

    dropY++
  }

  return { x: tetromino.position.x, y: dropY }
}

