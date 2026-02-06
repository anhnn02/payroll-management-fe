<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ROUTE_NAMES } from '@/constants/routes'
import { ArrowLeft, Plus, Delete } from '@/constants/icons'

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

// Options
const genderOptions = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
]

const maritalStatusOptions = [
  { value: 'single', label: 'Độc thân' },
  { value: 'married', label: 'Đã kết hôn' },
  { value: 'divorced', label: 'Đã ly hôn' },
  { value: 'widowed', label: 'Góa' },
]

const employeeTypeOptions = [
  { value: 'fulltime', label: 'Toàn thời gian' },
  { value: 'parttime', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'intern', label: 'Thực tập' },
]

const statusOptions = [
  { value: 'working', label: 'Đang làm việc' },
  { value: 'probation', label: 'Thử việc' },
  { value: 'resigned', label: 'Đã nghỉ việc' },
  { value: 'suspended', label: 'Tạm nghỉ' },
]

const departmentOptions = [
  { value: '1', label: 'Phòng Kỹ thuật' },
  { value: '2', label: 'Phòng Nhân sự' },
  { value: '3', label: 'Phòng Kinh doanh' },
  { value: '4', label: 'Phòng Marketing' },
  { value: '5', label: 'Phòng Kế toán' },
]

const positionOptions = [
  { value: '1', label: 'Nhân viên' },
  { value: '2', label: 'Trưởng nhóm' },
  { value: '3', label: 'Phó phòng' },
  { value: '4', label: 'Trưởng phòng' },
  { value: '5', label: 'Giám đốc' },
]

const allowanceTypeOptions = [
  { value: 'lunch', label: 'Phụ cấp ăn trưa' },
  { value: 'transport', label: 'Phụ cấp đi lại' },
  { value: 'phone', label: 'Phụ cấp điện thoại' },
  { value: 'housing', label: 'Phụ cấp nhà ở' },
  { value: 'responsibility', label: 'Phụ cấp trách nhiệm' },
]

const bankOptions = [
  { value: 'VCB', label: 'Vietcombank' },
  { value: 'TCB', label: 'Techcombank' },
  { value: 'BIDV', label: 'BIDV' },
  { value: 'VTB', label: 'Vietinbank' },
  { value: 'ACB', label: 'ACB' },
  { value: 'MB', label: 'MB Bank' },
  { value: 'VPB', label: 'VPBank' },
  { value: 'TPB', label: 'TPBank' },
]

// Validation rules
const rules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email' as const, message: 'Email không hợp lệ', trigger: 'blur' },
  ],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }],
  departmentId: [{ required: true, message: 'Vui lòng chọn phòng ban', trigger: 'change' }],
  positionId: [{ required: true, message: 'Vui lòng chọn chức vụ', trigger: 'change' }],
  startDate: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'change' }],
}

// Mock data for edit mode
const MOCK_EMPLOYEE = {
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

// Load employee data
const loadEmployee = async () => {
  if (!isEditMode.value) return

  isLoading.value = true
  try {
    // Mock loading
    await new Promise(resolve => setTimeout(resolve, 300))
    Object.assign(form.value, MOCK_EMPLOYEE)
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
    // Switch to tab with first error
    ElMessage.warning('Vui lòng điền đầy đủ thông tin bắt buộc')
    return
  }

  isSubmitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
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

onMounted(loadEmployee)
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <el-button @click="handleCancel">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h1>
        <p class="text-gray-500 text-sm mt-1">
          {{ isEditMode ? 'Cập nhật thông tin nhân viên' : 'Điền thông tin để thêm nhân viên mới' }}
        </p>
      </div>
    </div>

    <!-- Form with Tabs -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <!-- Tab 1: Personal Info -->
        <el-tab-pane label="Thông tin cá nhân" name="personal">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <el-form-item label="Mã nhân viên">
                <el-input v-model="form.employeeCode" placeholder="Tự sinh khi tạo" disabled />
              </el-form-item>

              <el-form-item label="Họ và tên" prop="fullName">
                <el-input v-model="form.fullName" placeholder="Nhập họ và tên" />
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
                  v-model="form.dateOfBirth"
                  type="date"
                  placeholder="Chọn ngày"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Số CMND/CCCD">
                <el-input v-model="form.idNumber" placeholder="Nhập số CMND/CCCD" />
              </el-form-item>

              <el-form-item label="Ngày cấp">
                <el-date-picker
                  v-model="form.idIssueDate"
                  type="date"
                  placeholder="Chọn ngày"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Nơi cấp">
                <el-input v-model="form.idIssuePlace" placeholder="Nhập nơi cấp" />
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
              <el-form-item label="Phòng ban" prop="departmentId">
                <el-select v-model="form.departmentId" placeholder="Chọn phòng ban" class="w-full">
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

              <el-form-item label="Ngày bắt đầu" prop="startDate">
                <el-date-picker
                  v-model="form.startDate"
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
