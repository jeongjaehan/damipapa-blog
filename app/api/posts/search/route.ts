import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword') || ''
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')

    const skip = page * size
    const take = size

    const where = {
      published: true,
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ],
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.post.count({ where }),
    ])

    const content = posts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags ? JSON.parse(post.tags) : [],
      authorName: post.author.name,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
    }))

    return NextResponse.json({
      content,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: page >= Math.ceil(total / size) - 1,
    })
  } catch (error) {
    console.error('Search posts error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

