<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Plus, Edit, Delete, Refresh, View, Suitcase } from '@/constants/icons'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { Position } from './types'
import {
  POSITION_STATUS_OPTIONS,
  POSITION_STATUS_LABELS,
  POSITION_STATUS_TAG_TYPE,
} from './constants'
import { COLORS } from '@/constants/colors'
import { positionService } from '@/services/position.service'
import { useToast } from '@/composables/useToast'
import { usePagination } from '@/composables/usePagination'
import { Status } from '@/constants/enums'
import { TABLE_EMPTY_TEXT } from '@/constants'

const router = useRouter()
const toast = useToast()

// State
const positions = ref<Position[]>([])
const isLoading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref(Status.ACTIVE)
const showDeleteDialog = ref(false)
const deletingPosition = ref<Position | null>(null)

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
} = usePagination(fetchPositions)

// ========== MOCK DATA (xóa khi có API) ==========
const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    code: 'VT260226001',
    name: 'Giám đốc',
    description: 'Quản lý điều hành toàn bộ hoạt động công ty',
    minSalary: 50000000,
    maxSalary: 100000000,
    status: 'ACTIVE',
    employeeCount: 1,
  },
  {
    id: '2',
    code: 'VT260226002',
    name: 'Trưởng phòng',
    description: 'Quản lý phòng ban, báo cáo trực tiếp cho giám đốc',
    minSalary: 25000000,
    maxSalary: 45000000,
    status: 'ACTIVE',
    employeeCount: 5,
  },
  {
    id: '3',
    code: 'VT260226003',
    name: 'Nhân viên kế toán',
    description: 'Xử lý sổ sách, chứng từ, báo cáo tài chính',
    minSalary: 10000000,
    maxSalary: 18000000,
    status: 'ACTIVE',
    employeeCount: 8,
  },
  {
    id: '4',
    code: 'VT260226004',
    name: 'Lập trình viên',
    description: 'Phát triển và bảo trì hệ thống phần mềm',
    minSalary: 15000000,
    maxSalary: 35000000,
    status: 'ACTIVE',
    employeeCount: 12,
  },
  {
    id: '5',
    code: 'VT260226005',
    name: 'Thực tập sinh',
    description: 'Hỗ trợ các công việc theo sự phân công',
    minSalary: 3000000,
    maxSalary: 6000000,
    status: 'INACTIVE',
    employeeCount: 0,
  },
]
// ========== END MOCK DATA ==========

// Fetch positions
async function fetchPositions() {
  isLoading.value = true
  try {
    // TODO: Bỏ mock, dùng API thật
    // const response = await positionService.search({ ... })
    await new Promise(resolve => setTimeout(resolve, 500)) // fake loading
    let filtered = MOCK_POSITIONS
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(
        p => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
      )
    }
    if (filterStatus.value) {
      filtered = filtered.filter(p => p.status === filterStatus.value)
    }
    positions.value = filtered
    total.value = filtered.length
  } catch {
    toast.loadError()
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  resetPage()
  fetchPositions()
}

const handleCreate = () => {
  router.push({ name: ROUTE_NAMES.POSITION_CREATE })
}

const handleView = (row: Position) => {
  router.push({ name: ROUTE_NAMES.POSITION_DETAIL, params: { id: row.id } })
}

const handleEdit = (row: Position) => {
  router.push({ name: ROUTE_NAMES.POSITION_EDIT, params: { id: row.id } })
}

const handleDelete = (row: Position) => {
  deletingPosition.value = row
  showDeleteDialog.value = true
}

const onConfirmDelete = async () => {
  if (!deletingPosition.value) return
  await positionService.delete(deletingPosition.value.id)
  fetchPositions()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = Status.ACTIVE
  resetPage()
  fetchPositions()
}

/**
 * Format khung lương: "25,000,000 - 45,000,000 VNĐ"
 */
const formatSalaryRange = (min?: number, max?: number): string => {
  if (!min && !max) return '-'
  const fmt = (n: number) => n.toLocaleString('vi-VN')
  return `${fmt(min || 0)} - ${fmt(max || 0)}`
}

onMounted(fetchPositions)
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <PageBreadcrumb :icon="Suitcase" :items="[{ label: 'Vị trí' }]" />

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
            placeholder="Nhập vào mã vị trí, tên vị trí để tìm kiếm"
            clearable
            show-word-limit
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <el-select v-model="filterStatus" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in POSITION_STATUS_OPTIONS"
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
        :data="positions"
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
        <el-table-column prop="code" label="Mã vị trí" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-bold uppercase">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Tên vị trí" min-width="180" show-overflow-tooltip />
        <el-table-column label="Khung lương" width="220">
          <template #default="{ row }">
            {{ formatSalaryRange(row.minSalary, row.maxSalary) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Mô tả" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="POSITION_STATUS_TAG_TYPE[row.status as Status]">
              {{ POSITION_STATUS_LABELS[row.status as keyof typeof POSITION_STATUS_LABELS] }}
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
    :message="`Bạn có chắc muốn xóa vị trí '${deletingPosition?.code} - ${deletingPosition?.name}'?`"
    confirm-type="danger"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmDelete"
  />
</template>
