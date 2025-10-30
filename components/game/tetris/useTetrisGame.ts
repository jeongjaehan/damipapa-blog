// 테트리스 게임 훅

'use client'

import React, { useReducer, useEffect, useCallback, useRef } from 'react'
import {
  GameState,
  GameAction,
  TetrominoType,
  CellState,
} from './types'
import {
  createEmptyBoard,
  createTetromino,
  checkCollision,
  rotateTetromino,
  placeTetromino,
  findFullLines,
  clearLines,
  calculateScore,
  calculateLevel,
  getDropSpeed,
  checkGameOver,
  getHardDropPosition,
  PieceBag,
} from './gameLogic'
import { NEXT_QUEUE_SIZE } from './constants'
import { soundManager } from './sound'

const initialState: GameState = {
  board: createEmptyBoard(),
  currentPiece: null,
  nextPieces: [],
  heldPiece: null,
  canHold: true,
  score: 0,
  level: 1,
  linesCleared: 0,
  isPaused: false,
  isGameOver: false,
  dropTimer: 0,
  lastDropTime: 0,
}

function gameReducer(state: GameState, action: GameAction, pieceBagRef: React.MutableRefObject<PieceBag | null>): GameState {
  if (state.isGameOver && action.type !== 'RESTART') {
    return state
  }

  if (state.isPaused && action.type !== 'RESUME' && action.type !== 'RESTART') {
    return state
  }

  switch (action.type) {
    case 'MOVE_LEFT': {
      if (!state.currentPiece) return state

      const moved: typeof state.currentPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, x: state.currentPiece.position.x - 1 },
      }

      if (checkCollision(state.board, moved)) {
        return state
      }

      soundManager.move()
      return { ...state, currentPiece: moved }
    }

    case 'MOVE_RIGHT': {
      if (!state.currentPiece) return state

      const moved: typeof state.currentPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, x: state.currentPiece.position.x + 1 },
      }

      if (checkCollision(state.board, moved)) {
        return state
      }

      soundManager.move()
      return { ...state, currentPiece: moved }
    }

    case 'MOVE_DOWN':
    case 'TICK': {
      if (!state.currentPiece) return state

      const moved: typeof state.currentPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, y: state.currentPiece.position.y + 1 },
      }

      if (checkCollision(state.board, moved)) {
        // 블록 고정
        soundManager.lock()
        let newBoard = placeTetromino(state.board, state.currentPiece)
        const clearedLines = findFullLines(newBoard)
        
        if (clearedLines.length > 0) {
          newBoard = clearLines(newBoard, clearedLines)
          soundManager.clearLine(clearedLines.length)
        }

        const newLinesCleared = state.linesCleared + clearedLines.length
        const newLevel = calculateLevel(newLinesCleared)
        const lineScore = calculateScore(clearedLines.length)
        const newScore = state.score + lineScore

        // 다음 블록 생성
        if (!pieceBagRef.current) {
          pieceBagRef.current = new PieceBag()
        }
        const pieceBag = pieceBagRef.current
        const nextType = pieceBag.getNext()
        const nextPieces = pieceBag.peekMultiple(NEXT_QUEUE_SIZE - 1).concat([nextType])
        const newPiece = createTetromino(nextPieces[0])

        // 게임 오버 체크
        const gameOver = checkGameOver(newBoard) || checkCollision(newBoard, newPiece)
        
        if (gameOver) {
          soundManager.gameOver()
        }

        return {
          ...state,
          board: newBoard,
          currentPiece: gameOver ? null : newPiece,
          nextPieces: gameOver ? [] : nextPieces.slice(1),
          score: newScore,
          level: newLevel,
          linesCleared: newLinesCleared,
          isGameOver: gameOver,
          canHold: true,
          dropTimer: 0,
          lastDropTime: Date.now(),
        }
      }

      return { ...state, currentPiece: moved, dropTimer: 0 }
    }

    case 'SOFT_DROP': {
      if (!state.currentPiece) return state

      const moved: typeof state.currentPiece = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, y: state.currentPiece.position.y + 1 },
      }

      if (checkCollision(state.board, moved)) {
        return state
      }

      soundManager.softDrop()
      const dropScore = calculateScore(0, false, 1)
      return {
        ...state,
        currentPiece: moved,
        score: state.score + dropScore,
        dropTimer: 0,
      }
    }

    case 'HARD_DROP': {
      if (!state.currentPiece) return state

      const dropPosition = getHardDropPosition(state.board, state.currentPiece)
      const dropDistance = dropPosition.y - state.currentPiece.position.y

      const dropped: typeof state.currentPiece = {
        ...state.currentPiece,
        position: dropPosition,
      }

      soundManager.hardDrop()
      
      // 블록 고정
      soundManager.lock()
      let newBoard = placeTetromino(state.board, dropped)
      const clearedLines = findFullLines(newBoard)
      
      if (clearedLines.length > 0) {
        newBoard = clearLines(newBoard, clearedLines)
        soundManager.clearLine(clearedLines.length)
      }

      const newLinesCleared = state.linesCleared + clearedLines.length
      const newLevel = calculateLevel(newLinesCleared)
      const dropScore = calculateScore(clearedLines.length, true, dropDistance)
      const lineScore = calculateScore(clearedLines.length)
      const newScore = state.score + dropScore + lineScore

      // 다음 블록 생성
      if (!pieceBagRef.current) {
        pieceBagRef.current = new PieceBag()
      }
      const pieceBag = pieceBagRef.current
      const nextType = pieceBag.getNext()
      const nextPieces = pieceBag.peekMultiple(NEXT_QUEUE_SIZE - 1).concat([nextType])
      const newPiece = createTetromino(nextPieces[0])

      // 게임 오버 체크
      const gameOver = checkGameOver(newBoard) || checkCollision(newBoard, newPiece)
      
      if (gameOver) {
        soundManager.gameOver()
      }

      return {
        ...state,
        board: newBoard,
        currentPiece: gameOver ? null : newPiece,
        nextPieces: gameOver ? [] : nextPieces.slice(1),
        score: newScore,
        level: newLevel,
        linesCleared: newLinesCleared,
        isGameOver: gameOver,
        canHold: true,
        dropTimer: 0,
        lastDropTime: Date.now(),
      }
    }

    case 'ROTATE': {
      if (!state.currentPiece) return state

      const rotated = rotateTetromino(state.board, state.currentPiece)
      if (!rotated) return state

      soundManager.rotate()
      return { ...state, currentPiece: rotated }
    }

    case 'HOLD': {
      if (!state.currentPiece || !state.canHold) return state

      const newHeldPiece = state.currentPiece.type
      let newCurrentPiece: Tetromino | null = null
      let newNextPieces = [...state.nextPieces]

      if (state.heldPiece) {
        // 홀드된 블록과 교환
        newCurrentPiece = createTetromino(state.heldPiece)
      } else {
        // 다음 블록 가져오기
        if (state.nextPieces.length > 0) {
          newCurrentPiece = createTetromino(state.nextPieces[0])
          newNextPieces = state.nextPieces.slice(1)
        } else {
          if (!pieceBagRef.current) {
            pieceBagRef.current = new PieceBag()
          }
          const pieceBag = pieceBagRef.current
          const nextType = pieceBag.getNext()
          const nextPieces = pieceBag.peekMultiple(NEXT_QUEUE_SIZE - 1).concat([nextType])
          newCurrentPiece = createTetromino(nextPieces[0])
          newNextPieces = nextPieces.slice(1)
        }
      }

      // 게임 오버 체크
      const gameOver = newCurrentPiece ? checkCollision(state.board, newCurrentPiece) : false

      return {
        ...state,
        currentPiece: gameOver ? null : newCurrentPiece,
        nextPieces: newNextPieces,
        heldPiece: newHeldPiece,
        canHold: false,
        isGameOver: gameOver,
      }
    }

    case 'PAUSE':
      return { ...state, isPaused: true }

    case 'RESUME':
      return { ...state, isPaused: false, lastDropTime: Date.now() }

    case 'RESTART': {
      if (!pieceBagRef.current) {
        pieceBagRef.current = new PieceBag()
      }
      const pieceBag = pieceBagRef.current
      const initialPieces = pieceBag.peekMultiple(NEXT_QUEUE_SIZE)
      const initialPiece = createTetromino(initialPieces[0])

      return {
        ...initialState,
        currentPiece: initialPiece,
        nextPieces: initialPieces.slice(1),
        lastDropTime: Date.now(),
      }
    }

    default:
      return state
  }
}

export function useTetrisGame() {
  const pieceBagRef = useRef<PieceBag | null>(null)
  const [state, dispatch] = useReducer((state: GameState, action: GameAction) => {
    return gameReducer(state, action, pieceBagRef)
  }, initialState)

  // 초기화
  useEffect(() => {
    if (!pieceBagRef.current) {
      pieceBagRef.current = new PieceBag()
      dispatch({ type: 'RESTART' })
    }
  }, [])

  // 자동 낙하
  useEffect(() => {
    if (state.isPaused || state.isGameOver || !state.currentPiece) {
      return
    }

    const speed = getDropSpeed(state.level)
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, speed)

    return () => clearInterval(interval)
  }, [state.level, state.isPaused, state.isGameOver, state.currentPiece])

  // 키보드 이벤트 핸들러
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (state.isGameOver) {
      if (e.key === ' ' || e.key === 'Enter') {
        dispatch({ type: 'RESTART' })
      }
      return
    }

    if (state.isPaused) {
      if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        dispatch({ type: 'RESUME' })
      }
      return
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        dispatch({ type: 'MOVE_LEFT' })
        break
      case 'ArrowRight':
        e.preventDefault()
        dispatch({ type: 'MOVE_RIGHT' })
        break
      case 'ArrowDown':
        e.preventDefault()
        dispatch({ type: 'SOFT_DROP' })
        break
      case 'ArrowUp':
        e.preventDefault()
        dispatch({ type: 'ROTATE' })
        break
      case ' ':
        e.preventDefault()
        dispatch({ type: 'HARD_DROP' })
        break
      case 'c':
      case 'C':
        e.preventDefault()
        dispatch({ type: 'HOLD' })
        break
      case 'p':
      case 'P':
        e.preventDefault()
        dispatch({ type: 'PAUSE' })
        break
    }
  }, [state.isGameOver, state.isPaused])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return {
    state,
    dispatch,
  }
}

