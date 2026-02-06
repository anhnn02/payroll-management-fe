<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface MenuItem {
  title: string
  icon: string
  path: string
  name: string
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'House',
    path: '/dashboard',
    name: 'dashboard',
  },
  {
    title: 'Quản lý tài khoản',
    icon: 'User',
    path: '/accounts',
    name: 'accounts',
  },
  {
    title: 'Quản lý nhân viên',
    icon: 'UserFilled',
    path: '/employees',
    name: 'employees',
  },
  {
    title: 'Bảng lương',
    icon: 'Money',
    path: '/payroll',
    name: 'payroll',
  },
]

const isActive = (item: MenuItem) => {
  return route.path.startsWith(item.path)
}

const handleMenuClick = (item: MenuItem) => {
  router.push(item.path)
}
</script>

<template>
  <aside class="w-64 bg-secondary text-white flex flex-col h-full">
    <!-- Logo -->
    <div class="h-16 flex items-center justify-center border-b border-gray-700">
      <span class="text-xl font-bold">💼 Payroll</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 py-4">
      <ul class="space-y-1 px-3">
        <li v-for="item in menuItems" :key="item.name">
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="[
              isActive(item)
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
            ]"
            @click="handleMenuClick(item)"
          >
            <el-icon :size="20">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-700 text-center text-gray-400 text-sm">v1.0.0</div>
  </aside>
</template>
