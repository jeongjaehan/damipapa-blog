import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border">
      <div className="mx-auto w-full max-w-content px-4 py-6 text-sm text-muted-foreground">
        <p>
          <Link href="/" className="text-muted-foreground visited:text-muted-foreground hover:text-link">홈</Link>
          <span aria-hidden="true" className="mx-2 text-border">|</span>
          <Link href="/search" className="text-muted-foreground visited:text-muted-foreground hover:text-link">검색</Link>
          <span aria-hidden="true" className="mx-2 text-border">|</span>
          <Link href="/tags" className="text-muted-foreground visited:text-muted-foreground hover:text-link">태그</Link>
        </p>
        <p className="mt-2">
          &copy; 2025 다미파파의 블로그
        </p>
      </div>
    </footer>
  )
}
