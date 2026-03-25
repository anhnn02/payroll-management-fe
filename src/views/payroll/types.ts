// Payroll types - aligned with BE API v2

export interface Payroll {
  id: string
  empId: string
  monthNum: number
  yearNum: number
  basicSalary: number
  offerSalary: number
  workingDays: number
  standardDays: number
  allowance: number
  rewardAmount: number
  penaltyAmount: number
  otHours: number
  otSalary: number
  bhxhAmount: number
  bhtnAmount: number
  bhytAmount: number
  taxAmount: number
  totalSalary: number
  grossNet: 'GROSS' | 'NET'
  status: 'UNPAID' | 'PAID'
  calculatedAt: string
  calculatedBy: string
  // Joined fields (FE may use)
  employeeName?: string
  employeeCode?: string
  departmentName?: string
}

// Search request (POST /payroll/search)
export interface PayrollSearchRequest {
  empId?: string
  status?: string
  monthNum?: number
  yearNum?: number
  page: number
  size: number
  sort?: string
}

// Calculate request (POST /payroll/calculate) — returns Void
// Also used for PUT /payroll/{id} update
export interface PayrollCalculateRequest {
  employeeCode: string
  monthYear: string // Format: "YYYY-MM"
}

// Breakdown request (POST /payroll/breakdown) — uses PayrollCalculateRequest
export type PayrollBreakdownRequest = PayrollCalculateRequest

// Breakdown response
export interface PayrollBreakdown {
  employeeCode: string
  monthYear: string
  workingSalary: number
  allowance: number
  reward: number
  penalty: number
  otHours: number
  otSalary: number
  bhxh: number
  bhtn: number
  bhyt: number
  tax: number
  totalSalary: number
}

// Update request — same as PayrollCalculateRequest per v2
export type PayrollUpdateRequest = PayrollCalculateRequest
