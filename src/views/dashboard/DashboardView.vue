<script setup lang="ts">
// Dashboard placeholder
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card shadow="hover">
        <div class="text-center">
          <div class="text-3xl font-bold text-primary">150</div>
          <div class="text-gray-500 mt-2">Nhân viên</div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-500">12</div>
          <div class="text-gray-500 mt-2">Tài khoản</div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="text-center">
          <div class="text-3xl font-bold text-accent">8</div>
          <div class="text-gray-500 mt-2">Phòng ban</div>
        </div>
      </el-card>

      <el-card shadow="hover">
        <div class="text-center">
          <div class="text-3xl font-bold text-secondary">₫ 2.5B</div>
          <div class="text-gray-500 mt-2">Tổng lương tháng</div>
        </div>
      </el-card>
    </div>

    <!-- Recent activity -->
    <el-card shadow="never">
      <template #header>
        <span class="font-semibold">Hoạt động gần đây</span>
      </template>
      <div class="text-gray-500 text-center py-8">Chưa có hoạt động nào</div>
    </el-card>
  </div>
</template>
