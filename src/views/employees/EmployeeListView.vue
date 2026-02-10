<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { ROUTE_NAMES } from '@/constants/routes'
import { Plus, Edit, Delete } from '@/constants/icons'
import type { Employee } from './types'
import { EMPLOYEE_STATUS_OPTIONS, EMPLOYEE_STATUS_LABELS, DEPARTMENT_OPTIONS } from './constants'
import { COLORS } from '@/constants/colors'
import { getStatusColor } from './utils'
import { employeeService } from '@/services/employee.service'

const router = useRouter()

// State
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')

// Pagination
const currentPage = ref(DEFAULT_PAGE)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)

// Fetch employees (POST /employees/search)
const fetchEmployees = async () => {
  isLoading.value = true
  try {
    const response = await employeeService.search({
      keyword: searchQuery.value || undefined,
      deptId: filterDepartment.value || undefined,
      status: filterStatus.value || undefined,
      page: currentPage.value - 1, // BE dùng 0-indexed
      size: pageSize.value,
    })
    employees.value = response.content
    total.value = response.totalElements
  } catch {
    ElMessage.error('Không thể tải danh sách nhân viên')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = DEFAULT_PAGE
  fetchEmployees()
}

const handleCreate = () => {
  router.push({ name: ROUTE_NAMES.EMPLOYEE_CREATE })
}

const handleEdit = (row: Employee) => {
  router.push({ name: ROUTE_NAMES.EMPLOYEE_EDIT, params: { id: row.id } })
}

const handleDelete = async (row: Employee) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa nhân viên "${row.name}"?`,
      'Xác nhận xóa',
      { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }
    )
    await employeeService.delete(row.id)
    ElMessage.success('Xóa nhân viên thành công')
    fetchEmployees()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Không thể xóa nhân viên')
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchEmployees()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = DEFAULT_PAGE
  fetchEmployees()
}

const handleReset = () => {
  searchQuery.value = ''
  filterDepartment.value = ''
  filterStatus.value = ''
  currentPage.value = DEFAULT_PAGE
  fetchEmployees()
}

onMounted(fetchEmployees)
</script>

<template>
  <div class="space-y-6">
    <!-- Header: Breadcrumb & Actions -->
    <div class="flex items-center justify-between mb-4">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: ROUTE_NAMES.DASHBOARD }">Trang chủ</el-breadcrumb-item>
        <el-breadcrumb-item>Quản lý nhân viên</el-breadcrumb-item>
      </el-breadcrumb>

      <el-button type="primary" @click="handleCreate">
        <el-icon class="mr-1"><Plus /></el-icon>
        Thêm mới
      </el-button>
    </div>

    <el-card shadow="never">
      <!-- Filters -->
      <div class="flex flex-wrap gap-4 items-end mb-4">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <el-input
            v-model="searchQuery"
            placeholder="Tìm theo tên, mã NV, email..."
            clearable
            @keyup.enter="handleSearch"
          >
          </el-input>
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
          <el-select v-model="filterDepartment" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in DEPARTMENT_OPTIONS"
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
              v-for="option in EMPLOYEE_STATUS_OPTIONS"
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
      <el-table
        v-loading="isLoading"
        :data="employees"
        stripe
        :header-cell-style="{
          backgroundColor: COLORS.TABLE_HEADER_BG,
        }"
      >
        <el-table-column prop="code" label="Mã NV" width="140" />
        <el-table-column prop="name" label="Họ và tên" min-width="150" />
        <el-table-column prop="email" label="Email" min-width="180" />
        <el-table-column prop="phone" label="SĐT" width="120" />
        <el-table-column prop="deptName" label="Phòng ban" width="140" />
        <el-table-column prop="positionName" label="Chức vụ" min-width="130" />
        <el-table-column prop="status" label="Trạng thái" width="130">
          <template #default="{ row }">
            <el-tag round effect="dark" :color="getStatusColor(row.status)" class="border-none!">
              {{ EMPLOYEE_STATUS_LABELS[row.status as keyof typeof EMPLOYEE_STATUS_LABELS] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="Sửa nhân viên" placement="top">
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon :size="20"><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Xóa nhân viên" placement="top">
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon :size="20"><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

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
