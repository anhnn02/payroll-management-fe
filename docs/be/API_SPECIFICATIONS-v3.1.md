# API Specifications - HRM Payroll Management System

> **Version**: 1.0  
> **Created**: 2026-02-09  
> **Base URL**: `/api/v1`  
> **Authentication**: JWT Bearer Token

---

## API Snapshot Mới Nhất (FE dùng phần này)

> **Updated from source code**: 2026-03-25 (bổ sung dashboard-pyc PYC, payroll search `employeeCode`/`employeeName`, chấm công tháng)  
> **Nguồn chuẩn**: `controller` + `dto/request` + `dto/response` hiện tại.

### A. Chuẩn response dùng chung

- `SuccessResponse<T>`
  - `status`, `code`, `message`, `timestamp`, `data`
- `PageResponse<T>`
  - `status`, `code`, `message`, `timestamp`, `data.content[]`, `data.page`, `data.size`, `data.totalElements`, `data.totalPages`
- `ErrorResponse`
  - `status`, `code`, `message`, `timestamp`, `data` (chi tiết lỗi nếu có)

### B. Danh sách endpoint mới nhất

| Module | Method | Endpoint | Request | Response |
|---|---|---|---|---|
| Auth | POST | `/api/v1/auth/login` | `AuthRequest` | `SuccessResponse<AuthResponse>` |
| Auth | POST | `/api/v1/auth/refresh` | `RefreshRequest` | `SuccessResponse<AuthResponse>` |
| Auth | POST | `/api/v1/auth/logout` | Header `Authorization` | `SuccessResponse<Void>` |
| Auth | GET | `/api/v1/auth/me` | Header `Authorization` | `SuccessResponse<UserInfoResponse>` |
| Departments | POST | `/api/v1/departments` | `DepartmentRequest` | `SuccessResponse<DepartmentResponse>` |
| Departments | POST | `/api/v1/departments/search` | `DepartmentSearchRequest` | `PageResponse<DepartmentResponse>` |
| Departments | PUT | `/api/v1/departments/{id}` | `DepartmentRequest` | `SuccessResponse<DepartmentResponse>` |
| Departments | GET | `/api/v1/departments/{id}` | Path `id` | `SuccessResponse<DepartmentResponse>` |
| Departments | DELETE | `/api/v1/departments/{id}` | Path `id` | `204 No Content` |
| Positions | POST | `/api/v1/positions` | `PositionRequest` | `SuccessResponse<PositionResponse>` |
| Positions | POST | `/api/v1/positions/search` | `PositionSearchRequest` | `PageResponse<PositionResponse>` |
| Positions | PUT | `/api/v1/positions/{id}` | `PositionRequest` | `SuccessResponse<PositionResponse>` |
| Positions | GET | `/api/v1/positions/{id}` | Path `id` | `SuccessResponse<PositionResponse>` |
| Positions | DELETE | `/api/v1/positions/{id}` | Path `id` | `204 No Content` |
| Employees | POST | `/api/v1/employees` | `EmployeeRequest` | `SuccessResponse<EmployeeResponse>` |
| Employees | POST | `/api/v1/employees/search` | `EmployeeSearchRequest` | `PageResponse<EmployeeResponse>` |
| Employees | PUT | `/api/v1/employees/{id}` | `EmployeeRequest` | `SuccessResponse<EmployeeResponse>` |
| Employees | GET | `/api/v1/employees/{id}` | Path `id` | `SuccessResponse<EmployeeResponse>` |
| Employees | DELETE | `/api/v1/employees/{id}` | Path `id` | `204 No Content` |
| Employees | POST | `/api/v1/employees/export` | `EmployeeSearchRequest` | `application/octet-stream` |
| Contracts | POST | `/api/v1/contracts` | `ContractRequest` | `SuccessResponse<ContractResponse>` |
| Contracts | POST | `/api/v1/contracts/search` | `ContractSearchRequest` | `PageResponse<ContractResponse>` |
| Contracts | PUT | `/api/v1/contracts/{id}` | `ContractRequest` | `SuccessResponse<ContractResponse>` |
| Contracts | GET | `/api/v1/contracts/{id}` | Path `id` | `SuccessResponse<ContractResponse>` |
| Contracts | DELETE | `/api/v1/contracts/{id}` | Path `id` | `204 No Content` |
| Contracts | POST | `/api/v1/contracts/{id}/upload` | Multipart `file` | `SuccessResponse<Void>` |
| Attendance | POST | `/api/v1/attendance` | `AttendanceRequest` | `SuccessResponse<AttendanceResponse>` |
| Attendance | POST | `/api/v1/attendance/search` | `AttendanceSearchRequest` | `PageResponse<AttendanceResponse>` |
| Attendance | GET | `/api/v1/attendance/monthly` | Query `month`, `keyword?`, `deptId?` | `SuccessResponse<AttendanceMonthlyResponse>` |
| Attendance | PUT | `/api/v1/attendance/monthly/{empId}` | Query `month`, body `AttendanceMonthlyUpdateRequest`. **Role**: `HR_MANAGER` | `SuccessResponse<Void>` |
| Attendance | GET | `/api/v1/attendance/{id}` | Path `id` | `SuccessResponse<AttendanceResponse>` |
| Attendance | PUT | `/api/v1/attendance/{id}` | `AttendanceRequest` | `SuccessResponse<AttendanceResponse>` |
| Attendance | DELETE | `/api/v1/attendance/{id}` | Path `id` | `204 No Content` |
| Attendance | GET | `/api/v1/attendance/template` | - | File `attendance_template.xlsx` |
| Attendance | POST | `/api/v1/attendance/import` | Multipart `file` | `SuccessResponse<Void>` |
| Attendance | POST | `/api/v1/attendance/import/preview` | Multipart `file` | `SuccessResponse<AttendanceImportResultResponse>` |
| Attendance | POST | `/api/v1/attendance/import/apply` | Multipart `file`, query `overwrite=false` | `SuccessResponse<AttendanceImportResultResponse>` |
| Payroll | POST | `/api/v1/payroll/calculate` | `PayrollCalculateRequest` | `SuccessResponse<Void>` |
| Payroll | POST | `/api/v1/payroll/breakdown` | `PayrollCalculateRequest` | `SuccessResponse<PayrollBreakdownResponse>` |
| Payroll | POST | `/api/v1/payroll/search` | `PayrollSearchRequest` | `PageResponse<PayrollResponse>` |
| Payroll | PUT | `/api/v1/payroll/{id}` | `PayrollCalculateRequest` | `SuccessResponse<PayrollResponse>` |
| Payroll | DELETE | `/api/v1/payroll/{id}` | Path `id` | `204 No Content` |
| Salary Payments | POST | `/api/v1/salary-payments/create` | `SalaryPaymentRequest` | `SuccessResponse<SalaryPaymentCreateResponse>` |
| Salary Payments | POST | `/api/v1/salary-payments/search` | `SalaryPaymentSearchRequest` | `SuccessResponse<PageResponse<SalaryPaymentResponse>>` |
| Salary Payments | GET | `/api/v1/salary-payments/{id}` | Path `id` | `SuccessResponse<SalaryPaymentResponse>` |
| Config | GET | `/api/v1/config/salary-factors` | - | `SuccessResponse<List<SalaryFactorConfigResponse>>` |
| Config | PUT | `/api/v1/config/salary-factors` | `List<SalaryFactorConfigRequest>` | `SuccessResponse<List<SalaryFactorConfigResponse>>` |
| Config | GET | `/api/v1/config/tax` | - | `SuccessResponse<List<TaxConfigResponse>>` |
| Config | GET | `/api/v1/config/insurance` | - | `SuccessResponse<List<InsuranceConfigResponse>>` |
| Config | GET | `/api/v1/config/holidays` | - | `SuccessResponse<List<HolidayResponse>>` |
| Config | POST | `/api/v1/config/holidays` | `HolidayRequest`. **Role**: `HR_MANAGER` | `SuccessResponse<HolidayResponse>` |
| Config | DELETE | `/api/v1/config/holidays/{id}` | Path `id`. **Role**: `HR_MANAGER` | `204 No Content` |
| Reports | POST | `/api/v1/reports/salary` | `SalaryReportRequest` | `SuccessResponse<SalaryReportResponse>` |
| Reports | GET | `/api/v1/reports/dashboard` | Query `monthNum`, `yearNum` | `SuccessResponse<DashboardResponse>` |
| Reports | GET | `/api/v1/reports/dashboard-pyc` | Query `month?` (YYYY-MM; bỏ trống = tháng hiện tại). **Roles**: `HR_MANAGER`, `ACCOUNTANT` | `SuccessResponse<DashboardPycResponse>` |
| Reports | GET | `/api/v1/reports/export` | Query `monthNum`, `yearNum`, `format=EXCEL|PDF` | `application/octet-stream` |

### C. Request schema mới nhất (để FE map)

- `AuthRequest`: `username`, `password`
- `RefreshRequest`: `refreshToken`
- `DepartmentRequest`: `code`, `name`, `description`, `parentId`, `status`
- `DepartmentSearchRequest`: `keyword`, `code`, `name`, `status`, `page`, `size`, `sort` — `keyword`: tìm gần đúng theo `code` hoặc `name` (OR)
- `PositionRequest`: `code`, `name`, `description`, `level`, `status`
- `PositionSearchRequest`: `keyword`, `code`, `name`, `level`, `status`, `page`, `size`, `sort` — `keyword`: OR trên `code`, `name`
- `EmployeeRequest`: `code`, `name`, `dob`, `gender` (MALE \| FEMALE \| OTHER), `idCard`, `email`, `phone` (optional), `address` (optional), `deptId`, `positionId`, `hireDate` (DATE `yyyy-MM-dd`), `status`
- `EmployeeSearchRequest`: `keyword`, `code`, `name`, `deptIds[]`, `positionIds[]`, `status`, `gender` (String, khớp chính xác), `page`, `size`, `sort` — `keyword`: OR trên `code`, `name`
- `ContractRequest`: `contractNumber`, `empId`, `startDate`, `endDate` (DATE), `salaryType`, `baseSalary`, `offerSalary`, `contractType`, `status`, `terms` (không còn `factorId`)
- `ContractSearchRequest`: `keyword`, `contractNumber`, `empId`, `status`, `startDateFrom`, `startDateTo`, `page`, `size`, `sort` — `keyword`: OR trên `contractNumber`, `contractType`
- `AttendanceRequest`: `empId`, `attendanceDate`, `startTime`, `endTime`, `workHours`, `normalHours`, `otHours`, `isWorkingDay`, `otType`, `note`
- `AttendanceSearchRequest`: `month`, `keyword`, `deptId`, `empId`, `dateFrom`, `dateTo`, `page`, `size`, `sort`
- `AttendanceMonthlyUpdateRequest`: `workDays`, `otHours`, `leaveApproved`, `leaveUnauthorized` (tất cả `@NotNull`). **Quy tắc**: `workDays + leaveApproved + leaveUnauthorized` không được vượt quá số ngày trong tháng; hệ thống tạo bản ghi chấm công theo **từng ngày lịch** trong tháng (gồm T7/CN nếu cần đủ slot). Nghỉ có phép / không phép lưu `note` = `LEAVE_APPROVED` / `LEAVE_UNAUTHORIZED`.
- `PayrollCalculateRequest`: `employeeCode`, `monthYear`
- `PayrollSearchRequest`: `keyword`, `empId`, `status`, `monthNum`, `yearNum`, `page`, `size`, `sort` — `keyword`: lọc theo mã/tên nhân viên (gần đúng)
- `SalaryPaymentRequest`: `monthNum`, `yearNum`, `paymentDate`, `approvedBy`, `note`
- `SalaryPaymentSearchRequest`: `keyword`, `monthNum`, `yearNum`, `approvedBy`, `page`, `size` — `keyword`: OR trên `approvedBy`, `note`
- `SalaryFactorConfigRequest`: `code` (bắt buộc), `value` (bắt buộc), `name` / `description` / `effectiveDate` (tùy chọn). **Cập nhật** hệ số đã tồn tại: chỉ cần `code` + `value` (giữ nguyên `name`, `effectiveDate` trong DB nếu không gửi). **Tạo mới** (code chưa có): bắt buộc thêm `name` và `effectiveDate`
- `HolidayRequest`: `holidayDate`, `name`, `description`
- `SalaryReportRequest`: `monthNum`, `yearNum`, `deptId`, `format`

### D. Response schema mới nhất (để FE map)

- `AuthResponse`: `accessToken`, `refreshToken`
- `UserInfoResponse`: `username`, `roles[]`
- `DepartmentResponse`: `id`, `code`, `name`, `description`, `parentId`, `parentName`, `status`, `employeeCount`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `PositionResponse`: `id`, `code`, `name`, `description`, `level`, `status`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `EmployeeResponse`: `id`, `code`, `name`, `dob`, `gender`, `idCard`, `email`, `phone`, `address`, `deptId`, `deptName`, `positionId`, `positionName`, `hireDate`, `status`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt` — `deptName` / `positionName` chỉ được điền trong **`POST /employees/search`** (các API khác có thể `null`)
- `ContractResponse`: `id`, `contractNumber`, `empId`, `startDate`, `endDate`, `salaryType`, `baseSalary`, `offerSalary`, `contractType`, `status`, `fileUrl`, `terms`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `AttendanceResponse`: `id`, `empId`, `attendanceDate`, `startTime`, `endTime`, `workHours`, `normalHours`, `otHours`, `isWorkingDay`, `otType`, `note`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `AttendanceMonthlyResponse`: `month`, `locked`, `employeeCount`, `totalOtHours`, `avgWorkDays`, `rows[]`
- `AttendanceMonthlyRowResponse`: `empId`, `employeeCode`, `employeeName`, `deptId`, `deptName`, `workDays`, `standardDays`, `otHours`, `leaveApproved`, `leaveUnauthorized`
- `AttendanceImportResultResponse`: `totalRows`, `successCount`, `failedCount`, `errors[]`
- `AttendanceImportErrorResponse`: `row`, `employeeCode`, `error`
- `PayrollBreakdownResponse`: `employeeCode`, `monthYear`, `workingSalary`, `allowance`, `reward`, `penalty`, `otHours`, `otSalary`, `bhxh`, `bhtn`, `bhyt`, `tax`, `totalSalary`
- `PayrollResponse`: `id`, `empId`, `monthNum`, `yearNum`, `basicSalary`, `offerSalary`, `workingDays`, `standardDays`, `workingSalary`, `allowance`, `rewardAmount`, `penaltyAmount`, `otHours`, `otSalary`, `bhxhAmount`, `bhtnAmount`, `bhytAmount`, `taxAmount`, `totalSalary`, `grossNet`, `status`, `calculatedAt`, `calculatedBy`
- `SalaryPaymentCreateResponse`: `count`, `message`
- `SalaryPaymentResponse`: `id`, `payrollId`, `paymentDate`, `approvedBy`, `note`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `SalaryFactorConfigResponse`: `id`, `code`, `name`, `value`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `TaxConfigResponse`: `id`, `code`, `personalDeduction`, `dependentDeduction`, `taxRate`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `InsuranceConfigResponse`: `id`, `code`, `contractType`, `bhxhRate`, `bhtnRate`, `bhytRate`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `HolidayResponse`: `id`, `holidayDate`, `name`, `description`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- `SalaryReportResponse`: `reportUrl`, `expiresAt`
- `DashboardResponse`: `totalEmployees`, `activeEmployees`, `totalPayroll`, `unpaidPayroll`, `paidPayroll`, `avgSalary`, `totalOtHours`, `totalOtCost`
- `DashboardPycResponse`: `month` (YYYY-MM), `alerts[]`, `kpis`, `charts`, `quickLinks[]`, `deptStatus[]`
  - `DashboardAlert`: `type`, `severity` (INFO \| WARN \| ERROR), `message`, `link`, `roles[]` (HR_MANAGER / ACCOUNTANT — đánh dấu đối tượng; **BE chỉ trả các alert user hiện tại được xem**)
  - `DashboardKpis`: `activeEmployees`, `payrollFund` (**`null`** nếu tháng chưa có bản ghi payroll — hiển thị “Chưa tính lương”), `totalOtHours` (tổng giờ OT **attendance** trong tháng), `unpaidPayrollCount`
  - `DashboardCharts`: `payrollTrend6m[]` (`MonthlyPoint`: `month`, `amount`), `payrollByDept[]` (`DeptAmount`: `deptId`, `deptName`, `amount` — quỹ lương theo PB), `otByDept[]` (cùng schema — tổng `otHours` attendance theo PB)
  - `DashboardQuickLink`: `label`, `url`, `roles[]`
  - `DashboardDeptStatus`: `deptId`, `deptName`, `activeEmployeeCount`, `avgWorkDays`, `avgOtHours`, `status` (`OK` \| `THIEU_CHAM_CONG` \| `CHO_DUYET_LUONG`) — với user **chỉ** `ACCOUNTANT` (không có `HR_MANAGER`), `deptStatus` trả **`[]`**

### E. Lỗi API FE cần xử lý

- `VALIDATION_ERROR` (400)
- `BAD_REQUEST` (400)
- `TYPE_MISMATCH` (400)
- `ACCESS_DENIED` (403)
- `NOT_FOUND` (404)
- `ALREADY_EXISTS` (409)
- `INTERNAL_ERROR` (500)

---

## Mục lục

1. [Quy tắc chung](#1-quy-tắc-chung)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Organization Management](#3-organization-management)
4. [Employee Management](#4-employee-management)
5. [Contract Management](#5-contract-management)
6. [Attendance Management](#6-attendance-management)
7. [Payroll Processing](#7-payroll-processing)
7A. [Salary Payments](#7a-salary-payments)
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

#### Error Response (áp dụng cho toàn bộ API)
```json
{
  "status": "ERROR",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2026-02-09T15:30:00Z",
  "data": [
    "name: Tên không được để trống"
  ]
}
```

**Quy ước lỗi chung**:
- Validation lỗi (`MethodArgumentNotValidException`, `ConstraintViolationException`) trả `400` + `code=VALIDATION_ERROR`, chi tiết nằm trong `data`.
- Sai kiểu dữ liệu/format (`MethodArgumentTypeMismatchException`, parse JSON lỗi) trả `400` + `code=TYPE_MISMATCH` hoặc `BAD_REQUEST`.
- Dữ liệu không tồn tại trả `404` + `code=NOT_FOUND`.
- Trùng dữ liệu unique key trả `409` + `code=ALREADY_EXISTS`.
- Không đủ quyền trả `403` + `code=ACCESS_DENIED`.
- Lỗi không xác định trả `500` + `code=INTERNAL_ERROR`.

### 1.4 Common Query Parameters (cho Search endpoints)

Các API dạng `POST .../search` dùng **JSON body** (không dùng query string cho phân trang).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 0 | Số trang (bắt đầu từ 0) |
| `size` | Integer | 10–20 tùy API | Số bản ghi mỗi trang (`EmployeeSearch` mặc định 20) |
| `sort` | String | null | Sắp xếp (vd: "name,asc") — hiện có thể chưa áp dụng ở mọi service |
| `keyword` | String | null | (Nếu có) Tìm gần đúng — ý nghĩa từng module xem mục snapshot **C** và chi tiết từng endpoint |

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
  "keyword": "",
  "code": "IT",
  "name": "Công nghệ",
  "status": "ACTIVE",
  "page": 0,
  "size": 10,
  "sort": "name,asc"
}
```

- `keyword` (optional): Chuỗi tìm gần đúng, khớp `code` **hoặc** `name` (LIKE `%keyword%`).

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
        "employeeCount": 12,
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
- `parentName`: Tên phòng ban cha (nullable)
- `status`: Trạng thái (ACTIVE, INACTIVE)
- `employeeCount`: Số lượng nhân viên thuộc phòng ban (Long, mặc định 0)

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
  "keyword": "",
  "code": "DEV",
  "name": "Developer",
  "level": "JUNIOR",
  "status": "ACTIVE",
  "page": 0,
  "size": 10
}
```

- `keyword` (optional): Tìm gần đúng theo `code` **hoặc** `name`.

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
  "keyword": "",
  "code": "",
  "name": "",
  "deptIds": [],
  "positionIds": [],
  "status": "ACTIVE",
  "gender": "",
  "page": 0,
  "size": 20,
  "sort": null
}
```

- `keyword` (optional): Tìm gần đúng theo mã nhân viên **hoặc** họ tên (`code` / `name`).
- `deptIds` / `positionIds`: Lọc theo danh sách ID (nhiều giá trị).
- `gender` (optional): Khớp chính xác (ví dụ `MALE`, `FEMALE`, `OTHER`); để trống thì không lọc.

**Response** (mỗi phần tử `content` có thêm `deptName`, `positionName` — tên phòng ban / chức vụ tương ứng `deptId`, `positionId`):

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

**Fields (response item)**:
- `code`: Mã nhân viên (VARCHAR 20, format: `NV` + `YYYYMMDD` + 3 số, ví dụ `NV20260101001`)
- `name`: Họ tên (VARCHAR 100)
- `dob`: Ngày sinh (DATE)
- `gender`: Giới tính (MALE, FEMALE, OTHER)
- `idCard`, `email`, `phone`, `address`: Theo entity
- `deptId`, `positionId`: UUID
- `deptName`, `positionName`: Tên hiển thị — **chỉ populate ở API search**; nếu FK không tồn tại có thể `null`
- `hireDate`: Ngày vào làm (DATE)
- `status`: Trạng thái (ACTIVE, INACTIVE)

---

### 4.2 Get Employee by ID

**Endpoint**: `GET /api/v1/employees/{id}`

**Response**: Cùng cấu trúc object nhân viên; `deptName` / `positionName` thường **không** có (null).

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
- `code`: Required, unique, format `NV` + `YYYYMMDD` (8 số) + 3 số thứ tự (regex `^NV\d{8}\d{3}$`, ví dụ `NV20260101001`)
- `name`: Required, 1-100 ký tự
- `dob`: Required, phải < ngày hiện tại
- `gender`: Required, enum (MALE, FEMALE, OTHER)
- `idCard`: Required, unique, 9 hoặc 12 số
- `email`: Required, unique, format email hợp lệ
- `phone`: Optional, format số điện thoại VN (10-11 số)
- `address`: Optional
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
  "keyword": "",
  "contractNumber": "",
  "empId": "",
  "status": "ACTIVE",
  "startDateFrom": null,
  "startDateTo": null,
  "page": 0,
  "size": 10,
  "sort": null
}
```

- `keyword` (optional): Tìm gần đúng theo `contractNumber` **hoặc** `contractType`.

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
        "contractNumber": "HD001",
        "empId": "uuid",
        "startDate": "2020-01-01",
        "endDate": null,
        "baseSalary": 10000000,
        "offerSalary": 20000000,
        "salaryType": "GROSS",
        "contractType": "OFFICIAL",
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

**Fields** (theo `ContractResponse` thực tế):
- `id`, `contractNumber`, `empId`
- `startDate`, `endDate` (DATE)
- `salaryType`, `baseSalary`, `offerSalary`, `contractType`, `status`
- `fileUrl`, `terms`
- `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

---

### 5.2 Get Contract by ID

**Endpoint**: `GET /api/v1/contracts/{id}`

---

### 5.3 Create Contract

**Endpoint**: `POST /api/v1/contracts`

**Request Body**:
```json
{
  "contractNumber": "HD001",
  "empId": "uuid",
  "startDate": "2020-01-01",
  "endDate": null,
  "salaryType": "GROSS",
  "baseSalary": 10000000,
  "offerSalary": 20000000,
  "contractType": "OFFICIAL",
  "status": "ACTIVE",
  "terms": "Các điều khoản..."
}
```

**Validation** (theo DTO hiện tại; chi tiết có thể bổ sung ở service):
- `contractNumber`: Required
- `empId`: Required, phải tồn tại
- `startDate`: Required (DATE)
- `endDate`: Optional
- `contractType`, `salaryType`, `status`, `baseSalary`, `offerSalary`, `terms`: Theo nghiệp vụ

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

### 6.6 Get monthly attendance (tổng hợp)

**Endpoint**: `GET /api/v1/attendance/monthly`  
**Query**: `month` (bắt buộc, `YYYY-MM`), `keyword?`, `deptId?`

**Response** (`AttendanceMonthlyResponse`): `month`, `locked` (true nếu đã có payroll **PAID** tháng đó), `employeeCount`, `totalOtHours`, `avgWorkDays`, `rows[]` (`AttendanceMonthlyRowResponse`: `empId`, `employeeCode`, `employeeName`, `deptId`, `deptName`, `workDays`, `standardDays`, `otHours`, `leaveApproved`, `leaveUnauthorized`).

**Ghi chú**: Đếm nghỉ dựa trên `note` khớp chính xác `LEAVE_APPROVED` / `LEAVE_UNAUTHORIZED`.

---

### 6.7 Update monthly attendance (inline)

**Endpoint**: `PUT /api/v1/attendance/monthly/{empId}`  
**Role**: `HR_MANAGER`  
**Query**: `month` (`YYYY-MM`)  
**Body**: `AttendanceMonthlyUpdateRequest` (xem snapshot **C**).

**Lỗi / nghiệp vụ**:
- Tháng đã có payroll **PAID** → `409` / nghiệp vụ từ chối (khóa sửa).
- `workDays + leaveApproved + leaveUnauthorized` > số ngày trong tháng → lỗi (HTTP tùy `GlobalExceptionHandler`, thường 400/500 với message rõ ràng).
- Cập nhật xóa bản ghi chấm công tháng của NV rồi tạo lại theo tổng hợp (tránh trùng unique `(emp_id, attendance_date)`).

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
  "keyword": "",
  "empId": "",
  "monthNum": 1,
  "yearNum": 2026,
  "status": "UNPAID",
  "page": 0,
  "size": 10,
  "sort": null
}
```

- `keyword` (optional): Lọc theo mã hoặc tên nhân viên (gần đúng), map qua `empId`.

**Response**: `PageResponse<PayrollResponse>` (phân trang; từng item gồm `employeeCode`, `employeeName`, `workingSalary`, `calculatedAt`, … — xem snapshot **D**).

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

## 7A. Salary Payments

### 7A.1 Create Salary Payments (batch)

**Endpoint**: `POST /api/v1/salary-payments/create`  
**Role**: `ACCOUNTANT`

**Request Body** (`SalaryPaymentRequest`): `monthNum`, `yearNum`, `paymentDate` (optional), `approvedBy`, `note` (optional)

**Response** (`SalaryPaymentCreateResponse`): `count` (số phiếu tạo), `message`

### 7A.2 Search Salary Payments

**Endpoint**: `POST /api/v1/salary-payments/search`

**Request Body**:
```json
{
  "keyword": "",
  "monthNum": 3,
  "yearNum": 2026,
  "approvedBy": "",
  "page": 0,
  "size": 20
}
```

- `keyword` (optional): Tìm gần đúng theo `approvedBy` **hoặc** `note`.

**Response**: `SuccessResponse<PageResponse<SalaryPaymentResponse>>` — cấu trúc lồng `data` giống các API phân trang khác.

### 7A.3 Get Salary Payment by ID

**Endpoint**: `GET /api/v1/salary-payments/{id}`

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

### 8.7 Delete Holiday

**Endpoint**: `DELETE /api/v1/config/holidays/{id}`  
**Role**: `HR_MANAGER`

**Response**: `204 No Content` — không body.

**Lỗi**: `404` nếu `id` không tồn tại (`NOT_FOUND`).

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

### 9.3 Get Dashboard PYC (Module 3.8 / FR-DSH-001)

**Endpoint**: `GET /api/v1/reports/dashboard-pyc`  
**Roles**: `HR_MANAGER`, `ACCOUNTANT` (`@PreAuthorize`)

**Query**:
- `month` (optional): `YYYY-MM`. Bỏ trống = tháng hiện tại theo server.

**Cấu hình** (`application.yml`):
- `app.dashboard.pyc.unauthorized-leave-alert-threshold`: số ngày (bản ghi) nghỉ không phép tối thiểu để hiện alert `UNAUTHORIZED_LEAVE` (mặc định `0` → bất kỳ `count > 0` đều cảnh báo).

**Response** (`SuccessResponse<DashboardPycResponse>`): xem snapshot **D** (đầy đủ nested types).

**Alert** (ví dụ `type`; chỉ các mục phù hợp role mới có trong `alerts[]`):
| type | severity | Đối tượng role (ý định) |
|------|----------|-------------------------|
| `PAYROLL_UNPAID` | INFO | HR_MANAGER, ACCOUNTANT |
| `CONTRACT_EXPIRING` | WARN | HR_MANAGER |
| `MISSING_ATTENDANCE` | WARN | HR_MANAGER |
| `NO_PAYROLL` | WARN | HR_MANAGER |
| `UNAUTHORIZED_LEAVE` | ERROR | HR_MANAGER, ACCOUNTANT |

Với user **chỉ Accountant** (không đồng thời HR): thứ tự alert ưu tiên `PAYROLL_UNPAID` trước; `deptStatus` = `[]`.

**Quick links** (đã lọc theo role): HR thấy nhân viên, chấm công, tính lương, cấu hình, phê duyệt; Accountant thấy phê duyệt, báo cáo lương, xuất bảng lương (đường dẫn frontend trong `url`).

**Ví dụ** (rút gọn):
```json
{
  "status": "SUCCESS",
  "code": "SUCCESS",
  "message": "OK",
  "data": {
    "month": "2026-03",
    "alerts": [
      {
        "type": "PAYROLL_UNPAID",
        "severity": "INFO",
        "message": "Bảng lương tháng 3/2026 đang chờ phê duyệt",
        "link": "/payroll/approve",
        "roles": ["HR_MANAGER", "ACCOUNTANT"]
      }
    ],
    "kpis": {
      "activeEmployees": 48,
      "payrollFund": 920000000,
      "totalOtHours": 120.5,
      "unpaidPayrollCount": 12
    },
    "charts": {
      "payrollTrend6m": [{ "month": "2025-10", "amount": 0 }, { "month": "2026-03", "amount": 920000000 }],
      "payrollByDept": [{ "deptId": "uuid", "deptName": "Kỹ thuật", "amount": 400000000 }],
      "otByDept": [{ "deptId": "uuid", "deptName": "Kỹ thuật", "amount": 45.5 }]
    },
    "quickLinks": [
      { "label": "Phê duyệt lương", "url": "/payroll/approve", "roles": ["HR_MANAGER", "ACCOUNTANT"] }
    ],
    "deptStatus": [
      {
        "deptId": "uuid",
        "deptName": "Kỹ thuật",
        "activeEmployeeCount": 20,
        "avgWorkDays": 21.5,
        "avgOtHours": 2.3,
        "status": "OK"
      }
    ]
  }
}
```

---

### 9.4 Export Payroll

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
| `VALIDATION_ERROR` | Validation failed | 400 |
| `BAD_REQUEST` | Bad request | 400 |
| `TYPE_MISMATCH` | Invalid parameter/type format | 400 |
| `ACCESS_DENIED` | Forbidden | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `ALREADY_EXISTS` | Duplicate entry | 409 |
| `INTERNAL_ERROR` | Internal server error | 500 |

### Business Rules Summary

1. **Employee**: Không xóa vật lý, chỉ soft delete (status = INACTIVE)
2. **Contract**: Mỗi nhân viên chỉ có 1 contract ACTIVE tại một thời điểm
3. **Attendance**: Unique constraint trên (emp_id, attendance_date)
4. **Payroll**: 
   - Chỉ update/delete được khi status = UNPAID
   - Unique constraint trên (emp_id, month_num, year_num)
5. **Salary Payment**: Mỗi payroll chỉ có 1 payment (payroll_id unique)
6. **Dashboard PYC**: Dữ liệu OT KPI / biểu đồ OT theo phòng ban lấy từ **attendance** tháng chọn; quỹ lương / xu hướng / donut lương theo **payroll**
7. **Chấm công tháng (PUT monthly)**: Tổng slot ngày không vượt quá số ngày lịch của tháng; có thể ghi nhận công/ngày nghỉ trên cả ngày cuối tuần khi cần đủ số ngày nhập
