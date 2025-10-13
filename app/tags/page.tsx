'use client'

import { useEffect, useState } from 'react'
import { getAllTags } from '@/services/api'
import Link from 'next/link'
import Loading from '@/components/common/Loading'

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await getAllTags()
        setTags(data)
      } catch (error) {
        console.error('태그 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

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
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}`}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

