'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getAdminCategoryTree, deleteCategory, createCategory, updateCategory } from '@/services/api'
import { CategoryTree as CategoryTreeType, CategoryWithChildren } from '@/types'
import Loading from '@/components/common/Loading'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Lock, 
  Folder, 
  FolderOpen,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Check,
  X,
  Loader2
} from 'lucide-react'

interface CategoryNodeProps {
  category: CategoryWithChildren
  level: number
  onDelete: (id: number, name: string) => void
  onUpdate: (id: number, name: string) => Promise<void>
  onAddChild: (parentId: number, name: string) => Promise<void>
  onDragStart: (e: React.DragEvent, category: CategoryWithChildren) => void
  onDragOver: (e: React.DragEvent, category: CategoryWithChildren, position: 'before' | 'after' | 'child') => void
  onDragEnd: () => void
  onDrop: (e: React.DragEvent, targetCategory: CategoryWithChildren, position: 'before' | 'after' | 'child') => void
  draggedCategory: CategoryWithChildren | null
  dropTarget: { id: number; position: 'before' | 'after' | 'child' } | null
}

function CategoryNode({
  category,
  level,
  onDelete,
  onUpdate,
  onAddChild,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  draggedCategory,
  dropTarget,
}: CategoryNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)

  const hasChildren = category.children && category.children.length > 0
  const canAddChild = category.depth < 4 // depth 4까지만 (0~4 = 5 depth)
  const isDragging = draggedCategory?.id === category.id
  const isDropBefore = dropTarget?.id === category.id && dropTarget?.position === 'before'
  const isDropAfter = dropTarget?.id === category.id && dropTarget?.position === 'after'
  const isDropChild = dropTarget?.id === category.id && dropTarget?.position === 'child'

  // 편집 모드 시작 시 포커스
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  // 하위 추가 모드 시작 시 포커스
  useEffect(() => {
    if (isAddingChild && addInputRef.current) {
      addInputRef.current.focus()
    }
  }, [isAddingChild])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditName(category.name)
  }

  const handleEditSave = async () => {
    if (!editName.trim() || editName === category.name) {
      setIsEditing(false)
      setEditName(category.name)
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(category.id, editName.trim())
      setIsEditing(false)
    } catch {
      setEditName(category.name)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditName(category.name)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const handleAddChildSave = async () => {
    if (!newChildName.trim()) {
      setIsAddingChild(false)
      setNewChildName('')
      return
    }

    setIsSaving(true)
    try {
      await onAddChild(category.id, newChildName.trim())
      setIsAddingChild(false)
      setNewChildName('')
      setIsOpen(true) // 하위 카테고리 보이도록 펼침
    } catch {
      // 에러는 상위에서 처리
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddChildCancel = () => {
    setIsAddingChild(false)
    setNewChildName('')
  }

  const handleAddChildKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddChildSave()
    } else if (e.key === 'Escape') {
      handleAddChildCancel()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedCategory || draggedCategory.id === category.id) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    let position: 'before' | 'after' | 'child'
    if (y < height * 0.25) {
      position = 'before'
    } else if (y > height * 0.75) {
      position = 'after'
    } else {
      position = 'child'
    }

    onDragOver(e, category, position)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!dropTarget) return
    onDrop(e, category, dropTarget.position)
  }

  return (
    <div className="select-none">
      {/* 드롭 위치 표시 - before */}
      {isDropBefore && (
        <div className="h-0.5 bg-blue-500 rounded-full mx-4 -mb-0.5 relative z-10" />
      )}

      <div
        draggable={!isEditing && !isAddingChild}
        onDragStart={(e) => onDragStart(e, category)}
        onDragOver={handleDragOver}
        onDragEnd={onDragEnd}
        onDrop={handleDrop}
        className={`
          group flex items-center gap-2 py-2 px-3 rounded-lg transition-all
          ${isDragging ? 'opacity-50' : ''}
          ${isDropChild ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
        `}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* 드래그 핸들 */}
        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* 펼치기/접기 */}
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* 폴더 아이콘 */}
        {hasChildren ? (
          isOpen ? (
            <FolderOpen className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-5 h-5 text-amber-500 shrink-0" />
          )
        ) : (
          <Folder className="w-5 h-5 text-gray-400 shrink-0" />
        )}

        {/* 카테고리 이름 (편집 모드) */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={editInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleEditSave}
              disabled={isSaving}
              className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <>
                <button onClick={handleEditSave} className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleEditCancel} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* 카테고리 이름 (보기 모드) */}
            <span
              onDoubleClick={handleDoubleClick}
              className="flex-1 font-medium text-gray-900 dark:text-gray-100 cursor-text truncate"
              title="더블클릭하여 수정"
            >
              {category.name}
            </span>

            {/* 비공개 표시 */}
            {category.isPrivate && (
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            )}

            {/* 포스트 수 */}
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
              ({category.postCount})
            </span>

            {/* 액션 버튼 (호버 시 표시) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {canAddChild && (
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                  title="하위 카테고리 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <Link href={`/admin/categories/edit/${category.id}`}>
                <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded" title="수정">
                  <Pencil className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={() => onDelete(category.id, category.name)}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 드롭 위치 표시 - after */}
      {isDropAfter && (
        <div className="h-0.5 bg-blue-500 rounded-full mx-4 -mt-0.5 relative z-10" />
      )}

      {/* 하위 카테고리 인라인 추가 폼 */}
      {isAddingChild && (
        <div
          className="flex items-center gap-2 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          style={{ marginLeft: `${(level + 1) * 24}px`, marginTop: '4px' }}
        >
          <Folder className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            ref={addInputRef}
            type="text"
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={handleAddChildKeyDown}
            placeholder="새 카테고리 이름"
            disabled={isSaving}
            className="flex-1 px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <>
              <button onClick={handleAddChildSave} className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleAddChildCancel} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* 하위 카테고리 */}
      {hasChildren && isOpen && (
        <div className="mt-1">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              draggedCategory={draggedCategory}
              dropTarget={dropTarget}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categoryData, setCategoryData] = useState<CategoryTreeType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingRoot, setIsAddingRoot] = useState(false)
  const [newRootName, setNewRootName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const addRootInputRef = useRef<HTMLInputElement>(null)
  
  // 드래그 앤 드롭 상태
  const [draggedCategory, setDraggedCategory] = useState<CategoryWithChildren | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: number; position: 'before' | 'after' | 'child' } | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
    }
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAddingRoot && addRootInputRef.current) {
      addRootInputRef.current.focus()
    }
  }, [isAddingRoot])

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAdminCategoryTree()
      setCategoryData(data)
    } catch (error) {
      console.error('카테고리 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadCategories()
    }
  }, [isAdmin, loadCategories])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 글들은 미분류로 이동합니다.`)) {
      return
    }

    try {
      await deleteCategory(id)
      await loadCategories()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '카테고리 삭제에 실패했습니다.'
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        alert(axiosError.response?.data?.message || errorMessage)
      } else {
        alert(errorMessage)
      }
    }
  }

  const handleUpdate = async (id: number, name: string) => {
    // 슬러그 자동 생성
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9가-힣\-]/g, '')

    await updateCategory(id, { name, slug })
    await loadCategories()
  }

  const handleAddChild = async (parentId: number, name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9가-힣\-]/g, '')

    try {
      await createCategory({ name, slug, parentId })
      await loadCategories()
    } catch (error: unknown) {
      const errorMessage = '카테고리 생성에 실패했습니다.'
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        alert(axiosError.response?.data?.message || errorMessage)
      } else {
        alert(errorMessage)
      }
      throw error
    }
  }

  const handleAddRootSave = async () => {
    if (!newRootName.trim()) {
      setIsAddingRoot(false)
      setNewRootName('')
      return
    }

    setIsSaving(true)
    try {
      const slug = newRootName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9가-힣\-]/g, '')

      await createCategory({ name: newRootName.trim(), slug, parentId: null })
      await loadCategories()
      setIsAddingRoot(false)
      setNewRootName('')
    } catch (error: unknown) {
      const errorMessage = '카테고리 생성에 실패했습니다.'
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        alert(axiosError.response?.data?.message || errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRootKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRootSave()
    } else if (e.key === 'Escape') {
      setIsAddingRoot(false)
      setNewRootName('')
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, category: CategoryWithChildren) => {
    setDraggedCategory(category)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, category: CategoryWithChildren, position: 'before' | 'after' | 'child') => {
    if (!draggedCategory || draggedCategory.id === category.id) return

    // 자기 자신의 하위로 드롭 방지
    if (position === 'child' && isDescendant(draggedCategory, category.id)) return

    // depth 제한 체크
    if (position === 'child') {
      const newDepth = category.depth + 1
      const draggedMaxDepth = getMaxDepth(draggedCategory)
      if (newDepth + draggedMaxDepth > 4) return
    }

    setDropTarget({ id: category.id, position })
  }

  const handleDragEnd = () => {
    setDraggedCategory(null)
    setDropTarget(null)
  }

  const handleDrop = async (e: React.DragEvent, targetCategory: CategoryWithChildren, position: 'before' | 'after' | 'child') => {
    e.preventDefault()
    
    if (!draggedCategory || !dropTarget) return

    try {
      let newParentId: number | null
      let newOrder: number

      if (position === 'child') {
        newParentId = targetCategory.id
        newOrder = targetCategory.children?.length ?? 0
      } else {
        newParentId = targetCategory.parentId ?? null
        // before/after 위치에 따른 순서 계산
        newOrder = position === 'before' ? targetCategory.order : targetCategory.order + 1
      }

      await updateCategory(draggedCategory.id, { parentId: newParentId, order: newOrder })
      await loadCategories()
    } catch (error: unknown) {
      const errorMessage = '카테고리 이동에 실패했습니다.'
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        alert(axiosError.response?.data?.message || errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setDraggedCategory(null)
      setDropTarget(null)
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  const totalCategories = categoryData ? countCategories(categoryData.categories) : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">카테고리 관리</h1>
          <p className="text-muted-foreground mt-1">
            총 {totalCategories}개의 카테고리 · 미분류 {categoryData?.uncategorizedCount || 0}개
          </p>
        </div>
        <Button onClick={() => setIsAddingRoot(true)} disabled={isAddingRoot}>
          <Plus className="w-4 h-4 mr-2" />
          새 카테고리
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        {/* 도움말 */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <p>💡 <strong>팁:</strong> 드래그하여 순서 변경, 더블클릭하여 이름 수정, + 버튼으로 하위 카테고리 추가</p>
        </div>

        {/* 최상위 카테고리 추가 폼 */}
        {isAddingRoot && (
          <div className="flex items-center gap-2 py-2 px-3 mb-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Folder className="w-5 h-5 text-green-500 shrink-0" />
            <input
              ref={addRootInputRef}
              type="text"
              value={newRootName}
              onChange={(e) => setNewRootName(e.target.value)}
              onKeyDown={handleAddRootKeyDown}
              placeholder="새 카테고리 이름"
              disabled={isSaving}
              className="flex-1 px-2 py-1 text-sm border border-green-300 dark:border-green-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            ) : (
              <>
                <button onClick={handleAddRootSave} className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setIsAddingRoot(false); setNewRootName('') }} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* 카테고리 트리 */}
        <div className="space-y-1">
          {categoryData?.categories.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              level={0}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onAddChild={handleAddChild}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              draggedCategory={draggedCategory}
              dropTarget={dropTarget}
            />
          ))}

          {(!categoryData || categoryData.categories.length === 0) && !isAddingRoot && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>등록된 카테고리가 없습니다</p>
              <p className="text-sm mt-1">위의 "새 카테고리" 버튼을 클릭하여 추가하세요</p>
            </div>
          )}
        </div>

        {/* 미분류 섹션 */}
        {categoryData && categoryData.uncategorizedCount > 0 && (
          <>
            <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
            <div className="flex items-center gap-2 py-2 px-3 text-gray-500 dark:text-gray-400">
              <Folder className="w-5 h-5" />
              <span className="font-medium">미분류</span>
              <span className="text-xs">({categoryData.uncategorizedCount})</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 카테고리 총 개수 계산
function countCategories(categories: CategoryWithChildren[]): number {
  let count = categories.length
  for (const cat of categories) {
    if (cat.children) {
      count += countCategories(cat.children)
    }
  }
  return count
}

// 특정 ID가 카테고리의 자손인지 확인
function isDescendant(category: CategoryWithChildren, targetId: number): boolean {
  if (!category.children) return false
  for (const child of category.children) {
    if (child.id === targetId) return true
    if (isDescendant(child, targetId)) return true
  }
  return false
}

// 카테고리 트리의 최대 depth 계산
function getMaxDepth(category: CategoryWithChildren): number {
  if (!category.children || category.children.length === 0) return 0
  return 1 + Math.max(...category.children.map(getMaxDepth))
}
