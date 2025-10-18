'use client'

import { useEffect, useState } from 'react'
import { getPosts } from '@/services/api'
import Link from 'next/link'
import Loading from '@/components/common/Loading'

interface TagWithRatio {
  name: string
  count: number
  ratio: number
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithRatio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTags = async () => {
      try {
        // 모든 포스트 가져오기 (충분한 size로)
        const data = await getPosts(0, 10000)
        const posts = data.content

        // 각 태그의 사용 횟수 계산
        const tagMap = new Map<string, number>()
        posts.forEach((post) => {
          post.tags?.forEach((tag) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
          })
        })

        // 태그별 비율 계산
        const totalPosts = posts.length
        const tagsWithRatio: TagWithRatio[] = Array.from(tagMap.entries())
          .map(([name, count]) => ({
            name,
            count,
            ratio: (count / totalPosts) * 100,
          }))
          .sort((a, b) => b.ratio - a.ratio)

        setTags(tagsWithRatio)
      } catch (error) {
        console.error('태그 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  const getSizeClass = (ratio: number) => {
    if (ratio >= 20) return 'text-2xl'
    if (ratio >= 10) return 'text-lg'
    return 'text-base'
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">태그 목록</h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        {tags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">태그가 없습니다</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {tags.map((tag, index) => (
              <Link
                key={tag.name}
                href={`/?tag=${tag.name}`}
                className={`bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors animate-pulse-scale ${getSizeClass(
                  tag.ratio
                )}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
                title={`${tag.count}개 포스트 (${tag.ratio.toFixed(1)}%)`}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

