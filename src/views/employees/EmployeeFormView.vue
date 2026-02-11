<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ROUTE_NAMES } from '@/constants/routes'
import { Plus, Delete } from '@/constants/icons'
import {
  Gender,
  EmployeeStatus,
  MaritalStatusLabel,
  EmployeeTypeLabel,
  EmployeeStatusLabel,
  AllowanceTypeLabel,
  BankLabel,
  GenderLabel,
  enumToOptions,
} from '@/constants/enums'
import { employeeService } from '@/services/employee.service'
import { departmentService, type Department } from '@/services/department.services'
import { positionService, type Position } from '@/services/position.service'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEditMode.value ? 'Sửa nhân viên' : 'Thêm nhân viên'))

const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)
const activeTab = ref('personal')

// Form data
const form = ref({
  // Personal info (aligned with BE Employee entity)
  name: '',
  gender: '' as Gender | '',
  dob: '',
  idCard: '',
  phone: '',
  email: '',
  address: '',

  // Work info
  deptId: '',
  positionId: '',
  hireDate: '',
  status: EmployeeStatus.ACTIVE as string,

  // Extended info (may not be in core API, but UI supports it)
  nationality: 'Việt Nam',
  ethnicity: 'Kinh',
  maritalStatus: '',
  employeeType: '',
  probationEndDate: '',
  workLocation: '',
  directManager: '',
  permanentAddress: '',

  // Salary info
  basicSalary: null as number | null,
  salaryCoefficient: 1.0,
  insuranceSalary: null as number | null,
  allowances: [] as { type: string; amount: number | null }[],

  // Bank info
  bankName: '',
  bankBranch: '',
  bankAccountNumber: '',
  bankAccountName: '',
  taxCode: '',
  socialInsuranceNumber: '',
  healthInsuranceNumber: '',
})

// Enum-based options (from common constants)
const genderOptions = enumToOptions(GenderLabel)
const maritalStatusOptions = enumToOptions(MaritalStatusLabel)
const employeeTypeOptions = enumToOptions(EmployeeTypeLabel)
const statusOptions = enumToOptions(EmployeeStatusLabel)

// Dynamic options (fetched from API)
const departmentOptions = ref<{ value: string; label: string }[]>([])
const positionOptions = ref<{ value: string; label: string }[]>([])

// Load dropdown options from API
const loadOptions = async () => {
  try {
    const [deptResponse, posResponse] = await Promise.all([
      departmentService.search({ page: 0, size: 100, status: 'ACTIVE' }),
      positionService.search({ page: 0, size: 100, status: 'ACTIVE' }),
    ])
    departmentOptions.value = deptResponse.content.map((d: Department) => ({
      value: d.id,
      label: d.name,
    }))
    positionOptions.value = posResponse.content.map((p: Position) => ({
      value: p.id,
      label: p.name,
    }))
  } catch {
    console.warn('Không thể tải danh sách phòng ban/chức vụ từ API')
  }
}

const allowanceTypeOptions = enumToOptions(AllowanceTypeLabel)
const bankOptions = enumToOptions(BankLabel)

// Validation rules
const rules = {
  name: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email' as const, message: 'Email không hợp lệ', trigger: 'blur' },
  ],
  idCard: [{ required: true, message: 'Vui lòng nhập số CMND/CCCD', trigger: 'blur' }],
  deptId: [{ required: true, message: 'Vui lòng chọn phòng ban', trigger: 'change' }],
  positionId: [{ required: true, message: 'Vui lòng chọn chức vụ', trigger: 'change' }],
  hireDate: [{ required: true, message: 'Vui lòng chọn ngày nhận việc', trigger: 'change' }],
}

// Load employee data
const loadEmployee = async () => {
  if (!isEditMode.value) return

  isLoading.value = true
  try {
    const response = await employeeService.getById(String(route.params.id))
    Object.assign(form.value, response.data)
  } catch {
    ElMessage.error('Không thể tải thông tin nhân viên')
    router.push({ name: ROUTE_NAMES.EMPLOYEES })
  } finally {
    isLoading.value = false
  }
}

// Allowances management
const addAllowance = () => {
  form.value.allowances.push({ type: '', amount: null })
}

const removeAllowance = (index: number) => {
  form.value.allowances.splice(index, 1)
}

// Submit form
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('Vui lòng điền đầy đủ thông tin bắt buộc')
    return
  }

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      await employeeService.update(String(route.params.id), form.value)
    } else {
      await employeeService.create(form.value as any)
    }
    ElMessage.success(
      isEditMode.value ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công'
    )
    router.push({ name: ROUTE_NAMES.EMPLOYEES })
  } catch {
    ElMessage.error('Có lỗi xảy ra')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: ROUTE_NAMES.EMPLOYEES })
}

onMounted(() => {
  loadOptions()
  loadEmployee()
})
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ name: ROUTE_NAMES.DASHBOARD }">Trang chủ</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: ROUTE_NAMES.EMPLOYEES }"
        >Quản lý nhân viên</el-breadcrumb-item
      >
      <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Form with Tabs -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <!-- Tab 1: Personal Info -->
        <el-tab-pane label="Thông tin cá nhân" name="personal">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <el-form-item label="Họ và tên" prop="name">
                <el-input v-model="form.name" placeholder="Nhập họ và tên" />
              </el-form-item>

              <el-form-item label="Giới tính">
                <el-select v-model="form.gender" placeholder="Chọn" class="w-full">
                  <el-option
                    v-for="opt in genderOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Ngày sinh">
                <el-date-picker
                  v-model="form.dob"
                  type="date"
                  placeholder="Chọn ngày"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Số CMND/CCCD" prop="idCard">
                <el-input v-model="form.idCard" placeholder="Nhập số CMND/CCCD" />
              </el-form-item>

              <el-form-item label="Số điện thoại" prop="phone">
                <el-input v-model="form.phone" placeholder="Nhập số điện thoại" />
              </el-form-item>

              <el-form-item label="Email" prop="email">
                <el-input v-model="form.email" type="email" placeholder="Nhập email" />
              </el-form-item>

              <el-form-item label="Quốc tịch">
                <el-input v-model="form.nationality" placeholder="Nhập quốc tịch" />
              </el-form-item>

              <el-form-item label="Dân tộc">
                <el-input v-model="form.ethnicity" placeholder="Nhập dân tộc" />
              </el-form-item>

              <el-form-item label="Tình trạng hôn nhân">
                <el-select v-model="form.maritalStatus" placeholder="Chọn" class="w-full">
                  <el-option
                    v-for="opt in maritalStatusOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <el-form-item label="Địa chỉ hiện tại">
                <el-input
                  v-model="form.address"
                  type="textarea"
                  :rows="3"
                  placeholder="Nhập địa chỉ hiện tại"
                />
              </el-form-item>

              <el-form-item label="Địa chỉ thường trú">
                <el-input
                  v-model="form.permanentAddress"
                  type="textarea"
                  :rows="3"
                  placeholder="Nhập địa chỉ thường trú"
                />
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>

        <!-- Tab 2: Work Info -->
        <el-tab-pane label="Thông tin công việc" name="work">
          <el-form :model="form" :rules="rules" label-position="top" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <el-form-item label="Phòng ban" prop="deptId">
                <el-select v-model="form.deptId" placeholder="Chọn phòng ban" class="w-full">
                  <el-option
                    v-for="opt in departmentOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Chức vụ" prop="positionId">
                <el-select v-model="form.positionId" placeholder="Chọn chức vụ" class="w-full">
                  <el-option
                    v-for="opt in positionOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Loại nhân viên">
                <el-select v-model="form.employeeType" placeholder="Chọn" class="w-full">
                  <el-option
                    v-for="opt in employeeTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Ngày nhận việc" prop="hireDate">
                <el-date-picker
                  v-model="form.hireDate"
                  type="date"
                  placeholder="Chọn ngày"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Ngày kết thúc thử việc">
                <el-date-picker
                  v-model="form.probationEndDate"
                  type="date"
                  placeholder="Chọn ngày"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Trạng thái">
                <el-select v-model="form.status" placeholder="Chọn" class="w-full">
                  <el-option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Địa điểm làm việc">
                <el-input v-model="form.workLocation" placeholder="Nhập địa điểm" />
              </el-form-item>

              <el-form-item label="Quản lý trực tiếp">
                <el-input v-model="form.directManager" placeholder="Mã nhân viên quản lý" />
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>

        <!-- Tab 3: Salary Info -->
        <el-tab-pane label="Thông tin lương" name="salary">
          <el-form :model="form" label-position="top" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <el-form-item label="Lương cơ bản">
                <el-input-number
                  v-model="form.basicSalary"
                  :min="0"
                  :step="1000000"
                  placeholder="Nhập số tiền"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="Hệ số lương">
                <el-input-number
                  v-model="form.salaryCoefficient"
                  :min="0"
                  :step="0.1"
                  :precision="2"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="Lương đóng BHXH">
                <el-input-number
                  v-model="form.insuranceSalary"
                  :min="0"
                  :step="1000000"
                  placeholder="Nhập số tiền"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>
            </div>

            <!-- Allowances -->
            <div class="border-t pt-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-800">Danh sách phụ cấp</h3>
                <el-button type="primary" plain size="small" @click="addAllowance">
                  <el-icon class="mr-1"><Plus /></el-icon>
                  Thêm phụ cấp
                </el-button>
              </div>

              <div v-if="form.allowances.length === 0" class="text-center py-8 text-gray-500">
                Chưa có phụ cấp nào
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(allowance, index) in form.allowances"
                  :key="index"
                  class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex-1">
                    <el-select
                      v-model="allowance.type"
                      placeholder="Chọn loại phụ cấp"
                      class="w-full"
                    >
                      <el-option
                        v-for="opt in allowanceTypeOptions"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </div>
                  <div class="flex-1">
                    <el-input-number
                      v-model="allowance.amount"
                      :min="0"
                      :step="100000"
                      placeholder="Số tiền"
                      class="w-full"
                      controls-position="right"
                    />
                  </div>
                  <el-button type="danger" link @click="removeAllowance(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-form>
        </el-tab-pane>

        <!-- Tab 4: Bank Info -->
        <el-tab-pane label="Thông tin ngân hàng" name="bank">
          <el-form :model="form" label-position="top" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <el-form-item label="Ngân hàng">
                <el-select v-model="form.bankName" placeholder="Chọn ngân hàng" class="w-full">
                  <el-option
                    v-for="opt in bankOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Chi nhánh">
                <el-input v-model="form.bankBranch" placeholder="Nhập chi nhánh" />
              </el-form-item>

              <el-form-item label="Số tài khoản">
                <el-input v-model="form.bankAccountNumber" placeholder="Nhập số tài khoản" />
              </el-form-item>

              <el-form-item label="Tên chủ tài khoản">
                <el-input v-model="form.bankAccountName" placeholder="Nhập tên chủ tài khoản" />
              </el-form-item>

              <el-form-item label="Mã số thuế">
                <el-input v-model="form.taxCode" placeholder="Nhập mã số thuế" />
              </el-form-item>

              <el-form-item label="Số BHXH">
                <el-input v-model="form.socialInsuranceNumber" placeholder="Nhập số BHXH" />
              </el-form-item>

              <el-form-item label="Số BHYT">
                <el-input v-model="form.healthInsuranceNumber" placeholder="Nhập số BHYT" />
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
        <el-button @click="handleCancel">Hủy</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
          {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>
