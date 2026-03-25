<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardPycResponse } from '@/services/dashboard.service'
import { ElMessage } from 'element-plus'
import DashboardAlerts from './components/DashboardAlerts.vue'
import DashboardKpis from './components/DashboardKpis.vue'
import DashboardCharts from './components/DashboardCharts.vue'
import DashboardTable from './components/DashboardTable.vue'
import DashboardQuickLinks from './components/DashboardQuickLinks.vue'
import { Refresh } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.roles?.[0] || '')

const loading = ref(true)
const dashboardData = ref<DashboardPycResponse | null>(null)

const currentDate = new Date()
const selectedMonth = ref(
  `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
)

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const res = await dashboardService.getDashboardPyc(selectedMonth.value)
    dashboardData.value = res.data ?? null
  } catch (error) {
    console.error('Failed to load dashboard data', error)
    ElMessage.error('Không thể tải dữ liệu Dashboard. Vui lòng thử lại.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

const handleMonthChange = (val: string) => {
  if (val) fetchDashboardData()
}
</script>

<template>
  <div class="px-6 py-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard Tổng Hợp</h1>
        <p class="text-gray-500 text-sm mt-1">Tháng {{ dashboardData?.month || selectedMonth }}</p>
      </div>

      <div class="flex items-center gap-4">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="Chọn tháng"
          format="MM/YYYY"
          value-format="YYYY-MM"
          :clearable="false"
          @change="handleMonthChange"
          style="width: 150px"
        />
        <el-button :icon="Refresh" circle @click="fetchDashboardData" :loading="loading" />
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <el-skeleton animated>
        <template #template>
          <div class="h-12 w-full mb-6 bg-gray-100 rounded"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <el-skeleton-item variant="rect" class="h-32 rounded" />
            <el-skeleton-item variant="rect" class="h-32 rounded" />
            <el-skeleton-item variant="rect" class="h-32 rounded" />
            <el-skeleton-item variant="rect" class="h-32 rounded" />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <el-skeleton-item variant="rect" class="h-80 rounded" />
            <el-skeleton-item variant="rect" class="h-80 rounded" />
          </div>
          <el-skeleton-item variant="rect" class="h-64 rounded w-full" />
        </template>
      </el-skeleton>
    </div>

    <template v-else-if="dashboardData">
      <DashboardAlerts :alerts="dashboardData.alerts" />

      <DashboardKpis :kpis="dashboardData.kpis" :role="userRole" />

      <DashboardCharts :charts="dashboardData.charts" :current-month="dashboardData.month" />

      <DashboardTable :dept-status="dashboardData.deptStatus" :role="userRole" />

      <DashboardQuickLinks :role="userRole" />
    </template>

    <div v-else class="py-20 text-center">
      <el-empty description="Không có dữ liệu" />
      <el-button type="primary" class="mt-4" @click="fetchDashboardData">Thử lại</el-button>
    </div>
  </div>
</template>
