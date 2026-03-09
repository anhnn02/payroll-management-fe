# Tài liệu FE — Module Cấu hình lương (Salary Configuration)

> **Tài liệu tham chiếu**: [HLD.md](./04-HLD/HLD.md) | [DD-HRM-PAYROLL.md](./06-DD/DD-HRM-PAYROLL.md) | [API_SPECIFICATIONS.md](./06-DD/API_SPECIFICATIONS.md) | [FE-API-CONFIG.md](./FE-API-CONFIG.md)
> **Ngày tạo**: 2026-03-09
> **Mục đích**: Hướng dẫn FE developer triển khai module Cấu hình lương (Salary Configuration)
> **Phân quyền**: HR_MANAGER (CRUD hệ số lương, phụ cấp, ngày lễ) | ACCOUNTANT (chỉ xem thuế, bảo hiểm)

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

Module **Cấu hình lương (Salary Configuration)** cho phép quản lý các tham số dùng trong quy trình tính lương. Các giá trị cấu hình này ảnh hưởng trực tiếp đến stored procedure `CALCULATE_PAYROLL` (3 phases) khi tính lương cho nhân viên.

### 1.2 Chức năng chính — 5 Sub-modules (5 Tabs)

| STT | Sub-module | Mô tả | Phân quyền |
|-----|-----------|-------|------------|
| 1 | Hệ số lương (Salary Factors) | OT_WEEKDAY=1.5, OT_SUNDAY=2.0, OT_HOLIDAY=3.0 | HR_MANAGER (đọc/ghi) |
| 2 | Thuế TNCN (Tax Config) | 7 bậc thuế lũy tiến (5%→35%) | HR_MANAGER, ACCOUNTANT (chỉ đọc) |
| 3 | Bảo hiểm (Insurance Config) | BHXH/BHTN/BHYT theo loại hợp đồng | HR_MANAGER, ACCOUNTANT (chỉ đọc) |
| 4 | Phụ cấp (Allowance Config) | Danh mục phụ cấp (ăn trưa, xăng xe, điện thoại...) | HR_MANAGER (CRUD) |
| 5 | Ngày lễ (Holidays) | Danh sách ngày lễ (OT hệ số 3.0) | HR_MANAGER (thêm/xóa) |

### 1.3 Quan hệ với các module khác

```
SALARY_FACTOR_CONFIG ──── Phase 2: Tính lương OT (hệ số 1.5x, 2.0x, 3.0x)
TAX_CONFIG ───────────── Phase 3: Tính thuế TNCN (7 bậc lũy tiến)
INSURANCE_CONFIG ─────── Phase 3: Tính BHXH, BHTN, BHYT
ALLOWANCE_CONFIG ─────── Phase 1: Tính phụ cấp → employee_allowance
HOLIDAY ──────────────── Attendance: Xác định OT type = HOLIDAY
                  │
                  └── Tất cả ảnh hưởng stored procedure CALCULATE_PAYROLL
```

> ⚠️ **Lưu ý quan trọng**: Thay đổi config sẽ ảnh hưởng đến **tất cả lần tính lương sau đó**. Cần cẩn thận khi cập nhật.

---

## 2. Data Model & Interfaces

### 2.1 Database Schemas

#### Bảng: `salary_factor_config`

**Mô tả**: Hệ số lương (OT, OT_SUN, OT_HOL)

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `code` | VARCHAR(50) | Mã hệ số | UNIQUE, NOT NULL | - |
| `name` | VARCHAR(100) | Tên hệ số | NOT NULL | - |
| `value` | DECIMAL(5,2) | Giá trị | NOT NULL | - |
| `description` | TEXT | Mô tả | NULLABLE | NULL |
| `effective_date` | DATE | Ngày hiệu lực | NOT NULL | - |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |

#### Bảng: `tax_config`

**Mô tả**: Cấu hình thuế TNCN (7 bậc lũy tiến)

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `code` | VARCHAR(20) | Mã bậc thuế | UNIQUE, NOT NULL | - |
| `tax_rate` | DECIMAL(5,2) | Thuế suất (%) | NOT NULL | - |
| `min_income` | DECIMAL(15,2) | Thu nhập tối thiểu | NOT NULL | 0 |
| `max_income` | DECIMAL(15,2) | Thu nhập tối đa | NULLABLE | NULL |
| `description` | TEXT | Mô tả | NULLABLE | NULL |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |

#### Bảng: `insurance_config`

**Mô tả**: Cấu hình bảo hiểm (BHXH, BHTN, BHYT)

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `contract_type` | VARCHAR(30) | Loại hợp đồng áp dụng | NOT NULL | - |
| `bhxh_rate` | DECIMAL(5,2) | Tỷ lệ BHXH (%) | NOT NULL | 10.00 |
| `bhtn_rate` | DECIMAL(5,2) | Tỷ lệ BHTN (%) | NOT NULL | 5.00 |
| `bhyt_rate` | DECIMAL(5,2) | Tỷ lệ BHYT (%) | NOT NULL | 5.00 |
| `effective_date` | DATE | Ngày hiệu lực | NOT NULL | - |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |

**Constraints**: `UNIQUE(contract_type, effective_date)`

#### Bảng: `allowance_config`

**Mô tả**: Danh mục phụ cấp

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `code` | VARCHAR(50) | Mã phụ cấp | UNIQUE, NOT NULL | - |
| `name` | VARCHAR(100) | Tên phụ cấp | NOT NULL | - |
| `description` | TEXT | Mô tả | NULLABLE | NULL |
| `default_amount` | DECIMAL(15,2) | Số tiền mặc định | NULLABLE | NULL |
| `status` | VARCHAR(20) | Trạng thái | NOT NULL | 'ACTIVE' |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |

#### Bảng: `holiday`

**Mô tả**: Ngày lễ (để tính OT hệ số 3.0)

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `holiday_date` | DATE | Ngày lễ | UNIQUE, NOT NULL | - |
| `name` | VARCHAR(100) | Tên ngày lễ | NOT NULL | - |
| `description` | TEXT | Mô tả | NULLABLE | NULL |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |

### 2.2 TypeScript Interfaces

```ts
// ===== Salary Factor =====
interface SalaryFactor {
  id: string
  code: string               // 'OT_WEEKDAY', 'OT_SUNDAY', 'OT_HOLIDAY'
  name: string               // Tên hệ số
  value: number              // 1.5, 2.0, 3.0
  description?: string
  effectiveDate: string      // ISO date
}

interface SalaryFactorUpdateRequest {
  code: string
  value: number
}

// ===== Tax Config =====
interface TaxConfig {
  id: string
  code: string               // 'TAX_LEVEL_1' ... 'TAX_LEVEL_7'
  taxRate: number            // 5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0
  minIncome: number
  maxIncome?: number         // null cho bậc cuối (không giới hạn)
  description?: string
}

// ===== Insurance Config =====
interface InsuranceConfig {
  id: string
  contractType: string       // 'OFFICIAL', 'PROBATION', 'SEASONAL'
  bhxhRate: number           // 10.00
  bhtnRate: number           // 5.00
  bhytRate: number           // 5.00
  effectiveDate: string
}

// ===== Allowance Config =====
interface AllowanceConfig {
  id: string
  code: string               // 'LUNCH', 'TRANSPORT', 'PHONE'...
  name: string
  description?: string
  defaultAmount?: number     // Số tiền mặc định
  status: 'ACTIVE' | 'INACTIVE'
}

interface AllowanceConfigCreateRequest {
  code: string
  name: string
  description?: string
  defaultAmount?: number
  status: 'ACTIVE' | 'INACTIVE'
}

// ===== Holiday =====
interface Holiday {
  id: string
  holidayDate: string        // 'YYYY-MM-DD'
  name: string
  description?: string
}

interface HolidayCreateRequest {
  holidayDate: string        // 'YYYY-MM-DD'
  name: string
  description?: string
}

// ===== Response Wrappers =====
// Config APIs trả về MẢNG (không có pagination)
interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: T
}

// Dùng cho config list: ApiResponse<SalaryFactor[]>, ApiResponse<TaxConfig[]>...
```

---

## 3. API Endpoints

### 3.1 Tổng quan

| STT | Method | Endpoint | Mô tả | Auth |
|-----|--------|----------|-------|------|
| 1 | `GET` | `/api/v1/config/salary-factors` | Lấy danh sách hệ số lương | ✅ HR_MANAGER |
| 2 | `PUT` | `/api/v1/config/salary-factors` | Cập nhật hệ số lương | ✅ HR_MANAGER |
| 3 | `GET` | `/api/v1/config/tax` | Lấy cấu hình thuế TNCN | ✅ HR_MANAGER, ACCOUNTANT |
| 4 | `GET` | `/api/v1/config/insurance` | Lấy cấu hình bảo hiểm | ✅ HR_MANAGER, ACCOUNTANT |
| 5 | `GET` | `/api/v1/config/holidays` | Lấy danh sách ngày lễ | ✅ HR_MANAGER |
| 6 | `POST` | `/api/v1/config/holidays` | Thêm ngày lễ mới | ✅ HR_MANAGER |

> ⚠️ **Quan trọng**: Các API config trả về **mảng** (KHÔNG có pagination), KHÔNG có `/search`.

### 3.2 Chi tiết từng API

#### 3.2.1 Get Salary Factors

**`GET /api/v1/config/salary-factors`**

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": [
    {
      "id": "uuid",
      "code": "OT_WEEKDAY",
      "name": "Hệ số OT ngày thường",
      "value": 1.5,
      "description": "Hệ số tăng ca ngày thường (Thứ 2-6)",
      "effectiveDate": "2020-01-01"
    },
    {
      "id": "uuid",
      "code": "OT_SUNDAY",
      "name": "Hệ số OT Chủ nhật",
      "value": 2.0,
      "description": "Hệ số tăng ca Chủ nhật",
      "effectiveDate": "2020-01-01"
    },
    {
      "id": "uuid",
      "code": "OT_HOLIDAY",
      "name": "Hệ số OT ngày lễ",
      "value": 3.0,
      "description": "Hệ số tăng ca ngày lễ",
      "effectiveDate": "2020-01-01"
    }
  ]
}
```

---

#### 3.2.2 Update Salary Factors

**`PUT /api/v1/config/salary-factors`**

**Request Body:**
```json
[
  { "code": "OT_WEEKDAY", "value": 1.5 },
  { "code": "OT_SUNDAY", "value": 2.0 },
  { "code": "OT_HOLIDAY", "value": 3.0 }
]
```

**Response (200 OK):** Trả về danh sách đã cập nhật (tương tự GET)

---

#### 3.2.3 Get Tax Config

**`GET /api/v1/config/tax`**

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": [
    {
      "id": "uuid",
      "code": "TAX_LEVEL_1",
      "taxRate": 5.0,
      "minIncome": 0,
      "maxIncome": 5000000,
      "description": "Bậc 1: Thu nhập đến 5 triệu"
    },
    {
      "id": "uuid",
      "code": "TAX_LEVEL_2",
      "taxRate": 10.0,
      "minIncome": 5000000,
      "maxIncome": 10000000,
      "description": "Bậc 2: Thu nhập từ 5-10 triệu"
    }
  ]
}
```

> 📌 **Ghi chú**: Dữ liệu thuế TNCN chỉ **read-only** trên FE. Có 7 bậc lũy tiến theo luật VN.

---

#### 3.2.4 Get Insurance Config

**`GET /api/v1/config/insurance`**

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": [
    {
      "id": "uuid",
      "contractType": "OFFICIAL",
      "bhxhRate": 10.0,
      "bhtnRate": 5.0,
      "bhytRate": 5.0,
      "effectiveDate": "2020-01-01"
    },
    {
      "id": "uuid",
      "contractType": "PROBATION",
      "bhxhRate": 0.0,
      "bhtnRate": 0.0,
      "bhytRate": 0.0,
      "effectiveDate": "2020-01-01"
    }
  ]
}
```

> 📌 **Ghi chú**: Dữ liệu bảo hiểm chỉ **read-only** trên FE.

---

#### 3.2.5 Get Holidays

**`GET /api/v1/config/holidays?year=2026`**

**Query Parameters**: `year` (Integer, required)

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": [
    {
      "id": "uuid",
      "holidayDate": "2026-01-01",
      "name": "Tết Dương lịch",
      "description": "Ngày Tết Dương lịch"
    },
    {
      "id": "uuid",
      "holidayDate": "2026-04-30",
      "name": "30/4",
      "description": "Ngày Giải phóng miền Nam"
    }
  ]
}
```

---

#### 3.2.6 Create Holiday

**`POST /api/v1/config/holidays`**

**Request Body:**
```json
{
  "holidayDate": "2026-01-01",
  "name": "Tết Dương lịch",
  "description": "Ngày Tết Dương lịch"
}
```

**Response (201 Created):** Trả về Holiday object vừa tạo.

**Error (409 Duplicate):**
```json
{
  "status": "ERROR",
  "code": "ERR_DUPLICATE",
  "message": "Ngày lễ đã tồn tại",
  "timestamp": "2026-02-09T15:30:00Z",
  "errors": null
}
```

---

## 4. Validation Rules

### 4.1 Salary Factors (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `value` | Required | "Vui lòng nhập giá trị hệ số" |
| `value` | Phải > 0 | "Hệ số phải lớn hơn 0" |
| `value` | Kiểu số thập phân (max 5,2) | "Giá trị hệ số không hợp lệ" |

### 4.2 Tax Config & Insurance Config

> Chỉ **read-only** trên FE — không cần validation.

### 4.3 Allowance Config (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `code` | Required | "Vui lòng nhập mã phụ cấp" |
| `code` | Max 50 ký tự | "Mã phụ cấp tối đa 50 ký tự" |
| `code` | Chỉ chữ IN HOA, số, gạch dưới | "Mã phụ cấp chỉ gồm chữ IN HOA, số và gạch dưới" |
| `name` | Required | "Vui lòng nhập tên phụ cấp" |
| `name` | Max 100 ký tự | "Tên phụ cấp tối đa 100 ký tự" |
| `defaultAmount` | Phải >= 0 (nếu có) | "Số tiền mặc định phải >= 0" |
| `status` | Required | "Vui lòng chọn trạng thái" |

### 4.4 Holiday (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `holidayDate` | Required | "Vui lòng chọn ngày lễ" |
| `holidayDate` | Format YYYY-MM-DD | "Ngày lễ không hợp lệ" |
| `name` | Required | "Vui lòng nhập tên ngày lễ" |
| `name` | Max 100 ký tự | "Tên ngày lễ tối đa 100 ký tự" |

### 4.5 Business Validation (BE-side)

| Rule | Error Message |
|------|---------------|
| `holiday_date` phải unique | "Ngày lễ đã tồn tại" |
| `allowance_config.code` phải unique | "Mã phụ cấp đã tồn tại" |
| Salary factor `value` phải > 0 | "Giá trị hệ số phải lớn hơn 0" |

### 4.6 Ví dụ validation bằng Element Plus

```ts
import type { FormRules } from 'element-plus'

// Allowance Config form rules
const allowanceRules: FormRules = {
  code: [
    { required: true, message: 'Vui lòng nhập mã phụ cấp', trigger: 'blur' },
    { max: 50, message: 'Mã phụ cấp tối đa 50 ký tự', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9_]+$/,
      message: 'Mã phụ cấp chỉ gồm chữ IN HOA, số và gạch dưới',
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: 'Vui lòng nhập tên phụ cấp', trigger: 'blur' },
    { max: 100, message: 'Tên phụ cấp tối đa 100 ký tự', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }
  ]
}

// Holiday form rules
const holidayRules: FormRules = {
  holidayDate: [
    { required: true, message: 'Vui lòng chọn ngày lễ', trigger: 'change' }
  ],
  name: [
    { required: true, message: 'Vui lòng nhập tên ngày lễ', trigger: 'blur' },
    { max: 100, message: 'Tên ngày lễ tối đa 100 ký tự', trigger: 'blur' }
  ]
}
```

---

## 5. Màn hình & UI Components

### 5.1 Trang Cấu hình lương (SalaryConfigView) — Tab Layout

**Route**: `/config/salary`

**Layout tổng thể:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Cấu hình > Cấu hình lương              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┬──────────┬──────────┬──────────┬──────────┐        │
│  │ Hệ số   │ Thuế     │ Bảo hiểm │ Phụ cấp  │ Ngày lễ  │        │
│  │ lương   │ TNCN     │          │          │          │        │
│  └─────────┴──────────┴──────────┴──────────┴──────────┘        │
│                                                                  │
│  ┌─ Nội dung tab ────────────────────────────────────────┐      │
│  │                                                        │      │
│  │  (Nội dung thay đổi theo tab được chọn)               │      │
│  │                                                        │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Tab 1 — Hệ số lương (Salary Factors)

```
┌───────────────────────────────────────────────────────────────┐
│  Hệ số lương OT                                              │
│                                                               │
│  ┌─ Bảng hệ số ──────────────────────────────────────────┐  │
│  │ STT │ Mã hệ số    │ Tên hệ số          │ Giá trị │    │  │
│  │  1  │ OT_WEEKDAY  │ OT ngày thường     │ [1.5 ]  │    │  │
│  │  2  │ OT_SUNDAY   │ OT Chủ nhật        │ [2.0 ]  │    │  │
│  │  3  │ OT_HOLIDAY  │ OT ngày lễ         │ [3.0 ]  │    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│                              [💾 Lưu thay đổi]               │
│                              (v-if HR_MANAGER)                │
└───────────────────────────────────────────────────────────────┘
```

### 5.3 Tab 2 — Thuế TNCN (Tax Config) — Read-only

```
┌───────────────────────────────────────────────────────────────┐
│  Bảng thuế TNCN (7 bậc lũy tiến)                             │
│                                                               │
│  ┌─ Bảng thuế ───────────────────────────────────────────┐  │
│  │ Bậc │ Thuế suất │ Thu nhập tối thiểu │ Thu nhập tối đa│  │
│  │  1  │   5%      │            0       │   5.000.000    │  │
│  │  2  │  10%      │    5.000.000       │  10.000.000    │  │
│  │  3  │  15%      │   10.000.000       │  18.000.000    │  │
│  │  4  │  20%      │   18.000.000       │  32.000.000    │  │
│  │  5  │  25%      │   32.000.000       │  52.000.000    │  │
│  │  6  │  30%      │   52.000.000       │  80.000.000    │  │
│  │  7  │  35%      │   80.000.000       │  Không giới hạn│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  📌 Dữ liệu chỉ hiển thị, không chỉnh sửa được.            │
└───────────────────────────────────────────────────────────────┘
```

### 5.4 Tab 3 — Bảo hiểm (Insurance Config) — Read-only

```
┌───────────────────────────────────────────────────────────────┐
│  Cấu hình bảo hiểm theo loại hợp đồng                        │
│                                                               │
│  ┌─ Bảng bảo hiểm ──────────────────────────────────────┐  │
│  │ Loại HĐ     │ BHXH (%) │ BHTN (%) │ BHYT (%) │ HL   │  │
│  │ Chính thức  │  10.0%   │   5.0%   │   5.0%   │ 2020 │  │
│  │ Thử việc    │   0.0%   │   0.0%   │   0.0%   │ 2020 │  │
│  │ Thời vụ     │   0.0%   │   0.0%   │   0.0%   │ 2020 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  📌 Dữ liệu chỉ hiển thị, không chỉnh sửa được.            │
└───────────────────────────────────────────────────────────────┘
```

### 5.5 Tab 4 — Phụ cấp (Allowance Config)

```
┌───────────────────────────────────────────────────────────────┐
│  Danh mục phụ cấp                                             │
│                                                               │
│  [Trạng thái ▼ ]  [🔍 Tìm kiếm]  [↻ Đặt lại]               │
│                                                               │
│  [+ Thêm phụ cấp]                  (v-if HR_MANAGER)         │
│                                                               │
│  ┌─ Bảng phụ cấp ───────────────────────────────────────┐  │
│  │ STT │ Mã    │ Tên phụ cấp      │ Số tiền MĐ │ TT  │ ⋮ │  │
│  │  1  │ LUNCH │ Phụ cấp ăn trưa  │  800.000   │ ●   │ ⋮ │  │
│  │  2  │ TRANS │ Phụ cấp xăng xe  │  500.000   │ ●   │ ⋮ │  │
│  │  3  │ PHONE │ Phụ cấp điện thoại│  300.000   │ ○   │ ⋮ │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 5.6 Tab 5 — Ngày lễ (Holidays)

```
┌───────────────────────────────────────────────────────────────┐
│  Danh sách ngày lễ                                            │
│                                                               │
│  Năm: [2026 ▼ ]                                               │
│                                                               │
│  [+ Thêm ngày lễ]                   (v-if HR_MANAGER)        │
│                                                               │
│  ┌─ Bảng ngày lễ ───────────────────────────────────────┐  │
│  │ STT │ Ngày        │ Tên ngày lễ          │ Mô tả  │ ⋮ │  │
│  │  1  │ 01/01/2026  │ Tết Dương lịch       │ ...    │ 🗑│  │
│  │  2  │ 30/04/2026  │ Giải phóng miền Nam  │ ...    │ 🗑│  │
│  │  3  │ 01/05/2026  │ Quốc tế Lao động     │ ...    │ 🗑│  │
│  │  4  │ 02/09/2026  │ Quốc khánh           │ ...    │ 🗑│  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 5.7 Format hiển thị

- **Tiền tệ**: `Intl.NumberFormat('vi-VN')` → VD: `5.000.000`
- **Phần trăm**: `X%` → VD: `10%`
- **Ngày tháng**: `DD/MM/YYYY` → VD: `01/01/2026`

---

## 6. Luồng nghiệp vụ (Flow)

### 6.1 Flow Xem/Cập nhật hệ số lương

```
1. User mở trang Cấu hình lương → Tab "Hệ số lương" mặc định
2. FE gọi GET /config/salary-factors
3. BE trả về mảng 3 hệ số (OT_WEEKDAY, OT_SUNDAY, OT_HOLIDAY)
4. FE render bảng với cột value editable (el-input-number)
5. User thay đổi giá trị → nhấn "Lưu thay đổi"
6. FE validate (value > 0)
7. FE gọi PUT /config/salary-factors [{code, value}, ...]
8. Nếu thành công → ElMessage.success("Cập nhật hệ số lương thành công")
9. Nếu lỗi → ElMessage.error(error.message)
```

### 6.2 Flow Xem thuế & bảo hiểm (Read-only)

```
1. User chuyển sang tab "Thuế TNCN" hoặc "Bảo hiểm"
2. FE gọi GET /config/tax hoặc GET /config/insurance
3. BE trả về mảng dữ liệu
4. FE render bảng read-only (không có nút sửa)
```

### 6.3 Flow Quản lý phụ cấp (CRUD)

```
--- Thêm mới ---
1. User nhấn "+ Thêm phụ cấp" → Mở dialog form
2. User điền: code, name, description, defaultAmount, status
3. User nhấn "Lưu"
4. FE validate form → FE gọi POST /config/allowances
5. Thành công → ElMessage.success → Đóng dialog → Reload danh sách

--- Sửa ---
6. User nhấn icon "Sửa" → Mở dialog form với dữ liệu hiện tại
7. User chỉnh sửa (code bị disabled)
8. User nhấn "Lưu" → FE gọi PUT /config/allowances/{id}

--- Xóa ---
9. User nhấn icon "Xóa" → Confirm dialog
10. FE gọi DELETE /config/allowances/{id}
11. Thành công → ElMessage.success → Reload danh sách
```

### 6.4 Flow Quản lý ngày lễ

```
--- Xem danh sách ---
1. User chuyển sang tab "Ngày lễ"
2. FE gọi GET /config/holidays?year=2026
3. FE render bảng ngày lễ

--- Thêm mới ---
4. User nhấn "+ Thêm ngày lễ" → Mở dialog
5. User chọn ngày + nhập tên + mô tả
6. FE validate → FE gọi POST /config/holidays
7. Thành công → Đóng dialog → Reload danh sách

--- Xóa ---
8. User nhấn icon "Xóa" → Confirm dialog
9. FE gọi DELETE /config/holidays/{id}
10. Thành công → Reload danh sách

--- Đổi năm ---
11. User thay đổi bộ lọc năm → FE gọi GET /config/holidays?year={selectedYear}
```

---

## 7. Service Layer (Gọi API)

### 7.1 File: `src/api/config.service.ts`

```ts
import request from '@/utils/request'

// ===== Interfaces (import từ types) =====
export interface SalaryFactor {
  id: string
  code: string
  name: string
  value: number
  description?: string
  effectiveDate: string
}

export interface SalaryFactorUpdateRequest {
  code: string
  value: number
}

export interface TaxConfig {
  id: string
  code: string
  taxRate: number
  minIncome: number
  maxIncome?: number
  description?: string
}

export interface InsuranceConfig {
  id: string
  contractType: string
  bhxhRate: number
  bhtnRate: number
  bhytRate: number
  effectiveDate: string
}

export interface Holiday {
  id: string
  holidayDate: string
  name: string
  description?: string
}

export interface HolidayCreateRequest {
  holidayDate: string
  name: string
  description?: string
}

// ===== API Calls =====
const CONFIG_URL = '/config'

export const configService = {
  /** Lấy danh sách hệ số lương */
  getSalaryFactors() {
    return request.get<SalaryFactor[]>(`${CONFIG_URL}/salary-factors`)
  },

  /** Cập nhật hệ số lương */
  updateSalaryFactors(data: SalaryFactorUpdateRequest[]) {
    return request.put(`${CONFIG_URL}/salary-factors`, data)
  },

  /** Lấy cấu hình thuế TNCN (7 bậc) */
  getTaxConfig() {
    return request.get<TaxConfig[]>(`${CONFIG_URL}/tax`)
  },

  /** Lấy cấu hình bảo hiểm */
  getInsuranceConfig() {
    return request.get<InsuranceConfig[]>(`${CONFIG_URL}/insurance`)
  },

  /** Lấy danh sách ngày lễ theo năm */
  getHolidays(year: number) {
    return request.get<Holiday[]>(`${CONFIG_URL}/holidays`, {
      params: { year }
    })
  },

  /** Thêm ngày lễ mới */
  createHoliday(data: HolidayCreateRequest) {
    return request.post(`${CONFIG_URL}/holidays`, data)
  }
}
```

### 7.2 Cách sử dụng trong Vue Component

```ts
// ===== Trong <script setup> =====
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { configService } from '@/api/config.service'
import type { SalaryFactor, SalaryFactorUpdateRequest } from '@/api/config.service'

// State
const loading = ref(false)
const salaryFactors = ref<SalaryFactor[]>([])

// ===== Load hệ số lương =====
async function fetchSalaryFactors() {
  loading.value = true
  try {
    const res = await configService.getSalaryFactors()
    salaryFactors.value = res.data
  } catch (error: any) {
    ElMessage.error(error || 'Lỗi khi tải hệ số lương')
  } finally {
    loading.value = false
  }
}

// ===== Cập nhật hệ số =====
async function handleSaveFactors() {
  try {
    const updates: SalaryFactorUpdateRequest[] = salaryFactors.value.map(f => ({
      code: f.code,
      value: f.value
    }))
    await configService.updateSalaryFactors(updates)
    ElMessage.success('Cập nhật hệ số lương thành công')
  } catch (error: any) {
    ElMessage.error(error || 'Lỗi khi cập nhật')
  }
}

onMounted(() => {
  fetchSalaryFactors()
})
```

---

## 8. Router Configuration

```ts
// src/router/index.ts (hoặc file routes riêng)

const configRoutes = [
  {
    path: '/config/salary',
    name: 'SalaryConfig',
    component: () => import('@/views/config/SalaryConfigView.vue'),
    meta: {
      title: 'Cấu hình lương',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],
      icon: 'Setting'
    }
  }
]
```

**Cấu trúc thư mục Vue:**

```
src/views/config/
├── SalaryConfigView.vue          # Trang chính với el-tabs (5 tabs)
├── tabs/
│   ├── SalaryFactorTab.vue       # Tab hệ số lương (editable)
│   ├── TaxConfigTab.vue          # Tab thuế TNCN (read-only)
│   ├── InsuranceConfigTab.vue    # Tab bảo hiểm (read-only)
│   ├── AllowanceConfigTab.vue    # Tab phụ cấp (CRUD)
│   └── HolidayTab.vue           # Tab ngày lễ (thêm/xóa)
```

**Xác định tab active trong SalaryConfigView.vue:**

```ts
import { ref } from 'vue'

const activeTab = ref('salary-factors') // Tab mặc định
```

---

## 9. Phân quyền (RBAC)

### 9.1 Phân quyền theo role

| Chức năng | HR_MANAGER | ACCOUNTANT |
|-----------|:----------:|:----------:|
| Tab Hệ số lương — Xem | ✅ | ❌ |
| Tab Hệ số lương — Sửa | ✅ | ❌ |
| Tab Thuế TNCN — Xem | ✅ | ✅ |
| Tab Bảo hiểm — Xem | ✅ | ✅ |
| Tab Phụ cấp — Xem | ✅ | ❌ |
| Tab Phụ cấp — Thêm/Sửa/Xóa | ✅ | ❌ |
| Tab Ngày lễ — Xem | ✅ | ❌ |
| Tab Ngày lễ — Thêm/Xóa | ✅ | ❌ |

### 9.2 Áp dụng trong template

```vue
<template>
  <el-tabs v-model="activeTab">
    <!-- Tab Hệ số lương: chỉ HR_MANAGER -->
    <el-tab-pane
      v-if="hasPermission(['HR_MANAGER'])"
      label="Hệ số lương"
      name="salary-factors"
    >
      <SalaryFactorTab />
    </el-tab-pane>

    <!-- Tab Thuế TNCN: cả 2 role -->
    <el-tab-pane label="Thuế TNCN" name="tax">
      <TaxConfigTab />
    </el-tab-pane>

    <!-- Tab Bảo hiểm: cả 2 role -->
    <el-tab-pane label="Bảo hiểm" name="insurance">
      <InsuranceConfigTab />
    </el-tab-pane>

    <!-- Tab Phụ cấp: chỉ HR_MANAGER -->
    <el-tab-pane
      v-if="hasPermission(['HR_MANAGER'])"
      label="Phụ cấp"
      name="allowance"
    >
      <AllowanceConfigTab />
    </el-tab-pane>

    <!-- Tab Ngày lễ: chỉ HR_MANAGER -->
    <el-tab-pane
      v-if="hasPermission(['HR_MANAGER'])"
      label="Ngày lễ"
      name="holidays"
    >
      <HolidayTab />
    </el-tab-pane>
  </el-tabs>
</template>
```

---

## 10. Enums & Constants

```ts
// src/constants/enums.ts (bổ sung cho module config)

// ===== Mã hệ số OT =====
export enum SalaryFactorCode {
  OT_WEEKDAY = 'OT_WEEKDAY',
  OT_SUNDAY = 'OT_SUNDAY',
  OT_HOLIDAY = 'OT_HOLIDAY'
}

export const SalaryFactorLabel: Record<SalaryFactorCode, string> = {
  [SalaryFactorCode.OT_WEEKDAY]: 'OT ngày thường (Thứ 2-6)',
  [SalaryFactorCode.OT_SUNDAY]: 'OT Chủ nhật',
  [SalaryFactorCode.OT_HOLIDAY]: 'OT ngày lễ'
}

// ===== Bậc thuế TNCN =====
export enum TaxLevel {
  TAX_LEVEL_1 = 'TAX_LEVEL_1',
  TAX_LEVEL_2 = 'TAX_LEVEL_2',
  TAX_LEVEL_3 = 'TAX_LEVEL_3',
  TAX_LEVEL_4 = 'TAX_LEVEL_4',
  TAX_LEVEL_5 = 'TAX_LEVEL_5',
  TAX_LEVEL_6 = 'TAX_LEVEL_6',
  TAX_LEVEL_7 = 'TAX_LEVEL_7'
}

export const TaxLevelLabel: Record<TaxLevel, string> = {
  [TaxLevel.TAX_LEVEL_1]: 'Bậc 1 (5%)',
  [TaxLevel.TAX_LEVEL_2]: 'Bậc 2 (10%)',
  [TaxLevel.TAX_LEVEL_3]: 'Bậc 3 (15%)',
  [TaxLevel.TAX_LEVEL_4]: 'Bậc 4 (20%)',
  [TaxLevel.TAX_LEVEL_5]: 'Bậc 5 (25%)',
  [TaxLevel.TAX_LEVEL_6]: 'Bậc 6 (30%)',
  [TaxLevel.TAX_LEVEL_7]: 'Bậc 7 (35%)'
}

// ===== Loại hợp đồng (cho Insurance Config) =====
// Đã có trong FE-API-CONFIG: ContractType, ContractTypeLabel

// ===== Trạng thái phụ cấp =====
// Đã có trong FE-API-CONFIG: Status, StatusLabel, StatusTagType
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
| 400 | ERR_VALIDATION | Giá trị hệ số không hợp lệ | Hiển thị lỗi dưới field tương ứng |
| 401 | - | Token hết hạn | Redirect login (interceptor) |
| 403 | - | Không có quyền (VD: ACCOUNTANT sửa config) | `ElMessage.error('Bạn không có quyền')` |
| 409 | ERR_DUPLICATE | Ngày lễ / mã phụ cấp đã tồn tại | `ElMessage.error(message)` |
| 500 | - | Lỗi server | `ElMessage.error('Lỗi hệ thống')` |

### 11.3 Xử lý lỗi khi cập nhật Salary Factors

```ts
async function handleSaveFactors() {
  try {
    // Validate client-side
    const invalid = salaryFactors.value.some(f => f.value <= 0)
    if (invalid) {
      ElMessage.warning('Giá trị hệ số phải lớn hơn 0')
      return
    }

    const updates = salaryFactors.value.map(f => ({
      code: f.code,
      value: f.value
    }))
    await configService.updateSalaryFactors(updates)
    ElMessage.success('Cập nhật hệ số lương thành công')
  } catch (error: any) {
    if (error?.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: { field: string; message: string }) => {
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
- [ ] Kiểm tra `config.service.ts` đã có trong `src/api/`
- [ ] Kiểm tra enums `SalaryFactorCode`, `TaxLevel` đã có trong `src/constants/enums.ts`
- [ ] Kiểm tra router config `/config/salary` đã config

### 12.2 Phát triển

- [ ] **SalaryConfigView.vue** (Trang chính)
  - [ ] Layout el-tabs với 5 tabs
  - [ ] Phân quyền hiển thị tabs (v-if)
  - [ ] Breadcrumb

- [ ] **SalaryFactorTab.vue**
  - [ ] Bảng 3 dòng hệ số OT (editable)
  - [ ] el-input-number cho cột value
  - [ ] Nút "Lưu thay đổi" (phân quyền HR_MANAGER)
  - [ ] Validation value > 0
  - [ ] Loading state

- [ ] **TaxConfigTab.vue**
  - [ ] Bảng read-only 7 bậc thuế
  - [ ] Format tiền VND (Intl.NumberFormat)
  - [ ] Format phần trăm (%)
  - [ ] Loading state

- [ ] **InsuranceConfigTab.vue**
  - [ ] Bảng read-only theo loại hợp đồng
  - [ ] Format phần trăm (%)
  - [ ] Hiển thị ContractTypeLabel
  - [ ] Loading state

- [ ] **AllowanceConfigTab.vue**
  - [ ] Bảng danh mục phụ cấp
  - [ ] Filter trạng thái
  - [ ] Nút "Thêm phụ cấp" (phân quyền HR_MANAGER)
  - [ ] Dialog form thêm/sửa phụ cấp
  - [ ] Validation rules cho form
  - [ ] Action: Sửa, Xóa (phân quyền)
  - [ ] Confirm dialog khi xóa
  - [ ] Format tiền VND cho cột defaultAmount
  - [ ] Loading state

- [ ] **HolidayTab.vue**
  - [ ] Bảng ngày lễ theo năm
  - [ ] Bộ lọc năm (el-select hoặc el-date-picker year)
  - [ ] Nút "Thêm ngày lễ" (phân quyền HR_MANAGER)
  - [ ] Dialog form thêm ngày lễ
  - [ ] Validation rules cho form
  - [ ] Nút xóa ngày lễ + confirm dialog
  - [ ] Format ngày DD/MM/YYYY
  - [ ] Loading state

### 12.3 Kiểm thử

- [ ] Test tab Hệ số lương: xem + sửa + lưu + validation (value = 0, value < 0)
- [ ] Test tab Thuế TNCN: xem dữ liệu read-only
- [ ] Test tab Bảo hiểm: xem dữ liệu read-only
- [ ] Test tab Phụ cấp: thêm + sửa + xóa + validation + duplicate code
- [ ] Test tab Ngày lễ: thêm + xóa + đổi năm + validation + duplicate date
- [ ] Test phân quyền (ACCOUNTANT chỉ thấy tab Thuế TNCN, Bảo hiểm)
- [ ] Test responsive (mobile, tablet)
- [ ] Test loading state khi gọi API
- [ ] Test error handling (lỗi mạng, lỗi BE)

---

> **Ghi chú cuối**: Tài liệu này được tạo dựa trên HLD v2.0, DD-HRM-PAYROLL v1.0 và API_SPECIFICATIONS v1.0. Nếu BE thay đổi API, cần cập nhật lại tài liệu tương ứng.
