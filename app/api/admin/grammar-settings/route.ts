import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { DEFAULT_GRAMMAR_PROMPT_SETTINGS } from '@/lib/prompts'

// GET: 설정 조회 (기본값 반환 - 더 이상 User 모델에 저장하지 않음)
export async function GET(request: NextRequest) {
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

    // 기본값 반환 (프롬프트 템플릿 시스템 사용 권장)
    return NextResponse.json(DEFAULT_GRAMMAR_PROMPT_SETTINGS)
  } catch (error) {
    console.error('설정 조회 실패:', error)
    return NextResponse.json({ error: '설정 조회 실패' }, { status: 500 })
  }
}

// PUT: 설정 업데이트 (더 이상 지원하지 않음 - 프롬프트 템플릿 시스템 사용)
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

    // 프롬프트 템플릿 시스템 사용 권장
    return NextResponse.json({ 
      success: true,
      message: '프롬프트 템플릿 시스템을 사용해주세요. /admin/prompts에서 관리할 수 있습니다.'
    })
  } catch (error) {
    console.error('설정 저장 실패:', error)
    return NextResponse.json({ error: '설정 저장 실패' }, { status: 500 })
  }
}
