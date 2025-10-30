// 모바일 터치 제어 유틸리티

export interface TouchStart {
  x: number
  y: number
  time: number
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number // 픽셀/밀리초
  duration: number // 밀리초
}

const SWIPE_THRESHOLD = 30 // 최소 스와이프 거리 (픽셀)
const LONG_PRESS_TIME = 300 // 길게 누르기 시간 (밀리초)

export class TouchController {
  private touchStart: TouchStart | null = null
  private longPressTimer: number | null = null
  private onSwipe: (direction: SwipeDirection) => void
  private onLongPress: () => void
  private onTap: () => void

  constructor(
    onSwipe: (direction: SwipeDirection) => void,
    onLongPress: () => void,
    onTap: () => void
  ) {
    this.onSwipe = onSwipe
    this.onLongPress = onLongPress
    this.onTap = onTap
  }

  handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }

    // 길게 누르기 타이머 시작
    this.longPressTimer = window.setTimeout(() => {
      if (this.touchStart) {
        this.onLongPress()
        this.touchStart = null
      }
    }, LONG_PRESS_TIME)
  }

  handleTouchMove = (e: React.TouchEvent) => {
    // 이동 중이면 길게 누르기 취소
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  handleTouchEnd = (e: React.TouchEvent) => {
    // 길게 누르기 타이머 취소
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    if (!this.touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - this.touchStart.x
    const deltaY = touch.clientY - this.touchStart.y
    const deltaTime = Date.now() - this.touchStart.time
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 짧은 시간 내에 작은 이동이면 탭으로 간주
    if (deltaTime < 200 && distance < SWIPE_THRESHOLD) {
      this.onTap()
      this.touchStart = null
      return
    }

    // 스와이프 감지
    if (distance > SWIPE_THRESHOLD) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      const velocity = distance / Math.max(deltaTime, 1) // 픽셀/밀리초

      if (absX > absY) {
        // 수평 스와이프
        if (deltaX > 0) {
          this.onSwipe({ 
            direction: 'right', 
            distance: absX,
            velocity,
            duration: deltaTime
          })
        } else {
          this.onSwipe({ 
            direction: 'left', 
            distance: absX,
            velocity,
            duration: deltaTime
          })
        }
      } else {
        // 수직 스와이프
        if (deltaY > 0) {
          this.onSwipe({ 
            direction: 'down', 
            distance: absY,
            velocity,
            duration: deltaTime
          })
        } else {
          this.onSwipe({ 
            direction: 'up', 
            distance: absY,
            velocity,
            duration: deltaTime
          })
        }
      }
    }

    this.touchStart = null
  }

  cleanup() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }
}

