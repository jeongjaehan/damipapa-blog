// 테트리스 게임 페이지

import type { Metadata } from 'next'
import TetrisGame from '@/components/game/tetris/TetrisGame'

export const metadata: Metadata = {
  title: '테트리스',
  description: '클래식 테트리스 게임을 플레이하세요',
}

export default function TetrisPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">테트리스</h1>
        <p className="text-gray-600 text-center mb-8">클래식 테트리스 게임을 즐겨보세요!</p>
        <TetrisGame />
      </div>
    </div>
  )
}

