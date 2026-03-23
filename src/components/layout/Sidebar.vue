<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { markRaw, ref, onMounted, type Component } from 'vue'
import { MENU_ICONS } from '@/constants/icons'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import { ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

interface MenuItem {
  title: string
  icon?: Component
  path?: string
  name?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: markRaw(MENU_ICONS.dashboard),
    path: ROUTE_PATHS.DASHBOARD,
    name: ROUTE_NAMES.DASHBOARD,
  },
  {
    title: 'QL Nhân sự & Phòng ban',
    icon: markRaw(MENU_ICONS.employees),
    children: [
      {
        title: 'Quản lý phòng ban',
        path: ROUTE_PATHS.DEPARTMENTS,
        name: ROUTE_NAMES.DEPARTMENTS,
      },
      {
        title: 'Quản lý vị trí',
        path: ROUTE_PATHS.POSITIONS,
        name: ROUTE_NAMES.POSITIONS,
      },
      {
        title: 'Quản lý nhân viên',
        path: ROUTE_PATHS.EMPLOYEES,
        name: ROUTE_NAMES.EMPLOYEES,
      },
    ]
  },
  {
    title: 'Quản lý hợp đồng',
    icon: markRaw(MENU_ICONS.contracts),
    path: ROUTE_PATHS.CONTRACTS,
    name: ROUTE_NAMES.CONTRACTS,
  },
  {
    title: 'Quản lý chấm công',
    icon: markRaw(MENU_ICONS.attendance),
    path: ROUTE_PATHS.ATTENDANCE_MANAGE,
    name: ROUTE_NAMES.ATTENDANCE_MANAGE,
  },
  {
    title: 'Quản lý lương',
    icon: markRaw(MENU_ICONS.payroll),
    children: [
      {
        title: 'Tính lương',
        path: ROUTE_PATHS.PAYROLL,
        name: ROUTE_NAMES.PAYROLL,
      },
      {
        title: 'Thanh toán',
        path: ROUTE_PATHS.PAYROLL_PAYMENT,
        name: ROUTE_NAMES.PAYROLL_PAYMENT,
      }
    ]
  },
  {
    title: 'Quản lý cấu hình',
    icon: markRaw(MENU_ICONS.salaryConfig),
    children: [
      {
        title: 'Cấu hình lương',
        path: ROUTE_PATHS.SALARY_CONFIG,
        name: ROUTE_NAMES.SALARY_CONFIG,
      }
    ]
  },
]

const openGroups = ref<string[]>([])

// Tự động mở menu group nếu route hiện tại nằm trong group đó
onMounted(() => {
  menuItems.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some(child => child.path && route.path.startsWith(child.path))
      if (hasActiveChild) {
        openGroups.value.push(item.title)
      }
    }
  })
})

const isActive = (path?: string) => {
  if (!path) return false
  return route.path.startsWith(path)
}

const handleMenuClick = (item: MenuItem) => {
  if (item.path) {
    router.push(item.path)
  }
}

const toggleGroup = (title: string) => {
  if (openGroups.value.includes(title)) {
    openGroups.value = openGroups.value.filter(g => g !== title)
  } else {
    openGroups.value.push(title)
  }
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
    <!-- Logo -->
    <div class="h-16 flex items-center justify-center border-b border-gray-200">
      <span class="text-xl font-bold text-primary">💼 Payroll</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 py-4 overflow-y-auto custom-scrollbar">
      <ul class="space-y-1 px-3">
        <template v-for="item in menuItems" :key="item.title">
          <!-- Item without children -->
          <li v-if="!item.children">
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              :class="[
                isActive(item.path)
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
          
          <!-- Group with children -->
          <li v-else class="pt-1 pb-1">
            <div
              class="w-full flex items-center justify-between px-4 py-3 text-gray-700 font-medium cursor-pointer hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
              @click="toggleGroup(item.title)"
            >
              <div class="flex items-center gap-3">
                <el-icon :size="20" v-if="item.icon"><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </div>
              <el-icon :size="14" class="transition-transform duration-200 text-gray-400" :class="{ 'rotate-180': openGroups.includes(item.title) }">
                <ArrowDown />
              </el-icon>
            </div>
            
            <ul v-show="openGroups.includes(item.title)" class="mt-1 space-y-1 overflow-hidden">
              <li v-for="child in item.children" :key="child.name">
                <button
                  class="w-full flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-lg transition-colors text-sm"
                  :class="[
                    isActive(child.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-primary',
                  ]"
                  @click="handleMenuClick(child)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="isActive(child.path) ? 'bg-primary' : 'bg-transparent border border-gray-300'"></span>
                  <span>{{ child.title }}</span>
                </button>
              </li>
            </ul>
          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
