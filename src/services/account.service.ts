import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { Account, AccountFormData, AccountSearchRequest } from '@/views/accounts/types'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export const accountService = {
  /**
   * Tìm kiếm tài khoản (POST /users/search)
   * ⚠️ Hệ thống dùng POST /search, KHÔNG phải GET với query params
   */
  async search(data: AccountSearchRequest): Promise<PaginatedResponse<Account>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Account>>(API_ENDPOINTS.USERS.SEARCH, data)
    return response.data as PaginatedResponse<Account>
  },

  /**
   * Chi tiết tài khoản (GET /users/:id)
   */
  async getById(id: number | string): Promise<ApiResponse<Account>> {
    const api = useApi()
    return api.get<Account>(API_ENDPOINTS.USERS.DETAIL(id))
  },

  /**
   * Tạo tài khoản (POST /users)
   */
  async create(data: AccountFormData): Promise<ApiResponse<Account>> {
    const api = useApi()
    return api.post<Account>(API_ENDPOINTS.USERS.CREATE, data)
  },

  /**
   * Cập nhật tài khoản (PUT /users/:id)
   */
  async update(id: number | string, data: Partial<AccountFormData>): Promise<ApiResponse<Account>> {
    const api = useApi()
    return api.put<Account>(API_ENDPOINTS.USERS.UPDATE(id), data)
  },

  /**
   * Xóa tài khoản (DELETE /users/:id)
   */
  async delete(id: number | string): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.USERS.DELETE(id))
  },
}
