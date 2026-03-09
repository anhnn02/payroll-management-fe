<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Edit, Delete, Plus, Refresh } from '@element-plus/icons-vue'
import { COLORS } from '@/constants/colors'
import { TABLE_EMPTY_TEXT } from '@/constants'
import { Status, StatusLabel } from '@/constants/enums'
import { useToast } from '@/composables'
import { formatCurrency } from '@/utils/formatContent'
import {
  configService,
  MOCK_ALLOWANCES,
  type AllowanceConfig,
  type AllowanceConfigCreateRequest,
  type AllowanceConfigUpdateRequest,
} from '@/services/config.service'

defineProps<{
  isHrManager: boolean
}>()

const toast = useToast()
const isLoading = ref(false)
const allAllowances = ref<AllowanceConfig[]>([])

// ===== Filters =====
const filterStatus = ref('')
const searchKeyword = ref('')

const filteredAllowances = computed(() => {
  let list = allAllowances.value
  if (filterStatus.value) {
    list = list.filter(a => a.status === filterStatus.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(a => a.code.toLowerCase().includes(kw) || a.name.toLowerCase().includes(kw))
  }
  return list
})

// ===== Dialog =====
const showDialog = ref(false)
const isEditMode = ref(false)
const editingId = ref('')
const formRef = ref<FormInstance>()

const formData = reactive<AllowanceConfigCreateRequest>({
  code: '',
  name: '',
  description: '',
  defaultAmount: undefined,
  status: 'ACTIVE',
})

const formRules: FormRules = {
  code: [
    { required: true, message: 'Vui lòng nhập mã phụ cấp', trigger: 'blur' },
    { max: 50, message: 'Mã phụ cấp tối đa 50 ký tự', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9_]+$/,
      message: 'Mã phụ cấp chỉ gồm chữ IN HOA, số và gạch dưới',
      trigger: 'blur',
    },
  ],
  name: [
    { required: true, message: 'Vui lòng nhập tên phụ cấp', trigger: 'blur' },
    { max: 100, message: 'Tên phụ cấp tối đa 100 ký tự', trigger: 'blur' },
  ],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
}

const statusOptions = [
  { value: 'ACTIVE', label: StatusLabel[Status.ACTIVE] },
  { value: 'INACTIVE', label: StatusLabel[Status.INACTIVE] },
]

const statusTagType: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'info',
}

// ===== CRUD =====

async function fetchData() {
  isLoading.value = true
  try {
    const res = await configService.getAllowances()
    allAllowances.value = res.data as AllowanceConfig[]
  } catch {
    allAllowances.value = [...MOCK_ALLOWANCES]
    toast.warning('Không thể tải dữ liệu từ server, đang dùng dữ liệu mẫu')
  } finally {
    isLoading.value = false
  }
}

function handleCreate() {
  isEditMode.value = false
  editingId.value = ''
  formData.code = ''
  formData.name = ''
  formData.description = ''
  formData.defaultAmount = undefined
  formData.status = 'ACTIVE'
  showDialog.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleEdit(row: AllowanceConfig) {
  isEditMode.value = true
  editingId.value = row.id
  formData.code = row.code
  formData.name = row.name
  formData.description = row.description || ''
  formData.defaultAmount = row.defaultAmount
  formData.status = row.status
  showDialog.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleDelete(row: AllowanceConfig) {
  try {
    await toast.confirmDelete(row.name)
    await configService.deleteAllowance(row.id)
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
    if (isEditMode.value) {
      const updateData: AllowanceConfigUpdateRequest = {
        name: formData.name,
        description: formData.description || undefined,
        defaultAmount: formData.defaultAmount,
        status: formData.status,
      }
      await configService.updateAllowance(editingId.value, updateData)
      toast.updateSuccess()
    } else {
      await configService.createAllowance(formData)
      toast.createSuccess()
    }
    showDialog.value = false
    fetchData()
  } catch (err) {
    toast.handleApiError(err)
  } finally {
    isLoading.value = false
  }
}

function handleReset() {
  filterStatus.value = ''
  searchKeyword.value = ''
}

function formatAmount(val?: number): string {
  if (val === null || val === undefined) return '—'
  return formatCurrency(val)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-4">Danh mục phụ cấp</h3>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 items-end mb-4">
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <el-select v-model="filterStatus" placeholder="Tất cả" clearable class="w-full">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
        <el-input v-model="searchKeyword" placeholder="Tìm theo mã hoặc tên phụ cấp" clearable />
      </div>

      <div class="flex gap-1">
        <el-tooltip content="Đặt lại">
          <el-button :icon="Refresh" @click="handleReset" />
        </el-tooltip>
      </div>

      <div v-if="isHrManager" class="ml-auto">
        <el-button type="primary" @click="handleCreate">
          <el-icon class="mr-1"><Plus /></el-icon>
          Thêm phụ cấp
        </el-button>
      </div>
    </div>

    <!-- Table -->
    <el-table
      v-loading="isLoading"
      :data="filteredAllowances"
      stripe
      :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
      :empty-text="TABLE_EMPTY_TEXT"
    >
      <el-table-column label="STT" width="60" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="Mã phụ cấp" width="160">
        <template #default="{ row }">
          <span class="font-mono font-bold">{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Tên phụ cấp" min-width="180" />
      <el-table-column label="Số tiền mặc định" width="160" align="right">
        <template #default="{ row }">
          {{ formatAmount(row.defaultAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="Trạng thái" width="130" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType[row.status] as any" size="small">
            {{ StatusLabel[row.status as Status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="isHrManager" label="Thao tác" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-tooltip content="Sửa" placement="top">
            <el-button type="warning" link @click="handleEdit(row)">
              <el-icon :size="16"><Edit /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="Xóa" placement="top">
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog Thêm/Sửa -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? 'Chỉnh sửa phụ cấp' : 'Thêm phụ cấp'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        label-position="left"
      >
        <el-form-item label="Mã phụ cấp" prop="code">
          <el-input
            v-model="formData.code"
            :disabled="isEditMode"
            placeholder="VD: LUNCH, TRANSPORT"
          />
        </el-form-item>
        <el-form-item label="Tên phụ cấp" prop="name">
          <el-input v-model="formData.name" placeholder="VD: Phụ cấp ăn trưa" />
        </el-form-item>
        <el-form-item label="Mô tả" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="Mô tả phụ cấp"
          />
        </el-form-item>
        <el-form-item label="Số tiền mặc định" prop="defaultAmount">
          <el-input-number
            v-model="formData.defaultAmount"
            :min="0"
            :step="100000"
            style="width: 100%"
            placeholder="VNĐ"
          />
        </el-form-item>
        <el-form-item label="Trạng thái" prop="status">
          <el-select v-model="formData.status" class="w-full">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">Hủy</el-button>
        <el-button type="primary" :loading="isLoading" @click="handleSubmit"> 💾 Lưu </el-button>
      </template>
    </el-dialog>
  </div>
</template>
