# API Specifications - HRM Payroll Management System

> **Version**: 1.0  
> **Created**: 2026-02-09  
> **Base URL**: `/api/v1`  
> **Authentication**: JWT Bearer Token

---

## Mục lục

1. [Quy tắc chung](#1-quy-tắc-chung)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Organization Management](#3-organization-management)
4. [Employee Management](#4-employee-management)
5. [Contract Management](#5-contract-management)
6. [Attendance Management](#6-attendance-management)
7. [Payroll Processing](#7-payroll-processing)
8. [Configuration](#8-configuration)
9. [Reports](#9-reports)

---

## 1. Quy tắc chung

### 1.1 URL Pattern

| Operation | Pattern | Example |
|-----------|---------|---------|
| Search (List) | `POST /{resource}/search` | `POST /departments/search` |
| Get by ID | `GET /{resource}/{id}` | `GET /departments/{id}` |
| Create | `POST /{resource}` | `POST /departments` |
| Update | `PUT /{resource}/{id}` | `PUT /departments/{id}` |
| Delete | `DELETE /{resource}/{id}` | `DELETE /departments/{id}` |

### 1.2 Standard Headers

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### 1.3 Response Format

#### Success Response (Single Object)
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": { ... }
}
```

#### Success Response (Paginated)
```json
{
  "status": "SUCCESS",
  "code": null,
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
}
```

#### Error Response
```json
{
  "status": "ERROR",
  "code": "ERR_001",
  "message": "Validation failed",
  "timestamp": "2026-02-09T15:30:00Z",
  "errors": [
    {
      "field": "name",
      "message": "Tên không được để trống"
    }
  ]
}
```

### 1.4 Common Query Parameters (cho Search endpoints)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 0 | Số trang (bắt đầu từ 0) |
| `size` | Integer | 10 | Số bản ghi mỗi trang |
| `sort` | String | null | Sắp xếp (vd: "name,asc" hoặc "createdAt,desc") |

---

## 2. Authentication & Authorization

### 2.1 Login

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "username": "hr_manager",
  "password": "password123"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Đăng nhập thành công",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "username": "hr_manager",
      "role": "HR_MANAGER",
      "employeeId": "uuid",
      "employeeName": "Nguyễn Văn A"
    }
  }
}
```

**Validation**:
- `username`: Required, 3-50 ký tự
- `password`: Required, 6-255 ký tự

---

### 2.2 Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Đăng xuất thành công",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": null
}
```

---

### 2.3 Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: Tương tự Login response

---

## 3. Organization Management

### 3.1 Department APIs

#### 3.1.1 Search Departments

**Endpoint**: `POST /api/v1/departments/search`

**Request Body**:
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

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "content": [
      {
        "id": "uuid",
        "code": "IT",
        "name": "Phòng Công nghệ thông tin",
        "description": "Phòng IT",
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
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Fields**:
- `code`: Mã phòng ban (VARCHAR 20)
- `name`: Tên phòng ban (VARCHAR 100)
- `description`: Mô tả (TEXT, nullable)
- `parentId`: ID phòng ban cha (UUID, nullable)
- `status`: Trạng thái (ACTIVE, INACTIVE)

---

#### 3.1.2 Get Department by ID

**Endpoint**: `GET /api/v1/departments/{id}`

**Response**: Tương tự object trong `content` của Search

---

#### 3.1.3 Create Department

**Endpoint**: `POST /api/v1/departments`

**Request Body**:
```json
{
  "code": "IT",
  "name": "Phòng Công nghệ thông tin",
  "description": "Phòng IT",
  "parentId": null,
  "status": "ACTIVE"
}
```

**Validation**:
- `code`: Required, unique, 1-20 ký tự
- `name`: Required, 1-100 ký tự
- `status`: Required, enum (ACTIVE, INACTIVE)

**Response**: HTTP 201 Created + Department object

---

#### 3.1.4 Update Department

**Endpoint**: `PUT /api/v1/departments/{id}`

**Request Body**: Tương tự Create

**Response**: HTTP 200 OK + Department object

---

#### 3.1.5 Delete Department

**Endpoint**: `DELETE /api/v1/departments/{id}`

**Response**: HTTP 204 No Content

**Business Rules**:
- Không xóa được nếu có nhân viên thuộc phòng ban

---

### 3.2 Position APIs

#### 3.2.1 Search Positions

**Endpoint**: `POST /api/v1/positions/search`

**Request Body**:
```json
{
  "code": "DEV",
  "name": "Developer",
  "level": "JUNIOR",
  "status": "ACTIVE",
  "page": 0,
  "size": 10
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "content": [
      {
        "id": "uuid",
        "code": "DEV",
        "name": "Developer",
        "description": "Lập trình viên",
        "level": "JUNIOR",
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2026-01-01T00:00:00Z",
        "updatedBy": "admin"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Fields**:
- `code`: Mã chức vụ (VARCHAR 20)
- `name`: Tên chức vụ (VARCHAR 100)
- `description`: Mô tả (TEXT, nullable)
- `level`: Cấp bậc (JUNIOR, MIDDLE, SENIOR)
- `status`: Trạng thái (ACTIVE, INACTIVE)

---

#### 3.2.2 Get Position by ID

**Endpoint**: `GET /api/v1/positions/{id}`

---

#### 3.2.3 Create Position

**Endpoint**: `POST /api/v1/positions`

**Request Body**:
```json
{
  "code": "DEV",
  "name": "Developer",
  "description": "Lập trình viên",
  "level": "JUNIOR",
  "status": "ACTIVE"
}
```

**Validation**:
- `code`: Required, unique, 1-20 ký tự
- `name`: Required, 1-100 ký tự
- `level`: Required, enum (JUNIOR, MIDDLE, SENIOR)
- `status`: Required, enum (ACTIVE, INACTIVE)

---

#### 3.2.4 Update Position

**Endpoint**: `PUT /api/v1/positions/{id}`

---

#### 3.2.5 Delete Position

**Endpoint**: `DELETE /api/v1/positions/{id}`

---

## 4. Employee Management

### 4.1 Search Employees

**Endpoint**: `POST /api/v1/employees/search`

**Request Body**:
```json
{
  "code": "NV",
  "name": "Nguyễn",
  "email": "@gmail.com",
  "deptId": "uuid",
  "positionId": "uuid",
  "status": "ACTIVE",
  "page": 0,
  "size": 10
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "content": [
      {
        "id": "uuid",
        "code": "NV20260101001",
        "name": "Nguyễn Văn A",
        "dob": "1990-01-01",
        "gender": "MALE",
        "idCard": "001234567890",
        "email": "nguyenvana@gmail.com",
        "phone": "0912345678",
        "address": "Hà Nội",
        "deptId": "uuid",
        "deptName": "Phòng IT",
        "positionId": "uuid",
        "positionName": "Developer",
        "hireDate": "2020-01-01",
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2026-01-01T00:00:00Z",
        "updatedBy": "admin"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Fields**:
- `code`: Mã nhân viên (VARCHAR 20, format: NVYYMMDD###)
- `name`: Họ tên (VARCHAR 100)
- `dob`: Ngày sinh (DATE)
- `gender`: Giới tính (MALE, FEMALE, OTHER)
- `idCard`: CMND/CCCD (VARCHAR 12, unique)
- `email`: Email (VARCHAR 100, unique)
- `phone`: Số điện thoại (VARCHAR 15)
- `address`: Địa chỉ (TEXT)
- `deptId`: ID phòng ban (UUID)
- `positionId`: ID chức vụ (UUID)
- `hireDate`: Ngày vào làm (DATE)
- `status`: Trạng thái (ACTIVE, INACTIVE)

---

### 4.2 Get Employee by ID

**Endpoint**: `GET /api/v1/employees/{id}`

---

### 4.3 Create Employee

**Endpoint**: `POST /api/v1/employees`

**Request Body**:
```json
{
  "code": "NV20260101001",
  "name": "Nguyễn Văn A",
  "dob": "1990-01-01",
  "gender": "MALE",
  "idCard": "001234567890",
  "email": "nguyenvana@gmail.com",
  "phone": "0912345678",
  "address": "Hà Nội",
  "deptId": "uuid",
  "positionId": "uuid",
  "hireDate": "2020-01-01",
  "status": "ACTIVE"
}
```

**Validation**:
- `code`: Required, unique, format NVYYMMDD###
- `name`: Required, 1-100 ký tự
- `dob`: Required, phải < ngày hiện tại
- `gender`: Required, enum (MALE, FEMALE, OTHER)
- `idCard`: Required, unique, 9 hoặc 12 số
- `email`: Required, unique, format email hợp lệ
- `phone`: Optional, format số điện thoại VN (10-11 số)
- `deptId`: Required, phải tồn tại
- `positionId`: Required, phải tồn tại
- `hireDate`: Required
- `status`: Required, enum (ACTIVE, INACTIVE)

---

### 4.4 Update Employee

**Endpoint**: `PUT /api/v1/employees/{id}`

---

### 4.5 Delete Employee (Soft Delete)

**Endpoint**: `DELETE /api/v1/employees/{id}`

**Business Logic**: Chỉ set `status = INACTIVE`, không xóa vật lý

---

## 5. Contract Management

### 5.1 Search Contracts

**Endpoint**: `POST /api/v1/contracts/search`

**Request Body**:
```json
{
  "empId": "uuid",
  "contractType": "OFFICIAL",
  "status": "ACTIVE",
  "page": 0,
  "size": 10
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "content": [
      {
        "id": "uuid",
        "empId": "uuid",
        "empCode": "NV20260101001",
        "empName": "Nguyễn Văn A",
        "contractNumber": "HD001",
        "contractType": "OFFICIAL",
        "startDate": "2020-01-01",
        "endDate": null,
        "baseSalary": 10000000,
        "offerSalary": 20000000,
        "salaryType": "GROSS",
        "terms": "Các điều khoản...",
        "fileUrl": "https://storage.example.com/contracts/HD001.pdf",
        "status": "ACTIVE",
        "createdAt": "2026-01-01T00:00:00Z",
        "createdBy": "admin",
        "updatedAt": "2026-01-01T00:00:00Z",
        "updatedBy": "admin"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Fields**:
- `empId`: ID nhân viên (UUID)
- `contractNumber`: Số hợp đồng (VARCHAR 50)
- `contractType`: Loại hợp đồng (PROBATION, OFFICIAL, SEASONAL)
- `startDate`: Ngày bắt đầu (DATE)
- `endDate`: Ngày kết thúc (DATE, nullable)
- `baseSalary`: Lương cơ bản - tính BHXH (DECIMAL 15,2)
- `offerSalary`: Lương thỏa thuận (DECIMAL 15,2)
- `salaryType`: Loại lương (GROSS, NET)
- `terms`: Điều khoản (TEXT)
- `fileUrl`: URL file PDF (VARCHAR 500)
- `status`: Trạng thái (ACTIVE, EXPIRED)

---

### 5.2 Get Contract by ID

**Endpoint**: `GET /api/v1/contracts/{id}`

---

### 5.3 Create Contract

**Endpoint**: `POST /api/v1/contracts`

**Request Body**:
```json
{
  "empId": "uuid",
  "contractNumber": "HD001",
  "contractType": "OFFICIAL",
  "startDate": "2020-01-01",
  "endDate": null,
  "baseSalary": 10000000,
  "offerSalary": 20000000,
  "salaryType": "GROSS",
  "terms": "Các điều khoản...",
  "status": "ACTIVE"
}
```

**Validation**:
- `empId`: Required, phải tồn tại
- `contractNumber`: Required, unique
- `contractType`: Required, enum (PROBATION, OFFICIAL, SEASONAL)
- `startDate`: Required
- `endDate`: Optional, phải >= startDate nếu có
- `baseSalary`: Required, > 0
- `offerSalary`: Required, > 0
- `salaryType`: Required, enum (GROSS, NET)
- `status`: Required, enum (ACTIVE, EXPIRED)

**Business Rules**:
- Không có 2 hợp đồng ACTIVE cùng lúc cho 1 nhân viên

---

### 5.4 Update Contract

**Endpoint**: `PUT /api/v1/contracts/{id}`

---

### 5.5 Upload Contract File

**Endpoint**: `POST /api/v1/contracts/{id}/upload`

**Request**: `multipart/form-data`
- `file`: PDF file

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Upload thành công",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "fileUrl": "https://storage.example.com/contracts/HD001.pdf"
  }
}
```

---

## 6. Attendance Management

### 6.1 Search Attendance

**Endpoint**: `POST /api/v1/attendance/search`

**Request Body**:
```json
{
  "empId": "uuid",
  "fromDate": "2026-01-01",
  "toDate": "2026-01-31",
  "isWorkingDay": true,
  "page": 0,
  "size": 10
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "content": [
      {
        "id": "uuid",
        "empId": "uuid",
        "empCode": "NV20260101001",
        "empName": "Nguyễn Văn A",
        "attendanceDate": "2026-01-15",
        "startTime": "2026-01-15T08:00:00Z",
        "endTime": "2026-01-15T17:00:00Z",
        "workHours": 8.0,
        "normalHours": 8.0,
        "otHours": 0.0,
        "otType": null,
        "isWorkingDay": true,
        "note": null,
        "createdAt": "2026-01-15T00:00:00Z",
        "createdBy": "hr_manager",
        "updatedAt": "2026-01-15T00:00:00Z",
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

**Fields**:
- `empId`: ID nhân viên (UUID)
- `attendanceDate`: Ngày chấm công (DATE)
- `startTime`: Giờ vào (TIMESTAMP)
- `endTime`: Giờ ra (TIMESTAMP)
- `workHours`: Tổng giờ làm (DECIMAL 5,2) - auto calculated
- `normalHours`: Giờ làm thường (DECIMAL 5,2) - auto calculated
- `otHours`: Giờ tăng ca (DECIMAL 5,2) - auto calculated
- `otType`: Loại tăng ca (WEEKDAY, SATURDAY, SUNDAY, HOLIDAY)
- `isWorkingDay`: Có tính công không (BOOLEAN)
- `note`: Ghi chú (TEXT)

---

### 6.2 Get Attendance by ID

**Endpoint**: `GET /api/v1/attendance/{id}`

---

### 6.3 Update Attendance

**Endpoint**: `PUT /api/v1/attendance/{id}`

**Request Body**:
```json
{
  "startTime": "2026-01-15T08:00:00Z",
  "endTime": "2026-01-15T17:00:00Z",
  "isWorkingDay": true,
  "note": "Làm việc bình thường"
}
```

**Note**: `workHours`, `normalHours`, `otHours` được tự động tính bởi trigger

---

### 6.4 Download Template

**Endpoint**: `GET /api/v1/attendance/template`

**Response**: Excel file (.xlsx)

---

### 6.5 Import Attendance

**Endpoint**: `POST /api/v1/attendance/import`

**Request**: `multipart/form-data`
- `file`: Excel file

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Import thành công",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "totalRows": 100,
    "successCount": 95,
    "failedCount": 5,
    "errors": [
      {
        "row": 12,
        "employeeCode": "NV20260101999",
        "error": "Nhân viên không tồn tại"
      }
    ]
  }
}
```

---

## 7. Payroll Processing

### 7.1 Calculate Payroll

**Endpoint**: `POST /api/v1/payroll/calculate`

**Request Body**:
```json
{
  "employeeCode": "NV20260101001",
  "monthYear": "2026-01"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tính lương thành công",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "id": "uuid",
    "empId": "uuid",
    "empCode": "NV20260101001",
    "empName": "Nguyễn Văn A",
    "monthNum": 1,
    "yearNum": 2026,
    "basicSalary": 10000000,
    "offerSalary": 20000000,
    "workingDays": 22,
    "standardDays": 26,
    "workingSalary": 16923076.92,
    "allowance": 1000000,
    "rewardAmount": 500000,
    "penaltyAmount": 0,
    "otHours": 10,
    "otSalary": 1200000,
    "bhxhAmount": 1000000,
    "bhtnAmount": 500000,
    "bhytAmount": 500000,
    "taxAmount": 850000,
    "totalSalary": 16773076.92,
    "grossNet": "GROSS",
    "status": "UNPAID",
    "calculatedAt": "2026-02-09T15:30:00Z",
    "calculatedBy": "hr_manager"
  }
}
```

**Business Logic**:
1. Validate employee exists và ACTIVE
2. Check contract exists trong tháng
3. Check attendance data exists
4. Call stored procedure `CALCULATE_PAYROLL(employee_code, month_year)`
5. Return payroll record

---

### 7.2 Search Payroll

**Endpoint**: `POST /api/v1/payroll/search`

**Request Body**:
```json
{
  "empId": "uuid",
  "monthNum": 1,
  "yearNum": 2026,
  "status": "UNPAID",
  "page": 0,
  "size": 10
}
```

**Response**: Tương tự Calculate Payroll nhưng có pagination

---

### 7.3 Get Payroll by ID

**Endpoint**: `GET /api/v1/payroll/{id}`

---

### 7.4 Update Payroll (Manual Adjustment)

**Endpoint**: `PUT /api/v1/payroll/{id}`

**Request Body**:
```json
{
  "allowance": 1500000,
  "rewardAmount": 1000000,
  "penaltyAmount": 200000,
  "note": "Điều chỉnh thủ công"
}
```

**Business Rules**:
- Chỉ update được khi `status = UNPAID`
- Sau khi update, cần recalculate total

---

### 7.5 Delete Payroll

**Endpoint**: `DELETE /api/v1/payroll/{id}`

**Business Rules**:
- Chỉ xóa được khi `status = UNPAID`

---

## 8. Configuration

### 8.1 Get Salary Factors

**Endpoint**: `GET /api/v1/config/salary-factors`

**Response**:
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

### 8.2 Update Salary Factors

**Endpoint**: `PUT /api/v1/config/salary-factors`

**Request Body**:
```json
[
  {
    "code": "OT_WEEKDAY",
    "value": 1.5
  },
  {
    "code": "OT_SUNDAY",
    "value": 2.0
  }
]
```

---

### 8.3 Get Tax Config

**Endpoint**: `GET /api/v1/config/tax`

**Response**:
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

---

### 8.4 Get Insurance Config

**Endpoint**: `GET /api/v1/config/insurance`

**Response**:
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

---

### 8.5 Get Holidays

**Endpoint**: `GET /api/v1/config/holidays`

**Query Parameters**:
- `year`: Integer (required)

**Response**:
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

### 8.6 Create Holiday

**Endpoint**: `POST /api/v1/config/holidays`

**Request Body**:
```json
{
  "holidayDate": "2026-01-01",
  "name": "Tết Dương lịch",
  "description": "Ngày Tết Dương lịch"
}
```

---

## 9. Reports

### 9.1 Generate Salary Report

**Endpoint**: `POST /api/v1/reports/salary`

**Request Body**:
```json
{
  "monthNum": 1,
  "yearNum": 2026,
  "deptId": "uuid",
  "format": "EXCEL"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "Tạo báo cáo thành công",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "reportUrl": "https://storage.example.com/reports/salary_2026_01.xlsx",
    "expiresAt": "2026-02-10T15:30:00Z"
  }
}
```

---

### 9.2 Get Dashboard

**Endpoint**: `GET /api/v1/reports/dashboard`

**Query Parameters**:
- `monthNum`: Integer
- `yearNum`: Integer

**Response**:
```json
{
  "status": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": {
    "totalEmployees": 100,
    "activeEmployees": 95,
    "totalPayroll": 2000000000,
    "unpaidPayroll": 50,
    "paidPayroll": 45,
    "avgSalary": 20000000,
    "totalOtHours": 500,
    "totalOtCost": 50000000
  }
}
```

---

### 9.3 Export Payroll

**Endpoint**: `GET /api/v1/reports/export`

**Query Parameters**:
- `monthNum`: Integer (required)
- `yearNum`: Integer (required)
- `format`: String (EXCEL, PDF) - default: EXCEL

**Response**: File download (Excel hoặc PDF)

---

## Phụ lục

### Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| `ERR_001` | Validation failed | 400 |
| `ERR_002` | Resource not found | 404 |
| `ERR_003` | Unauthorized | 401 |
| `ERR_004` | Forbidden | 403 |
| `ERR_005` | Internal server error | 500 |
| `ERR_006` | Duplicate entry | 409 |
| `ERR_007` | Business rule violation | 422 |

### Business Rules Summary

1. **Employee**: Không xóa vật lý, chỉ soft delete (status = INACTIVE)
2. **Contract**: Mỗi nhân viên chỉ có 1 contract ACTIVE tại một thời điểm
3. **Attendance**: Unique constraint trên (emp_id, attendance_date)
4. **Payroll**: 
   - Chỉ update/delete được khi status = UNPAID
   - Unique constraint trên (emp_id, month_num, year_num)
5. **Salary Payment**: Mỗi payroll chỉ có 1 payment (payroll_id unique)
