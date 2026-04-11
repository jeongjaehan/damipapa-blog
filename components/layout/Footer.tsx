import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted text-foreground mt-auto rounded-t-3xl">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🏡 다미파파의 블로그</h3>
            <p className="text-muted-foreground">
              100% 바이브 코딩으로 만든 내 블로그
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">기술 스택</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-background rounded-full text-sm text-muted-foreground">Next.js 15</span>
              <span className="px-3 py-1 bg-background rounded-full text-sm text-muted-foreground">Prisma + MySQL</span>
              <span className="px-3 py-1 bg-background rounded-full text-sm text-muted-foreground">TypeScript</span>
              <span className="px-3 py-1 bg-background rounded-full text-sm text-muted-foreground">shadcn/ui</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">링크</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  검색
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-muted-foreground hover:text-primary transition-colors">
                  태그
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>Made with ☕ &copy; {currentYear} 다미파파의 블로그</p>
        </div>
      </div>
    </footer>
  )
}
