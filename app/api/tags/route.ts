import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, tags: { not: null } },
      select: { tags: true },
    })

    const tagsSet = new Set<string>()
    posts.forEach((post) => {
      if (post.tags) {
        try {
          const tags = JSON.parse(post.tags)
          tags.forEach((tag: string) => tagsSet.add(tag))
        } catch (e) {
          // 파싱 실패 시 무시
        }
      }
    })

    return NextResponse.json(Array.from(tagsSet))
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

