/**
 * useToast - Centralized toast notification composable
 *
 * Cung cấp các hàm hiển thị thông báo chung cho toàn app.
 * Import & dùng: const toast = useToast()
 */
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== Cấu hình mặc định =====
interface ToastConfig {
  /** Thời gian hiển thị toast (ms) */
  duration: number
  /** Có hiển thị nút close không */
  showClose: boolean
}

const defaultConfig: ToastConfig = {
  duration: 3000,
  showClose: true,
}

let currentConfig = { ...defaultConfig }

// ===== Messages template =====
const MESSAGES = {
  // CRUD chung
  CREATE_SUCCESS: 'Thêm mới thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',

  // Lỗi chung
  LOAD_ERROR: 'Không thể tải dữ liệu',
  CREATE_ERROR: 'Thêm mới thất bại',
  UPDATE_ERROR: 'Cập nhật thất bại',
  DELETE_ERROR: 'Không thể xóa',
  UNKNOWN_ERROR: 'Có lỗi xảy ra',

  // Validation
  VALIDATION_WARNING: 'Vui lòng điền đầy đủ thông tin bắt buộc',
} as const

export type ToastMessageKey = keyof typeof MESSAGES

export function useToast() {
  // ===== Cơ bản =====
  const success = (message: string) => {
    ElMessage.success({
      message,
      duration: currentConfig.duration,
      showClose: currentConfig.showClose,
    })
  }

  const error = (message: string) => {
    ElMessage.error({
      message,
      duration: currentConfig.duration,
      showClose: currentConfig.showClose,
    })
  }

  const warning = (message: string) => {
    ElMessage.warning({
      message,
      duration: currentConfig.duration,
      showClose: currentConfig.showClose,
    })
  }

  const info = (message: string) => {
    ElMessage.info({
      message,
      duration: currentConfig.duration,
      showClose: currentConfig.showClose,
    })
  }

  // ===== CRUD shortcuts =====

  /** Thông báo thêm mới thành công - default "Thêm mới thành công" */
  const createSuccess = (customMessage?: string) => {
    success(customMessage || MESSAGES.CREATE_SUCCESS)
  }

  /** Thông báo cập nhật thành công - default "Cập nhật thành công" */
  const updateSuccess = (customMessage?: string) => {
    success(customMessage || MESSAGES.UPDATE_SUCCESS)
  }

  /** Thông báo xóa thành công - default "Xóa thành công" */
  const deleteSuccess = (customMessage?: string) => {
    success(customMessage || MESSAGES.DELETE_SUCCESS)
  }

  /** Thông báo lỗi tải dữ liệu - default "Không thể tải dữ liệu" */
  const loadError = (customMessage?: string) => {
    error(customMessage || MESSAGES.LOAD_ERROR)
  }

  /** Thông báo lỗi thêm mới - default "Thêm mới thất bại" */
  const createError = (customMessage?: string) => {
    error(customMessage || MESSAGES.CREATE_ERROR)
  }

  /** Thông báo lỗi cập nhật - default "Cập nhật thất bại" */
  const updateError = (customMessage?: string) => {
    error(customMessage || MESSAGES.UPDATE_ERROR)
  }

  /** Thông báo lỗi xóa - default "Không thể xóa" */
  const deleteError = (customMessage?: string) => {
    error(customMessage || MESSAGES.DELETE_ERROR)
  }

  /** Thông báo validation - default "Vui lòng điền đầy đủ thông tin bắt buộc" */
  const validationWarning = (customMessage?: string) => {
    warning(customMessage || MESSAGES.VALIDATION_WARNING)
  }

  /** Xử lý lỗi từ API (bao gồm validation errors từ BE) */
  const handleApiError = (err: unknown, fallbackMessage?: string) => {
    const apiErr = err as { errors?: { field: string; message: string }[]; message?: string }
    if (apiErr?.errors && Array.isArray(apiErr.errors)) {
      apiErr.errors.forEach(e => {
        error(`${e.field}: ${e.message}`)
      })
    } else {
      error(apiErr?.message || fallbackMessage || MESSAGES.UNKNOWN_ERROR)
    }
  }

  // ===== Confirm dialog =====

  /** Hiển thị confirm xóa: "Bạn có chắc muốn xóa {itemLabel}?" */
  const confirmDelete = (itemLabel: string): Promise<void> => {
    return ElMessageBox.confirm(`Bạn có chắc muốn xóa "${itemLabel}"?`, 'Xác nhận xóa', {
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }).then(() => {}) // resolve with void
  }

  return {
    // Cơ bản
    success,
    error,
    warning,
    info,

    // CRUD shortcuts
    createSuccess,
    updateSuccess,
    deleteSuccess,
    loadError,
    createError,
    updateError,
    deleteError,
    validationWarning,
    handleApiError,

    // Confirm
    confirmDelete,

    // Messages constants (để tham chiếu nếu cần)
    MESSAGES,
  }
}

/**
 * Cấu hình toàn cục cho toast
 * Gọi 1 lần ở main.ts hoặc App.vue nếu cần override
 */
export function configureToast(config: Partial<ToastConfig>) {
  currentConfig = { ...currentConfig, ...config }
}
