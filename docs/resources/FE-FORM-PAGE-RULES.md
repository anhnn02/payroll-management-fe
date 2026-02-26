# FE Form Page — Coding Rules

> **Nguồn**: Phân tích từ `DepartmentFormView.vue` (340 dòng)
> **Mục đích**: Quy tắc chung khi tạo bất kỳ trang form nào (Create / Edit / Detail) trong project
> **Áp dụng**: PositionFormView, EmployeeFormView, PayrollFormView, ...

---

## Rule 1: Cấu trúc `<script setup>` — Thứ tự khai báo

```
1. Imports (vue → vue-router → constants → services → composables → components → types)
2. Composables: router, toast
3. usePageMode (destructure: isCreateMode, isEditMode, isDetailMode, isReadonly, entityId, pageTitle)
4. Refs: formRef, isLoading, isSubmitting, dialog visibility refs
5. Form data (ref<FormData>)
6. Detail data (ref<Entity | null>)
7. Select options (ref<{ value; label }[]>)
8. Validation rules (object)
9. Fetch functions (fetchEntity, fetchOptions, fetchRelatedItems)
10. Submit handler (handleSubmit)
11. Navigation handlers (handleCancel, handleEdit)
12. Related item handlers (handleRemove, onConfirmRemove, handleAdded)
13. onMounted(() => { fetchOptions(); fetchEntity(); fetchRelatedItems(); })
```

---

## Rule 2: usePageMode — 3 modes dùng chung 1 component

```ts
import { usePageMode } from '@/composables/usePageMode'

const {
  isCreateMode,   // route === XXX_CREATE
  isEditMode,     // route === XXX_EDIT
  isDetailMode,   // route === XXX_DETAIL
  isReadonly,     // = isDetailMode (auto computed)
  entityId,       // route.params.id
  pageTitle,      // 'Thêm mới' | 'Cập nhật' | 'Chi tiết'
} = usePageMode({
  createRoute: ROUTE_NAMES.XXX_CREATE,
  editRoute: ROUTE_NAMES.XXX_EDIT,
  detailRoute: ROUTE_NAMES.XXX_DETAIL,
})
```

---

## Rule 3: Form Data & Refs

```ts
const formRef = ref()
const isLoading = ref(false)     // loading khi fetch data
const isSubmitting = ref(false)  // loading khi submit

const form = ref<XxxFormData>({
  code: '',
  name: '',
  description: '',
  status: Status.ACTIVE,         // default ACTIVE
  // ... các field khác
})

const detailData = ref<XxxEntity | null>(null)  // Lưu raw data từ BE (dùng cho display)
```

---

## Rule 4: Validation Rules

```ts
const rules = {
  // Required text field
  name: [
    { required: true, message: 'Vui lòng nhập tên [entity]', trigger: 'blur' },
    { max: 100, message: 'Tên tối đa 100 ký tự', trigger: 'blur' },
  ],
  // Required code field (uppercase pattern)
  code: [
    { required: true, message: 'Vui lòng nhập mã [entity]', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: 'Mã chỉ gồm chữ IN HOA, số và gạch dưới', trigger: 'blur' },
  ],
  // Required select/radio
  status: [
    { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' },
  ],
  // Custom validator (ví dụ: so sánh 2 field)
  maxSalary: [
    { required: true, message: 'Vui lòng nhập lương tối đa', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value <= form.value.minSalary) {
          callback(new Error('Lương tối đa phải lớn hơn lương tối thiểu'))
        } else callback()
      },
      trigger: 'blur',
    },
  ],
}
```

> **Lưu ý**: Khi `isReadonly` (detail mode), truyền `:rules="isReadonly ? undefined : rules"` để tắt validation.

---

## Rule 5: Fetch Entity Data (Edit/Detail)

```ts
const fetchEntity = async () => {
  if (isCreateMode.value) return             // Không fetch khi create

  isLoading.value = true
  try {
    const response = await xxxService.getById(entityId.value)
    const data = response.data as XxxEntity
    detailData.value = data

    // Map BE data → form data
    form.value = {
      code: data.code,
      name: data.name,
      description: data.description || '',   // nullable → default ''
      status: data.status,
    }
  } catch {
    toast.loadError()
    router.push({ name: ROUTE_NAMES.XXXS })  // Quay về list nếu lỗi
  } finally {
    isLoading.value = false
  }
}
```

---

## Rule 6: Fetch Select Options

```ts
const options = ref<{ value: string; label: string }[]>([])

const fetchOptions = async () => {
  try {
    const response = await relatedService.search(
      { status: Status.ACTIVE, page: 0, size: 100 },
      { showLoading: false }                  // Không hiện loading toàn trang
    )
    let items = response.content || []

    // Loại bỏ chính nó khi edit (tránh chọn chính mình)
    if (isEditMode.value && entityId.value) {
      items = items.filter(item => item.id !== entityId.value)
    }

    options.value = items.map(item => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
    }))
  } catch {
    toast.loadError()
  }
}
```

---

## Rule 7: Submit Handler Pattern

```ts
const handleSubmit = async () => {
  // 1. Validate form
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    toast.validationWarning()
    return
  }

  // 2. Submit
  isSubmitting.value = true
  try {
    const submitData: XxxFormData = {
      ...form.value,
      optionalField: form.value.optionalField || undefined,  // '' → undefined
    }

    if (isCreateMode.value) {
      await xxxService.create(submitData)
      toast.createSuccess()
    } else {
      await xxxService.update(entityId.value, submitData)
      toast.updateSuccess()
    }
    router.push({ name: ROUTE_NAMES.XXXS })  // Quay về list
  } catch (error: unknown) {
    toast.handleApiError(error)               // Hiển thị lỗi từ BE
  } finally {
    isSubmitting.value = false
  }
}
```

---

## Rule 8: Navigation Handlers

```ts
// Hủy → quay về list
const handleCancel = () => {
  router.push({ name: ROUTE_NAMES.XXXS })
}

// Detail mode → chuyển sang Edit
const handleEdit = () => {
  router.push({ name: ROUTE_NAMES.XXX_EDIT, params: { id: entityId.value } })
}
```

---

## Rule 9: Template Structure — Form Page

```html
<div v-loading="isLoading" class="space-y-6">
  <!-- Header: Breadcrumb + Nút Cập nhật (detail mode) -->
  <div class="flex items-center justify-between mb-2">
    <PageBreadcrumb
      class="mb-4"
      :icon="IconName"
      :items="[
        { label: '[Entity List]', to: { name: ROUTE_NAMES.XXXS } },
        { label: pageTitle },
      ]"
    />
    <el-button v-if="isDetailMode" type="primary" @click="handleEdit">Cập nhật</el-button>
  </div>

  <el-card shadow="never">
    <!-- Form -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="isReadonly ? undefined : rules"
      label-position="top"
      :disabled="isReadonly"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
        <!-- Form items -->
      </div>

      <!-- Full-width items (textarea) -->
      <el-form-item label="Mô tả" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>

    <!-- Sub-table: Related items (edit/detail mode only) -->
    <div v-if="(isEditMode || isDetailMode) && entityId" class="border-t pt-4 mt-4">
      <!-- Header + Nút Thêm -->
      <!-- el-table -->
    </div>

    <!-- Footer: Hủy + Lưu -->
    <div class="flex justify-end gap-3 mt-6 pt-6">
      <div v-if="!isDetailMode">
        <el-button @click="handleCancel">Hủy</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">Lưu</el-button>
      </div>
    </div>
  </el-card>
</div>

<!-- Dialogs (ngoài wrapper div) -->
<AddItemDialog v-model="showAddDialog" @confirmed="handleAdded" />
<ConfirmDialog v-model="showRemoveDialog" ... :on-confirm="onConfirmRemove" />
```

---

## Rule 10: Form Grid Layout

```html
<!-- 2 cột trên desktop, 1 cột trên mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
  <el-form-item label="..." prop="..."> <!-- Cột 1 --> </el-form-item>
  <el-form-item label="..." prop="..."> <!-- Cột 2 --> </el-form-item>
</div>

<!-- Full-width item (textarea, bảng...) — NGOÀI grid -->
<el-form-item label="Mô tả" prop="description">
  <el-input type="textarea" />
</el-form-item>
```

---

## Rule 11: Form Field Patterns

### Text Input
```html
<el-form-item label="Tên [entity]" prop="name">
  <el-input v-model="form.name" maxlength="100" show-word-limit />
</el-form-item>
```

### Code Input (uppercase, disabled khi edit)
```html
<el-form-item label="Mã [entity]" prop="code">
  <el-input
    v-model="form.code"
    maxlength="10"
    show-word-limit
    :disabled="isEditMode || isReadonly"
    @input="form.code = form.code.toUpperCase()"
  />
</el-form-item>
```

> Nếu code auto-generated bởi BE: **ẩn khi create** (`v-if="!isCreateMode"`), **luôn disabled** khi edit/detail.

### Select (filterable)
```html
<el-form-item label="..." prop="parentId">
  <el-select v-model="form.parentId" clearable filterable class="w-full">
    <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
  </el-select>
</el-form-item>
```

### Radio Group (status)
```html
<el-form-item label="Trạng thái" prop="status">
  <el-radio-group v-model="form.status" :disabled="false">
    <el-radio
      v-for="opt in statusOptions"
      :key="opt.value"
      :value="opt.value"
      :disabled="isCreateMode && opt.value === Status.INACTIVE"
    >
      {{ opt.label }}
    </el-radio>
  </el-radio-group>
</el-form-item>
```

> **Lưu ý**: Khi create, disable INACTIVE (chỉ cho phép Active). `:disabled="false"` trên radio-group để override form `:disabled="isReadonly"`.

### Textarea
```html
<el-form-item label="Mô tả" prop="description">
  <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
</el-form-item>
```

### Number Input
```html
<el-form-item label="Lương tối thiểu" prop="minSalary">
  <el-input-number v-model="form.minSalary" :min="0" :controls="false" class="w-full" />
</el-form-item>
```

---

## Rule 12: Sub-table (Related Items) — Edit/Detail Mode

```html
<div v-if="(isEditMode || isDetailMode) && entityId" class="border-t pt-4 mt-4">
  <div class="flex items-center justify-between mb-3">
    <h4 class="text-sm font-medium text-gray-700">Danh sách [related] thuộc [entity]</h4>
    <el-button v-if="isEditMode" type="primary" size="small" @click="showAddDialog = true">
      Thêm [related]
    </el-button>
  </div>

  <el-table
    :data="relatedItems"
    stripe
    :header-cell-style="{ backgroundColor: COLORS.TABLE_HEADER_BG }"
    :empty-text="TABLE_EMPTY_TEXT"
  >
    <el-table-column label="STT" width="60" align="center">
      <template #default="{ $index }">{{ $index + 1 }}</template>
    </el-table-column>
    <!-- Data columns -->
    <el-table-column v-if="isEditMode" label="Thao tác" width="80" align="center">
      <template #default="{ row }">
        <el-tooltip content="Xóa khỏi [entity]" placement="top">
          <el-button type="danger" link @click="handleRemove(row)">
            <el-icon :size="16"><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</div>
```

---

## Rule 13: Remove Item Flow (trong sub-table)

```ts
const showRemoveDialog = ref(false)
const removingItem = ref<RelatedItem | null>(null)

const handleRemove = (item: RelatedItem) => {
  removingItem.value = item
  showRemoveDialog.value = true
}

// ConfirmDialog xử lý loading/toast
const onConfirmRemove = async () => {
  if (!removingItem.value) return
  await relatedService.update(removingItem.value.id, { parentField: '' })
  await fetchRelatedItems()
}
```

**ConfirmDialog:**
```html
<ConfirmDialog
  v-model="showRemoveDialog"
  title="Xác nhận xóa"
  :message="`Bạn có chắc muốn xóa [related] '${removingItem?.code} - ${removingItem?.name}' khỏi [entity]?`"
  confirm-type="danger"
  :icon="Delete"
  :icon-color="COLORS.DANGER"
  :on-confirm="onConfirmRemove"
/>
```

---

## Rule 14: Add Item Dialog Pattern

```ts
const showAddDialog = ref(false)

const handleItemsAdded = async (addedItems: RelatedItem[]) => {
  try {
    await Promise.all(
      addedItems.map(item => relatedService.update(item.id, { parentField: entityId.value }))
    )
    toast.updateSuccess()
    await fetchRelatedItems()
  } catch {
    toast.updateError()
  }
}
```

```html
<AddItemDialog
  v-model="showAddDialog"
  :entity-id="entityId"
  @confirmed="handleItemsAdded"
/>
```

---

## Rule 15: AddItemDialog Component Pattern

```html
<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  entityId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirmed: [items: RelatedItem[]]
}>()

const isLoading = ref(false)
const items = ref<RelatedItem[]>([])
const selected = ref<RelatedItem[]>([])
const keyword = ref('')

const loadItems = async () => { /* search + filter */ }
const handleConfirm = () => { emit('confirmed', selected.value); handleClose() }
const handleClose = () => { emit('update:modelValue', false); selected.value = []; keyword.value = '' }

watch(() => props.modelValue, val => { if (val) loadItems() })
</script>

<template>
  <el-dialog :model-value="modelValue" title="Thêm [related]" width="680px" :close-on-click-modal="false" @close="handleClose">
    <!-- Search bar -->
    <!-- el-table with selection column -->
    <div class="mt-3 text-sm text-gray-500">
      Đã chọn: <span class="font-medium text-blue-600">{{ selected.length }}</span> [related]
    </div>
    <template #footer>
      <el-button @click="handleClose">Hủy</el-button>
      <el-button type="primary" :disabled="selected.length === 0" @click="handleConfirm">Xác nhận thêm</el-button>
    </template>
  </el-dialog>
</template>
```

---

## Rule 16: onMounted — Gọi tất cả fetch

```ts
onMounted(() => {
  fetchOptions()        // Load select options (luôn gọi)
  fetchEntity()         // Load entity data (skip khi create)
  fetchRelatedItems()   // Load sub-table data (skip khi create)
})
```

> Tất cả fetch functions tự kiểm tra `if (isCreateMode.value) return` bên trong.

---

## Shared Dependencies

| Import | From |
|---|---|
| `usePageMode` | `@/composables/usePageMode` |
| `useToast` | `@/composables/useToast` |
| `ROUTE_NAMES` | `@/constants/routes` |
| `Status, StatusLabel, enumToOptions` | `@/constants/enums` |
| `COLORS` | `@/constants/colors` |
| `TABLE_EMPTY_TEXT` | `@/constants` |
| `Delete, Guide` | `@/constants/icons` |
| `PageBreadcrumb` | `@/components/common/PageBreadcrumb.vue` |
| `ConfirmDialog` | `@/components/common/ConfirmDialog.vue` |
