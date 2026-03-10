// Contract types - aligned with BE API (FE-CONTRACT-GUIDE.md Section 2)

export interface Contract {
  id: string
  empId: string
  employeeName?: string // BE trả thêm (nullable)
  employeeCode?: string // BE trả thêm (nullable)
  contractNumber: string
  contractType: ContractTypeValue // 'PROBATION' | 'OFFICIAL' | 'SEASONAL'
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD (nullable)
  baseSalary: number // Lương cơ bản (tính BHXH)
  offerSalary: number // Lương thỏa thuận
  salaryType: SalaryTypeValue // 'GROSS' | 'NET'
  terms?: string
  filePath?: string // Ánh xạ từ file_url
  status: ContractStatusType // 'ACTIVE' | 'EXPIRED'
  createdAt: string // ISO timestamp
  createdBy: string // Username
  updatedAt?: string // ISO timestamp
  updatedBy?: string // Username
}

export type ContractTypeValue = 'PROBATION' | 'OFFICIAL' | 'SEASONAL'
export type ContractStatusType = 'ACTIVE' | 'EXPIRED'
export type SalaryTypeValue = 'GROSS' | 'NET'

// Search request (POST /contracts/search)
export interface ContractSearchRequest {
  keyword?: string // Tìm theo số HĐ, mã NV, tên NV
  empId?: string // Filter theo nhân viên
  contractType?: string // PROBATION | OFFICIAL | SEASONAL
  status?: string // ACTIVE | EXPIRED
  page: number // 0-indexed
  size: number // Default: 10
  sort?: string // VD: "startDate,desc"
}

// Create/Update request
export interface ContractFormData {
  empId: string // UUID nhân viên (bắt buộc)
  contractNumber: string // Số hợp đồng
  contractType: string // PROBATION | OFFICIAL | SEASONAL
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD (nullable)
  baseSalary: number // > 0
  offerSalary: number // > 0
  salaryType: string // GROSS | NET
  terms?: string
  status: string // ACTIVE | EXPIRED
  factorId?: string
}
