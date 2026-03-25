import type { SearchRequest } from './api'

// --- OT Type ---
export type OtType = 'WEEKDAY' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY'

// --- Requests ---

export interface AttendanceCreateRequest {
  empId: number | string
  attendanceDate: string // format YYYY-MM-DD
  startTime: string // format HH:mm
  endTime: string // format HH:mm
  lunchBreakHours: number
  workHours: number
  normalHours: number
  otHours: number
  isWorkingDay: boolean
  otType?: OtType
  note?: string
}

export interface AttendanceSearchRequest extends SearchRequest {
  month?: string // format YYYY-MM
  keyword?: string
  deptId?: string
  empId?: number | string
  dateFrom?: string
  dateTo?: string
}

export interface AttendanceMonthlyRequest {
  month: string // required format YYYY-MM
  keyword?: string
  deptId?: string
}

// Body only — `month` is sent as query param
export interface AttendanceMonthlyUpdateRequest {
  workDays: number
  otHours: number
  leaveApproved: number
  leaveUnauthorized: number
}

// --- Responses ---

export interface AttendanceResponse {
  id: string
  empId: string
  attendanceDate: string
  startTime: string | null
  endTime: string | null
  lunchBreakHours: number
  workHours: number
  normalHours: number
  otHours: number
  isWorkingDay: boolean
  otType: OtType | string | null
  note: string | null
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface AttendanceMonthlyRow {
  empId: string
  employeeCode: string
  employeeName: string
  deptId: string
  deptName: string
  workDays: number
  standardDays: number
  otHours: number
  leaveApproved: number
  leaveUnauthorized: number
}

export interface AttendanceMonthlyResponse {
  month: string
  locked: boolean
  employeeCount: number
  totalOtHours: number
  avgWorkDays: number
  rows: AttendanceMonthlyRow[]
}

export interface AttendanceImportError {
  row: number
  employeeCode: string
  error: string
}

export interface AttendanceImportResultResponse {
  totalRows: number
  successCount: number
  failedCount: number
  errors?: AttendanceImportError[]
}
