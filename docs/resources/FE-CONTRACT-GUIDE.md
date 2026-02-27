# Tài liệu FE — Module Hợp đồng (Contract)

> **Tài liệu tham chiếu**: [HLD.md](./04-HLD/HLD.md) | [FE-API-CONFIG.md](./FE-API-CONFIG.md)
> **Ngày tạo**: 2026-02-27
> **Mục đích**: Hướng dẫn FE developer triển khai module Quản lý Hợp đồng (Contract)
> **Phân quyền**: HR_MANAGER (CRUD)

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

Module **Hợp đồng (Contract)** cho phép quản lý hợp đồng lao động của nhân viên. Mỗi nhân viên có thể có nhiều hợp đồng (thử việc → chính thức → gia hạn) nhưng chỉ 1 hợp đồng ACTIVE tại một thời điểm. Hợp đồng là cơ sở để tính lương (base_salary, offer_salary, salary_type).

### 1.2 Chức năng chính

| STT | Chức năng | Mô tả | Phân quyền |
|-----|-----------|-------|------------|
| 1 | Danh sách hợp đồng | Tìm kiếm, lọc, phân trang | HR_MANAGER |
| 2 | Xem chi tiết hợp đồng | Xem thông tin + danh sách phụ cấp | HR_MANAGER |
| 3 | Thêm hợp đồng | Tạo hợp đồng mới cho nhân viên | HR_MANAGER |
| 4 | Sửa hợp đồng | Cập nhật thông tin hợp đồng | HR_MANAGER |
| 5 | Xóa hợp đồng | Xóa hợp đồng (nếu chưa dùng tính lương) | HR_MANAGER |

### 1.3 Quan hệ với các module khác

```
EMPLOYEE ──── 1:N ──── CONTRACT (emp_id FK)
CONTRACT ──── 1:N ──── EMPLOYEE_ALLOWANCE (contract_id FK)
ALLOWANCE_CONFIG ──── 1:N ──── EMPLOYEE_ALLOWANCE (allowance_id FK)
```

> ⚠️ **Lưu ý**: Hợp đồng dùng để tính lương trong PAYROLL. Constraint `UNIQUE(emp_id, start_date)` — không có 2 HĐ cùng NV bắt đầu cùng ngày.

---

## 2. Data Model & Interfaces

### 2.1 Database Schema — Bảng `contract`

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `emp_id` | UUID | FK đến employee | FK, NOT NULL | - |
| `contract_number` | VARCHAR(50) | Số hợp đồng | NOT NULL | - |
| `contract_type` | VARCHAR(30) | Loại hợp đồng | NOT NULL | - |
| `start_date` | DATE | Ngày bắt đầu | NOT NULL | - |
| `end_date` | DATE | Ngày kết thúc | NULLABLE | NULL |
| `base_salary` | DECIMAL(15,2) | Lương cơ bản (tính BHXH) | NOT NULL | - |
| `offer_salary` | DECIMAL(15,2) | Lương thỏa thuận (thực tế) | NOT NULL | - |
| `salary_type` | VARCHAR(10) | Loại lương | NOT NULL | 'GROSS' |
| `terms` | TEXT | Các điều khoản | NULLABLE | NULL |
| `file_url` | VARCHAR(500) | URL file PDF | NULLABLE | NULL |
| `status` | VARCHAR(20) | Trạng thái | NOT NULL | 'ACTIVE' |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `created_by` | VARCHAR(100) | Người tạo | NOT NULL | - |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |
| `updated_by` | VARCHAR(100) | Người cập nhật | NOT NULL | - |

### 2.2 Database Schema — Bảng `employee_allowance`

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `emp_id` | UUID | FK đến employee | FK, NOT NULL | - |
| `contract_id` | UUID | FK đến contract | FK, NOT NULL | - |
| `allowance_id` | UUID | FK đến allowance_config | FK, NOT NULL | - |
| `amount` | DECIMAL(15,2) | Số tiền | NOT NULL | - |
| `effective_date` | DATE | Ngày hiệu lực | NOT NULL | - |
| `end_date` | DATE | Ngày hết hiệu lực | NULLABLE | NULL |
| `status` | VARCHAR(20) | Trạng thái | NOT NULL | 'ACTIVE' |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |

### 2.3 TypeScript Interfaces

```ts
// ===== Contract Response Object =====
interface Contract {
  id: string
  empId: string
  employeeName?: string        // BE trả thêm (nullable)
  employeeCode?: string        // BE trả thêm (nullable)
  contractNumber: string
  contractType: 'PROBATION' | 'OFFICIAL' | 'SEASONAL'
  startDate: string            // YYYY-MM-DD
  endDate?: string             // YYYY-MM-DD (nullable)
  baseSalary: number           // Lương cơ bản (tính BHXH)
  offerSalary: number          // Lương thỏa thuận
  salaryType: 'GROSS' | 'NET'
  terms?: string
  fileUrl?: string             // URL file PDF
  status: 'ACTIVE' | 'EXPIRED'
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

// ===== Search Request =====
interface ContractSearchRequest {
  keyword?: string             // Tìm theo số HĐ, mã NV, tên NV
  empId?: string               // Filter theo nhân viên
  contractType?: string        // PROBATION | OFFICIAL | SEASONAL
  status?: string              // ACTIVE | EXPIRED
  page: number                 // 0-indexed
  size: number                 // Default: 10
  sort?: string                // VD: "startDate,desc"
}

// ===== Create Request =====
interface ContractCreateRequest {
  empId: string                // UUID nhân viên (bắt buộc)
  contractNumber: string       // Số hợp đồng
  contractType: string         // PROBATION | OFFICIAL | SEASONAL
  startDate: string            // YYYY-MM-DD
  endDate?: string             // YYYY-MM-DD (nullable — HĐ không thời hạn)
  baseSalary: number           // > 0
  offerSalary: number          // > 0
  salaryType: string           // GROSS | NET
  terms?: string
  status: string               // ACTIVE | EXPIRED
}

// ===== Update Request =====
type ContractUpdateRequest = ContractCreateRequest

// ===== Employee Allowance =====
interface EmployeeAllowance {
  id: string
  empId: string
  contractId: string
  allowanceId: string
  allowanceName?: string       // BE trả thêm
  allowanceCode?: string       // BE trả thêm
  amount: number
  effectiveDate: string        // YYYY-MM-DD
  endDate?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

// ===== Paginated Response =====
interface ContractPageResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: {
    content: Contract[]
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// ===== Single Response =====
interface ContractResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: Contract
}
```

---

## 3. API Endpoints

### 3.1 Tổng quan

| STT | Method | Endpoint | Mô tả | Auth |
|-----|--------|----------|-------|------|
| 1 | `POST` | `/api/v1/contracts/search` | Tìm kiếm / Danh sách hợp đồng | ✅ HR_MANAGER |
| 2 | `GET` | `/api/v1/contracts/{id}` | Chi tiết hợp đồng | ✅ HR_MANAGER |
| 3 | `POST` | `/api/v1/contracts` | Tạo hợp đồng mới | ✅ HR_MANAGER |
| 4 | `PUT` | `/api/v1/contracts/{id}` | Cập nhật hợp đồng | ✅ HR_MANAGER |
| 5 | `DELETE` | `/api/v1/contracts/{id}` | Xóa hợp đồng | ✅ HR_MANAGER |
| 6 | `POST` | `/api/v1/contracts/{id}/upload` | Upload file PDF hợp đồng | ✅ HR_MANAGER |

> ⚠️ Danh sách dùng **`POST /search`** — filter gửi trong **request body**.

### 3.2 Chi tiết từng API

#### 3.2.1 Search Contracts

**`POST /api/v1/contracts/search`**

**Request Body:**
```json
{
  "keyword": "HD2026",
  "empId": null,
  "contractType": "OFFICIAL",
  "status": "ACTIVE",
  "page": 0,
  "size": 10,
  "sort": "startDate,desc"
}
```

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-02-27T10:00:00Z",
  "data": {
    "content": [
      {
        "id": "a50e8400-e29b-41d4-a716-446655440001",
        "empId": "550e8400-e29b-41d4-a716-446655440001",
        "employeeName": "Nguyễn Văn A",
        "employeeCode": "NV260101001",
        "contractNumber": "HD2026-001",
        "contractType": "OFFICIAL",
        "startDate": "2026-01-01",
        "endDate": "2027-12-31",
        "baseSalary": 10000000,
        "offerSalary": 15000000,
        "salaryType": "GROSS",
        "terms": null,
        "fileUrl": null,
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "hr_manager",
        "updatedAt": "2026-01-01T00:00:00Z",
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

#### 3.2.2 Get Contract by ID

**`GET /api/v1/contracts/{id}`** → Response tương tự single object.

#### 3.2.3 Create Contract

**`POST /api/v1/contracts`**

```json
{
  "empId": "550e8400-e29b-41d4-a716-446655440001",
  "contractNumber": "HD2026-002",
  "contractType": "OFFICIAL",
  "startDate": "2026-03-01",
  "endDate": "2028-02-28",
  "baseSalary": 10000000,
  "offerSalary": 15000000,
  "salaryType": "GROSS",
  "terms": "Theo quy chế công ty",
  "status": "ACTIVE"
}
```

**Response (201 Created):** Trả về Contract object.

#### 3.2.4 Update Contract

**`PUT /api/v1/contracts/{id}`** — Request body tương tự Create.

#### 3.2.5 Delete Contract

**`DELETE /api/v1/contracts/{id}`** — Response 204 No Content.

#### 3.2.6 Upload File PDF

**`POST /api/v1/contracts/{id}/upload`** — `multipart/form-data`

```ts
const formData = new FormData()
formData.append('file', file)
// Content-Type: multipart/form-data
```

---

## 4. Validation Rules

### 4.1 Form Validation (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `empId` | Required | "Vui lòng chọn nhân viên" |
| `contractNumber` | Required | "Vui lòng nhập số hợp đồng" |
| `contractNumber` | Max 50 ký tự | "Số hợp đồng tối đa 50 ký tự" |
| `contractType` | Required | "Vui lòng chọn loại hợp đồng" |
| `startDate` | Required | "Vui lòng chọn ngày bắt đầu" |
| `endDate` | Nếu có, >= startDate | "Ngày kết thúc phải sau ngày bắt đầu" |
| `baseSalary` | Required, > 0 | "Lương cơ bản phải lớn hơn 0" |
| `offerSalary` | Required, > 0 | "Lương thỏa thuận phải lớn hơn 0" |
| `salaryType` | Required | "Vui lòng chọn loại lương" |
| `status` | Required | "Vui lòng chọn trạng thái" |

### 4.2 Business Validation (BE-side)

| Rule | Error Message |
|------|---------------|
| `UNIQUE(emp_id, start_date)` | "Nhân viên đã có hợp đồng bắt đầu cùng ngày" |
| `end_date >= start_date` | "Ngày kết thúc phải sau ngày bắt đầu" |
| `base_salary > 0 AND offer_salary > 0` | "Lương phải lớn hơn 0" |
| Không xóa HĐ đã dùng tính lương | "Không thể xóa hợp đồng vì đã có bảng lương liên quan" |

### 4.3 Ví dụ validation bằng Element Plus

```ts
import type { FormRules } from 'element-plus'

const rules: FormRules = {
  empId: [
    { required: true, message: 'Vui lòng chọn nhân viên', trigger: 'change' }
  ],
  contractNumber: [
    { required: true, message: 'Vui lòng nhập số hợp đồng', trigger: 'blur' },
    { max: 50, message: 'Số hợp đồng tối đa 50 ký tự', trigger: 'blur' }
  ],
  contractType: [
    { required: true, message: 'Vui lòng chọn loại hợp đồng', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'change' }
  ],
  baseSalary: [
    { required: true, message: 'Vui lòng nhập lương cơ bản', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Lương cơ bản phải lớn hơn 0', trigger: 'blur' }
  ],
  offerSalary: [
    { required: true, message: 'Vui lòng nhập lương thỏa thuận', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Lương thỏa thuận phải lớn hơn 0', trigger: 'blur' }
  ],
  salaryType: [
    { required: true, message: 'Vui lòng chọn loại lương', trigger: 'change' }
  ],
  status: [
    { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }
  ]
}
```

---

## 5. Màn hình & UI Components

### 5.1 Danh sách hợp đồng (ContractList)

**Route**: `/contracts`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Quản lý nhân sự > Hợp đồng            │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Bộ lọc ──────────────────────────────────────────────┐      │
│  │  [Từ khóa __________]  [Loại HĐ ▼]  [Trạng thái ▼]  │      │
│  │  [Nhân viên ▼ ]       [🔍 Tìm kiếm] [↻ Đặt lại]     │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  [+ Thêm hợp đồng]                                              │
│                                                                  │
│  ┌─ Bảng dữ liệu ────────────────────────────────────────┐     │
│  │ STT │ Số HĐ      │ Nhân viên    │ Loại HĐ  │ Ngày BĐ │    │
│  │     │             │              │           │ Ngày KT  │    │
│  │     │ Lương TT    │ Loại lương   │ TT       │ Thao tác │    │
│  │  1  │ HD2026-001  │ NV260101001  │ Chính thức│01/01/26  │    │
│  │     │             │ Nguyễn Văn A │           │31/12/27  │    │
│  │     │ 15,000,000  │ GROSS        │ ● Active │ ⋮        │    │
│  └────────────────────────────────────────────────────────┘     │
│  [< 1 2 3 ... 5 >]           Hiển thị 1-10 / 45 bản ghi        │
└──────────────────────────────────────────────────────────────────┘
```

**Cột bảng dữ liệu:**

| Cột | Field | Width | Sortable | Mô tả |
|-----|-------|-------|----------|-------|
| STT | - | 60px | ❌ | page * size + index + 1 |
| Số hợp đồng | `contractNumber` | 150px | ✅ | Text |
| Nhân viên | `employeeCode` + `employeeName` | 200px | ✅ | Hiển thị: mã NV + tên NV |
| Loại HĐ | `contractType` | 120px | ✅ | Tag (xem Enums) |
| Ngày bắt đầu | `startDate` | 120px | ✅ | Format DD/MM/YYYY |
| Ngày kết thúc | `endDate` | 120px | ✅ | Format DD/MM/YYYY hoặc "Không thời hạn" |
| Lương thỏa thuận | `offerSalary` | 150px | ✅ | Format: 15,000,000 VNĐ |
| Loại lương | `salaryType` | 90px | ❌ | GROSS / NET |
| Trạng thái | `status` | 120px | ✅ | Tag: ACTIVE = xanh, EXPIRED = xám |
| Thao tác | - | 150px | ❌ | Xem, Sửa, Xóa |

---

### 5.2 Form Thêm/Sửa hợp đồng (ContractForm)

**Route**:
- Thêm: `/contracts/create`
- Sửa: `/contracts/:id/edit`
- Chi tiết: `/contracts/:id`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Quản lý nhân sự > Hợp đồng > Thêm mới│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Section 1: Thông tin hợp đồng ─────────────────────┐       │
│  │                                                       │       │
│  │  Nhân viên *          [▼ Chọn nhân viên          ]    │       │
│  │                       (Select filterable, ACTIVE)     │       │
│  │                       (disabled khi edit)             │       │
│  │                                                       │       │
│  │  Số hợp đồng *       [________________]              │       │
│  │                                                       │       │
│  │  Loại hợp đồng *     [▼ Chọn loại HĐ  ]             │       │
│  │                       (PROBATION/OFFICIAL/SEASONAL)   │       │
│  │                                                       │       │
│  │  Trạng thái *         (●) Hiệu lực  (○) Hết hạn     │       │
│  │                                                       │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─ Section 2: Thời hạn hợp đồng ──────────────────────┐       │
│  │                                                       │       │
│  │  Ngày bắt đầu *      [📅 ____________]               │       │
│  │                                                       │       │
│  │  Ngày kết thúc        [📅 ____________]               │       │
│  │                       (để trống = không thời hạn)     │       │
│  │                                                       │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─ Section 3: Thông tin lương ─────────────────────────┐       │
│  │                                                       │       │
│  │  Lương cơ bản *       [________________] VNĐ          │       │
│  │                       (dùng tính BHXH)                │       │
│  │                                                       │       │
│  │  Lương thỏa thuận *   [________________] VNĐ          │       │
│  │                       (lương thực tế)                 │       │
│  │                                                       │       │
│  │  Loại lương *         (●) GROSS  (○) NET              │       │
│  │                                                       │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─ Section 4: Thông tin bổ sung ───────────────────────┐       │
│  │                                                       │       │
│  │  Điều khoản           [________________]              │       │
│  │                       [________________] (textarea)   │       │
│  │                                                       │       │
│  │  File đính kèm        [📎 Chọn file PDF]             │       │
│  │                       (upload sau khi tạo HĐ)        │       │
│  │                                                       │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─ Section 5: Phụ cấp (chỉ hiển thị khi Edit/Detail) ─┐       │
│  │                                                       │       │
│  │  [+ Thêm phụ cấp]                                    │       │
│  │  ┌─────────────────────────────────────────────────┐  │       │
│  │  │ STT│ Loại PC    │ Số tiền    │ Từ ngày│ Đến ngày│  │       │
│  │  │  1 │ PC ăn trưa │ 500,000   │01/01/26│  -      │  │       │
│  │  │  2 │ PC xăng xe │ 300,000   │01/01/26│31/12/26 │  │       │
│  │  └─────────────────────────────────────────────────┘  │       │
│  │                                                       │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                  │
│                     [Hủy bỏ]    [💾 Lưu]                        │
│                                                                  │
│  ── Thông tin hệ thống (chỉ edit/detail) ──                     │
│  Ngày tạo: 01/01/2026    |    Người tạo: hr_manager             │
│  Ngày sửa: 15/01/2026    |    Người sửa: hr_manager             │
└──────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Component | Placeholder | Disabled khi | Ghi chú |
|-------|-----------|-------------|-------------|---------|
| Nhân viên | `el-select` | "Chọn nhân viên" | Edit, Detail | Filterable, load NV ACTIVE từ API |
| Số hợp đồng | `el-input` | "Nhập số hợp đồng (VD: HD2026-001)" | Detail | `maxlength="50"` |
| Loại hợp đồng | `el-select` | "Chọn loại hợp đồng" | Detail | Options: Thử việc, Chính thức, Thời vụ |
| Ngày bắt đầu | `el-date-picker` | "Chọn ngày" | Detail | Format: DD/MM/YYYY |
| Ngày kết thúc | `el-date-picker` | "Chọn ngày" | Detail | Clearable, nullable |
| Lương cơ bản | `el-input-number` | - | Detail | `:min="0"`, format VNĐ |
| Lương thỏa thuận | `el-input-number` | - | Detail | `:min="0"`, format VNĐ |
| Loại lương | `el-radio-group` | - | Detail | Default: GROSS |
| Điều khoản | `el-input` textarea | "Nhập điều khoản" | Detail | `rows="3"` |
| File đính kèm | `el-upload` | - | Detail | Accept: `.pdf`, max 10MB |
| Trạng thái | `el-radio-group` | - | Detail | Default: ACTIVE |

**Lưu ý dropdown Nhân viên:**
- Gọi `employeeService.search({ status: 'ACTIVE', page: 0, size: 200 })` để lấy danh sách
- Hiển thị format: `{code} - {name}` (VD: "NV260101001 - Nguyễn Văn A")
- Khi **edit**: disable field nhân viên (không được đổi NV)

---

### 5.3 Các trạng thái màn hình

| Mode | Route | Nút bấm | Form |
|------|-------|---------|------|
| **Danh sách** | `/contracts` | Thêm mới | - |
| **Thêm mới** | `/contracts/create` | Lưu, Hủy | Editable |
| **Xem chi tiết** | `/contracts/:id` | Quay lại, Sửa | Readonly + Section Phụ cấp |
| **Chỉnh sửa** | `/contracts/:id/edit` | Lưu, Hủy | Editable (NV disabled) + Section Phụ cấp |

---

## 6. Luồng nghiệp vụ (Flow)

### 6.1 Flow Tìm kiếm

```
1. User mở trang Danh sách Hợp đồng
2. FE gọi POST /contracts/search { page: 0, size: 10 }
3. BE trả về danh sách (paginated)
4. FE render bảng

--- Khi user thay đổi filter ---
5. User nhập filter → nhấn "Tìm kiếm"
6. FE gọi POST /contracts/search với filter + reset page = 0
```

### 6.2 Flow Thêm mới

```
1. User nhấn "Thêm hợp đồng" → Navigate /contracts/create
2. FE load dropdown: Nhân viên (ACTIVE), Loại HĐ, Loại lương
3. User điền form → nhấn "Lưu"
4. FE validate client-side
5. Nếu valid → POST /contracts { empId, contractNumber, ... }
6. Thành công → ElMessage.success → Navigate /contracts
7. Lỗi → ElMessage.error + hiển thị lỗi dưới field
```

### 6.3 Flow Chỉnh sửa

```
1. User nhấn "Sửa" → Navigate /contracts/:id/edit
2. FE gọi GET /contracts/{id} để load data
3. FE fill form (empId disabled)
4. User sửa → nhấn "Lưu"
5. FE gọi PUT /contracts/{id}
6. Thành công → Navigate /contracts
```

### 6.4 Flow Xóa

```
1. User nhấn "Xóa" → confirm dialog
2. Xác nhận → DELETE /contracts/{id}
3. Thành công (204) → reload danh sách
4. Lỗi (có payroll liên quan) → ElMessage.error
```

### 6.5 Flow Upload file PDF

```
1. Sau khi tạo/sửa HĐ, user nhấn "Upload file"
2. Chọn file PDF (< 10MB)
3. FE gọi POST /contracts/{id}/upload (multipart/form-data)
4. Thành công → hiển thị link file
```

### 6.6 Flow Quản lý phụ cấp (trong form Edit/Detail)

```
1. Trong màn hình edit/detail, Section "Phụ cấp" hiển thị danh sách phụ cấp
2. User nhấn "Thêm phụ cấp" → dialog/inline form
3. Chọn loại phụ cấp (từ ALLOWANCE_CONFIG), nhập số tiền, ngày hiệu lực
4. Lưu → API tạo employee_allowance
5. Hiển thị lại danh sách phụ cấp
```

> ⚠️ **Lưu ý**: API endpoint cho employee_allowance cần xác nhận với BE. Có thể là sub-resource: `POST /contracts/{id}/allowances` hoặc endpoint riêng.

---

## 7. Service Layer (Gọi API)

### 7.1 File: `src/api/contract.service.ts`

```ts
import request from '@/utils/request'

const CONTRACT_URL = '/contracts'

export const contractService = {
  /** Tìm kiếm hợp đồng (POST /contracts/search) */
  search(data: ContractSearchRequest) {
    return request.post(`${CONTRACT_URL}/search`, data)
  },

  /** Chi tiết hợp đồng (GET /contracts/{id}) */
  getById(id: string) {
    return request.get(`${CONTRACT_URL}/${id}`)
  },

  /** Tạo hợp đồng (POST /contracts) */
  create(data: ContractCreateRequest) {
    return request.post(CONTRACT_URL, data)
  },

  /** Cập nhật hợp đồng (PUT /contracts/{id}) */
  update(id: string, data: ContractUpdateRequest) {
    return request.put(`${CONTRACT_URL}/${id}`, data)
  },

  /** Xóa hợp đồng (DELETE /contracts/{id}) */
  delete(id: string) {
    return request.delete(`${CONTRACT_URL}/${id}`)
  },

  /** Upload file PDF hợp đồng (POST /contracts/{id}/upload) */
  uploadFile(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post(`${CONTRACT_URL}/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

---

## 8. Router Configuration

```ts
const contractRoutes = [
  {
    path: '/contracts',
    name: 'ContractList',
    component: () => import('@/views/contract/ContractListView.vue'),
    meta: {
      title: 'Quản lý hợp đồng',
      roles: ['HR_MANAGER'],
      icon: 'Document'
    }
  },
  {
    path: '/contracts/create',
    name: 'ContractCreate',
    component: () => import('@/views/contract/ContractFormView.vue'),
    meta: {
      title: 'Thêm hợp đồng',
      roles: ['HR_MANAGER'],
      activeMenu: '/contracts'
    }
  },
  {
    path: '/contracts/:id',
    name: 'ContractDetail',
    component: () => import('@/views/contract/ContractFormView.vue'),
    meta: {
      title: 'Chi tiết hợp đồng',
      roles: ['HR_MANAGER'],
      activeMenu: '/contracts'
    }
  },
  {
    path: '/contracts/:id/edit',
    name: 'ContractEdit',
    component: () => import('@/views/contract/ContractFormView.vue'),
    meta: {
      title: 'Chỉnh sửa hợp đồng',
      roles: ['HR_MANAGER'],
      activeMenu: '/contracts'
    }
  }
]
```

**Cấu trúc thư mục Vue:**

```
src/views/contract/
├── ContractListView.vue      # Danh sách + filter + table
└── ContractFormView.vue      # Form (Create/Edit/Detail)
```

**Xác định mode:**

```ts
import { useRoute } from 'vue-router'

const route = useRoute()

const isCreateMode = computed(() => route.name === 'ContractCreate')
const isEditMode = computed(() => route.name === 'ContractEdit')
const isDetailMode = computed(() => route.name === 'ContractDetail')
const isReadonly = computed(() => isDetailMode.value)

const contractId = computed(() => route.params.id as string)

const pageTitle = computed(() => {
  if (isCreateMode.value) return 'Thêm hợp đồng'
  if (isEditMode.value) return 'Chỉnh sửa hợp đồng'
  return 'Chi tiết hợp đồng'
})
```

---

## 9. Phân quyền (RBAC)

| Chức năng | HR_MANAGER | ACCOUNTANT |
|-----------|:----------:|:----------:|
| Xem danh sách hợp đồng | ✅ | ❌ |
| Xem chi tiết hợp đồng | ✅ | ❌ |
| Thêm hợp đồng | ✅ | ❌ |
| Sửa hợp đồng | ✅ | ❌ |
| Xóa hợp đồng | ✅ | ❌ |

> **Ghi chú**: Module Contract chỉ dành cho HR_MANAGER. Accountant không truy cập trực tiếp — chỉ xem thông tin lương qua module Payroll.

---

## 10. Enums & Constants

```ts
// src/constants/enums.ts (bổ sung nếu chưa có)

// Loại hợp đồng
export enum ContractType {
  PROBATION = 'PROBATION',
  OFFICIAL = 'OFFICIAL',
  SEASONAL = 'SEASONAL'
}

export const ContractTypeLabel: Record<ContractType, string> = {
  [ContractType.PROBATION]: 'Thử việc',
  [ContractType.OFFICIAL]: 'Chính thức',
  [ContractType.SEASONAL]: 'Thời vụ'
}

export const ContractTypeTagType: Record<ContractType, string> = {
  [ContractType.PROBATION]: 'warning',   // Tag vàng
  [ContractType.OFFICIAL]: 'success',    // Tag xanh
  [ContractType.SEASONAL]: 'info'        // Tag xám
}

// Trạng thái hợp đồng
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

export const ContractStatusLabel: Record<ContractStatus, string> = {
  [ContractStatus.ACTIVE]: 'Hiệu lực',
  [ContractStatus.EXPIRED]: 'Hết hạn'
}

export const ContractStatusTagType: Record<ContractStatus, string> = {
  [ContractStatus.ACTIVE]: 'success',    // Tag xanh
  [ContractStatus.EXPIRED]: 'info'       // Tag xám
}

// Loại lương
export enum SalaryType {
  GROSS = 'GROSS',
  NET = 'NET'
}

export const SalaryTypeLabel: Record<SalaryType, string> = {
  [SalaryType.GROSS]: 'GROSS (Gộp)',
  [SalaryType.NET]: 'NET (Thực nhận)'
}
```

**Sử dụng trong template:**

```vue
<el-tag :type="ContractTypeTagType[row.contractType]">
  {{ ContractTypeLabel[row.contractType] }}
</el-tag>

<el-tag :type="ContractStatusTagType[row.status]">
  {{ ContractStatusLabel[row.status] }}
</el-tag>
```

---

## 11. Error Handling

### 11.1 Các lỗi thường gặp

| HTTP Status | Code | Nguyên nhân | Xử lý FE |
|-------------|------|-------------|-----------|
| 400 | ERR_VALIDATION | Data không hợp lệ | Hiển thị lỗi dưới field |
| 400 | ERR_BUSINESS | Vi phạm business rule | `ElMessage.error(message)` |
| 401 | - | Token hết hạn | Redirect login |
| 403 | - | Không có quyền | `ElMessage.error('Bạn không có quyền')` |
| 404 | ERR_NOT_FOUND | HĐ không tồn tại | `ElMessage.error`, redirect list |
| 409 | ERR_DUPLICATE | Trùng emp_id + start_date | Hiển thị lỗi |
| 500 | - | Lỗi server | `ElMessage.error('Lỗi hệ thống')` |

---

## 12. Checklist triển khai

### 12.1 Chuẩn bị

- [ ] Đọc hiểu tài liệu này
- [ ] Kiểm tra `contract.service.ts` đã có trong `src/api/`
- [ ] Kiểm tra enums `ContractType`, `ContractStatus`, `SalaryType` đã có
- [ ] Kiểm tra router contract đã config

### 12.2 Phát triển

- [ ] **ContractListView.vue**
  - [ ] Filter form (keyword, empId, contractType, status)
  - [ ] Bảng dữ liệu (STT, Số HĐ, NV, Loại, Ngày BĐ/KT, Lương, TT, Thao tác)
  - [ ] Phân trang (`el-pagination`)
  - [ ] Nút "Thêm hợp đồng"
  - [ ] Action: Xem, Sửa, Xóa
  - [ ] Confirm dialog khi xóa
  - [ ] Loading + Empty state

- [ ] **ContractFormView.vue**
  - [ ] Hỗ trợ 3 mode: Create, Edit, Detail
  - [ ] Section 1: Thông tin HĐ (NV, Số HĐ, Loại HĐ, Trạng thái)
  - [ ] Section 2: Thời hạn (Ngày BĐ, Ngày KT)
  - [ ] Section 3: Lương (Cơ bản, Thỏa thuận, Loại lương)
  - [ ] Section 4: Bổ sung (Điều khoản, File đính kèm)
  - [ ] Section 5: Phụ cấp (chỉ Edit/Detail — danh sách + thêm/xóa)
  - [ ] Dropdown NV (filterable, ACTIVE, disabled khi edit)
  - [ ] Validation rules (client-side)
  - [ ] Readonly khi detail mode
  - [ ] Thông tin hệ thống (created/updated) khi edit/detail
  - [ ] Upload PDF
  - [ ] Xử lý lỗi từ BE

### 12.3 Kiểm thử

- [ ] Test tìm kiếm với filter
- [ ] Test phân trang
- [ ] Test thêm mới (happy + validation + duplicate)
- [ ] Test chỉnh sửa (load data + save)
- [ ] Test xóa (confirm + business rule error)
- [ ] Test upload file PDF
- [ ] Test quản lý phụ cấp (thêm/xóa/xem)
- [ ] Test validation endDate >= startDate
- [ ] Test salary > 0

---

> **Ghi chú cuối**: Tài liệu này được tạo dựa trên HLD v2.0 và FE-API-CONFIG. Nếu BE thay đổi API, cần cập nhật lại tài liệu tương ứng.
