/**
 * Mock data cho Department module
 * Dùng để test UI khi backend chưa sẵn sàng
 *
 * ✅ Bật mock: set USE_MOCK = true trong department.services.ts
 * ❌ Tắt mock: set USE_MOCK = false
 */

import type { Department } from '@/views/departments/types'
import type { PaginatedResponse, ApiResponse } from '@/types/api'

// ─── Dữ liệu mẫu ───────────────────────────────────────────────────────────
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: '1',
    code: 'IT',
    name: 'Phòng Công nghệ thông tin',
    description: 'Quản lý hạ tầng công nghệ, phát triển phần mềm nội bộ và hỗ trợ kỹ thuật.',
    parentId: undefined,
    parentName: undefined,
    employeeCount: 12,
    status: 'ACTIVE',
    createdAt: '2024-01-10T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-06-15T10:30:00Z',
    updatedBy: 'admin',
  },
  {
    id: '2',
    code: 'HR',
    name: 'Phòng Nhân sự',
    description: 'Tuyển dụng, đào tạo và quản lý nhân sự toàn công ty.',
    parentId: undefined,
    parentName: undefined,
    employeeCount: 6,
    status: 'ACTIVE',
    createdAt: '2024-01-10T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-08-20T09:00:00Z',
    updatedBy: 'hr_manager',
  },
  {
    id: '3',
    code: 'FIN',
    name: 'Phòng Tài chính - Kế toán',
    description: 'Quản lý tài chính, kế toán và báo cáo tài chính định kỳ.',
    parentId: undefined,
    parentName: undefined,
    employeeCount: 8,
    status: 'ACTIVE',
    createdAt: '2024-01-10T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-09-01T14:00:00Z',
    updatedBy: 'admin',
  },
  {
    id: '4',
    code: 'IT_DEV',
    name: 'Nhóm Phát triển phần mềm',
    description: 'Thiết kế, phát triển và bảo trì các hệ thống phần mềm.',
    parentId: '1',
    parentName: 'Phòng Công nghệ thông tin',
    employeeCount: 7,
    status: 'ACTIVE',
    createdAt: '2024-03-01T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-10-01T08:00:00Z',
    updatedBy: 'admin',
  },
  {
    id: '5',
    code: 'MKT',
    name: 'Phòng Marketing',
    description: '',
    parentId: undefined,
    parentName: undefined,
    employeeCount: 0,
    status: 'INACTIVE',
    createdAt: '2024-06-01T08:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-11-01T08:00:00Z',
    updatedBy: 'admin',
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

const mockStore = [...MOCK_DEPARTMENTS]

// ─── Mock functions ──────────────────────────────────────────────────────────
export const mockDepartmentService = {
  async search(params: {
    keyword?: string
    status?: string
    page: number
    size: number
  }): Promise<PaginatedResponse<Department>> {
    await delay()

    let result = [...mockStore]

    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(
        d => d.code.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw)
      )
    }
    if (params.status) {
      result = result.filter(d => d.status === params.status)
    }

    const start = params.page * params.size
    const content = result.slice(start, start + params.size)

    return {
      content,
      totalElements: result.length,
      totalPages: Math.ceil(result.length / params.size),
      size: params.size,
      number: params.page,
      first: params.page === 0,
      last: start + params.size >= result.length,
    }
  },

  async getById(id: string): Promise<ApiResponse<Department>> {
    await delay()
    const dept = mockStore.find(d => d.id === id)
    if (!dept) throw new Error(`Không tìm thấy phòng ban với id: ${id}`)
    return { data: dept } as ApiResponse<Department>
  },

  async create(data: {
    code: string
    name: string
    description?: string
    parentId?: string
    status: string
  }): Promise<ApiResponse<Department>> {
    await delay()
    const parent = data.parentId ? mockStore.find(d => d.id === data.parentId) : undefined
    const newDept: Department = {
      id: String(Date.now()),
      code: data.code,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      parentName: parent?.name,
      employeeCount: 0,
      status: data.status as Department['status'],
      createdAt: new Date().toISOString(),
      createdBy: 'current_user',
      updatedAt: new Date().toISOString(),
      updatedBy: 'current_user',
    }
    mockStore.push(newDept)
    return { data: newDept } as ApiResponse<Department>
  },

  async update(
    id: string,
    data: {
      code: string
      name: string
      description?: string
      parentId?: string
      status: string
    }
  ): Promise<ApiResponse<Department>> {
    await delay()
    const index = mockStore.findIndex(d => d.id === id)
    if (index === -1) throw new Error(`Không tìm thấy phòng ban với id: ${id}`)
    const parent = data.parentId ? mockStore.find(d => d.id === data.parentId) : undefined
    mockStore[index] = {
      ...mockStore[index],
      ...data,
      parentName: parent?.name,
      status: data.status as Department['status'],
      updatedAt: new Date().toISOString(),
      updatedBy: 'current_user',
    }
    return { data: mockStore[index] } as ApiResponse<Department>
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay()
    const index = mockStore.findIndex(d => d.id === id)
    if (index === -1) throw new Error(`Không tìm thấy phòng ban với id: ${id}`)
    mockStore.splice(index, 1)
    return { data: null } as ApiResponse<null>
  },
}
