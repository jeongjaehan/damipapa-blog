import { NextRequest, NextResponse } from 'next/server'
import { readCareerData, writeCareerData, sortCareers } from '@/lib/career'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// GET: 경력 데이터 조회 (공개)
export async function GET() {
  try {
    const data = await readCareerData()
    const sortedCareers = sortCareers(data.careers)
    
    return NextResponse.json({
      profile: data.profile,
      careers: sortedCareers,
    })
  } catch (error) {
    console.error('경력 조회 실패:', error)
    return NextResponse.json({ error: '경력 조회 실패' }, { status: 500 })
  }
}

// POST: 경력 추가 (ADMIN만)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { startDate, endDate, title, subtitle, description, summaryDescription, narrativeDescription } = body

    // 필수 필드 검증
    if (!startDate || !title || !subtitle) {
      return NextResponse.json(
        { error: '시작일자, 제목, 부제목은 필수입니다' },
        { status: 400 }
      )
    }

    // 날짜 형식 검증
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(startDate)) {
      return NextResponse.json(
        { error: '시작일자 형식이 올바르지 않습니다 (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (endDate && !datePattern.test(endDate)) {
      return NextResponse.json(
        { error: '종료일자 형식이 올바르지 않습니다 (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // 종료일자는 시작일자보다 이후여야 함
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { error: '종료일자는 시작일자보다 이후여야 합니다' },
        { status: 400 }
      )
    }

    const data = await readCareerData()
    const newCareer = {
      id: uuidv4(),
      startDate,
      endDate,
      title,
      subtitle,
      description,
      summaryDescription,
      narrativeDescription,
    }

    data.careers.push(newCareer)
    await writeCareerData(data)

    return NextResponse.json(newCareer)
  } catch (error) {
    console.error('경력 추가 실패:', error)
    return NextResponse.json({ error: '경력 추가 실패' }, { status: 500 })
  }
}

