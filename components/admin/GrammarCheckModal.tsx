'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { X, Check, AlertCircle } from 'lucide-react'

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
}

export default function GrammarCheckModal({
  isOpen,
  onClose,
  original,
  corrected,
  changes,
  onApply,
  loading = false,
}: GrammarCheckModalProps) {
  if (!isOpen) return null

  const hasChanges = changes && changes.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">문법 검사 결과</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
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
              {/* Changes Summary */}
              {hasChanges ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        {changes.length}개의 수정 제안
                      </h3>
                      <ul className="space-y-2">
                        {changes.map((change, index) => (
                          <li key={index} className="text-sm">
                            <div className="flex gap-2">
                              <span className="text-red-600 line-through">
                                {change.original}
                              </span>
                              <span className="text-gray-500">→</span>
                              <span className="text-green-600 font-medium">
                                {change.corrected}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs mt-1 ml-4">
                              {change.reason}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-green-900 font-medium">
                      문법 오류가 발견되지 않았습니다!
                    </p>
                  </div>
                </div>
              )}

              {/* Side by side comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    원본
                  </h3>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                      {original}
                    </pre>
                  </div>
                </div>

                {/* Corrected */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    수정본
                  </h3>
                  <div className="border rounded-lg p-4 bg-green-50 min-h-[300px] max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
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

