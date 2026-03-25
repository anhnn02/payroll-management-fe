# Tài liệu API - Hệ thống Quản lý Lương (Salary Management)

> **Base URL**: `http://localhost:8080/api/v1`
>
> **Authentication**: Bearer Token (JWT) - Gửi trong header `Authorization: Bearer <accessToken>`
>
> **Content-Type**: `application/json` (trừ các API upload file dùng `multipart/form-data`)

---

## Mục lục

1. [Response Format chung](#1-response-format-chung)
2. [Authentication (Xác thực)](#2-authentication---xác-thực)
3. [Employee (Nhân viên)](#3-employee---nhân-viên)
4. [Department (Phòng ban)](#4-department---phòng-ban)
5. [Position (Chức vụ)](#5-position---chức-vụ)
6. [Contract (Hợp đồng)](#6-contract---hợp-đồng)
7. [Attendance (Chấm công)](#7-attendance---chấm-công)
8. [Payroll (Bảng lương)](#8-payroll---bảng-lương)
9. [Salary Payment (Thanh toán lương)](#9-salary-payment---thanh-toán-lương)
10. [Config (Cấu hình hệ thống)](#10-config---cấu-hình-hệ-thống)
11. [Report (Báo cáo & Dashboard)](#11-report---báo-cáo--dashboard)

---

## 1. Response Format chung

### SuccessResponse

```json
{
  "status": "OK",
  "code": 200,
  "message": "Thành công",
  "timestamp": "2026-03-24T10:00:00",
  "data": { ... }
}
```

### PageResponse (Phân trang)

```json
{
  "status": "OK",
  "code": 200,
  "message": "Thành công",
  "timestamp": "2026-03-24T10:00:00",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
}
```

### ErrorResponse

```json
{
  "status": "BAD_REQUEST",
  "code": 400,
  "message": "Lỗi chi tiết...",
  "timestamp": "2026-03-24T10:00:00"
}
```

---

## 2. Authentication - Xác thực

### 2.1 Đăng nhập

> Xác thực người dùng, trả về cặp token (access + refresh).

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/login` |
| **Auth** | Không cần |

**Request Body:**

```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

### 2.2 Refresh Token

> Lấy access token mới khi token cũ hết hạn.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/refresh` |
| **Auth** | Không cần |

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...(mới)",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...(mới)"
  }
}
```

---

### 2.3 Đăng xuất

> Vô hiệu hóa token hiện tại.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/logout` |
| **Auth** | Bearer Token |

**Request Body:** Không có (token lấy từ header)

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### 2.4 Lấy thông tin user hiện tại

> Trả về thông tin người dùng đang đăng nhập.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/auth/me` |
| **Auth** | Bearer Token |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "username": "admin",
    "roles": ["HR_MANAGER"]
  }
}
```

---

## 3. Employee - Nhân viên

### 3.1 Tạo nhân viên mới

> Thêm nhân viên vào hệ thống. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/employees` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "code": "NV001",
  "name": "Nguyễn Văn A",
  "dob": "1995-06-15",
  "gender": "MALE",
  "deptId": 1,
  "positionId": 1,
  "hireDate": "2024-01-01",
  "status": "ACTIVE"
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "id": 1,
    "code": "NV001",
    "name": "Nguyễn Văn A",
    "dob": "1995-06-15",
    "gender": "MALE",
    "deptId": 1,
    "positionId": 1,
    "hireDate": "2024-01-01",
    "status": "ACTIVE",
    "createdBy": "admin",
    "createdAt": "2026-03-24T10:00:00",
    "updatedBy": "admin",
    "updatedAt": "2026-03-24T10:00:00"
  }
}
```

---

### 3.2 Tìm kiếm nhân viên (có phân trang)

> Tìm kiếm và lọc danh sách nhân viên theo nhiều tiêu chí.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/employees/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "keyword": "Nguyễn",
  "code": "NV",
  "name": "Văn",
  "deptIds": [1, 2],
  "positionIds": [1],
  "status": "ACTIVE",
  "gender": "MALE",
  "page": 0,
  "size": 10,
  "sort": "name,asc"
}
```

> Tất cả các field đều **optional**. Gửi `{}` để lấy toàn bộ danh sách.

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "NV001",
        "name": "Nguyễn Văn A",
        "dob": "1995-06-15",
        "gender": "MALE",
        "deptId": 1,
        "positionId": 1,
        "hireDate": "2024-01-01",
        "status": "ACTIVE",
        "createdBy": "admin",
        "createdAt": "2026-03-24T10:00:00",
        "updatedBy": "admin",
        "updatedAt": "2026-03-24T10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

### 3.3 Lấy chi tiết nhân viên

> Lấy thông tin chi tiết 1 nhân viên theo ID.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/employees/{id}` |
| **Auth** | Bearer Token |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "id": 1,
    "code": "NV001",
    "name": "Nguyễn Văn A",
    "dob": "1995-06-15",
    "gender": "MALE",
    "deptId": 1,
    "positionId": 1,
    "hireDate": "2024-01-01",
    "status": "ACTIVE",
    "createdBy": "admin",
    "createdAt": "2026-03-24T10:00:00",
    "updatedBy": "admin",
    "updatedAt": "2026-03-24T10:00:00"
  }
}
```

---

### 3.4 Cập nhật nhân viên

> Cập nhật thông tin nhân viên. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/employees/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:** Giống [3.1 Tạo nhân viên](#31-tạo-nhân-viên-mới)

**Response Body:** Giống [3.1 Tạo nhân viên](#31-tạo-nhân-viên-mới) (trả về thông tin sau khi cập nhật)

---

### 3.5 Xóa nhân viên

> Xóa nhân viên khỏi hệ thống. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/employees/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Response:** `204 No Content`

---

### 3.6 Export danh sách nhân viên (Excel)

> Xuất danh sách nhân viên ra file Excel theo bộ lọc.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/employees/export` |
| **Auth** | Bearer Token |

**Request Body:** Giống [3.2 Tìm kiếm nhân viên](#32-tìm-kiếm-nhân-viên-có-phân-trang)

**Response:** File Excel (binary) - `Content-Type: application/octet-stream`

---

## 4. Department - Phòng ban

### 4.1 Tạo phòng ban mới

> Thêm phòng ban mới. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/departments` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "code": "PB001",
  "name": "Phòng Nhân sự",
  "description": "Phòng quản lý nhân sự công ty"
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "id": 1,
    "code": "PB001",
    "name": "Phòng Nhân sự",
    "description": "Phòng quản lý nhân sự công ty",
    "createdBy": "admin",
    "createdAt": "2026-03-24T10:00:00",
    "updatedBy": "admin",
    "updatedAt": "2026-03-24T10:00:00"
  }
}
```

---

### 4.2 Tìm kiếm phòng ban (có phân trang)

> Tìm kiếm và lọc danh sách phòng ban.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/departments/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "code": "PB",
  "name": "Nhân sự",
  "status": "ACTIVE",
  "page": 0,
  "size": 10,
  "sort": "name,asc"
}
```

> Tất cả các field đều **optional**.

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "PB001",
        "name": "Phòng Nhân sự",
        "description": "Phòng quản lý nhân sự công ty",
        "createdBy": "admin",
        "createdAt": "2026-03-24T10:00:00",
        "updatedBy": "admin",
        "updatedAt": "2026-03-24T10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

### 4.3 Lấy chi tiết phòng ban

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/departments/{id}` |
| **Auth** | Bearer Token |

**Response Body:** Giống object trong [4.2](#42-tìm-kiếm-phòng-ban-có-phân-trang)

---

### 4.4 Cập nhật phòng ban

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/departments/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:** Giống [4.1](#41-tạo-phòng-ban-mới)

**Response Body:** Giống [4.1](#41-tạo-phòng-ban-mới)

---

### 4.5 Xóa phòng ban

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/departments/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Response:** `204 No Content`

---

## 5. Position - Chức vụ

### 5.1 Tạo chức vụ mới

> Thêm chức vụ mới. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/positions` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "code": "CV001",
  "name": "Trưởng phòng"
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "id": 1,
    "code": "CV001",
    "name": "Trưởng phòng",
    "description": null,
    "level": null,
    "status": "ACTIVE",
    "createdBy": "admin",
    "createdAt": "2026-03-24T10:00:00",
    "updatedBy": "admin",
    "updatedAt": "2026-03-24T10:00:00"
  }
}
```

---

### 5.2 Tìm kiếm chức vụ (có phân trang)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/positions/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "code": "CV",
  "name": "Trưởng",
  "level": "SENIOR",
  "status": "ACTIVE",
  "page": 0,
  "size": 10,
  "sort": "name,asc"
}
```

> Tất cả các field đều **optional**.

**Response Body:** PageResponse với danh sách PositionResponse

---

### 5.3 Lấy chi tiết chức vụ

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/positions/{id}` |
| **Auth** | Bearer Token |

---

### 5.4 Cập nhật chức vụ

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/positions/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:** Giống [5.1](#51-tạo-chức-vụ-mới)

---

### 5.5 Xóa chức vụ

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/positions/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Response:** `204 No Content`

---

## 6. Contract - Hợp đồng

### 6.1 Tạo hợp đồng mới

> Tạo hợp đồng lao động cho nhân viên. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/contracts` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "contractNumber": "HD-2024-001",
  "empId": 1,
  "startDate": "2024-01-01",
  "endDate": "2025-12-31",
  "salaryType": "GROSS",
  "baseSalary": 15000000,
  "offerSalary": 18000000,
  "factorId": 1,
  "contractType": "DEFINITE",
  "status": "ACTIVE",
  "terms": "Hợp đồng có thời hạn 2 năm"
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `contractNumber` | String | Số hợp đồng (unique) |
| `empId` | Long | ID nhân viên |
| `startDate` | String (yyyy-MM-dd) | Ngày bắt đầu |
| `endDate` | String (yyyy-MM-dd) | Ngày kết thúc (nullable nếu không thời hạn) |
| `salaryType` | String | Loại lương: `GROSS` / `NET` |
| `baseSalary` | BigDecimal | Lương cơ bản |
| `offerSalary` | BigDecimal | Lương thỏa thuận |
| `factorId` | Long | ID hệ số lương |
| `contractType` | String | Loại HĐ: `DEFINITE` / `INDEFINITE` / `PROBATION` |
| `status` | String | Trạng thái: `ACTIVE` / `INACTIVE` / `EXPIRED` |
| `terms` | String | Điều khoản |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "id": 1,
    "contractNumber": "HD-2024-001",
    "empId": 1,
    "startDate": "2024-01-01",
    "endDate": "2025-12-31",
    "salaryType": "GROSS",
    "baseSalary": 15000000,
    "offerSalary": 18000000,
    "factorId": 1,
    "contractType": "DEFINITE",
    "status": "ACTIVE",
    "fileUrl": null,
    "terms": "Hợp đồng có thời hạn 2 năm",
    "createdBy": "admin",
    "createdAt": "2026-03-24T10:00:00",
    "updatedBy": "admin",
    "updatedAt": "2026-03-24T10:00:00"
  }
}
```

---

### 6.2 Tìm kiếm hợp đồng (có phân trang)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/contracts/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "contractNumber": "HD-2024",
  "empId": 1,
  "status": "ACTIVE",
  "startDateFrom": "2024-01-01",
  "startDateTo": "2024-12-31",
  "page": 0,
  "size": 10,
  "sort": "startDate,desc"
}
```

> Tất cả các field đều **optional**.

**Response Body:** PageResponse với danh sách ContractResponse

---

### 6.3 Lấy chi tiết hợp đồng

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/contracts/{id}` |
| **Auth** | Bearer Token |

---

### 6.4 Cập nhật hợp đồng

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/contracts/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:** Giống [6.1](#61-tạo-hợp-đồng-mới)

---

### 6.5 Xóa hợp đồng

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/contracts/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Response:** `204 No Content`

---

### 6.6 Upload file hợp đồng

> Upload file đính kèm (scan/PDF) cho hợp đồng.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/contracts/{id}/upload` |
| **Auth** | Bearer Token |
| **Content-Type** | `multipart/form-data` |

**Request:** Form-data với field `file` (MultipartFile)

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "message": "Upload thành công",
  "data": null
}
```

---

## 7. Attendance - Chấm công

### 7.1 Tạo bản ghi chấm công

> Tạo bản ghi chấm công cho nhân viên. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/attendance` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "empId": 1,
  "attendanceDate": "2026-03-24",
  "startTime": "08:00",
  "endTime": "17:30",
  "lunchBreakHours": 1.0,
  "workHours": 8.5,
  "normalHours": 8.0,
  "otHours": 0.5,
  "isWorkingDay": true,
  "otType": "NORMAL",
  "note": "Làm thêm 30 phút"
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `empId` | Long | ID nhân viên |
| `attendanceDate` | String (yyyy-MM-dd) | Ngày chấm công |
| `startTime` | String (HH:mm) | Giờ vào |
| `endTime` | String (HH:mm) | Giờ ra |
| `lunchBreakHours` | Double | Giờ nghỉ trưa |
| `workHours` | Double | Tổng giờ làm |
| `normalHours` | Double | Giờ làm bình thường |
| `otHours` | Double | Giờ OT |
| `isWorkingDay` | Boolean | Là ngày làm việc? |
| `otType` | String | Loại OT: `NORMAL` / `WEEKEND` / `HOLIDAY` |
| `note` | String | Ghi chú |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "id": 1,
    "empId": 1,
    "attendanceDate": "2026-03-24",
    "startTime": "08:00",
    "endTime": "17:30",
    "lunchBreakHours": 1.0,
    "workHours": 8.5,
    "normalHours": 8.0,
    "otHours": 0.5,
    "isWorkingDay": true,
    "otType": "NORMAL",
    "note": "Làm thêm 30 phút",
    "createdBy": "admin",
    "createdAt": "2026-03-24T10:00:00",
    "updatedBy": "admin",
    "updatedAt": "2026-03-24T10:00:00"
  }
}
```

---

### 7.2 Tìm kiếm chấm công (có phân trang)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/attendance/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "month": "2026-03",
  "keyword": "Nguyễn",
  "deptId": 1,
  "empId": 1,
  "dateFrom": "2026-03-01",
  "dateTo": "2026-03-31",
  "page": 0,
  "size": 10,
  "sort": "attendanceDate,desc"
}
```

> Tất cả các field đều **optional**.

---

### 7.3 Lấy bảng chấm công theo tháng

> Lấy dữ liệu chấm công tổng hợp theo tháng cho tất cả nhân viên (dạng bảng tổng hợp).

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/attendance/monthly?month=2026-03&keyword=&deptId=` |
| **Auth** | Bearer Token |

**Query Parameters:**

| Param | Type | Mô tả |
|-------|------|--------|
| `month` | String (yyyy-MM) | Tháng cần xem |
| `keyword` | String (optional) | Tìm theo tên/mã NV |
| `deptId` | Long (optional) | Lọc theo phòng ban |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "month": "2026-03",
    "locked": false,
    "employeeCount": 50,
    "totalOtHours": 120.5,
    "avgWorkDays": 22.3,
    "rows": [
      {
        "empId": 1,
        "employeeCode": "NV001",
        "employeeName": "Nguyễn Văn A",
        "deptId": 1,
        "deptName": "Phòng Nhân sự",
        "workDays": 22,
        "standardDays": 23,
        "otHours": 5.5,
        "leaveApproved": 1,
        "leaveUnauthorized": 0
      }
    ]
  }
}
```

---

### 7.4 Cập nhật chấm công theo tháng (inline edit)

> Cập nhật nhanh dữ liệu chấm công tổng hợp tháng cho 1 nhân viên.

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/attendance/monthly/{empId}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "workDays": 22,
  "otHours": 5.5,
  "leaveApproved": 1,
  "leaveUnauthorized": 0
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "message": "Cập nhật thành công",
  "data": null
}
```

---

### 7.5 Lấy chi tiết 1 bản ghi chấm công

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/attendance/{id}` |
| **Auth** | Bearer Token |

---

### 7.6 Cập nhật bản ghi chấm công

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/attendance/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:** Giống [7.1](#71-tạo-bản-ghi-chấm-công)

---

### 7.7 Xóa bản ghi chấm công

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/attendance/{id}` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Response:** `204 No Content`

---

### 7.8 Tải template import chấm công (Excel)

> Tải file Excel mẫu để nhập dữ liệu chấm công.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/attendance/template` |
| **Auth** | Bearer Token |

**Response:** File Excel (binary)

---

### 7.9 Import chấm công (legacy)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/attendance/import` |
| **Auth** | Bearer Token (HR_MANAGER) |
| **Content-Type** | `multipart/form-data` |

**Request:** Form-data với field `file` (file Excel)

---

### 7.10 Preview import chấm công

> Xem trước kết quả import (validate dữ liệu) mà chưa lưu vào DB.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/attendance/import/preview` |
| **Auth** | Bearer Token (HR_MANAGER) |
| **Content-Type** | `multipart/form-data` |

**Request:** Form-data với field `file` (file Excel)

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "totalRows": 100,
    "successCount": 95,
    "failedCount": 5,
    "errors": [
      {
        "row": 12,
        "employeeCode": "NV999",
        "error": "Không tìm thấy nhân viên với mã NV999"
      }
    ]
  }
}
```

---

### 7.11 Áp dụng import chấm công

> Thực hiện import dữ liệu chấm công từ file Excel vào DB.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/attendance/import/apply` |
| **Auth** | Bearer Token (HR_MANAGER) |
| **Content-Type** | `multipart/form-data` |

**Request:** Form-data với:
- `file`: File Excel
- `overwrite`: `true` / `false` (ghi đè dữ liệu cũ nếu trùng)

**Response Body:** Giống [7.10 Preview](#710-preview-import-chấm-công)

---

## 8. Payroll - Bảng lương

### 8.1 Tính lương cho nhân viên

> Tính lương cho 1 nhân viên trong 1 tháng cụ thể. Yêu cầu quyền HR_MANAGER.
>
> **Quy trình tính lương 3 giai đoạn:**
> 1. **Giai đoạn 1**: Lương cơ bản = (Lương cơ bản / Ngày chuẩn) × Ngày công thực tế
> 2. **Giai đoạn 2**: + Phụ cấp + Thưởng - Phạt + Lương OT
> 3. **Giai đoạn 3**: - BHXH - BHTN - BHYT - Thuế TNCN = Lương thực nhận

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/payroll/calculate` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "employeeCode": "NV001",
  "monthYear": "2026-03"
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `employeeCode` | String | Mã nhân viên |
| `monthYear` | String (yyyy-MM) | Tháng tính lương |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "message": "Tính lương thành công",
  "data": null
}
```

---

### 8.2 Xem chi tiết phân tích lương (Breakdown)

> Xem bảng phân tích chi tiết lương theo 3 giai đoạn mà **không lưu vào DB**.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/payroll/breakdown` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "employeeCode": "NV001",
  "monthYear": "2026-03"
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "employeeCode": "NV001",
    "monthYear": "2026-03",
    "workingSalary": 15000000.00,
    "allowance": 2000000.00,
    "reward": 500000.00,
    "penalty": 0.00,
    "otHours": 5.5,
    "otSalary": 750000.00,
    "bhxh": 1200000.00,
    "bhtn": 150000.00,
    "bhyt": 225000.00,
    "tax": 1500000.00,
    "totalSalary": 15175000.00
  }
}
```

| Field | Mô tả |
|-------|--------|
| `workingSalary` | Lương theo ngày công |
| `allowance` | Tổng phụ cấp |
| `reward` | Tổng thưởng |
| `penalty` | Tổng phạt |
| `otHours` | Số giờ OT |
| `otSalary` | Lương OT |
| `bhxh` | Bảo hiểm xã hội |
| `bhtn` | Bảo hiểm thất nghiệp |
| `bhyt` | Bảo hiểm y tế |
| `tax` | Thuế thu nhập cá nhân |
| `totalSalary` | Lương thực nhận (NET) |

---

### 8.3 Tìm kiếm bảng lương (có phân trang)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/payroll/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "empId": 1,
  "status": "CALCULATED",
  "monthNum": 3,
  "yearNum": 2026,
  "page": 0,
  "size": 10,
  "sort": "calculatedAt,desc"
}
```

> Tất cả các field đều **optional**.

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "empId": 1,
        "monthNum": 3,
        "yearNum": 2026,
        "basicSalary": 15000000.00,
        "offerSalary": 18000000.00,
        "workingDays": 22,
        "standardDays": 23,
        "allowance": 2000000.00,
        "rewardAmount": 500000.00,
        "penaltyAmount": 0.00,
        "otHours": 5.5,
        "otSalary": 750000.00,
        "bhxhAmount": 1200000.00,
        "bhtnAmount": 150000.00,
        "bhytAmount": 225000.00,
        "taxAmount": 1500000.00,
        "totalSalary": 15175000.00,
        "grossNet": "GROSS",
        "status": "CALCULATED",
        "calculatedAt": "2026-03-24T10:00:00",
        "calculatedBy": "admin"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

### 8.4 Cập nhật bảng lương

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/payroll/{id}` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "employeeCode": "NV001",
  "monthYear": "2026-03"
}
```

---

### 8.5 Xóa bảng lương

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/payroll/{id}` |
| **Auth** | Bearer Token |

**Response:** `204 No Content`

---

## 9. Salary Payment - Thanh toán lương

### 9.1 Tạo thanh toán lương

> Tạo phiếu thanh toán lương cho toàn bộ nhân viên trong 1 tháng. Yêu cầu quyền ACCOUNTANT.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/salary-payments/create` |
| **Auth** | Bearer Token (ACCOUNTANT) |

**Request Body:**

```json
{
  "monthNum": 3,
  "yearNum": 2026,
  "paymentDate": "2026-03-25",
  "approvedBy": "Giám đốc Nguyễn Văn B",
  "note": "Thanh toán lương tháng 3/2026"
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `monthNum` | Integer (1-12) | Tháng |
| `yearNum` | Integer (≥2000) | Năm |
| `paymentDate` | String (yyyy-MM-dd) | Ngày thanh toán |
| `approvedBy` | String | Người phê duyệt |
| `note` | String | Ghi chú |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "count": 50,
    "message": "Đã tạo 50 phiếu thanh toán lương"
  }
}
```

---

### 9.2 Tìm kiếm phiếu thanh toán (có phân trang)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/salary-payments/search` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "monthNum": 3,
  "yearNum": 2026,
  "approvedBy": "Nguyễn",
  "page": 0,
  "size": 10
}
```

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "payrollId": 1,
        "paymentDate": "2026-03-25",
        "approvedBy": "Giám đốc Nguyễn Văn B",
        "note": "Thanh toán lương tháng 3/2026",
        "createdBy": "accountant",
        "createdAt": "2026-03-24T10:00:00",
        "updatedBy": "accountant",
        "updatedAt": "2026-03-24T10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 50,
    "totalPages": 5
  }
}
```

---

### 9.3 Lấy chi tiết phiếu thanh toán

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/salary-payments/{id}` |
| **Auth** | Bearer Token |

---

## 10. Config - Cấu hình hệ thống

### 10.1 Lấy danh sách hệ số lương

> Lấy các hệ số cấu hình dùng trong tính lương (VD: hệ số vùng, hệ số lương tối thiểu...).

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/config/salary-factors` |
| **Auth** | Bearer Token |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": [
    {
      "id": 1,
      "code": "REGION_1",
      "name": "Hệ số vùng 1",
      "value": 4960000.00,
      "createdBy": "admin",
      "createdAt": "2026-01-01T00:00:00",
      "updatedBy": "admin",
      "updatedAt": "2026-01-01T00:00:00"
    }
  ]
}
```

---

### 10.2 Cập nhật hệ số lương

> Cập nhật danh sách hệ số lương. Yêu cầu quyền HR_MANAGER.

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/v1/config/salary-factors` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
[
  {
    "code": "REGION_1",
    "name": "Hệ số vùng 1",
    "value": 5000000.00
  },
  {
    "code": "MIN_SALARY",
    "name": "Lương tối thiểu",
    "value": 4680000.00
  }
]
```

---

### 10.3 Lấy cấu hình thuế TNCN

> Lấy bảng thuế thu nhập cá nhân (mức giảm trừ, thuế suất).

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/config/tax` |
| **Auth** | Bearer Token |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": [
    {
      "id": 1,
      "code": "TAX_LEVEL_1",
      "personalDeduction": 11000000.00,
      "dependentDeduction": 4400000.00,
      "taxRate": 0.05,
      "createdBy": "admin",
      "createdAt": "2026-01-01T00:00:00",
      "updatedBy": "admin",
      "updatedAt": "2026-01-01T00:00:00"
    }
  ]
}
```

---

### 10.4 Lấy cấu hình bảo hiểm

> Lấy tỷ lệ đóng bảo hiểm (BHXH, BHTN, BHYT) theo loại hợp đồng.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/config/insurance` |
| **Auth** | Bearer Token |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": [
    {
      "id": 1,
      "code": "INS_DEFINITE",
      "contractType": "DEFINITE",
      "bhxhRate": 0.08,
      "bhtnRate": 0.01,
      "bhytRate": 0.015,
      "createdBy": "admin",
      "createdAt": "2026-01-01T00:00:00",
      "updatedBy": "admin",
      "updatedAt": "2026-01-01T00:00:00"
    }
  ]
}
```

---

### 10.5 Lấy danh sách ngày nghỉ lễ

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/config/holidays` |
| **Auth** | Bearer Token |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": [
    {
      "id": 1,
      "holidayDate": "2026-01-01",
      "name": "Tết Dương lịch",
      "description": "Nghỉ Tết Dương lịch",
      "createdBy": "admin",
      "createdAt": "2026-01-01T00:00:00",
      "updatedBy": "admin",
      "updatedAt": "2026-01-01T00:00:00"
    }
  ]
}
```

---

### 10.6 Thêm ngày nghỉ lễ

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/config/holidays` |
| **Auth** | Bearer Token (HR_MANAGER) |

**Request Body:**

```json
{
  "holidayDate": "2026-04-30",
  "name": "Ngày Giải phóng miền Nam",
  "description": "Kỷ niệm ngày 30/4"
}
```

---

## 11. Report - Báo cáo & Dashboard

### 11.1 Tạo báo cáo lương

> Tạo báo cáo lương theo tháng, có thể lọc theo phòng ban. Trả về URL để download.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/reports/salary` |
| **Auth** | Bearer Token |

**Request Body:**

```json
{
  "monthNum": 3,
  "yearNum": 2026,
  "deptId": 1,
  "format": "EXCEL"
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `monthNum` | Integer | Tháng |
| `yearNum` | Integer | Năm |
| `deptId` | Long (optional) | Lọc theo phòng ban |
| `format` | String | `EXCEL` hoặc `PDF` |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "reportUrl": "/reports/salary_03_2026.xlsx",
    "expiresAt": "2026-03-25T10:00:00"
  }
}
```

---

### 11.2 Dashboard tổng quan

> Lấy dữ liệu tổng quan cho trang Dashboard.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/reports/dashboard?monthNum=3&yearNum=2026` |
| **Auth** | Bearer Token |

**Query Parameters:**

| Param | Type | Mô tả |
|-------|------|--------|
| `monthNum` | Integer | Tháng |
| `yearNum` | Integer | Năm |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "totalEmployees": 150,
    "activeEmployees": 140,
    "totalPayroll": 2500000000.00,
    "unpaidPayroll": 500000000.00,
    "paidPayroll": 2000000000.00,
    "avgSalary": 17857142.86,
    "totalOtHours": 320.5,
    "totalOtCost": 45000000.00
  }
}
```

| Field | Mô tả |
|-------|--------|
| `totalEmployees` | Tổng số nhân viên |
| `activeEmployees` | Số NV đang hoạt động |
| `totalPayroll` | Tổng quỹ lương |
| `unpaidPayroll` | Lương chưa thanh toán |
| `paidPayroll` | Lương đã thanh toán |
| `avgSalary` | Lương trung bình |
| `totalOtHours` | Tổng giờ OT |
| `totalOtCost` | Tổng chi phí OT |

---

### 11.3 Dashboard nâng cao (PYC)

> Dashboard nâng cao với alerts, KPIs, biểu đồ, quick links.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/reports/dashboard-pyc?month=2026-03` |
| **Auth** | Bearer Token |

**Query Parameters:**

| Param | Type | Mô tả |
|-------|------|--------|
| `month` | String (yyyy-MM, optional) | Tháng (mặc định tháng hiện tại) |

**Response Body:**

```json
{
  "status": "OK",
  "code": 200,
  "data": {
    "month": "2026-03",
    "alerts": [
      {
        "type": "WARNING",
        "title": "Hợp đồng sắp hết hạn",
        "message": "5 hợp đồng sẽ hết hạn trong 30 ngày tới",
        "count": 5
      }
    ],
    "kpis": [
      {
        "label": "Tổng nhân viên",
        "value": "150",
        "unit": "người",
        "trend": "UP",
        "trendValue": "+5"
      }
    ],
    "charts": [
      {
        "type": "BAR",
        "title": "Lương theo phòng ban",
        "labels": ["Phòng IT", "Phòng HR", "Phòng KD"],
        "datasets": [
          {
            "label": "Tổng lương",
            "data": [500000000, 300000000, 400000000]
          }
        ]
      }
    ],
    "quickLinks": [
      {
        "label": "Tính lương tháng 3",
        "url": "/payroll/calculate",
        "icon": "calculator"
      }
    ]
  }
}
```

---

### 11.4 Export báo cáo (Excel/PDF)

> Tải trực tiếp file báo cáo lương.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/reports/export?monthNum=3&yearNum=2026&format=EXCEL` |
| **Auth** | Bearer Token |

**Query Parameters:**

| Param | Type | Mô tả |
|-------|------|--------|
| `monthNum` | Integer | Tháng |
| `yearNum` | Integer | Năm |
| `format` | String | `EXCEL` hoặc `PDF` |

**Response:** File binary (Excel hoặc PDF)

---

## Phụ lục

### A. Enum Values

| Enum | Giá trị |
|------|---------|
| **Gender** | `MALE`, `FEMALE` |
| **Employee Status** | `ACTIVE`, `INACTIVE`, `TERMINATED` |
| **Contract Type** | `DEFINITE`, `INDEFINITE`, `PROBATION` |
| **Contract Status** | `ACTIVE`, `INACTIVE`, `EXPIRED` |
| **Salary Type** | `GROSS`, `NET` |
| **OT Type** | `NORMAL`, `WEEKEND`, `HOLIDAY` |
| **Payroll Status** | `CALCULATED`, `PAID`, `CANCELLED` |
| **Report Format** | `EXCEL`, `PDF` |

### B. Roles & Permissions

| Role | Quyền |
|------|--------|
| **HR_MANAGER** | CRUD nhân viên, phòng ban, chức vụ, hợp đồng, chấm công, tính lương, cấu hình hệ thống |
| **ACCOUNTANT** | Tạo phiếu thanh toán lương |
| **Tất cả user đã đăng nhập** | Xem (search, get), xuất báo cáo |

### C. Pagination mặc định

| Param | Mặc định | Mô tả |
|-------|----------|--------|
| `page` | 0 | Trang (bắt đầu từ 0) |
| `size` | 10 | Số bản ghi/trang |
| `sort` | - | Format: `field,direction` (VD: `name,asc`) |

### D. Date Format

| Loại | Format | Ví dụ |
|------|--------|-------|
| Date | `yyyy-MM-dd` | `2026-03-24` |
| DateTime | `yyyy-MM-dd'T'HH:mm:ss` | `2026-03-24T10:00:00` |
| Time | `HH:mm` | `08:00` |
| Month | `yyyy-MM` | `2026-03` |
