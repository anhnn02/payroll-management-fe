// API Response format
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  code: number
  message: string
  data: T
  meta?: PaginationMeta
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API Error interface
export interface ApiError {
  status: 'error'
  code: number
  message: string
  errors?: Record<string, string[]>
}

// Request options for useApi
export interface ApiRequestOptions {
  timeout?: number
  headers?: Record<string, string>
  showErrorToast?: boolean
  signal?: AbortSignal
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// User interface
export interface User {
  id: number
  email: string
  name: string
  avatar?: string
  role?: string
  permissions?: string[]
  created_at?: string
  updated_at?: string
}

// Auth response
export interface AuthResponse {
  token: string
  user: User
}

// Generic list params
export interface ListParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}
