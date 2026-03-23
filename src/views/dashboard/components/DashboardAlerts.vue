<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { DashboardAlert } from '@/services/dashboard.service'

defineProps<{
  alerts: DashboardAlert[]
}>()

const router = useRouter()

const getElAlertType = (severity: string) => {
  if (severity === 'warning') return 'warning'
  if (severity === 'error') return 'error'
  if (severity === 'success') return 'success'
  return 'info'
}

const navigate = (path?: string) => {
  if (path) router.push(path)
}
</script>

<template>
  <div v-if="alerts && alerts.length > 0" class="space-y-3 mb-6">
    <el-alert
      v-for="(alert, idx) in alerts"
      :key="idx"
      :type="getElAlertType(alert.severity)"
      :closable="false"
      show-icon
    >
      <template #title>
        <div
          class="flex items-center justify-between w-full cursor-pointer"
          :class="{ 'hover:underline': !!alert.navigateTo }"
          @click="navigate(alert.navigateTo)"
        >
          <span>{{ alert.message }}</span>
          <span v-if="alert.navigateTo" class="text-xs opacity-75 ml-4">Xem chi tiết →</span>
        </div>
      </template>
    </el-alert>
  </div>
</template>
