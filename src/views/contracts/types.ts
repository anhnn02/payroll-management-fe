// Contract types - aligned with BE API v3

export type ContractTypeValue = 'PROBATION' | 'OFFICIAL' | 'SEASONAL'
export type ContractStatusType = 'ACTIVE' | 'EXPIRED'
export type SalaryTypeValue = 'GROSS' | 'NET'

export interface Contract {
  id: string
  contractNumber: string
  empId: string
  startDate: string
  endDate?: string
  salaryType: SalaryTypeValue
  baseSalary: number
  offerSalary: number
  contractType: ContractTypeValue
  status: ContractStatusType
  fileUrl?: string
  terms?: string
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
  // Joined fields (FE may need)
  employeeName?: string
  employeeCode?: string
}

// Search request (POST /contracts/search)
export interface ContractSearchRequest {
  keyword?: string
  contractNumber?: string
  empId?: string
  contractType?: string
  status?: string
  startDateFrom?: string
  startDateTo?: string
  page: number
  size: number
  sort?: string
}

// Create/Update request (ContractRequest)
export interface ContractFormData {
  contractNumber: string
  empId: string
  startDate: string
  endDate?: string
  salaryType: string
  baseSalary: number
  offerSalary: number
  contractType: string
  status: string
  terms?: string
}
