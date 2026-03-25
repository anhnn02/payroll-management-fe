import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions, PaginatedResponse } from '@/types/api'

// ===== Types =====

export interface SalaryPaymentCreateRequest {
  monthNum: number
  yearNum: number
  paymentDate: string // format YYYY-MM-DD
  approvedBy: string
  note?: string
}

export interface SalaryPaymentCreateResponse {
  count: number
  message: string
}

export interface SalaryPaymentSearchRequest {
  keyword?: string
  monthNum?: number
  yearNum?: number
  approvedBy?: string
  page?: number
  size?: number
}

export interface SalaryPayment {
  id: string
  payrollId: number
  paymentDate: string
  approvedBy: string
  note?: string
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
}

// ===== Service =====

export const salaryPaymentService = {
  /**
   * Tạo thanh toán lương (POST /salary-payments/create)
   */
  async create(
    data: SalaryPaymentCreateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SalaryPaymentCreateResponse>> {
    const api = useApi()
    return api.post<SalaryPaymentCreateResponse>(API_ENDPOINTS.SALARY_PAYMENTS.CREATE, data, options)
  },

  /**
   * Tìm kiếm phiếu thanh toán (POST /salary-payments/search)
   */
  async search(
    data: SalaryPaymentSearchRequest,
    options?: ApiRequestOptions
  ): Promise<PaginatedResponse<SalaryPayment>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<SalaryPayment>>(
      API_ENDPOINTS.SALARY_PAYMENTS.SEARCH,
      data,
      options
    )
    return response.data as PaginatedResponse<SalaryPayment>
  },

  /**
   * Chi tiết phiếu thanh toán (GET /salary-payments/:id)
   */
  async getById(
    id: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SalaryPayment>> {
    const api = useApi()
    return api.get<SalaryPayment>(API_ENDPOINTS.SALARY_PAYMENTS.DETAIL(id), options)
  },
}
