/**
 * useLoading - Global fullscreen loading state
 *
 * Quản lý trạng thái loading toàn cục. Hỗ trợ nhiều request đồng thời
 * bằng cách đếm số lượng request đang chạy (counter).
 *
 * Loading chỉ ẩn khi TẤT CẢ request đã hoàn tất.
 *
 * @example
 * // Cách 1: Dùng trực tiếp trong component
 * const loading = useLoadingStore()
 * loading.show()
 * await fetchData()
 * loading.hide()
 *
 * // Cách 2: Wrapper async
 * await loading.wrap(async () => {
 *   await fetchData()
 * })
 *
 * // Cách 3: Tự động qua useApi (đã tích hợp sẵn)
 * // Mọi API call tự động show/hide loading
 */
import { reactive, computed } from 'vue'

interface LoadingState {
  /** Số lượng request đang pending */
  pendingCount: number
}

const state = reactive<LoadingState>({
  pendingCount: 0,
})

export function useLoadingStore() {
  const isLoading = computed(() => state.pendingCount > 0)

  /** Tăng counter — hiển thị loading */
  function show() {
    state.pendingCount++
  }

  /** Giảm counter — ẩn loading khi tất cả request done */
  function hide() {
    if (state.pendingCount > 0) {
      state.pendingCount--
    }
  }

  /** Reset counter về 0 (dùng khi cần force hide) */
  function reset() {
    state.pendingCount = 0
  }

  /**
   * Wrapper: tự động show/hide loading quanh async function
   * @example await loading.wrap(() => apiCall())
   */
  async function wrap<T>(fn: () => Promise<T>): Promise<T> {
    show()
    try {
      return await fn()
    } finally {
      hide()
    }
  }

  return {
    isLoading,
    show,
    hide,
    reset,
    wrap,
  }
}
