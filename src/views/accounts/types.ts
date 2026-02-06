// Account types for the account management module

export interface Account {
  id: number
  username: string
  email: string
  fullName: string
  role: AccountRole
  status: AccountStatus
  createdAt: string
  updatedAt: string
}

export type AccountRole = 'ACCOUNTANT' | 'HR'
export type AccountStatus = 'ACTIVE' | 'INACTIVE'

// Form data type (omit auto-generated fields)
export type AccountFormData = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>

// Query params for list
export interface AccountQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: AccountRole | ''
  status?: AccountStatus | ''
}
