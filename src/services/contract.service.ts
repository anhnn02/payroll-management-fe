import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions, PaginatedResponse } from '@/types/api'
import type { Contract, ContractSearchRequest, ContractFormData } from '@/views/contracts/types'

export type { Contract, ContractSearchRequest, ContractFormData }

export const contractService = {
  async search(
    data: ContractSearchRequest,
    options?: ApiRequestOptions
  ): Promise<PaginatedResponse<Contract>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Contract>>(
      API_ENDPOINTS.CONTRACTS.SEARCH,
      data,
      options
    )
    return response.data as PaginatedResponse<Contract>
  },

  async getById(id: string, options?: ApiRequestOptions): Promise<ApiResponse<Contract>> {
    const api = useApi()
    return api.get<Contract>(API_ENDPOINTS.CONTRACTS.DETAIL(id), options)
  },

  async create(
    data: ContractFormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Contract>> {
    const api = useApi()
    return api.post<Contract>(API_ENDPOINTS.CONTRACTS.CREATE, data, options)
  },

  async update(
    id: string,
    data: ContractFormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Contract>> {
    const api = useApi()
    return api.put<Contract>(API_ENDPOINTS.CONTRACTS.UPDATE(id), data, options)
  },

  async delete(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.CONTRACTS.DELETE(id), options)
  },

  async uploadFile(
    id: string,
    file: File,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<Contract>> {
    const api = useApi()
    const formData = new FormData()
    formData.append('file', file)
    return api.post<Contract>(API_ENDPOINTS.CONTRACTS.UPLOAD(id), formData, {
      ...options,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
