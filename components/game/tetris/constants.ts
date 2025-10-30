// 테트리스 게임 상수 정의

import { TetrominoType } from './types'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const CELL_SIZE = 30 // 픽셀

// 레벨별 낙하 속도 (밀리초)
export const LEVEL_SPEED: Record<number, number> = {
  1: 1000,
  2: 800,
  3: 600,
  4: 500,
  5: 400,
  6: 300,
  7: 250,
  8: 200,
  9: 150,
  10: 100,
}

// 기본 레벨 속도 (레벨 10 이상)
export const BASE_SPEED = 100

// 레벨당 필요한 라인 수
export const LINES_PER_LEVEL = 10

// 점수 시스템
export const SCORE_POINTS = {
  SOFT_DROP: 1, // 칸당
  HARD_DROP: 2, // 칸당
  SINGLE_LINE: 100,
  DOUBLE_LINE: 300,
  TRIPLE_LINE: 500,
  TETRIS: 800, // 4줄
}

// 테트로미노 형태 정의 (회전별로 4가지 형태)
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
  ],
}

// 테트로미노 색상
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0', // Cyan
  O: '#f0f000', // Yellow
  T: '#a000f0', // Purple
  S: '#00f000', // Green
  Z: '#f00000', // Red
  J: '#0000f0', // Blue
  L: '#f0a000', // Orange
}

// 다음 블록 큐 크기
export const NEXT_QUEUE_SIZE = 3


