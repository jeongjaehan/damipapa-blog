import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { isValidFilename, isValidUUIDFilename } from '@/lib/security'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // 🔒 보안: 파일명 검증 (Path Traversal 공격 방지)
    if (!isValidFilename(filename)) {
      return new NextResponse('Invalid filename', { status: 400 })
    }
    
    // 🔒 보안: UUID 패턴 검증 (업로드 시 UUID로 생성됨)
    if (!isValidUUIDFilename(filename)) {
      return new NextResponse('Invalid filename format', { status: 400 })
    }
    
    // 파일 경로 생성
    const filePath = join(UPLOAD_DIR, filename)
    
    // 파일 읽기
    const fileBuffer = await readFile(filePath)
    
    // MIME 타입 결정
    const ext = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1년 캐시, immutable 추가
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding', // 압축 지원
      },
    })
  } catch (error) {
    console.error('File serving error:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}
