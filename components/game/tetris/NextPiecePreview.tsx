// 다음 블록 미리보기 컴포넌트

'use client'

import { TETROMINO_SHAPES, TETROMINO_COLORS, CELL_SIZE } from './constants'
import { TetrominoType } from './types'

interface NextPiecePreviewProps {
  pieces: TetrominoType[]
}

export default function NextPiecePreview({ pieces }: NextPiecePreviewProps) {
  const renderPiece = (type: TetrominoType, index: number) => {
    const shape = TETROMINO_SHAPES[type][0]
    const color = TETROMINO_COLORS[type]
    const cellSize = CELL_SIZE * 0.7

    return (
      <div key={index} className="mb-4">
        <div className="text-xs text-gray-400 mb-1">다음 {index + 1}</div>
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

  return (
    <div className="bg-gray-900 p-4 rounded">
      <h3 className="text-sm font-bold text-white mb-3">다음 블록</h3>
      <div className="space-y-2">
        {pieces.map((piece, index) => renderPiece(piece, index))}
      </div>
    </div>
  )
}


