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

    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json(
        { message: '템플릿을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      tags: template.tags ? JSON.parse(template.tags) : [],
      content: template.content,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    })
  } catch (error) {
    console.error('Get template error:', error)
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
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.tags !== undefined) updateData.tags = data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null
    if (data.content !== undefined) updateData.content = data.content

    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      tags: template.tags ? JSON.parse(template.tags) : [],
      content: template.content,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    })
  } catch (error) {
    console.error('Update template error:', error)
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

    await prisma.template.delete({
      where: { id },
    })

    return NextResponse.json({ message: '템플릿이 삭제되었습니다' })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
