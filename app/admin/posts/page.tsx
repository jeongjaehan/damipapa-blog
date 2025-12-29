'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllPostsForAdmin, deletePost, getAdminCategoryTree, updatePost } from '@/services/api'
import { PostSummary, CategoryWithChildren } from '@/types'
import { formatDate } from '@/utils/date'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Copy, EyeOff, Folder, ChevronDown, Check, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

// 카테고리 트리를 평탄화하는 함수
function flattenCategories(categories: CategoryWithChildren[], depth: number = 0): { id: number; name: string; depth: number }[] {
  const result: { id: number; name: string; depth: number }[] = []
  for (const cat of categories) {
    result.push({ id: cat.id, name: cat.name, depth })
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children, depth + 1))
    }
  }
  return result
}

interface CategorySelectProps {
  postId: number
  currentCategoryId: number | null
  currentCategoryName: string | null
  categories: { id: number; name: string; depth: number }[]
  onUpdate: (postId: number, categoryId: number | null) => Promise<void>
}

function CategorySelect({ postId, currentCategoryId, currentCategoryName, categories, onUpdate }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = async (categoryId: number | null) => {
    if (categoryId === currentCategoryId) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(postId, categoryId)
      setIsOpen(false)
    } catch (error) {
      console.error('카테고리 변경 실패:', error)
      alert('카테고리 변경에 실패했습니다')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          flex items-center gap-1.5 px-2 py-1 text-sm rounded-md border transition-colors
          ${currentCategoryId 
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' 
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}
          hover:bg-gray-100 dark:hover:bg-gray-700
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Folder className="w-3.5 h-3.5" />
        )}
        <span className="max-w-[100px] truncate">
          {currentCategoryName || '미분류'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
          {/* 미분류 옵션 */}
          <button
            onClick={() => handleSelect(null)}
            className={`
              w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800
              ${currentCategoryId === null ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            <Folder className="w-4 h-4 text-gray-400" />
            <span>미분류</span>
            {currentCategoryId === null && <Check className="w-4 h-4 ml-auto" />}
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          {/* 카테고리 목록 */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`
                w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800
                ${currentCategoryId === cat.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
              `}
              style={{ paddingLeft: `${12 + cat.depth * 16}px` }}
            >
              <Folder className="w-4 h-4 text-amber-500" />
              <span className="truncate">{cat.name}</span>
              {currentCategoryId === cat.id && <Check className="w-4 h-4 ml-auto shrink-0" />}
            </button>
          ))}

          {categories.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              카테고리가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AdminPostsPageContent() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allPosts, setAllPosts] = useState<PostSummary[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string; depth: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  const filter = searchParams.get('filter')

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAdminCategoryTree()
        setCategories(flattenCategories(data.categories))
      } catch (error) {
        console.error('카테고리 로딩 실패:', error)
      }
    }
    if (isAdmin) {
      loadCategories()
    }
  }, [isAdmin])

  const loadPosts = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 0) {
      setLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      // API URL 직접 사용
      const baseUrl = '/api'
      const url = filter ? `${baseUrl}/admin/posts?page=${pageNum}&size=10&filter=${filter}` : `${baseUrl}/admin/posts?page=${pageNum}&size=10`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      
      if (isInitial) {
        setAllPosts(data.content)
        console.log('📌 초기 로드:', { page: pageNum, count: data.content.length, last: data.last })
      } else {
        setAllPosts((prev) => [...prev, ...data.content])
        console.log('📌 추가 로드:', { page: pageNum, count: data.content.length, last: data.last })
      }

      setCurrentPage(pageNum)
      setHasMore(!data.last)
    } catch (error) {
      console.error('❌ 포스트 로딩 실패:', error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [filter])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadPosts(0, true)
    }
  }, [isAdmin, authLoading, router])

  // 필터가 변경될 때마다 포스트 다시 로드
  useEffect(() => {
    if (isAdmin) {
      loadPosts(0, true)
    }
  }, [isAdmin, loadPosts])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deletePost(id)
      setAllPosts((prev) => prev.filter((post) => post.id !== id))
    } catch (error) {
      console.error('포스트 삭제 실패:', error)
      alert('포스트 삭제에 실패했습니다')
    }
  }

  const handleCopySecretLink = async (post: PostSummary) => {
    if (!post.secretToken) return
    
    const secretUrl = `${window.location.origin}/posts/${post.id}?token=${post.secretToken}`
    
    try {
      await navigator.clipboard.writeText(secretUrl)
      alert('비밀 링크가 클립보드에 복사되었습니다')
    } catch (error) {
      console.error('링크 복사 실패:', error)
      alert('링크 복사에 실패했습니다')
    }
  }

  const handleCategoryUpdate = async (postId: number, categoryId: number | null) => {
    await updatePost(postId, { categoryId })
    
    // 로컬 상태 업데이트
    setAllPosts((prev) => prev.map((post) => {
      if (post.id === postId) {
        const category = categoryId ? categories.find(c => c.id === categoryId) : null
        return {
          ...post,
          categoryId,
          categoryName: category?.name || null,
          categorySlug: null // slug는 따로 가져와야 하지만 UI에서 사용하지 않으므로 null 처리
        }
      }
      return post
    }))
  }

  // Intersection Observer
  useEffect(() => {
    if (!observerTarget.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting
        console.log('👀 Observer 감지:', { isIntersecting, hasMore, isLoadingMore })
        
        if (isIntersecting && hasMore && !isLoadingMore && !loading) {
          console.log('🚀 다음 페이지 로드 트리거')
          loadPosts(currentPage + 1, false)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [currentPage, hasMore, isLoadingMore, loading, loadPosts])

  if (authLoading || (loading && allPosts.length === 0)) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">포스트 관리</h1>
          <p className="text-muted-foreground mt-2">
            {filter === 'private' ? '비공개 포스트를 관리하세요' : '모든 포스트를 관리하세요'}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-md border border-border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                제목
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                작성일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                댓글
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {allPosts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-primary hover:text-primary/80"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <CategorySelect
                    postId={post.id}
                    currentCategoryId={post.categoryId || null}
                    currentCategoryName={post.categoryName || null}
                    categories={categories}
                    onUpdate={handleCategoryUpdate}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {post.isPrivate && (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        비공개
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {post.commentCount}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <Link href={`/admin/posts/edit/${post.id}`}>
                    <Button size="sm" variant="outline">편집</Button>
                  </Link>
                  {post.isPrivate && post.secretToken && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopySecretLink(post)}
                      className="gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      링크
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(post.id, post.title)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allPosts.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>포스트가 없습니다</p>
          </div>
        )}
      </div>

      {/* Intersection Observer 트리거 */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
        {isLoadingMore && <p className="text-muted-foreground">로딩 중...</p>}
      </div>

      {!hasMore && allPosts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">더 이상 포스트가 없습니다</p>
        </div>
      )}
    </div>
  )
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPostsPageContent />
    </Suspense>
  )
}
