// Account/User types - aligned with BE API (FE-API-CONFIG.md)

export interface Account {
  id: number | string
  username: string
  email: string
  fullName: string
  role: AccountRole
  status: AccountStatus
  createdAt: string
  updatedAt: string
}

export type AccountRole = 'HR_MANAGER' | 'ACCOUNTANT'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED'

// Form data type (omit auto-generated fields)
export type AccountFormData = Omit<Account, 'id' | 'createdAt' | 'updatedAt'> & {
  password?: string // Chỉ khi tạo mới
}

// Search request (POST /users/search)
export interface AccountSearchRequest {
  keyword?: string
  role?: string
  status?: string
  page: number
  size: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}
