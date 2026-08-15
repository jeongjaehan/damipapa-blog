'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CategoryWithChildren } from '@/types'

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
        className="flex items-center gap-1.5 py-1 text-sm"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            className="w-4 shrink-0 text-muted-foreground hover:text-foreground"
            aria-expanded={isOpen}
            aria-label={isOpen ? '접기' : '펼치기'}
          >
            {isOpen ? '−' : '+'}
          </button>
        ) : (
          <span aria-hidden="true" className="w-4 shrink-0" />
        )}

        <Link
          href={`/categories/${category.slug}`}
          className={`flex min-w-0 flex-1 items-center gap-1.5 ${
            isSelected
              ? 'font-bold text-foreground visited:text-foreground'
              : 'text-foreground visited:text-foreground hover:text-link'
          }`}
        >
          <span className="truncate">{category.name}</span>
          {category.isPrivate && showPrivate && (
            <span className="shrink-0 text-xs text-destructive">[비공개]</span>
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            ({category.postCount})
          </span>
        </Link>
      </div>

      {hasChildren && isOpen && (
        <div>
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
    <div>
      <h3 className="border-b border-border pb-1 text-sm font-bold">카테고리</h3>

      <div className="mt-2">
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
          <p className="py-1 text-sm text-muted-foreground">카테고리가 없습니다.</p>
        )}

        {uncategorizedCount > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <Link
              href="/categories/uncategorized"
              className={`flex items-center gap-1.5 py-1 pl-4 text-sm ${
                isUncategorizedSelected
                  ? 'font-bold text-foreground visited:text-foreground'
                  : 'text-foreground visited:text-foreground hover:text-link'
              }`}
            >
              <span>미분류</span>
              <span className="ml-auto text-xs text-muted-foreground">
                ({uncategorizedCount})
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
