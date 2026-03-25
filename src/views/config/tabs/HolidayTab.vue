<script setup lang="ts">
import { ref, onMounted, watch, reactive, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { COLORS } from '@/constants/colors'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { useToast } from '@/composables'
import { formatDate } from '@/utils/formatContent'
import {
  configService,
  type Holiday,
  type HolidayCreateRequest,
} from '@/services/config.service'

defineProps<{
  isHrManager: boolean
}>()

const toast = useToast()
const isLoading = ref(false)
const holidays = ref<Holiday[]>([])

// ===== Year filter =====
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

// Generate year options (current year ± 5)
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

// ===== Dialog =====
const showDialog = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<HolidayCreateRequest>({
  holidayDate: '',
  name: '',
  description: '',
})

const formRules: FormRules = {
  holidayDate: [{ required: true, message: 'Vui lòng chọn ngày lễ', trigger: 'change' }],
  name: [
    { required: true, message: 'Vui lòng nhập tên ngày lễ', trigger: 'blur' },
    { max: 100, message: 'Tên ngày lễ tối đa 100 ký tự', trigger: 'blur' },
  ],
}

// ===== CRUD =====

const allHolidays = ref<Holiday[]>([])

async function fetchData() {
  isLoading.value = true
  try {
    const res = await configService.getHolidays()
    allHolidays.value = res.data as Holiday[]
    filterByYear()
  } catch (err) {
    toast.handleApiError(err, 'Không thể tải dữ liệu ngày lễ')
  } finally {
    isLoading.value = false
  }
}

function filterByYear() {
  holidays.value = allHolidays.value.filter(h =>
    h.holidayDate.startsWith(String(selectedYear.value))
  )
}

function handleCreate() {
  formData.holidayDate = ''
  formData.name = ''
  formData.description = ''
  showDialog.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleDelete(row: Holiday) {
  try {
    await toast.confirmDelete(row.name)
    await configService.deleteHoliday(row.id)
    toast.deleteSuccess()
    fetchData()
  } catch {
    // user cancelled or API error
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  isLoading.value = true
  try {
    await configService.createHoliday(formData)
    toast.createSuccess('Thêm ngày lễ thành công')
    showDialog.value = false
    fetchData()
  } catch (err) {
    toast.handleApiError(err)
  } finally {
    isLoading.value = false
  }
}

// Watch year change → filter client-side
watch(selectedYear, () => {
  filterByYear()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-4">Danh sách ngày lễ</h3>

    <!-- Year filter + Add button -->
    <div class="flex items-end gap-4 mb-4">
      <div class="w-32">
        <label class="block text-sm font-medium text-gray-700 mb-1">Năm</label>
        <el-select v-model="selectedYear" class="w-full">
          <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
        </el-select>
      </div>

      <div v-if="isHrManager" class="ml-auto">
        <el-button type="primary" @click="handleCreate">
          <el-icon class="mr-1"><Plus /></el-icon>
          Thêm ngày lễ
        </el-button>
      </div>
    </div>

    <!-- Table -->
    <el-table
      v-loading="isLoading"
      :data="holidays"
      stripe
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
    >
      <el-table-column label="STT" width="60" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="Ngày" width="140" align="center">
        <template #default="{ row }">
          <span class="font-semibold">{{ formatDate(row.holidayDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Tên ngày lễ" min-width="200" />
      <el-table-column prop="description" label="Mô tả" min-width="200" />
      <el-table-column v-if="isHrManager" label="Thao tác" width="80" fixed="right" align="center">
        <template #default="{ row }">
          <el-tooltip content="Xóa" placement="top">
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog Thêm ngày lễ -->
    <el-dialog
      v-model="showDialog"
      title="Thêm ngày lễ"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Ngày lễ" prop="holidayDate">
          <el-date-picker
            v-model="formData.holidayDate"
            type="date"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            placeholder="Chọn ngày lễ"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Tên ngày lễ" prop="name">
          <el-input v-model="formData.name" placeholder="VD: Tết Dương lịch" />
        </el-form-item>
        <el-form-item label="Mô tả" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="Mô tả ngày lễ"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">Hủy</el-button>
        <el-button type="primary" :loading="isLoading" @click="handleSubmit"> 💾 Lưu </el-button>
      </template>
    </el-dialog>
  </div>
</template>
