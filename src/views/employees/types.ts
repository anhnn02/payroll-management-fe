// Employee types - aligned with BE API (FE-API-CONFIG.md Section 4.4)

export interface Employee {
  id: string
  code: string // Format: NVYYMMDD### (auto-generated)
  name: string
  dob: string // Format: YYYY-MM-DD
  gender: Gender
  idCard: string // CMND/CCCD (12 ký tự)
  email: string
  phone?: string
  address?: string
  deptId: string // FK → Department
  positionId: string // FK → Position
  hireDate: string // Format: YYYY-MM-DD
  status: EmployeeStatus
  createdAt?: string
  updatedAt?: string
  // Joined fields (BE may populate)
  deptName?: string
  positionName?: string
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

// Form data type for create/update
export type EmployeeFormData = Omit<Employee, 'id' | 'code' | 'createdAt' | 'updatedAt'>

// Search request (POST /employees/search)
export interface EmployeeSearchRequest {
  keyword?: string // Tìm theo code, name, email
  status?: string
  deptId?: string // Filter theo phòng ban
  positionId?: string // Filter theo chức vụ
  page: number
  size: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}
