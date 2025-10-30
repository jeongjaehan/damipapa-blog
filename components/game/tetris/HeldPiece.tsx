// 홀드 블록 컴포넌트

'use client'

import { TETROMINO_SHAPES, TETROMINO_COLORS, CELL_SIZE } from './constants'
import { TetrominoType } from './types'

interface HeldPieceProps {
  piece: TetrominoType | null
}

export default function HeldPiece({ piece }: HeldPieceProps) {
  if (!piece) {
    return (
      <div className="bg-gray-900 p-4 rounded">
        <h3 className="text-sm font-bold text-white mb-3">홀드</h3>
        <div className="text-xs text-gray-500">(C 키)</div>
      </div>
    )
  }

  const shape = TETROMINO_SHAPES[piece][0]
  const color = TETROMINO_COLORS[piece]
  const cellSize = CELL_SIZE * 0.7

  return (
    <div className="bg-gray-900 p-4 rounded">
      <h3 className="text-sm font-bold text-white mb-3">홀드</h3>
      <div
        className="grid gap-0 bg-gray-800 p-2 rounded"
        style={{
          gridTemplateColumns: `repeat(${shape[0]?.length || 4}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${shape.length}, ${cellSize}px)`,
          width: 'fit-content',
        }}
      >
        {shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="border"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? color : 'transparent',
                borderColor: cell ? '#ffffff' : 'transparent',
                borderWidth: cell ? '1px' : '0',
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}


