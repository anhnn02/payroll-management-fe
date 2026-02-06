# Development Guidelines - Payroll Management Portal

## 📋 Quy Tắc Chung

| Rule | Mô tả |
|------|-------|
| **Code**: English | Variable, function names viết bằng tiếng Anh |
| **UI Text**: Vietnamese | Labels, buttons, messages hiển thị tiếng Việt |
| **TypeScript**: Strict | Luôn define types/interfaces, không dùng `any` |
| **Style**: Composables | Ưu tiên dùng composables, không dùng class |

---

## 📁 Folder Structure

```
src/
├── api/                    # HTTP src/
│   └── http.ts             # Class-based HTTP client
├── assets/
│   └── main.css
├── components/
│   ├── common/             # Reusable UI (PageHeader, ConfirmDialog...)
│   └── layout/             # Layout components
├── composables/            # Vue composables (useApi, usePagination...)
├── constants/              # Enums, constants
│   ├── index.ts            # Re-export all
│   ├── storage.ts          # STORAGE_KEYS
│   └── http.ts             # HTTP_STATUS
├── router/
│   └── index.ts
├── services/               # API services per resource
│   └── account.service.ts
├── stores/                 # Pinia stores
│   └── auth.ts
├── types/                  # TypeScript interfaces
│   ├── index.ts            # Re-export all
│   ├── api.ts              # ApiResponse, PaginatedResponse
│   └── account.ts          # Account interface
├── utils/                  # Helper functions
│   └── validators.ts
└── views/                  # Page components (đổi từ pages/)
    └── accounts/
        ├── AccountListView.vue
        └── AccountFormView.vue
```

---

## 🔧 Naming Conventions

### Files
| Type | Pattern | Example |
|------|---------|---------|
| View/Page | `{Resource}{Action}View.vue` | `AccountListView.vue`, `AccountFormView.vue` |
| Common Component | `{Name}.vue` (PascalCase) | `PageHeader.vue`, `SearchInput.vue` |
| Service | `{resource}.service.ts` | `account.service.ts` |
| Type | `{resource}.ts` | `account.ts` |
| Composable | `use{Name}.ts` | `useApi.ts`, `usePagination.ts` |

### Variables/Functions
```typescript
// ✅ Good
const isLoading = ref(false)
const currentPage = ref(1)
const handleSubmit = async () => {}
const fetchAccounts = async () => {}

// ❌ Bad
const loading = ref(false)     // Thiếu prefix is/has
const page = ref(1)            // Không rõ nghĩa
const submit = async () => {}  // Thiếu prefix handle/on
```

---

## 📝 Type Definitions

### API Response
```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}
```

### Entity Interface
```typescript
// types/account.ts
export interface Account {
  id: number
  username: string
  email: string
  fullName: string
  role: AccountRole
  status: AccountStatus
  createdAt: string
  updatedAt: string
}

export type AccountRole = 'ACCOUNTANT' | 'HR'
export type AccountStatus = 'ACTIVE' | 'INACTIVE'

// Form type (omit auto-generated fields)
export type AccountFormData = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
```

---

## 🔢 Constants & Enums

```typescript
// constants/storage.ts
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
} as const

// constants/http.ts
export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
} as const

// constants/pagination.ts
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
```

---

## 🛣️ Routing Pattern

```typescript
// router/index.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/accounts/AccountListView.vue'),
    meta: { requiresAuth: true, title: 'Quản lý tài khoản' },
  },
  {
    path: '/accounts/create',
    name: 'account-create',
    component: () => import('@/views/accounts/AccountFormView.vue'),
    meta: { requiresAuth: true, title: 'Thêm tài khoản' },
  },
  {
    path: '/accounts/:id/edit',
    name: 'account-edit',
    component: () => import('@/views/accounts/AccountFormView.vue'),
    meta: { requiresAuth: true, title: 'Sửa tài khoản' },
  },
]
```

---

## 📊 List View Pattern

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Account } from '@/types'

// State
const accounts = ref<Account[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

// Fetch data
const fetchAccounts = async () => {
  isLoading.value = true
  try {
    const response = await accountService.getList({ page: currentPage.value })
    accounts.value = response.data
    totalPages.value = response.meta.lastPage
  } finally {
    isLoading.value = false
  }
}

// Actions
const handleCreate = () => router.push({ name: 'account-create' })
const handleEdit = (account: Account) => router.push({ name: 'account-edit', params: { id: account.id } })
const handleDelete = async (account: Account) => {
  // Show confirm dialog, then delete
}

onMounted(fetchAccounts)
</script>
```

---

## 📝 Form View Pattern

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AccountFormData } from '@/types'

const route = useRoute()
const router = useRouter()

// Mode detection
const isEditMode = computed(() => !!route.params.id)
const pageTitle = computed(() => isEditMode.value ? 'Sửa tài khoản' : 'Thêm tài khoản')

// Form state
const form = ref<AccountFormData>({
  username: '',
  email: '',
  fullName: '',
  role: 'HR',
  status: 'ACTIVE',
})
const isSubmitting = ref(false)

// Load data for edit mode
onMounted(async () => {
  if (isEditMode.value) {
    const response = await accountService.getById(route.params.id as string)
    form.value = response.data
  }
})

// Submit
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      await accountService.update(route.params.id as string, form.value)
    } else {
      await accountService.create(form.value)
    }
    ElMessage.success(isEditMode.value ? 'Cập nhật thành công' : 'Thêm mới thành công')
    router.push({ name: 'accounts' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

---

## ✅ Checklist Khi Tạo CRUD Mới

- [ ] Tạo type/interface trong `types/{resource}.ts`
- [ ] Tạo service trong `services/{resource}.service.ts`
- [ ] Tạo `{Resource}ListView.vue` với table + pagination
- [ ] Tạo `{Resource}FormView.vue` với validation
- [ ] Thêm routes trong `router/index.ts`
- [ ] Thêm menu item trong Sidebar
- [ ] Test: List, Create, Edit, Delete
