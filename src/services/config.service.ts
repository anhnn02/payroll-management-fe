import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions } from '@/types/api'

// ===== Interfaces =====

export interface SalaryFactor {
  id: string
  code: string
  name: string
  value: number
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface SalaryFactorUpdateRequest {
  code: string
  value: number
}

export interface TaxConfig {
  id: string
  code: string
  taxRate: number
  personalDeduction: number
  dependentDeduction: number
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface InsuranceConfig {
  id: string
  code: string
  contractType: string
  bhxhRate: number
  bhtnRate: number
  bhytRate: number
  effectiveDate?: string
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface Holiday {
  id: string
  holidayDate: string
  name: string
  description?: string
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface HolidayCreateRequest {
  holidayDate: string
  name: string
  description?: string
}

// ===== Service =====

export const configService = {
  // ===== Salary Factors =====
  async getSalaryFactors(options?: ApiRequestOptions): Promise<ApiResponse<SalaryFactor[]>> {
    const api = useApi()
    return api.get<SalaryFactor[]>(API_ENDPOINTS.CONFIG.SALARY_FACTORS, options)
  },

  async updateSalaryFactors(
    data: SalaryFactorUpdateRequest[],
    options?: ApiRequestOptions
  ): Promise<ApiResponse<SalaryFactor[]>> {
    const api = useApi()
    return api.put<SalaryFactor[]>(API_ENDPOINTS.CONFIG.SALARY_FACTORS, data, options)
  },

  // ===== Tax Config =====
  async getTaxConfig(options?: ApiRequestOptions): Promise<ApiResponse<TaxConfig[]>> {
    const api = useApi()
    return api.get<TaxConfig[]>(API_ENDPOINTS.CONFIG.TAX, options)
  },

  // ===== Insurance Config =====
  async getInsuranceConfig(options?: ApiRequestOptions): Promise<ApiResponse<InsuranceConfig[]>> {
    const api = useApi()
    return api.get<InsuranceConfig[]>(API_ENDPOINTS.CONFIG.INSURANCE, options)
  },

  // ===== Holidays =====
  async getHolidays(options?: ApiRequestOptions): Promise<ApiResponse<Holiday[]>> {
    const api = useApi()
    return api.get<Holiday[]>(API_ENDPOINTS.CONFIG.HOLIDAYS, options)
  },

  async createHoliday(
    data: HolidayCreateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Holiday>> {
    const api = useApi()
    return api.post<Holiday>(API_ENDPOINTS.CONFIG.HOLIDAYS, data, options)
  },

  async deleteHoliday(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.CONFIG.HOLIDAY_DETAIL(id), options)
  },
}
