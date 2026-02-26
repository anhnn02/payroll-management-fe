// Position types - aligned with BE API (FE-POSITION-GUIDE.md Section 2)

export interface Position {
  id: string
  code: string // Mã vị trí (FE gen: VTyymmdd###)
  name: string // Tên vị trí
  description?: string // Mô tả (nullable)
  minSalary?: number // Lương tối thiểu (VNĐ)
  maxSalary?: number // Lương tối đa (VNĐ)
  employeeCount?: number // Số lượng nhân viên (BE trả thêm)
  status: PositionStatus
  createdAt?: string // ISO timestamp
  createdBy?: string // Username
  updatedAt?: string // ISO timestamp
  updatedBy?: string // Username
}

export type PositionStatus = 'ACTIVE' | 'INACTIVE'

// Search request (POST /positions/search)
export interface PositionSearchRequest {
  keyword?: string // Tìm kiếm theo mã hoặc tên (LIKE search)
  status?: string // Filter trạng thái
  page: number // Số trang (bắt đầu từ 0)
  size: number // Số bản ghi mỗi trang
}

// Create/Update request
export interface PositionFormData {
  code: string // Mã vị trí (FE auto-gen khi create)
  name: string // Bắt buộc, max 100 ký tự, unique
  description?: string // Tùy chọn, max 1000 ký tự
  minSalary: number // Bắt buộc, >= 0
  maxSalary: number // Bắt buộc, > minSalary
  status: string // Bắt buộc
}
