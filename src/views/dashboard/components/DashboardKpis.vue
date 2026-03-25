<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/formatContent'
import type { DashboardKpis } from '@/services/dashboard.service'

defineProps<{
  kpis?: DashboardKpis
  role: string
}>()

const router = useRouter()
const navigate = (path: string) => router.push(path)
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- KPI-1 -->
    <el-card shadow="hover" class="cursor-pointer border-blue-200 bg-blue-50" @click="navigate('/employees')">
      <div class="text-center">
        <div class="text-gray-500 mb-2">Nhân Viên Active</div>
        <div class="text-3xl font-bold text-blue-600">{{ kpis?.activeEmployees ?? '—' }}</div>
        <div class="text-xs text-blue-400 mt-2">đang làm việc</div>
      </div>
    </el-card>

    <!-- KPI-2 -->
    <el-card shadow="hover" class="cursor-pointer border-green-200 bg-green-50" @click="navigate('/payroll/calculate')">
      <div class="text-center">
        <div class="text-gray-500 mb-2">Quỹ Lương Tháng</div>
        <template v-if="kpis?.payrollFund !== null && kpis?.payrollFund !== undefined">
          <div class="text-3xl font-bold text-green-600">₫ {{ formatCurrency(kpis.payrollFund) }}</div>
        </template>
        <template v-else>
          <div class="text-3xl font-bold text-gray-400">—</div>
          <div class="text-xs text-red-500 mt-2">Chưa tính lương</div>
        </template>
      </div>
    </el-card>

    <!-- KPI-3 -->
    <el-card shadow="hover" class="cursor-pointer border-orange-200 bg-orange-50" @click="navigate('/attendance/manage')">
      <div class="text-center">
        <div class="text-gray-500 mb-2">Tổng Giờ OT</div>
        <div class="text-3xl font-bold text-orange-600">
          {{ kpis?.totalOtHours !== null && kpis?.totalOtHours !== undefined ? kpis.totalOtHours : '—' }}
          <span v-if="kpis?.totalOtHours" class="text-sm font-normal text-gray-600">giờ</span>
        </div>
      </div>
    </el-card>

    <!-- KPI-4 -->
    <el-card shadow="hover" class="cursor-pointer border-purple-200 bg-purple-50">
      <div class="text-center">
        <div class="text-gray-500 mb-2">Chờ Phê Duyệt</div>
        <div class="text-3xl font-bold text-purple-600">
          {{ kpis?.unpaidPayrollCount ?? '—' }}
          <span v-if="kpis?.unpaidPayrollCount !== undefined && kpis.unpaidPayrollCount > 0" class="text-sm font-normal text-gray-600">bảng lương</span>
        </div>
        <div v-if="role === 'ACCOUNTANT'" class="mt-3">
          <el-button type="success" size="small" @click.stop="navigate('/payroll/approve')">
            ✅ Duyệt ngay →
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
