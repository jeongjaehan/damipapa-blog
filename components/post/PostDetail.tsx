'use client'

import { PostDetail as PostDetailType } from '@/types'
import { formatFullDate } from '@/utils/date'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/services/api'
import { Button } from '@/components/ui/button'
import OptimizedImage from '@/components/common/OptimizedImage'
import MermaidDiagram from '@/components/projects/MermaidDiagram'
import PostReactions from './PostReactions'
import PostShare from './PostShare'
import { calculateReadingTime, formatReadingTime } from '@/utils/readingTime'

interface PostDetailProps {
  post: PostDetailType
}

// YouTube iframe renderer component
const YoutubeEmbed = ({ src }: { src: string }) => {
  // Extract video ID from various YouTube URL formats
  let videoId = ''
  
  if (src.includes('/embed/')) {
    videoId = src.split('/embed/')[1]?.split('?')[0] || ''
  } else if (src.includes('watch?v=')) {
    videoId = src.split('watch?v=')[1]?.split('&')[0] || ''
  } else if (src.includes('youtu.be/')) {
    videoId = src.split('youtu.be/')[1]?.split('?')[0] || ''
  }

  if (!videoId) return null

  const embedUrl = `https://www.youtube.com/embed/${videoId}`

  return (
    <div className="youtube-embed-container my-6" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
      <iframe
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  )
}

export default function PostDetail({ post }: PostDetailProps) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  
  // 읽기 시간 계산
  const readingTime = calculateReadingTime(post.content)

  const handleDelete = async () => {
    if (!confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deletePost(post.id)
      alert('포스트가 삭제되었습니다')
      router.push('/')
    } catch (error) {
      console.error('포스트 삭제 실패:', error)
      alert('포스트 삭제에 실패했습니다')
    }
  }

  return (
    <article>
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {post.author.name}
          <span aria-hidden="true" className="mx-1.5 text-border">·</span>
          {formatFullDate(post.createdAt)}
          <span aria-hidden="true" className="mx-1.5 text-border">·</span>
          조회 {post.viewCount.toLocaleString()}
          <span aria-hidden="true" className="mx-1.5 text-border">·</span>
          {formatReadingTime(readingTime)}
          {post.category && (
            <>
              <span aria-hidden="true" className="mx-1.5 text-border">·</span>
              <Link
                href={`/categories/${post.category.slug}`}
                className="text-muted-foreground underline visited:text-muted-foreground hover:text-link"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </p>

        {(post.isPrivate && isAdmin) || post.createdAt !== post.updatedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {post.isPrivate && isAdmin && <span className="text-destructive">[비공개]</span>}
            {post.createdAt !== post.updatedAt && (
              <span className="ml-1">(수정됨: {formatFullDate(post.updatedAt)})</span>
            )}
          </p>
        ) : null}

        {post.tags && post.tags.length > 0 && (
          <p className="mt-2 text-sm">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}`}
                className="mr-2 text-muted-foreground visited:text-muted-foreground hover:text-link"
              >
                #{tag}
              </Link>
            ))}
          </p>
        )}

        {isAdmin && (
          <div className="mt-4 flex gap-2 text-sm">
            <Link href={`/admin/posts/edit/${post.id}`}>
              <Button size="sm" variant="outline">수정</Button>
            </Link>
            <Button size="sm" variant="destructive" onClick={handleDelete}>삭제</Button>
          </div>
        )}
      </header>

      <div className="py-8">
        <div className="markdown prose prose-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  
                  // Mermaid 코드 블록인 경우
                  if (!inline && language === 'mermaid') {
                    return (
                      <div className="my-6">
                        <MermaidDiagram chart={String(children).trim()} />
                      </div>
                    )
                  }
                  
                  // 일반 코드 블록은 기본 렌더링
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                a: ({ node, href, children, ...props }) => {
                  // Check if link is a YouTube URL
                  if (href?.includes('youtube.com') || href?.includes('youtu.be')) {
                    return <YoutubeEmbed src={href} />
                  }
                  // Regular link
                  return <a href={href} {...props}>{children}</a>
                },
                img: ({ node, src, alt, ...props }) => {
                  // Check if it's a YouTube embed markdown
                  if (src?.includes('youtube.com')) {
                    return <YoutubeEmbed src={src} />
                  }
                  // Regular image - only render if src is valid
                  if (!src) {
                    return null
                  }
                  return (
                    <OptimizedImage 
                      src={src} 
                      alt={alt || ''} 
                      className="max-w-full h-auto border border-border my-4"
                      enableModal={true}
                    />
                  )
                },
                iframe: ({ node, src, ...props }: any) => {
                  // Handle iframe tags directly (for YouTube embeds)
                  if (src?.includes('youtube.com/embed')) {
                    return <YoutubeEmbed src={src} />
                  }
                  return null
                },
                p: ({ node, children }: any) => {
                  // Check if paragraph contains an image to avoid HTML validation error
                  const hasImage = node?.children?.some((child: any) => child.tagName === 'img')
                  
                  if (hasImage) {
                    return <div className="my-4">{children}</div>
                  }
                  
                  // Check if paragraph contains YouTube link and convert it
                  const content = String(children)
                  if (content.includes('youtube.com') || content.includes('youtu.be')) {
                    // Extract YouTube URL from text
                    const urlMatch = content.match(/(https?:\/\/)?(www\.)?(youtube|youtu\.be)\S+/i)
                    if (urlMatch) {
                      const url = urlMatch[0]
                      // Return YouTube embed without p tag wrapper to avoid HTML structure error
                      return <YoutubeEmbed src={url} />
                    }
                  }
                  return <p>{children}</p>
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* 공유하기 버튼 */}
          <PostShare postId={post.id} postTitle={post.title} />

          {/* 좋아요/싫어요 버튼 */}
          <PostReactions postId={post.id} />
        </div>
    </article>
  )
}

