// Google Analytics 4 (GA4) 유틸리티 함수들

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// gtag 함수 타입 정의
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer: any[]
  }
}

// 페이지뷰 추적
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

// 커스텀 이벤트 추적
export interface GAEvent {
  action: string
  category?: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export const event = ({ action, category, label, value, custom_parameters }: GAEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...custom_parameters,
    })
  }
}

// 특정 이벤트들을 위한 헬퍼 함수들

// 게시글 조회 추적
export const trackPostView = (postId: string, postTitle: string) => {
  event({
    action: 'view_post',
    category: 'engagement',
    label: postTitle,
    custom_parameters: {
      post_id: postId,
      post_title: postTitle,
    },
  })
}

// 검색 추적
export const trackSearch = (query: string, resultsCount?: number) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultsCount,
    custom_parameters: {
      search_term: query,
      results_count: resultsCount,
    },
  })
}

// 로그인 추적
export const trackLogin = (method: string = 'email') => {
  event({
    action: 'login',
    category: 'auth',
    label: method,
    custom_parameters: {
      login_method: method,
    },
  })
}

// 게시글 작성 추적
export const trackPostCreate = (postTitle: string) => {
  event({
    action: 'create_post',
    category: 'admin',
    label: postTitle,
    custom_parameters: {
      post_title: postTitle,
    },
  })
}

// 댓글 작성 추적
export const trackComment = (postId: string, action: 'create' | 'reply') => {
  event({
    action: action === 'create' ? 'comment' : 'reply',
    category: 'engagement',
    custom_parameters: {
      post_id: postId,
      comment_action: action,
    },
  })
}

// 파일 업로드 추적
export const trackFileUpload = (fileType: string, fileSize?: number) => {
  event({
    action: 'file_upload',
    category: 'admin',
    label: fileType,
    value: fileSize,
    custom_parameters: {
      file_type: fileType,
      file_size: fileSize,
    },
  })
}

// 에러 추적
export const trackError = (errorType: string, errorMessage: string) => {
  event({
    action: 'error',
    category: 'technical',
    label: errorType,
    custom_parameters: {
      error_type: errorType,
      error_message: errorMessage,
    },
  })
}

// 개발 환경에서 콘솔 로깅 활성화
export const isDevelopment = process.env.NODE_ENV === 'development'

export const logEvent = (eventName: string, parameters?: any) => {
  if (isDevelopment) {
    console.log(`[GA4 Event] ${eventName}:`, parameters)
  }
}
