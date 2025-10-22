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
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  tags?: string[]
  isPrivate?: boolean
}

export interface DashboardStats {
  totalPosts: number
  privatePosts: number
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

