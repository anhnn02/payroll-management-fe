import { useApi } from '@/composables/useApi'
import type { Account, AccountFormData, AccountQueryParams } from '@/views/accounts/types'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

const ENDPOINT = '/accounts'

export const accountService = {
  /**
   * Get paginated list of accounts
   */
  async getList(params?: AccountQueryParams): Promise<PaginatedResponse<Account>> {
    const api = useApi()
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.set('page', String(params.page))
    if (params?.limit) queryParams.set('limit', String(params.limit))
    if (params?.search) queryParams.set('search', params.search)
    if (params?.role) queryParams.set('role', params.role)
    if (params?.status) queryParams.set('status', params.status)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT

    const response = await api.get<PaginatedResponse<Account>>(url)
    return response.data as PaginatedResponse<Account>
  },

  /**
   * Get single account by ID
   */
  async getById(id: number): Promise<ApiResponse<Account>> {
    const api = useApi()
    return api.get<Account>(`${ENDPOINT}/${id}`)
  },

  /**
   * Create new account
   */
  async create(data: AccountFormData): Promise<ApiResponse<Account>> {
    const api = useApi()
    return api.post<Account>(ENDPOINT, data)
  },

  /**
   * Update existing account
   */
  async update(id: number, data: Partial<AccountFormData>): Promise<ApiResponse<Account>> {
    const api = useApi()
    return api.put<Account>(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Delete account by ID
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.delete<null>(`${ENDPOINT}/${id}`)
  },
}
