import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { DEFAULT_GRAMMAR_PROMPT_SETTINGS } from '@/lib/prompts'

const prisma = new PrismaClient()

// GET: 설정 조회
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

    const userData = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        grammarSystemPrompt: true,
        grammarTemperature: true,
        grammarMaxTokens: true,
      },
    })

    // 설정이 없으면 기본값 반환
    const settings = {
      systemPrompt: userData?.grammarSystemPrompt || DEFAULT_GRAMMAR_PROMPT_SETTINGS.systemPrompt,
      temperature: userData?.grammarTemperature ?? DEFAULT_GRAMMAR_PROMPT_SETTINGS.temperature,
      maxTokens: userData?.grammarMaxTokens ?? DEFAULT_GRAMMAR_PROMPT_SETTINGS.maxTokens,
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('설정 조회 실패:', error)
    return NextResponse.json({ error: '설정 조회 실패' }, { status: 500 })
  }
}

// PUT: 설정 업데이트
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

    const { systemPrompt, temperature, maxTokens } = await request.json()

    await prisma.user.update({
      where: { email: user.email },
      data: {
        grammarSystemPrompt: systemPrompt,
        grammarTemperature: temperature,
        grammarMaxTokens: maxTokens,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('설정 저장 실패:', error)
    return NextResponse.json({ error: '설정 저장 실패' }, { status: 500 })
  }
}
