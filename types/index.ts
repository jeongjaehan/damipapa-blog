export interface User {
  id: number
  email: string
  name: string
  bio?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface PostSummary {
  id: number
  title: string
  tags: string[]
  authorName: string
  createdAt: string
  updatedAt: string
  viewCount: number
  commentCount: number
  isPrivate?: boolean
  secretToken?: string
  categoryId?: number | null
  categoryName?: string | null
  categorySlug?: string | null
}

export interface PostDetail {
  id: number
  title: string
  content: string
  tags: string[]
  author: User
  createdAt: string
  updatedAt: string
  viewCount: number
  isPrivate?: boolean
  secretToken?: string
  reactionStats?: PostReactionStats
  categoryId?: number | null
  category?: CategorySummary | null
}

export interface PostReactionStats {
  likeCount: number
  dislikeCount: number
  userReaction: {
    type: 'LIKE' | 'DISLIKE'
    createdAt: string
  } | null
}

export interface PostReactionResponse {
  likeCount: number
  dislikeCount: number
  userReaction: {
    type: 'LIKE' | 'DISLIKE'
    createdAt: string
  } | null
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface CreatePostRequest {
  title: string
  content: string
  tags: string[]
  isPrivate?: boolean
  categoryId?: number | null
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  tags?: string[]
  isPrivate?: boolean
  categoryId?: number | null
}

export interface DashboardStats {
  totalPosts: number
  privatePosts: number
  totalViews: number
}

export interface Template {
  id: number
  name: string
  description: string
  tags: string[]
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateRequest {
  name: string
  description: string
  tags: string[]
  content: string
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  tags?: string[]
  content?: string
}

export interface GrammarCheckRequest {
  text: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface GrammarCheckResponse {
  original: string
  corrected: string
  changes: Array<{
    original: string
    corrected: string
    reason: string
  }>
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export interface GrammarSettings {
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export interface PromptTemplate {
  id: number
  title: string
  description?: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  model: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreatePromptTemplateRequest {
  title: string
  description?: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  model?: string
  order?: number
}

export interface UpdatePromptTemplateRequest {
  title?: string
  description?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  model?: string
  order?: number
}

export interface CareerProfile {
  name: string
  bio: string           // 한줄소개
  email: string
  linkedin: string
  facebook?: string     // Facebook URL (선택)
  avatar?: string       // 프로필 사진 (선택)
}

export interface Career {
  id: string
  startDate: string      // YYYY-MM-DD
  endDate: string | null // YYYY-MM-DD or null
  title: string
  subtitle: string
  description?: string   // 하위 호환성을 위해 유지
  summaryDescription?: string  // 요약형 설명
  narrativeDescription?: string   // 서술형 설명
}

export interface CareerData {
  profile: CareerProfile
  careers: Career[]
}

// 프로젝트 관련 타입들
export interface ProjectIcon {
  type: 'image' | 'text' | 'auto'
  value: string // 이미지 경로 또는 텍스트
  color: string
}

export interface ProjectLinks {
  web?: string
  ios?: string
  android?: string
  github?: string
}

export interface ProjectMetadata {
  id: string
  title: string
  subtitle: string
  description: string
  status: 'planning' | 'in-progress' | 'completed' | 'launched' | 'paused'
  category: string
  tech_stack: string[]
  icon: ProjectIcon
  links: ProjectLinks
  features: string[]
  created_at: string
  updated_at: string
}

export interface ProjectListItem {
  id: string
  slug: string
  title: string
  description: string
  status: string
  icon: string | null
  iconColor: string
  iconType?: 'image' | 'text'
  order: number
}

export interface Project extends ProjectMetadata {
  slug: string
  content: string
}

export interface ProjectStats {
  total: number
  planning: number
  inProgress: number
  completed: number
  launched: number
  paused: number
}

// 카테고리 관련 타입들
export interface CategorySummary {
  id: number
  name: string
  slug: string
  isPrivate: boolean
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  isPrivate: boolean
  order: number
  depth: number
  parentId?: number | null
  createdAt: string
  updatedAt: string
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
  postCount: number
}

export interface CategoryTree {
  categories: CategoryWithChildren[]
  uncategorizedCount: number
}

export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
  isPrivate?: boolean
  order?: number
  parentId?: number | null
}

export interface UpdateCategoryRequest {
  name?: string
  slug?: string
  description?: string
  isPrivate?: boolean
  order?: number
  parentId?: number | null
}

// 대시보드 관련 타입
export interface BlogDashboardData {
  totalPosts: number
  totalViews: number
  todayVisitors: number
  totalVisitors: number
  recentPosts: PostSummary[]
  popularPosts: PostSummary[]
}

// 포스팅 잔디(Heatmap) 관련 타입
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export interface HeatmapDay {
  date: string        // YYYY-MM-DD (KST 기준)
  count: number       // 그 날 작성된 포스트 개수
  level: HeatmapLevel // 색상 단계 (서버에서 계산)
}

export interface HeatmapResponse {
  year: number
  timezone: 'Asia/Seoul'
  totalPosts: number
  activeDays: number
  longestStreak: number
  availableYears: number[] // 내림차순
  days: HeatmapDay[]       // 365 또는 366
}

