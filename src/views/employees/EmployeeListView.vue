<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Plus, Edit, Delete, Refresh, View, Avatar } from '@/constants/icons'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { Employee } from './types'
import {
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_TAG_TYPE,
  GENDER_OPTIONS,
  GENDER_LABELS,
} from './constants'
import { COLORS } from '@/constants/colors'
import { employeeService } from '@/services/employee.service'
import { departmentService } from '@/services/department.services'
import { positionService } from '@/services/position.service'
import { useToast } from '@/composables/useToast'
import { usePagination } from '@/composables/usePagination'
import { EmployeeStatus, UserRole } from '@/constants/enums'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { formatDate } from '@/utils/formatContent'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// Role-based visibility (BA: Accountant chỉ xem, không sửa/xóa/thêm)
const isHrManager = computed(() => authStore.user?.role === UserRole.HR_MANAGER)

// State
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref<string>(EmployeeStatus.ACTIVE)
const filterDeptId = ref('')
const filterPositionId = ref('')
const filterGender = ref('')
const showDeleteDialog = ref(false)
const deletingEmployee = ref<Employee | null>(null)

// Filter options (load from API)
const departmentOptions = ref<{ value: string; label: string }[]>([])
const positionOptions = ref<{ value: string; label: string }[]>([])

// Pagination
const {
  currentPage,
  pageSize,
  total,
  PAGE_SIZE_OPTIONS,
  handlePageChange,
  handleSizeChange,
  resetPage,
  getRowIndex,
  pageForApi,
} = usePagination(fetchEmployees)

// Fetch employees
async function fetchEmployees() {
  isLoading.value = true
  try {
    const response = await employeeService.search({
      keyword: searchKeyword.value || undefined,
      status: filterStatus.value || undefined,
      deptId: filterDeptId.value || undefined,
      positionId: filterPositionId.value || undefined,
      page: pageForApi(),
      size: pageSize.value,
    })
    employees.value = response.content
    total.value = response.totalElements
  } catch {
    toast.loadError()
  } finally {
    isLoading.value = false
  }
}

// Fetch filter options
const fetchDepartmentOptions = async () => {
  try {
    const response = await departmentService.search({ status: 'ACTIVE', page: 0, size: 100 })
    departmentOptions.value = response.content.map((d: { id: string; name: string }) => ({
      value: d.id,
      label: d.name,
    }))
  } catch {
    /* ignore */
  }
}

const fetchPositionOptions = async () => {
  try {
    const response = await positionService.search({ status: 'ACTIVE', page: 0, size: 100 })
    positionOptions.value = response.content.map((p: { id: string; name: string }) => ({
      value: p.id,
      label: p.name,
    }))
  } catch {
    /* ignore */
  }
}

const handleSearch = () => {
  resetPage()
  fetchEmployees()
}

const handleCreate = () => {
  router.push({ name: ROUTE_NAMES.EMPLOYEE_CREATE })
}

const handleView = (row: Employee) => {
  router.push({ name: ROUTE_NAMES.EMPLOYEE_DETAIL, params: { id: row.id } })
}

const handleEdit = (row: Employee) => {
  router.push({ name: ROUTE_NAMES.EMPLOYEE_EDIT, params: { id: row.id } })
}

const handleDelete = (row: Employee) => {
  deletingEmployee.value = row
  showDeleteDialog.value = true
}

const onConfirmDelete = async () => {
  if (!deletingEmployee.value) return
  await employeeService.delete(deletingEmployee.value.id)
  fetchEmployees()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = EmployeeStatus.ACTIVE
  filterDeptId.value = ''
  filterPositionId.value = ''
  filterGender.value = ''
  resetPage()
  fetchEmployees()
}

onMounted(() => {
  fetchEmployees()
  fetchDepartmentOptions()
  fetchPositionOptions()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <PageBreadcrumb :icon="Avatar" :items="[{ label: 'Nhân viên' }]" />

      <el-button v-if="isHrManager" type="primary" @click="handleCreate">
        <el-icon class="mr-1"><Plus /></el-icon>
        Thêm mới
      </el-button>
    </div>

    <el-card shadow="never">
      <div class="flex flex-wrap gap-4 items-end mb-4">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <el-input
            v-model="searchKeyword"
            placeholder="Nhập tên, mã NV, email, SĐT, CCCD..."
            clearable
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
          <el-select
            v-model="filterDeptId"
            placeholder="Tất cả"
            clearable
            filterable
            class="w-full"
          >
            <el-option
              v-for="opt in departmentOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
          <el-select
            v-model="filterPositionId"
            placeholder="Tất cả"
            clearable
            filterable
            class="w-full"
          >
            <el-option
              v-for="opt in positionOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <div class="w-32">
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

        <div class="w-28">
          <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
          <el-select v-model="filterGender" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in GENDER_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="flex gap-1">
          <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
          <el-tooltip content="Đặt lại">
            <el-button :icon="Refresh" @click="handleReset"></el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="isLoading"
        :data="employees"
        stripe
        :header-cell-style="{
          backgroundColor: COLORS.TABLE_HEADER_BG,
        }"
        :empty-text="TABLE_EMPTY_TEXT"
      >
        <el-table-column label="STT" width="60" align="center">
          <template #default="{ $index }">
            {{ getRowIndex($index) }}
          </template>
        </el-table-column>
        <el-table-column prop="code" label="Mã NV" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-bold uppercase">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Họ và tên" min-width="160" show-overflow-tooltip />
        <el-table-column label="Giới tính" width="90" align="center">
          <template #default="{ row }">
            {{ GENDER_LABELS[row.gender as keyof typeof GENDER_LABELS] || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Ngày sinh" width="110" align="center">
          <template #default="{ row }">
            {{ formatDate(row.dob) }}
          </template>
        </el-table-column>
        <el-table-column prop="idCard" label="CCCD" width="130" show-overflow-tooltip />
        <el-table-column prop="email" label="Email" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="SĐT" width="120" />
        <el-table-column prop="deptName" label="Phòng ban" width="140" show-overflow-tooltip />
        <el-table-column prop="positionName" label="Vị trí" width="140" show-overflow-tooltip />
        <el-table-column label="Ngày vào làm" width="120" align="center">
          <template #default="{ row }">
            {{ formatDate(row.hireDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="EMPLOYEE_STATUS_TAG_TYPE[row.status as EmployeeStatus]" size="small">
              {{ EMPLOYEE_STATUS_LABELS[row.status as keyof typeof EMPLOYEE_STATUS_LABELS] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="Xem chi tiết" placement="top">
              <el-button type="primary" link @click="handleView(row)">
                <el-icon :size="16"><View /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="isHrManager" content="Sửa" placement="top">
              <el-button type="warning" link @click="handleEdit(row)">
                <el-icon :size="16"><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="isHrManager" content="Vô hiệu hóa" placement="top">
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon :size="16"><Delete /></el-icon>
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
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>

  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Xác nhận vô hiệu hóa"
    :message="`Bạn có chắc muốn vô hiệu hóa nhân viên '${deletingEmployee?.code} - ${deletingEmployee?.name}'? Sẽ ngừng tính lương và chấm công.`"
    confirm-type="danger"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmDelete"
  />
</template>
