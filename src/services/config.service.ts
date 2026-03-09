import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions } from '@/types/api'

// ===== Interfaces =====

export interface SalaryFactor {
  id: string
  code: string
  name: string
  value: number
  description?: string
  effectiveDate: string
}

export interface SalaryFactorUpdateRequest {
  code: string
  value: number
}

export interface TaxConfig {
  id: string
  code: string
  taxRate: number
  minIncome: number
  maxIncome?: number
  description?: string
}

export interface InsuranceConfig {
  id: string
  contractType: string
  bhxhRate: number
  bhtnRate: number
  bhytRate: number
  effectiveDate: string
}

export interface AllowanceConfig {
  id: string
  code: string
  name: string
  description?: string
  defaultAmount?: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AllowanceConfigCreateRequest {
  code: string
  name: string
  description?: string
  defaultAmount?: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AllowanceConfigUpdateRequest {
  name: string
  description?: string
  defaultAmount?: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface Holiday {
  id: string
  holidayDate: string
  name: string
  description?: string
}

export interface HolidayCreateRequest {
  holidayDate: string
  name: string
  description?: string
}

// ===== Mock Data =====

export const MOCK_SALARY_FACTORS: SalaryFactor[] = [
  {
    id: '1',
    code: 'OT_WEEKDAY',
    name: 'Hệ số OT ngày thường',
    value: 1.5,
    description: 'Tăng ca T2-T6',
    effectiveDate: '2020-01-01',
  },
  {
    id: '2',
    code: 'OT_SUNDAY',
    name: 'Hệ số OT Chủ nhật',
    value: 2.0,
    description: 'Tăng ca Chủ nhật',
    effectiveDate: '2020-01-01',
  },
  {
    id: '3',
    code: 'OT_HOLIDAY',
    name: 'Hệ số OT ngày lễ',
    value: 3.0,
    description: 'Tăng ca ngày lễ',
    effectiveDate: '2020-01-01',
  },
]

export const MOCK_TAX_CONFIG: TaxConfig[] = [
  {
    id: '1',
    code: 'TAX_LEVEL_1',
    taxRate: 5,
    minIncome: 0,
    maxIncome: 5000000,
    description: 'Bậc 1: Thu nhập đến 5 triệu',
  },
  {
    id: '2',
    code: 'TAX_LEVEL_2',
    taxRate: 10,
    minIncome: 5000000,
    maxIncome: 10000000,
    description: 'Bậc 2: Thu nhập từ 5-10 triệu',
  },
  {
    id: '3',
    code: 'TAX_LEVEL_3',
    taxRate: 15,
    minIncome: 10000000,
    maxIncome: 18000000,
    description: 'Bậc 3: Thu nhập từ 10-18 triệu',
  },
  {
    id: '4',
    code: 'TAX_LEVEL_4',
    taxRate: 20,
    minIncome: 18000000,
    maxIncome: 32000000,
    description: 'Bậc 4: Thu nhập từ 18-32 triệu',
  },
  {
    id: '5',
    code: 'TAX_LEVEL_5',
    taxRate: 25,
    minIncome: 32000000,
    maxIncome: 52000000,
    description: 'Bậc 5: Thu nhập từ 32-52 triệu',
  },
  {
    id: '6',
    code: 'TAX_LEVEL_6',
    taxRate: 30,
    minIncome: 52000000,
    maxIncome: 80000000,
    description: 'Bậc 6: Thu nhập từ 52-80 triệu',
  },
  {
    id: '7',
    code: 'TAX_LEVEL_7',
    taxRate: 35,
    minIncome: 80000000,
    maxIncome: undefined,
    description: 'Bậc 7: Trên 80 triệu',
  },
]

export const MOCK_INSURANCE_CONFIG: InsuranceConfig[] = [
  {
    id: '1',
    contractType: 'OFFICIAL',
    bhxhRate: 10,
    bhtnRate: 5,
    bhytRate: 5,
    effectiveDate: '2020-01-01',
  },
  {
    id: '2',
    contractType: 'PROBATION',
    bhxhRate: 0,
    bhtnRate: 0,
    bhytRate: 0,
    effectiveDate: '2020-01-01',
  },
  {
    id: '3',
    contractType: 'SEASONAL',
    bhxhRate: 0,
    bhtnRate: 0,
    bhytRate: 0,
    effectiveDate: '2020-01-01',
  },
]

export const MOCK_ALLOWANCES: AllowanceConfig[] = [
  {
    id: '1',
    code: 'LUNCH',
    name: 'Phụ cấp ăn trưa',
    description: 'Ăn trưa hàng ngày',
    defaultAmount: 800000,
    status: 'ACTIVE',
  },
  {
    id: '2',
    code: 'TRANSPORT',
    name: 'Phụ cấp xăng xe',
    description: 'Di chuyển',
    defaultAmount: 500000,
    status: 'ACTIVE',
  },
  {
    id: '3',
    code: 'PHONE',
    name: 'Phụ cấp điện thoại',
    description: 'Cước điện thoại',
    defaultAmount: 300000,
    status: 'ACTIVE',
  },
  {
    id: '4',
    code: 'HOUSING',
    name: 'Phụ cấp nhà ở',
    description: 'Hỗ trợ nhà ở',
    defaultAmount: 1000000,
    status: 'INACTIVE',
  },
]

export const MOCK_HOLIDAYS: Holiday[] = [
  {
    id: '1',
    holidayDate: '2026-01-01',
    name: 'Tết Dương lịch',
    description: 'Ngày Tết Dương lịch',
  },
  {
    id: '2',
    holidayDate: '2026-04-30',
    name: 'Giải phóng miền Nam',
    description: 'Ngày 30 tháng 4',
  },
  { id: '3', holidayDate: '2026-05-01', name: 'Quốc tế Lao động', description: 'Ngày 1 tháng 5' },
  { id: '4', holidayDate: '2026-09-02', name: 'Quốc khánh', description: 'Ngày 2 tháng 9' },
]

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

  // ===== Allowance Config =====
  async getAllowances(options?: ApiRequestOptions): Promise<ApiResponse<AllowanceConfig[]>> {
    const api = useApi()
    return api.get<AllowanceConfig[]>(API_ENDPOINTS.CONFIG.ALLOWANCES, options)
  },

  async createAllowance(
    data: AllowanceConfigCreateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<AllowanceConfig>> {
    const api = useApi()
    return api.post<AllowanceConfig>(API_ENDPOINTS.CONFIG.ALLOWANCES, data, options)
  },

  async updateAllowance(
    id: string,
    data: AllowanceConfigUpdateRequest,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<AllowanceConfig>> {
    const api = useApi()
    return api.put<AllowanceConfig>(API_ENDPOINTS.CONFIG.ALLOWANCE_DETAIL(id), data, options)
  },

  async deleteAllowance(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.CONFIG.ALLOWANCE_DETAIL(id), options)
  },

  // ===== Holidays =====
  async getHolidays(year: number, options?: ApiRequestOptions): Promise<ApiResponse<Holiday[]>> {
    const api = useApi()
    return api.get<Holiday[]>(`${API_ENDPOINTS.CONFIG.HOLIDAYS}?year=${year}`, options)
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
