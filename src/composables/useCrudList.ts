import { ref, computed, type Ref } from 'vue'
import type { ApiResponse, PaginationMeta, ListParams } from '@/types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants'

interface CrudListOptions<T, P extends ListParams = ListParams> {
  fetchFn: (params: P) => Promise<ApiResponse<T[]>>
  createFn?: (data: Partial<T>) => Promise<ApiResponse<T>>
  updateFn?: (id: number | string, data: Partial<T>) => Promise<ApiResponse<T>>
  deleteFn?: (id: number | string) => Promise<ApiResponse<void>>
  initialParams?: Partial<P>
}

export function useCrudList<T extends { id: number | string }, P extends ListParams = ListParams>(
  options: CrudListOptions<T, P>
) {
  const { fetchFn, createFn, updateFn, deleteFn, initialParams = {} } = options

  // State
  const items: Ref<T[]> = ref([])
  const page = ref(DEFAULT_PAGE)
  const limit = ref(DEFAULT_PAGE_SIZE)
  const total = ref(0)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSubmitting = ref(false)
  const error: Ref<Error | null> = ref(null)
  const params: Ref<Partial<P>> = ref({ ...initialParams })

  // Computed
  const hasMore = computed(() => {
    const totalPages = Math.ceil(total.value / limit.value)
    return page.value < totalPages
  })

  // Actions
  async function fetch(resetPage = true): Promise<void> {
    if (resetPage) {
      page.value = DEFAULT_PAGE
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchFn({
        page: page.value,
        limit: limit.value,
        ...params.value,
      } as P)

      items.value = response.data
      if (response.meta) {
        total.value = response.meta.total
        page.value = response.meta.page
        limit.value = response.meta.limit
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoadingMore.value) return

    isLoadingMore.value = true
    error.value = null
    page.value += 1

    try {
      const response = await fetchFn({
        page: page.value,
        limit: limit.value,
        ...params.value,
      } as P)

      items.value = [...items.value, ...response.data]
      if (response.meta) {
        total.value = response.meta.total
      }
    } catch (e) {
      error.value = e as Error
      page.value -= 1 // Rollback page on error
    } finally {
      isLoadingMore.value = false
    }
  }

  async function create(data: Partial<T>): Promise<T | null> {
    if (!createFn) {
      console.warn('createFn not provided')
      return null
    }

    isSubmitting.value = true
    error.value = null

    try {
      const response = await createFn(data)
      // Optionally refresh list after create
      await fetch(true)
      return response.data
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  async function update(id: number | string, data: Partial<T>): Promise<T | null> {
    if (!updateFn) {
      console.warn('updateFn not provided')
      return null
    }

    isSubmitting.value = true
    error.value = null

    try {
      const response = await updateFn(id, data)
      // Update item in list
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = response.data
      }
      return response.data
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  async function remove(id: number | string): Promise<boolean> {
    if (!deleteFn) {
      console.warn('deleteFn not provided')
      return false
    }

    isSubmitting.value = true
    error.value = null

    try {
      await deleteFn(id)
      // Remove item from list
      items.value = items.value.filter(item => item.id !== id)
      total.value -= 1
      return true
    } catch (e) {
      error.value = e as Error
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function reset(): void {
    items.value = []
    page.value = DEFAULT_PAGE
    limit.value = DEFAULT_PAGE_SIZE
    total.value = 0
    error.value = null
    params.value = { ...initialParams }
  }

  function setParams(newParams: Partial<P>): void {
    params.value = { ...params.value, ...newParams }
  }

  function setPage(newPage: number): void {
    page.value = newPage
  }

  function setLimit(newLimit: number): void {
    limit.value = newLimit
  }

  return {
    // State
    items,
    page,
    limit,
    total,
    isLoading,
    isLoadingMore,
    isSubmitting,
    error,
    params,

    // Computed
    hasMore,

    // Actions
    fetch,
    loadMore,
    create,
    update,
    remove,
    reset,
    setParams,
    setPage,
    setLimit,
  }
}
