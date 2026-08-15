import Link from 'next/link'
import { format } from 'date-fns'
import { PostSummary } from '@/types'

interface PostCardProps {
  post: PostSummary
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-border py-5">
      <p className="text-sm text-muted-foreground">
        {format(new Date(post.createdAt), 'yyyy.MM.dd')}
      </p>

      <h2 className="mt-1 text-lg font-bold leading-snug">
        <Link
          href={`/posts/${post.id}`}
          className="text-foreground underline visited:text-link-visited hover:text-link"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {post.tags && post.tags.length > 0 && (
          <>
            {post.tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}`}
                className="mr-2 underline text-muted-foreground visited:text-link-visited hover:text-link"
              >
                #{tag}
              </Link>
            ))}
            <span aria-hidden="true" className="mx-1 text-border">·</span>
          </>
        )}
        {post.authorName}
        <span aria-hidden="true" className="mx-1 text-border">·</span>
        조회 {post.viewCount.toLocaleString()}
      </p>
    </article>
  )
}

