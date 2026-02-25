<script setup lang="ts">
import { ref, type Component } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { useToast } from '@/composables/useToast'
import { COLORS } from '@/constants/colors'

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
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  cancel: []
}>()

const toast = useToast()
const isLoading = ref(false)

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
    if (props.successMessage) toast.success(props.successMessage)
    emit('update:modelValue', false)
  } catch (error) {
    console.error(error)
    if (props.errorMessage) toast.error(props.errorMessage)
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
