<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { BaseInput, BaseSelect, BaseButton, BaseCard, BaseDatePicker, BaseTextarea, BaseAlert, BaseTabs } from '@/components/base'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const isEditMode = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)
const showSuccess = ref(false)
const errors = ref<Record<string, string>>({})

// Tab management
const activeTab = ref('personal')
const tabs = computed(() => [
  { id: 'personal', label: t('employees.personalInfo') },
  { id: 'work', label: t('employees.workInfo') },
  { id: 'salary', label: t('employees.salaryInfo') },
  { id: 'bank', label: t('employees.bankInfo') },
])

// Form data
const form = ref({
  // Personal info
  employeeCode: '',
  fullName: '',
  gender: '',
  dateOfBirth: '',
  idNumber: '',
  idIssueDate: '',
  idIssuePlace: '',
  phone: '',
  email: '',
  address: '',
  permanentAddress: '',
  nationality: 'Việt Nam',
  ethnicity: 'Kinh',
  religion: '',
  maritalStatus: '',

  // Work info
  departmentId: '',
  positionId: '',
  employeeType: '',
  startDate: '',
  probationEndDate: '',
  status: 'working',
  workLocation: '',
  directManager: '',

  // Salary info
  basicSalary: 0,
  salaryCoefficient: 1.0,
  insuranceSalary: 0,
  allowances: [] as { type: string; amount: number }[],

  // Bank info
  bankName: '',
  bankBranch: '',
  bankAccountNumber: '',
  bankAccountName: '',
  taxCode: '',
  socialInsuranceNumber: '',
  healthInsuranceNumber: '',
})

// Options
const genderOptions = computed(() => [
  { value: 'male', label: t('common.male') },
  { value: 'female', label: t('common.female') },
])

const maritalStatusOptions = computed(() => [
  { value: 'single', label: t('employees.single') },
  { value: 'married', label: t('employees.married') },
  { value: 'divorced', label: t('employees.divorced') },
  { value: 'widowed', label: t('employees.widowed') },
])

const employeeTypeOptions = computed(() => [
  { value: 'fulltime', label: t('employees.fulltime') },
  { value: 'parttime', label: t('employees.parttime') },
  { value: 'contract', label: t('employees.contract') },
  { value: 'intern', label: t('employees.intern') },
])

const statusOptions = computed(() => [
  { value: 'working', label: t('employees.working') },
  { value: 'probation', label: t('employees.probation') },
  { value: 'resigned', label: t('employees.resigned') },
  { value: 'suspended', label: t('employees.suspended') },
])

const departmentOptions = ref([
  { value: '1', label: 'Phòng Kỹ thuật' },
  { value: '2', label: 'Phòng Nhân sự' },
  { value: '3', label: 'Phòng Kinh doanh' },
  { value: '4', label: 'Phòng Marketing' },
  { value: '5', label: 'Phòng Kế toán' },
])

const positionOptions = ref([
  { value: '1', label: 'Nhân viên' },
  { value: '2', label: 'Trưởng nhóm' },
  { value: '3', label: 'Phó phòng' },
  { value: '4', label: 'Trưởng phòng' },
  { value: '5', label: 'Giám đốc' },
])

const allowanceTypeOptions = computed(() => [
  { value: 'lunch', label: t('configuration.lunchAllowance') },
  { value: 'transport', label: t('configuration.transportAllowance') },
  { value: 'phone', label: t('configuration.phoneAllowance') },
  { value: 'housing', label: t('configuration.housingAllowance') },
  { value: 'responsibility', label: t('configuration.responsibilityAllowance') },
])

const bankOptions = ref([
  { value: 'VCB', label: 'Vietcombank' },
  { value: 'TCB', label: 'Techcombank' },
  { value: 'BIDV', label: 'BIDV' },
  { value: 'VTB', label: 'Vietinbank' },
  { value: 'ACB', label: 'ACB' },
  { value: 'MB', label: 'MB Bank' },
  { value: 'VPB', label: 'VPBank' },
  { value: 'TPB', label: 'TPBank' },
])

// Load employee data for edit mode
onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock data
    form.value = {
      employeeCode: 'NV001',
      fullName: 'Nguyễn Văn An',
      gender: 'male',
      dateOfBirth: '1990-05-15',
      idNumber: '001090012345',
      idIssueDate: '2015-06-20',
      idIssuePlace: 'CA TP Hà Nội',
      phone: '0901234567',
      email: 'an.nguyen@company.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      permanentAddress: '456 Đường XYZ, Hà Nội',
      nationality: 'Việt Nam',
      ethnicity: 'Kinh',
      religion: '',
      maritalStatus: 'married',
      departmentId: '1',
      positionId: '2',
      employeeType: 'fulltime',
      startDate: '2020-01-15',
      probationEndDate: '2020-03-15',
      status: 'working',
      workLocation: 'Trụ sở chính',
      directManager: 'NV005',
      basicSalary: 15000000,
      salaryCoefficient: 1.2,
      insuranceSalary: 10000000,
      allowances: [
        { type: 'lunch', amount: 1000000 },
        { type: 'transport', amount: 500000 },
      ],
      bankName: 'VCB',
      bankBranch: 'Chi nhánh Hoàn Kiếm',
      bankAccountNumber: '0123456789',
      bankAccountName: 'NGUYEN VAN AN',
      taxCode: '1234567890',
      socialInsuranceNumber: 'SI123456789',
      healthInsuranceNumber: 'HI123456789',
    }

    loading.value = false
  }
})

// Validation
const validateForm = () => {
  errors.value = {}

  if (!form.value.fullName.trim()) {
    errors.value.fullName = t('validation.required', { field: t('employees.fullName') })
  }

  if (!form.value.email.trim()) {
    errors.value.email = t('validation.required', { field: t('employees.email') })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = t('validation.invalidEmail')
  }

  if (!form.value.phone.trim()) {
    errors.value.phone = t('validation.required', { field: t('employees.phone') })
  }

  if (!form.value.departmentId) {
    errors.value.departmentId = t('validation.required', { field: t('employees.department') })
  }

  if (!form.value.positionId) {
    errors.value.positionId = t('validation.required', { field: t('employees.position') })
  }

  if (!form.value.startDate) {
    errors.value.startDate = t('validation.required', { field: t('employees.startDate') })
  }

  return Object.keys(errors.value).length === 0
}

// Add allowance
const addAllowance = () => {
  form.value.allowances.push({ type: '', amount: 0 })
}

// Remove allowance
const removeAllowance = (index: number) => {
  form.value.allowances.splice(index, 1)
}

// Save form
const handleSubmit = async () => {
  if (!validateForm()) {
    // Switch to tab with first error
    if (errors.value.fullName || errors.value.email || errors.value.phone) {
      activeTab.value = 'personal'
    } else if (errors.value.departmentId || errors.value.positionId || errors.value.startDate) {
      activeTab.value = 'work'
    }
    return
  }

  saving.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  showSuccess.value = true
  saving.value = false

  // Redirect after success
  setTimeout(() => {
    router.push({ name: 'employees' })
  }, 1500)
}

// Cancel
const handleCancel = () => {
  router.back()
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          @click="handleCancel"
        >
          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">
            {{ isEditMode ? $t('employees.editEmployee') : $t('employees.addEmployee') }}
          </h1>
          <p class="text-slate-500 mt-1">
            {{ isEditMode ? $t('employees.editEmployeeDesc') : $t('employees.addEmployeeDesc') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Success Alert -->
    <BaseAlert
      v-if="showSuccess"
      type="success"
      :message="isEditMode ? $t('employees.updateSuccess') : $t('employees.createSuccess')"
      dismissible
      @dismiss="showSuccess = false"
    />

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-xl border border-slate-200 p-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-slate-600">{{ $t('common.loading') }}</span>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="bg-white rounded-xl border border-slate-200">
      <!-- Tabs -->
      <div class="border-b border-slate-200">
        <nav class="flex -mb-px px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'px-4 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- Personal Info Tab -->
        <div v-show="activeTab === 'personal'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BaseInput
              v-model="form.employeeCode"
              :label="$t('employees.employeeCode')"
              :placeholder="$t('employees.autoGenerate')"
              :disabled="isEditMode"
            />

            <BaseInput
              v-model="form.fullName"
              :label="$t('employees.fullName')"
              :placeholder="$t('employees.enterFullName')"
              :error="errors.fullName"
              required
            />

            <BaseSelect
              v-model="form.gender"
              :label="$t('employees.gender')"
              :options="genderOptions"
              :placeholder="$t('common.select')"
            />

            <BaseDatePicker
              v-model="form.dateOfBirth"
              :label="$t('employees.dateOfBirth')"
            />

            <BaseInput
              v-model="form.idNumber"
              :label="$t('employees.idNumber')"
              :placeholder="$t('employees.enterIdNumber')"
            />

            <BaseDatePicker
              v-model="form.idIssueDate"
              :label="$t('employees.idIssueDate')"
            />

            <BaseInput
              v-model="form.idIssuePlace"
              :label="$t('employees.idIssuePlace')"
              :placeholder="$t('employees.enterIdIssuePlace')"
            />

            <BaseInput
              v-model="form.phone"
              :label="$t('employees.phone')"
              :placeholder="$t('employees.enterPhone')"
              :error="errors.phone"
              required
            />

            <BaseInput
              v-model="form.email"
              type="email"
              :label="$t('employees.email')"
              :placeholder="$t('employees.enterEmail')"
              :error="errors.email"
              required
            />

            <BaseInput
              v-model="form.nationality"
              :label="$t('employees.nationality')"
            />

            <BaseInput
              v-model="form.ethnicity"
              :label="$t('employees.ethnicity')"
            />

            <BaseSelect
              v-model="form.maritalStatus"
              :label="$t('employees.maritalStatus')"
              :options="maritalStatusOptions"
              :placeholder="$t('common.select')"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseTextarea
              v-model="form.address"
              :label="$t('employees.currentAddress')"
              :placeholder="$t('employees.enterAddress')"
              :rows="3"
            />

            <BaseTextarea
              v-model="form.permanentAddress"
              :label="$t('employees.permanentAddress')"
              :placeholder="$t('employees.enterAddress')"
              :rows="3"
            />
          </div>
        </div>

        <!-- Work Info Tab -->
        <div v-show="activeTab === 'work'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BaseSelect
              v-model="form.departmentId"
              :label="$t('employees.department')"
              :options="departmentOptions"
              :placeholder="$t('common.select')"
              :error="errors.departmentId"
              required
            />

            <BaseSelect
              v-model="form.positionId"
              :label="$t('employees.position')"
              :options="positionOptions"
              :placeholder="$t('common.select')"
              :error="errors.positionId"
              required
            />

            <BaseSelect
              v-model="form.employeeType"
              :label="$t('employees.employeeType')"
              :options="employeeTypeOptions"
              :placeholder="$t('common.select')"
            />

            <BaseDatePicker
              v-model="form.startDate"
              :label="$t('employees.startDate')"
              :error="errors.startDate"
              required
            />

            <BaseDatePicker
              v-model="form.probationEndDate"
              :label="$t('employees.probationEndDate')"
            />

            <BaseSelect
              v-model="form.status"
              :label="$t('employees.status')"
              :options="statusOptions"
              :placeholder="$t('common.select')"
            />

            <BaseInput
              v-model="form.workLocation"
              :label="$t('employees.workLocation')"
              :placeholder="$t('employees.enterWorkLocation')"
            />

            <BaseInput
              v-model="form.directManager"
              :label="$t('employees.directManager')"
              :placeholder="$t('employees.enterManagerCode')"
            />
          </div>
        </div>

        <!-- Salary Info Tab -->
        <div v-show="activeTab === 'salary'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BaseInput
              v-model.number="form.basicSalary"
              type="number"
              :label="$t('employees.basicSalary')"
              :placeholder="$t('employees.enterAmount')"
            />

            <BaseInput
              v-model.number="form.salaryCoefficient"
              type="number"
              step="0.1"
              :label="$t('employees.salaryCoefficient')"
              :placeholder="$t('employees.enterCoefficient')"
            />

            <BaseInput
              v-model.number="form.insuranceSalary"
              type="number"
              :label="$t('employees.insuranceSalary')"
              :placeholder="$t('employees.enterAmount')"
            />
          </div>

          <!-- Allowances -->
          <div class="border-t border-slate-200 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-slate-800">{{ $t('employees.allowances') }}</h3>
              <BaseButton
                type="button"
                variant="outline"
                size="sm"
                @click="addAllowance"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ $t('common.add') }}
              </BaseButton>
            </div>

            <div v-if="form.allowances.length === 0" class="text-center py-8 text-slate-500">
              {{ $t('employees.noAllowances') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(allowance, index) in form.allowances"
                :key="index"
                class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
              >
                <div class="flex-1">
                  <BaseSelect
                    v-model="allowance.type"
                    :options="allowanceTypeOptions"
                    :placeholder="$t('employees.selectAllowanceType')"
                  />
                </div>
                <div class="flex-1">
                  <BaseInput
                    v-model.number="allowance.amount"
                    type="number"
                    :placeholder="$t('employees.enterAmount')"
                  />
                </div>
                <button
                  type="button"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  @click="removeAllowance(index)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Info Tab -->
        <div v-show="activeTab === 'bank'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BaseSelect
              v-model="form.bankName"
              :label="$t('employees.bankName')"
              :options="bankOptions"
              :placeholder="$t('common.select')"
            />

            <BaseInput
              v-model="form.bankBranch"
              :label="$t('employees.bankBranch')"
              :placeholder="$t('employees.enterBankBranch')"
            />

            <BaseInput
              v-model="form.bankAccountNumber"
              :label="$t('employees.bankAccountNumber')"
              :placeholder="$t('employees.enterBankAccountNumber')"
            />

            <BaseInput
              v-model="form.bankAccountName"
              :label="$t('employees.bankAccountName')"
              :placeholder="$t('employees.enterBankAccountName')"
            />

            <BaseInput
              v-model="form.taxCode"
              :label="$t('employees.taxCode')"
              :placeholder="$t('employees.enterTaxCode')"
            />

            <BaseInput
              v-model="form.socialInsuranceNumber"
              :label="$t('employees.socialInsuranceNumber')"
              :placeholder="$t('employees.enterSocialInsuranceNumber')"
            />

            <BaseInput
              v-model="form.healthInsuranceNumber"
              :label="$t('employees.healthInsuranceNumber')"
              :placeholder="$t('employees.enterHealthInsuranceNumber')"
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
          <BaseButton
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            type="submit"
            :loading="saving"
          >
            {{ isEditMode ? $t('common.update') : $t('common.save') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
