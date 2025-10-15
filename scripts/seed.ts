import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'example@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'password'
  const adminName = process.env.ADMIN_NAME || 'admin'

  // 관리자 계정 생성
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: bcrypt.hashSync(adminPassword, 10),
        name: adminName,
        bio: '블로그 관리자입니다',
        role: 'ADMIN',
      },
    })

    console.log(`관리자 계정이 생성되었습니다: ${adminEmail}`)

    // 샘플 포스트 생성
    await prisma.post.createMany({
      data: [
        {
          title: '블로그에 오신 것을 환영합니다!',
          content:
            '# 환영합니다\n\n이것은 첫 번째 블로그 포스트입니다.\n\n## 마크다운 지원\n\n이 블로그는 **마크다운**을 지원합니다.\n\n- 목록 1\n- 목록 2\n- 목록 3',
          tags: JSON.stringify(['환영', '첫글', '마크다운']),
          published: true,
          authorId: admin.id,
        },
        {
          title: 'Next.js 풀스택 블로그',
          content:
            '# Next.js 풀스택\n\n이 블로그는 **Next.js**로 프론트엔드와 백엔드를 모두 구현했습니다.\n\n## 기술 스택\n\n- Next.js 15\n- Prisma\n- MySQL\n- TypeScript',
          tags: JSON.stringify(['Next.js', '풀스택', '개발']),
          published: true,
          authorId: admin.id,
        },
        {
          title: 'TipTap WYSIWYG 에디터',
          content: '# TipTap 에디터\n\n이 블로그는 **TipTap WYSIWYG 에디터**를 사용하여 쉽게 글을 작성할 수 있습니다.\n\n## 주요 기능\n\n- 실시간 편집\n- 이미지 업로드\n- 마크다운 자동 변환\n- 태그 자동완성',
          tags: JSON.stringify(['TipTap', '에디터', 'WYSIWYG']),
          published: true,
          authorId: admin.id,
        },
        {
          title: '임시 저장된 포스트',
          content: '이 포스트는 아직 작성 중입니다.',
          tags: JSON.stringify(['임시저장']),
          published: false,
          authorId: admin.id,
        },
      ],
    })

    console.log('샘플 포스트가 생성되었습니다.')
  } else {
    console.log('관리자 계정이 이미 존재합니다.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

