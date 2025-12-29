'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CategoryWithChildren } from '@/types'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Lock } from 'lucide-react'

interface CategoryTreeProps {
  categories: CategoryWithChildren[]
  uncategorizedCount: number
  selectedSlug?: string
  showPrivate?: boolean
}

interface CategoryNodeProps {
  category: CategoryWithChildren
  selectedSlug?: string
  level?: number
  showPrivate?: boolean
}

function CategoryNode({ category, selectedSlug, level = 0, showPrivate = false }: CategoryNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2) // 기본으로 2 depth까지 열림
  const hasChildren = category.children && category.children.length > 0
  const isSelected = selectedSlug === category.slug
  const paddingLeft = level * 16

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors
          ${isSelected 
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }
        `}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* 펼치기/접기 버튼 */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* 폴더 아이콘 */}
        {hasChildren ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 text-amber-500" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500" />
          )
        ) : (
          <FileText className="w-4 h-4 text-gray-400" />
        )}

        {/* 카테고리 링크 */}
        <Link
          href={`/categories/${category.slug}`}
          className="flex-1 flex items-center gap-2 min-w-0"
        >
          <span className="truncate font-medium">{category.name}</span>
          {category.isPrivate && showPrivate && (
            <Lock className="w-3 h-3 text-gray-400" />
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            ({category.postCount})
          </span>
        </Link>
      </div>

      {/* 하위 카테고리 */}
      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              selectedSlug={selectedSlug}
              level={level + 1}
              showPrivate={showPrivate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryTree({
  categories,
  uncategorizedCount,
  selectedSlug,
  showPrivate = false,
}: CategoryTreeProps) {
  const isUncategorizedSelected = selectedSlug === 'uncategorized'

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
        카테고리
      </h3>

      {/* 카테고리 트리 */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            selectedSlug={selectedSlug}
            showPrivate={showPrivate}
          />
        ))
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-2">
          카테고리가 없습니다
        </p>
      )}

      {/* 미분류 섹션 */}
      {uncategorizedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/categories/uncategorized"
            className={`
              flex items-center gap-2 py-2 px-3 rounded-lg transition-colors
              ${isUncategorizedSelected
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            <Folder className="w-4 h-4 text-gray-400" />
            <span className="font-medium">미분류</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              ({uncategorizedCount})
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}

