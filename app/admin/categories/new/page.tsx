'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAdminCategoryTree, createCategory } from '@/services/api'
import { CategoryWithChildren, CreateCategoryRequest } from '@/types'
import Loading from '@/components/common/Loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewCategoryPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [allCategories, setAllCategories] = useState<CategoryWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [parentId, setParentId] = useState<number | null>(null)
  const [order, setOrder] = useState(0)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
    }
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAdminCategoryTree()
        setAllCategories(flattenCategories(data.categories))
      } catch (error) {
        console.error('카테고리 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadCategories()
    }
  }, [isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !slug.trim()) {
      alert('이름과 슬러그는 필수입니다.')
      return
    }

    setSaving(true)
    try {
      const data: CreateCategoryRequest = {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || undefined,
        isPrivate,
        order,
        parentId,
      }
      await createCategory(data)
      router.push('/admin/categories')
    } catch (error: unknown) {
      const errorMessage = '카테고리 생성에 실패했습니다.'
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        alert(axiosError.response?.data?.message || errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  // 이름에서 슬러그 자동 생성
  const handleNameChange = (value: string) => {
    setName(value)
    // 한글을 포함한 슬러그 생성 (공백은 하이픈으로)
    const autoSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9가-힣\-]/g, '')
    setSlug(autoSlug)
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  // 선택된 부모의 depth 확인 (최대 depth 제한)
  const selectedParent = allCategories.find((c) => c.id === parentId)
  const parentDepth = selectedParent?.depth ?? -1
  const canAddChild = parentDepth < 4 // depth 4까지만 허용 (0~4 = 5 depth)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          카테고리 목록으로
        </Link>
        <h1 className="text-3xl font-bold text-foreground">새 카테고리 추가</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              카테고리 이름 *
            </label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 개발, 일상"
              required
            />
          </div>

          {/* 슬러그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              슬러그 (URL) *
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="예: development, daily"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL에 사용됩니다: /categories/{slug || 'slug'}
            </p>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="카테고리에 대한 간단한 설명"
            />
          </div>

          {/* 상위 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              상위 카테고리
            </label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
              className="
                w-full rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                px-4 py-2.5
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              "
            >
              <option value="">없음 (최상위 카테고리)</option>
              {allCategories
                .filter((c) => c.depth < 4) // depth 4 이상은 하위 추가 불가
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {'　'.repeat(category.depth)}{category.name} (depth: {category.depth})
                  </option>
                ))}
            </select>
            {parentId && !canAddChild && (
              <p className="text-xs text-red-500 mt-1">
                최대 5 depth까지만 생성 가능합니다.
              </p>
            )}
          </div>

          {/* 순서 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              정렬 순서
            </label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              min={0}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              숫자가 작을수록 먼저 표시됩니다.
            </p>
          </div>

          {/* 비공개 여부 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300">
              비공개 카테고리 (관리자만 볼 수 있음)
            </label>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/categories">
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={saving || (parentId !== null && !canAddChild)}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// 카테고리 트리를 평탄화
function flattenCategories(categories: CategoryWithChildren[]): CategoryWithChildren[] {
  const result: CategoryWithChildren[] = []
  for (const cat of categories) {
    result.push(cat)
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children))
    }
  }
  return result
}

