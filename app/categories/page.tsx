'use client'

import { useEffect, useState } from 'react'
import { getCategoryTree } from '@/services/api'
import { CategoryTree as CategoryTreeType } from '@/types'
import Loading from '@/components/common/Loading'
import CategoryTree from '@/components/category/CategoryTree'
import { Folder } from 'lucide-react'

export default function CategoriesPage() {
  const [categoryData, setCategoryData] = useState<CategoryTreeType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoryTree()
        setCategoryData(data)
      } catch (error) {
        console.error('카테고리 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  if (loading) {
    return <Loading />
  }

  const totalPosts = categoryData
    ? categoryData.categories.reduce(
        (sum, cat) => sum + countPosts(cat),
        categoryData.uncategorizedCount
      )
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Folder className="w-8 h-8 text-amber-500" />
          <h1 className="text-4xl font-bold text-foreground">카테고리</h1>
        </div>
        <p className="text-muted-foreground">
          총 {totalPosts}개의 포스트가 있습니다. 카테고리를 선택하여 관련 글을 확인하세요.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {categoryData && (
          <CategoryTree
            categories={categoryData.categories}
            uncategorizedCount={categoryData.uncategorizedCount}
          />
        )}
      </div>
    </div>
  )
}

// 카테고리와 하위 카테고리의 총 포스트 수 계산
function countPosts(category: CategoryTreeType['categories'][0]): number {
  let count = category.postCount
  if (category.children) {
    for (const child of category.children) {
      count += countPosts(child)
    }
  }
  return count
}

