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
  published: boolean
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  tags?: string[]
  published?: boolean
}

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
}

export interface Profile {
  id?: number
  userId?: number
  content: string
  createdAt?: string
  updatedAt?: string
  user?: {
    id: number
    name: string
    email: string
  }
}

