# 다미파파의 블로그

Next.js 15 풀스택으로 만든 개인 블로그 플랫폼입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Database**: MySQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **UI**: shadcn/ui + Tailwind CSS (다크 모드 지원)
- **Editor**: TipTap (WYSIWYG)
- **Markdown**: react-markdown + remark-gfm
- **Diagram**: Mermaid
- **AI**: OpenAI (제목 추천)

## 📋 주요 기능

### 블로그
- ✅ 포스트 작성/수정/삭제 (TipTap WYSIWYG 에디터)
- ✅ 마크다운 + Mermaid 다이어그램 렌더링
- ✅ AI 제목 추천 (OpenAI)
- ✅ 태그 기반 필터링 & 검색
- ✅ IP 기반 유니크 조회수
- ✅ 이미지 업로드 & 최적화
- ✅ 포스트 공유 & 반응 (좋아요/싫어요)

### 부가 기능
- ✅ 프로필 페이지 (경력 타임라인)
- ✅ 사이드 프로젝트 쇼케이스
- ✅ 미니 게임 (테트리스, 사다리)
- ✅ 다크/라이트 테마 전환

### 관리자
- ✅ JWT 인증 (로고 5번 클릭으로 로그인 접근)
- ✅ 대시보드 (통계)
- ✅ 실시간 마크다운 미리보기
- ✅ 반응형 디자인 (모바일 최적화)

## 🛠 빠른 시작

### 1. 저장소 클론 및 환경 설정

```bash
git clone <repository-url>
cd damipapa-blog
cp .env.example .env.local
# .env.local 파일 수정 (DATABASE_URL, JWT_SECRET, ADMIN 계정 등)
```

### 2. 실행

**Docker 사용 (권장)**
```bash
docker-compose up -d
```

**로컬 개발**
```bash
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

접속: http://localhost:3000  
관리자: 로고를 1초 내 5번 빠르게 클릭

## ⚙️ 환경 변수

`.env.local` 파일에 다음 항목을 설정하세요:

```bash
DATABASE_URL="mysql://user:password@localhost:3307/blog"

# 🔒 보안: JWT_SECRET은 최소 32자 이상의 안전한 랜덤 문자열 사용 (필수!)
# 생성 방법: openssl rand -base64 64
JWT_SECRET="your-64-character-random-secret-key"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"
ADMIN_NAME="관리자"
OPENAI_API_KEY="your-openai-api-key" # AI 제목 추천용
```

**⚠️ 보안 주의사항:**
- `JWT_SECRET`은 반드시 32자 이상의 안전한 랜덤 문자열을 사용하세요
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 강력한 비밀번호를 사용하세요

## 📁 프로젝트 구조

```
app/
├── api/              # API Routes
├── admin/            # 관리자 페이지
├── posts/[id]/       # 포스트 상세
├── projects/         # 프로젝트 쇼케이스
├── career/           # 프로필 페이지
└── game/             # 미니 게임
components/           # React 컴포넌트
├── ui/               # shadcn/ui
├── layout/           # Header, Footer
├── post/             # 포스트 관련
└── admin/            # TipTap 에디터 등
contexts/             # React Context (Auth, Theme)
lib/                  # 유틸리티 (auth, db)
prisma/               # DB 스키마
```

## 🎨 주요 화면

- `/` - 홈 (포스트 목록)
- `/posts/[id]` - 포스트 상세
- `/career` - 프로필 (경력 타임라인)
- `/projects` - 사이드 프로젝트
- `/game/tetris` - 테트리스
- `/admin` - 관리자 대시보드 (로고 5번 클릭 후)

## 🔍 SEO

- ✅ 동적 메타 태그 (Open Graph, Twitter Card)
- ✅ 자동 Sitemap (`/sitemap.xml`)
- ✅ Robots.txt
- ✅ 포스트별 메타데이터 & 이미지

**설정**: `.env.local`에 `NEXT_PUBLIC_BASE_URL` 추가

## 🔒 보안

이 프로젝트는 다음 보안 기능을 포함합니다:

- ✅ **Path Traversal 방지**: 파일 경로 검증 및 UUID 패턴 강제
- ✅ **파일 업로드 보안**: 매직 바이트 검증으로 실제 파일 형식 확인
- ✅ **JWT 보안**: 강력한 Secret 키 필수, 기본값 사용 불가
- ✅ **XSS/CSRF 방지**: 보안 헤더 및 입력값 검증
- ✅ **실행 파일 차단**: 위험한 확장자 업로드 차단
- ✅ **Rate Limiting 준비**: IP 기반 제한 기능 구현 가능

### 보안 점검

정기적으로 보안 점검을 실행하세요:

```bash
# 보안 스크립트 실행 (xmrig 등 악성 프로세스 탐지)
./scripts/security-check.sh

# npm 취약점 확인
npm audit

# 의존성 업데이트
npm audit fix
```

자세한 내용은 [SECURITY.md](SECURITY.md)를 참조하세요.

## 🚀 배포

### EC2 배포 (1GB RAM 최적화)

```bash
# 1. 스왑 메모리 설정 (4GB)
sudo dd if=/dev/zero of=/swapfile bs=128M count=32
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 2. Node.js 20 + PM2 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. MySQL 설치 및 DB 생성
sudo apt install -y mysql-server
sudo mysql -e "CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. 프로젝트 배포
git clone <repository-url>
cd damipapa-blog
cp .env.example .env
# .env 파일 수정 후
chmod +x deploy.sh
./deploy.sh

# 5. PM2 자동 시작
pm2 startup
pm2 save
```

**업데이트**
- 코드만 변경: `./deploy-quick.sh` (~30초)
- 의존성/스키마 변경: `./deploy.sh` (~5분)

## 📄 라이선스

MIT License

---

**Made with ❤️ using Next.js 15 & TypeScript**

