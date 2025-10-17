import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: '파일이 없습니다' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: '파일 크기는 5MB를 초과할 수 없습니다' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: '지원하지 않는 파일 형식입니다' },
        { status: 400 }
      )
    }

    // 업로드 디렉토리 생성
    await mkdir(UPLOAD_DIR, { recursive: true })

    // 파일 저장
    const ext = file.name.split('.').pop()
    const filename = `${randomUUID()}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(join(UPLOAD_DIR, filename), buffer)

    return NextResponse.json({
      url: `/api/files/${filename}`,
      filename: file.name,
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { message: '파일 업로드에 실패했습니다' },
      { status: 500 }
    )
  }
}

