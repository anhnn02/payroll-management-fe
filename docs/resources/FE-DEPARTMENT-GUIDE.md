# Tài liệu FE — Module Phòng ban (Department)

> **Tài liệu tham chiếu**: [HLD.md](./04-HLD/HLD.md) | [API_SPECIFICATIONS.md](./06-DD/API_SPECIFICATIONS.md) | [FE-API-CONFIG.md](./FE-API-CONFIG.md)
> **Ngày tạo**: 2026-02-18
> **Mục đích**: Hướng dẫn FE developer triển khai module Quản lý Phòng ban (Department)
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
9. [Phân quyền (RBAC)](#9-phân-quyền-rbac)
10. [Enums & Constants](#10-enums--constants)
11. [Error Handling](#11-error-handling)
12. [Checklist triển khai](#12-checklist-triển-khai)

---

## 1. Tổng quan

### 1.1 Mô tả module

Module **Phòng ban (Department)** cho phép quản lý danh mục phòng ban trong tổ chức. Phòng ban hỗ trợ cấu trúc **phòng ban cha - con** (parent-child) để tổ chức theo dạng cây.

### 1.2 Chức năng chính

| STT | Chức năng | Mô tả | Phân quyền |
|-----|-----------|-------|------------|
| 1 | Danh sách phòng ban | Tìm kiếm, lọc, phân trang | HR_MANAGER, ACCOUNTANT |
| 2 | Xem chi tiết phòng ban | Xem thông tin chi tiết | HR_MANAGER, ACCOUNTANT |
| 3 | Thêm phòng ban | Tạo phòng ban mới | HR_MANAGER |
| 4 | Sửa phòng ban | Cập nhật thông tin phòng ban | HR_MANAGER |
| 5 | Xóa phòng ban | Xóa phòng ban (nếu không có nhân viên) | HR_MANAGER |

### 1.3 Quan hệ với các module khác

```
DEPARTMENT ──┬── có nhiều EMPLOYEE (1:N)
             ├── có phòng ban con DEPARTMENT (self-reference, 1:N)
             └── liên kết HIRING_PLAN (AI module, 1:N)
```

> ⚠️ **Lưu ý quan trọng**: Không xóa được phòng ban nếu còn nhân viên thuộc phòng ban đó.

---

## 2. Data Model & Interfaces

### 2.1 Database Schema

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `code` | VARCHAR(20) | Mã phòng ban | UNIQUE, NOT NULL | - |
| `name` | VARCHAR(100) | Tên phòng ban | NOT NULL | - |
| `description` | TEXT | Mô tả | NULLABLE | NULL |
| `parent_id` | UUID | FK đến department cha | FK, NULLABLE | NULL |
| `status` | VARCHAR(20) | Trạng thái | NOT NULL | 'ACTIVE' |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `created_by` | VARCHAR(100) | Username người tạo | NOT NULL | - |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |
| `updated_by` | VARCHAR(100) | Username người cập nhật | NOT NULL | - |

### 2.2 TypeScript Interfaces

```ts
// ===== Response Object =====
interface Department {
  id: string                 // UUID
  code: string               // Mã phòng ban (VD: "IT", "HR", "FIN")
  name: string               // Tên phòng ban
  description?: string       // Mô tả (nullable)
  parentId?: string          // UUID phòng ban cha (nullable)
  parentName?: string        // Tên phòng ban cha (BE trả thêm, nullable)
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string          // ISO timestamp
  createdBy: string          // Username
  updatedAt: string          // ISO timestamp
  updatedBy: string          // Username
}

// ===== Search Request =====
interface DepartmentSearchRequest {
  code?: string              // Filter theo mã (LIKE search)
  name?: string              // Filter theo tên (LIKE search)
  status?: 'ACTIVE' | 'INACTIVE'  // Filter trạng thái
  page: number               // Số trang (bắt đầu từ 0)
  size: number               // Số bản ghi mỗi trang (default: 10)
  sort?: string              // Sắp xếp (VD: "name,asc", "createdAt,desc")
}

// ===== Create Request =====
interface DepartmentCreateRequest {
  code: string               // Bắt buộc, unique, 1-20 ký tự
  name: string               // Bắt buộc, 1-100 ký tự
  description?: string       // Tùy chọn
  parentId?: string          // Tùy chọn — UUID phòng ban cha
  status: 'ACTIVE' | 'INACTIVE'  // Bắt buộc
}

// ===== Update Request =====
// Tương tự CreateRequest (gửi toàn bộ fields cần cập nhật)
type DepartmentUpdateRequest = DepartmentCreateRequest

// ===== Paginated Response =====
interface DepartmentPageResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: {
    content: Department[]
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// ===== Single Response =====
interface DepartmentResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: Department
}
```

---

## 3. API Endpoints

### 3.1 Tổng quan

| STT | Method | Endpoint | Mô tả | Auth |
|-----|--------|----------|-------|------|
| 1 | `POST` | `/api/v1/departments/search` | Tìm kiếm / Danh sách phòng ban | ✅ |
| 2 | `GET` | `/api/v1/departments/{id}` | Chi tiết phòng ban | ✅ |
| 3 | `POST` | `/api/v1/departments` | Tạo phòng ban mới | ✅ HR_MANAGER |
| 4 | `PUT` | `/api/v1/departments/{id}` | Cập nhật phòng ban | ✅ HR_MANAGER |
| 5 | `DELETE` | `/api/v1/departments/{id}` | Xóa phòng ban | ✅ HR_MANAGER |

> ⚠️ **Quan trọng**: Danh sách dùng **`POST /search`** (không phải GET). Filter gửi trong **request body**.

### 3.2 Chi tiết từng API

#### 3.2.1 Search Departments

**`POST /api/v1/departments/search`**

**Request Body:**
```json
{
  "code": "IT",
  "name": "Công nghệ",
  "status": "ACTIVE",
  "page": 0,
  "size": 10,
  "sort": "name,asc"
}
```

> Tất cả filter fields đều **optional**. Chỉ `page` và `size` là **required**.

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-02-18T10:00:00Z",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "code": "IT",
        "name": "Phòng Công nghệ thông tin",
        "description": "Phòng IT, phần mềm",
        "parentId": null,
        "parentName": null,
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2026-01-15T08:30:00Z",
        "updatedBy": "hr_manager"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "code": "HR",
        "name": "Phòng Nhân sự",
        "description": "Quản lý nhân sự",
        "parentId": null,
        "parentName": null,
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2026-01-01T00:00:00Z",
        "updatedBy": "admin"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

---

#### 3.2.2 Get Department by ID

**`GET /api/v1/departments/{id}`**

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-02-18T10:00:00Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "code": "IT",
    "name": "Phòng Công nghệ thông tin",
    "description": "Phòng IT, phần mềm",
    "parentId": null,
    "parentName": null,
    "status": "ACTIVE",
    "createdAt": "2026-01-01T00:00:00Z",
    "createdBy": "admin",
    "updatedAt": "2026-01-15T08:30:00Z",
    "updatedBy": "hr_manager"
  }
}
```

**Error (404 Not Found):**
```json
{
  "status": "ERROR",
  "code": "ERR_NOT_FOUND",
  "message": "Phòng ban không tồn tại",
  "timestamp": "2026-02-18T10:00:00Z",
  "errors": null
}
```

---

#### 3.2.3 Create Department

**`POST /api/v1/departments`**

**Request Body:**
```json
{
  "code": "MKT",
  "name": "Phòng Marketing",
  "description": "Phòng tiếp thị và truyền thông",
  "parentId": null,
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "Tạo phòng ban thành công",
  "timestamp": "2026-02-18T10:00:00Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "code": "MKT",
    "name": "Phòng Marketing",
    "description": "Phòng tiếp thị và truyền thông",
    "parentId": null,
    "parentName": null,
    "status": "ACTIVE",
    "createdAt": "2026-02-18T10:00:00Z",
    "createdBy": "hr_manager",
    "updatedAt": "2026-02-18T10:00:00Z",
    "updatedBy": "hr_manager"
  }
}
```

**Error (400 Validation):**
```json
{
  "status": "ERROR",
  "code": "ERR_VALIDATION",
  "message": "Validation failed",
  "timestamp": "2026-02-18T10:00:00Z",
  "errors": [
    { "field": "code", "message": "Mã phòng ban đã tồn tại" },
    { "field": "name", "message": "Tên phòng ban không được để trống" }
  ]
}
```

---

#### 3.2.4 Update Department

**`PUT /api/v1/departments/{id}`**

**Request Body:** (tương tự Create)
```json
{
  "code": "MKT",
  "name": "Phòng Marketing & Truyền thông",
  "description": "Phòng tiếp thị, truyền thông và đối ngoại",
  "parentId": null,
  "status": "ACTIVE"
}
```

**Response (200 OK):** Tương tự Create response

---

#### 3.2.5 Delete Department

**`DELETE /api/v1/departments/{id}`**

**Response (204 No Content):** Không có body

**Error (400 Business Rule):**
```json
{
  "status": "ERROR",
  "code": "ERR_BUSINESS",
  "message": "Không thể xóa phòng ban vì còn nhân viên thuộc phòng ban này",
  "timestamp": "2026-02-18T10:00:00Z",
  "errors": null
}
```

---

## 4. Validation Rules

### 4.1 Form Validation (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `code` | Required | "Vui lòng nhập mã phòng ban" |
| `code` | Max 20 ký tự | "Mã phòng ban tối đa 20 ký tự" |
| `code` | Chỉ chữ cái IN HOA, số, gạch dưới | "Mã phòng ban chỉ gồm chữ IN HOA, số và gạch dưới" |
| `name` | Required | "Vui lòng nhập tên phòng ban" |
| `name` | Max 100 ký tự | "Tên phòng ban tối đa 100 ký tự" |
| `description` | Max 500 ký tự (khuyến nghị) | "Mô tả tối đa 500 ký tự" |
| `status` | Required | "Vui lòng chọn trạng thái" |
| `parentId` | Nếu có, phải là UUID hợp lệ | "Phòng ban cha không hợp lệ" |

### 4.2 Business Validation (BE-side)

| Rule | Error Message |
|------|---------------|
| `code` phải unique | "Mã phòng ban đã tồn tại" |
| `parentId` phải tồn tại trong DB | "Phòng ban cha không tồn tại" |
| Không được self-reference (`parentId != id`) | "Phòng ban không thể là cha của chính nó" |
| Không xóa nếu có nhân viên | "Không thể xóa phòng ban vì còn nhân viên thuộc phòng ban này" |
| Không xóa nếu có phòng ban con | "Không thể xóa phòng ban vì còn phòng ban con" |

### 4.3 Ví dụ validation bằng Element Plus

```ts
import type { FormRules } from 'element-plus'

const rules: FormRules = {
  code: [
    { required: true, message: 'Vui lòng nhập mã phòng ban', trigger: 'blur' },
    { max: 20, message: 'Mã phòng ban tối đa 20 ký tự', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9_]+$/,
      message: 'Mã phòng ban chỉ gồm chữ IN HOA, số và gạch dưới',
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: 'Vui lòng nhập tên phòng ban', trigger: 'blur' },
    { max: 100, message: 'Tên phòng ban tối đa 100 ký tự', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }
  ]
}
```

---

## 5. Màn hình & UI Components

### 5.1 Danh sách phòng ban (DepartmentList)

**Route**: `/departments`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Quản lý tổ chức > Phòng ban            │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Bộ lọc ──────────────────────────────────────────────┐      │
│  │  [Mã PB ___________]  [Tên PB ___________]            │      │
│  │  [Trạng thái ▼ ]    [🔍 Tìm kiếm] [↻ Đặt lại]       │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  [+ Thêm phòng ban]                          (v-if HR_MANAGER)  │
│                                                                  │
│  ┌─ Bảng dữ liệu ───────────────────────────────────────┐      │
│  │ STT │ Mã PB │ Tên phòng ban  │ PB Cha │ Trạng thái │ TT │  │
│  │  1  │ IT    │ Phòng CNTT     │  -     │  ● Active  │ ⋮  │  │
│  │  2  │ HR    │ Phòng Nhân sự  │  -     │  ● Active  │ ⋮  │  │
│  │  3  │ FIN   │ Phòng Tài chính│  -     │  ○ Inactive│ ⋮  │  │
│  │  4  │ DEV   │ Phòng Dev      │ IT     │  ● Active  │ ⋮  │  │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  [< 1 2 3 ... 5 >]           Hiển thị 1-10 / 45 bản ghi        │
└──────────────────────────────────────────────────────────────────┘
```

**Cột bảng dữ liệu:**

| Cột | Field | Width | Sortable | Mô tả |
|-----|-------|-------|----------|-------|
| STT | - | 60px | ❌ | Số thứ tự (tính từ page * size + index + 1) |
| Mã PB | `code` | 120px | ✅ | Hiển thị text |
| Tên phòng ban | `name` | auto | ✅ | Hiển thị text |
| Mô tả | `description` | 200px | ❌ | Hiển thị text, truncate nếu dài |
| Phòng ban cha | `parentName` | 150px | ❌ | Hiển thị tên PB cha, hoặc "-" nếu null |
| Trạng thái | `status` | 120px | ✅ | Tag: ACTIVE = xanh, INACTIVE = xám |
| Thao tác | - | 150px | ❌ | Dropdown/Buttons: Xem, Sửa, Xóa |

**Thao tác (Action column):**

| Action | Icon | Tooltip | Phân quyền | Điều kiện |
|--------|------|---------|------------|-----------|
| Xem | 👁️ `View` | Xem chi tiết | ALL | Luôn hiển thị |
| Sửa | ✏️ `Edit` | Chỉnh sửa | HR_MANAGER | `v-if="hasPermission(['HR_MANAGER'])"` |
| Xóa | 🗑️ `Delete` | Xóa | HR_MANAGER | `v-if="hasPermission(['HR_MANAGER'])"` |

---

### 5.2 Form Thêm/Sửa phòng ban (DepartmentForm)

**Route**:
- Thêm mới: `/departments/create`
- Chỉnh sửa: `/departments/:id/edit`
- Xem chi tiết: `/departments/:id`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Quản lý tổ chức > Phòng ban > Thêm mới│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Thông tin phòng ban ─────────────────────────────────┐      │
│  │                                                        │      │
│  │  Mã phòng ban *      [________________]                │      │
│  │                       (disabled khi edit)               │      │
│  │  Tên phòng ban *     [________________]                │      │
│  │                                                        │      │
│  │  Mô tả               [________________]                │      │
│  │                       [________________] (textarea)     │      │
│  │                                                        │      │
│  │  Phòng ban cha        [▼ Chọn phòng ban ]              │      │
│  │                       (Select từ danh sách PB ACTIVE)   │      │
│  │                                                        │      │
│  │  Trạng thái *         (●) Hoạt động  (○) Ngừng HĐ     │      │
│  │                       (Radio hoặc Select)               │      │
│  │                                                        │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│                     [Hủy bỏ]    [💾 Lưu]                        │
│                                                                  │
│  ── Thông tin hệ thống (chỉ hiển thị khi xem/edit) ──          │
│  Ngày tạo: 01/01/2026 00:00    |    Người tạo: admin           │
│  Ngày sửa: 15/01/2026 08:30    |    Người sửa: hr_manager      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Component | Type | Placeholder | Disabled khi | Ghi chú |
|-------|-----------|------|-------------|-------------|---------|
| Mã phòng ban | `el-input` | text | "Nhập mã phòng ban (VD: IT, HR)" | Edit mode | `maxlength="20"`, chuyển uppercase |
| Tên phòng ban | `el-input` | text | "Nhập tên phòng ban" | View mode | `maxlength="100"` |
| Mô tả | `el-input` | textarea | "Nhập mô tả phòng ban" | View mode | `rows="3"` |
| Phòng ban cha | `el-select` | select | "Chọn phòng ban cha (nếu có)" | View mode | Filterable, clearable, load từ API |
| Trạng thái | `el-radio-group` hoặc `el-select` | radio/select | - | View mode | Default: ACTIVE |

**Lưu ý cho dropdown Phòng ban cha:**
- Gọi `departmentService.search({ status: 'ACTIVE', page: 0, size: 100 })` để lấy danh sách
- Khi **edit**: Loại bỏ chính nó ra khỏi danh sách (tránh self-reference)
- Hiển thị format: `{code} - {name}` (VD: "IT - Phòng Công nghệ thông tin")

---

### 5.3 Các trạng thái màn hình

| Mode | Route | Điều kiện | Nút bấm | Form |
|------|-------|-----------|---------|------|
| **Danh sách** | `/departments` | - | Thêm mới | - |
| **Thêm mới** | `/departments/create` | HR_MANAGER | Lưu, Hủy | Editable |
| **Xem chi tiết** | `/departments/:id` | ALL | Quay lại, Sửa (if HR_MANAGER) | Readonly |
| **Chỉnh sửa** | `/departments/:id/edit` | HR_MANAGER | Lưu, Hủy | Editable (code disabled) |

---

## 6. Luồng nghiệp vụ (Flow)

### 6.1 Flow Tìm kiếm

```
1. User mở trang Danh sách Phòng ban
2. FE gọi POST /departments/search { page: 0, size: 10 }
3. BE trả về danh sách phòng ban (paginated)
4. FE render bảng dữ liệu

--- Khi user thay đổi filter ---
5. User nhập filter (code, name, status)
6. User nhấn "Tìm kiếm"
7. FE gọi POST /departments/search với filter + reset page = 0
8. FE render lại bảng

--- Khi user thay đổi trang ---
9. User click pagination
10. FE gọi POST /departments/search với page mới
11. FE render lại bảng
```

### 6.2 Flow Thêm mới

```
1. User nhấn "Thêm phòng ban" → Navigate /departments/create
2. FE hiển thị form trống
3. FE gọi POST /departments/search { status: 'ACTIVE', page: 0, size: 100 }
   để load dropdown Phòng ban cha
4. User điền form
5. User nhấn "Lưu"
6. FE validate form (client-side)
7. Nếu invalid → hiển thị lỗi dưới field
8. Nếu valid → FE gọi POST /departments { code, name, description, parentId, status }
9. Nếu thành công → ElMessage.success("Tạo phòng ban thành công")
                   → Navigate back /departments
10. Nếu lỗi → ElMessage.error(error.message)
             → Nếu lỗi validation → hiển thị lỗi dưới field tương ứng
```

### 6.3 Flow Chỉnh sửa

```
1. User nhấn icon "Sửa" trên row → Navigate /departments/:id/edit
2. FE gọi GET /departments/{id} để load dữ liệu
3. FE gọi POST /departments/search { status: 'ACTIVE', page: 0, size: 100 }
   để load dropdown Phòng ban cha (loại bỏ chính nó)
4. FE fill form với data
5. User chỉnh sửa (code bị disabled)
6. User nhấn "Lưu"
7. FE validate form
8. FE gọi PUT /departments/{id} { code, name, description, parentId, status }
9. Nếu thành công → ElMessage.success("Cập nhật phòng ban thành công")
                   → Navigate back /departments
10. Nếu lỗi → ElMessage.error(error.message)
```

### 6.4 Flow Xóa

```
1. User nhấn icon "Xóa" trên row
2. FE hiển thị confirm dialog:
   "Bạn có chắc muốn xóa phòng ban [CODE - NAME]?"
   [Hủy] [Xác nhận xóa]
3. User nhấn "Xác nhận xóa"
4. FE gọi DELETE /departments/{id}
5. Nếu thành công (204) → ElMessage.success("Xóa phòng ban thành công")
                         → Reload danh sách
6. Nếu lỗi → ElMessage.error("Không thể xóa phòng ban vì còn nhân viên...")
```

---

## 7. Service Layer (Gọi API)

### 7.1 File: `src/api/department.service.ts`

```ts
import request from '@/utils/request'

// ===== Interfaces =====
export interface Department {
  id: string
  code: string
  name: string
  description?: string
  parentId?: string
  parentName?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface DepartmentSearchRequest {
  code?: string
  name?: string
  status?: string
  page: number
  size: number
  sort?: string
}

export interface DepartmentCreateRequest {
  code: string
  name: string
  description?: string
  parentId?: string
  status: string
}

// ===== API Calls =====
const DEPT_URL = '/departments'

export const departmentService = {
  /** Tìm kiếm phòng ban (POST /departments/search) */
  search(data: DepartmentSearchRequest) {
    return request.post(`${DEPT_URL}/search`, data)
  },

  /** Chi tiết phòng ban (GET /departments/{id}) */
  getById(id: string) {
    return request.get(`${DEPT_URL}/${id}`)
  },

  /** Tạo phòng ban (POST /departments) */
  create(data: DepartmentCreateRequest) {
    return request.post(DEPT_URL, data)
  },

  /** Cập nhật phòng ban (PUT /departments/{id}) */
  update(id: string, data: DepartmentCreateRequest) {
    return request.put(`${DEPT_URL}/${id}`, data)
  },

  /** Xóa phòng ban (DELETE /departments/{id}) */
  delete(id: string) {
    return request.delete(`${DEPT_URL}/${id}`)
  }
}
```

### 7.2 Cách sử dụng trong Vue Component

```ts
// ===== Trong <script setup> =====
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { departmentService } from '@/api/department.service'
import type { Department, DepartmentSearchRequest } from '@/api/department.service'

// State
const loading = ref(false)
const tableData = ref<Department[]>([])
const total = ref(0)

const searchForm = ref<DepartmentSearchRequest>({
  code: '',
  name: '',
  status: '',
  page: 0,
  size: 10
})

// ===== Tìm kiếm =====
async function fetchData() {
  loading.value = true
  try {
    const res = await departmentService.search(searchForm.value)
    tableData.value = res.data.content
    total.value = res.data.totalElements
  } catch (error: any) {
    ElMessage.error(error || 'Lỗi khi tải dữ liệu')
  } finally {
    loading.value = false
  }
}

// ===== Xóa =====
async function handleDelete(row: Department) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa phòng ban "${row.code} - ${row.name}"?`,
      'Xác nhận xóa',
      { type: 'warning', confirmButtonText: 'Xác nhận', cancelButtonText: 'Hủy' }
    )
    await departmentService.delete(row.id)
    ElMessage.success('Xóa phòng ban thành công')
    fetchData() // Reload
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error || 'Không thể xóa phòng ban')
    }
  }
}

// ===== Phân trang =====
function handlePageChange(page: number) {
  searchForm.value.page = page - 1 // Element Plus page bắt đầu từ 1, BE từ 0
  fetchData()
}

function handleSizeChange(size: number) {
  searchForm.value.size = size
  searchForm.value.page = 0
  fetchData()
}

onMounted(() => {
  fetchData()
})
```

---

## 8. Router Configuration

```ts
// src/router/index.ts (hoặc file routes riêng)

const departmentRoutes = [
  {
    path: '/departments',
    name: 'DepartmentList',
    component: () => import('@/views/department/DepartmentList.vue'),
    meta: {
      title: 'Quản lý phòng ban',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],  // Ai được truy cập
      icon: 'OfficeBuilding'
    }
  },
  {
    path: '/departments/create',
    name: 'DepartmentCreate',
    component: () => import('@/views/department/DepartmentForm.vue'),
    meta: {
      title: 'Thêm phòng ban',
      roles: ['HR_MANAGER'],
      activeMenu: '/departments'  // Highlight menu cha
    }
  },
  {
    path: '/departments/:id',
    name: 'DepartmentDetail',
    component: () => import('@/views/department/DepartmentForm.vue'),
    meta: {
      title: 'Chi tiết phòng ban',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],
      activeMenu: '/departments'
    }
  },
  {
    path: '/departments/:id/edit',
    name: 'DepartmentEdit',
    component: () => import('@/views/department/DepartmentForm.vue'),
    meta: {
      title: 'Chỉnh sửa phòng ban',
      roles: ['HR_MANAGER'],
      activeMenu: '/departments'
    }
  }
]
```

**Cấu trúc thư mục Vue:**

```
src/views/department/
├── DepartmentList.vue      # Màn hình danh sách + filter + table
└── DepartmentForm.vue      # Màn hình form (dùng chung cho Create/Edit/Detail)
```

**Xác định mode trong DepartmentForm.vue:**

```ts
import { useRoute } from 'vue-router'

const route = useRoute()

const isCreateMode = computed(() => route.name === 'DepartmentCreate')
const isEditMode = computed(() => route.name === 'DepartmentEdit')
const isDetailMode = computed(() => route.name === 'DepartmentDetail')
const isReadonly = computed(() => isDetailMode.value)

const departmentId = computed(() => route.params.id as string)

const pageTitle = computed(() => {
  if (isCreateMode.value) return 'Thêm phòng ban'
  if (isEditMode.value) return 'Chỉnh sửa phòng ban'
  return 'Chi tiết phòng ban'
})
```

---

## 9. Phân quyền (RBAC)

### 9.1 Phân quyền theo role

| Chức năng | HR_MANAGER | ACCOUNTANT |
|-----------|:----------:|:----------:|
| Xem danh sách phòng ban | ✅ | ✅ |
| Xem chi tiết phòng ban | ✅ | ✅ |
| Thêm phòng ban | ✅ | ❌ |
| Sửa phòng ban | ✅ | ❌ |
| Xóa phòng ban | ✅ | ❌ |

### 9.2 Áp dụng trong template

```vue
<template>
  <!-- Nút Thêm: chỉ HR_MANAGER -->
  <el-button
    v-if="hasPermission(['HR_MANAGER'])"
    type="primary"
    @click="$router.push('/departments/create')"
  >
    + Thêm phòng ban
  </el-button>

  <!-- Action column trong table -->
  <el-table-column label="Thao tác" width="150" fixed="right">
    <template #default="{ row }">
      <el-button link type="primary" @click="viewDetail(row)">
        Xem
      </el-button>
      <el-button
        v-if="hasPermission(['HR_MANAGER'])"
        link
        type="warning"
        @click="editDepartment(row)"
      >
        Sửa
      </el-button>
      <el-button
        v-if="hasPermission(['HR_MANAGER'])"
        link
        type="danger"
        @click="handleDelete(row)"
      >
        Xóa
      </el-button>
    </template>
  </el-table-column>
</template>
```

---

## 10. Enums & Constants

```ts
// src/constants/enums.ts (đã có trong FE-API-CONFIG, bổ sung nếu cần)

// Trạng thái chung
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export const StatusLabel: Record<Status, string> = {
  [Status.ACTIVE]: 'Hoạt động',
  [Status.INACTIVE]: 'Ngừng hoạt động'
}

export const StatusTagType: Record<Status, string> = {
  [Status.ACTIVE]: 'success',   // Tag xanh
  [Status.INACTIVE]: 'info'     // Tag xám
}
```

**Sử dụng trong template:**

```vue
<el-tag :type="StatusTagType[row.status]">
  {{ StatusLabel[row.status] }}
</el-tag>
```

---

## 11. Error Handling

### 11.1 Response wrapper

Response luôn được bọc trong cấu trúc chung:

```ts
interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: T
  errors?: Array<{ field: string; message: string }>
}
```

### 11.2 Các lỗi thường gặp

| HTTP Status | Code | Nguyên nhân | Xử lý FE |
|-------------|------|-------------|-----------|
| 400 | ERR_VALIDATION | Data không hợp lệ | Hiển thị lỗi dưới field tương ứng |
| 400 | ERR_BUSINESS | Vi phạm business rule (VD: xóa PB có NV) | `ElMessage.error(message)` |
| 401 | - | Token hết hạn | Redirect login (xử lý bởi interceptor) |
| 403 | - | Không có quyền | `ElMessage.error('Bạn không có quyền')` |
| 404 | ERR_NOT_FOUND | Không tìm thấy phòng ban | `ElMessage.error(message)`, redirect list |
| 409 | ERR_DUPLICATE | Mã PB đã tồn tại | Hiển thị lỗi dưới field `code` |
| 500 | - | Lỗi server | `ElMessage.error('Lỗi hệ thống')` |

### 11.3 Xử lý validation error từ BE

```ts
async function handleSubmit() {
  try {
    await formRef.value!.validate() // Client validation

    if (isCreateMode.value) {
      await departmentService.create(formData.value)
      ElMessage.success('Tạo phòng ban thành công')
    } else {
      await departmentService.update(departmentId.value, formData.value)
      ElMessage.success('Cập nhật phòng ban thành công')
    }
    router.push('/departments')
  } catch (error: any) {
    // Nếu BE trả về validation errors
    if (error?.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: { field: string; message: string }) => {
        // Hiển thị lỗi dưới field tương ứng
        ElMessage.error(`${err.field}: ${err.message}`)
      })
    } else {
      ElMessage.error(error?.message || error || 'Có lỗi xảy ra')
    }
  }
}
```

---

## 12. Checklist triển khai

### 12.1 Chuẩn bị

- [ ] Đọc hiểu tài liệu này
- [ ] Kiểm tra `department.service.ts` đã có trong `src/api/`
- [ ] Kiểm tra enums `Status`, `StatusLabel` đã có trong `src/constants/enums.ts`
- [ ] Kiểm tra router department đã config

### 12.2 Phát triển

- [ ] **DepartmentList.vue**
  - [ ] Filter form (code, name, status)
  - [ ] Bảng dữ liệu với các cột: STT, Mã, Tên, Mô tả, PB Cha, Trạng thái, Thao tác
  - [ ] Phân trang (`el-pagination`)
  - [ ] Nút "Thêm phòng ban" (phân quyền HR_MANAGER)
  - [ ] Action: Xem, Sửa, Xóa (phân quyền)
  - [ ] Confirm dialog khi xóa
  - [ ] Loading state
  - [ ] Empty state khi không có data

- [ ] **DepartmentForm.vue**
  - [ ] Hỗ trợ 3 mode: Create, Edit, Detail
  - [ ] Form fields: code, name, description, parentId, status
  - [ ] Dropdown phòng ban cha (load từ API, loại bỏ chính nó khi edit)
  - [ ] Validation rules (client-side)
  - [ ] Code field disabled khi edit
  - [ ] Tất cả fields readonly khi detail mode
  - [ ] Nút Lưu + Hủy (ẩn khi detail)
  - [ ] Hiển thị thông tin hệ thống (createdAt, createdBy,...) khi edit/detail
  - [ ] Loading state khi submit
  - [ ] Xử lý lỗi từ BE (validation errors)

### 12.3 Kiểm thử

- [ ] Test tìm kiếm với filter
- [ ] Test phân trang (chuyển trang, đổi số bản ghi)
- [ ] Test thêm mới (happy path + validation error + duplicate code)
- [ ] Test chỉnh sửa (load data + save + error)
- [ ] Test xóa (confirm + success + business rule error)
- [ ] Test phân quyền (ACCOUNTANT không thấy nút Thêm/Sửa/Xóa)
- [ ] Test responsive (mobile, tablet)

---

> **Ghi chú cuối**: Tài liệu này được tạo dựa trên HLD v2.0 và API_SPECIFICATIONS v1.0. Nếu BE thay đổi API, cần cập nhật lại tài liệu tương ứng.
