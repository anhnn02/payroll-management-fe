<script setup lang="ts">
import { useAuthStore } from '@/stores'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <el-button type="danger" @click="handleLogout"> Đăng xuất </el-button>
      </div>
    </div>

    <div class="bg-green-100 border border-green-400 text-green-700 p-4 rounded">
      <p class="font-semibold">🔐 Bạn đã đăng nhập thành công!</p>
      <p class="mt-2">
        User: <strong>{{ authStore.user?.name || 'N/A' }}</strong>
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-800">Nhân viên</h3>
        <p class="text-3xl font-bold text-blue-500 mt-2">--</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-800">Phòng ban</h3>
        <p class="text-3xl font-bold text-green-500 mt-2">--</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-800">Bảng lương</h3>
        <p class="text-3xl font-bold text-orange-500 mt-2">--</p>
      </div>
    </div>
  </div>
</template>
