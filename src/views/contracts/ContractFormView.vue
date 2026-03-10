<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { ContractStatus, EmployeeStatus, SalaryTypeLabel, enumToOptions } from '@/constants/enums'
import { Document } from '@element-plus/icons-vue'
import { contractService } from '@/services/contract.service'
import { employeeService } from '@/services/employee.service'
import { useToast } from '@/composables/useToast'
import { usePageMode } from '@/composables/usePageMode'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import type { Contract, ContractFormData } from './types'
import { CONTRACT_TYPE_OPTIONS, CONTRACT_STATUS_OPTIONS } from './constants'
import { formatDate } from './utils'
import { formatCurrency, handleCurrencyInput, parseCurrency } from '@/utils/formatContent'

const router = useRouter()
const toast = useToast()

const {
  isCreateMode,
  isEditMode,
  isDetailMode,
  isReadonly,
  entityId: contractId,
  pageTitle,
} = usePageMode({
  createRoute: ROUTE_NAMES.CONTRACT_CREATE,
  editRoute: ROUTE_NAMES.CONTRACT_EDIT,
  detailRoute: ROUTE_NAMES.CONTRACT_DETAIL,
})

const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)

const form = ref<ContractFormData>({
  empId: '',
  code: '',
  contractType: 'OFFICIAL',
  startDate: '',
  endDate: '',
  baseSalary: 0,
  offerSalary: 0,
  salaryType: 'GROSS',
  terms: '',
  status: 'ACTIVE',
})

const detailData = ref<Contract | null>(null)

// Salary display (formatted string: "25,000,000")
const baseSalaryDisplay = ref('')
const offerSalaryDisplay = ref('')

// Employee options for dropdown
const employeeOptions = ref<{ value: string; label: string }[]>([])

// Status & Salary type options
const contractStatusOptions = CONTRACT_STATUS_OPTIONS
const salaryTypeOptions = enumToOptions(SalaryTypeLabel)

const rules = {
  empId: [{ required: true, message: 'Vui lòng chọn nhân viên', trigger: 'change' }],
  code: [
    { required: true, message: 'Vui lòng nhập số hợp đồng', trigger: 'blur' },
    { max: 50, message: 'Số hợp đồng tối đa 50 ký tự', trigger: 'blur' },
  ],
  contractType: [{ required: true, message: 'Vui lòng chọn loại hợp đồng', trigger: 'change' }],
  startDate: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'change' }],
  baseSalary: [
    {
      validator: (_rule: unknown, _value: unknown, callback: (err?: Error) => void) => {
        if (!form.value.baseSalary || form.value.baseSalary <= 0) {
          callback(new Error('Lương cơ bản phải lớn hơn 0'))
        } else callback()
      },
      trigger: 'blur',
    },
  ],
  offerSalary: [
    {
      validator: (_rule: unknown, _value: unknown, callback: (err?: Error) => void) => {
        if (!form.value.offerSalary || form.value.offerSalary <= 0) {
          callback(new Error('Lương thỏa thuận phải lớn hơn 0'))
        } else callback()
      },
      trigger: 'blur',
    },
  ],
  salaryType: [{ required: true, message: 'Vui lòng chọn loại lương', trigger: 'change' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

// Salary input handlers
const onBaseSalaryInput = (val: string) => {
  baseSalaryDisplay.value = handleCurrencyInput(val)
  form.value.baseSalary = parseCurrency(val)
}

const onOfferSalaryInput = (val: string) => {
  offerSalaryDisplay.value = handleCurrencyInput(val)
  form.value.offerSalary = parseCurrency(val)
}

// Fetch employee options (ACTIVE employees)
const fetchEmployeeOptions = async () => {
  try {
    const response = await employeeService.search({
      status: EmployeeStatus.ACTIVE,
      page: 0,
      size: 200,
    })
    const items = response.content || []
    employeeOptions.value = items.map(item => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
    }))
  } catch {
    toast.loadError()
  }
}

// Fetch contract data (edit/detail)
const fetchContract = async () => {
  if (isCreateMode.value) return

  isLoading.value = true
  try {
    const response = await contractService.getById(contractId.value)
    const data = response.data as Contract
    detailData.value = data

    form.value = {
      empId: data.empId,
      code: data.code,
      contractType: data.contractType,
      startDate: data.startDate,
      endDate: data.endDate || '',
      baseSalary: data.baseSalary,
      offerSalary: data.offerSalary,
      salaryType: data.salaryType,
      terms: data.terms || '',
      status: data.status,
    }
    baseSalaryDisplay.value = formatCurrency(data.baseSalary)
    offerSalaryDisplay.value = formatCurrency(data.offerSalary)
  } catch {
    toast.loadError()
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
    const submitData: ContractFormData = {
      ...form.value,
      endDate: form.value.endDate || undefined,
      terms: form.value.terms || undefined,
    }

    if (isCreateMode.value) {
      await contractService.create(submitData)
      toast.createSuccess()
    } else {
      await contractService.update(contractId.value, submitData)
      toast.updateSuccess()
    }
    router.push({ name: ROUTE_NAMES.CONTRACTS })
  } catch (error: unknown) {
    toast.handleApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: ROUTE_NAMES.CONTRACTS })
}

const handleEdit = () => {
  router.push({ name: ROUTE_NAMES.CONTRACT_EDIT, params: { id: contractId.value } })
}

onMounted(() => {
  fetchEmployeeOptions()
  fetchContract()
})
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <div class="flex justify-between mb-2">
      <PageBreadcrumb
        :icon="Document"
        :items="[{ label: 'Hợp đồng', to: { name: ROUTE_NAMES.CONTRACTS } }, { label: pageTitle }]"
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
        <!-- Section 1: Thông tin hợp đồng -->
        <div class="mb-2">
          <h4 class="text-sm font-semibold text-gray-600 mb-3">Thông tin hợp đồng</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
            <el-form-item label="Nhân viên" prop="empId">
              <el-select
                v-model="form.empId"
                filterable
                placeholder="Chọn nhân viên"
                class="w-full"
                :disabled="isEditMode || isReadonly"
              >
                <el-option
                  v-for="opt in employeeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Số hợp đồng" prop="code">
              <el-input
                v-model="form.code"
                placeholder="Nhập số hợp đồng (VD: HD2026-001)"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="Loại hợp đồng" prop="contractType">
              <el-select
                v-model="form.contractType"
                placeholder="Chọn loại hợp đồng"
                class="w-full"
              >
                <el-option
                  v-for="opt in CONTRACT_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Trạng thái" prop="status">
              <el-radio-group v-model="form.status" :disabled="false">
                <el-radio
                  v-for="opt in contractStatusOptions"
                  :key="opt.value"
                  :value="opt.value"
                  :disabled="isCreateMode && opt.value === ContractStatus.EXPIRED"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <!-- Section 2: Thời hạn hợp đồng -->
        <div class="mb-2">
          <h4 class="text-sm font-semibold text-gray-600 mb-3">Thời hạn hợp đồng</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
            <el-form-item label="Ngày bắt đầu" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="Chọn ngày"
                value-format="YYYY-MM-DD"
                format="DD/MM/YYYY"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="Ngày kết thúc" prop="endDate">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="Để trống = không thời hạn"
                value-format="YYYY-MM-DD"
                format="DD/MM/YYYY"
                clearable
                class="w-full"
              />
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <!-- Section 3: Thông tin lương -->
        <div class="mb-2">
          <h4 class="text-sm font-semibold text-gray-600 mb-3">Thông tin lương</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
            <el-form-item label="Lương cơ bản (VNĐ)" prop="baseSalary">
              <el-input
                :model-value="baseSalaryDisplay"
                placeholder="VD: 10,000,000"
                @input="onBaseSalaryInput"
              >
                <template #suffix>VNĐ</template>
              </el-input>
            </el-form-item>

            <el-form-item label="Lương thỏa thuận (VNĐ)" prop="offerSalary">
              <el-input
                :model-value="offerSalaryDisplay"
                placeholder="VD: 15,000,000"
                @input="onOfferSalaryInput"
              >
                <template #suffix>VNĐ</template>
              </el-input>
            </el-form-item>

            <el-form-item label="Loại lương" prop="salaryType">
              <el-radio-group v-model="form.salaryType" :disabled="false">
                <el-radio v-for="opt in salaryTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <!-- Section 4: Thông tin bổ sung -->
        <div class="mb-2">
          <h4 class="text-sm font-semibold text-gray-600 mb-3">Thông tin bổ sung</h4>
          <el-form-item label="Điều khoản" prop="terms">
            <el-input
              v-model="form.terms"
              type="textarea"
              :rows="3"
              placeholder="Nhập điều khoản hợp đồng"
            />
          </el-form-item>
        </div>

        <!-- Section 5: Phụ cấp (placeholder) -->
        <div v-if="(isEditMode || isDetailMode) && contractId" class="border-t pt-4 mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Phụ cấp</h4>
          <p class="text-sm text-gray-400 italic">Tính năng quản lý phụ cấp sẽ được bổ sung sau.</p>
        </div>
      </el-form>

      <!-- Footer: Hủy + Lưu -->
      <div class="flex justify-end gap-3 mt-6 pt-6">
        <div v-if="!isDetailMode">
          <el-button @click="handleCancel">Hủy</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="handleSubmit"> Lưu </el-button>
        </div>
      </div>

      <!-- Thông tin hệ thống -->
      <div v-if="!isCreateMode && detailData" class="mt-4 text-xs text-gray-400 space-y-1">
        <div>
          Ngày tạo: {{ formatDate(detailData.createdAt) }} | Người tạo:
          {{ detailData.createdBy }}
        </div>
        <div>
          Ngày sửa: {{ formatDate(detailData.updatedAt) }} | Người sửa:
          {{ detailData.updatedBy }}
        </div>
      </div>
    </el-card>
  </div>
</template>
