import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * API URL을 동적으로 생성합니다.
 * 환경 변수 NEXT_PUBLIC_API_URL이 설정되어 있으면 해당 값을 사용하고,
 * 그렇지 않으면 현재 포트를 감지하여 올바른 API URL을 생성합니다.
 */
export function getApiUrl(): string {
  // 환경 변수에서 직접 설정된 API URL이 있으면 사용
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // 브라우저 환경에서는 현재 포트를 사용
  if (typeof window !== 'undefined') {
    const currentPort = window.location.port || '3000'
    return `http://localhost:${currentPort}/api`
  }
  
  // 서버 환경에서는 환경 변수 포트를 사용
  const port = process.env.NEXT_PUBLIC_PORT || '3000'
  return `http://localhost:${port}/api`
}

