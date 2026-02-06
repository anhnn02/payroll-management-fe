// Employee types

export interface Employee {
  id: number
  employeeCode: string
  fullName: string
  email: string
  phone: string
  department: string
  position: string
  status: EmployeeStatus
  joinDate: string
  createdAt: string
  updatedAt: string
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>

export interface EmployeeQueryParams {
  page?: number
  limit?: number
  search?: string
  department?: string
  status?: EmployeeStatus | ''
}
