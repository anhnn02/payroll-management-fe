import type { SearchRequest } from './api'

// --- Requests ---

export interface AttendanceSearchRequest extends SearchRequest {
  month?: string // format YYYY-MM
  keyword?: string
  deptId?: string
}

export interface AttendanceMonthlyRequest {
  month: string // required format YYYY-MM
  keyword?: string
  deptId?: string
}

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
  empCode: string
  empName: string
  attendanceDate: string
  startTime: string | null
  endTime: string | null
  workHours: number
  normalHours: number
  otHours: number
  otType: string | null
  isWorkingDay: boolean
  note: string | null
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface AttendanceMonthlyRow {
  id: string
  empId: string
  empCode: string
  empName: string
  deptId: string
  deptName: string
  workDays: number
  stdDays: number
  otHours: number
  leaveApproved: number
  leaveUnauthorized: number
  status?: string 
}

export interface AttendanceMonthlyResponse {
  locked: boolean
  employeeCount: number
  totalOtHours: number
  avgWorkDays: number
  rows: AttendanceMonthlyRow[]
}

export interface AttendanceImportError {
  row: number
  employeeCode: string
  employeeName?: string
  workDays?: number | string
  otHours?: number | string
  leaveDays?: number | string
  error: string
}

export interface AttendanceImportRecord {
  row: number
  employeeCode: string
  employeeName?: string
  workDays?: number | string
  otHours?: number | string
  leaveDays?: number | string
  error?: string
}

export interface AttendanceImportResultResponse {
  totalRows: number
  successCount: number
  failedCount: number
  errors?: AttendanceImportRecord[]
  records?: AttendanceImportRecord[]
}
