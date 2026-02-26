<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { EmployeeStatus, EmployeeStatusLabel, GenderLabel, enumToOptions } from '@/constants/enums'
import { Avatar } from '@/constants/icons'
import { employeeService } from '@/services/employee.service'
import { departmentService } from '@/services/department.services'
import { positionService } from '@/services/position.service'
import { useToast } from '@/composables/useToast'
import { usePageMode } from '@/composables/usePageMode'
import { generateCode } from '@/utils'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import type { Employee, EmployeeFormData } from './types'

const router = useRouter()
const toast = useToast()

const {
  isCreateMode,
  isEditMode,
  isDetailMode,
  isReadonly,
  entityId: employeeId,
  pageTitle,
} = usePageMode({
  createRoute: ROUTE_NAMES.EMPLOYEE_CREATE,
  editRoute: ROUTE_NAMES.EMPLOYEE_EDIT,
  detailRoute: ROUTE_NAMES.EMPLOYEE_DETAIL,
})

// Refs
const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)

// Form data (đúng 12 fields theo HLD bảng employee)
const form = ref<EmployeeFormData>({
  name: '',
  dob: '',
  gender: 'MALE',
  idCard: '',
  email: '',
  phone: '',
  address: '',
  deptId: '',
  positionId: '',
  hireDate: '',
  status: EmployeeStatus.ACTIVE,
})

// Raw data from BE (for displaying code in edit/detail)
const detailData = ref<Employee | null>(null)

// Select options (fetched from API)
const departmentOptions = ref<{ value: string; label: string }[]>([])
const positionOptions = ref<{ value: string; label: string }[]>([])

// Enum options
const genderOptions = enumToOptions(GenderLabel)
const statusOptions = enumToOptions(EmployeeStatusLabel)

// Validation rules
const rules = {
  name: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  gender: [{ required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }],
  dob: [{ required: true, message: 'Vui lòng chọn ngày sinh', trigger: 'change' }],
  idCard: [{ required: true, message: 'Vui lòng nhập số CCCD/CMND', trigger: 'blur' }],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email' as const, message: 'Email không hợp lệ', trigger: 'blur' },
  ],
  deptId: [{ required: true, message: 'Vui lòng chọn phòng ban', trigger: 'change' }],
  positionId: [{ required: true, message: 'Vui lòng chọn vị trí', trigger: 'change' }],
  hireDate: [{ required: true, message: 'Vui lòng chọn ngày vào làm', trigger: 'change' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

// Fetch select options
const fetchOptions = async () => {
  try {
    const [deptRes, posRes] = await Promise.all([
      departmentService.search({ status: 'ACTIVE', page: 0, size: 100 }),
      positionService.search({ status: 'ACTIVE', page: 0, size: 100 }),
    ])
    departmentOptions.value = (deptRes.content || []).map((d: { id: string; name: string }) => ({
      value: d.id,
      label: d.name,
    }))
    positionOptions.value = (posRes.content || []).map((p: { id: string; name: string }) => ({
      value: p.id,
      label: p.name,
    }))
  } catch {
    /* silent — options are non-critical */
  }
}

// Fetch employee data (edit/detail mode)
const fetchEmployee = async () => {
  if (isCreateMode.value) return

  isLoading.value = true
  try {
    const response = await employeeService.getById(employeeId.value)
    const data = response.data as Employee
    detailData.value = data

    form.value = {
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      idCard: data.idCard,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      deptId: data.deptId,
      positionId: data.positionId,
      hireDate: data.hireDate,
      status: data.status,
    }
  } catch {
    toast.loadError()
    router.push({ name: ROUTE_NAMES.EMPLOYEES })
  } finally {
    isLoading.value = false
  }
}

// Submit
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    toast.validationWarning()
    return
  }

  isSubmitting.value = true
  try {
    const submitData: EmployeeFormData = {
      ...form.value,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    }

    if (isCreateMode.value) {
      await employeeService.create(submitData)
      toast.createSuccess()
    } else {
      await employeeService.update(employeeId.value, submitData)
      toast.updateSuccess()
    }
    router.push({ name: ROUTE_NAMES.EMPLOYEES })
  } catch (error: unknown) {
    toast.handleApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: ROUTE_NAMES.EMPLOYEES })
}

const handleEdit = () => {
  router.push({ name: ROUTE_NAMES.EMPLOYEE_EDIT, params: { id: employeeId.value } })
}

onMounted(() => {
  fetchOptions()
  fetchEmployee()
})
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <!-- Header: Breadcrumb + Nút Cập nhật -->
    <div class="flex items-center justify-between mb-2">
      <PageBreadcrumb
        :icon="Avatar"
        :items="[{ label: 'Nhân viên', to: { name: ROUTE_NAMES.EMPLOYEES } }, { label: pageTitle }]"
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
        <!-- Mã nhân viên (chỉ hiện khi edit/detail) -->
        <div v-if="!isCreateMode" class="mb-4">
          <span class="text-sm text-gray-500">Mã nhân viên: </span>
          <span class="font-bold uppercase">{{ detailData?.code }}</span>
        </div>

        <!-- ===== Nhóm 1: Thông tin định danh ===== -->
        <h3 class="text-base font-semibold text-gray-800 mb-3">Thông tin định danh</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
          <el-form-item label="Họ và tên" prop="name">
            <el-input
              v-model="form.name"
              maxlength="100"
              show-word-limit
              placeholder="Nguyễn Văn A"
            />
          </el-form-item>

          <el-form-item label="Giới tính" prop="gender">
            <el-radio-group v-model="form.gender" :disabled="false">
              <el-radio v-for="opt in genderOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Ngày sinh" prop="dob">
            <el-date-picker
              v-model="form.dob"
              type="date"
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>

          <el-form-item label="CCCD/CMND" prop="idCard">
            <el-input v-model="form.idCard" maxlength="12" placeholder="Nhập số CCCD/CMND" />
          </el-form-item>
        </div>

        <!-- ===== Nhóm 2: Thông tin liên lạc ===== -->
        <div class="border-t pt-4 mt-4">
          <h3 class="text-base font-semibold text-gray-800 mb-3">Thông tin liên lạc</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" type="email" placeholder="ten@congty.com" />
            </el-form-item>

            <el-form-item label="Số điện thoại" prop="phone">
              <el-input v-model="form.phone" placeholder="0123456789" />
            </el-form-item>
          </div>

          <!-- Địa chỉ: full-width (ngoài grid) -->
          <el-form-item label="Địa chỉ" prop="address">
            <el-input
              v-model="form.address"
              type="textarea"
              :rows="3"
              maxlength="400"
              show-word-limit
              placeholder="Nhập địa chỉ"
            />
          </el-form-item>
        </div>

        <!-- ===== Nhóm 3: Thông tin công việc ===== -->
        <div class="border-t pt-4 mt-4">
          <h3 class="text-base font-semibold text-gray-800 mb-3">Thông tin công việc</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
            <el-form-item label="Phòng ban" prop="deptId">
              <el-select
                v-model="form.deptId"
                clearable
                filterable
                placeholder="Chọn phòng ban"
                class="w-full"
              >
                <el-option
                  v-for="opt in departmentOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Vị trí" prop="positionId">
              <el-select
                v-model="form.positionId"
                clearable
                filterable
                placeholder="Chọn vị trí"
                class="w-full"
              >
                <el-option
                  v-for="opt in positionOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Ngày vào làm" prop="hireDate">
              <el-date-picker
                v-model="form.hireDate"
                type="date"
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="Trạng thái" prop="status">
              <el-radio-group v-model="form.status" :disabled="false">
                <el-radio
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  :value="opt.value"
                  :disabled="isCreateMode && opt.value === EmployeeStatus.INACTIVE"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
      </el-form>

      <!-- Footer: Hủy + Lưu -->
      <div class="flex justify-end gap-3 mt-6 pt-6">
        <div v-if="!isDetailMode">
          <el-button @click="handleCancel">Hủy</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="handleSubmit"> Lưu </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
