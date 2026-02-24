<script setup lang="ts">
/**
 * AddEmployeeDialog.vue
 * Popup chọn nhân viên chưa có phòng ban để thêm vào phòng ban hiện tại.
 * API call: POST /employees/search với filter deptId = null (chưa thuộc PB nào)
 */
import { ref, watch } from 'vue'
import { employeeService } from '@/services/employee.service'
import { EmployeeStatusLabel } from '@/constants/enums'
import { COLORS } from '@/constants/colors'
import type { Employee } from '@/views/employees/types'

const props = defineProps<{
  modelValue: boolean // v-model: visible
  departmentId: string // ID phòng ban đang thêm NV vào
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirmed: [employees: Employee[]]
}>()

const isLoading = ref(false)
const employees = ref<Employee[]>([])
const selected = ref<Employee[]>([])
const keyword = ref('')

const loadEmployees = async () => {
  isLoading.value = true
  try {
    // Lấy NV chưa có phòng ban (deptId rỗng) hoặc search theo keyword
    // TODO: BE cần cung cấp filter deptId=null hoặc endpoint riêng
    // Hiện tại search tất cả NV rồi lọc phía FE (tạm thời)
    const response = await employeeService.search({
      keyword: keyword.value || undefined,
      page: 0,
      size: 100,
    })
    // Lọc NV chưa có phòng ban hoặc không phải PB hiện tại
    employees.value = (response.content || []).filter(
      emp => !emp.deptId || emp.deptId !== props.departmentId
    )
  } catch {
    employees.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  loadEmployees()
}

const handleConfirm = () => {
  if (selected.value.length === 0) return
  emit('confirmed', selected.value)
  handleClose()
}

const handleClose = () => {
  emit('update:modelValue', false)
  selected.value = []
  keyword.value = ''
}

// Load khi dialog mở
watch(
  () => props.modelValue,
  val => {
    if (val) loadEmployees()
  }
)

const getStatusLabel = (status: string) =>
  EmployeeStatusLabel[status as keyof typeof EmployeeStatusLabel] ?? status

const getStatusType = (status: string): 'success' | 'danger' | 'info' =>
  status === 'ACTIVE' ? 'success' : 'danger'
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="Thêm nhân viên vào phòng ban"
    width="680px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- Search bar -->
    <div class="flex gap-2 mb-4">
      <el-input
        v-model="keyword"
        placeholder="Tìm theo mã, tên nhân viên..."
        clearable
        class="flex-1"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
    </div>

    <!-- Table with checkboxes -->
    <el-table
      v-loading="isLoading"
      :data="employees"
      stripe
      max-height="360"
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      empty-text="Không có nhân viên nào"
      @selection-change="(rows: Employee[]) => (selected = rows)"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="code" label="Mã NV" width="130" />
      <el-table-column prop="name" label="Họ và tên" min-width="160" />
      <el-table-column prop="positionName" label="Vị trí" width="150" />
      <el-table-column label="Trạng thái" width="130" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- Selected count -->
    <div class="mt-3 text-sm text-gray-500">
      Đã chọn: <span class="font-medium text-blue-600">{{ selected.length }}</span> nhân viên
    </div>

    <template #footer>
      <el-button @click="handleClose">Hủy</el-button>
      <el-button type="primary" :disabled="selected.length === 0" @click="handleConfirm">
        Xác nhận thêm
      </el-button>
    </template>
  </el-dialog>
</template>
