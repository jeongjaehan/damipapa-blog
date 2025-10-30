/**
 * 한글 초성 추출 유틸리티
 */

// 한글 초성 리스트
const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

/**
 * 단일 한글 글자의 초성을 추출합니다.
 * @param char 한글 글자
 * @returns 초성 또는 원본 글자
 */
export const getChosung = (char: string): string => {
  const code = char.charCodeAt(0) - 44032
  
  // 한글이 아닌 경우 원본 반환
  if (code < 0 || code > 11171) {
    return char
  }
  
  // 초성 추출 (44032는 '가'의 유니코드)
  const chosungIndex = Math.floor(code / 588)
  return CHOSUNG_LIST[chosungIndex]
}

/**
 * 문자열에서 첫 번째 한글 글자의 초성을 추출합니다.
 * @param text 텍스트
 * @returns 초성 또는 첫 번째 글자
 */
export const getFirstChosung = (text: string): string => {
  if (!text || text.length === 0) {
    return '?'
  }
  
  const firstChar = text.charAt(0)
  return getChosung(firstChar)
}

/**
 * 문자열의 모든 한글 글자를 초성으로 변환합니다.
 * @param text 텍스트
 * @returns 초성 문자열
 */
export const getAllChosung = (text: string): string => {
  return text
    .split('')
    .map(char => getChosung(char))
    .join('')
}

/**
 * 프로젝트 제목에서 아이콘용 텍스트를 생성합니다.
 * @param title 프로젝트 제목
 * @param maxLength 최대 글자 수 (기본값: 2)
 * @returns 아이콘용 텍스트
 */
export const generateIconText = (title: string, maxLength: number = 2): string => {
  if (!title || title.length === 0) {
    return '?'
  }
  
  // 공백으로 분할된 단어들의 첫 글자들 조합
  const words = title.trim().split(/\s+/)
  
  if (words.length >= 2 && maxLength >= 2) {
    // 여러 단어가 있으면 각 단어의 첫 글자 초성 사용
    return words
      .slice(0, maxLength)
      .map(word => getFirstChosung(word))
      .join('')
  } else {
    // 한 단어이거나 짧은 경우 처음 글자들의 초성 사용
    return title
      .slice(0, maxLength)
      .split('')
      .map(char => getChosung(char))
      .join('')
  }
}

/**
 * 프로젝트 상태에 따른 색상을 반환합니다.
 * @param status 프로젝트 상태
 * @returns 색상 클래스명
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    planning: '#94a3b8',      // 회색 (기획중)
    'in-progress': '#f59e0b', // 주황색 (개발중)  
    completed: '#10b981',     // 초록색 (완료)
    launched: '#6366f1',      // 파란색 (런칭)
    paused: '#ef4444',        // 빨간색 (중단)
  }
  
  return colorMap[status] || colorMap.planning
}

/**
 * 프로젝트 상태의 한글 라벨을 반환합니다.
 * @param status 프로젝트 상태
 * @returns 한글 라벨
 */
export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    planning: '기획중',
    'in-progress': '개발중',
    completed: '완료',
    launched: '런칭',
    paused: '중단',
  }
  
  return labelMap[status] || '알 수 없음'
}


