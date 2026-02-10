import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

// Position interface (aligned with BE)
export interface Position {
  id: string
  code: string
  name: string
  description?: string
  level: 'JUNIOR' | 'MIDDLE' | 'SENIOR'
  status: 'ACTIVE' | 'INACTIVE'
}

export interface PositionSearchRequest {
  keyword?: string
  status?: string
  level?: string
  page: number
  size: number
}

export const positionService = {
  /**
   * Tìm kiếm chức vụ (POST /positions/search)
   */
  async search(data: PositionSearchRequest): Promise<PaginatedResponse<Position>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Position>>(
      API_ENDPOINTS.POSITIONS.SEARCH,
      data
    )
    return response.data as PaginatedResponse<Position>
  },

  /**
   * Chi tiết chức vụ (GET /positions/:id)
   */
  async getById(id: string): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.get<Position>(API_ENDPOINTS.POSITIONS.DETAIL(id))
  },

  /**
   * Tạo chức vụ (POST /positions)
   */
  async create(data: Omit<Position, 'id'>): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.post<Position>(API_ENDPOINTS.POSITIONS.CREATE, data)
  },

  /**
   * Cập nhật chức vụ (PUT /positions/:id)
   */
  async update(id: string, data: Partial<Position>): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.put<Position>(API_ENDPOINTS.POSITIONS.UPDATE(id), data)
  },

  /**
   * Xóa chức vụ (DELETE /positions/:id)
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.POSITIONS.DELETE(id))
  },
}
