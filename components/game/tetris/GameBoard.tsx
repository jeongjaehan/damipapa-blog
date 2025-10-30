// 테트리스 게임 보드 컴포넌트

'use client'

import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, TETROMINO_COLORS } from './constants'
import { CellState, Tetromino } from './types'
import { getTetrominoCells } from './gameLogic'

interface GameBoardProps {
  board: CellState[][]
  currentPiece: Tetromino | null
}

export default function GameBoard({ board, currentPiece }: GameBoardProps) {
  const renderCell = (x: number, y: number) => {
    let cellType: CellState = board[y][x]
    let opacity = 1

    // 현재 블록의 일부인지 확인
    if (currentPiece) {
      const cells = getTetrominoCells(currentPiece)
      const isCurrentCell = cells.some((cell) => cell.x === x && cell.y === y)
      
      if (isCurrentCell) {
        cellType = currentPiece.type
        opacity = 0.9
      }
    }

    const backgroundColor = cellType ? TETROMINO_COLORS[cellType] : '#1f2937'
    const borderColor = cellType ? '#ffffff' : '#374151'

    return (
      <div
        key={`${x}-${y}`}
        className="border"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor,
          borderColor,
          borderWidth: '1px',
          opacity,
        }}
      />
    )
  }

  return (
    <div
      className="grid gap-0 bg-gray-800 p-2 rounded"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
      }}
    >
      {Array.from({ length: BOARD_HEIGHT }, (_, y) =>
        Array.from({ length: BOARD_WIDTH }, (_, x) => renderCell(x, y))
      )}
    </div>
  )
}


