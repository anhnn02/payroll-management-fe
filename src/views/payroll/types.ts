// Payroll types - aligned with BE API (FE-PAYROLL-GUIDE.md Section 2)

export interface Payroll {
  id: string
  empId: string
  employeeName?: string // BE trả thêm (join employee)
  employeeCode?: string // BE trả thêm (join employee)
  departmentName?: string // BE trả thêm (join department)
  monthNum: number // 1-12
  yearNum: number
  basicSalary: number // Lương cơ bản (tính BHXH)
  offerSalary: number // Lương thỏa thuận (từ HĐ)
  workingDays: number // Số ngày làm thực tế
  standardDays: number // Số công chuẩn (26)
  workingSalary: number // Lương theo công = offer * (actual/standard)
  allowance: number // Tổng phụ cấp
  rewardAmount: number // Tổng thưởng
  penaltyAmount: number // Tổng phạt
  otHours: number // Tổng giờ tăng ca
  otSalary: number // Lương tăng ca
  bhxhAmount: number // BHXH (10%)
  bhtnAmount: number // BHTN (5%)
  bhytAmount: number // BHYT (5%)
  taxAmount: number // Thuế TNCN
  totalSalary: number // Lương thực nhận
  grossNet: 'GROSS' | 'NET'
  status: 'UNPAID' | 'PAID'
  calculatedAt: string
  calculatedBy: string
  createdAt: string
  updatedAt: string
}

// Search request (POST /payroll/search)
export interface PayrollSearchRequest {
  keyword?: string // Tìm theo mã NV, tên NV
  monthNum?: number // Filter theo tháng (1-12)
  yearNum?: number // Filter theo năm
  deptId?: string // Filter theo phòng ban
  status?: string // UNPAID | PAID
  page: number // 0-indexed
  size: number // Default: 10
  sort?: string // VD: "totalSalary,desc"
}

// Calculate request (POST /payroll/calculate)
export interface PayrollCalculateRequest {
  employeeCode: string // Mã nhân viên (VD: "NV20260101001")
  monthYear: string // Format: "YYYY-MM" (VD: "2026-01")
}

// Update request — manual adjustment (PUT /payroll/{id})
export interface PayrollUpdateRequest {
  workingDays?: number // Điều chỉnh ngày công
  allowance?: number // Điều chỉnh phụ cấp
  rewardAmount?: number // Điều chỉnh thưởng
  penaltyAmount?: number // Điều chỉnh phạt
  otHours?: number // Điều chỉnh giờ OT
  note?: string // Lý do điều chỉnh
}
