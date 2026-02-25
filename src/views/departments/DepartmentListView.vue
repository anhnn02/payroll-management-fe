<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Plus, Edit, Delete, Refresh, View, Guide, DeleteFilled } from '@/constants/icons'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { Department } from './types'
import {
  DEPARTMENT_STATUS_OPTIONS,
  DEPARTMENT_STATUS_LABELS,
  DEPARTMENT_STATUS_TAG_TYPE,
} from './constants'
import { COLORS } from '@/constants/colors'
import { departmentService } from '@/services/department.services'
import { useToast } from '@/composables/useToast'
import { usePagination } from '@/composables/usePagination'
import { Status } from '@/constants/enums'
import { TABLE_EMPTY_TEXT } from '@/constants'

const router = useRouter()
const toast = useToast()

// State
const departments = ref<Department[]>([])
const isLoading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref(Status.ACTIVE)
const showDeleteDialog = ref(false)
const deletingDepartment = ref<Department | null>(null)

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
} = usePagination(fetchDepartments)

// Fetch departments
async function fetchDepartments() {
  isLoading.value = true
  try {
    const response = await departmentService.search({
      keyword: searchKeyword.value || undefined,
      status: filterStatus.value || undefined,
      page: pageForApi(),
      size: pageSize.value,
    })
    departments.value = response.content
    total.value = response.totalElements
  } catch {
    toast.loadError()
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  resetPage()
  fetchDepartments()
}

const handleCreate = () => {
  router.push({ name: ROUTE_NAMES.DEPARTMENT_CREATE })
}

const handleView = (row: Department) => {
  router.push({ name: ROUTE_NAMES.DEPARTMENT_DETAIL, params: { id: row.id } })
}

const handleEdit = (row: Department) => {
  router.push({ name: ROUTE_NAMES.DEPARTMENT_EDIT, params: { id: row.id } })
}

const handleDelete = (row: Department) => {
  deletingDepartment.value = row
  showDeleteDialog.value = true
}

const onConfirmDelete = async () => {
  if (!deletingDepartment.value) return
  await departmentService.delete(deletingDepartment.value.id)
  fetchDepartments()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = Status.ACTIVE
  resetPage()
  fetchDepartments()
}

onMounted(fetchDepartments)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-4">
      <PageBreadcrumb :icon="Guide" :items="[{ label: 'Phòng ban' }]" />

      <el-button type="primary" @click="handleCreate">
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
            placeholder="Nhập vào mã phòng ban, tên phòng ban để tìm kiếm"
            clearable
            show-word-limit
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <el-select v-model="filterStatus" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in DEPARTMENT_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="flex gap-1">
          <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
          <el-tooltip content="Đặt lại">
            <el-button @click="handleReset" :icon="Refresh"></el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="isLoading"
        :data="departments"
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
        <el-table-column prop="code" label="Mã PB" width="120">
          <template #default="{ row }">
            <span class="font-bold uppercase">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Tên phòng ban" min-width="180" />
        <el-table-column label="Phòng ban cha" width="180">
          <template #default="{ row }">
            {{ row.parentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Số lượng NV" width="120" align="center">
          <template #default="{ row }">
            {{ row.employeeCount ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="DEPARTMENT_STATUS_TAG_TYPE[row.status as Status]">
              {{ DEPARTMENT_STATUS_LABELS[row.status as keyof typeof DEPARTMENT_STATUS_LABELS] }}
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
            <el-tooltip content="Sửa" placement="top">
              <el-button type="warning" link @click="handleEdit(row)">
                <el-icon :size="16"><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Xóa" placement="top">
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
    title="Xác nhận xóa"
    :message="`Bạn có chắc muốn xóa phòng ban '${deletingDepartment?.code} - ${deletingDepartment?.name}'?`"
    confirm-type="danger"
    success-message="Xóa thành công"
    error-message="Không thể xóa"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmDelete"
  />
</template>
