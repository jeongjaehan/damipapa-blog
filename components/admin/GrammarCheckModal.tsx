'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { X, Check, AlertCircle, Settings, RotateCcw } from 'lucide-react'

interface Change {
  original: string
  corrected: string
  reason: string
}

interface GrammarCheckModalProps {
  isOpen: boolean
  onClose: () => void
  original: string
  corrected: string
  changes: Change[]
  onApply: () => void
  loading?: boolean
  // 프롬프트 편집 관련 props
  systemPrompt: string
  onSystemPromptChange: (value: string) => void
  temperature: number
  onTemperatureChange: (value: number) => void
  maxTokens: number
  onMaxTokensChange: (value: number) => void
  showPromptEditor: boolean
  onTogglePromptEditor: (show: boolean) => void
  defaultSystemPrompt: string
  onResetPromptSettings: () => void
}

export default function GrammarCheckModal({
  isOpen,
  onClose,
  original,
  corrected,
  changes,
  onApply,
  loading = false,
  systemPrompt,
  onSystemPromptChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  showPromptEditor,
  onTogglePromptEditor,
  defaultSystemPrompt,
  onResetPromptSettings,
}: GrammarCheckModalProps) {
  if (!isOpen) return null

  const hasChanges = changes && changes.length > 0
  const isCustomized = systemPrompt !== defaultSystemPrompt || 
                      temperature !== 0.3 || 
                      maxTokens !== 4096

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">문법 검사 결과</h2>
          <div className="flex items-center gap-3">
            {/* 프롬프트 편집 토글 버튼 */}
            <Button
              type="button"
              variant={showPromptEditor ? "default" : "outline"}
              size="sm"
              onClick={() => onTogglePromptEditor(!showPromptEditor)}
              className={`gap-2 ${isCustomized ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <Settings className="w-4 h-4" />
              프롬프트 편집
              {isCustomized && (
                <span className="w-2 h-2 bg-white rounded-full"></span>
              )}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">문법 검사 중...</p>
              </div>
            </div>
          ) : (
            <>
              {/* 프롬프트 편집 섹션 */}
              {showPromptEditor && (
                <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">프롬프트 편집</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onResetPromptSettings}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      기본값 복원
                    </Button>
                  </div>

                  {/* 시스템 프롬프트 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시스템 프롬프트
                    </label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => onSystemPromptChange(e.target.value)}
                      className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="시스템 프롬프트를 입력하세요..."
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    />
                  </div>

                  {/* GPT 설정 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature: {temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>일관적 (0.0)</span>
                        <span>창의적 (1.0)</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        💡 낮을수록 일관적, 높을수록 창의적
                      </p>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        min="1000"
                        max="8000"
                        step="100"
                        value={maxTokens}
                        onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        💡 응답 최대 길이 설정 (1000-8000)
                      </p>
                    </div>
                  </div>

                  {/* Model 정보 */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Model:</strong> gpt-4o-mini (고정)
                    </p>
                  </div>
                </div>
              )}

              {/* 검사 결과 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 원본 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    원본
                  </h3>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                      {original}
                    </pre>
                  </div>
                </div>

                {/* 수정본 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    수정본
                  </h3>
                  <div className="border rounded-lg p-4 bg-green-50 min-h-[400px] max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                      {corrected}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          {hasChanges && (
            <Button
              type="button"
              onClick={onApply}
              disabled={loading}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              수정 적용
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}