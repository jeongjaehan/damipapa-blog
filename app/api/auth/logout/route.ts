import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // JWT는 stateless이므로 서버에서 할 작업 없음
  // 클라이언트에서 토큰 제거하면 됨
  return NextResponse.json({ message: 'Logged out successfully' })
}

