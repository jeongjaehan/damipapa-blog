'use client'

import React, { useState, useEffect } from 'react'
import { Career } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Save, X } from 'lucide-react'

interface CareerFormProps {
  career: Career | null
  onSave: (data: Omit<Career, 'id'>) => void
  onCancel: () => void
}

export default function CareerForm({ career, onSave, onCancel }: CareerFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [summaryDescription, setSummaryDescription] = useState('')
  const [narrativeDescription, setNarrativeDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (career) {
      setStartDate(career.startDate)
      setEndDate(career.endDate || '')
      setIsCurrent(career.endDate === null)
      setTitle(career.title)
      setSubtitle(career.subtitle)
      setDescription(career.description || '')
      setSummaryDescription(career.summaryDescription || '')
      setNarrativeDescription(career.narrativeDescription || '')
    } else {
      setStartDate('')
      setEndDate('')
      setIsCurrent(false)
      setTitle('')
      setSubtitle('')
      setDescription('')
      setSummaryDescription('')
      setNarrativeDescription('')
    }
  }, [career])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!startDate.trim()) {
      newErrors.startDate = '시작일자를 입력해주세요'
    }

    if (!isCurrent && !endDate.trim()) {
      newErrors.endDate = '종료일자를 입력하거나 현재 재직중을 선택해주세요'
    }

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (!subtitle.trim()) {
      newErrors.subtitle = '부제목을 입력해주세요'
    }

    // 날짜 형식 검증
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (startDate && !datePattern.test(startDate)) {
      newErrors.startDate = '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'
    }

    if (endDate && !datePattern.test(endDate)) {
      newErrors.endDate = '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'
    }

    // 종료일자는 시작일자보다 이후여야 함
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = '종료일자는 시작일자보다 이후여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSave({
      startDate: startDate.trim(),
      endDate: isCurrent ? null : endDate.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim() || undefined,
      summaryDescription: summaryDescription.trim() || undefined,
      narrativeDescription: narrativeDescription.trim() || undefined,
    })
  }

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle>{career ? '경력 수정' : '새 경력 추가'}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 시작일자 */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              시작일자 <span className="text-red-500">*</span>
            </label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>

          {/* 현재 재직중 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isCurrent" className="text-sm font-medium text-gray-700">
              현재 재직중
            </label>
          </div>

          {/* 종료일자 */}
          {!isCurrent && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                종료일자 <span className="text-red-500">*</span>
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          )}

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 다미파파"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* 부제목 */}
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              부제목 <span className="text-red-500">*</span>
            </label>
            <Input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="예: CTO"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              className={errors.subtitle ? 'border-red-500' : ''}
            />
            {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
          </div>

          {/* 요약형 설명 */}
          <div>
            <label htmlFor="summaryDescription" className="block text-sm font-medium text-gray-700 mb-2">
              요약형 설명
            </label>
            <Textarea
              id="summaryDescription"
              value={summaryDescription}
              onChange={(e) => setSummaryDescription(e.target.value)}
              placeholder="요약 형식의 간결한 설명을 입력하세요"
              rows={6}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
            <p className="text-xs text-gray-500 mt-1">간결하고 요약된 형식으로 작성해주세요</p>
          </div>

          {/* 서술형 설명 */}
          <div>
            <label htmlFor="narrativeDescription" className="block text-sm font-medium text-gray-700 mb-2">
              서술형 설명
            </label>
            <Textarea
              id="narrativeDescription"
              value={narrativeDescription}
              onChange={(e) => setNarrativeDescription(e.target.value)}
              placeholder="서술 형식의 자세한 설명을 입력하세요"
              rows={8}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
            <p className="text-xs text-gray-500 mt-1">자세하고 이야기 형식으로 작성해주세요</p>
          </div>

          {/* 기존 상세 설명 (하위 호환성) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              기존 상세 설명 (하위 호환성)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="기존 description 필드 (요약형/서술형 버전이 없을 때 사용)"
              rows={4}
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
            <p className="text-xs text-gray-500 mt-1">요약형/서술형 버전이 모두 없을 때만 사용됩니다</p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              취소
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

