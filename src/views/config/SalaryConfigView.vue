<script setup lang="ts">
import { ref, computed } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import SalaryFactorTab from './tabs/SalaryFactorTab.vue'
import TaxConfigTab from './tabs/TaxConfigTab.vue'
import InsuranceConfigTab from './tabs/InsuranceConfigTab.vue'
import HolidayTab from './tabs/HolidayTab.vue'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/constants/enums'

const authStore = useAuthStore()
const isHrManager = computed(() => authStore.user?.roles?.includes(UserRole.HR_MANAGER))

const activeTab = ref(isHrManager.value ? 'salary-factors' : 'tax')
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between">
      <PageBreadcrumb
        :icon="Setting"
        :items="[{ label: 'Cấu hình' }, { label: 'Cấu hình lương' }]"
      />
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <!-- Tab 1: Hệ số lương — HR_MANAGER only -->
        <el-tab-pane v-if="isHrManager" label="Hệ số lương" name="salary-factors">
          <SalaryFactorTab :is-hr-manager="isHrManager" />
        </el-tab-pane>

        <!-- Tab 2: Thuế TNCN — cả 2 role -->
        <el-tab-pane label="Thuế TNCN" name="tax">
          <TaxConfigTab />
        </el-tab-pane>

        <!-- Tab 3: Bảo hiểm — cả 2 role -->
        <el-tab-pane label="Bảo hiểm" name="insurance">
          <InsuranceConfigTab />
        </el-tab-pane>

        <!-- Tab 4: Ngày lễ — HR_MANAGER only -->
        <el-tab-pane v-if="isHrManager" label="Ngày lễ" name="holidays">
          <HolidayTab :is-hr-manager="isHrManager" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
