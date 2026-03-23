<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { UploadFilled, Download, Warning } from '@element-plus/icons-vue'
import { attendanceService } from '@/services/attendance.service'
import { useAttendanceStore } from '@/stores/attendance'
import type { UploadFile } from 'element-plus'
import type { AttendanceImportResultResponse } from '@/types/attendance'

const emit = defineEmits(['switch-tab'])
const attendanceStore = useAttendanceStore()

// State
const currentStep = ref(0)
const selectedFile = ref<File | undefined>(undefined)
const previewResult = ref<AttendanceImportResultResponse | null>(null)

// Dialog State
const showOverwriteDialog = ref(false)
const isSubmitting = ref(false)

// Step 1: Download Template
const handleDownloadTemplate = async () => {
  try {
    const blob = await attendanceService.downloadTemplate()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_chamcong.xlsx'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error: unknown) {
    ElMessage.error('Lỗi tải template: ' + (error as Error).message)
  }
}

// Step 1: Upload Logic
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    const isExcel =
      uploadFile.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      uploadFile.raw.type === 'application/vnd.ms-excel'
    if (!isExcel) {
      ElMessage.error('File không đúng định dạng Excel (.xlsx, .xls)')
      selectedFile.value = undefined
    } else {
      selectedFile.value = uploadFile.raw
    }
  }
}

const handleRemove = () => {
  selectedFile.value = undefined
}

const handlePreview = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('Vui lòng chọn file Excel trước khi xem')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: 'Đang trích xuất dữ liệu file...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const res = await attendanceService.importPreview(selectedFile.value)
    previewResult.value = res.data
    currentStep.value = 1
  } catch (error: unknown) {
    ElMessage.warning('API không phản hồi, tự động dùng Mock Data để hiển thị UI Step 2!')
    previewResult.value = {
      totalRows: 15,
      successCount: 11,
      failedCount: 4,
      records: [
        {
          row: 1,
          employeeCode: 'EMP001',
          employeeName: 'Đinh Tuấn Tài',
          workDays: 22,
          otHours: 10,
          leaveDays: 0,
        },
        {
          row: 2,
          employeeCode: 'EMP002',
          employeeName: 'Nguyễn Văn A',
          workDays: undefined,
          otHours: 12,
          leaveDays: 0,
          error: 'Thiếu số ngày công',
        },
        {
          row: 3,
          employeeCode: 'EMP003',
          employeeName: 'Hoàng Trung Hiếu',
          workDays: 20,
          otHours: 5,
          leaveDays: 2,
        },
        {
          row: 4,
          employeeCode: 'EMP004',
          employeeName: 'Lý Quốc Bảo',
          workDays: 21,
          otHours: 0,
          leaveDays: 1,
        },
        {
          row: 5,
          employeeCode: 'EMP005',
          employeeName: 'Trần Thị B',
          workDays: 20,
          otHours: 5,
          leaveDays: 1,
          error: 'Mã nhân viên không tồn tại trong hệ thống',
        },
        {
          row: 12,
          employeeCode: 'EMP012',
          employeeName: 'Lê Hoàng C',
          workDays: 22,
          otHours: -2,
          leaveDays: 0,
          error: 'Số giờ OT bị âm',
        },
        {
          row: 13,
          employeeCode: 'EMP013',
          employeeName: 'Đỗ Thị Lan',
          workDays: 22,
          otHours: 2,
          leaveDays: 0,
        },
        {
          row: 15,
          employeeCode: 'EMP015',
          employeeName: 'Phạm Thị D',
          workDays: 35,
          otHours: 0,
          leaveDays: 0,
          error: 'Số ngày công vượt quá giới hạn',
        },
      ],
    }
    currentStep.value = 1
  } finally {
    loading.close()
  }
}

// Step 2: Confirm actions
const handleBackToStep1 = () => {
  selectedFile.value = undefined
  previewResult.value = null
  currentStep.value = 0
}

const handleConfirmClick = () => {
  if (attendanceStore.employeeCount > 0) {
    showOverwriteDialog.value = true
  } else {
    executeImport(false)
  }
}

const handleDownloadErrors = () => {
  console.log('API call to trigger errors_{month}.xlsx download')
  ElMessage.info('Đang tải danh sách lỗi...')
}

const executeImport = async (overwrite: boolean) => {
  if (!selectedFile.value) return

  isSubmitting.value = true
  const loading = ElLoading.service({
    lock: true,
    text: 'Đang xử lý lưu bảng chấm công...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    await attendanceService.importApply(selectedFile.value, overwrite)
    ElMessage.success('Import chấm công thành công!')
    showOverwriteDialog.value = false
    currentStep.value = 2
  } catch (error: unknown) {
    ElMessage.warning('API không phản hồi, tự động Mock thành công để qua Step 3!')
    showOverwriteDialog.value = false
    currentStep.value = 2
  } finally {
    isSubmitting.value = false
    loading.close()
  }
}

// Step 3: Finish action
const handleReturnToList = () => {
  emit('switch-tab', 'manage')
  // Refetch list data in the store
  attendanceStore.fetchMonthlyData()
  // Reset wizard state
  currentStep.value = 0
  selectedFile.value = undefined
  previewResult.value = null
  showOverwriteDialog.value = false
  isSubmitting.value = false
}
</script>

<template>
  <div class="attendance-import-tab">
    <!-- Wizard Steps -->
    <div class="mb-8">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="Tải file dữ liệu" />
        <el-step title="Kiểm tra dữ liệu" />
        <el-step title="Hoàn tất" />
      </el-steps>
    </div>

    <!-- Step 1: Chọn File -->
    <div v-show="currentStep === 0" class="max-w-2xl mx-auto space-y-6">
      <h3 class="font-medium text-gray-700 mb-2">1. Chuẩn bị file dữ liệu</h3>
      <div class="flex items-center justify-between p-4 bg-blue-50 text-blue-800 rounded-lg">
        <div>
          <p class="text-sm mt-1">Sử dụng file template chuẩn của hệ thống để đảm bảo cấu trúc.</p>
        </div>
        <el-button type="primary" plain :icon="Download" @click="handleDownloadTemplate">
          Tải Template Mẫu
        </el-button>
      </div>

      <div>
        <h3 class="font-medium text-gray-700 mb-2">2. Upload file Excel</h3>
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx, .xls"
          :on-change="handleFileChange"
          :on-remove="handleRemove"
          class="w-full"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">Kéo thả file .xlsx vào đây hoặc <em>click để chọn</em></div>
          <template #tip>
            <div class="el-upload__tip text-gray-500">
              Chỉ chấp nhận file định dạng chuẩn Excel (.xlsx, .xls). Dữ liệu tháng sẽ tính theo
              thông tin cấu hình bên trong.
            </div>
          </template>
        </el-upload>
      </div>

      <div class="flex justify-end pt-4">
        <el-button type="primary" :disabled="!selectedFile" @click="handlePreview">
          Tiếp
        </el-button>
      </div>
    </div>

    <!-- Step 2: Preview -->
    <div v-if="currentStep === 1 && previewResult" class="space-y-6">
      <div class="flex gap-4 items-center">
        <el-tag size="large" type="info" effect="dark" class="px-6 py-2 text-sm font-medium">
          Tổng số dòng: {{ previewResult.totalRows }}
        </el-tag>
        <el-tag size="large" type="success" effect="dark" class="px-6 py-2 text-sm font-medium">
          Hợp lệ: {{ previewResult.successCount }}
        </el-tag>
        <el-tag size="large" type="danger" effect="dark" class="px-6 py-2 text-sm font-medium">
          Lỗi: {{ previewResult.failedCount }}
        </el-tag>
      </div>

      <!-- Records Table -->
      <div
        class="mt-4 border rounded overflow-hidden"
        :class="previewResult.failedCount > 0 ? 'border-red-200' : 'border-gray-200'"
      >
        <div
          v-if="previewResult.failedCount > 0"
          class="bg-red-50 p-3 text-red-600 font-medium flex items-center gap-2"
        >
          <el-icon><Warning /></el-icon>
          Một số dòng dữ liệu có lỗi và sẽ bị bỏ qua khi Import. Vui lòng kiểm tra lại!
        </div>
        <div v-else class="bg-green-50 p-3 text-green-600 font-medium flex items-center gap-2">
          <el-icon><CircleCheck /></el-icon>
          Tất cả dữ liệu đều hợp lệ! Có thể tự tin xác nhận Import.
        </div>

        <el-table
          :data="previewResult.records || previewResult.errors"
          style="width: 100%"
          max-height="400"
          :row-class-name="({ row }) => (row.error ? 'bg-[#FFF8F7] !text-red-800' : '')"
        >
          <el-table-column prop="row" label="Dòng #" width="80" align="center" />
          <el-table-column prop="employeeCode" label="Mã NV" width="120" />
          <el-table-column label="Họ tên" min-width="150">
            <template #default="{ row }">
              <span v-if="row.employeeName">{{ row.employeeName }}</span>
              <span v-else class="text-gray-400">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Ngày CC" width="90" align="center">
            <template #default="{ row }">
              <span v-if="row.workDays !== undefined">{{ row.workDays }}</span>
              <span v-else class="text-gray-400">—</span>
            </template>
          </el-table-column>
          <el-table-column label="OT" width="70" align="center">
            <template #default="{ row }">
              <span v-if="row.otHours !== undefined">{{ row.otHours }}</span>
              <span v-else class="text-gray-400">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Nghỉ phép" width="100" align="center">
            <template #default="{ row }">
              <span v-if="row.leaveDays !== undefined">{{ row.leaveDays }}</span>
              <span v-else class="text-gray-400">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Kết quả" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.error" type="danger" size="small" effect="dark">Lỗi</el-tag>
              <el-tag v-else type="success" size="small" effect="dark">Hợp lệ</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="error" label="Lý do lỗi/Ghi chú" min-width="180">
            <template #default="{ row }">
              <span v-if="row.error" class="text-red-600 font-medium">{{ row.error }}</span>
              <span v-else class="text-green-600 font-medium">Sẵn sàng Import</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="flex justify-end gap-3 pt-6">
        <el-button @click="handleBackToStep1"> Quay lại </el-button>
        <el-button
          v-if="previewResult.failedCount > 0"
          :icon="Download"
          @click="handleDownloadErrors"
        >
          Tải danh sách lỗi
        </el-button>
        <el-button
          type="primary"
          :disabled="previewResult.successCount === 0"
          @click="handleConfirmClick"
        >
          Xác nhận Import {{ previewResult.successCount }} dòng
        </el-button>
      </div>
    </div>

    <!-- Step 3: Success Result -->
    <div v-if="currentStep === 2" class="py-12">
      <el-result icon="success" title="Import Chấm Công Thành Công">
        <template #sub-title>
          <p class="text-gray-600 text-base mt-2">
            Hệ thống đã ghi nhận <strong>{{ previewResult?.successCount || 0 }}</strong> bản ghi
            chấm công nhân viên.
          </p>
        </template>
        <template #extra>
          <el-button type="primary" size="large" @click="handleReturnToList">
            Trở về Danh sách
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- Overwrite Dialog (BR-ATT-05) -->
    <el-dialog v-model="showOverwriteDialog" width="500px" :show-close="false" destroy-on-close>
      <template #header>
        <div class="flex items-center gap-2 text-orange-500 font-semibold text-lg">
          <el-icon :size="24"><Warning /></el-icon>
          <span>Ghi Đè Dữ Liệu Hiện Có?</span>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-gray-600 text-sm">
          Tháng <span class="font-medium">{{ attendanceStore.currentMonth }}</span> đã có dữ liệu
          chấm công. Việc import sẽ cập nhật và ghi đè các bản ghi bị trùng Mã Nhân viên.
        </p>

        <div class="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 space-y-2">
          <div class="flex justify-between border-b border-gray-200 pb-2">
            <span>Tháng import:</span>
            <span class="font-bold">{{ attendanceStore.currentMonth }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-2 mt-2">
            <span>Số dòng hợp lệ:</span>
            <span class="font-bold text-green-600">{{ previewResult?.successCount }} dòng</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-2 mt-2">
            <span>Số dòng lỗi bỏ qua:</span>
            <span class="font-bold text-red-500">{{ previewResult?.failedCount }} dòng</span>
          </div>
          <div class="flex justify-between mt-2">
            <span>Hành động:</span>
            <span class="font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs"
              >UPSERT</span
            >
          </div>
        </div>

        <div class="bg-red-50 border-l-4 border-red-500 p-3">
          <p class="text-red-700 text-sm font-medium">
            Dữ liệu cũ của NV trùng mã sẽ bị ghi đè. Thao tác này không thể hoàn tác!
          </p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer flex justify-end gap-3">
          <el-button @click="showOverwriteDialog = false">Hủy</el-button>
          <el-button type="danger" :loading="isSubmitting" @click="executeImport(true)">
            Xác nhận ghi đè
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
