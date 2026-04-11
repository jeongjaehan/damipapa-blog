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
          flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all duration-200
          ${isSelected
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted text-foreground/70 hover:text-foreground'
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
            className="p-0.5 hover:bg-muted rounded-lg"
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
            <FolderOpen className="w-4 h-4 text-primary" />
          ) : (
            <Folder className="w-4 h-4 text-primary" />
          )
        ) : (
          <FileText className="w-4 h-4 text-muted-foreground" />
        )}

        {/* 카테고리 링크 */}
        <Link
          href={`/categories/${category.slug}`}
          className="flex-1 flex items-center gap-2 min-w-0"
        >
          <span className="truncate font-medium">{category.name}</span>
          {category.isPrivate && showPrivate && (
            <Lock className="w-3 h-3 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground ml-auto">
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
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
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
        <p className="text-sm text-muted-foreground px-3 py-2">
          카테고리가 없습니다
        </p>
      )}

      {/* 미분류 섹션 */}
      {uncategorizedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/categories/uncategorized"
            className={`
              flex items-center gap-2 py-2 px-3 rounded-xl transition-all duration-200
              ${isUncategorizedSelected
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-foreground/70 hover:text-foreground'
              }
            `}
          >
            <Folder className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">미분류</span>
            <span className="text-xs text-muted-foreground ml-auto">
              ({uncategorizedCount})
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
