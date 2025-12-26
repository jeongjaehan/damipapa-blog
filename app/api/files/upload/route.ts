import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  verifyImageSignature,
  isValidFilename,
} from '@/lib/security'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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
        { message: '압축된 파일 크기는 5MB를 초과할 수 없습니다' },
        { status: 400 }
      )
    }

    // 🔒 보안: 파일명 검증 (Path Traversal 방지)
    if (!isValidFilename(file.name)) {
      return NextResponse.json(
        { message: '유효하지 않은 파일명입니다' },
        { status: 400 }
      )
    }

    // 🔒 보안: MIME type 검증 (클라이언트 제공)
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: '지원하지 않는 파일 형식입니다' },
        { status: 400 }
      )
    }

    // 🔒 보안: 파일명에서 확장자 검증
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { message: '지원하지 않는 파일 확장자입니다' },
        { status: 400 }
      )
    }

    // 파일 내용 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 🔒 보안: 파일 매직 바이트 검증 (실제 파일 내용 확인)
    if (!verifyImageSignature(buffer, ext)) {
      return NextResponse.json(
        { message: '파일 형식이 올바르지 않습니다. 이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 업로드 디렉토리 생성
    await mkdir(UPLOAD_DIR, { recursive: true })

    // 🔒 보안: UUID를 사용한 안전한 파일명 생성
    const filename = `${randomUUID()}.${ext}`

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

