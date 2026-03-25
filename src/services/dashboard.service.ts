import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions } from '@/types/api'
import { useAuthStore } from '@/stores/auth'

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

// ===== Report Types =====

export interface DashboardOverviewResponse {
  totalEmployees: number
  activeEmployees: number
  totalPayroll: number
  unpaidPayroll: number
  paidPayroll: number
  avgSalary: number
  totalOtHours: number
  totalOtCost: number
}

export interface ReportCreateRequest {
  monthNum: number
  yearNum: number
  deptId?: number
  format: 'EXCEL' | 'PDF'
}

export interface ReportCreateResponse {
  reportUrl: string
  expiresAt: string
}

// ===== Service =====

export const dashboardService = {
  /**
   * Dashboard PYC nâng cao (GET /reports/dashboard-pyc)
   */
  getDashboardPyc(month?: string): Promise<ApiResponse<DashboardPycResponse>> {
    const api = useApi()
    const url = month
      ? `${API_ENDPOINTS.REPORTS.DASHBOARD_PYC}?month=${month}`
      : API_ENDPOINTS.REPORTS.DASHBOARD_PYC
    return api.get<DashboardPycResponse>(url)
  },

  /**
   * Dashboard tổng quan (GET /reports/dashboard)
   */
  getDashboardOverview(
    monthNum: number,
    yearNum: number,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<DashboardOverviewResponse>> {
    const api = useApi()
    return api.get<DashboardOverviewResponse>(
      `${API_ENDPOINTS.REPORTS.DASHBOARD}?monthNum=${monthNum}&yearNum=${yearNum}`,
      options
    )
  },

  /**
   * Tạo báo cáo lương (POST /reports/salary)
   */
  async createSalaryReport(
    data: ReportCreateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<ReportCreateResponse>> {
    const api = useApi()
    return api.post<ReportCreateResponse>(API_ENDPOINTS.REPORTS.SALARY, data, options)
  },

  /**
   * Export báo cáo trực tiếp (GET /reports/export)
   * Response: File binary (Excel hoặc PDF)
   */
  async exportReport(params: {
    monthNum: number
    yearNum: number
    format: 'EXCEL' | 'PDF'
  }): Promise<void> {
    const authStore = useAuthStore()
    const query = new URLSearchParams({
      monthNum: String(params.monthNum),
      yearNum: String(params.yearNum),
      format: params.format,
    }).toString()
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

    const response = await fetch(`${baseUrl}${API_ENDPOINTS.REPORTS.EXPORT}?${query}`, {
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
    })

    if (!response.ok) {
      throw new Error('Export báo cáo thất bại')
    }

    const blob = await response.blob()
    const ext = params.format === 'EXCEL' ? 'xlsx' : 'pdf'
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bao_cao_luong_${params.monthNum}_${params.yearNum}.${ext}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}
