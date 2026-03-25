<script setup lang="ts">
import type { DashboardDeptStatus } from '@/services/dashboard.service'

defineProps<{
  deptStatus: DashboardDeptStatus[]
  role: string
}>()

const statusMap: Record<string, { label: string; type: string }> = {
  OK: { label: 'Bình thường', type: 'success' },
  THIEU_CHAM_CONG: { label: 'Thiếu chấm công', type: 'warning' },
  CHO_DUYET_LUONG: { label: 'Chờ duyệt lương', type: 'info' },
}
</script>

<template>
  <el-card shadow="never" class="mt-6">
    <template #header>
      <div class="font-semibold text-gray-700">Trạng Thái Theo Phòng Ban</div>
    </template>
    <el-table :data="deptStatus" style="width: 100%" border>
      <el-table-column prop="deptName" label="Phòng Ban">
        <template #default="scope">
          <span class="font-medium">{{ scope.row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="activeEmployeeCount" label="Số NV active" width="120" align="center" />
      <el-table-column label="TB ngày công" width="130" align="center">
        <template #default="scope">
          {{ scope.row.avgWorkDays?.toFixed(1) ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="TB giờ OT" width="120" align="center">
        <template #default="scope">
          <el-tag type="warning" effect="plain" v-if="scope.row.avgOtHours">
            {{ scope.row.avgOtHours?.toFixed(1) }}h
          </el-tag>
          <span v-else class="text-gray-400">0</span>
        </template>
      </el-table-column>
      <el-table-column label="Trạng thái" align="center" width="180">
        <template #default="scope">
          <el-tag
            :type="(statusMap[scope.row.status]?.type as any) || 'info'"
            size="small"
          >
            {{ statusMap[scope.row.status]?.label || scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
