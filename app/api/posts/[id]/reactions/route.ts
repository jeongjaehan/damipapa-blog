import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getClientIp } from '@/lib/auth'

// GET: 현재 사용자의 반응 조회 및 통계
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const postId = parseInt(idParam)
    const ipAddress = getClientIp(request)
    
    // Facebook ID는 쿼리 파라미터로 받음 (클라이언트에서 전달)
    const { searchParams } = new URL(request.url)
    const facebookId = searchParams.get('facebookId') || null

    // 기존 반응 조회 (Facebook ID 우선, 없으면 IP)
    let userReaction = null
    if (facebookId) {
      userReaction = await prisma.postReaction.findFirst({
        where: {
          postId,
          facebookId,
        },
      })
    } else {
      userReaction = await prisma.postReaction.findFirst({
        where: {
          postId,
          ipAddress,
        },
      })
    }

    // 통계 조회
    const [likeCount, dislikeCount] = await Promise.all([
      prisma.postReaction.count({
        where: { postId, reactionType: 'LIKE' },
      }),
      prisma.postReaction.count({
        where: { postId, reactionType: 'DISLIKE' },
      }),
    ])

    return NextResponse.json({
      likeCount,
      dislikeCount,
      userReaction: userReaction
        ? {
            type: userReaction.reactionType,
            createdAt: userReaction.createdAt,
          }
        : null,
    })
  } catch (error) {
    console.error('Get reactions error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        message: '서버 오류가 발생했습니다',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// POST: 좋아요/싫어요 토글
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const postId = parseInt(idParam)
    const ipAddress = getClientIp(request)
    const body = await request.json()
    const { reactionType, facebookId } = body

    // 유효성 검사
    if (!reactionType || !['LIKE', 'DISLIKE'].includes(reactionType)) {
      return NextResponse.json(
        { message: '올바른 반응 타입이 아닙니다' },
        { status: 400 }
      )
    }

    // 포스트 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { message: '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 기존 반응 조회
    let existingReaction = null
    if (facebookId) {
      existingReaction = await prisma.postReaction.findFirst({
        where: {
          postId,
          facebookId,
        },
      })
    } else {
      existingReaction = await prisma.postReaction.findFirst({
        where: {
          postId,
          ipAddress,
        },
      })
    }

    // 토글 로직
    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // 같은 반응이면 삭제 (토글)
        await prisma.postReaction.delete({
          where: { id: existingReaction.id },
        })
      } else {
        // 다른 반응이면 업데이트
        await prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { reactionType },
        })
      }
    } else {
      // 새 반응 생성
      await prisma.postReaction.create({
        data: {
          postId,
          reactionType,
          facebookId: facebookId || null,
          ipAddress: facebookId ? null : ipAddress,
        },
      })
    }

    // 업데이트된 통계 반환
    const [likeCount, dislikeCount] = await Promise.all([
      prisma.postReaction.count({
        where: { postId, reactionType: 'LIKE' },
      }),
      prisma.postReaction.count({
        where: { postId, reactionType: 'DISLIKE' },
      }),
    ])

    // 업데이트된 사용자 반응 조회
    let updatedUserReaction = null
    if (facebookId) {
      updatedUserReaction = await prisma.postReaction.findFirst({
        where: {
          postId,
          facebookId,
        },
      })
    } else {
      updatedUserReaction = await prisma.postReaction.findFirst({
        where: {
          postId,
          ipAddress,
        },
      })
    }

    return NextResponse.json({
      likeCount,
      dislikeCount,
      userReaction: updatedUserReaction
        ? {
            type: updatedUserReaction.reactionType,
            createdAt: updatedUserReaction.createdAt,
          }
        : null,
    })
  } catch (error) {
    console.error('Toggle reaction error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

