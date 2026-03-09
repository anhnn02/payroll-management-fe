import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { Employee, EmployeeFormData, EmployeeSearchRequest } from '@/views/employees/types'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export const employeeService = {
  /**
   * Tìm kiếm nhân viên (POST /employees/search)
   * ⚠️ Hệ thống dùng POST /search, KHÔNG phải GET với query params
   */
  async search(data: EmployeeSearchRequest): Promise<PaginatedResponse<Employee>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Employee>>(
      API_ENDPOINTS.EMPLOYEES.SEARCH,
      data
    )
    return response.data as PaginatedResponse<Employee>
  },

  /**
   * Chi tiết nhân viên (GET /employees/:id)
   */
  async getById(id: string): Promise<ApiResponse<Employee>> {
    const api = useApi()
    return api.get<Employee>(API_ENDPOINTS.EMPLOYEES.DETAIL(id))
  },

  /**
   * Tạo nhân viên (POST /employees)
   * code sẽ được auto-generated bởi BE
   */
  async create(data: EmployeeFormData): Promise<ApiResponse<Employee>> {
    const api = useApi()
    return api.post<Employee>(API_ENDPOINTS.EMPLOYEES.CREATE, data)
  },

  /**
   * Cập nhật nhân viên (PUT /employees/:id)
   */
  async update(id: string, data: Partial<EmployeeFormData>): Promise<ApiResponse<Employee>> {
    const api = useApi()
    return api.put<Employee>(API_ENDPOINTS.EMPLOYEES.UPDATE(id), data)
  },

  /**
   * Xóa nhân viên - soft delete (DELETE /employees/:id)
   * Chuyển status → INACTIVE
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.EMPLOYEES.DELETE(id))
  },
}
