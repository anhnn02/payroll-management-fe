<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { markRaw, type Component } from 'vue'
import { MENU_ICONS } from '@/constants/icons'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const router = useRouter()

interface MenuItem {
  title: string
  icon: Component
  path: string
  name: string
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: markRaw(MENU_ICONS.dashboard),
    path: ROUTE_PATHS.DASHBOARD,
    name: ROUTE_NAMES.DASHBOARD,
  },
  {
    title: 'Quản lý tài khoản',
    icon: markRaw(MENU_ICONS.accounts),
    path: ROUTE_PATHS.ACCOUNTS,
    name: ROUTE_NAMES.ACCOUNTS,
  },
  {
    title: 'Quản lý nhân viên',
    icon: markRaw(MENU_ICONS.employees),
    path: ROUTE_PATHS.EMPLOYEES,
    name: ROUTE_NAMES.EMPLOYEES,
  },
  {
    title: 'Bảng lương',
    icon: markRaw(MENU_ICONS.payroll),
    path: ROUTE_PATHS.PAYROLL,
    name: ROUTE_NAMES.PAYROLL,
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
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
    <!-- Logo -->
    <div class="h-16 flex items-center justify-center border-b border-gray-200">
      <span class="text-xl font-bold text-primary">💼 Payroll</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 py-4">
      <ul class="space-y-1 px-3">
        <li v-for="item in menuItems" :key="item.name">
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="[
              isActive(item)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-primary',
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
    <!-- <div class="p-4 border-t border-gray-200 text-center text-gray-400 text-sm">v1.0.0</div> -->
  </aside>
</template>
