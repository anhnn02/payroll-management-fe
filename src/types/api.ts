// API Response format
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number | string
  success?: boolean
  code?: number
  meta?: PaginationMeta
}

// Paginated response format (matches Spring Boot PageResponse)
export interface PaginatedResponse<T> {
  content: T[] // Dữ liệu
  totalElements: number // Tổng số bản ghi
  totalPages: number // Tổng số trang
  size: number // Số bản ghi mỗi trang
  number: number // Trang hiện tại (0-indexed)
  first: boolean
  last: boolean
}

// Pagination meta (legacy format, kept for compatibility)
export interface PaginationMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
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

// Standard search request (matches BE pattern: POST /{resource}/search)
export interface SearchRequest {
  keyword?: string // Từ khóa tìm kiếm chung
  status?: string // Filter theo trạng thái
  page: number // Số trang (0-indexed)
  size: number // Số bản ghi mỗi trang
  sortBy?: string // Tên field sort
  sortDirection?: 'ASC' | 'DESC'
}

// Auth types
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  role: 'HR_MANAGER' | 'ACCOUNTANT'
  username: string
  employeeId?: string
}

export interface User {
  id: number | string
  username: string
  email?: string
  fullName?: string
  role: string
  employeeId?: string
  avatar?: string
}
