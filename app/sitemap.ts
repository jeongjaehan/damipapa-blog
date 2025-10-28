import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

async function fetchPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { isPrivate: false }, // 공개 포스트만
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return posts
  } catch (error) {
    console.error('Failed to fetch posts for sitemap:', error)
    return [] // 에러 발생 시 빈 배열 반환
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const posts = await fetchPosts()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/career`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postPages]
}
