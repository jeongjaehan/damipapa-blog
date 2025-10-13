import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    })

    const categories = posts
      .map((post) => post.category)
      .filter((cat): cat is string => cat !== null)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

