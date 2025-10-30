'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const renderChart = async () => {
      try {
        // Dynamic import for client-side rendering
        const mermaid = (await import('mermaid')).default
        
        // Mermaid 초기화
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          themeVariables: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            padding: 10,
          },
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: 10,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
          }
        })

        if (mermaidRef.current && mounted) {
          // 기존 내용 클리어
          mermaidRef.current.innerHTML = ''
          
          // 고유 ID 생성
          const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Mermaid 렌더링
          const { svg } = await mermaid.render(uniqueId, chart)
          
          if (mermaidRef.current && mounted) {
            mermaidRef.current.innerHTML = svg
            setIsLoading(false)
            setError(null)
          }
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : '다이어그램 렌더링 중 오류가 발생했습니다.')
          setIsLoading(false)
        }
      }
    }

    if (chart) {
      renderChart()
    }

    return () => {
      mounted = false
    }
  }, [chart])

  if (error) {
    return (
      <div className={`border border-red-200 bg-red-50 rounded-lg p-4 text-center ${className}`}>
        <p className="text-red-600 text-sm">다이어그램 오류</p>
        <p className="text-red-400 text-xs mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      <div
        ref={mermaidRef}
        className={`mermaid-container ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      />
    </div>
  )
}


