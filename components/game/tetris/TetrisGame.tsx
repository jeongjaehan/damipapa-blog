// 테트리스 게임 메인 컴포넌트

'use client'

import { useState, useEffect, useRef } from 'react'
import { useTetrisGame } from './useTetrisGame'
import GameBoard from './GameBoard'
import NextPiecePreview from './NextPiecePreview'
import HeldPiece from './HeldPiece'
import GameInfo from './GameInfo'
import { Button } from '@/components/ui/button'
import { soundManager } from './sound'
import { TouchController } from './touchControls'
import { CELL_SIZE } from './constants'

export default function TetrisGame() {
  const { state, dispatch } = useTetrisGame()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const touchControllerRef = useRef<TouchController | null>(null)

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  // 터치 컨트롤러 초기화
  useEffect(() => {
    const handleSwipe = (swipe: { 
      direction: 'left' | 'right' | 'up' | 'down'
      distance: number
      velocity: number
      duration: number
    }) => {
      if (state.isGameOver || state.isPaused) return

      switch (swipe.direction) {
        case 'left':
        case 'right': {
          // 스와이프 거리를 셀 단위로 변환 (CELL_SIZE = 30픽셀)
          // 최소 1칸은 이동하고, 거리에 비례해서 이동
          const cellCount = Math.max(1, Math.round(swipe.distance / CELL_SIZE))
          // 보드 너비를 넘지 않도록 제한
          const moveCount = Math.min(cellCount, 10)
          
          // 거리만큼 연속 이동 (빠르게 한 번에 이동)
          const action = swipe.direction === 'left' ? 'MOVE_LEFT' : 'MOVE_RIGHT'
          for (let i = 0; i < moveCount; i++) {
            setTimeout(() => {
              dispatch({ type: action })
            }, i * 20) // 20ms 간격으로 연속 이동
          }
          break
        }
        case 'down': {
          // 바닥까지 스와이프 판단 (속도가 빠르거나 거리가 충분히 길면)
          const isHardDropSwipe = swipe.velocity > 1.0 || swipe.distance > CELL_SIZE * 15
          
          if (isHardDropSwipe) {
            // 하드 드롭 (수직 낙하) - 즉시 바닥까지
            dispatch({ type: 'HARD_DROP' })
          } else {
            // 일반 스와이프는 거리만큼 빠른 낙하
            const dropCount = Math.max(1, Math.round(swipe.distance / CELL_SIZE))
            const limitedDropCount = Math.min(dropCount, 10) // 최대 10칸
            
            for (let i = 0; i < limitedDropCount; i++) {
              setTimeout(() => {
                dispatch({ type: 'SOFT_DROP' })
              }, i * 20) // 20ms 간격으로 빠른 낙하
            }
          }
          break
        }
        case 'up':
          dispatch({ type: 'ROTATE' })
          break
      }
    }

    const handleLongPress = () => {
      if (state.isGameOver || state.isPaused) return
      dispatch({ type: 'HARD_DROP' })
    }

    const handleTap = () => {
      if (state.isGameOver) {
        dispatch({ type: 'RESTART' })
      } else if (state.isPaused) {
        dispatch({ type: 'RESUME' })
      } else {
        dispatch({ type: 'ROTATE' })
      }
    }

    touchControllerRef.current = new TouchController(handleSwipe, handleLongPress, handleTap)

    return () => {
      if (touchControllerRef.current) {
        touchControllerRef.current.cleanup()
      }
    }
  }, [state.isGameOver, state.isPaused, dispatch])

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-start">
        {/* 왼쪽: 게임 보드 */}
        <div className="flex-shrink-0 relative">
          <div
            onTouchStart={touchControllerRef.current?.handleTouchStart}
            onTouchMove={touchControllerRef.current?.handleTouchMove}
            onTouchEnd={touchControllerRef.current?.handleTouchEnd}
            className="touch-manipulation"
            style={{ touchAction: 'none' }}
          >
            <GameBoard board={state.board} currentPiece={state.currentPiece} />
          </div>
          
          {/* 모바일 컨트롤 버튼 */}
          <div className="md:hidden mt-4 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => dispatch({ type: 'MOVE_LEFT' })}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded text-lg font-bold"
                disabled={state.isPaused || state.isGameOver}
              >
                ←
              </button>
              <button
                onClick={() => dispatch({ type: 'ROTATE' })}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded text-lg font-bold"
                disabled={state.isPaused || state.isGameOver}
              >
                ↻
              </button>
              <button
                onClick={() => dispatch({ type: 'MOVE_RIGHT' })}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded text-lg font-bold"
                disabled={state.isPaused || state.isGameOver}
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => dispatch({ type: 'HOLD' })}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded text-sm font-bold"
                disabled={state.isPaused || state.isGameOver || !state.canHold}
              >
                홀드
              </button>
              <button
                onClick={() => dispatch({ type: 'SOFT_DROP' })}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-lg font-bold"
                disabled={state.isPaused || state.isGameOver}
              >
                ↓
              </button>
              <button
                onClick={() => dispatch({ type: 'HARD_DROP' })}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded text-sm font-bold"
                disabled={state.isPaused || state.isGameOver}
              >
                ⬇⬇
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (state.isPaused) {
                    dispatch({ type: 'RESUME' })
                  } else {
                    dispatch({ type: 'PAUSE' })
                  }
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded text-sm font-bold"
                disabled={state.isGameOver}
              >
                {state.isPaused ? '▶ 재개' : '⏸ 일시정지'}
              </button>
              {state.isGameOver && (
                <button
                  onClick={() => dispatch({ type: 'RESTART' })}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded text-sm font-bold"
                >
                  다시 시작
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 패널 */}
        <div className="flex-shrink-0 w-full lg:w-auto space-y-4">
          <GameInfo
            score={state.score}
            level={state.level}
            linesCleared={state.linesCleared}
          />

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <HeldPiece piece={state.heldPiece} />
            <NextPiecePreview pieces={state.nextPieces} />
          </div>

          {/* 컨트롤 버튼 */}
          <div className="bg-gray-900 p-4 rounded space-y-2">
            <div className="text-xs text-gray-400 mb-2">조작법</div>
            <div className="text-xs text-white space-y-1">
              <div className="font-semibold mb-1">키보드</div>
              <div>← → : 좌우 이동</div>
              <div>↓ : 빠른 낙하</div>
              <div>↑ : 회전</div>
              <div>Space : 즉시 낙하</div>
              <div>C : 홀드</div>
              <div>P : 일시정지</div>
              <div className="font-semibold mt-2 mb-1">모바일 터치</div>
              <div>←→↓↑ 스와이프 : 이동/회전</div>
              <div>탭 : 회전</div>
              <div>길게 누르기 : 즉시 낙하</div>
            </div>
            <div className="pt-2 border-t border-gray-700 mt-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-xs text-white hover:text-gray-300 flex items-center gap-2"
              >
                {soundEnabled ? '🔊' : '🔇'} 사운드 {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 게임 오버 / 일시정지 오버레이 */}
      {(state.isGameOver || state.isPaused) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            {state.isGameOver ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">게임 오버</h2>
                <p className="text-gray-300 mb-6">
                  최종 점수: {state.score.toLocaleString()}
                </p>
                <Button
                  onClick={() => dispatch({ type: 'RESTART' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  다시 시작
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">일시정지</h2>
                <Button
                  onClick={() => dispatch({ type: 'RESUME' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  계속하기
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

