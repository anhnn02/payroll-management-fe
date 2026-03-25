import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions } from '@/types/api'
import { useAuthStore } from '@/stores/auth'

// ===== Dashboard PYC Types (GET /reports/dashboard-pyc) =====

export interface DashboardAlert {
  type: string
  severity: 'INFO' | 'WARN' | 'ERROR' | string
  message: string
  link?: string
  roles?: string[]
}

export interface DashboardKpis {
  activeEmployees: number
  payrollFund: number | null
  totalOtHours: number | null
  unpaidPayrollCount: number
}

export interface MonthlyPoint {
  month: string
  amount: number
}

export interface DeptAmount {
  deptId: string
  deptName: string
  amount: number
}

export interface DashboardCharts {
  payrollTrend6m: MonthlyPoint[]
  payrollByDept: DeptAmount[]
  otByDept: DeptAmount[]
}

export interface DashboardQuickLink {
  label: string
  url: string
  roles?: string[]
}

export interface DashboardDeptStatus {
  deptId: string
  deptName: string
  activeEmployeeCount: number
  avgWorkDays: number
  avgOtHours: number
  status: 'OK' | 'THIEU_CHAM_CONG' | 'CHO_DUYET_LUONG' | string
}

export interface DashboardPycResponse {
  month: string
  alerts: DashboardAlert[]
  kpis: DashboardKpis
  charts: DashboardCharts
  quickLinks: DashboardQuickLink[]
  deptStatus: DashboardDeptStatus[]
}

// ===== Dashboard Overview Types (GET /reports/dashboard) =====

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

// ===== Report Types =====

export interface ReportCreateRequest {
  monthNum: number
  yearNum: number
  deptId?: string
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
