import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

// Department interface (aligned with BE)
export interface Department {
  id: string
  code: string
  name: string
  description?: string
  parentId?: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface DepartmentSearchRequest {
  keyword?: string
  status?: string
  page: number
  size: number
}

export const departmentService = {
  /**
   * Tìm kiếm phòng ban (POST /departments/search)
   */
  async search(data: DepartmentSearchRequest): Promise<PaginatedResponse<Department>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Department>>(
      API_ENDPOINTS.DEPARTMENTS.SEARCH,
      data
    )
    return response.data as PaginatedResponse<Department>
  },

  /**
   * Chi tiết phòng ban (GET /departments/:id)
   */
  async getById(id: string): Promise<ApiResponse<Department>> {
    const api = useApi()
    return api.get<Department>(API_ENDPOINTS.DEPARTMENTS.DETAIL(id))
  },

  /**
   * Tạo phòng ban (POST /departments)
   */
  async create(data: Omit<Department, 'id'>): Promise<ApiResponse<Department>> {
    const api = useApi()
    return api.post<Department>(API_ENDPOINTS.DEPARTMENTS.CREATE, data)
  },

  /**
   * Cập nhật phòng ban (PUT /departments/:id)
   */
  async update(id: string, data: Partial<Department>): Promise<ApiResponse<Department>> {
    const api = useApi()
    return api.put<Department>(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data)
  },

  /**
   * Xóa phòng ban (DELETE /departments/:id)
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.DEPARTMENTS.DELETE(id))
  },
}
