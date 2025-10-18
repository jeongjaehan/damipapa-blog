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

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.template.count(),
    ])

    return NextResponse.json({
      content: templates,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: page >= Math.ceil(total / size) - 1,
    })
  } catch (error) {
    console.error('Get admin templates error:', error)
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

    const { name, description, tags, content } = await request.json()

    if (!name || !description || !content) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다' },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        content,
      },
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
    console.error('Create template error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
