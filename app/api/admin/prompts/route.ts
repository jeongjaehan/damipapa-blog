import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')

    const skip = page * size
    const take = size

    const [prompts, total] = await Promise.all([
      prisma.promptTemplate.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.promptTemplate.count(),
    ])

    return NextResponse.json({
      content: prompts,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: page >= Math.ceil(total / size) - 1,
    })
  } catch (error) {
    console.error('Get admin prompts error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const { title, description, systemPrompt, temperature, maxTokens, model } = await request.json()

    if (!title || !systemPrompt) {
      return NextResponse.json(
        { message: '제목과 시스템 프롬프트는 필수입니다' },
        { status: 400 }
      )
    }

    const prompt = await prisma.promptTemplate.create({
      data: {
        title,
        description: description || null,
        systemPrompt,
        temperature: temperature ?? 0.3,
        maxTokens: maxTokens ?? 4096,
        model: model || 'gpt-4o-mini',
        order: 0, // 기본값 0 사용
      },
    })

    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      systemPrompt: prompt.systemPrompt,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
      model: prompt.model,
      order: prompt.order,
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Create prompt template error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

