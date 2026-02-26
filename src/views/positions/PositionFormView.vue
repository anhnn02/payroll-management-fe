<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Status, StatusLabel, EmployeeStatus, enumToOptions } from '@/constants/enums'
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_TAG_TYPE } from '@/views/employees/constants'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { COLORS } from '@/constants/colors'
import { Delete, Suitcase } from '@/constants/icons'
import { positionService } from '@/services/position.service'
import { employeeService } from '@/services/employee.service'
import { useToast } from '@/composables/useToast'
import { usePageMode } from '@/composables/usePageMode'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import AddEmployeeDialog from './components/AddEmployeeDialog.vue'
import type { Position, PositionFormData } from './types'
import type { Employee } from '@/views/employees/types'
import { formatCurrency, handleCurrencyInput, parseCurrency } from '@/utils/formatContent'
import { generateCode } from '@/utils'
import { createCurrencyRules, currencyGreaterThan } from '@/utils/validation'

const router = useRouter()
const toast = useToast()

const {
  isCreateMode,
  isEditMode,
  isDetailMode,
  isReadonly,
  entityId: positionId,
  pageTitle,
} = usePageMode({
  createRoute: ROUTE_NAMES.POSITION_CREATE,
  editRoute: ROUTE_NAMES.POSITION_EDIT,
  detailRoute: ROUTE_NAMES.POSITION_DETAIL,
})

const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)
const showAddEmployeeDialog = ref(false)
const showRemoveEmployeeDialog = ref(false)
const removingEmployee = ref<Employee | null>(null)

const form = ref<PositionFormData>({
  code: '',
  name: '',
  description: '',
  minSalary: 0,
  maxSalary: 0,
  status: Status.ACTIVE,
})

// Display fields (string formatted: "25,000,000")
const minSalaryDisplay = ref('')
const maxSalaryDisplay = ref('')

const detailData = ref<Position | null>(null)
const employees = ref<Employee[]>([])
const statusOptions = enumToOptions(StatusLabel)

const rules = {
  name: [
    { required: true, message: 'Vui lòng nhập tên vị trí', trigger: 'blur' },
    { max: 100, message: 'Tên vị trí tối đa 100 ký tự', trigger: 'blur' },
  ],
  minSalary: createCurrencyRules('Lương tối thiểu'),
  maxSalary: [
    ...createCurrencyRules('Lương tối đa'),
    currencyGreaterThan(() => minSalaryDisplay.value, 'Lương tối đa phải lớn hơn lương tối thiểu'),
  ],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

const onMinSalaryInput = (val: string) => {
  minSalaryDisplay.value = handleCurrencyInput(val)
  form.value.minSalary = parseCurrency(val)
}

const onMaxSalaryInput = (val: string) => {
  maxSalaryDisplay.value = handleCurrencyInput(val)
  form.value.maxSalary = parseCurrency(val)
}

const fetchEmployees = async () => {
  if (isCreateMode.value || !positionId.value) return
  try {
    const response = await employeeService.search({
      positionId: positionId.value,
      page: 0,
      size: 100,
    })
    employees.value = response.content || []
  } catch {
    toast.loadError()
  }
}

const fetchPosition = async () => {
  if (isCreateMode.value) return

  isLoading.value = true
  try {
    const response = await positionService.getById(positionId.value)
    const data = response.data as Position
    detailData.value = data

    form.value = {
      code: data.code,
      name: data.name,
      description: data.description || '',
      minSalary: data.minSalary || 0,
      maxSalary: data.maxSalary || 0,
      status: data.status,
    }
    minSalaryDisplay.value = formatCurrency(data.minSalary || 0)
    maxSalaryDisplay.value = formatCurrency(data.maxSalary || 0)
  } catch {
    toast.loadError()
    router.push({ name: ROUTE_NAMES.POSITIONS })
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    toast.validationWarning()
    return
  }

  isSubmitting.value = true
  try {
    const submitData: PositionFormData = {
      ...form.value,
      code: isCreateMode.value ? generateCode('POSITION') : form.value.code,
      description: form.value.description || undefined,
    }

    if (isCreateMode.value) {
      await positionService.create(submitData)
      toast.createSuccess()
    } else {
      await positionService.update(positionId.value, submitData)
      toast.updateSuccess()
    }
    router.push({ name: ROUTE_NAMES.POSITIONS })
  } catch (error: unknown) {
    toast.handleApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: ROUTE_NAMES.POSITIONS })
}

const handleEdit = () => {
  router.push({ name: ROUTE_NAMES.POSITION_EDIT, params: { id: positionId.value } })
}

const handleRemoveEmployee = (emp: Employee) => {
  removingEmployee.value = emp
  showRemoveEmployeeDialog.value = true
}

const onConfirmRemoveEmployee = async () => {
  if (!removingEmployee.value) return
  await employeeService.update(removingEmployee.value.id, { positionId: '' })
  await fetchEmployees()
}

const handleEmployeesAdded = async (addedEmployees: Employee[]) => {
  try {
    await Promise.all(
      addedEmployees.map(emp => employeeService.update(emp.id, { positionId: positionId.value }))
    )
    toast.updateSuccess()
    await fetchEmployees()
  } catch {
    toast.updateError()
  }
}

onMounted(() => {
  fetchPosition()
  fetchEmployees()
})
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <div class="flex items-center justify-between mb-2">
      <PageBreadcrumb
        class="mb-4"
        :icon="Suitcase"
        :items="[{ label: 'Vị trí', to: { name: ROUTE_NAMES.POSITIONS } }, { label: pageTitle }]"
      />

      <el-button v-if="isDetailMode" type="primary" @click="handleEdit">Cập nhật</el-button>
    </div>

    <el-card shadow="never">
      <el-form
        ref="formRef"
        :model="form"
        :rules="isReadonly ? undefined : rules"
        label-position="top"
        :disabled="isReadonly"
      >
        <div v-if="!isCreateMode" class="mb-4">
          <span class="text-sm text-gray-500">Mã vị trí: </span>
          <span class="font-bold uppercase">{{ detailData?.code }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
          <el-form-item label="Tên vị trí" prop="name">
            <el-input v-model="form.name" maxlength="100" show-word-limit />
          </el-form-item>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
            <el-form-item label="Lương tối thiểu (VNĐ)" prop="minSalary">
              <el-input
                :model-value="minSalaryDisplay"
                placeholder="VD: 10,000,000"
                @input="onMinSalaryInput"
              />
            </el-form-item>
            <el-form-item label="Lương tối đa (VNĐ)" prop="maxSalary">
              <el-input
                :model-value="maxSalaryDisplay"
                placeholder="VD: 30,000,000"
                @input="onMaxSalaryInput"
              />
            </el-form-item>
          </div>

          <el-form-item label="Trạng thái" prop="status">
            <el-radio-group v-model="form.status" :disabled="false">
              <el-radio
                v-for="opt in statusOptions"
                :key="opt.value"
                :value="opt.value"
                :disabled="isCreateMode && opt.value === Status.INACTIVE"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-form-item label="Mô tả công việc" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div v-if="(isEditMode || isDetailMode) && positionId" class="border-t pt-4 mt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-700">Danh sách nhân viên thuộc vị trí</h4>
          <el-button
            v-if="isEditMode"
            type="primary"
            size="small"
            @click="showAddEmployeeDialog = true"
          >
            Thêm nhân viên
          </el-button>
        </div>

        <el-table
          :data="employees"
          stripe
          :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
          :empty-text="TABLE_EMPTY_TEXT"
        >
          <el-table-column label="STT" width="60" align="center">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="code" label="Mã nhân viên" width="140" />
          <el-table-column prop="name" label="Tên nhân viên" min-width="180" />
          <el-table-column prop="deptName" label="Phòng ban" width="180" />
          <el-table-column label="Trạng thái" width="140" align="center">
            <template #default="{ row }">
              <el-tag :type="EMPLOYEE_STATUS_TAG_TYPE[row.status as EmployeeStatus]" size="small">
                {{ EMPLOYEE_STATUS_LABELS[row.status as keyof typeof EMPLOYEE_STATUS_LABELS] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="isEditMode" label="Thao tác" width="80" align="center">
            <template #default="{ row }">
              <el-tooltip content="Xóa khỏi vị trí" placement="top">
                <el-button type="danger" link @click="handleRemoveEmployee(row)">
                  <el-icon :size="16"><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-6">
        <div v-if="!isDetailMode" class="">
          <el-button @click="handleCancel">Hủy</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="handleSubmit"> Lưu </el-button>
        </div>
      </div>
    </el-card>
  </div>

  <AddEmployeeDialog
    v-model="showAddEmployeeDialog"
    :position-id="positionId"
    @confirmed="handleEmployeesAdded"
  />

  <ConfirmDialog
    v-model="showRemoveEmployeeDialog"
    title="Xác nhận xóa"
    :message="`Bạn có chắc muốn xóa nhân viên '${removingEmployee?.code} - ${removingEmployee?.name}' khỏi vị trí?`"
    confirm-type="danger"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmRemoveEmployee"
  />
</template>
