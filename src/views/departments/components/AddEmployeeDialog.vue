<script setup lang="ts">
import { ref, watch } from 'vue'
import { employeeService } from '@/services/employee.service'
import { EmployeeStatus } from '@/constants/enums'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { COLORS } from '@/constants/colors'
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_TAG_TYPE } from '@/views/employees/constants'
import type { Employee } from '@/views/employees/types'

const props = defineProps<{
  modelValue: boolean
  departmentId: string
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
    // Lọc NV chưa có phòng ban hoặc không phải PB hiện tại - BE trả
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

watch(
  () => props.modelValue,
  val => {
    if (val) loadEmployees()
  }
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="Thêm nhân viên vào phòng ban"
    width="680px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="flex gap-2 mb-4">
      <el-input
        v-model="keyword"
        placeholder="Tìm theo mã, tên nhân viên..."
        clearable
        class="flex-1"
        suffix-icon="Search"
        @keyup.enter="handleSearch"
      >
      </el-input>
      <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
    </div>

    <el-table
      v-loading="isLoading"
      :data="employees"
      stripe
      max-height="360"
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
      @selection-change="(rows: Employee[]) => (selected = rows)"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="code" label="Mã NV" width="130" />
      <el-table-column prop="name" label="Họ và tên" min-width="160" />
      <el-table-column prop="positionName" label="Vị trí" width="150" />
      <el-table-column label="Trạng thái" width="130" align="center">
        <template #default="{ row }">
          <el-tag :type="EMPLOYEE_STATUS_TAG_TYPE[row.status as EmployeeStatus]" size="small">
            {{ EMPLOYEE_STATUS_LABELS[row.status as keyof typeof EMPLOYEE_STATUS_LABELS] }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

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
