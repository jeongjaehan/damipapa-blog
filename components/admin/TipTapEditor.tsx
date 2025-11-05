'use client'

import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Youtube from '@tiptap/extension-youtube'
import { common, createLowlight } from 'lowlight'
import TurndownService from 'turndown'
import { marked } from 'marked'
import { Button } from '@/components/ui/button'
import { smartCompressImage } from '@/utils/imageUtils'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
  Play,
  SpellCheck,
} from 'lucide-react'
import GrammarCheckModal from './GrammarCheckModal'
import UrlInputModal from './UrlInputModal'
import api from '@/services/api'
import { DEFAULT_GRAMMAR_PROMPT_SETTINGS, GrammarPromptSettings } from '@/lib/prompts'

const lowlight = createLowlight(common)

interface TipTapEditorProps {
  content: string
  onChange: (markdown: string) => void
  onImageUpload: (file: File) => Promise<string>
}

// HTML to Markdown converter
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// Configure turndown for better markdown conversion
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content: string) => `~~${content}~~`,
})

// YouTube iframe to markdown conversion
turndownService.addRule('youtube', {
  filter: (node: any) => {
    return (
      node.tagName === 'IFRAME' &&
      node.getAttribute('src')?.includes('youtube.com/embed')
    )
  },
  replacement: (content: string, node: any) => {
    const src = node.getAttribute('src') || ''
    return `\n${src}\n\n`
  },
})

export default function TipTapEditor({
  content,
  onChange,
  onImageUpload,
}: TipTapEditorProps) {
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamController, setStreamController] = useState<AbortController | null>(null)
  const [streamError, setStreamError] = useState<string | undefined>()
  
  // 프롬프트 편집 상태
  const [promptSettings, setPromptSettings] = useState<GrammarPromptSettings>(DEFAULT_GRAMMAR_PROMPT_SETTINGS)
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // URL 입력 모달 상태
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false)

  // 초기 설정 로딩
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/admin/grammar-settings')
        setPromptSettings(response.data)
      } catch (error) {
        console.error('설정 로딩 실패:', error)
        // API 호출 실패 시 기본값 사용
        setPromptSettings(DEFAULT_GRAMMAR_PROMPT_SETTINGS)
      } finally {
        setSettingsLoaded(true)
      }
    }
    loadSettings()
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder: '내용을 작성하세요...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Youtube.configure({
        // This extension is not yet available in tiptap-extensions,
        // so we'll keep it commented out or remove it if not needed.
        // For now, we'll just add the import.
        // HTMLAttributes: {
        //   class: 'youtube-iframe',
        // },
      }),
    ],
    content: content ? marked.parse(content) as string : '',
    onUpdate: ({ editor }: { editor: any }) => {
      const html = editor.getHTML()
      const markdown = turndownService.turndown(html)
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
      handlePaste: (view, event) => {
        return handlePaste(view, event)
      },
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = turndownService.turndown(editor.getHTML())
      if (currentMarkdown !== content) {
        editor.commands.setContent(marked.parse(content) as string)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    setIsLinkModalOpen(true)
  }

  const handleLinkSubmit = (url: string) => {
    editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          // 이미지 압축
          console.log('이미지 압축 중...')
          const compressedFile = await smartCompressImage(file)
          
          // 압축된 파일 업로드
          const url = await onImageUpload(compressedFile)
          editor.chain().focus().setImage({ src: url }).run()
        } catch (error) {
          console.error('Image upload failed:', error)
          alert('이미지 업로드에 실패했습니다.')
        }
      }
    }
    input.click()
  }

  const addYoutube = () => {
    setIsYoutubeModalOpen(true)
  }

  const handleYoutubeSubmit = (url: string) => {
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  // Handle paste events to upload base64 images
  const handlePaste = (view: any, event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return false

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        const file = item.getAsFile()
        if (file) {
          // 압축 후 업로드 (비동기)
          smartCompressImage(file)
            .then((compressedFile) => onImageUpload(compressedFile))
            .then((url) => {
              editor.chain().focus().setImage({ src: url }).run()
            })
            .catch((error) => {
              console.error('Image upload failed:', error)
              alert('이미지 업로드에 실패했습니다.')
            })
        }
        return true
      }
    }
    return false
  }

  // Grammar check function - open modal
  const handleGrammarCheck = () => {
    if (!editor) return

    const html = editor.getHTML()
    const markdown = turndownService.turndown(html)

    if (!markdown.trim()) {
      alert('검사할 내용이 없습니다.')
      return
    }

    setOriginalText(markdown)
    setStreamingContent('')
    setStreamError(undefined)
    setIsGrammarModalOpen(true)
  }

  // Start streaming grammar check
  const handleStartStreaming = async () => {
    if (!originalText) return

    // 이전 스트림이 있다면 취소
    if (streamController) {
      streamController.abort()
    }

    const controller = new AbortController()
    setStreamController(controller)
    setIsStreaming(true)
    setStreamingContent('')
    setStreamError(undefined)

    try {
      const response = await fetch('/api/grammar/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          systemPrompt: promptSettings.systemPrompt,
          temperature: promptSettings.temperature,
          maxTokens: promptSettings.maxTokens,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '문법 검사 중 오류가 발생했습니다.')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('스트리밍 응답을 받을 수 없습니다.')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }
              
              if (data.fullContent) {
                setStreamingContent(data.fullContent)
              }
              
              if (data.done) {
                setIsStreaming(false)
                setStreamController(null)
                return
              }
            } catch (parseError) {
              console.error('JSON parsing error:', parseError)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Streaming error:', error)
      if (error.name === 'AbortError') {
        console.log('스트리밍이 사용자에 의해 취소되었습니다.')
      } else {
        setStreamError(error.message || '문법 검사 중 오류가 발생했습니다.')
      }
      setIsStreaming(false)
      setStreamController(null)
    }
  }

  // Cancel streaming
  const handleCancelStreaming = () => {
    if (streamController) {
      streamController.abort()
      setStreamController(null)
    }
    setIsStreaming(false)
  }

  // Apply grammar corrections
  const handleApplyCorrections = () => {
    if (!editor || !streamingContent) return

    // Convert markdown to HTML and set as editor content
    const html = marked.parse(streamingContent) as string
    editor.commands.setContent(html)
    onChange(streamingContent)

    setIsGrammarModalOpen(false)
    setStreamingContent('')
    setOriginalText('')
  }

  // Close grammar modal
  const handleCloseGrammarModal = () => {
    // 스트리밍 중이라면 취소
    handleCancelStreaming()
    
    setIsGrammarModalOpen(false)
    setStreamingContent('')
    setOriginalText('')
    setStreamError(undefined)
  }

  // 프롬프트 설정 업데이트 및 서버 저장
  const updatePromptSettings = async (newSettings: Partial<GrammarPromptSettings>) => {
    const updatedSettings = { ...promptSettings, ...newSettings }
    setPromptSettings(updatedSettings)
    
    // API로 저장
    try {
      await api.put('/admin/grammar-settings', updatedSettings)
    } catch (error) {
      console.error('설정 저장 실패:', error)
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 기본값 복원
  const resetPromptSettings = async () => {
    setPromptSettings(DEFAULT_GRAMMAR_PROMPT_SETTINGS)
    
    try {
      await api.put('/admin/grammar-settings', DEFAULT_GRAMMAR_PROMPT_SETTINGS)
    } catch (error) {
      console.error('설정 복원 실패:', error)
      alert('설정 복원에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          title="굵게 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          title="기울임 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-gray-200' : ''}
          title="취소선"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-gray-200' : ''}
          title="인라인 코드"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
          title="제목 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
          title="제목 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          title="목록"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          title="번호 목록"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          title="인용"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
          title="코드 블록"
        >
          <Code2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link & Image */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
          title="링크"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          title="이미지"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addYoutube}
          title="유튜브"
        >
          <Play className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Grammar Check */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleGrammarCheck}
          disabled={isStreaming}
          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          title="문법 검사 (AI)"
        >
          <SpellCheck className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시 실행 (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Grammar Check Modal */}
      <GrammarCheckModal
        isOpen={isGrammarModalOpen}
        onClose={handleCloseGrammarModal}
        originalText={originalText}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        onStartStreaming={handleStartStreaming}
        onCancelStreaming={handleCancelStreaming}
        onApply={handleApplyCorrections}
        error={streamError}
        // 프롬프트 편집 관련 props
        systemPrompt={promptSettings.systemPrompt}
        onSystemPromptChange={(value) => updatePromptSettings({ systemPrompt: value })}
        temperature={promptSettings.temperature}
        onTemperatureChange={(value) => updatePromptSettings({ temperature: value })}
        maxTokens={promptSettings.maxTokens}
        onMaxTokensChange={(value) => updatePromptSettings({ maxTokens: value })}
        showPromptEditor={showPromptEditor}
        onTogglePromptEditor={setShowPromptEditor}
        defaultSystemPrompt={DEFAULT_GRAMMAR_PROMPT_SETTINGS.systemPrompt}
        onResetPromptSettings={resetPromptSettings}
        settingsLoaded={settingsLoaded}
      />

      {/* Link Input Modal */}
      <UrlInputModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
        title="링크 추가"
        placeholder="https://example.com"
        example="예: https://example.com"
      />

      {/* YouTube URL Input Modal */}
      <UrlInputModal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        onSubmit={handleYoutubeSubmit}
        title="YouTube 동영상 추가"
        placeholder="https://www.youtube.com/watch?v=..."
        example="예: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />
    </div>
  )
}

