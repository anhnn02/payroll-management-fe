<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import type { Account } from './types'
import {
  ACCOUNT_ROLE_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
  ACCOUNT_ROLE_LABELS,
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_COLORS,
} from './constants'

const router = useRouter()

// State
const accounts = ref<Account[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const filterRole = ref<string>('')
const filterStatus = ref<string>('')

// Pagination
const currentPage = ref(DEFAULT_PAGE)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)

// Mock data for development
const MOCK_ACCOUNTS: Account[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@company.com',
    fullName: 'Admin User',
    role: 'HR',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 2,
    username: 'ketoan01',
    email: 'ketoan01@company.com',
    fullName: 'Nguyễn Văn A',
    role: 'ACCOUNTANT',
    status: 'ACTIVE',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: 3,
    username: 'hr01',
    email: 'hr01@company.com',
    fullName: 'Trần Thị B',
    role: 'HR',
    status: 'ACTIVE',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: 4,
    username: 'ketoan02',
    email: 'ketoan02@company.com',
    fullName: 'Lê Văn C',
    role: 'ACCOUNTANT',
    status: 'INACTIVE',
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04',
  },
  {
    id: 5,
    username: 'hr02',
    email: 'hr02@company.com',
    fullName: 'Phạm Thị D',
    role: 'HR',
    status: 'ACTIVE',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
]

// Fetch accounts (using mock data for development)
const fetchAccounts = async () => {
  isLoading.value = true
  //  isLoading.value = true
  // try {
  //   const params: AccountQueryParams = {
  //     page: currentPage.value,
  //     limit: pageSize.value,
  //   }
  //   if (searchQuery.value) params.search = searchQuery.value
  //   if (filterRole.value) params.role = filterRole.value as AccountQueryParams['role']
  //   if (filterStatus.value) params.status = filterStatus.value as AccountQueryParams['status']

  //   const response = await accountService.getList(params)
  //   accounts.value = response.data
  //   total.value = response.meta.total
  // } catch (error) {
  try {
    // Filter mock data
    let filtered = [...MOCK_ACCOUNTS]
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        a =>
          a.username.toLowerCase().includes(query) ||
          a.fullName.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      )
    }
    if (filterRole.value) {
      filtered = filtered.filter(a => a.role === filterRole.value)
    }
    if (filterStatus.value) {
      filtered = filtered.filter(a => a.status === filterStatus.value)
    }

    // Paginate
    total.value = filtered.length
    const start = (currentPage.value - 1) * pageSize.value
    accounts.value = filtered.slice(start, start + pageSize.value)
  } catch (error) {
    ElMessage.error('Không thể tải danh sách tài khoản')
  } finally {
    isLoading.value = false
  }
}

// Handlers
const handleSearch = () => {
  currentPage.value = 1
  fetchAccounts()
}

const handleCreate = () => {
  router.push({ name: 'account-create' })
}

const handleEdit = (row: Account) => {
  router.push({ name: 'account-edit', params: { id: row.id } })
}

const handleDelete = async (row: Account) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa tài khoản "${row.username}"?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    )
    // Mock delete - remove from local array
    const index = MOCK_ACCOUNTS.findIndex(a => a.id === row.id)
    if (index > -1) MOCK_ACCOUNTS.splice(index, 1)
    ElMessage.success('Xóa tài khoản thành công')
    fetchAccounts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Không thể xóa tài khoản')
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchAccounts()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchAccounts()
}

const handleReset = () => {
  searchQuery.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  currentPage.value = DEFAULT_PAGE
  fetchAccounts()
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
      <el-button type="primary" @click="handleCreate">
        <el-icon class="mr-1"><Plus /></el-icon>
        Thêm mới
      </el-button>
    </div>

    <!-- Filters -->
    <el-card shadow="never">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <el-input
            v-model="searchQuery"
            placeholder="Tìm theo tên, email..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <el-select v-model="filterRole" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in ACCOUNT_ROLE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <el-select v-model="filterStatus" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in ACCOUNT_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="flex gap-2">
          <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
          <el-button @click="handleReset">Đặt lại</el-button>
        </div>
      </div>
    </el-card>

    <!-- Table -->
    <el-card shadow="never">
      <el-table :data="accounts" v-loading="isLoading" stripe>
        <el-table-column prop="username" label="Tên đăng nhập" min-width="120" />
        <el-table-column prop="fullName" label="Họ và tên" min-width="150" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column prop="role" label="Vai trò" width="120">
          <template #default="{ row }">
            {{ ACCOUNT_ROLE_LABELS[row.role as keyof typeof ACCOUNT_ROLE_LABELS] }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="130">
          <template #default="{ row }">
            <el-tag :type="ACCOUNT_STATUS_COLORS[row.status as keyof typeof ACCOUNT_STATUS_COLORS]">
              {{ ACCOUNT_STATUS_LABELS[row.status as keyof typeof ACCOUNT_STATUS_LABELS] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">Sửa</el-button>
            <el-button type="danger" link @click="handleDelete(row)">Xóa</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="PAGE_SIZE_OPTIONS"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
