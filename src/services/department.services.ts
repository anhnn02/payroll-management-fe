import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions, PaginatedResponse } from '@/types/api'
import type {
  Department,
  DepartmentSearchRequest,
  DepartmentFormData,
} from '@/views/departments/types'

export type { Department, DepartmentSearchRequest, DepartmentFormData }

export const departmentService = {
  async search(
    data: DepartmentSearchRequest,
    options?: ApiRequestOptions
  ): Promise<PaginatedResponse<Department>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Department>>(
      API_ENDPOINTS.DEPARTMENTS.SEARCH,
      data,
      options
    )
    return response.data as PaginatedResponse<Department>
  },

  async getById(id: string, options?: ApiRequestOptions): Promise<ApiResponse<Department>> {
    const api = useApi()
    return api.get<Department>(API_ENDPOINTS.DEPARTMENTS.DETAIL(id), options)
  },

  async create(
    data: DepartmentFormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Department>> {
    const api = useApi()
    return api.post<Department>(API_ENDPOINTS.DEPARTMENTS.CREATE, data, options)
  },

  async update(
    id: string,
    data: DepartmentFormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Department>> {
    const api = useApi()
    return api.put<Department>(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data, options)
  },

  async delete(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.DEPARTMENTS.DELETE(id), options)
  },
}
