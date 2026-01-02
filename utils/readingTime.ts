/**
 * 읽기 시간 계산 유틸리티
 * 한국어: 500자/분, 영어: 200단어/분 기준
 * 이미지, 코드 블록도 읽는 시간에 포함
 */

/**
 * 콘텐츠의 예상 읽기 시간을 계산합니다.
 * @param content - 마크다운 또는 텍스트 콘텐츠
 * @returns 예상 읽기 시간 (분)
 */
export function calculateReadingTime(content: string): number {
  // 이미지 개수 (마크다운 이미지 + HTML img 태그)
  const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length +
                     (content.match(/<img[^>]*>/gi) || []).length
  
  // Mermaid 다이어그램 개수 (코드 블록 처리 전에 먼저 카운트)
  const mermaidCount = (content.match(/```mermaid/gi) || []).length
  
  // 코드 블록 추출 및 줄 수 계산 (Mermaid 제외)
  const codeBlocks = content.match(/```[\s\S]*?```/g) || []
  const codeLineCount = codeBlocks.reduce((total, block) => {
    // Mermaid 블록은 제외
    if (block.toLowerCase().startsWith('```mermaid')) {
      return total
    }
    const lines = block.split('\n').length - 2 // 시작/끝 ``` 제외
    return total + Math.max(0, lines)
  }, 0)
  
  // 텍스트 정리 (코드, 이미지 제거 후 순수 텍스트)
  const textOnly = content
    .replace(/<[^>]*>/g, '')  // HTML 태그 제거
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/`[^`]*`/g, '')  // 인라인 코드 제거
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 마크다운 제거
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크는 텍스트만 남기기
    .replace(/#{1,6}\s/g, '') // 헤딩 마크다운 제거
    .replace(/[*_~]+/g, '') // 볼드, 이탤릭, 취소선 마크다운 제거
    .replace(/>\s/g, '') // 인용문 마크다운 제거
    .replace(/[-*+]\s/g, '') // 리스트 마크다운 제거
    .replace(/\d+\.\s/g, '') // 숫자 리스트 마크다운 제거
  
  // 한글 글자 수 (공백 제외)
  const koreanChars = (textOnly.match(/[가-힣]/g) || []).length
  
  // 영문 단어 수
  const englishWords = (textOnly.match(/[a-zA-Z]+/g) || []).length
  
  // 숫자도 읽는 시간에 포함
  const numbers = (textOnly.match(/\d+/g) || []).length
  
  // 읽기 시간 계산 (분)
  // 텍스트: 한국어 500자/분, 영어 200단어/분
  const textMinutes = (koreanChars / 500) + ((englishWords + numbers) / 200)
  
  // 이미지: 개당 12초 (0.2분) - 이미지/다이어그램 이해 시간
  const imageMinutes = imageCount * 0.2
  
  // 코드: 줄당 3초 (0.05분) - 코드는 텍스트보다 천천히 읽음
  const codeMinutes = codeLineCount * 0.05
  
  // Mermaid 다이어그램: 개당 20초 (0.33분) - 아키텍처 이해 시간
  const mermaidMinutes = mermaidCount * 0.33
  
  const totalMinutes = textMinutes + imageMinutes + codeMinutes + mermaidMinutes
  
  // 최소 1분으로 표시
  return Math.max(1, Math.ceil(totalMinutes))
}

/**
 * 읽기 시간을 사람이 읽기 좋은 형태로 포맷합니다.
 * @param minutes - 읽기 시간 (분)
 * @returns 포맷된 문자열
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '1분 미만'
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `약 ${hours}시간`
    }
    return `약 ${hours}시간 ${remainingMinutes}분`
  }
  return `약 ${minutes}분`
}
