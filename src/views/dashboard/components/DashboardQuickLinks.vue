<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  role: string
}>()

const router = useRouter()

const navigate = (path: string) => {
  router.push(path)
}
</script>

<template>
  <el-card shadow="never" class="mt-6 mb-6">
    <template #header>
      <div class="font-semibold text-gray-700">Truy cập nhanh (Quick Links)</div>
    </template>
    <div class="flex flex-wrap gap-4">
      <el-button @click="navigate('/employees')" plain>Nhân Viên</el-button>

      <el-button v-if="role === 'HR_MANAGER'" @click="navigate('/contracts')" plain
        >Hợp Đồng</el-button
      >
      <el-button
        v-if="role === 'HR_MANAGER'"
        @click="navigate('/attendance/manage?tab=import')"
        plain
        >Import Chấm Công</el-button
      >

      <el-button @click="navigate('/attendance/manage')" plain>Quản Lý Chấm Công</el-button>

      <el-button v-if="role === 'HR_MANAGER'" @click="navigate('/payroll/calculate')" plain
        >Tính Lương</el-button
      >
      <el-button
        v-if="role === 'ACCOUNTANT'"
        type="success"
        @click="navigate('/payroll/approve')"
        plain
        >✅ Phê Duyệt & TT</el-button
      >
    </div>
  </el-card>
</template>
