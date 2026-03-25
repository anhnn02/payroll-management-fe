<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Plus, Edit, Delete, Refresh, View } from '@/constants/icons'
import { Document } from '@element-plus/icons-vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { Contract } from './types'
import { formatDate, getContractTypeClass } from './utils'
import { formatCurrency } from '@/utils/formatContent'
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_TAG_TYPE,
} from './constants'
import type { ContractStatus } from '@/constants/enums'
import { COLORS } from '@/constants/colors'
import { contractService } from '@/services/contract.service'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables'
import { TABLE_EMPTY_TEXT } from '@/constants'

const router = useRouter()

const contracts = ref<Contract[]>([])
const isLoading = ref(false)
const searchKeyword = ref('')
const filterContractType = ref('')
const filterStatus = ref('')
const showDeleteDialog = ref(false)
const deletingContract = ref<Contract | null>(null)

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
} = usePagination(fetchContracts)

const toast = useToast()

// Fetch contracts
async function fetchContracts() {
  isLoading.value = true
  try {
    const response = await contractService.search({
      contractNumber: searchKeyword.value || undefined,
      status: filterStatus.value || undefined,
      page: pageForApi(),
      size: pageSize.value,
      sort: 'desc',
    })
    contracts.value = response.content
    total.value = response.totalElements
  } catch {
    toast.loadError()
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  resetPage()
  fetchContracts()
}

const handleCreate = () => {
  router.push({ name: ROUTE_NAMES.CONTRACT_CREATE })
}

const handleView = (row: Contract) => {
  router.push({ name: ROUTE_NAMES.CONTRACT_DETAIL, params: { id: row.id } })
}

const handleEdit = (row: Contract) => {
  router.push({ name: ROUTE_NAMES.CONTRACT_EDIT, params: { id: row.id } })
}

const handleDelete = (row: Contract) => {
  deletingContract.value = row
  showDeleteDialog.value = true
}

const onConfirmDelete = async () => {
  if (!deletingContract.value) return
  await contractService.delete(deletingContract.value.id)
  fetchContracts()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterContractType.value = ''
  filterStatus.value = ''
  resetPage()
  fetchContracts()
}

onMounted(() => {
  fetchContracts()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <PageBreadcrumb :icon="Document" :items="[{ label: 'Hợp đồng' }]" />

      <el-button type="primary" @click="handleCreate">
        <el-icon class="mr-1"><Plus /></el-icon>
        Thêm hợp đồng
      </el-button>
    </div>

    <el-card shadow="never">
      <div class="flex flex-wrap gap-4 items-end mb-4">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <el-input
            v-model="searchKeyword"
            placeholder="Nhập số HĐ, mã NV, tên NV để tìm kiếm"
            clearable
            show-word-limit
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Loại HĐ</label>
          <el-select v-model="filterContractType" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in CONTRACT_TYPE_OPTIONS"
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
              v-for="option in CONTRACT_STATUS_OPTIONS"
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
        :data="contracts"
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
        <el-table-column prop="contractNumber" label="Số hợp đồng" width="170">
          <template #default="{ row }">
            <span class="font-bold uppercase">{{ row.contractNumber }}</span>
            <div class="text-xs mt-0.5">
              <span :class="getContractTypeClass(row.contractType)">
                {{ CONTRACT_TYPE_LABELS[row.contractType as keyof typeof CONTRACT_TYPE_LABELS] }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Nhân viên" min-width="150">
          <template #default="{ row }">
            <div>
              <span class="font-bold">{{ row.employeeName || '-' }}</span>
            </div>
            <div class="text-gray-500 text-xs">{{ row.employeeCode || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Thời hạn" width="220">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }} - {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="offerSalary" label="Lương thỏa thuận" width="150" align="right">
          <template #default="{ row }"> {{ formatCurrency(row.offerSalary) }} VNĐ </template>
        </el-table-column>
        <el-table-column prop="salaryType" label="Loại lương" width="120" align="center">
          <template #default="{ row }">
            {{ row.salaryType }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="CONTRACT_STATUS_TAG_TYPE[row.status as ContractStatus]">
              {{ CONTRACT_STATUS_LABELS[row.status as keyof typeof CONTRACT_STATUS_LABELS] }}
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
    :message="`Bạn có chắc muốn xóa hợp đồng '${deletingContract?.contractNumber}'?`"
    confirm-type="danger"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmDelete"
  />
</template>
