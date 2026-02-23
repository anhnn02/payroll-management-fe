import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface PageModeConfig {
  createRoute: string
  editRoute: string
  detailRoute?: string
}

export function usePageMode(config: PageModeConfig) {
  const route = useRoute()

  const isCreateMode = computed(() => route.name === config.createRoute)
  const isEditMode = computed(() => route.name === config.editRoute)
  const isDetailMode = computed(() => !!config.detailRoute && route.name === config.detailRoute)
  const isReadonly = computed(() => isDetailMode.value)

  const entityId = computed(() => route.params.id as string)

  const pageTitle = computed(() => {
    if (isCreateMode.value) return 'Thêm mới'
    if (isEditMode.value) return 'Chỉnh sửa'
    return 'Chi tiết'
  })

  return {
    isCreateMode,
    isEditMode,
    isDetailMode,
    isReadonly,
    entityId,
    pageTitle,
  }
}
