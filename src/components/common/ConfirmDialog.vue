<script setup lang="ts">
import { ref, type Component } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { useToast } from '@/composables/useToast'
import { COLORS } from '@/constants/colors'

type ToastType = 'create' | 'update' | 'delete'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
    icon?: Component
    iconColor?: string
    confirmText?: string
    cancelText?: string
    confirmType?: 'primary' | 'danger' | 'warning' | 'success' | 'info'
    width?: string
    onConfirm?: () => Promise<void>
    successMessage?: string
    errorMessage?: string
    toastType?: ToastType
  }>(),
  {
    title: 'Xác nhận',
    message: 'Bạn có chắc chắn muốn thực hiện thao tác này?',
    icon: () => WarningFilled,
    iconColor: COLORS.WARNING,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    confirmType: 'primary',
    width: '420px',
    onConfirm: undefined,
    successMessage: '',
    errorMessage: '',
    toastType: 'delete',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  cancel: []
}>()

const toast = useToast()
const isLoading = ref(false)

const toastSuccess = () => {
  const map: Record<ToastType, () => void> = {
    create: toast.createSuccess,
    update: toast.updateSuccess,
    delete: toast.deleteSuccess,
  }
  map[props.toastType]()
}

const toastError = () => {
  const map: Record<ToastType, () => void> = {
    create: toast.createError,
    update: toast.updateError,
    delete: toast.deleteError,
  }
  map[props.toastType]()
}

const close = () => {
  if (isLoading.value) return
  emit('update:modelValue', false)
}

const handleCancel = () => {
  close()
  emit('cancel')
}

const handleConfirm = async () => {
  if (!props.onConfirm) {
    emit('update:modelValue', false)
    return
  }

  isLoading.value = true
  try {
    await props.onConfirm()
    props.successMessage ? toast.success(props.successMessage) : toastSuccess()
    emit('update:modelValue', false)
  } catch (error) {
    console.error(error)
    props.errorMessage ? toast.error(props.errorMessage) : toastError()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :close-on-click-modal="!isLoading"
    :close-on-press-escape="!isLoading"
    :show-close="!isLoading"
    @close="handleCancel"
  >
    <div class="flex flex-col items-center gap-4">
      <el-icon :size="36" :color="iconColor" class="mt-0.5 shrink-0">
        <component :is="icon" />
      </el-icon>
      <span class="text-sm text-gray-700 text-center leading-relaxed">{{ message }}</span>
    </div>

    <template #footer>
      <el-button :disabled="isLoading" @click="handleCancel">
        {{ cancelText }}
      </el-button>
      <el-button :type="confirmType" :loading="isLoading" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>
