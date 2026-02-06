<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { accountService } from '@/services/account.service'
import type { AccountFormData, AccountRole, AccountStatus } from './types'
import { ACCOUNT_ROLE_OPTIONS, ACCOUNT_STATUS_OPTIONS } from './constants'

const route = useRoute()
const router = useRouter()

// Mode detection
const isEditMode = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEditMode.value ? 'Sửa tài khoản' : 'Thêm tài khoản'))

// Form state
const formRef = ref()
const isLoading = ref(false)
const isSubmitting = ref(false)

const form = ref<AccountFormData>({
  username: '',
  email: '',
  fullName: '',
  role: 'HR' as AccountRole,
  status: 'ACTIVE' as AccountStatus,
})

// Validation rules
const rules = {
  username: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    { min: 3, max: 50, message: 'Tên đăng nhập từ 3-50 ký tự', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' },
  ],
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }],
  role: [{ required: true, message: 'Vui lòng chọn vai trò', trigger: 'change' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

// Load data for edit mode
const loadAccount = async () => {
  if (!isEditMode.value) return

  isLoading.value = true
  try {
    const response = await accountService.getById(Number(route.params.id))
    const account = response.data
    form.value = {
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      status: account.status,
    }
  } catch {
    ElMessage.error('Không thể tải thông tin tài khoản')
    router.push({ name: 'accounts' })
  } finally {
    isLoading.value = false
  }
}

// Submit form
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      await accountService.update(Number(route.params.id), form.value)
      ElMessage.success('Cập nhật tài khoản thành công')
    } else {
      await accountService.create(form.value)
      ElMessage.success('Thêm tài khoản thành công')
    }
    router.push({ name: 'accounts' })
  } catch {
    ElMessage.error(isEditMode.value ? 'Không thể cập nhật tài khoản' : 'Không thể thêm tài khoản')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: 'accounts' })
}

onMounted(loadAccount)
</script>

<template>
  <div class="space-y-6" v-loading="isLoading">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <el-button @click="handleCancel">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h1 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h1>
    </div>

    <!-- Form -->
    <el-card shadow="never" class="max-w-2xl">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Tên đăng nhập" prop="username">
          <el-input
            v-model="form.username"
            placeholder="Nhập tên đăng nhập"
            :disabled="isEditMode"
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" placeholder="Nhập email" />
        </el-form-item>

        <el-form-item label="Họ và tên" prop="fullName">
          <el-input v-model="form.fullName" placeholder="Nhập họ và tên" />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Vai trò" prop="role">
            <el-select v-model="form.role" placeholder="Chọn vai trò" class="w-full">
              <el-option
                v-for="option in ACCOUNT_ROLE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Trạng thái" prop="status">
            <el-select v-model="form.status" placeholder="Chọn trạng thái" class="w-full">
              <el-option
                v-for="option in ACCOUNT_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <el-button @click="handleCancel">Hủy</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
            {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
