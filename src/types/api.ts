// API Response format
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
  success: boolean
}

// Paginated response format
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
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

// Auth types
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: string
  avatar?: string
}
