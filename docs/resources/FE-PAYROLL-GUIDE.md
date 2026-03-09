# Tài liệu FE — Module Tính lương (Payroll Processing)

> **Tài liệu tham chiếu**: [HLD.md](./04-HLD/HLD.md) | [DD-HRM-PAYROLL.md](./06-DD/DD-HRM-PAYROLL.md) | [FE-API-CONFIG.md](./FE-API-CONFIG.md) | [FE-CONTRACT-GUIDE.md](./FE-CONTRACT-GUIDE.md)
> **Ngày tạo**: 2026-03-02
> **Mục đích**: Hướng dẫn FE developer triển khai module Tính lương (Payroll Processing)
> **Phân quyền**: HR_MANAGER (tính lương, CRUD), ACCOUNTANT (chỉ xem)

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

Module **Tính lương (Payroll Processing)** là chức năng core của hệ thống. HR Manager thực hiện tính lương cho nhân viên theo tháng, hệ thống gọi stored procedure để tính lương qua 3 phases: tính lương theo công, tính lương tăng ca, tính bảo hiểm & thuế TNCN. Kết quả lưu vào bảng `payroll` với trạng thái `UNPAID`, sau đó Accountant sẽ tạo phiếu chi để chuyển sang `PAID`.

### 1.2 Chức năng chính

| STT | Chức năng | Mô tả | Phân quyền |
|-----|-----------|-------|------------|
| 1 | Tính lương | Tính lương nhân viên theo tháng (gọi stored procedure 3 phases) | HR_MANAGER |
| 2 | Danh sách bảng lương | Tìm kiếm, lọc theo tháng/năm/phòng ban/trạng thái, phân trang | HR_MANAGER, ACCOUNTANT |
| 3 | Xem chi tiết bảng lương | Xem chi tiết lương: theo công, tăng ca, bảo hiểm, thuế, tổng kết | HR_MANAGER, ACCOUNTANT |
| 4 | Cập nhật bảng lương | Điều chỉnh thủ công (manual adjustment) — chỉ UNPAID | HR_MANAGER |
| 5 | Xóa bảng lương | Xóa bảng lương (chỉ trạng thái UNPAID) | HR_MANAGER |

### 1.3 Quan hệ với các module khác

```
EMPLOYEE ──── 1:N ──── PAYROLL (emp_id FK)
CONTRACT ──── provides ──── base_salary, offer_salary, salary_type
ATTENDANCE ──── provides ──── working_days, ot_hours
REWARD ──── N:1 ──── PAYROLL (emp_id + month + year)
PENALTY ──── N:1 ──── PAYROLL (emp_id + month + year)
EMPLOYEE_ALLOWANCE ──── provides ──── allowance
PAYROLL ──── 1:1 ──── SALARY_PAYMENT (payroll_id FK)
```

> ⚠️ **Lưu ý**: Payroll phụ thuộc vào Contract (lương) và Attendance (công). Trước khi tính lương, nhân viên phải có hợp đồng ACTIVE và dữ liệu chấm công trong tháng đó. Constraint `UNIQUE(emp_id, month_num, year_num)` — mỗi NV chỉ có 1 bảng lương/tháng.

---

## 2. Data Model & Interfaces

### 2.1 Database Schema — Bảng `payroll`

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | UUID | Primary key | PK, NOT NULL | gen_random_uuid() |
| `emp_id` | UUID | FK đến employee | FK, NOT NULL | - |
| `month_num` | INT | Tháng (1-12) | NOT NULL | - |
| `year_num` | INT | Năm | NOT NULL | - |
| `basic_salary` | DECIMAL(15,2) | Lương cơ bản (tính BHXH) | NOT NULL | - |
| `offer_salary` | DECIMAL(15,2) | Lương thỏa thuận | NOT NULL | - |
| `working_days` | DECIMAL(5,2) | Số ngày làm thực tế | NOT NULL | 0 |
| `standard_days` | INT | Số công chuẩn (Mon-Fri) | NOT NULL | 26 |
| `working_salary` | DECIMAL(15,2) | Lương theo công | NOT NULL | 0 |
| `allowance` | DECIMAL(15,2) | Tổng phụ cấp | NOT NULL | 0 |
| `reward_amount` | DECIMAL(15,2) | Tổng thưởng | NOT NULL | 0 |
| `penalty_amount` | DECIMAL(15,2) | Tổng phạt | NOT NULL | 0 |
| `ot_hours` | DECIMAL(7,2) | Tổng giờ tăng ca | NOT NULL | 0 |
| `ot_salary` | DECIMAL(15,2) | Lương tăng ca | NOT NULL | 0 |
| `bhxh_amount` | DECIMAL(15,2) | Bảo hiểm xã hội (10%) | NOT NULL | 0 |
| `bhtn_amount` | DECIMAL(15,2) | Bảo hiểm thất nghiệp (5%) | NOT NULL | 0 |
| `bhyt_amount` | DECIMAL(15,2) | Bảo hiểm y tế (5%) | NOT NULL | 0 |
| `tax_amount` | DECIMAL(15,2) | Thuế TNCN (7 bậc lũy tiến) | NOT NULL | 0 |
| `total_salary` | DECIMAL(15,2) | Lương thực nhận | NOT NULL | 0 |
| `gross_net` | VARCHAR(10) | Loại lương | NOT NULL | 'GROSS' |
| `status` | VARCHAR(20) | Trạng thái | NOT NULL | 'UNPAID' |
| `calculated_at` | TIMESTAMP | Thời điểm tính lương | NOT NULL | CURRENT_TIMESTAMP |
| `calculated_by` | VARCHAR(100) | Người tính | NOT NULL | - |
| `created_at` | TIMESTAMP | Thời điểm tạo | NOT NULL | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật | NOT NULL | CURRENT_TIMESTAMP |

### 2.2 TypeScript Interfaces

```ts
// ===== Payroll Response Object =====
interface Payroll {
  id: string
  empId: string
  employeeName?: string        // BE trả thêm (join employee)
  employeeCode?: string        // BE trả thêm (join employee)
  departmentName?: string      // BE trả thêm (join department)
  monthNum: number             // 1-12
  yearNum: number
  basicSalary: number          // Lương cơ bản (tính BHXH)
  offerSalary: number          // Lương thỏa thuận (từ HĐ)
  workingDays: number          // Số ngày làm thực tế
  standardDays: number         // Số công chuẩn (26)
  workingSalary: number        // Lương theo công = offer * (actual/standard)
  allowance: number            // Tổng phụ cấp
  rewardAmount: number         // Tổng thưởng
  penaltyAmount: number        // Tổng phạt
  otHours: number              // Tổng giờ tăng ca
  otSalary: number             // Lương tăng ca
  bhxhAmount: number           // BHXH (10%)
  bhtnAmount: number           // BHTN (5%)
  bhytAmount: number           // BHYT (5%)
  taxAmount: number            // Thuế TNCN
  totalSalary: number          // Lương thực nhận
  grossNet: 'GROSS' | 'NET'
  status: 'UNPAID' | 'PAID'
  calculatedAt: string
  calculatedBy: string
  createdAt: string
  updatedAt: string
}

// ===== Calculate Payroll Request =====
interface PayrollCalculateRequest {
  employeeCode: string         // Mã nhân viên (VD: "NV20260101001")
  monthYear: string            // Format: "YYYY-MM" (VD: "2026-01")
}

// ===== Search Request =====
interface PayrollSearchRequest {
  keyword?: string             // Tìm theo mã NV, tên NV
  monthNum?: number            // Filter theo tháng (1-12)
  yearNum?: number             // Filter theo năm
  deptId?: string              // Filter theo phòng ban
  status?: string              // UNPAID | PAID
  page: number                 // 0-indexed
  size: number                 // Default: 10
  sort?: string                // VD: "totalSalary,desc"
}

// ===== Update Request (Manual Adjustment) =====
interface PayrollUpdateRequest {
  workingDays?: number         // Điều chỉnh ngày công
  allowance?: number           // Điều chỉnh phụ cấp
  rewardAmount?: number        // Điều chỉnh thưởng
  penaltyAmount?: number       // Điều chỉnh phạt
  otHours?: number             // Điều chỉnh giờ OT
  note?: string                // Lý do điều chỉnh
}

// ===== Paginated Response =====
interface PayrollPageResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: {
    content: Payroll[]
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

// ===== Single Response =====
interface PayrollResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: Payroll
}

// ===== Calculate Response =====
interface PayrollCalculateResponse {
  status: 'SUCCESS' | 'ERROR'
  code: string | null
  message: string
  timestamp: string
  data: Payroll
}
```

---

## 3. API Endpoints

### 3.1 Tổng quan

| STT | Method | Endpoint | Mô tả | Auth |
|-----|--------|----------|-------|------|
| 1 | `POST` | `/api/v1/payroll/calculate` | Tính lương (gọi stored procedure) | ✅ HR_MANAGER |
| 2 | `POST` | `/api/v1/payroll/search` | Tìm kiếm / Danh sách bảng lương | ✅ HR_MANAGER, ACCOUNTANT |
| 3 | `GET` | `/api/v1/payroll/{id}` | Chi tiết bảng lương | ✅ HR_MANAGER, ACCOUNTANT |
| 4 | `PUT` | `/api/v1/payroll/{id}` | Cập nhật bảng lương (manual adjustment) | ✅ HR_MANAGER |
| 5 | `DELETE` | `/api/v1/payroll/{id}` | Xóa bảng lương (chỉ UNPAID) | ✅ HR_MANAGER |

> ⚠️ Danh sách dùng **`POST /search`** — filter gửi trong **request body**.
> ⚠️ API **calculate** là core — gọi stored procedure 3 phases trong database.

### 3.2 Chi tiết từng API

#### 3.2.1 Calculate Payroll ⭐ (Core)

**`POST /api/v1/payroll/calculate`**

**Request Body:**
```json
{
  "employeeCode": "NV20260101001",
  "monthYear": "2026-01"
}
```

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "Tính lương thành công",
  "timestamp": "2026-03-02T10:00:00Z",
  "data": {
    "id": "b60e8400-e29b-41d4-a716-446655440001",
    "empId": "550e8400-e29b-41d4-a716-446655440001",
    "employeeName": "Nguyễn Văn A",
    "employeeCode": "NV20260101001",
    "departmentName": "Phòng Kỹ thuật",
    "monthNum": 1,
    "yearNum": 2026,
    "basicSalary": 10000000,
    "offerSalary": 15000000,
    "workingDays": 22,
    "standardDays": 26,
    "workingSalary": 12692307.69,
    "allowance": 1000000,
    "rewardAmount": 500000,
    "penaltyAmount": 0,
    "otHours": 10,
    "otSalary": 1200000,
    "bhxhAmount": 1000000,
    "bhtnAmount": 500000,
    "bhytAmount": 500000,
    "taxAmount": 850000,
    "totalSalary": 12542307.69,
    "grossNet": "GROSS",
    "status": "UNPAID",
    "calculatedAt": "2026-03-02T10:00:00Z",
    "calculatedBy": "hr_manager",
    "createdAt": "2026-03-02T10:00:00Z",
    "updatedAt": "2026-03-02T10:00:00Z"
  }
}
```

**Business Logic (BE xử lý — FE chỉ gọi API):**
1. Validate employee exists và ACTIVE
2. Check contract ACTIVE trong tháng
3. Check attendance data exists
4. Gọi stored procedure `CALCULATE_PAYROLL(employee_code, month_year)`:
   - **Phase 1**: `CALCULATE_WORKING_SALARY` — Lương theo công + phụ cấp + thưởng/phạt
   - **Phase 2**: `CALCULATE_OT_SALARY` — Lương tăng ca (hệ số 1.5x/2.0x/3.0x)
   - **Phase 3**: `CALCULATE_INSURANCE_TAX` — BHXH/BHTN/BHYT + Thuế TNCN (7 bậc lũy tiến)
5. INSERT hoặc UPDATE payroll record (ON CONFLICT → recalculate)
6. Return payroll data

#### 3.2.2 Search Payroll

**`POST /api/v1/payroll/search`**

**Request Body:**
```json
{
  "keyword": "NV2026",
  "monthNum": 1,
  "yearNum": 2026,
  "deptId": null,
  "status": "UNPAID",
  "page": 0,
  "size": 10,
  "sort": "totalSalary,desc"
}
```

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-03-02T10:00:00Z",
  "data": {
    "content": [
      {
        "id": "b60e8400-e29b-41d4-a716-446655440001",
        "empId": "550e8400-e29b-41d4-a716-446655440001",
        "employeeName": "Nguyễn Văn A",
        "employeeCode": "NV20260101001",
        "departmentName": "Phòng Kỹ thuật",
        "monthNum": 1,
        "yearNum": 2026,
        "basicSalary": 10000000,
        "offerSalary": 15000000,
        "workingDays": 22,
        "standardDays": 26,
        "workingSalary": 12692307.69,
        "allowance": 1000000,
        "rewardAmount": 500000,
        "penaltyAmount": 0,
        "otHours": 10,
        "otSalary": 1200000,
        "bhxhAmount": 1000000,
        "bhtnAmount": 500000,
        "bhytAmount": 500000,
        "taxAmount": 850000,
        "totalSalary": 12542307.69,
        "grossNet": "GROSS",
        "status": "UNPAID",
        "calculatedAt": "2026-03-02T10:00:00Z",
        "calculatedBy": "hr_manager",
        "createdAt": "2026-03-02T10:00:00Z",
        "updatedAt": "2026-03-02T10:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### 3.2.3 Get Payroll by ID

**`GET /api/v1/payroll/{id}`** → Response tương tự single Payroll object.

#### 3.2.4 Update Payroll (Manual Adjustment)

**`PUT /api/v1/payroll/{id}`**

```json
{
  "workingDays": 23,
  "allowance": 1500000,
  "rewardAmount": 1000000,
  "penaltyAmount": 200000,
  "otHours": 12,
  "note": "Điều chỉnh ngày công và bổ sung thưởng"
}
```

**Response (200 OK):** Trả về Payroll object đã cập nhật (BE tính lại total_salary).

> ⚠️ **Lưu ý**: Chỉ update được payroll có `status = UNPAID`. Nếu `PAID` → trả lỗi 400.

#### 3.2.5 Delete Payroll

**`DELETE /api/v1/payroll/{id}`** — Response 204 No Content.

> ⚠️ **Lưu ý**: Chỉ xóa được payroll có `status = UNPAID`. Nếu `PAID` hoặc đã có `salary_payment` → trả lỗi 400.

---

## 4. Validation Rules

### 4.1 Form Validation — Dialog Tính lương (FE-side)

| Field | Rule | Error Message |
|-------|------|---------------|
| `employeeCode` | Required | "Vui lòng chọn nhân viên" |
| `monthYear` | Required | "Vui lòng chọn tháng tính lương" |
| `monthYear` | Format YYYY-MM | "Tháng không hợp lệ" |
| `monthYear` | Không cho chọn tương lai | "Không thể tính lương cho tháng trong tương lai" |

### 4.2 Form Validation — Update (Manual Adjustment)

| Field | Rule | Error Message |
|-------|------|---------------|
| `workingDays` | >= 0, <= standardDays | "Ngày công phải từ 0 đến {standardDays}" |
| `allowance` | >= 0 | "Phụ cấp phải >= 0" |
| `rewardAmount` | >= 0 | "Thưởng phải >= 0" |
| `penaltyAmount` | >= 0 | "Phạt phải >= 0" |
| `otHours` | >= 0 | "Giờ OT phải >= 0" |
| `note` | Required khi update | "Vui lòng nhập lý do điều chỉnh" |

### 4.3 Business Validation (BE-side)

| Rule | Error Message |
|------|---------------|
| Employee phải ACTIVE | "Nhân viên không tồn tại hoặc không active" |
| Contract ACTIVE trong tháng | "Không tìm thấy hợp đồng hiệu lực" |
| Attendance data phải có | "Chưa có dữ liệu chấm công cho tháng này" |
| `UNIQUE(emp_id, month_num, year_num)` | Tính lại (ON CONFLICT → UPDATE) |
| Chỉ xóa/sửa UNPAID | "Không thể sửa/xóa bảng lương đã thanh toán" |
| Không xóa payroll đã có payment | "Không thể xóa bảng lương vì đã có phiếu chi" |

### 4.4 Ví dụ validation bằng Element Plus

```ts
import type { FormRules } from 'element-plus'

// Rules cho dialog Tính lương
const calculateRules: FormRules = {
  employeeCode: [
    { required: true, message: 'Vui lòng chọn nhân viên', trigger: 'change' }
  ],
  monthYear: [
    { required: true, message: 'Vui lòng chọn tháng tính lương', trigger: 'change' }
  ]
}

// Rules cho form Update (Manual Adjustment)
const updateRules: FormRules = {
  workingDays: [
    { type: 'number', min: 0, message: 'Ngày công phải >= 0', trigger: 'blur' }
  ],
  allowance: [
    { type: 'number', min: 0, message: 'Phụ cấp phải >= 0', trigger: 'blur' }
  ],
  rewardAmount: [
    { type: 'number', min: 0, message: 'Thưởng phải >= 0', trigger: 'blur' }
  ],
  penaltyAmount: [
    { type: 'number', min: 0, message: 'Phạt phải >= 0', trigger: 'blur' }
  ],
  otHours: [
    { type: 'number', min: 0, message: 'Giờ OT phải >= 0', trigger: 'blur' }
  ],
  note: [
    { required: true, message: 'Vui lòng nhập lý do điều chỉnh', trigger: 'blur' }
  ]
}
```

---

## 5. Màn hình & UI Components

### 5.1 Danh sách bảng lương (PayrollList)

**Route**: `/payroll`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Tính lương > Bảng lương                    │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─ Bộ lọc ──────────────────────────────────────────────────┐      │
│  │  [Từ khóa __________]  [Tháng ▼]  [Năm ▼ ]               │      │
│  │  [Phòng ban ▼ ]       [Trạng thái ▼]                      │      │
│  │  [🔍 Tìm kiếm] [↻ Đặt lại]                               │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  [📊 Tính lương]          [📥 Xuất Excel]                           │
│                                                                      │
│  ┌─ Bảng dữ liệu ──────────────────────────────────────────────┐   │
│  │ STT│ Mã NV       │ Tên NV        │ Phòng ban  │ Tháng/Năm  │   │
│  │    │ Lương TT    │ Ngày công     │ Lương TC   │ OT (giờ)   │   │
│  │    │ Lương OT    │ Phụ cấp       │ Thưởng     │ Phạt       │   │
│  │    │ BHXH+BH     │ Thuế TNCN     │ Thực nhận  │ TT  │ ⋮   │   │
│  │────│─────────────│───────────────│────────────│─────│─────│   │
│  │  1 │ NV260101001 │ Nguyễn Văn A  │ Phòng KT   │ 01/2026    │   │
│  │    │ 15,000,000  │ 22/26         │12,692,308  │ 10         │   │
│  │    │  1,200,000  │ 1,000,000     │   500,000  │      0     │   │
│  │    │  2,000,000  │   850,000     │12,542,308  │ ●Chưa│ ⋮  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  [< 1 2 3 ... 5 >]           Hiển thị 1-10 / 45 bản ghi           │
│                                                                      │
│  ┌─ Tổng kết ────────────────────────────────────────────────┐      │
│  │  Tổng NV: 45  │  Tổng lương: 567,000,000 VNĐ             │      │
│  │  Chưa TT: 20  │  Đã TT: 25                                │      │
│  └────────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────┘
```

**Cột bảng dữ liệu:**

| Cột | Field | Width | Sortable | Mô tả |
|-----|-------|-------|----------|-------|
| STT | - | 60px | ❌ | page * size + index + 1 |
| Mã NV | `employeeCode` | 130px | ✅ | Text |
| Tên NV | `employeeName` | 160px | ✅ | Text |
| Phòng ban | `departmentName` | 140px | ✅ | Text |
| Tháng/Năm | `monthNum` + `yearNum` | 100px | ✅ | Format: MM/YYYY |
| Lương TT | `offerSalary` | 130px | ✅ | Format: 15,000,000 VNĐ |
| Ngày công | `workingDays`/`standardDays` | 90px | ✅ | Format: 22/26 |
| Lương TC | `workingSalary` | 130px | ✅ | Lương theo công |
| OT (giờ) | `otHours` | 80px | ✅ | Số giờ OT |
| Lương OT | `otSalary` | 120px | ✅ | Lương tăng ca |
| Phụ cấp | `allowance` | 110px | ✅ | Tổng phụ cấp |
| Thưởng | `rewardAmount` | 110px | ✅ | Tổng thưởng |
| Phạt | `penaltyAmount` | 100px | ✅ | Tổng phạt |
| BH+Thuế | `bhxhAmount`+`bhtnAmount`+`bhytAmount`+`taxAmount` | 120px | ❌ | Tổng khấu trừ |
| Thuế TNCN | `taxAmount` | 110px | ✅ | Thuế TNCN |
| Thực nhận | `totalSalary` | 140px | ✅ | **Bold**, Format VNĐ |
| Trạng thái | `status` | 100px | ✅ | Tag: UNPAID = warning, PAID = success |
| Thao tác | - | 120px | ❌ | Xem, Sửa (UNPAID), Xóa (UNPAID) |

> 💡 **Gợi ý hiển thị**: Vì có quá nhiều cột, có thể ẩn bớt một số cột ít quan trọng (Phụ cấp, Thưởng, Phạt, BH+Thuế) và chỉ hiện khi user nhấn "Mở rộng" hoặc sử dụng `el-table-column` với `type="expand"`.

---

### 5.2 Chi tiết bảng lương (PayrollDetail) — Readonly

**Route**: `/payroll/:id`

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Trang chủ > Tính lương > Bảng lương > Chi tiết         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─ Section 1: Thông tin nhân viên ──────────────────────────┐      │
│  │                                                            │      │
│  │  Mã NV:          NV20260101001                             │      │
│  │  Họ tên:         Nguyễn Văn A                              │      │
│  │  Phòng ban:      Phòng Kỹ thuật                            │      │
│  │  Kỳ lương:       Tháng 01/2026                             │      │
│  │  Loại lương:     GROSS (Gộp)                               │      │
│  │  Trạng thái:     ● Chưa thanh toán                         │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Section 2: Lương theo công ──────────────────────────────┐      │
│  │                                                            │      │
│  │  Lương cơ bản (BHXH):     10,000,000 VNĐ                  │      │
│  │  Lương thỏa thuận:        15,000,000 VNĐ                  │      │
│  │  Ngày công chuẩn:         26 ngày                          │      │
│  │  Ngày công thực tế:       22 ngày                          │      │
│  │  ─────────────────────────────────────                     │      │
│  │  Lương theo công:         12,692,308 VNĐ                  │      │
│  │  (= 15,000,000 × 22/26)                                   │      │
│  │                                                            │      │
│  │  Phụ cấp:                  1,000,000 VNĐ                  │      │
│  │  Thưởng:                     500,000 VNĐ                  │      │
│  │  Phạt:                             0 VNĐ                  │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Section 3: Tăng ca ─────────────────────────────────────┐       │
│  │                                                            │      │
│  │  Tổng giờ tăng ca:        10 giờ                           │      │
│  │  Lương tăng ca:            1,200,000 VNĐ                  │      │
│  │                                                            │      │
│  │  (Chi tiết OT tính theo hệ số:                            │      │
│  │   Ngày thường: 1.5x | T7: 1.5x | CN: 2.0x | Lễ: 3.0x)   │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Section 4: Bảo hiểm & Thuế ─────────────────────────────┐      │
│  │                                                            │      │
│  │  BHXH (10%):               1,000,000 VNĐ                  │      │
│  │  BHTN (5%):                  500,000 VNĐ                  │      │
│  │  BHYT (5%):                  500,000 VNĐ                  │      │
│  │  ─────────────────────────────────────                     │      │
│  │  Tổng bảo hiểm:           2,000,000 VNĐ                  │      │
│  │                                                            │      │
│  │  Thuế TNCN:                  850,000 VNĐ                  │      │
│  │  ─────────────────────────────────────                     │      │
│  │  Tổng khấu trừ:           2,850,000 VNĐ                  │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Section 5: Tổng kết ════════════════════════════════════┐       │
│  │                                                            │      │
│  │  Thu nhập gộp:                                             │      │
│  │    Lương theo công          12,692,308 VNĐ                 │      │
│  │  + Lương tăng ca             1,200,000 VNĐ                 │      │
│  │  + Phụ cấp                   1,000,000 VNĐ                 │      │
│  │  + Thưởng                      500,000 VNĐ                 │      │
│  │  - Phạt                              0 VNĐ                 │      │
│  │  ═══════════════════════════════════════                    │      │
│  │  = Thu nhập trước thuế:    15,392,308 VNĐ                 │      │
│  │  - Bảo hiểm:               2,000,000 VNĐ                 │      │
│  │  - Thuế TNCN:                 850,000 VNĐ                 │      │
│  │  ═══════════════════════════════════════                    │      │
│  │  ★ LƯƠNG THỰC NHẬN:       12,542,308 VNĐ                 │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ── Thông tin hệ thống ──                                           │
│  Ngày tính: 02/03/2026 10:00   |   Người tính: hr_manager           │
│  Ngày cập nhật: 02/03/2026     |                                    │
│                                                                      │
│           [Quay lại]    [✏ Sửa]  (chỉ hiện khi UNPAID)             │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Dialog Tính lương (Calculate Payroll Dialog)

**Trigger**: Nút "📊 Tính lương" trên PayrollListView

**Layout:**

```
┌──────────────────────────────────────────────────┐
│  ✕                     Tính lương                │
├──────────────────────────────────────────────────┤
│                                                  │
│  Nhân viên *        [▼ Chọn nhân viên       ]    │
│                     (Select filterable, ACTIVE)   │
│                     Format: "NV001 - Nguyễn Văn A"│
│                                                  │
│  Kỳ lương *         [📅 Chọn tháng/năm     ]    │
│                     (month picker, YYYY-MM)       │
│                     (không cho chọn tương lai)    │
│                                                  │
│                     [Hủy]    [📊 Tính lương]     │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Sau khi tính thành công → hiển thị dialog kết quả:**

```
┌──────────────────────────────────────────────────┐
│  ✅ Tính lương thành công!                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  Nhân viên:    NV20260101001 - Nguyễn Văn A      │
│  Kỳ lương:     Tháng 01/2026                     │
│  Ngày công:    22/26                             │
│  Lương TC:     12,692,308 VNĐ                   │
│  Lương OT:      1,200,000 VNĐ                   │
│  Phụ cấp:       1,000,000 VNĐ                   │
│  Bảo hiểm:      2,000,000 VNĐ                   │
│  Thuế TNCN:       850,000 VNĐ                   │
│  ────────────────────────────────                │
│  ★ Thực nhận:  12,542,308 VNĐ                   │
│                                                  │
│           [Đóng]    [Xem chi tiết]               │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### 5.4 Các trạng thái màn hình

| Mode | Route | Nút bấm | Mô tả |
|------|-------|---------|-------|
| **Danh sách** | `/payroll` | Tính lương, Xuất Excel | Bảng lương + filter |
| **Xem chi tiết** | `/payroll/:id` | Quay lại, Sửa (UNPAID) | Readonly — 5 sections |
| **Chỉnh sửa** | `/payroll/:id/edit` | Lưu, Hủy | Editable (chỉ UNPAID) |

---

## 6. Luồng nghiệp vụ (Flow)

### 6.1 Flow Tính lương ⭐ (Core Flow)

```
1. HR Manager mở trang Bảng lương (/payroll)
2. Nhấn nút "📊 Tính lương" → Dialog hiện lên
3. Chọn nhân viên (select filterable, load NV ACTIVE)
4. Chọn kỳ lương (month picker, format YYYY-MM)
5. Nhấn "Tính lương"
6. FE validate: NV + tháng bắt buộc, không cho tương lai
7. FE gọi POST /api/v1/payroll/calculate { employeeCode, monthYear }
8. Loading spinner...
9. BE validate → gọi stored procedure 3 phases → return payroll data
10. Thành công:
    → Hiển thị dialog kết quả (tóm tắt lương)
    → User nhấn "Đóng" → reload danh sách
    → User nhấn "Xem chi tiết" → navigate /payroll/:id
11. Lỗi → ElMessage.error(message) — VD:
    - "Nhân viên không tồn tại hoặc không active"
    - "Không tìm thấy hợp đồng hiệu lực"
    - "Chưa có dữ liệu chấm công cho tháng này"
```

### 6.2 Flow Tìm kiếm / Filter

```
1. User mở trang Bảng lương
2. FE gọi POST /payroll/search { page: 0, size: 10 }
3. BE trả về danh sách (paginated)
4. FE render bảng

--- Khi user thay đổi filter ---
5. User chọn tháng/năm, phòng ban, trạng thái → nhấn "Tìm kiếm"
6. FE gọi POST /payroll/search với filter + reset page = 0
7. FE render lại bảng
```

### 6.3 Flow Xem chi tiết

```
1. User nhấn "Xem" trên row → Navigate /payroll/:id
2. FE gọi GET /payroll/{id} để load data
3. FE render 5 sections (NV info, Lương TC, Tăng ca, BH+Thuế, Tổng kết)
4. Nếu status = UNPAID → hiện nút "Sửa"
5. Nếu status = PAID → chỉ hiện nút "Quay lại"
```

### 6.4 Flow Chỉnh sửa (Manual Adjustment)

```
1. User nhấn "Sửa" (chỉ với UNPAID) → Navigate /payroll/:id/edit
2. FE gọi GET /payroll/{id} để load data
3. FE hiện form editable (workingDays, allowance, reward, penalty, otHours, note)
4. User sửa → nhấn "Lưu"
5. FE validate → gọi PUT /payroll/{id}
6. Thành công → ElMessage.success → Navigate /payroll
7. Lỗi → ElMessage.error(message)
```

### 6.5 Flow Xóa

```
1. User nhấn "Xóa" trên row (chỉ hiện khi UNPAID)
2. Confirm dialog: "Bạn có chắc muốn xóa bảng lương này?"
3. Xác nhận → DELETE /payroll/{id}
4. Thành công (204) → reload danh sách
5. Lỗi (đã PAID hoặc có payment) → ElMessage.error
```

### 6.6 Flow Xuất Excel

```
1. User nhấn "📥 Xuất Excel"
2. FE gọi GET /api/v1/reports/export?month={m}&year={y}&format=EXCEL
3. BE generate Excel file
4. FE trigger download file "payroll_YYYY_MM.xlsx"
```

---

## 7. Service Layer (Gọi API)

### 7.1 File: `src/api/payroll.service.ts`

```ts
import request from '@/utils/request'

const PAYROLL_URL = '/payroll'

export const payrollService = {
  /** Tính lương (POST /payroll/calculate) — Core */
  calculate(data: PayrollCalculateRequest) {
    return request.post(`${PAYROLL_URL}/calculate`, data)
  },

  /** Tìm kiếm bảng lương (POST /payroll/search) */
  search(data: PayrollSearchRequest) {
    return request.post(`${PAYROLL_URL}/search`, data)
  },

  /** Chi tiết bảng lương (GET /payroll/{id}) */
  getById(id: string) {
    return request.get(`${PAYROLL_URL}/${id}`)
  },

  /** Cập nhật bảng lương — manual adjustment (PUT /payroll/{id}) */
  update(id: string, data: PayrollUpdateRequest) {
    return request.put(`${PAYROLL_URL}/${id}`, data)
  },

  /** Xóa bảng lương — chỉ UNPAID (DELETE /payroll/{id}) */
  delete(id: string) {
    return request.delete(`${PAYROLL_URL}/${id}`)
  },

  /** Xuất Excel (GET /reports/export) */
  exportExcel(month: number, year: number) {
    return request.get('/reports/export', {
      params: { month, year, format: 'EXCEL' },
      responseType: 'blob'
    })
  }
}
```

---

## 8. Router Configuration

```ts
const payrollRoutes = [
  {
    path: '/payroll',
    name: 'PayrollList',
    component: () => import('@/views/payroll/PayrollListView.vue'),
    meta: {
      title: 'Bảng lương',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],
      icon: 'Money'
    }
  },
  {
    path: '/payroll/:id',
    name: 'PayrollDetail',
    component: () => import('@/views/payroll/PayrollDetailView.vue'),
    meta: {
      title: 'Chi tiết bảng lương',
      roles: ['HR_MANAGER', 'ACCOUNTANT'],
      activeMenu: '/payroll'
    }
  },
  {
    path: '/payroll/:id/edit',
    name: 'PayrollEdit',
    component: () => import('@/views/payroll/PayrollDetailView.vue'),
    meta: {
      title: 'Chỉnh sửa bảng lương',
      roles: ['HR_MANAGER'],
      activeMenu: '/payroll'
    }
  }
]
```

**Cấu trúc thư mục Vue:**

```
src/views/payroll/
├── PayrollListView.vue      # Danh sách + filter + table + dialog tính lương
└── PayrollDetailView.vue    # Chi tiết (readonly) / Chỉnh sửa (UNPAID)
```

**Xác định mode:**

```ts
import { useRoute } from 'vue-router'

const route = useRoute()

const isDetailMode = computed(() => route.name === 'PayrollDetail')
const isEditMode = computed(() => route.name === 'PayrollEdit')
const isReadonly = computed(() => isDetailMode.value)

const payrollId = computed(() => route.params.id as string)

const pageTitle = computed(() => {
  if (isEditMode.value) return 'Chỉnh sửa bảng lương'
  return 'Chi tiết bảng lương'
})
```

> ⚠️ **Lưu ý**: Không có route "Create" vì tạo bảng lương thông qua dialog "Tính lương" (gọi API calculate) chứ không phải form tạo mới.

---

## 9. Phân quyền (RBAC)

| Chức năng | HR_MANAGER | ACCOUNTANT |
|-----------|:----------:|:----------:|
| Tính lương (calculate) | ✅ | ❌ |
| Xem danh sách bảng lương | ✅ | ✅ |
| Xem chi tiết bảng lương | ✅ | ✅ |
| Sửa bảng lương (manual adjust) | ✅ | ❌ |
| Xóa bảng lương | ✅ | ❌ |
| Xuất Excel | ✅ | ✅ |

**Ẩn/hiện UI theo role:**

```ts
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isHRManager = computed(() => userStore.role === 'HR_MANAGER')

// Ẩn nút "Tính lương", "Sửa", "Xóa" nếu không phải HR_MANAGER
```

> **Ghi chú**: ACCOUNTANT xem bảng lương để tạo phiếu chi (module Salary Payment riêng). Trong module Payroll này, ACCOUNTANT chỉ có quyền đọc.

---

## 10. Enums & Constants

```ts
// src/constants/enums.ts (bổ sung nếu chưa có)

// Trạng thái bảng lương
export enum PayrollStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID'
}

export const PayrollStatusLabel: Record<PayrollStatus, string> = {
  [PayrollStatus.UNPAID]: 'Chưa thanh toán',
  [PayrollStatus.PAID]: 'Đã thanh toán'
}

export const PayrollStatusTagType: Record<PayrollStatus, string> = {
  [PayrollStatus.UNPAID]: 'warning',    // Tag vàng
  [PayrollStatus.PAID]: 'success'       // Tag xanh
}

// Loại lương (reuse từ contract nếu đã có)
export enum GrossNetType {
  GROSS = 'GROSS',
  NET = 'NET'
}

export const GrossNetLabel: Record<GrossNetType, string> = {
  [GrossNetType.GROSS]: 'GROSS (Gộp)',
  [GrossNetType.NET]: 'NET (Thực nhận)'
}

// Tháng cho filter
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`
}))

// Format tiền VNĐ
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'
}

// Format tiền VNĐ ngắn (không có đuôi VNĐ)
export const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value)
}
```

**Sử dụng trong template:**

```vue
<!-- Trạng thái -->
<el-tag :type="PayrollStatusTagType[row.status]">
  {{ PayrollStatusLabel[row.status] }}
</el-tag>

<!-- Format tiền -->
<template #default="{ row }">
  {{ formatCurrency(row.totalSalary) }}
</template>

<!-- Ngày công -->
<template #default="{ row }">
  {{ row.workingDays }}/{{ row.standardDays }}
</template>
```

---

## 11. Error Handling

### 11.1 Các lỗi thường gặp

| HTTP Status | Code | Nguyên nhân | Xử lý FE |
|-------------|------|-------------|-----------|
| 400 | ERR_VALIDATION | Data không hợp lệ | Hiển thị lỗi dưới field |
| 400 | ERR_EMPLOYEE_NOT_ACTIVE | NV không tồn tại hoặc inactive | `ElMessage.error(message)` |
| 400 | ERR_NO_CONTRACT | Không có HĐ hiệu lực trong tháng | `ElMessage.error(message)` |
| 400 | ERR_NO_ATTENDANCE | Chưa có dữ liệu chấm công | `ElMessage.error(message)` |
| 400 | ERR_PAYROLL_PAID | Payroll đã PAID, không thể sửa/xóa | `ElMessage.error(message)` |
| 400 | ERR_BUSINESS | Vi phạm business rule khác | `ElMessage.error(message)` |
| 401 | - | Token hết hạn | Redirect login |
| 403 | - | Không có quyền (ACCOUNTANT cố sửa/xóa) | `ElMessage.error('Bạn không có quyền')` |
| 404 | ERR_NOT_FOUND | Payroll không tồn tại | `ElMessage.error`, redirect list |
| 500 | - | Lỗi server / Stored procedure lỗi | `ElMessage.error('Lỗi hệ thống')` |

### 11.2 Xử lý lỗi khi tính lương

```ts
const handleCalculate = async () => {
  try {
    loading.value = true
    const res = await payrollService.calculate({
      employeeCode: form.employeeCode,
      monthYear: form.monthYear
    })
    if (res.data.status === 'SUCCESS') {
      // Hiển thị dialog kết quả
      calculateResult.value = res.data.data
      showResultDialog.value = true
    }
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Lỗi khi tính lương'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
```

---

## 12. Checklist triển khai

### 12.1 Chuẩn bị

- [ ] Đọc hiểu tài liệu này
- [ ] Kiểm tra `payroll.service.ts` đã có trong `src/api/`
- [ ] Kiểm tra enums `PayrollStatus`, `GrossNetType` đã có
- [ ] Kiểm tra helper `formatCurrency()` đã có
- [ ] Kiểm tra router payroll đã config
- [ ] Kiểm tra BE đã deploy API payroll (đặc biệt `/calculate`)

### 12.2 Phát triển

- [ ] **PayrollListView.vue**
  - [ ] Filter form (keyword, monthNum, yearNum, deptId, status)
  - [ ] Dropdown phòng ban (load từ API departments)
  - [ ] Bảng dữ liệu (STT, Mã NV, Tên NV, Phòng ban, Tháng/Năm, Lương, Công, OT, BH, Thuế, Thực nhận, TT, Thao tác)
  - [ ] Phân trang (`el-pagination`)
  - [ ] Format tiền VNĐ cho tất cả cột lương (dùng `formatCurrency`)
  - [ ] Nút "📊 Tính lương" (chỉ HR_MANAGER)
  - [ ] Dialog tính lương (chọn NV + tháng)
  - [ ] Dialog kết quả tính lương (tóm tắt)
  - [ ] Nút "📥 Xuất Excel"
  - [ ] Action: Xem, Sửa (UNPAID + HR_MANAGER), Xóa (UNPAID + HR_MANAGER)
  - [ ] Confirm dialog khi xóa
  - [ ] Loading + Empty state
  - [ ] Tổng kết footer (tổng NV, tổng lương, chưa TT / đã TT)

- [ ] **PayrollDetailView.vue**
  - [ ] Hỗ trợ 2 mode: Detail (readonly), Edit (UNPAID only)
  - [ ] Section 1: Thông tin NV (mã, tên, phòng ban, kỳ lương, loại lương, trạng thái)
  - [ ] Section 2: Lương theo công (cơ bản, thỏa thuận, công chuẩn, công thực, lương TC, phụ cấp, thưởng, phạt)
  - [ ] Section 3: Tăng ca (giờ OT, lương OT, note hệ số)
  - [ ] Section 4: Bảo hiểm & Thuế (BHXH, BHTN, BHYT, Thuế TNCN, tổng khấu trừ)
  - [ ] Section 5: Tổng kết (bảng tính chi tiết, **lương thực nhận** highlight)
  - [ ] Format tất cả số tiền = VNĐ dấu phẩy ngăn
  - [ ] Thông tin hệ thống (ngày tính, người tính, ngày cập nhật)
  - [ ] Nút "Sửa" chỉ hiện khi UNPAID + HR_MANAGER
  - [ ] Form edit (nếu mode edit): workingDays, allowance, reward, penalty, otHours, note
  - [ ] Validation rules cho form edit
  - [ ] Xử lý lỗi từ BE

### 12.3 Kiểm thử

- [ ] Test tính lương (happy path — có HĐ + có chấm công)
- [ ] Test tính lương lỗi (NV inactive, không HĐ, không chấm công)
- [ ] Test tính lại lương (cùng NV, cùng tháng → UPDATE)
- [ ] Test tìm kiếm với filter (tháng, năm, phòng ban, trạng thái)
- [ ] Test phân trang
- [ ] Test xem chi tiết (5 sections hiển thị đúng)
- [ ] Test chỉnh sửa (manual adjustment — chỉ UNPAID)
- [ ] Test xóa (chỉ UNPAID, confirm dialog)
- [ ] Test xuất Excel
- [ ] Test phân quyền (ACCOUNTANT không thấy nút Tính lương / Sửa / Xóa)
- [ ] Test format tiền VNĐ hiển thị đúng
- [ ] Test responsive layout

---

> **Ghi chú cuối**: Tài liệu này được tạo dựa trên DD-HRM-PAYROLL v1.0 và FE-API-CONFIG. Payroll là module core của hệ thống — logic tính lương phức tạp nằm trong stored procedures phía DB, FE chỉ cần gọi API `/calculate` và hiển thị kết quả. Nếu BE thay đổi API hoặc stored procedure, cần cập nhật lại tài liệu tương ứng.
