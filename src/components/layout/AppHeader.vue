<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ASSETS } from '@/constants'

const authStore = useAuthStore()
</script>

<template>
  <header
    class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-xs"
  >
    <!-- Left: Logo / Title -->
    <div class="flex items-center gap-4">
      <img :src="ASSETS.LOGO" alt="Logo" class="h-8 w-8 object-contain" />
      <h1 class="text-xl font-semibold text-primary">Payroll Management</h1>
    </div>

    <!-- Right: User info -->
    <div class="flex items-center gap-4">
      <span class="text-gray-600">{{ authStore.user?.username || 'Guest' }}</span>
      <el-dropdown>
        <el-avatar :size="36" class="cursor-pointer bg-primary">
          {{ authStore.user?.username?.charAt(0) || 'U' }}
        </el-avatar>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Thông tin cá nhân</el-dropdown-item>
            <el-dropdown-item divided @click="authStore.logout()"> Đăng xuất </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>
