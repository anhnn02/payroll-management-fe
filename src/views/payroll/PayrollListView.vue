<script setup lang="ts">
import { ref, computed, onMounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Edit, Delete, Refresh, View } from '@/constants/icons'
import { Money } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import type { Payroll } from './types'
import { formatCurrency } from '@/utils/formatContent'
import { MOCK_PAYROLLS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES } from './mock'
import {
  PAYROLL_STATUS_OPTIONS,
  PAYROLL_STATUS_LABELS,
  PAYROLL_STATUS_TAG_TYPE,
  MONTH_OPTIONS,
} from './constants'
import type { PayrollStatus } from '@/constants/enums'
import { UserRole } from '@/constants/enums'
import { COLORS } from '@/constants/colors'
import { payrollService } from '@/services/payroll.service'
import { employeeService } from '@/services/employee.service'
import { departmentService } from '@/services/department.services'
import { usePagination } from '@/composables/usePagination'
import { useAuthStore } from '@/stores/auth'
import { TABLE_EMPTY_TEXT } from '@/constants'

const router = useRouter()
const authStore = useAuthStore()

// Role-based visibility
const isHrManager = computed(() => authStore.user?.role === UserRole.HR_MANAGER)

// ========== List State ==========
const payrolls = ref<Payroll[]>([])
const isLoading = ref(false)
const searchKeyword = ref('')
const filterMonth = ref<number | undefined>(undefined)
const filterYear = ref<number | undefined>(2026)
const filterDeptId = ref('')
const filterStatus = ref('')
const showDeleteDialog = ref(false)
const deletingPayroll = ref<Payroll | null>(null)

// Department options for filter dropdown
const departmentOptions = ref<{ value: string; label: string }[]>([])

// ========== Calculate Dialog State ==========
const showCalculateDialog = ref(false)
const isCalculating = ref(false)
const calculateFormRef = ref<FormInstance>()
const calculateForm = ref({ employeeCode: '', monthYear: '' })
const employeeOptions = ref<{ value: string; label: string }[]>([])

// ========== Result Dialog State ==========
const showResultDialog = ref(false)
const calculateResult: Ref<Payroll | null> = ref(null)

// ========== Validation Rules ==========
const calculateRules: FormRules = {
  employeeCode: [{ required: true, message: 'Vui lòng chọn nhân viên', trigger: 'change' }],
  monthYear: [{ required: true, message: 'Vui lòng chọn tháng tính lương', trigger: 'change' }],
}

// Disable future months
const disableFutureMonth = (date: Date) => {
  return date > new Date()
}

// ========== Pagination ==========
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
} = usePagination(fetchPayrolls)

// ========== Fetch Functions ==========

// Fetch departments for filter dropdown
async function fetchDepartments() {
  try {
    const response = await departmentService.search({ page: 0, size: 200 })
    departmentOptions.value = (response.content || []).map((d: { id: string; name: string }) => ({
      value: d.id,
      label: d.name,
    }))
  } catch {
    departmentOptions.value = MOCK_DEPARTMENTS.map(d => ({
      value: d.id,
      label: d.name,
    }))
  }
}

// Fetch employee options for calculate dialog
async function fetchEmployeeOptions() {
  try {
    const response = await employeeService.search({ status: 'ACTIVE', page: 0, size: 200 })
    employeeOptions.value = (response.content || []).map((e: { code: string; name: string }) => ({
      value: e.code,
      label: `${e.code} - ${e.name}`,
    }))
  } catch {
    employeeOptions.value = MOCK_EMPLOYEES.map(e => ({
      value: e.code,
      label: `${e.code} - ${e.name}`,
    }))
  }
}

// Fetch payrolls
async function fetchPayrolls() {
  isLoading.value = true
  try {
    const response = await payrollService.search({
      keyword: searchKeyword.value || undefined,
      monthNum: filterMonth.value || undefined,
      yearNum: filterYear.value || undefined,
      deptId: filterDeptId.value || undefined,
      status: filterStatus.value || undefined,
      page: pageForApi(),
      size: pageSize.value,
    })
    payrolls.value = response.content
    total.value = response.totalElements
  } catch {
    // Fallback: mock data with client-side filtering
    let filtered = [...MOCK_PAYROLLS]
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.employeeCode?.toLowerCase().includes(kw) || p.employeeName?.toLowerCase().includes(kw)
      )
    }
    if (filterMonth.value) {
      filtered = filtered.filter(p => p.monthNum === filterMonth.value)
    }
    if (filterYear.value) {
      filtered = filtered.filter(p => p.yearNum === filterYear.value)
    }
    if (filterDeptId.value) {
      const dept = departmentOptions.value.find(d => d.value === filterDeptId.value)
      if (dept) {
        filtered = filtered.filter(p => p.departmentName === dept.label)
      }
    }
    if (filterStatus.value) {
      filtered = filtered.filter(p => p.status === filterStatus.value)
    }
    total.value = filtered.length
    const start = pageForApi() * pageSize.value
    payrolls.value = filtered.slice(start, start + pageSize.value)
  } finally {
    isLoading.value = false
  }
}

// ========== List Handlers ==========
const handleSearch = () => {
  resetPage()
  fetchPayrolls()
}

const handleView = (row: Payroll) => {
  router.push({ name: ROUTE_NAMES.PAYROLL_DETAIL, params: { id: row.id } })
}

const handleEdit = (row: Payroll) => {
  router.push({ name: ROUTE_NAMES.PAYROLL_EDIT, params: { id: row.id } })
}

const handleDelete = (row: Payroll) => {
  deletingPayroll.value = row
  showDeleteDialog.value = true
}

const onConfirmDelete = async () => {
  if (!deletingPayroll.value) return
  await payrollService.delete(deletingPayroll.value.id)
  fetchPayrolls()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterMonth.value = undefined
  filterYear.value = 2026
  filterDeptId.value = ''
  filterStatus.value = ''
  resetPage()
  fetchPayrolls()
}

// ========== Calculate Dialog Handlers ==========
const openCalculateDialog = () => {
  calculateForm.value = { employeeCode: '', monthYear: '' }
  showCalculateDialog.value = true
}

const closeCalculateDialog = () => {
  showCalculateDialog.value = false
  calculateForm.value = { employeeCode: '', monthYear: '' }
  calculateFormRef.value?.resetFields()
}

const handleCalculate = async () => {
  if (!calculateFormRef.value) return
  await calculateFormRef.value.validate(async valid => {
    if (!valid) return
    isCalculating.value = true
    try {
      const response = await payrollService.calculate({
        employeeCode: calculateForm.value.employeeCode,
        monthYear: calculateForm.value.monthYear,
      })
      calculateResult.value = response.data as Payroll
      showCalculateDialog.value = false
      showResultDialog.value = true
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      ElMessage.error(err.response?.data?.message || 'Lỗi khi tính lương')
    } finally {
      isCalculating.value = false
    }
  })
}

// ========== Result Dialog Handlers ==========
const totalInsurance = computed(() => {
  if (!calculateResult.value) return 0
  return (
    (calculateResult.value.bhxhAmount || 0) +
    (calculateResult.value.bhtnAmount || 0) +
    (calculateResult.value.bhytAmount || 0)
  )
})

const closeResultDialog = () => {
  showResultDialog.value = false
  calculateResult.value = null
  fetchPayrolls()
}

const viewResultDetail = () => {
  if (!calculateResult.value) return
  router.push({ name: ROUTE_NAMES.PAYROLL_DETAIL, params: { id: calculateResult.value.id } })
  showResultDialog.value = false
}

// ========== Lifecycle ==========
onMounted(() => {
  fetchDepartments()
  fetchEmployeeOptions()
  fetchPayrolls()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <PageBreadcrumb :icon="Money" :items="[{ label: 'Bảng lương' }]" />

      <el-button v-if="isHrManager" type="primary" @click="openCalculateDialog">
        📊 Tính lương
      </el-button>
    </div>

    <el-card shadow="never">
      <!-- Filters -->
      <div class="flex flex-wrap gap-4 items-end mb-4">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <el-input
            v-model="searchKeyword"
            placeholder="Nhập mã NV, tên NV để tìm kiếm"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="w-36">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
          <el-select v-model="filterMonth" placeholder="Tất cả" clearable class="w-full">
            <el-option
              v-for="option in MONTH_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="w-28">
          <label class="block text-sm font-medium text-gray-700 mb-1">Năm</label>
          <el-input-number
            v-model="filterYear"
            :min="2020"
            :max="2030"
            :controls="false"
            class="w-full"
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
              v-for="option in departmentOptions"
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
              v-for="option in PAYROLL_STATUS_OPTIONS"
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

      <!-- Table -->
      <el-table
        v-loading="isLoading"
        :data="payrolls"
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
        <el-table-column label="Nhân viên" min-width="170">
          <template #default="{ row }">
            <div>
              <span class="font-bold">{{ row.employeeName || '-' }}</span>
            </div>
            <div class="text-gray-500 text-xs">{{ row.employeeCode || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Phòng ban / Kỳ lương" width="170">
          <template #default="{ row }">
            <div class="font-medium truncate" :title="row.departmentName">
              {{ row.departmentName || '-' }}
            </div>
            <div class="text-gray-500 text-xs">
              Tháng {{ String(row.monthNum).padStart(2, '0') }}/{{ row.yearNum }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Lương TT" width="150" align="right">
          <template #default="{ row }">
            <div>{{ formatCurrency(row.offerSalary) }} VNĐ</div>
            <div class="text-gray-500 text-xs">
              Công: {{ row.workingDays }}/{{ row.standardDays }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Lương TC" width="150" align="right">
          <template #default="{ row }"> {{ formatCurrency(row.workingSalary) }} VNĐ </template>
        </el-table-column>
        <el-table-column label="Thực nhận" width="150" align="right">
          <template #default="{ row }">
            <span class="font-bold">{{ formatCurrency(row.totalSalary) }} VNĐ</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="PAYROLL_STATUS_TAG_TYPE[row.status as PayrollStatus]">
              {{ PAYROLL_STATUS_LABELS[row.status as PayrollStatus] }}
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
            <el-tooltip v-if="row.status === 'UNPAID'" content="Sửa" placement="top">
              <el-button type="warning" link @click="handleEdit(row)">
                <el-icon :size="16"><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="row.status === 'UNPAID'" content="Xóa" placement="top">
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

  <!-- Delete Confirm Dialog -->
  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Xác nhận xóa"
    :message="`Bạn có chắc muốn xóa bảng lương của nhân viên '${deletingPayroll?.employeeName}' tháng ${deletingPayroll?.monthNum}/${deletingPayroll?.yearNum}?`"
    confirm-type="danger"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmDelete"
  />

  <!-- ========== Dialog Tính lương ========== -->
  <el-dialog
    v-model="showCalculateDialog"
    title="Tính lương"
    width="500px"
    :close-on-click-modal="false"
    @close="closeCalculateDialog"
  >
    <el-form
      ref="calculateFormRef"
      :model="calculateForm"
      :rules="calculateRules"
      label-position="top"
    >
      <el-form-item label="Nhân viên" prop="employeeCode">
        <el-select
          v-model="calculateForm.employeeCode"
          filterable
          placeholder="Chọn nhân viên"
          class="w-full"
        >
          <el-option
            v-for="option in employeeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Kỳ lương" prop="monthYear">
        <el-date-picker
          v-model="calculateForm.monthYear"
          type="month"
          placeholder="Chọn tháng/năm"
          format="MM/YYYY"
          value-format="YYYY-MM"
          :disabled-date="disableFutureMonth"
          class="w-full"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeCalculateDialog">Hủy</el-button>
      <el-button type="primary" :loading="isCalculating" @click="handleCalculate">
        📊 Tính lương
      </el-button>
    </template>
  </el-dialog>

  <!-- ========== Dialog Kết quả tính lương ========== -->
  <el-dialog
    v-model="showResultDialog"
    title="✅ Tính lương thành công!"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="calculateResult" class="space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-600">Nhân viên</span>
        <span class="font-medium">
          {{ calculateResult.employeeCode }} - {{ calculateResult.employeeName }}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Kỳ lương</span>
        <span>
          Tháng {{ String(calculateResult.monthNum).padStart(2, '0') }}/{{
            calculateResult.yearNum
          }}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Ngày công</span>
        <span>{{ calculateResult.workingDays }}/{{ calculateResult.standardDays }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Lương TC</span>
        <span>{{ formatCurrency(calculateResult.workingSalary) }} VNĐ</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Lương OT</span>
        <span>{{ formatCurrency(calculateResult.otSalary) }} VNĐ</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Phụ cấp</span>
        <span>{{ formatCurrency(calculateResult.allowance) }} VNĐ</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Bảo hiểm</span>
        <span>{{ formatCurrency(totalInsurance) }} VNĐ</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Thuế TNCN</span>
        <span>{{ formatCurrency(calculateResult.taxAmount) }} VNĐ</span>
      </div>

      <el-divider />

      <div class="flex justify-between items-center">
        <span class="text-lg font-bold">★ Thực nhận</span>
        <span class="text-xl font-bold text-primary">
          {{ formatCurrency(calculateResult.totalSalary) }} VNĐ
        </span>
      </div>
    </div>

    <template #footer>
      <el-button @click="closeResultDialog">Đóng</el-button>
      <el-button type="primary" @click="viewResultDetail">Xem chi tiết</el-button>
    </template>
  </el-dialog>
</template>
