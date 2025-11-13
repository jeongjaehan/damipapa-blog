import { NextRequest, NextResponse } from 'next/server'
import { readCareerData, writeCareerData } from '@/lib/career'
import { verifyToken } from '@/lib/auth'
import { Career } from '@/types'

// GET: 특정 경력 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readCareerData()
    const career = data.careers.find((c: Career) => c.id === id)

    if (!career) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(career)
  } catch (error) {
    console.error('경력 조회 실패:', error)
    return NextResponse.json({ error: '경력 조회 실패' }, { status: 500 })
  }
}

// PUT: 경력 수정 (ADMIN만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const data = await readCareerData()
    const careerIndex = data.careers.findIndex((c: Career) => c.id === id)

    if (careerIndex === -1) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    // 검증
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    const finalStartDate = startDate || data.careers[careerIndex].startDate
    const finalEndDate = endDate ?? data.careers[careerIndex].endDate

    if (endDate !== undefined && endDate !== null && !datePattern.test(endDate)) {
      return NextResponse.json(
        { error: '종료일자 형식이 올바르지 않습니다 (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (finalEndDate && new Date(finalEndDate) < new Date(finalStartDate)) {
      return NextResponse.json(
        { error: '종료일자는 시작일자보다 이후여야 합니다' },
        { status: 400 }
      )
    }

    // 업데이트
    if (startDate) data.careers[careerIndex].startDate = startDate
    if (endDate !== undefined) data.careers[careerIndex].endDate = endDate
    if (title) data.careers[careerIndex].title = title
    if (subtitle) data.careers[careerIndex].subtitle = subtitle
    if (description !== undefined) data.careers[careerIndex].description = description
    if (summaryDescription !== undefined) data.careers[careerIndex].summaryDescription = summaryDescription
    if (narrativeDescription !== undefined) data.careers[careerIndex].narrativeDescription = narrativeDescription

    await writeCareerData(data)

    return NextResponse.json(data.careers[careerIndex])
  } catch (error) {
    console.error('경력 수정 실패:', error)
    return NextResponse.json({ error: '경력 수정 실패' }, { status: 500 })
  }
}

// DELETE: 경력 삭제 (ADMIN만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const data = await readCareerData()
    const careerIndex = data.careers.findIndex((c: Career) => c.id === id)

    if (careerIndex === -1) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    data.careers.splice(careerIndex, 1)
    await writeCareerData(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('경력 삭제 실패:', error)
    return NextResponse.json({ error: '경력 삭제 실패' }, { status: 500 })
  }
}

