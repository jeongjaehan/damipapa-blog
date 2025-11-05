'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Check, AlertCircle, Settings, RotateCcw, Square, Play } from 'lucide-react'

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
  settingsLoaded?: boolean
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
  settingsLoaded = true,
}: GrammarCheckModalProps) {
  const streamingRef = useRef<HTMLPreElement>(null)

  // 스트리밍 중에 자동 스크롤
  useEffect(() => {
    if (isStreaming && streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight
    }
  }, [streamingContent, isStreaming])

  if (!isOpen) return null

  const hasContent = streamingContent.length > 0
  const isCustomized = systemPrompt !== defaultSystemPrompt || 
                      temperature !== 0.3 || 
                      maxTokens !== 4096

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">AI 문장 개선</h2>
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
              disabled={isStreaming}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 프롬프트 편집 섹션 */}
          {showPromptEditor && (
            <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  프롬프트 편집
                  {!settingsLoaded && (
                    <span className="ml-2 text-sm text-gray-500">(로딩 중...)</span>
                  )}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onResetPromptSettings}
                  className="gap-2"
                  disabled={!settingsLoaded}
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
                  disabled={!settingsLoaded || isStreaming}
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
                    disabled={!settingsLoaded || isStreaming}
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
                    disabled={!settingsLoaded || isStreaming}
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