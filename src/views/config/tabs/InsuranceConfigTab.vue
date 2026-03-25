<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { COLORS } from '@/constants/colors'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { ContractTypeLabel, ContractType } from '@/constants/enums'
import { useToast } from '@/composables'
import {
  configService,
  type InsuranceConfig,
} from '@/services/config.service'

const toast = useToast()
const isLoading = ref(false)
const insuranceConfig = ref<InsuranceConfig[]>([])

async function fetchData() {
  isLoading.value = true
  try {
    const res = await configService.getInsuranceConfig()
    insuranceConfig.value = res.data as InsuranceConfig[]
  } catch (err) {
    toast.handleApiError(err, 'Không thể tải dữ liệu bảo hiểm')
  } finally {
    isLoading.value = false
  }
}

function getContractTypeLabel(type: string): string {
  return ContractTypeLabel[type as ContractType] || type
}

function getTotalRate(row: InsuranceConfig): number {
  return row.bhxhRate + row.bhtnRate + row.bhytRate
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-4">Cấu hình bảo hiểm theo loại hợp đồng</h3>

    <el-table
      v-loading="isLoading"
      :data="insuranceConfig"
      stripe
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
    >
      <el-table-column label="Loại hợp đồng" min-width="160">
        <template #default="{ row }">
          <span class="font-semibold">{{ getContractTypeLabel(row.contractType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="BHXH (%)" width="120" align="center">
        <template #default="{ row }"> {{ row.bhxhRate.toFixed(1) }}% </template>
      </el-table-column>
      <el-table-column label="BHTN (%)" width="120" align="center">
        <template #default="{ row }"> {{ row.bhtnRate.toFixed(1) }}% </template>
      </el-table-column>
      <el-table-column label="BHYT (%)" width="120" align="center">
        <template #default="{ row }"> {{ row.bhytRate.toFixed(1) }}% </template>
      </el-table-column>
      <el-table-column label="Tổng (%)" width="120" align="center">
        <template #default="{ row }">
          <span class="font-bold text-blue-600">{{ getTotalRate(row).toFixed(1) }}%</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-3 text-sm text-gray-500">📌 Dữ liệu chỉ hiển thị, không chỉnh sửa được.</div>
  </div>
</template>
