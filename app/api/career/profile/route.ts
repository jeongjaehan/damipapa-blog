import { NextRequest, NextResponse } from 'next/server'
import { readCareerData, writeCareerData } from '@/lib/career'
import { verifyToken } from '@/lib/auth'

// GET: 프로필 정보 조회 (공개)
export async function GET() {
  try {
    const data = await readCareerData()
    return NextResponse.json(data.profile)
  } catch (error) {
    console.error('프로필 조회 실패:', error)
    return NextResponse.json({ error: '프로필 조회 실패' }, { status: 500 })
  }
}

// PUT: 프로필 정보 수정 (ADMIN만)
export async function PUT(request: NextRequest) {
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
    const { name, bio, email, linkedin, avatar } = body

    // 필수 필드 검증
    if (!name || !bio || !email || !linkedin) {
      return NextResponse.json(
        { error: '이름, 한줄소개, 이메일, 링크드인은 필수입니다' },
        { status: 400 }
      )
    }

    const data = await readCareerData()
    data.profile = {
      name,
      bio,
      email,
      linkedin,
      avatar: avatar || '',
    }

    await writeCareerData(data)

    return NextResponse.json(data.profile)
  } catch (error) {
    console.error('프로필 수정 실패:', error)
    return NextResponse.json({ error: '프로필 수정 실패' }, { status: 500 })
  }
}

