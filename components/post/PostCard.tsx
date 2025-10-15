import Link from 'next/link'
import { PostSummary } from '@/types'
import { formatDate } from '@/utils/date'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Calendar } from 'lucide-react'

interface PostCardProps {
  post: PostSummary
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-stone-200 bg-white">
        <CardHeader className="pb-3">
          <h2 className="text-2xl font-bold text-gray-900 line-clamp-2 leading-tight hover:text-primary-600 transition-colors">
            {post.title}
          </h2>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="border-primary-200 text-primary-700">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-sm font-medium text-gray-700">{post.authorName}</span>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

