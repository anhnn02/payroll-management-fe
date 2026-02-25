# Tài liệu FE — Module Vị trí làm việc (Position)

> **Tài liệu tham chiếu**: [HLD.md](./PM/HLD.md) | [BA - PAyroll_PYC_Update](./BA/PAyroll_PYC_Update.%206-2-2026.docx.md)
> **Ngày tạo**: 2026-02-25
> **Mục đích**: Hướng dẫn FE developer triển khai module Quản lý Vị trí làm việc (Position)
> **Phân quyền**: HR_MANAGER (CRUD) | ACCOUNTANT (chỉ xem)

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Data Model & Interfaces](#2-data-model--interfaces)
3. [API Endpoints](#3-api-endpoints)
4. [Validation Rules](#4-validation-rules)
5. [Màn hình & UI Components](#5-màn-hình--ui-components)
6. [Luồng nghiệp vụ (Flow)](#6-luồng-nghiệp-vụ-flow)
7. [Service Layer (Gọi API)](#7-service-layer-gọi-api)
8. [Router Configuration](#8-router-configuration)
9. [Enums & Constants](#9-enums--constants)
10. [Error Handling](#10-error-handling)
11. [Checklist triển khai](#11-checklist-triển-khai)

---

## 1. Tổng quan

### 1.1 Mô tả module

Module **Vị trí làm việc (Position)** cho phép quản lý danh mục chức danh và **khung lương cơ bản** (Min - Max) cho từng vị trí trong tổ chức.

### 1.2 Chức năng chính

| STT | Chức năng | Mô tả | Phân quyền |
|-----|-----------|-------|------------|
| 1 | Danh sách vị trí | Tìm kiếm, lọc, phân trang | HR_MANAGER, ACCOUNTANT |
| 2 | Xem chi tiết vị trí | Xem thông tin chi tiết + DS nhân viên | HR_MANAGER, ACCOUNTANT |
| 3 | Thêm vị trí | Tạo vị trí mới | HR_MANAGER |
| 4 | Sửa vị trí | Cập nhật thông tin + quản lý NV thuộc vị trí | HR_MANAGER |
| 5 | Xóa vị trí | Xóa vị trí (nếu không có nhân viên) | HR_MANAGER |

### 1.3 Quan hệ với các module khác

```
POSITION ──┬── có nhiều EMPLOYEE (1:N)
            └── liên kết HIRING_PLAN (AI module, 1:N)
```

> ⚠️ **Lưu ý quan trọng**: Không xóa được vị trí nếu còn nhân viên thuộc vị trí đó.

---

## 2. Data Model & Interfaces

### 2.1 Database Schema (từ HLD)

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `code` | VARCHAR(20) | Mã vị trí | UNIQUE, NOT NULL | - |
| `name` | VARCHAR(100) | Tên vị trí | NOT NULL | - |
| `description` | TEXT | Mô tả công việc | NULLABLE | NULL |
| `level` | VARCHAR(20) | Cấp bậc | NOT NULL | 'JUNIOR' |
| `status` | VARCHAR(20) | Trạng thái | NOT NULL | 'ACTIVE' |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `created_by` | VARCHAR(100) | Username người tạo | NOT NULL | - |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |
| `updated_by` | VARCHAR(100) | Username người cập nhật | NOT NULL | - |

**Enum Values**:
- `level`: `JUNIOR`, `MIDDLE`, `SENIOR`
- `status`: `ACTIVE`, `INACTIVE`

### 2.2 TypeScript Interfaces

```ts
// ===== Response Object =====
interface Position {
  id: string                 // UUID
  code: string               // Mã vị trí (auto-generated bởi BE)
  name: string               // Tên vị trí
  description?: string       // Mô tả (nullable)
  level: 'JUNIOR' | 'MIDDLE' | 'SENIOR'
  minSalary?: number         // Lương tối thiểu (VNĐ)
  maxSalary?: number         // Lương tối đa (VNĐ)
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string         // ISO timestamp
  createdBy?: string         // Username
  updatedAt?: string         // ISO timestamp
  updatedBy?: string         // Username
}

// ===== Search Request =====
interface PositionSearchRequest {
  keyword?: string           // Tìm theo code, name (LIKE search)
  status?: string            // Filter trạng thái
  level?: string             // Filter cấp bậc
  page: number               // Số trang (bắt đầu từ 0)
  size: number               // Số bản ghi mỗi trang (default: 10)
}

// ===== Form Data (Create/Update) =====
interface PositionFormData {
  name: string               // Bắt buộc, max 100 ký tự
  description?: string       // Tùy chọn, max 1000 ký tự
  minSalary: number          // Bắt buộc, >= 0
  maxSalary: number          // Bắt buộc, > minSalary
  status: 'ACTIVE' | 'INACTIVE'
}
```

> ⚠️ **Lưu ý**: Theo BA, trường **Mã vị trí** (code) được **auto-generated** bởi BE. FE không cần nhập mã khi thêm mới, nhưng sẽ hiển thị mã trong danh sách và form xem/chỉnh sửa.

---

## 3. API Endpoints

### 3.1 Tổng quan

| STT | Method | Endpoint | Mô tả | Auth |
|-----|--------|----------|-------|------|
| 1 | `POST` | `/api/v1/positions/search` | Tìm kiếm / Danh sách vị trí | ✅ |
| 2 | `GET` | `/api/v1/positions/{id}` | Chi tiết vị trí | ✅ |
| 3 | `POST` | `/api/v1/positions` | Tạo vị trí mới | ✅ HR_MANAGER |
| 4 | `PUT` | `/api/v1/positions/{id}` | Cập nhật vị trí | ✅ HR_MANAGER |
| 5 | `DELETE` | `/api/v1/positions/{id}` | Xóa vị trí | ✅ HR_MANAGER |

> ⚠️ **Quan trọng**: Danh sách dùng **`POST /search`** (không phải GET). Filter gửi trong **request body**.

### 3.2 Chi tiết từng API

#### 3.2.1 Search Positions

**`POST /api/v1/positions/search`**

**Request Body:**
```json
{
  "keyword": "dev",
  "status": "ACTIVE",
  "level": "SENIOR",
  "page": 0,
  "size": 10
}
```

> Tất cả filter fields đều **optional**. Chỉ `page` và `size` là **required**.

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-02-25T10:00:00Z",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "code": "VTLV001",
        "name": "Senior Developer",
        "description": "Phát triển phần mềm cấp cao",
        "level": "SENIOR",
        "minSalary": 25000000,
        "maxSalary": 45000000,
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2026-01-15T08:30:00Z",
        "updatedBy": "hr_manager"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### 3.2.2 Get Position by ID

**`GET /api/v1/positions/{id}`**

**Response (200 OK):** Tương tự từng item trong search response, wrapper trong `data`.

#### 3.2.3 Create Position

**`POST /api/v1/positions`**

**Request Body:**
```json
{
  "name": "Junior Designer",
  "description": "Thiết kế UI/UX cơ bản",
  "minSalary": 8000000,
  "maxSalary": 15000000,
  "status": "ACTIVE"
}
```

> **Lưu ý**: Không gửi `code`, BE auto-generate.

#### 3.2.4 Update Position

**`PUT /api/v1/positions/{id}`**

**Request Body:** Tương tự Create (code không được sửa, BE bỏ qua nếu gửi).

#### 3.2.5 Delete Position

**`DELETE /api/v1/positions/{id}`**

**Response (204 No Content):** Không có body.

**Error (400 Business Rule):**
```json
{
  "status": "ERROR",
  "code": "ERR_BUSINESS",
  "message": "Vị trí này đang có [n] nhân viên. Không thể xóa.",
  "timestamp": "2026-02-25T10:00:00Z",
  "errors": null
}
```

---

## 4. Validation Rules

### 4.1 Form Validation (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required | "Vui lòng nhập tên vị trí" |
| `name` | Max 100 ký tự | "Tên vị trí tối đa 100 ký tự" |
| `name` | Unique (BE validate) | "Tên vị trí đã tồn tại" |
| `minSalary` | Required | "Vui lòng nhập lương tối thiểu" |
| `minSalary` | Không âm (>= 0) | "Lương tối thiểu không được âm" |
| `maxSalary` | Required | "Vui lòng nhập lương tối đa" |
| `maxSalary` | > minSalary | "Lương tối đa phải lớn hơn lương tối thiểu" |
| `description` | Max 1000 ký tự | "Mô tả tối đa 1000 ký tự" |
| `status` | Required | "Vui lòng chọn trạng thái" |

### 4.2 Business Validation (BE-side)

| Rule | Error Message |
|------|---------------|
| `name` phải unique | "Tên vị trí đã tồn tại" |
| Không xóa nếu có nhân viên | "Vị trí này đang có [n] nhân viên. Không thể xóa." |

### 4.3 Ví dụ validation bằng Element Plus

```ts
import type { FormRules } from 'element-plus'

const rules: FormRules = {
  name: [
    { required: true, message: 'Vui lòng nhập tên vị trí', trigger: 'blur' },
    { max: 100, message: 'Tên vị trí tối đa 100 ký tự', trigger: 'blur' }
  ],
  minSalary: [
    { required: true, message: 'Vui lòng nhập lương tối thiểu', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value < 0) callback(new Error('Lương tối thiểu không được âm'))
        else callback()
      },
      trigger: 'blur'
    }
  ],
  maxSalary: [
    { required: true, message: 'Vui lòng nhập lương tối đa', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value <= form.value.minSalary) {
          callback(new Error('Lương tối đa phải lớn hơn lương tối thiểu'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  status: [
    { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }
  ]
}
```

---

## 5. Màn hình & UI Components

### 5.1 Danh sách vị trí (PositionListView)

**Route**: `/positions`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Quản lý tổ chức > Vị trí làm việc      │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Bộ lọc ──────────────────────────────────────────────┐      │
│  │  [Nhập mã vị trí, tên vị trí... ___________]          │      │
│  │  [Trạng thái ▼ ]    [🔍 Tìm kiếm] [↻ Đặt lại]       │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  [+ Thêm vị trí]                            (v-if HR_MANAGER)  │
│                                                                  │
│  ┌─ Bảng dữ liệu ───────────────────────────────────────┐      │
│  │ STT │ Mã VT │ Tên vị trí   │ Khung lương  │ TT  │ ⋮ │      │
│  │  1  │ VT001 │ Senior Dev   │ 25M - 45M    │ ●   │ ⋮ │      │
│  │  2  │ VT002 │ Junior Dev   │ 8M  - 15M    │ ●   │ ⋮ │      │
│  │  3  │ VT003 │ Designer     │ 10M - 20M    │ ○   │ ⋮ │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  [< 1 2 3 ... 5 >]           Hiển thị 1-10 / 45 bản ghi        │
└──────────────────────────────────────────────────────────────────┘
```

**Cột bảng dữ liệu:**

| Cột | Field | Width | Mô tả |
|-----|-------|-------|-------|
| STT | - | 60px | Số thứ tự |
| Mã vị trí | `code` | 120px | Hiển thị text |
| Tên vị trí | `name` | auto | Hiển thị text |
| Khung lương | `minSalary` - `maxSalary` | 200px | Format: `[Min] - [Max] VNĐ` |
| Mô tả | `description` | 200px | Truncate nếu dài |
| Trạng thái | `status` | 120px | Tag: ACTIVE = xanh, INACTIVE = xám |
| Thao tác | - | 150px | Xem, Sửa, Xóa |

**Thao tác:**

| Action | Icon | Phân quyền |
|--------|------|------------|
| Xem | 👁️ `View` | ALL |
| Sửa | ✏️ `Edit` | HR_MANAGER |
| Xóa | 🗑️ `Delete` | HR_MANAGER |

---

### 5.2 Form Thêm/Sửa vị trí (PositionFormView)

**Route**:
- Thêm mới: `/positions/create`
- Chỉnh sửa: `/positions/:id/edit`
- Xem chi tiết: `/positions/:id`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Vị trí làm việc > Thêm mới             │
│                                                    [Cập nhật]    │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Thông tin vị trí ─────────────────────────────────────┐      │
│  │                                                        │      │
│  │  Mã vị trí           [________________]  (auto/readonly)│     │
│  │  Tên vị trí *        [________________]                │      │
│  │                                                        │      │
│  │  Lương tối thiểu *   [________________] VNĐ            │      │
│  │  Lương tối đa *      [________________] VNĐ            │      │
│  │                                                        │      │
│  │  Mô tả công việc     [________________]                │      │
│  │                       [________________] (textarea)     │      │
│  │                                                        │      │
│  │  Trạng thái *         (●) Hoạt động  (○) Ngừng HĐ     │      │
│  │                                                        │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│                     [Hủy bỏ]    [💾 Lưu]                        │
│                                                                  │
│  ── Danh sách nhân viên thuộc vị trí (edit/detail mode) ──      │
│  [+ Thêm nhân viên]                         (chỉ edit mode)    │
│  ┌───────────────────────────────────────────────────────┐      │
│  │ STT │ Mã NV  │ Tên NV      │ Vị trí  │ TT   │ Xóa  │      │
│  │  1  │ NV001  │ Nguyễn Văn A│ Senior  │ ●    │ 🗑️   │      │
│  │  2  │ NV002  │ Trần Văn B  │ Junior  │ ●    │ 🗑️   │      │
│  └───────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Component | Placeholder | Disabled khi | Ghi chú |
|-------|-----------|-------------|-------------|---------|
| Mã vị trí | `el-input` | - | Luôn disabled | Auto-gen bởi BE, ẩn khi create |
| Tên vị trí | `el-input` | "Nhập tên vị trí" | View mode | `maxlength="100"` |
| Lương tối thiểu | `el-input-number` | - | View mode | Format dấu `,`, min=0 |
| Lương tối đa | `el-input-number` | - | View mode | Format dấu `,`, phải > Min |
| Mô tả | `el-input` textarea | "Nhập mô tả công việc" | View mode | `maxlength="1000"`, rows=3 |
| Trạng thái | `el-radio-group` | - | Create: disable INACTIVE | Default: ACTIVE |

**Danh sách nhân viên thuộc vị trí (edit/detail):**

| Cột | Field | Width | Mô tả |
|-----|-------|-------|-------|
| STT | - | 60px | Số thứ tự |
| Mã nhân viên | `code` | 140px | |
| Tên nhân viên | `name` | auto | |
| Vị trí làm việc | `positionName` | 180px | |
| Trạng thái | `status` | 140px | Tag theo EMPLOYEE_STATUS_TAG_TYPE |
| Thao tác | - | 80px | Icon xóa (chỉ edit mode) |

**Xóa NV khỏi vị trí** (BA):
- Hiển thị ConfirmDialog: "Bạn có chắc muốn xóa nhân viên khỏi vị trí này? [Mã NV] [Tên NV]"
- API: `employeeService.update(empId, { positionId: '' })`

**Thêm NV vào vị trí** (BA):
- Hiển thị dialog danh sách NV chưa có vị trí
- API: `employeeService.update(empId, { positionId: positionId })`

---

### 5.3 Các trạng thái màn hình

| Mode | Route | Điều kiện | Nút bấm | Form |
|------|-------|-----------|---------|------|
| **Danh sách** | `/positions` | - | Thêm mới | - |
| **Thêm mới** | `/positions/create` | HR_MANAGER | Lưu, Hủy | Editable |
| **Xem chi tiết** | `/positions/:id` | ALL | Cập nhật (if HR_MANAGER) | Readonly |
| **Chỉnh sửa** | `/positions/:id/edit` | HR_MANAGER | Lưu, Hủy | Editable (code disabled) |

---

## 6. Luồng nghiệp vụ (Flow)

### 6.1 Flow Tìm kiếm

```
1. User mở trang Danh sách Vị trí
2. FE gọi POST /positions/search { status: 'ACTIVE', page: 0, size: 10 }
3. BE trả về danh sách vị trí (paginated)
4. FE render bảng dữ liệu

--- Khi user thay đổi filter ---
5. User nhập keyword, chọn trạng thái
6. User nhấn "Tìm kiếm"
7. FE gọi POST /positions/search với filter + reset page = 0
8. FE render lại bảng
```

### 6.2 Flow Thêm mới

```
1. User nhấn "Thêm vị trí" → Navigate /positions/create
2. FE hiển thị form trống (ẩn field Mã vị trí)
3. User điền form: tên, lương min/max, mô tả, trạng thái
4. User nhấn "Lưu"
5. FE validate form:
   - Tên bắt buộc, max 100 ký tự
   - Lương min >= 0, lương max > lương min
6. Nếu valid → FE gọi POST /positions { name, minSalary, maxSalary, description, status }
7. Thành công → toast.createSuccess() → Navigate /positions
8. Lỗi → toast.handleApiError(error)
```

### 6.3 Flow Chỉnh sửa

```
1. User nhấn icon "Sửa" trên row → Navigate /positions/:id/edit
2. FE gọi GET /positions/{id} để load dữ liệu
3. FE fill form + load DS nhân viên thuộc vị trí
4. User chỉnh sửa (code disabled)
5. User nhấn "Lưu"
6. FE validate form
7. FE gọi PUT /positions/{id}
8. Thành công → toast.updateSuccess() → Navigate /positions
9. Lỗi → toast.handleApiError(error)

--- Quản lý nhân viên ---
10. User có thể thêm/xóa NV thuộc vị trí
11. Xóa NV: ConfirmDialog → employeeService.update(empId, { positionId: '' })
12. Thêm NV: AddEmployeeDialog → employeeService.update(empId, { positionId })
```

### 6.4 Flow Xóa

```
1. User nhấn icon "Xóa" trên row
2. FE hiển thị ConfirmDialog:
   "Bạn có chắc muốn xóa vị trí '[CODE] - [NAME]'?"
   [Hủy] [Xác nhận]
3. User nhấn "Xác nhận"
4. FE gọi DELETE /positions/{id}
5. Thành công → toast.deleteSuccess() → Reload danh sách
6. Lỗi (có NV) → toast hiển thị: "Vị trí này đang có [n] nhân viên. Không thể xóa."
```

### 6.5 Flow Cảnh báo lương (BA đặc biệt)

> Khi sửa khung lương (minSalary/maxSalary), sau khi lưu, BE quét danh sách NV thuộc vị trí. Nếu lương thực tế nằm ngoài khung mới → Backend đẩy cảnh báo (Alert) cho HR Manager.

---

## 7. Service Layer (Gọi API)

### 7.1 File: `src/services/position.service.ts`

```ts
import { useApi } from '@/composables/useApi'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface Position {
  id: string
  code: string
  name: string
  description?: string
  level: 'JUNIOR' | 'MIDDLE' | 'SENIOR'
  minSalary?: number
  maxSalary?: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface PositionSearchRequest {
  keyword?: string
  status?: string
  level?: string
  page: number
  size: number
}

export interface PositionFormData {
  name: string
  description?: string
  minSalary: number
  maxSalary: number
  status: 'ACTIVE' | 'INACTIVE'
}

export const positionService = {
  async search(data: PositionSearchRequest): Promise<PaginatedResponse<Position>> {
    const api = useApi()
    const response = await api.post<PaginatedResponse<Position>>(
      API_ENDPOINTS.POSITIONS.SEARCH,
      data
    )
    return response.data as PaginatedResponse<Position>
  },

  async getById(id: string): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.get<Position>(API_ENDPOINTS.POSITIONS.DETAIL(id))
  },

  async create(data: PositionFormData): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.post<Position>(API_ENDPOINTS.POSITIONS.CREATE, data)
  },

  async update(id: string, data: PositionFormData): Promise<ApiResponse<Position>> {
    const api = useApi()
    return api.put<Position>(API_ENDPOINTS.POSITIONS.UPDATE(id), data)
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const api = useApi()
    return api.del<null>(API_ENDPOINTS.POSITIONS.DELETE(id))
  },
}
```

### 7.2 Cách sử dụng trong Vue Component

```ts
// Pattern thống nhất với DepartmentListView
async function fetchPositions() {
  isLoading.value = true
  try {
    const response = await positionService.search({
      keyword: searchKeyword.value || undefined,
      status: filterStatus.value || undefined,
      page: pageForApi(),
      size: pageSize.value,
    })
    positions.value = response.content
    total.value = response.totalElements
  } catch {
    toast.loadError()
  } finally {
    isLoading.value = false
  }
}

// Delete qua ConfirmDialog (pattern từ DepartmentListView)
const onConfirmDelete = async () => {
  if (!deletingPosition.value) return
  await positionService.delete(deletingPosition.value.id)
  fetchPositions()
}
```

---

## 8. Router Configuration

```ts
// src/router — Position routes
const positionRoutes = [
  {
    path: '/positions',
    name: 'PositionList',
    component: () => import('@/views/positions/PositionListView.vue'),
    meta: {
      title: 'Quản lý vị trí',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],
    }
  },
  {
    path: '/positions/create',
    name: 'PositionCreate',
    component: () => import('@/views/positions/PositionFormView.vue'),
    meta: {
      title: 'Thêm vị trí',
      roles: ['HR_MANAGER'],
      activeMenu: '/positions'
    }
  },
  {
    path: '/positions/:id',
    name: 'PositionDetail',
    component: () => import('@/views/positions/PositionFormView.vue'),
    meta: {
      title: 'Chi tiết vị trí',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],
      activeMenu: '/positions'
    }
  },
  {
    path: '/positions/:id/edit',
    name: 'PositionEdit',
    component: () => import('@/views/positions/PositionFormView.vue'),
    meta: {
      title: 'Chỉnh sửa vị trí',
      roles: ['HR_MANAGER'],
      activeMenu: '/positions'
    }
  }
]
```

**Cấu trúc thư mục Vue:**

```
src/views/positions/
├── PositionListView.vue        # Màn hình danh sách + filter + table
├── PositionFormView.vue        # Form (dùng chung Create/Edit/Detail)
├── components/
│   └── AddEmployeeDialog.vue   # Dialog thêm NV vào vị trí (tương tự dept)
├── types.ts                    # Position, PositionFormData, PositionSearchRequest
└── constants.ts                # POSITION_LEVEL_LABELS, etc.
```

---

## 9. Enums & Constants

### 9.1 Position-specific constants

```ts
// src/views/positions/constants.ts

export const POSITION_LEVEL_LABELS: Record<string, string> = {
  JUNIOR: 'Cấp dưới',
  MIDDLE: 'Cấp trung',
  SENIOR: 'Cấp cao',
}

export const POSITION_LEVEL_TAG_TYPE: Record<string, string> = {
  JUNIOR: 'info',
  MIDDLE: '',
  SENIOR: 'success',
}
```

### 9.2 Format lương

```ts
// Hiển thị format: "25,000,000 - 45,000,000 VNĐ"
const formatSalaryRange = (min?: number, max?: number): string => {
  if (!min && !max) return '-'
  const fmt = (n: number) => n.toLocaleString('vi-VN')
  return `${fmt(min || 0)} - ${fmt(max || 0)} VNĐ`
}
```

### 9.3 Reuse từ global constants

- `Status`, `StatusLabel` từ `@/constants/enums`
- `TABLE_EMPTY_TEXT` từ `@/constants/table`
- `COLORS` từ `@/constants/colors`
- `usePagination` từ `@/composables/usePagination`
- `usePageMode` từ `@/composables/usePageMode`
- `useToast` từ `@/composables/useToast`
- `ConfirmDialog` từ `@/components/common/ConfirmDialog.vue`
- `PageBreadcrumb` từ `@/components/common/PageBreadcrumb.vue`

---

## 10. Error Handling

### 10.1 Pattern thống nhất (giống Department)

| Tình huống | Xử lý |
|---|---|
| Load data thất bại | `toast.loadError()` |
| Tạo mới thành công | `toast.createSuccess()` |
| Cập nhật thành công | `toast.updateSuccess()` |
| Xóa thành công | `toast.deleteSuccess()` (qua ConfirmDialog toastType) |
| Xóa thất bại | `toast.deleteError()` (qua ConfirmDialog toastType) |
| Submit lỗi (create/update) | `toast.handleApiError(error)` |
| Validation lỗi | `toast.validationWarning()` |

### 10.2 Business errors đặc biệt

| Error | Response | Hiển thị |
|-------|----------|---------|
| Xóa vị trí có NV | 400 ERR_BUSINESS | BE message: "Vị trí này đang có [n] nhân viên..." |
| Tên trùng | 400 ERR_VALIDATION | Field-level error dưới input |

---

## 11. Checklist triển khai

### Phase 1: Cấu trúc cơ bản

- [ ] Tạo folder `src/views/positions/`
- [ ] Tạo `types.ts` — Position, PositionFormData, PositionSearchRequest
- [ ] Tạo `constants.ts` — POSITION_LEVEL_LABELS, POSITION_LEVEL_TAG_TYPE
- [ ] Cập nhật `position.service.ts` — thêm PositionFormData, cập nhật types
- [ ] Cập nhật router — thêm position routes
- [ ] Cập nhật `@/constants/routes.ts` — thêm POSITION route names

### Phase 2: Danh sách (PositionListView)

- [ ] Breadcrumb
- [ ] Search bar (keyword) + filter trạng thái
- [ ] Button "Thêm vị trí" (HR_MANAGER)
- [ ] Bảng dữ liệu với các cột theo spec
- [ ] Format khung lương: `[Min] - [Max] VNĐ`
- [ ] Cột thao tác: Xem, Sửa, Xóa
- [ ] Phân trang (usePagination)
- [ ] ConfirmDialog cho xóa (toastType='delete')

### Phase 3: Form (PositionFormView)

- [ ] usePageMode (create/edit/detail)
- [ ] Form fields: name, minSalary, maxSalary, description, status
- [ ] Validation rules (element-plus)
- [ ] Load data khi edit/detail (fetchPosition)
- [ ] Submit create/update
- [ ] Code field: ẩn khi create, disabled khi edit/detail

### Phase 4: Quản lý NV thuộc vị trí

- [ ] Danh sách nhân viên (edit/detail mode)
- [ ] AddEmployeeDialog (tương tự department)
- [ ] Xóa NV khỏi vị trí (ConfirmDialog + employeeService.update)
- [ ] Thêm NV vào vị trí (AddEmployeeDialog + employeeService.update)

### Phase 5: Polish

- [ ] Loading states (v-loading)
- [ ] Empty states (TABLE_EMPTY_TEXT)
- [ ] Error handling thống nhất (useToast shortcuts)
- [ ] Responsive layout
- [ ] Test tất cả flows: CRUD, search, phân trang, xóa có NV
