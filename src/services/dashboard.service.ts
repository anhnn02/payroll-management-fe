import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse } from '@/types/api'

export interface DashboardAlert {
  type: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success' | string
  navigateTo: string
}

export interface DashboardKpi {
  employeeActive: number
  payrollFund: number | null
  totalOT: number | null
  unpaidCount: number
}

export interface TrendChartData {
  monthYear: string
  totalFund: number
}

export interface DeptPieChartData {
  deptId: string
  deptName: string
  totalFund: number
  percentage: number
}

export interface DeptOTBarChartData {
  deptId: string
  deptName: string
  totalOTHours: number
}

export interface DeptStatusTableData {
  deptName: string
  totalEmp: number
  hasAttendance: number
  noAttendance: number
  totalOT: number
  payrollStatus: 'PAID' | 'UNPAID' | 'NONE' | string
}

export interface DashboardPycResponse {
  kpi: DashboardKpi
  alerts: DashboardAlert[]
  trendChart: TrendChartData[]
  deptPieChart: DeptPieChartData[]
  deptOTBarChart: DeptOTBarChartData[]
  deptStatusTable: DeptStatusTableData[]
  currentMonth: string
  generatedAt: string
}

export const dashboardService = {
  getDashboardPyc(month?: string): Promise<ApiResponse<DashboardPycResponse>> {
    const api = useApi()
    const url = month
      ? `${API_ENDPOINTS.REPORTS.DASHBOARD_PYC}?month=${month}`
      : API_ENDPOINTS.REPORTS.DASHBOARD_PYC
    return api.get<DashboardPycResponse>(url)
  },
}
