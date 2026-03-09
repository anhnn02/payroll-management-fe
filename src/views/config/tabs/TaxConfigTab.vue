<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { COLORS } from '@/constants/colors'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { useToast } from '@/composables'
import { formatCurrency } from '@/utils/formatContent'
import { configService, MOCK_TAX_CONFIG, type TaxConfig } from '@/services/config.service'

const toast = useToast()
const isLoading = ref(false)
const taxConfig = ref<TaxConfig[]>([])

async function fetchData() {
  isLoading.value = true
  try {
    const res = await configService.getTaxConfig()
    taxConfig.value = res.data as TaxConfig[]
  } catch {
    taxConfig.value = [...MOCK_TAX_CONFIG]
    toast.warning('Không thể tải dữ liệu từ server, đang dùng dữ liệu mẫu')
  } finally {
    isLoading.value = false
  }
}

function formatIncome(value?: number): string {
  if (value === null || value === undefined) return 'Không giới hạn'
  return formatCurrency(value)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-4">Bảng thuế TNCN (7 bậc lũy tiến)</h3>

    <el-table
      v-loading="isLoading"
      :data="taxConfig"
      stripe
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
    >
      <el-table-column label="Bậc" width="60" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="Mã bậc thuế" width="160">
        <template #default="{ row }">
          <span class="font-mono text-xs">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thuế suất" width="120" align="center">
        <template #default="{ row }">
          <span class="font-bold text-red-600">{{ row.taxRate }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="Thu nhập tối thiểu" min-width="160" align="right">
        <template #default="{ row }">
          {{ formatIncome(row.minIncome) }}
        </template>
      </el-table-column>
      <el-table-column label="Thu nhập tối đa" min-width="160" align="right">
        <template #default="{ row }">
          {{ formatIncome(row.maxIncome) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-3 text-sm text-gray-500">📌 Dữ liệu chỉ hiển thị, không chỉnh sửa được.</div>
  </div>
</template>
