// Department types - aligned with BE API (FE-DEPARTMENT-GUIDE.md Section 2)

export interface Department {
  id: string
  code: string // Mã phòng ban (VD: "IT", "HR", "FIN")
  name: string // Tên phòng ban
  description?: string // Mô tả (nullable)
  parentId?: string // UUID phòng ban cha (nullable)
  parentName?: string // Tên phòng ban cha (BE trả thêm, nullable)
  employeeCount?: number // Số lượng nhân viên đang Active (BE trả thêm)
  status: DepartmentStatus
  createdAt: string // ISO timestamp
  createdBy: string // Username
  updatedAt: string // ISO timestamp
  updatedBy: string // Username
}

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE'

// Search request (POST /departments/search)
export interface DepartmentSearchRequest {
  keyword?: string // Tìm kiếm theo mã hoặc tên (LIKE search)
  status?: string // Filter trạng thái
  page: number // Số trang (bắt đầu từ 0)
  size: number // Số bản ghi mỗi trang (default: 50)
  sort?: string // Sắp xếp (VD: "name,asc")
}

// Create/Update request
export interface DepartmentFormData {
  code: string // Bắt buộc, unique, 1-20 ký tự
  name: string // Bắt buộc, 1-100 ký tự
  description?: string // Tùy chọn
  parentId?: string // Tùy chọn — UUID phòng ban cha
  status: string // Bắt buộc
}
