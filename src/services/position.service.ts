import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions, PaginatedResponse } from '@/types/api'
import type { Position, PositionSearchRequest, PositionFormData } from '@/views/positions/types'

export type { Position, PositionSearchRequest, PositionFormData }

export const positionService = {
  /**
   * Tìm kiếm vị trí (POST /positions/search)
   */
  async search(
    data: PositionSearchRequest,
    options?: ApiRequestOptions
  ): Promise<PaginatedResponse<Position>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Position>>(
      API_ENDPOINTS.POSITIONS.SEARCH,
      data,
      options
    )
    return response.data as PaginatedResponse<Position>
  },

  /**
   * Chi tiết vị trí (GET /positions/:id)
   */
  async getById(id: string, options?: ApiRequestOptions): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.get<Position>(API_ENDPOINTS.POSITIONS.DETAIL(id), options)
  },

  /**
   * Tạo vị trí (POST /positions)
   */
  async create(
    data: PositionFormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.post<Position>(API_ENDPOINTS.POSITIONS.CREATE, data, options)
  },

  /**
   * Cập nhật vị trí (PUT /positions/:id)
   */
  async update(
    id: string,
    data: PositionFormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.put<Position>(API_ENDPOINTS.POSITIONS.UPDATE(id), data, options)
  },

  /**
   * Xóa vị trí (DELETE /positions/:id)
   */
  async delete(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.POSITIONS.DELETE(id), options)
  },
}
