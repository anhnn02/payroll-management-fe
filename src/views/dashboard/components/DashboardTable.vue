<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Check, Timer } from '@element-plus/icons-vue'

defineProps<{
  tableData: any[]
  role: string
}>()

const router = useRouter()
</script>

<template>
  <el-card shadow="never" class="mt-6">
    <template #header>
      <div class="font-semibold text-gray-700">Trạng Thái Theo Phòng Ban</div>
    </template>
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column prop="deptName" label="Phòng Ban">
        <template #default="scope">
          <span class="font-medium">{{ scope.row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalEmp" label="Số NV" width="100" align="center" />

      <el-table-column v-if="role === 'HR_MANAGER'" label="Đã Chấm Công" width="150" align="center">
        <template #default="scope">
          {{ scope.row.hasAttendance }}
        </template>
      </el-table-column>

      <el-table-column v-if="role === 'HR_MANAGER'" label="Chưa CC" width="120" align="center">
        <template #default="scope">
          <el-tag
            v-if="scope.row.noAttendance > 0"
            type="danger"
            class="cursor-pointer"
            @click="
              router.push(`/attendance/manage?dept=${scope.row.deptId || scope.row.deptName}`)
            "
          >
            {{ scope.row.noAttendance }} NV
          </el-tag>
          <el-tag v-else type="success">0</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="totalOT" label="Tổng OT (h)" width="150" align="center">
        <template #default="scope">
          <el-tag type="warning" effect="dark" v-if="scope.row.totalOT"
            >{{ scope.row.totalOT }}h</el-tag
          >
          <span v-else class="text-gray-400">0</span>
        </template>
      </el-table-column>

      <el-table-column label="Trạng Thái Lương" align="center" width="180">
        <template #default="scope">
          <div
            v-if="scope.row.payrollStatus === 'PAID'"
            class="text-green-600 flex items-center justify-center gap-1 font-semibold"
          >
            <el-icon><Check /></el-icon> PAID
          </div>
          <div
            v-else-if="scope.row.payrollStatus === 'UNPAID'"
            class="text-yellow-600 flex items-center justify-center gap-1 font-semibold"
          >
            <el-icon><Timer /></el-icon> UNPAID
          </div>
          <div v-else class="text-gray-400">—</div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
