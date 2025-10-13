'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchPosts } from '@/services/api'
import { PostSummary, PageResponse } from '@/types'
import PostCard from '@/components/post/PostCard'
import Loading from '@/components/common/Loading'

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('q') || ''
  
  const [posts, setPosts] = useState<PageResponse<PostSummary> | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(keyword)

  useEffect(() => {
    if (keyword) {
      handleSearch(keyword)
    }
  }, [keyword])

  const handleSearch = async (term: string) => {
    if (!term.trim()) return

    setLoading(true)
    try {
      const results = await searchPosts(term)
      setPosts(results)
    } catch (error) {
      console.error('검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">검색</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            검색
          </button>
        </div>
      </form>

      {loading && <Loading />}

      {posts && !loading && (
        <>
          <p className="text-gray-600 mb-6">
            &quot;{keyword}&quot; 검색 결과: {posts.totalElements}개
          </p>

          {posts.content.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.content.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">검색 결과가 없습니다</p>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default function SearchPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Suspense fallback={<Loading />}>
        <SearchContent />
      </Suspense>
    </div>
  )
}

