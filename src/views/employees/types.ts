// Employee types - aligned with BE API v2

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface Employee {
  id: string
  code: string
  name: string
  dob: string // Format: YYYY-MM-DD
  gender: Gender
  deptId: string
  positionId: string
  hireDate: string // Format: YYYY-MM-DD
  status: EmployeeStatus
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
  // Joined fields (BE may populate)
  deptName?: string
  positionName?: string
}

// Form data type for create/update (EmployeeRequest)
export interface EmployeeFormData {
  code?: string
  name: string
  dob: string
  gender: Gender | string
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
