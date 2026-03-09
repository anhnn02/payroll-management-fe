/**
 * usePagination - Composable quản lý phân trang
 *
 * Dùng chung cho tất cả list views. Quản lý state phân trang
 * và cung cấp handlers cho el-pagination.
 *
 * @example
 * const { currentPage, pageSize, total, handlePageChange, handleSizeChange, getRowIndex } = usePagination(fetchData)
 */
import { ref } from 'vue'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { getRowIndex as _getRowIndex } from '@/utils/table'

interface UsePaginationOptions {
  /** Trang mặc định (default: 1) */
  defaultPage?: number
  /** Số bản ghi mỗi trang mặc định (default: 10) */
  defaultPageSize?: number
}

export function usePagination(fetchFn: () => void | Promise<void>, options?: UsePaginationOptions) {
  const currentPage = ref(options?.defaultPage ?? DEFAULT_PAGE)
  const pageSize = ref(options?.defaultPageSize ?? DEFAULT_PAGE_SIZE)
  const total = ref(0)

  /** Xử lý khi đổi trang */
  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchFn()
  }

  /** Xử lý khi đổi số bản ghi mỗi trang */
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = DEFAULT_PAGE
    fetchFn()
  }

  /** Reset về trang đầu */
  const resetPage = () => {
    currentPage.value = DEFAULT_PAGE
  }

  /**
   * Tính STT cho row — wrapper tiện dùng trong template
   * @param index - $index từ el-table slot
   */
  const getRowIndex = (index: number) => {
    return _getRowIndex(currentPage.value, pageSize.value, index)
  }

  /**
   * Lấy page 0-indexed cho BE
   * BE dùng 0-indexed, FE (el-pagination) dùng 1-indexed
   */
  const pageForApi = () => currentPage.value - 1

  return {
    // State
    currentPage,
    pageSize,
    total,

    // Constants (re-export để dùng trong template)
    PAGE_SIZE_OPTIONS,

    // Handlers
    handlePageChange,
    handleSizeChange,
    resetPage,

    // Helpers
    getRowIndex,
    pageForApi,
  }
}
