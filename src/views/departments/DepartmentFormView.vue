<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Status, StatusLabel, EmployeeStatus, enumToOptions } from '@/constants/enums'
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_TAG_TYPE } from '@/views/employees/constants'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { COLORS } from '@/constants/colors'
import { Delete, Guide } from '@/constants/icons'
import { departmentService } from '@/services/department.services'
import { employeeService } from '@/services/employee.service'
import { useToast } from '@/composables/useToast'
import { usePageMode } from '@/composables/usePageMode'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import AddEmployeeDialog from './components/AddEmployeeDialog.vue'
import type { Department, DepartmentFormData } from './types'
import type { Employee } from '@/views/employees/types'

const router = useRouter()
const toast = useToast()

const {
  isCreateMode,
  isEditMode,
  isDetailMode,
  isReadonly,
  entityId: departmentId,
  pageTitle,
} = usePageMode({
  createRoute: ROUTE_NAMES.DEPARTMENT_CREATE,
  editRoute: ROUTE_NAMES.DEPARTMENT_EDIT,
  detailRoute: ROUTE_NAMES.DEPARTMENT_DETAIL,
})

const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)
const showAddEmployeeDialog = ref(false)
const showRemoveEmployeeDialog = ref(false)
const removingEmployee = ref<Employee | null>(null)

const form = ref<DepartmentFormData>({
  code: '',
  name: '',
  description: '',
  parentId: '',
  status: Status.ACTIVE,
})

const detailData = ref<Department | null>(null)
const employees = ref<Employee[]>([])
const statusOptions = enumToOptions(StatusLabel)
const parentDepartmentOptions = ref<{ value: string; label: string }[]>([])

const rules = {
  code: [
    { required: true, message: 'Vui lòng nhập mã phòng ban', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9_]+$/,
      message: 'Mã phòng ban chỉ gồm chữ IN HOA, số và gạch dưới',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: 'Vui lòng nhập tên phòng ban', trigger: 'blur' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

const fetchParentOptions = async () => {
  try {
    const response = await departmentService.search(
      { status: Status.ACTIVE, page: 0, size: 100 },
      { showLoading: false }
    )
    let departments = response.content || []

    if (isEditMode.value && departmentId.value) {
      departments = departments.filter((d: Department) => d.id !== departmentId.value)
    }

    parentDepartmentOptions.value = departments.map((d: Department) => ({
      value: d.id,
      label: `${d.code} - ${d.name}`,
    }))
  } catch {
    toast.loadError()
  }
}

const fetchEmployees = async () => {
  if (isCreateMode.value || !departmentId.value) return
  try {
    const response = await employeeService.search({
      deptId: departmentId.value,
      page: 0,
      size: 100,
    })
    employees.value = response.content || []
  } catch {
    toast.loadError()
  }
}

const fetchDepartment = async () => {
  if (isCreateMode.value) return

  isLoading.value = true
  try {
    const response = await departmentService.getById(departmentId.value)
    const data = response.data as Department
    detailData.value = data

    form.value = {
      code: data.code,
      name: data.name,
      description: data.description || '',
      parentId: data.parentId || '',
      status: data.status,
    }
  } catch {
    toast.loadError()
    router.push({ name: ROUTE_NAMES.DEPARTMENTS })
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
    const submitData: DepartmentFormData = {
      ...form.value,
      parentId: form.value.parentId || undefined,
    }

    if (isCreateMode.value) {
      await departmentService.create(submitData)
      toast.createSuccess()
    } else {
      await departmentService.update(departmentId.value, submitData)
      toast.updateSuccess()
    }
    router.push({ name: ROUTE_NAMES.DEPARTMENTS })
  } catch (error: unknown) {
    toast.handleApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: ROUTE_NAMES.DEPARTMENTS })
}

const handleEdit = () => {
  router.push({ name: ROUTE_NAMES.DEPARTMENT_EDIT, params: { id: departmentId.value } })
}

const handleRemoveEmployee = (emp: Employee) => {
  removingEmployee.value = emp
  showRemoveEmployeeDialog.value = true
}

const onConfirmRemoveEmployee = async () => {
  if (!removingEmployee.value) return
  await employeeService.update(removingEmployee.value.id, { deptId: '' })
  await fetchEmployees()
}

const handleEmployeesAdded = async (addedEmployees: Employee[]) => {
  try {
    await Promise.all(
      addedEmployees.map(emp => employeeService.update(emp.id, { deptId: departmentId.value }))
    )
    toast.updateSuccess()
    await fetchEmployees()
  } catch {
    toast.updateError()
  }
}

onMounted(() => {
  fetchParentOptions()
  fetchDepartment()
  fetchEmployees()
})
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <div class="flex items-center justify-between mb-2">
      <PageBreadcrumb
        class="mb-4"
        :icon="Guide"
        :items="[
          { label: 'Phòng ban', to: { name: ROUTE_NAMES.DEPARTMENTS } },
          { label: pageTitle },
        ]"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
          <el-form-item label="Mã phòng ban" prop="code">
            <el-input
              v-model="form.code"
              maxlength="10"
              show-word-limit
              :disabled="isEditMode || isReadonly"
              @input="form.code = form.code.toUpperCase()"
            />
          </el-form-item>

          <el-form-item label="Tên phòng ban" prop="name">
            <el-input v-model="form.name" maxlength="100" show-word-limit />
          </el-form-item>

          <el-form-item label="Phòng ban cha" prop="parentId">
            <el-select v-model="form.parentId" clearable filterable class="w-full">
              <el-option
                v-for="opt in parentDepartmentOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>

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

        <el-form-item label="Mô tả" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div v-if="(isEditMode || isDetailMode) && departmentId" class="border-t pt-4 mt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-700">Danh sách nhân viên thuộc phòng ban</h4>
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
          <el-table-column prop="positionName" label="Vị trí làm việc" width="180" />
          <el-table-column label="Trạng thái" width="140" align="center">
            <template #default="{ row }">
              <el-tag :type="EMPLOYEE_STATUS_TAG_TYPE[row.status as EmployeeStatus]" size="small">
                {{ EMPLOYEE_STATUS_LABELS[row.status as keyof typeof EMPLOYEE_STATUS_LABELS] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="isEditMode" label="Thao tác" width="80" align="center">
            <template #default="{ row }">
              <el-tooltip content="Xóa khỏi phòng ban" placement="top">
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
    :department-id="departmentId"
    @confirmed="handleEmployeesAdded"
  />

  <ConfirmDialog
    v-model="showRemoveEmployeeDialog"
    title="Xác nhận xóa"
    :message="`Bạn có chắc muốn xóa nhân viên '${removingEmployee?.code} - ${removingEmployee?.name}' khỏi phòng ban?`"
    confirm-type="danger"
    :icon="Delete"
    :icon-color="COLORS.DANGER"
    :on-confirm="onConfirmRemoveEmployee"
  />
</template>
