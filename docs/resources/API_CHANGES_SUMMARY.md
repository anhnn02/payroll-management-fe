## Danh sách API có thay đổi input/output (tóm tắt)

### Attendance

- **POST** `/api/v1/attendance/search`
  - **Input (AttendanceSearchRequest)**
    - **Thêm**: `month` (YYYY-MM), `keyword`, `deptId`
  - **Output**: không đổi (`PageResponse<AttendanceResponse>`)

- **GET** `/api/v1/attendance/monthly` (mới)
  - **Input**
    - `month` (required), `keyword` (optional), `deptId` (optional)
  - **Output (mới)**: `SuccessResponse<AttendanceMonthlyResponse>`
    - **Thêm**: `locked`, `employeeCount`, `totalOtHours`, `avgWorkDays`, `rows[]` (tổng hợp theo NV)

- **PUT** `/api/v1/attendance/monthly/{empId}` (mới)
  - **Input (mới)**: `month` (query) + body `AttendanceMonthlyUpdateRequest` (`workDays`, `otHours`, `leaveApproved`, `leaveUnauthorized`)
  - **Output**: `SuccessResponse<Void>`

- **POST** `/api/v1/attendance/import/preview` (mới)
  - **Input**: multipart `file`
  - **Output (mới)**: `SuccessResponse<AttendanceImportResultResponse>` (totalRows/successCount/failedCount/errors[])

- **POST** `/api/v1/attendance/import/apply` (mới)
  - **Input**: multipart `file` + `overwrite` (query, default=false)
  - **Output (mới)**: `SuccessResponse<AttendanceImportResultResponse>`

- **POST** `/api/v1/attendance/import`
  - **Hành vi**: giữ tương thích, nhưng **nội bộ** chạy như `applyImport(overwrite=true)`
  - **Output**: vẫn `SuccessResponse<Void>`

---

### Employee

- **POST** `/api/v1/employees/search`
  - **Input (EmployeeSearchRequest)**
    - **Thêm**: `keyword`, `deptIds[]`, `positionIds[]`, `gender`
    - **Đổi mặc định**: `size` từ 10 → **20**
  - **Output**: không đổi (`PageResponse<EmployeeResponse>`)

- **POST** `/api/v1/employees/export` (mới)
  - **Input**: body `EmployeeSearchRequest` (dùng chung filter)
  - **Output**: file `.xlsx` (bytes)

- **DELETE** `/api/v1/employees/{id}`
  - **Hành vi**: đổi từ hard delete → **vô hiệu hoá** (set `status=INACTIVE`)
  - **Output**: không đổi (204 No Content)

---

### Payroll

- **POST** `/api/v1/payroll/breakdown` (mới)
  - **Input**: `PayrollCalculateRequest` (`employeeCode`, `monthYear`)
  - **Output (mới)**: `SuccessResponse<PayrollBreakdownResponse>` (các giá trị phase 1/2/3 + total)

---

### Salary payment (phê duyệt & tạo phiếu chi)

- **POST** `/api/v1/salary-payments/create`
  - **Input (SalaryPaymentRequest)**
    - **Thêm**: `monthNum`, `yearNum`
  - **Hành vi**: bỏ stored procedure, chuyển sang Java transactional:
    - payroll `UNPAID` → `PAID`
    - tạo `salary_payment`
  - **Output**: không đổi shape (`SalaryPaymentCreateResponse {count, message}`)

---

### Reports

- **GET** `/api/v1/reports/export`
  - **Hành vi**: **chặn export** nếu kỳ lương chưa PAID (theo rule PYC)

- **GET** `/api/v1/reports/dashboard-pyc` (mới)
  - **Input**: `month` (optional, default tháng hiện tại)
  - **Output (mới)**: `SuccessResponse<DashboardPycResponse>` (alerts/kpis/charts/quickLinks)

