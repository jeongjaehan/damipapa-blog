// 테트리스 게임 사운드 효과

class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    // 사용자 인터랙션 후 AudioContext가 suspended 상태일 수 있음
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // 사인파 톤 생성
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return

    this.ensureAudioContext().then(() => {
      if (!this.audioContext) return

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    })
  }

  // 블록 이동 사운드
  move() {
    this.playTone(200, 0.05, 'square', 0.1)
  }

  // 블록 회전 사운드
  rotate() {
    this.playTone(300, 0.08, 'square', 0.15)
  }

  // 블록 고정 사운드
  lock() {
    this.playTone(150, 0.1, 'sine', 0.2)
  }

  // 소프트 드롭 사운드
  softDrop() {
    this.playTone(250, 0.03, 'square', 0.08)
  }

  // 하드 드롭 사운드
  hardDrop() {
    this.playTone(100, 0.15, 'sine', 0.25)
  }

  // 라인 클리어 사운드 (1줄)
  clearLine(count: number) {
    if (count === 1) {
      // 단일 라인 클리어
      this.playTone(400, 0.15, 'sine', 0.3)
    } else if (count === 2) {
      // 더블 라인
      this.playTone(500, 0.2, 'sine', 0.35)
      setTimeout(() => this.playTone(600, 0.2, 'sine', 0.35), 100)
    } else if (count === 3) {
      // 트리플 라인
      this.playTone(500, 0.15, 'sine', 0.35)
      setTimeout(() => this.playTone(600, 0.15, 'sine', 0.35), 80)
      setTimeout(() => this.playTone(700, 0.15, 'sine', 0.35), 160)
    } else if (count === 4) {
      // 테트리스!
      this.playTone(400, 0.2, 'sine', 0.4)
      setTimeout(() => this.playTone(500, 0.2, 'sine', 0.4), 100)
      setTimeout(() => this.playTone(600, 0.2, 'sine', 0.4), 200)
      setTimeout(() => this.playTone(700, 0.3, 'sine', 0.4), 300)
    }
  }

  // 게임 오버 사운드
  gameOver() {
    this.playTone(150, 0.3, 'sawtooth', 0.4)
    setTimeout(() => this.playTone(100, 0.5, 'sawtooth', 0.4), 300)
  }

  // 사운드 활성화/비활성화
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  isEnabled() {
    return this.enabled
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager()

