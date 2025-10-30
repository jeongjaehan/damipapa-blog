# 다미파파의 블로그

Next.js 15 풀스택으로 만든 개인 블로그 플랫폼입니다.

## 🚀 기술 스택

### Fullstack
- **Framework**: Next.js 15.5.4 (App Router + API Routes)
- **Language**: TypeScript
- **Database**: MySQL 8.0 (tmpfs)
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **UI**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm
- **Comments**: Facebook Comments Plugin

## 📋 주요 기능

### 블로그 기능
- ✅ 포스트 작성, 수정, 삭제 (마크다운 지원)
- ✅ 포스트 목록 및 상세 조회
- ✅ 페이지네이션
- ✅ 태그 및 카테고리 필터링
- ✅ 전문 검색
- ✅ IP 기반 유니크 조회수
- ✅ 프로필 페이지 (마크다운)
- ✅ Facebook Comments (소셜 댓글)
- ✅ 이미지 업로드

### 관리자 기능
- ✅ JWT 기반 인증 (30분 세션)
- ✅ 대시보드 (포스트, 조회수 통계)
- ✅ 포스트 관리
- ✅ 프로필 편집
- ✅ 실시간 마크다운 미리보기
- ✅ 이미지 업로드

### 디자인
- ✅ shadcn/ui 컴포넌트
- ✅ Medium/Notion 스타일 타이포그래피
- ✅ Lucide React 아이콘
- ✅ 반응형 디자인 (모바일 최적화)
- ✅ Sticky 헤더 with backdrop blur
- ✅ 부드러운 애니메이션

## 🛠 설치 및 실행

### 사전 요구사항
- Node.js 20+
- MySQL 8.0+ (또는 Docker)
- Docker & Docker Compose (권장)

### 1. 저장소 클론

\`\`\`bash
git clone <repository-url>
cd damipapa-blog
\`\`\`

### 2. 환경 설정

\`\`\`bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# .env.local 파일을 수정하여 본인의 정보 입력
# - DATABASE_URL
# - JWT_SECRET (랜덤 문자열로 변경)
# - ADMIN_EMAIL, ADMIN_PASSWORD (원하는 계정)
# - NEXT_PUBLIC_FACEBOOK_APP_ID (Facebook 앱 생성 후)
\`\`\`

### 3. Docker로 실행 (권장)

\`\`\`bash
# MySQL과 앱 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 서비스 중지
docker-compose down
\`\`\`

접속: http://localhost:3000

### 4. 로컬에서 실행

\`\`\`bash
# Docker MySQL만 시작
docker-compose up -d mysql

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push

# 초기 데이터 생성 (관리자 계정 + 샘플 포스트)
npm run prisma:seed

# 개발 서버 실행
npm run dev
\`\`\`

접속: http://localhost:3000

## ⚙️ 환경 설정

**중요: 환경변수 설정은 필수입니다!**

### Docker Compose 사용 시

1. `.env.example` 파일을 `.env`로 복사:
```bash
cp .env.example .env
```

2. `.env` 파일을 열어 실제 값으로 변경:
```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=blog
MYSQL_USER=blog_user
MYSQL_PASSWORD=your_database_password_here

# JWT Configuration (랜덤 문자열로 변경 필수!)
JWT_SECRET=your_base64_encoded_jwt_secret_here

# Admin Account (원하는 계정으로 변경)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password_here
ADMIN_NAME=관리자

# Facebook App (Facebook 개발자 콘솔에서 앱 생성 후)
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
```

### 로컬 개발 시

`.env.local` 파일을 생성하고 다음 형식으로 설정하세요:

```bash
# Database
DATABASE_URL="mysql://blog_user:YOUR_PASSWORD@localhost:3307/blog"

# JWT Secret (변경 필수!)
JWT_SECRET="your-secret-key-here-change-this"

# Admin Account (원하는 계정으로 변경)
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="관리자"

# Facebook Comments (앱 생성 후 입력)
NEXT_PUBLIC_FACEBOOK_APP_ID="your-facebook-app-id"
```

⚠️ **보안 주의사항**:
- `.env` 및 `.env.local` 파일은 절대 Git에 커밋하지 마세요!
- 실제 운영 환경에서는 강력한 패스워드를 사용하세요
- JWT_SECRET은 충분히 긴 랜덤 문자열을 사용하세요

## 📁 프로젝트 구조

\`\`\`
damipapa-blog/
├── app/
│   ├── api/                  # Next.js API Routes (백엔드)
│   │   ├── auth/            # 인증 API
│   │   ├── posts/           # 포스트 API
│   │   ├── profile/         # 프로필 API
│   │   ├── admin/           # 관리자 API
│   │   ├── files/           # 파일 업로드 API
│   │   ├── tags/            # 태그 API
│   │   └── categories/      # 카테고리 API
│   ├── (pages)/             # 프론트엔드 페이지
│   │   ├── page.tsx        # 홈
│   │   ├── profile/        # 프로필
│   │   ├── posts/[id]/     # 포스트 상세
│   │   ├── search/         # 검색
│   │   ├── tags/           # 태그 목록
│   │   ├── auth/login/     # 로그인
│   │   └── admin/          # 관리자 페이지
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── layout/              # Header, Footer
│   ├── post/                # PostCard, PostDetail
│   └── comment/             # FacebookComments
├── lib/
│   ├── db.ts               # Prisma 클라이언트
│   ├── auth.ts             # JWT 유틸리티
│   └── utils.ts            # 유틸리티
├── prisma/
│   └── schema.prisma       # 데이터베이스 스키마
├── services/               # API 클라이언트
├── types/                  # TypeScript 타입
├── public/uploads/         # 업로드 이미지 (git ignored)
└── docker-compose.yml      # Docker 설정
\`\`\`

## 🔧 Prisma 명령어

\`\`\`bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 스키마 적용
npm run prisma:push

# 초기 데이터 생성
npm run prisma:seed

# Prisma Studio (DB GUI)
npx prisma studio
\`\`\`

## 📡 API 엔드포인트 (Next.js API Routes)

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 포스트
- `GET /api/posts` - 포스트 목록 (페이지네이션, 필터링)
- `GET /api/posts/{id}` - 포스트 상세 (조회수 자동 증가)
- `POST /api/posts` - 포스트 생성 (관리자)
- `PUT /api/posts/{id}` - 포스트 수정 (관리자)
- `DELETE /api/posts/{id}` - 포스트 삭제 (관리자)
- `GET /api/posts/search` - 포스트 검색

### 프로필
- `GET /api/profile` - 프로필 조회 (공개)
- `PUT /api/profile` - 프로필 수정 (관리자)

### 태그 & 카테고리
- `GET /api/tags` - 모든 태그
- `GET /api/categories` - 모든 카테고리

### 파일
- `POST /api/files/upload` - 이미지 업로드 (관리자)

### 관리자
- `GET /api/admin/dashboard` - 대시보드 통계
- `GET /api/admin/posts` - 모든 포스트 (발행/임시저장)

## 🎨 주요 화면

### 공개 페이지
- `/` - 홈페이지 (포스트 목록)
- `/profile` - 프로필 (자기소개)
- `/posts/{id}` - 포스트 상세 + Facebook Comments
- `/search` - 검색
- `/tags` - 태그 목록

### 관리자 페이지
- `/auth/login` - 로그인
- `/admin` - 관리자 대시보드 (통계)
- `/admin/posts` - 포스트 관리
- `/admin/posts/new` - 새 포스트 작성
- `/admin/posts/edit/{id}` - 포스트 편집
- `/admin/profile/edit` - 프로필 편집

## 🔍 SEO (검색 엔진 최적화)

이 블로그는 다음과 같은 SEO 기능을 포함하고 있습니다:

### 메타데이터
- ✅ 동적 메타 태그 생성 (각 페이지마다 고유한 title, description)
- ✅ Open Graph (OG) 태그 - 소셜 미디어 공유 최적화
- ✅ Twitter 카드 - 트위터 공유 최적화
- ✅ Canonical URL - 중복 콘텐츠 방지

### 검색 엔진 지원
- ✅ `robots.txt` - 크롤러 가이드라인
- ✅ 동적 `sitemap.xml` - 모든 포스트 자동 등록
- ✅ 구조화된 메타데이터 - 다국어 지원 (한국어)

### 포스트 메타데이터
- ✅ 포스트별 동적 제목 및 설명
- ✅ 태그를 메타 키워드로 활용
- ✅ 작성자 정보
- ✅ 공개 날짜 및 수정 날짜

### SEO 설정 가이드

#### 1. 환경 변수 설정

`.env.local` 또는 `.env` 파일에 다음을 추가하세요:

```env
# 블로그 기본 URL (검색 엔진에 등록할 주소)
NEXT_PUBLIC_BASE_URL=https://yourblog.com

# API URL (메타데이터 생성 시 사용)
NEXT_PUBLIC_API_URL=https://yourblog.com/api
```

#### 2. Google Search Console 등록

1. https://search.google.com/search-console에 방문
2. 속성 추가 → 도메인 입력
3. 자동으로 생성된 sitemap에 접근:
   - `https://yourblog.com/sitemap.xml`
4. Search Console에 sitemap 등록

#### 3. Robots.txt 확인

`/public/robots.txt` 파일이 자동으로 생성됩니다:
- 모든 크롤러에 대해 블로그 콘텐츠 공개
- 관리자 페이지(`/admin`) 및 검색 페이지(`/search`) 제외
- 프로덕션 배포 시 Google 수집 속도 최적화

#### 4. 메타 태그 커스터마이징

루트 레이아웃 (`/app/layout.tsx`)에서 다음을 수정할 수 있습니다:

```typescript
// 블로그 기본 설명
description: '100% 바이브 코딩으로 만든  블로그. 개발, 기술, 일상에 대한 이야기를 공유합니다.',

// 키워드
keywords: ['블로그', '개발', '기술', 'Next.js', '프로그래밍'],

// Open Graph 이미지 (SNS 공유 시 보일 이미지)
images: [
  {
    url: `${baseUrl}/og-image.png`,  // public 폴더에 og-image.png 추가 필요
    width: 1200,
    height: 630,
  },
]
```

#### 5. OG 이미지 추가 (선택사항)

1. 1200x630px 크기의 이미지 생성 (SNS 공유 최적 크기)
2. 파일명을 `og-image.png`로 저장
3. `/public/` 폴더에 배치

#### 6. 포스트별 SEO 최적화 팁

- ✅ 포스트 제목을 명확하고 키워드 포함하게
- ✅ 첫 문장을 설명적으로 (검색 결과에 노출됨)
- ✅ 관련 태그를 추가 (키워드로 활용)
- ✅ 이미지 추가 (소셜 공유 시 더 매력적)

## 📝 개발 가이드

### 새로운 기능 추가

1. **백엔드 API**: `app/api/` 디렉토리에 route.ts 생성
2. **데이터베이스**: `prisma/schema.prisma` 수정 → `npx prisma db push`
3. **프론트엔드**: Type → API Service → Component → Page

### 코딩 컨벤션

- **TypeScript**: Airbnb JavaScript Style Guide
- **커밋 메시지**: Conventional Commits
- **컴포넌트**: shadcn/ui 패턴 따르기

## 🐛 문제 해결

### Prisma 오류

\`\`\`bash
# Prisma 클라이언트 재생성
npx prisma generate

# 개발 서버 재시작
npm run dev
\`\`\`

### MySQL 연결 오류

\`\`\`bash
# MySQL 상태 확인
docker-compose ps

# MySQL 로그 확인
docker-compose logs mysql
\`\`\`

### Facebook Comments 안 보임

1. Facebook App ID가 올바른지 확인
2. `.env.local`에 `NEXT_PUBLIC_FACEBOOK_APP_ID` 설정
3. Facebook 개발자 콘솔에서 도메인 등록

## 🚀 배포

### EC2 배포 (메모리 최적화)

#### EC2 t3.micro (1GB RAM) 준비

**1. 스왑 메모리 설정 (필수!)**

```bash
# 4GB 스외 생성
sudo dd if=/dev/zero of=/swapfile bs=128M count=32
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# 스외 사용 우선순위 조정

sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# 확인
free -h
```

**2. Node.js 및 PM2 설치**

```bash
# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 전역 설치
sudo npm install -g pm2
```

**3. MySQL 설치 및 설정**

```bash
# MySQL 설치
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 데이터베이스 생성
sudo mysql -u root -p
CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**4. 프로젝트 배포**

```bash
# 저장소 클론
cd ~
git clone https://github.com/jeongjaehan/damipapa-blog.git
cd damipapa-blog

# .env 파일 설정
cp .env.example .env
nano .env  # 실제 값으로 수정

# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

**5. PM2 자동 시작 설정**

```bash
pm2 startup
# 출력된 명령어 실행 (sudo로 시작하는 명령어)
pm2 save
```

#### 메모리 최적화 설정

이 프로젝트는 1GB RAM 환경에서 실행되도록 최적화되었습니다:

- **Node.js 힙 메모리**: 768MB로 제한
- **PM2 재시작 임계값**: 800MB
- **Worker threads**: 비활성화
- **이미지 최적화**: 제한적 사용
- **스외 메모리**: 4GB 활용

#### 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 메모리 사용량 확인
free -h

# 로그 확인
pm2 logs damipapa-blog --lines 50

# 프로세스 상태
pm2 status
```

#### 업데이트

**코드만 변경된 경우 (빠른 배포 - 30초 이내):**
```bash
cd ~/damipapa-blog
git pull origin main
./deploy-quick.sh
```

**package.json 또는 schema.prisma 변경된 경우 (전체 배포 - 5-7분):**
```bash
cd ~/damipapa-blog
git pull origin main
./deploy.sh
```

**배포 스크립트 비교:**
| 스크립트 | 실행 시간 | 수행 작업 | 사용 시기 |
|---------|----------|---------|----------|
| `deploy-quick.sh` | ~30초 | 빌드 + 재시작만 | 코드 변경만 |
| `deploy.sh` | ~5-7분 | 의존성 설치 + DB 마이그레이션 + 빌드 + 재시작 | 의존성/스키마 변경 |

### Docker Compose 배포 (대안)

```bash
# Docker Compose로 프로덕션 빌드
docker-compose -f docker-compose.yml up -d --build
```

### 예상 메모리 사용량

- **Next.js 프로세스**: 400-600MB
- **MySQL (로컬)**: 100-200MB
- **시스템**: 100-150MB
- **여유**: 50-100MB
- **스외**: 필요시 4GB

**총 1GB RAM으로 안정적 운영 가능!** ✅

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 기여

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📧 문의

문의사항이 있으시면 이슈를 등록해주세요.

