import { promises as fs } from 'fs'
import path from 'path'
import { CareerData, Career } from '@/types'

const CAREER_FILE_PATH = path.join(process.cwd(), 'data', 'career.json')

/**
 * JSON 파일에서 경력 데이터 읽기
 */
export async function readCareerData(): Promise<CareerData> {
  try {
    const data = await fs.readFile(CAREER_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to read career data:', error)
    // 기본값 반환
    return {
      profile: {
        name: '다미파파',
        bio: '풀스택 개발자 | 블로그 운영자',
        email: 'contact@damipapa.com',
        linkedin: 'https://linkedin.com/in/damipapa',
      },
      careers: [],
    }
  }
}

/**
 * JSON 파일에 경력 데이터 쓰기
 */
export async function writeCareerData(data: CareerData): Promise<void> {
  await fs.writeFile(CAREER_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * 경력을 시작일자 기준으로 내림차순 정렬 (최신이 위)
 */
export function sortCareers(careers: Career[]): Career[] {
  return [...careers].sort((a, b) => {
    // endDate가 null인 경우 (현재 진행중) 가장 위에 표시
    if (a.endDate === null && b.endDate === null) {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    }
    if (a.endDate === null) return -1
    if (b.endDate === null) return 1
    
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
}

/**
 * 날짜 범위 포맷팅 (예: "2020.03 - 2024.12")
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}.${month}`
  }

  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : '현재'
  
  return `${start} - ${end}`
}

