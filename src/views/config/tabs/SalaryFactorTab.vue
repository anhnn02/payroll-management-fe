<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { COLORS } from '@/constants/colors'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { useToast } from '@/composables'
import {
  configService,
  type SalaryFactor,
  type SalaryFactorUpdateRequest,
} from '@/services/config.service'

defineProps<{
  isHrManager: boolean
}>()

const toast = useToast()
const isLoading = ref(false)
const salaryFactors = ref<SalaryFactor[]>([])

async function fetchData() {
  isLoading.value = true
  try {
    const res = await configService.getSalaryFactors()
    salaryFactors.value = res.data as SalaryFactor[]
  } catch (err) {
    toast.handleApiError(err, 'Không thể tải dữ liệu hệ số lương')
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  // Validate
  const invalid = salaryFactors.value.some(f => f.value <= 0)
  if (invalid) {
    toast.warning('Giá trị hệ số phải lớn hơn 0')
    return
  }

  isLoading.value = true
  try {
    const updates: SalaryFactorUpdateRequest[] = salaryFactors.value.map(f => ({
      code: f.code,
      value: f.value,
    }))
    await configService.updateSalaryFactors(updates)
    toast.updateSuccess('Cập nhật hệ số lương thành công')
  } catch (err) {
    toast.handleApiError(err, 'Lỗi khi cập nhật hệ số lương')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-4">Hệ số lương OT</h3>

    <el-table
      v-loading="isLoading"
      :data="salaryFactors"
      stripe
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
    >
      <el-table-column label="STT" width="60" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="Mã hệ số" width="180">
        <template #default="{ row }">
          <span class="font-mono font-bold">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Tên hệ số" min-width="200" />
      <el-table-column label="Giá trị" width="160" align="center">
        <template #default="{ row }">
          <el-input-number
            v-if="isHrManager"
            v-model="row.value"
            :min="0.01"
            :precision="2"
            :step="0.1"
            size="small"
            style="width: 120px"
          />
          <span v-else class="font-bold">×{{ row.value.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="Mô tả" min-width="200" />
    </el-table>

    <div v-if="isHrManager" class="flex justify-end mt-4">
      <el-button type="primary" :loading="isLoading" @click="handleSave"> Lưu thay đổi </el-button>
    </div>
  </div>
</template>
