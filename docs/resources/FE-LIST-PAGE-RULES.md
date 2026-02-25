# FE List Page — Coding Rules

> **Nguồn**: Phân tích từ `DepartmentListView.vue`
> **Mục đích**: Quy tắc chung khi tạo bất kỳ trang danh sách nào (List Page) trong project
> **Áp dụng**: PositionListView, EmployeeListView, PayrollListView, ...

---

## Rule 1: Cấu trúc `<script setup>` — Thứ tự khai báo

```
1. Imports (vue → vue-router → constants → components → types → services → composables)
2. Composables (router, toast)
3. State refs (data[], isLoading, searchKeyword, filterStatus, showDeleteDialog, deletingItem)
4. usePagination (destructure tất cả helpers)
5. Fetch function (async, isLoading wrapper, try-catch-finally)
6. Handler functions (handleSearch, handleCreate, handleView, handleEdit, handleDelete, onConfirmDelete, handleReset)
7. onMounted(fetchFn)
```

---

## Rule 2: Fetch Function Pattern

```ts
async function fetchItems() {
  isLoading.value = true
  try {
    const response = await service.search({
      keyword: searchKeyword.value || undefined,  // undefined nếu rỗng
      status: filterStatus.value || undefined,
      page: pageForApi(),                          // 0-indexed cho BE
      size: pageSize.value,
    })
    items.value = response.content
    total.value = response.totalElements
  } catch {
    toast.loadError()
  } finally {
    isLoading.value = false
  }
}
```

---

## Rule 3: Delete Flow Pattern

```ts
// 1. State
const showDeleteDialog = ref(false)
const deletingItem = ref<Item | null>(null)

// 2. Mở dialog
const handleDelete = (row: Item) => {
  deletingItem.value = row
  showDeleteDialog.value = true
}

// 3. Confirm handler (ConfirmDialog tự lo loading/toast)
const onConfirmDelete = async () => {
  if (!deletingItem.value) return
  await service.delete(deletingItem.value.id)
  fetchItems()
}
```

---

## Rule 4: Search & Reset Pattern

```ts
const handleSearch = () => {
  resetPage()       // Reset về trang 1
  fetchItems()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = Status.ACTIVE   // Reset về default
  resetPage()
  fetchItems()
}
```

---

## Rule 5: Template Structure

```html
<div class="space-y-6">
  <!-- Header: Breadcrumb + Button Thêm mới -->
  <div class="flex items-center justify-between mb-4">
    <PageBreadcrumb :icon="..." :items="[{ label: '...' }]" />
    <el-button type="primary" @click="handleCreate">
      <el-icon class="mr-1"><Plus /></el-icon> Thêm mới
    </el-button>
  </div>

  <!-- Card: Filters + Table + Pagination -->
  <el-card shadow="never">
    <!-- Filters row -->
    <div class="flex flex-wrap gap-4 items-end mb-4">
      <div class="flex-1 min-w-[250px]"> <!-- Search input --> </div>
      <div class="w-40"> <!-- Status filter --> </div>
      <div class="flex gap-1"> <!-- Buttons: Tìm kiếm + Refresh --> </div>
    </div>

    <!-- Table -->
    <el-table v-loading stripe :header-cell-style :empty-text>
      <el-table-column label="STT" width="60" align="center" />
      <!-- Data columns -->
      <el-table-column label="Trạng thái" align="center"> <!-- el-tag --> </el-table-column>
      <el-table-column label="Thao tác" fixed="right" align="center">
        <!-- Xem/Sửa/Xóa buttons with el-tooltip -->
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="flex justify-end mt-4">
      <el-pagination layout="total, sizes, prev, pager, next" />
    </div>
  </el-card>
</div>

<!-- ConfirmDialog (ngoài wrapper div) -->
<ConfirmDialog v-model toastType="delete" ... />
```

---

## Rule 6: Constants Pattern (mỗi module)

Mỗi module tạo file `constants.ts` riêng:

```ts
// views/xxx/constants.ts
import { Status, StatusLabel, enumToOptions } from '@/constants/enums'

export const XXX_STATUS_OPTIONS = enumToOptions(StatusLabel)
export const XXX_STATUS_LABELS = StatusLabel

type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'
export const XXX_STATUS_TAG_TYPE: Record<Status, TagType> = {
  [Status.ACTIVE]: 'success',
  [Status.INACTIVE]: 'info',
}
```

---

## Rule 7: Types Pattern (mỗi module)

Mỗi module tạo file `types.ts` riêng:

```ts
// views/xxx/types.ts

export interface XxxItem {
  id: string
  code: string
  name: string
  status: XxxStatus
  // ... các field riêng
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export type XxxStatus = 'ACTIVE' | 'INACTIVE'

export interface XxxSearchRequest {
  keyword?: string
  status?: string
  page: number
  size: number
}

export interface XxxFormData {
  // các field cần gửi khi create/update (không bao gồm id, audit fields)
}
```

---

## Rule 8: Service Pattern (mỗi module)

Service import types từ `views/xxx/types.ts`:

```ts
// services/xxx.service.ts
import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, ApiRequestOptions, PaginatedResponse } from '@/types/api'
import type { XxxItem, XxxSearchRequest, XxxFormData } from '@/views/xxx/types'

export type { XxxItem, XxxSearchRequest, XxxFormData }

export const xxxService = {
  async search(data: XxxSearchRequest, options?: ApiRequestOptions): Promise<PaginatedResponse<XxxItem>> { ... },
  async getById(id: string, options?: ApiRequestOptions): Promise<ApiResponse<XxxItem>> { ... },
  async create(data: XxxFormData, options?: ApiRequestOptions): Promise<ApiResponse<XxxItem>> { ... },
  async update(id: string, data: XxxFormData, options?: ApiRequestOptions): Promise<ApiResponse<XxxItem>> { ... },
  async delete(id: string, options?: ApiRequestOptions): Promise<ApiResponse<null>> { ... },
}
```

---

## Rule 9: Table Column Styling

| Thuộc tính | Convention |
|---|---|
| STT | `width="60" align="center"`, dùng `getRowIndex($index)` |
| Code | `width="120"`, class `font-bold uppercase` |
| Name | `min-width="180"` |
| Status | `width="130" align="center"`, dùng `el-tag` |
| Actions | `width="150" fixed="right" align="center"`, 3 icon buttons (View/Edit/Delete) |
| Header BG | `:header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"` |
| Empty text | `:empty-text="TABLE_EMPTY_TEXT"` |

---

## Rule 10: Action Buttons

```html
<el-tooltip content="Xem chi tiết" placement="top">
  <el-button type="primary" link @click="handleView(row)">
    <el-icon :size="16"><View /></el-icon>
  </el-button>
</el-tooltip>
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
```

---

## Rule 11: ConfirmDialog Usage

```html
<ConfirmDialog
  v-model="showDeleteDialog"
  title="Xác nhận xóa"
  :message="`Bạn có chắc muốn xóa [entity] '${deleting?.code} - ${deleting?.name}'?`"
  confirm-type="danger"
  :icon="Delete"
  :icon-color="COLORS.DANGER"
  :on-confirm="onConfirmDelete"
/>
```

> `toastType` default là `'delete'` → không cần khai báo khi xóa.

---

## Rule 12: Error Handling (useToast)

| Tình huống | Xử lý |
|---|---|
| Load data thất bại | `toast.loadError()` |
| Tạo mới thành công | `toast.createSuccess()` |
| Cập nhật thành công | `toast.updateSuccess()` |
| Xóa thành công/thất bại | Qua `ConfirmDialog` toastType tự xử lý |
| Submit lỗi | `toast.handleApiError(error)` |
| Validation lỗi | `toast.validationWarning()` |

---

## Rule 13: Router Pattern

```ts
// constants/routes.ts
XXXS: 'xxxs',
XXX_CREATE: 'xxx-create',
XXX_DETAIL: 'xxx-detail',
XXX_EDIT: 'xxx-edit',

// router/index.ts
{ path: 'xxxs',          name: ROUTE_NAMES.XXXS,       component: XxxListView  },
{ path: 'xxxs/create',   name: ROUTE_NAMES.XXX_CREATE, component: XxxFormView  },
{ path: 'xxxs/:id',      name: ROUTE_NAMES.XXX_DETAIL, component: XxxFormView  },
{ path: 'xxxs/:id/edit', name: ROUTE_NAMES.XXX_EDIT,   component: XxxFormView  },
```

---

## Rule 14: Thư mục module

```
src/views/xxxs/
├── XxxListView.vue
├── XxxFormView.vue
├── types.ts
├── constants.ts
└── components/         (nếu cần)
    └── AddItemDialog.vue
```

---

## Shared Dependencies

Các import dùng chung cho tất cả list pages:

| Import | From |
|---|---|
| `ROUTE_NAMES` | `@/constants/routes` |
| `Plus, Edit, Delete, Refresh, View, Guide` | `@/constants/icons` |
| `PageBreadcrumb` | `@/components/common/PageBreadcrumb.vue` |
| `ConfirmDialog` | `@/components/common/ConfirmDialog.vue` |
| `COLORS` | `@/constants/colors` |
| `useToast` | `@/composables/useToast` |
| `usePagination` | `@/composables/usePagination` |
| `Status` | `@/constants/enums` |
| `TABLE_EMPTY_TEXT` | `@/constants` |
