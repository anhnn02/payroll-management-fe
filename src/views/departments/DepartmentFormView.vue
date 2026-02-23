<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { Status, StatusLabel, enumToOptions } from '@/constants/enums'
import { departmentService } from '@/services/department.services'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/table'
import type { Department, DepartmentFormData } from './types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Mode detection
const isCreateMode = computed(() => route.name === ROUTE_NAMES.DEPARTMENT_CREATE)
const isEditMode = computed(() => route.name === ROUTE_NAMES.DEPARTMENT_EDIT)
const isDetailMode = computed(() => route.name === ROUTE_NAMES.DEPARTMENT_DETAIL)
const isReadonly = computed(() => isDetailMode.value)

const departmentId = computed(() => route.params.id as string)

const pageTitle = computed(() => {
  if (isCreateMode.value) return 'Thêm mới'
  if (isEditMode.value) return 'Chỉnh sửa'
  return 'Chi tiết'
})

const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)

// Form data
const form = ref<DepartmentFormData>({
  code: '',
  name: '',
  description: '',
  parentId: '',
  status: Status.ACTIVE,
})

// Detail data (for system info display)
const detailData = ref<Department | null>(null)

// Options
const statusOptions = enumToOptions(StatusLabel)

// Parent department options (loaded from API)
const parentDepartmentOptions = ref<{ value: string; label: string }[]>([])

// Validation rules
const rules = {
  code: [
    { required: true, message: 'Vui lòng nhập mã phòng ban', trigger: 'blur' },
    { max: 20, message: 'Mã phòng ban tối đa 20 ký tự', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9_]+$/,
      message: 'Mã phòng ban chỉ gồm chữ IN HOA, số và gạch dưới',
      trigger: 'blur',
    },
  ],
  name: [
    { required: true, message: 'Vui lòng nhập tên phòng ban', trigger: 'blur' },
    { max: 100, message: 'Tên phòng ban tối đa 100 ký tự', trigger: 'blur' },
  ],
  description: [{ max: 500, message: 'Mô tả tối đa 500 ký tự', trigger: 'blur' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

// Load parent departments for dropdown
const loadParentOptions = async () => {
  try {
    const response = await departmentService.search({
      status: 'ACTIVE',
      page: 0,
      size: 100,
    })
    let departments = response.content || []

    // Khi edit: loại bỏ chính nó ra khỏi danh sách (tránh self-reference)
    if (isEditMode.value && departmentId.value) {
      departments = departments.filter((d: Department) => d.id !== departmentId.value)
    }

    parentDepartmentOptions.value = departments.map((d: Department) => ({
      value: d.id,
      label: `${d.code} - ${d.name}`,
    }))
  } catch {
    console.warn('Không thể tải danh sách phòng ban cha')
  }
}

// Load department data for edit/detail mode
const loadDepartment = async () => {
  if (isCreateMode.value) return

  isLoading.value = true
  try {
    const response = await departmentService.getById(departmentId.value)
    const data = response.data as Department
    detailData.value = data

    // Fill form
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

// Submit form
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

// formatDateTime imported from @/utils/table

onMounted(() => {
  loadParentOptions()
  loadDepartment()
})
</script>

<template>
  <div v-loading="isLoading" class="space-y-6">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ name: ROUTE_NAMES.DASHBOARD }">Trang chủ</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: ROUTE_NAMES.DEPARTMENTS }">Phòng ban</el-breadcrumb-item>
      <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Form -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{{ pageTitle }}</span>
          <!-- Nút Sửa khi đang xem chi tiết -->
          <el-button v-if="isDetailMode" type="primary" @click="handleEdit"> Chỉnh sửa </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="isReadonly ? undefined : rules"
        label-position="top"
        :disabled="isReadonly"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Mã phòng ban -->
          <el-form-item label="Mã phòng ban" prop="code">
            <el-input
              v-model="form.code"
              placeholder="Nhập mã phòng ban (VD: IT, HR)"
              maxlength="20"
              :disabled="isEditMode || isReadonly"
              @input="form.code = form.code.toUpperCase()"
            />
          </el-form-item>

          <!-- Tên phòng ban -->
          <el-form-item label="Tên phòng ban" prop="name">
            <el-input v-model="form.name" placeholder="Nhập tên phòng ban" maxlength="100" />
          </el-form-item>

          <!-- Phòng ban cha -->
          <el-form-item label="Phòng ban cha" prop="parentId">
            <el-select
              v-model="form.parentId"
              placeholder="Chọn phòng ban cha (nếu có)"
              clearable
              filterable
              class="w-full"
            >
              <el-option
                v-for="opt in parentDepartmentOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <!-- Trạng thái -->
          <el-form-item label="Trạng thái" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- Mô tả (full width) -->
        <el-form-item label="Mô tả" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Nhập mô tả phòng ban"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- System info (chỉ hiển thị khi xem/edit) -->
      <div v-if="(isEditMode || isDetailMode) && detailData" class="border-t pt-4 mt-4">
        <h4 class="text-sm font-medium text-gray-500 mb-3">Thông tin hệ thống</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span class="text-gray-400">Ngày tạo:</span>
            <span class="ml-1">{{ formatDateTime(detailData.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-400">Người tạo:</span>
            <span class="ml-1">{{ detailData.createdBy }}</span>
          </div>
          <div>
            <span class="text-gray-400">Ngày sửa:</span>
            <span class="ml-1">{{ formatDateTime(detailData.updatedAt) }}</span>
          </div>
          <div>
            <span class="text-gray-400">Người sửa:</span>
            <span class="ml-1">{{ detailData.updatedBy }}</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div v-if="!isDetailMode" class="flex justify-end gap-3 mt-6 pt-6 border-t">
        <el-button @click="handleCancel">Hủy</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
          {{ isEditMode ? 'Cập nhật' : 'Lưu' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>
