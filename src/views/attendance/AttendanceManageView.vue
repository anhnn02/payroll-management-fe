<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuthStore } from '@/stores/auth'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { Document, User, Timer, Finished, Warning } from '@element-plus/icons-vue'
import AttendanceListTab from './components/AttendanceListTab.vue'
import AttendanceImportTab from './components/AttendanceImportTab.vue'
import { UserRole } from '@/constants/enums'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()
const isAccountant = computed(() => authStore.user?.role === UserRole.ACCOUNTANT)
const activeTab = ref('manage')

const currentMonth = computed({
  get: () => attendanceStore.currentMonth,
  set: (val: string) => attendanceStore.setMonth(val),
})

onMounted(() => {
  attendanceStore.fetchMonthlyData()
})

const handleMonthChange = () => {
  attendanceStore.fetchMonthlyData()
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <PageBreadcrumb :icon="Document" :items="[{ label: 'Quản lý chấm công' }]" />

      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600">Tháng chấm công:</span>
        <el-date-picker
          v-model="currentMonth"
          type="month"
          value-format="YYYY-MM"
          placeholder="Chọn tháng"
          :clearable="false"
          @change="handleMonthChange"
          class="w-32!"
        />
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <el-card shadow="hover" class="border-l-4 border-l-blue-500">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div>
            <div class="text-sm text-gray-500">Tổng nhân viên</div>
            <div class="text-xl font-bold">{{ attendanceStore.employeeCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="border-l-4 border-l-orange-500">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <el-icon :size="24"><Timer /></el-icon>
          </div>
          <div>
            <div class="text-sm text-gray-500">Tổng giờ OT</div>
            <div class="text-xl font-bold">{{ attendanceStore.totalOtHours }} h</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="border-l-4 border-l-green-500">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-green-100 text-green-600 rounded-lg">
            <el-icon :size="24"><Finished /></el-icon>
          </div>
          <div>
            <div class="text-sm text-gray-500">Ngày công TT (TB)</div>
            <div class="text-xl font-bold">{{ attendanceStore.avgWorkDays }}</div>
          </div>
        </div>
      </el-card>

      <el-card
        shadow="hover"
        :class="['border-l-4', attendanceStore.isLocked ? 'border-l-red-500' : 'border-l-gray-300']"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'p-3 rounded-lg',
              attendanceStore.isLocked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600',
            ]"
          >
            <el-icon :size="24"><Warning /></el-icon>
          </div>
          <div>
            <div class="text-sm text-gray-500">Trạng thái</div>
            <div
              class="text-lg font-bold"
              :class="attendanceStore.isLocked ? 'text-red-600' : 'text-gray-600'"
            >
              {{ attendanceStore.isLocked ? 'ĐÃ KHÓA SỔ' : 'ĐANG MỞ' }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Main Tabs Content -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane label="Quản Lý Chấm Công" name="manage">
          <AttendanceListTab @switch-tab="activeTab = $event" />
        </el-tab-pane>

        <el-tab-pane 
          v-if="!isAccountant && !attendanceStore.isLocked"
          label="Import Excel" 
          name="import"
        >
          <AttendanceImportTab @switch-tab="activeTab = $event" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.custom-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
}
</style>
