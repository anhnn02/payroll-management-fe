import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import { useAuthStore } from '@/stores/auth'
import type {
  AttendanceCreateRequest,
  AttendanceSearchRequest,
  AttendanceResponse,
  AttendanceMonthlyRequest,
  AttendanceMonthlyResponse,
  AttendanceMonthlyUpdateRequest,
  AttendanceImportResultResponse,
} from '@/types/attendance'

export const attendanceService = {
  /**
   * Tạo bản ghi chấm công (POST /attendance)
   */
  async create(data: AttendanceCreateRequest): Promise<ApiResponse<AttendanceResponse>> {
    const api = useApi()
    return api.post<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.CREATE, data)
  },

  /**
   * Tìm kiếm chấm công cơ bản (POST /attendance/search)
   */
  async search(data: AttendanceSearchRequest): Promise<PaginatedResponse<AttendanceResponse>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<AttendanceResponse>>(
      API_ENDPOINTS.ATTENDANCE.SEARCH,
      data
    )
    return response.data as PaginatedResponse<AttendanceResponse>
  },

  /**
   * Lấy tổng hợp chấm công tháng (GET /attendance/monthly)
   */
  async getMonthly(params: AttendanceMonthlyRequest): Promise<ApiResponse<AttendanceMonthlyResponse>> {
    const api = useApi()
    // Chuyển đối tượng params thành query string
    const query = new URLSearchParams(params as unknown as Record<string, string>).toString()
    return api.get<AttendanceMonthlyResponse>(`${API_ENDPOINTS.ATTENDANCE.MONTHLY}?${query}`)
  },

  /**
   * Cập nhật chấm công tháng cho 1 NV (PUT /attendance/monthly/:empId?month=YYYY-MM)
   */
  async updateMonthly(
    empId: string,
    month: string,
    data: AttendanceMonthlyUpdateRequest
  ): Promise<ApiResponse<void>> {
    const api = useApi()
    return api.put<void>(`${API_ENDPOINTS.ATTENDANCE.MONTHLY_UPDATE(empId)}?month=${month}`, data)
  },

  /**
   * Chi tiết 1 bản ghi chấm công (GET /attendance/:id)
   */
  async getById(id: string): Promise<ApiResponse<AttendanceResponse>> {
    const api = useApi()
    return api.get<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.DETAIL(id))
  },

  /**
   * Cập nhật bản ghi chấm công (PUT /attendance/:id)
   */
  async update(id: string, data: AttendanceCreateRequest): Promise<ApiResponse<AttendanceResponse>> {
    const api = useApi()
    return api.put<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.UPDATE(id), data)
  },

  /**
   * Xóa bản ghi chấm công (DELETE /attendance/:id)
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.ATTENDANCE.DELETE(id))
  },

  /**
   * Xem trước import Excel (POST /attendance/import/preview)
   */
  async importPreview(file: File): Promise<ApiResponse<AttendanceImportResultResponse>> {
    const api = useApi()
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post<AttendanceImportResultResponse>(
      API_ENDPOINTS.ATTENDANCE.IMPORT_PREVIEW,
      formData,
      {
        headers: {} // Axios/fetch tự thêm boundary cho multipart
      }
    )
  },

  /**
   * Áp dụng import Excel (POST /attendance/import/apply)
   */
  async importApply(file: File, overwrite: boolean = false): Promise<ApiResponse<AttendanceImportResultResponse>> {
    const api = useApi()
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post<AttendanceImportResultResponse>(
      `${API_ENDPOINTS.ATTENDANCE.IMPORT_APPLY}?overwrite=${overwrite}`,
      formData,
      {
        headers: {}
      }
    )
  },

  /**
   * Gọi API import cơ bản đã có từ trước (POST /attendance/import)
   */
  async import(file: File): Promise<ApiResponse<void>> {
    const api = useApi()
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post<void>(
      API_ENDPOINTS.ATTENDANCE.IMPORT,
      formData,
      {
        headers: {}
      }
    )
  },

  /**
   * Tải template chấm công (GET /attendance/template)
   */
  async downloadTemplate(): Promise<Blob> {
    // Mặc định useApi() config cho JSON, cần sử dụng fetch raw hoặc tuỳ chỉnh useApi nếu response là blob/arraybuffer.
    // Ở đây ta gọi thủ công vì useApi hiện tại parse JSON.
    const authStore = useAuthStore()
    const authHeaders: Record<string, string> = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {}
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const response = await fetch(`${baseUrl}${API_ENDPOINTS.ATTENDANCE.TEMPLATE}`, {
      headers: authHeaders
    })
    
    if (!response.ok) {
      throw new Error('Failed to download template')
    }
    
    return response.blob()
  },

  /**
   * Tải file Export danh sách chấm công tháng (GET /attendance/export)
   */
  async exportMonthly(params: { month: string, deptId?: string }): Promise<void> {
    const authStore = useAuthStore()
    const authHeaders: Record<string, string> = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {}
    
    // Clean params (remove undefined)
    const cleanParams: Record<string, string> = {}
    if (params.month) cleanParams.month = params.month
    if (params.deptId) cleanParams.deptId = params.deptId
    
    const query = new URLSearchParams(cleanParams).toString()
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    
    // Giả sử API_ENDPOINTS.ATTENDANCE.EXPORT = '/api/v1/attendance/export'
    const endpoint = API_ENDPOINTS.ATTENDANCE.EXPORT || '/api/v1/attendance/export'
    const response = await fetch(`${baseUrl}${endpoint}?${query}`, {
      headers: authHeaders
    })
    
    if (!response.ok) {
      throw new Error('Tải file thất bại')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cham_cong_${params.month}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}
