'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Check, AlertCircle, Square, Play, Edit, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PromptTemplate } from '@/types'
import { updatePromptTemplate } from '@/services/api'

interface GrammarCheckModalProps {
  isOpen: boolean
  onClose: () => void
  originalText: string
  streamingContent: string
  isStreaming: boolean
  onStartStreaming: () => void
  onCancelStreaming: () => void
  onApply: () => void
  error?: string
  // 프롬프트 템플릿 관련 props
  promptTemplates: PromptTemplate[]
  selectedTemplateId: number | null
  onTemplateSelect: (templateId: number | null) => void
  systemPrompt: string
  temperature: number
  maxTokens: number
  settingsLoaded?: boolean
  onPromptUpdate?: () => void // 프롬프트 업데이트 후 콜백
}

export default function GrammarCheckModal({
  isOpen,
  onClose,
  originalText,
  streamingContent,
  isStreaming,
  onStartStreaming,
  onCancelStreaming,
  onApply,
  error,
  promptTemplates,
  selectedTemplateId,
  onTemplateSelect,
  systemPrompt,
  temperature,
  maxTokens,
  settingsLoaded = true,
  onPromptUpdate,
}: GrammarCheckModalProps) {
  const streamingRef = useRef<HTMLPreElement>(null)
  const router = useRouter()
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSystemPrompt, setEditSystemPrompt] = useState('')
  const [editTemperature, setEditTemperature] = useState(0.3)
  const [editMaxTokens, setEditMaxTokens] = useState(4096)
  const [editModel, setEditModel] = useState('gpt-4o-mini')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // 스트리밍 중에 자동 스크롤
  useEffect(() => {
    if (isStreaming && streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight
    }
  }, [streamingContent, isStreaming])

  // 모달이 닫힐 때 편집 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setIsEditingPrompt(false)
      setIsDetailsExpanded(false)
      setSaveError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const hasContent = streamingContent.length > 0
  const selectedTemplate = promptTemplates.find(t => t.id === selectedTemplateId)

  // 편집 모드 시작
  const handleStartEdit = () => {
    if (selectedTemplate) {
      setEditTitle(selectedTemplate.title)
      setEditDescription(selectedTemplate.description || '')
      setEditSystemPrompt(selectedTemplate.systemPrompt)
      setEditTemperature(selectedTemplate.temperature)
      setEditMaxTokens(selectedTemplate.maxTokens)
      setEditModel(selectedTemplate.model)
      setIsEditingPrompt(true)
      setIsDetailsExpanded(true)
      setSaveError('')
    }
  }

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditingPrompt(false)
    setSaveError('')
  }

  // 저장
  const handleSavePrompt = async () => {
    if (!selectedTemplateId) return

    setSaveError('')
    setIsSaving(true)

    try {
      await updatePromptTemplate(selectedTemplateId, {
        title: editTitle,
        description: editDescription.trim() || undefined,
        systemPrompt: editSystemPrompt,
        temperature: editTemperature,
        maxTokens: editMaxTokens,
        model: editModel,
      })

      // 저장 후 선택된 템플릿 업데이트
      const updatedTemplate = promptTemplates.find(t => t.id === selectedTemplateId)
      if (updatedTemplate) {
        updatedTemplate.title = editTitle
        updatedTemplate.description = editDescription.trim() || undefined
        updatedTemplate.systemPrompt = editSystemPrompt
        updatedTemplate.temperature = editTemperature
        updatedTemplate.maxTokens = editMaxTokens
        updatedTemplate.model = editModel
      }

      // 프롬프트 설정도 업데이트
      onTemplateSelect(selectedTemplateId)

      // 부모 컴포넌트에 업데이트 알림
      if (onPromptUpdate) {
        onPromptUpdate()
      }

      setIsEditingPrompt(false)
    } catch (err: any) {
      setSaveError(err.response?.data?.message || '저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">AI 문장 개선</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isStreaming}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 프롬프트 선택 섹션 */}
          <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                프롬프트 선택
                {!settingsLoaded && (
                  <span className="ml-2 text-sm text-gray-500">(로딩 중...)</span>
                )}
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프롬프트 템플릿
              </label>
              <div className="relative">
                <select
                  value={selectedTemplateId || ''}
                  onChange={(e) => onTemplateSelect(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  disabled={!settingsLoaded || isStreaming}
                >
                  {promptTemplates.length === 0 ? (
                    <option value="">프롬프트가 없습니다</option>
                  ) : (
                    promptTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* 선택된 프롬프트 정보 표시 */}
            {selectedTemplate && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  disabled={!settingsLoaded || isStreaming}
                >
                  <span className="text-sm font-medium text-gray-700">프롬프트 상세 정보</span>
                  {isDetailsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {isDetailsExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
                    {saveError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {saveError}
                      </div>
                    )}

                    {isEditingPrompt ? (
                      // 편집 모드
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            제목 *
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            disabled={isSaving}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            설명
                          </label>
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            disabled={isSaving}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Temperature: {editTemperature}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={editTemperature}
                              onChange={(e) => setEditTemperature(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              disabled={isSaving}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Tokens
                            </label>
                            <input
                              type="number"
                              min="1000"
                              max="8000"
                              step="1"
                              value={editMaxTokens}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                if (value >= 1000 && value <= 8000) {
                                  setEditMaxTokens(value)
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              style={{ color: '#111827', backgroundColor: '#ffffff' }}
                              disabled={isSaving}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <div className="relative">
                            <select
                              value={editModel}
                              onChange={(e) => setEditModel(e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                              style={{ color: '#111827', backgroundColor: '#ffffff' }}
                              disabled={isSaving}
                            >
                              <option value="gpt-4o-mini">gpt-4o-mini</option>
                              <option value="gpt-4o">gpt-4o</option>
                              <option value="gpt-4-turbo">gpt-4-turbo</option>
                              <option value="gpt-5">gpt-5</option>
                              <option value="gpt-5-turbo">gpt-5-turbo</option>
                              <option value="gpt-5o">gpt-5o</option>
                              <option value="gpt-5o-mini">gpt-5o-mini</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            시스템 프롬프트 *
                          </label>
                          <textarea
                            value={editSystemPrompt}
                            onChange={(e) => setEditSystemPrompt(e.target.value)}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            disabled={isSaving}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            취소
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleSavePrompt}
                            disabled={isSaving || !editTitle.trim() || !editSystemPrompt.trim()}
                          >
                            {isSaving ? '저장 중...' : '저장'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 읽기 모드
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div>
                              <span className="text-sm font-medium text-gray-700">제목: </span>
                              <span className="text-sm text-gray-900">{selectedTemplate.title}</span>
                            </div>
                            {selectedTemplate.description && (
                              <div className="mt-1">
                                <span className="text-sm font-medium text-gray-700">설명: </span>
                                <span className="text-sm text-gray-600">{selectedTemplate.description}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleStartEdit}
                            className="gap-2 ml-4"
                            disabled={!settingsLoaded || isStreaming}
                          >
                            <Edit className="w-4 h-4" />
                            편집
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Temperature: </span>
                            <span className="text-sm text-gray-900">{temperature}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Max Tokens: </span>
                            <span className="text-sm text-gray-900">{maxTokens}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Model: </span>
                          <span className="text-sm text-gray-900">{selectedTemplate.model}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 mb-2 block">시스템 프롬프트: </span>
                          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                              {systemPrompt}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 시작 버튼 및 상태 */}
          {!hasContent && !isStreaming && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 문장 개선 시작</h3>
                <p className="text-gray-600 mb-6">아래 버튼을 클릭하여 실시간 문장 개선을 시작하세요.</p>
                <Button
                  onClick={onStartStreaming}
                  className="gap-2"
                  size="lg"
                >
                  <Play className="w-5 h-5" />
                  문장 개선 시작
                </Button>
              </div>
            </div>
          )}

          {/* 스트리밍 결과 */}
          {(hasContent || isStreaming) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
                  {isStreaming ? '실시간 개선 중...' : '개선된 문장'}
                </h3>
                {isStreaming && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancelStreaming}
                    className="gap-2"
                  >
                    <Square className="w-4 h-4" />
                    중단
                  </Button>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-[400px] max-h-[600px] overflow-y-auto">
                <pre 
                  ref={streamingRef}
                  className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans"
                >
                  {streamingContent}
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-blue-600 animate-pulse ml-1"></span>
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button
                  onClick={onStartStreaming}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 시도
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            {hasContent && !isStreaming && (
              <Button
                type="button"
                variant="outline"
                onClick={onStartStreaming}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                재생성
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isStreaming}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              취소
            </Button>
            {hasContent && !isStreaming && (
              <Button
                type="button"
                onClick={onApply}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                수정 적용
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}