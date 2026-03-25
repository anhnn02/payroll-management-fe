<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuthStore } from '@/stores/auth'
import { departmentService } from '@/services/department.services'
import { attendanceService } from '@/services/attendance.service'
import { usePagination } from '@/composables/usePagination'
import { ElMessage } from 'element-plus'
import { Refresh, Edit, Check, Close, Upload } from '@element-plus/icons-vue'
import { COLORS } from '@/constants/colors'
import { UserRole } from '@/constants/enums'
import { TABLE_EMPTY_TEXT } from '@/constants'
import type { AttendanceMonthlyRow } from '@/types/attendance'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

// State
const emit = defineEmits(['switch-tab'])
const handleImportClick = () => {
  emit('switch-tab', 'import')
}

const editingRowId = ref<string | null>(null)
const editData = ref({
  workDays: 0,
  otHours: 0,
  leaveApproved: 0,
  leaveUnauthorized: 0,
})

// Permissions
const isAccountant = computed(() => authStore.user?.roles?.includes(UserRole.ACCOUNTANT))

// Filter State
const searchKeyword = ref('')
const filterDeptId = ref('')
const departmentOptions = ref<{ value: string; label: string }[]>([])

// Pagination setup
// Since attendanceStore.records returns ALL records for the month, we do client-side pagination
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
} = usePagination(() => {})

const filteredRecords = computed(() => {
  let filtered = attendanceStore.records
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(
      r => r.employeeCode.toLowerCase().includes(kw) || r.employeeName.toLowerCase().includes(kw)
    )
  }
  if (filterDeptId.value) {
    filtered = filtered.filter(r => r.deptId === filterDeptId.value)
  }
  return filtered
})

import { watch } from 'vue'

watch(
  filteredRecords,
  newVal => {
    total.value = newVal.length
  },
  { immediate: true }
)

const paginatedRecords = computed(() => {
  const start = pageForApi() * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

// Fetch departments
const fetchDepartmentOptions = async () => {
  try {
    const response = await departmentService.search({ status: 'ACTIVE', page: 0, size: 100 })
    departmentOptions.value = response.content.map((d: { id: string; name: string }) => ({
      value: d.id,
      label: d.name,
    }))
  } catch (error) {
    console.error('Failed to fetch departments', error)
  }
}

onMounted(() => {
  fetchDepartmentOptions()
})

const handleSearch = () => {
  resetPage()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterDeptId.value = ''
  resetPage()
}


// Inline edit flow
const startEdit = (row: AttendanceMonthlyRow) => {
  if (attendanceStore.isLocked || isAccountant.value) return
  editingRowId.value = row.empId
  editData.value = {
    workDays: row.workDays || 0,
    otHours: row.otHours || 0,
    leaveApproved: row.leaveApproved || 0,
    leaveUnauthorized: row.leaveUnauthorized || 0,
  }
}

const cancelEdit = () => {
  editingRowId.value = null
}

const saveEdit = async (row: AttendanceMonthlyRow) => {
  // Validate BR-ATT-02, BR-ATT-03
  if (editData.value.workDays < 0 || editData.value.workDays > 31) {
    ElMessage.error('Số ngày công phải từ 0 đến 31 (BR-ATT-02)')
    return
  }
  if (editData.value.otHours < 0) {
    ElMessage.error('Số giờ OT không được âm (BR-ATT-03)')
    return
  }

  // Call API
  try {
    // Show a loading feedback on the row
    await attendanceService.updateMonthly(row.empId, attendanceStore.currentMonth, {
      workDays: editData.value.workDays,
      otHours: editData.value.otHours,
      leaveApproved: editData.value.leaveApproved,
      leaveUnauthorized: editData.value.leaveUnauthorized,
    })
    ElMessage.success(`Đã lưu chấm công nhân viên ${row.employeeName}`)
    editingRowId.value = null
    await attendanceStore.fetchMonthlyData()
  } catch (error: unknown) {
    ElMessage.error((error as Error).message || 'Lỗi khi lưu chấm công')
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return COLORS.SUCCESS || '#67c23a'
  if (percentage >= 80) return COLORS.WARNING || '#e6a23c'
  return COLORS.DANGER || '#f56c6c'
}

const getStatusType = (status?: string) => {
  if (!status) return 'info'
  if (status === 'PAID') return 'success'
  if (status === 'UNPAID') return 'warning'
  return 'info'
}
</script>

<template>
  <div class="attendance-list-tab space-y-4">
    <!-- Trạng thái khóa sổ alert -->
    <el-alert
      v-if="attendanceStore.isLocked"
      title="Tháng đã được thanh toán lương. Chấm công bị khóa, không thể chỉnh sửa."
      type="warning"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <!-- Toolbar -->
    <div class="flex flex-wrap gap-4 items-end mb-4">
      <div class="flex-1 min-w-[250px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
        <el-input
          v-model="searchKeyword"
          placeholder="Nhập tên, mã nhân viên..."
          clearable
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="w-48">
        <label class="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
        <el-select
          v-model="filterDeptId"
          placeholder="Tất cả"
          clearable
          filterable
          class="w-full"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in departmentOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <div class="flex gap-1">
        <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
        <el-tooltip content="Đặt lại">
          <el-button :icon="Refresh" @click="handleReset"></el-button>
        </el-tooltip>
      </div>

      <div class="ml-auto flex gap-2">
        <el-button
          v-if="!isAccountant && !attendanceStore.isLocked"
          type="primary" 
          :icon="Upload" 
          @click="handleImportClick"
        >
          Nhập Excel
        </el-button>
      </div>
    </div>

    <!-- Data Table -->
    <el-table
      v-loading="attendanceStore.isLoading"
      :data="paginatedRecords"
      stripe
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
      class="w-full"
    >
      <el-table-column label="STT" width="60" align="center">
        <template #default="{ $index }">
          {{ getRowIndex($index) }}
        </template>
      </el-table-column>

      <el-table-column label="Nhân viên" min-width="180">
        <template #default="{ row }">
          <div class="font-bold">{{ row.employeeName }}</div>
          <div class="text-gray-500 text-xs">{{ row.employeeCode }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Phòng ban" min-width="140">
        <template #default="{ row }">
          <div class="truncate" :title="row.deptName">{{ row.deptName || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Tỷ lệ công" width="110" align="center">
        <template #default="{ row }">
          <el-progress
            type="circle"
            :percentage="Math.round((row.workDays / (row.standardDays || 26)) * 100)"
            :width="48"
            :stroke-width="4"
            :color="getProgressColor(Math.round((row.workDays / (row.standardDays || 26)) * 100))"
          />
        </template>
      </el-table-column>

      <el-table-column label="Ngày công" width="120" align="center">
        <template #default="{ row }">
          <div v-if="editingRowId === row.empId">
            <el-input-number
              v-model="editData.workDays"
              :min="0"
              :max="31"
              :step="0.5"
              size="small"
              class="w-full"
              controls-position="right"
            />
          </div>
          <div v-else>
            <span class="font-medium">{{ row.workDays }}</span>
            <span class="text-gray-400 text-xs"> / {{ row.standardDays || 26 }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Giờ OT" width="110" align="center">
        <template #default="{ row }">
          <div v-if="editingRowId === row.empId">
            <el-input-number
              v-model="editData.otHours"
              :min="0"
              :step="0.5"
              size="small"
              class="w-full"
              controls-position="right"
            />
          </div>
          <div v-else>{{ row.otHours }} h</div>
        </template>
      </el-table-column>

      <el-table-column label="Nghỉ CP/KP" width="110" align="center">
        <template #default="{ row }">
          <div v-if="editingRowId === row.empId" class="flex flex-col gap-1">
            <el-input-number
              v-model="editData.leaveApproved"
              :min="0"
              :step="0.5"
              size="small"
              class="w-full"
              controls-position="right"
              placeholder="CP"
            />
            <el-input-number
              v-model="editData.leaveUnauthorized"
              :min="0"
              :step="0.5"
              size="small"
              class="w-full"
              controls-position="right"
              placeholder="KP"
            />
          </div>
          <div v-else>
            <span class="text-green-600" title="Có phép">{{ row.leaveApproved || 0 }}</span>
            <span class="text-gray-400 mx-1">/</span>
            <span class="text-red-500" title="Không phép">{{ row.leaveUnauthorized || 0 }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Trạng thái" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{
              row.status === 'PAID' ? 'Đã chốt' : row.status === 'UNPAID' ? 'Đang mở' : 'Chưa có'
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Thao tác" width="90" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="editingRowId === row.empId">
            <div class="flex items-center justify-center gap-2">
              <el-button type="success" link title="Lưu" :icon="Check" @click="saveEdit(row)" />
              <el-button type="info" link title="Hủy" :icon="Close" @click="cancelEdit" />
            </div>
          </template>
          <template v-else>
            <el-button
              v-if="!isAccountant && !attendanceStore.isLocked"
              type="warning"
              link
              title="Sửa"
              :icon="Edit"
              @click="startEdit(row)"
            />
            <span v-else-if="attendanceStore.isLocked" class="text-xs text-gray-400">Đã khóa</span>
            <span v-else class="text-xs text-gray-400">-</span>
          </template>
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
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* Customize input number style to fit inside tables without taking too much height */
:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  width: 24px;
}
:deep(.el-input-number .el-input__wrapper) {
  padding-left: 5px;
  padding-right: 30px;
}
</style>
