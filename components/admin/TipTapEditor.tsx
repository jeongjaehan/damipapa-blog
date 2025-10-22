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
  const [grammarCheckLoading, setGrammarCheckLoading] = useState(false)
  const [grammarResult, setGrammarResult] = useState<{
    original: string
    corrected: string
    changes: Array<{ original: string; corrected: string; reason: string }>
  } | null>(null)

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
    const url = window.prompt('URL을 입력하세요:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const url = await onImageUpload(file)
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
    const url = window.prompt('YouTube URL을 입력하세요:\n예: https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
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
          // Upload asynchronously without waiting (fire and forget)
          onImageUpload(file)
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

  // Grammar check function
  const handleGrammarCheck = async () => {
    if (!editor) return

    const html = editor.getHTML()
    const markdown = turndownService.turndown(html)

    if (!markdown.trim()) {
      alert('검사할 내용이 없습니다.')
      return
    }

    setGrammarCheckLoading(true)
    setIsGrammarModalOpen(true)
    setGrammarResult(null)

    try {
      const response = await fetch('/api/grammar/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: markdown }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '문법 검사에 실패했습니다.')
      }

      const data = await response.json()
      setGrammarResult({
        original: data.original,
        corrected: data.corrected,
        changes: data.changes,
      })
    } catch (error: any) {
      console.error('Grammar check error:', error)
      alert(error.message || '문법 검사 중 오류가 발생했습니다.')
      setIsGrammarModalOpen(false)
    } finally {
      setGrammarCheckLoading(false)
    }
  }

  // Apply grammar corrections
  const handleApplyCorrections = () => {
    if (!editor || !grammarResult) return

    // Convert markdown to HTML and set as editor content
    const html = marked.parse(grammarResult.corrected) as string
    editor.commands.setContent(html)
    onChange(grammarResult.corrected)

    setIsGrammarModalOpen(false)
    setGrammarResult(null)
  }

  // Close grammar modal
  const handleCloseGrammarModal = () => {
    setIsGrammarModalOpen(false)
    setGrammarResult(null)
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
          disabled={grammarCheckLoading}
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
        original={grammarResult?.original || ''}
        corrected={grammarResult?.corrected || ''}
        changes={grammarResult?.changes || []}
        onApply={handleApplyCorrections}
        loading={grammarCheckLoading}
      />
    </div>
  )
}

