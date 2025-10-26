import axios from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  PostSummary,
  PostDetail,
  PageResponse,
  CreatePostRequest,
  UpdatePostRequest,
  DashboardStats,
  User,
  Template,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  Career,
  CareerData,
  CareerProfile,
} from '@/types'

const API_URL = '/api'  // Next.js API Routes 사용

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data)
  return response.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me')
  return response.data
}

// Post APIs
export const getPosts = async (
  page = 0,
  size = 10,
  tag?: string
): Promise<PageResponse<PostSummary>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
  if (tag) params.append('tag', tag)

  const response = await api.get<PageResponse<PostSummary>>(`/posts?${params}`)
  return response.data
}

export const getPost = async (id: number): Promise<PostDetail> => {
  const response = await api.get<PostDetail>(`/posts/${id}`)
  return response.data
}

export const createPost = async (data: CreatePostRequest): Promise<PostDetail> => {
  const response = await api.post<PostDetail>('/posts', data)
  return response.data
}

export const updatePost = async (id: number, data: UpdatePostRequest): Promise<PostDetail> => {
  const response = await api.put<PostDetail>(`/posts/${id}`, data)
  return response.data
}

export const deletePost = async (id: number): Promise<void> => {
  await api.delete(`/posts/${id}`)
}

export const searchPosts = async (
  keyword: string,
  page = 0,
  size = 10
): Promise<PageResponse<PostSummary>> => {
  const response = await api.get<PageResponse<PostSummary>>(
    `/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
  )
  return response.data
}

// Tag APIs
export const getTags = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/tags')
  return response.data
}

export const getAllTags = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/tags')
  return response.data
}

// File APIs
export const uploadFile = async (file: File): Promise<{ url: string; filename: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{ url: string; filename: string }>(
    '/files/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

export const getFileUrl = (filename: string): string => {
  return `/api/files/${filename}`
}

// Admin APIs
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/admin/dashboard')
  return response.data
}

export const getAllPostsForAdmin = async (
  page = 0,
  size = 10
): Promise<PageResponse<PostSummary>> => {
  const response = await api.get<PageResponse<PostSummary>>(
    `/admin/posts?page=${page}&size=${size}`
  )
  return response.data
}

// Template APIs
export const getTemplates = async (): Promise<Template[]> => {
  const response = await api.get<Template[]>('/templates')
  return response.data
}

export const getTemplate = async (id: number): Promise<Template> => {
  const response = await api.get<Template>(`/admin/templates/${id}`)
  return response.data
}

export const createTemplate = async (data: CreateTemplateRequest): Promise<Template> => {
  const response = await api.post<Template>('/admin/templates', data)
  return response.data
}

export const updateTemplate = async (id: number, data: UpdateTemplateRequest): Promise<Template> => {
  const response = await api.put<Template>(`/admin/templates/${id}`, data)
  return response.data
}

export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/admin/templates/${id}`)
}

// Career APIs
export const getCareerData = async (): Promise<CareerData> => {
  const response = await api.get<CareerData>('/career')
  return response.data
}

export const getCareers = async (): Promise<Career[]> => {
  const response = await api.get<CareerData>('/career')
  return response.data.careers
}

export const getCareerProfile = async (): Promise<CareerProfile> => {
  const response = await api.get<CareerProfile>('/career/profile')
  return response.data
}

export const updateCareerProfile = async (data: Partial<CareerProfile>): Promise<CareerProfile> => {
  const response = await api.put<CareerProfile>('/career/profile', data)
  return response.data
}

export const createCareer = async (data: Omit<Career, 'id'>): Promise<Career> => {
  const response = await api.post<Career>('/career', data)
  return response.data
}

export const updateCareer = async (id: string, data: Partial<Career>): Promise<Career> => {
  const response = await api.put<Career>(`/career/${id}`, data)
  return response.data
}

export const deleteCareer = async (id: string): Promise<void> => {
  await api.delete(`/career/${id}`)
}

export default api

