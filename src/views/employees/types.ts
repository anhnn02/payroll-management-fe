// Employee types - aligned with BE API v3

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface Employee {
  id: string
  code: string
  name: string
  dob: string // Format: YYYY-MM-DD
  gender: Gender
  idCard: string // CCCD/CMND
  email: string
  phone?: string
  address?: string
  deptId: string
  positionId: string
  hireDate: string // Format: YYYY-MM-DD
  status: EmployeeStatus
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
  // Joined fields — chỉ có trong POST /employees/search
  deptName?: string
  positionName?: string
}

// Create/Update request (EmployeeRequest)
export interface EmployeeFormData {
  code?: string
  name: string
  dob: string
  gender: Gender | string
  idCard: string
  email: string
  phone?: string
  address?: string
  deptId: string
  positionId: string
  hireDate: string
  status: string
}

// Search request (POST /employees/search)
export interface EmployeeSearchRequest {
  keyword?: string
  code?: string
  name?: string
  deptIds?: string[]
  positionIds?: string[]
  status?: string
  gender?: string
  page: number
  size: number
  sort?: string
}
