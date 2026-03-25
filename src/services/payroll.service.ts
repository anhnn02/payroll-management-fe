import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions, PaginatedResponse } from '@/types/api'
import type {
  Payroll,
  PayrollSearchRequest,
  PayrollCalculateRequest,
  PayrollBreakdown,
} from '@/views/payroll/types'

export type { Payroll, PayrollSearchRequest, PayrollCalculateRequest, PayrollBreakdown }

export const payrollService = {
  /** Tìm kiếm bảng lương (POST /payroll/search) */
  async search(
    data: PayrollSearchRequest,
    options?: ApiRequestOptions
  ): Promise<PaginatedResponse<Payroll>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Payroll>>(
      API_ENDPOINTS.PAYROLL.SEARCH,
      data,
      options
    )
    return response.data as PaginatedResponse<Payroll>
  },

  /** Chi tiết bảng lương (GET /payroll/{id}) */
  async getById(id: string, options?: ApiRequestOptions): Promise<ApiResponse<Payroll>> {
    const api = useApi()
    return api.get<Payroll>(API_ENDPOINTS.PAYROLL.DETAIL(id), options)
  },

  /** Xem chi tiết phân tích lương (POST /payroll/breakdown) */
  async breakdown(
    data: PayrollCalculateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<PayrollBreakdown>> {
    const api = useApi()
    return api.post<PayrollBreakdown>(API_ENDPOINTS.PAYROLL.BREAKDOWN, data, options)
  },

  /** Tính lương (POST /payroll/calculate) — returns Void */
  async calculate(
    data: PayrollCalculateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<void>> {
    const api = useApi()
    return api.post<void>(API_ENDPOINTS.PAYROLL.CALCULATE, data, options)
  },

  /** Cập nhật bảng lương (PUT /payroll/{id}) — uses PayrollCalculateRequest */
  async update(
    id: string,
    data: PayrollCalculateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Payroll>> {
    const api = useApi()
    return api.put<Payroll>(API_ENDPOINTS.PAYROLL.UPDATE(id), data, options)
  },

  /** Xóa bảng lương — chỉ UNPAID (DELETE /payroll/{id}) */
  async delete(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.PAYROLL.DELETE(id), options)
  },
}
