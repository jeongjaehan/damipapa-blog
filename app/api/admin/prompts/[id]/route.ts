import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: idParam } = await params
    const id = parseInt(idParam)

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!prompt) {
      return NextResponse.json(
        { message: '프롬프트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

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
    console.error('Get prompt template error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const data = await request.json()

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.systemPrompt !== undefined) updateData.systemPrompt = data.systemPrompt
    if (data.temperature !== undefined) updateData.temperature = data.temperature
    if (data.maxTokens !== undefined) updateData.maxTokens = data.maxTokens
    if (data.model !== undefined) updateData.model = data.model
    if (data.order !== undefined) updateData.order = data.order

    const prompt = await prisma.promptTemplate.update({
      where: { id },
      data: updateData,
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
    console.error('Update prompt template error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: idParam } = await params
    const id = parseInt(idParam)

    await prisma.promptTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ message: '프롬프트가 삭제되었습니다' })
  } catch (error) {
    console.error('Delete prompt template error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

