// 게임 정보 컴포넌트

'use client'

interface GameInfoProps {
  score: number
  level: number
  linesCleared: number
}

export default function GameInfo({ score, level, linesCleared }: GameInfoProps) {
  return (
    <div className="bg-gray-900 p-4 rounded space-y-3">
      <div>
        <div className="text-xs text-gray-400">점수</div>
        <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">레벨</div>
        <div className="text-xl font-bold text-white">{level}</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">제거한 줄</div>
        <div className="text-xl font-bold text-white">{linesCleared}</div>
      </div>
    </div>
  )
}


