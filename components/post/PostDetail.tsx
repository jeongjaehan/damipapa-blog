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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Calendar, Edit, Trash2, EyeOff } from 'lucide-react'
import OptimizedImage from '@/components/common/OptimizedImage'

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
    <article className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <header className="px-4 sm:px-8 py-8 sm:py-12 bg-gradient-to-b from-stone-50 to-white">
          {/* 제목 - 모바일 친화적 크기 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            {post.title}
          </h1>
          
          {/* 관리자 액션 버튼 - 모바일 친화적 배치 */}
          {isAdmin && (
            <div className="flex gap-2 mb-6 sm:justify-end">
              <Link href={`/admin/posts/edit/${post.id}`}>
                <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Edit className="w-4 h-4" />
                  수정
                </Button>
              </Link>
              <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-2 w-full sm:w-auto">
                <Trash2 className="w-4 h-4" />
                삭제
              </Button>
            </div>
          )}

          {/* 메타데이터 - 모바일 친화적 배치 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="font-medium text-gray-900">{post.author.name}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatFullDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {post.viewCount.toLocaleString()} 조회
              </span>
            </div>
            
            {/* 비공개 포스트 배지와 수정일시 */}
            <div className="flex items-center gap-2 flex-wrap">
              {post.isPrivate && isAdmin && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  <EyeOff className="w-3 h-3" />
                  비공개 포스트
                </span>
              )}
              {post.createdAt !== post.updatedAt && (
                <span className="text-xs text-gray-500">
                  (수정됨: {formatFullDate(post.updatedAt)})
                </span>
              )}
            </div>
          </div>

          {/* 태그 - 모바일 친화적 배치 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/?tag=${tag}`}>
                  <Badge variant="outline" className="border-primary-200 text-primary-700 hover:bg-primary-50 text-sm">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        <Separator />

        <div className="px-4 sm:px-8 py-8 sm:py-12">
          <div className="markdown prose prose-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
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
                      className="max-w-full h-auto rounded-lg shadow-sm my-4"
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
        </div>
      </div>
    </article>
  )
}

