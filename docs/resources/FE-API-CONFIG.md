# Frontend API Configuration Guide

> **Tài liệu tham chiếu**: [HLD.md](./04-HLD/HLD.md) | [DD-HRM-PAYROLL.md](./06-DD/DD-HRM-PAYROLL.md)
> **Ngày tạo**: 2026-02-10
> **Mục đích**: Hướng dẫn FE developer config phần gọi API khớp với thiết kế Backend

---

## 1. Base URL & Axios Config

### 1.1 Environment Variables

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# .env.production
VITE_API_BASE_URL=https://your-domain.com/api/v1
```

### 1.2 Axios Instance

```ts
// src/utils/request.ts (hoặc src/api/axios.ts)
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// ===== Request Interceptor: Gắn JWT Token =====
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') // hoặc store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ===== Response Interceptor: Xử lý lỗi chung =====
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { status, data } = error.response || {}

    if (status === 401) {
      // Token hết hạn → redirect login
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }

    if (status === 403) {
      // Không có quyền
      // ElMessage.error('Bạn không có quyền truy cập')
    }

    // Trả về message lỗi từ BE
    return Promise.reject(data?.message || error.message)
  }
)

export default request
```

---

## 2. Quy ước API Pattern (Quan trọng ⚠️)

### 2.1 URL Pattern Rules

| Thao tác | HTTP Method | URL Pattern | Ví dụ |
|----------|-------------|-------------|-------|
| **Tìm kiếm / Danh sách** | `POST` | `/{resource}/search` | `POST /employees/search` |
| **Chi tiết** | `GET` | `/{resource}/{id}` | `GET /employees/{id}` |
| **Tạo mới** | `POST` | `/{resource}` | `POST /employees` |
| **Cập nhật** | `PUT` | `/{resource}/{id}` | `PUT /employees/{id}` |
| **Xóa** | `DELETE` | `/{resource}/{id}` | `DELETE /employees/{id}` |
| **Hành động đặc biệt** | `POST` | `/{resource}/{action}` | `POST /payroll/calculate` |
| **Xuất file** | `GET` | `/{resource}/export` | `GET /reports/export` |

> ⚠️ **LƯU Ý QUAN TRỌNG**: Hệ thống dùng **`POST /search`** để lấy danh sách (KHÔNG phải GET với query params). Filter, phân trang gửi trong **request body**.

### 2.2 Standard Search Request Body

```ts
// Cấu trúc chung cho mọi request search
interface SearchRequest {
  keyword?: string          // Từ khóa tìm kiếm chung
  status?: string           // Filter theo trạng thái
  page: number              // Số trang (0-indexed hoặc 1-indexed, tùy BE)
  size: number              // Số bản ghi mỗi trang
  sortBy?: string           // Tên field sort
  sortDirection?: 'ASC' | 'DESC'
  // ... Các filter riêng theo từng module
}
```

### 2.3 Standard Paginated Response

```ts
// Response chung cho mọi danh sách có phân trang
interface PageResponse<T> {
  content: T[]              // Dữ liệu
  totalElements: number     // Tổng số bản ghi
  totalPages: number        // Tổng số trang
  size: number              // Số bản ghi mỗi trang
  number: number            // Trang hiện tại
  first: boolean
  last: boolean
}
```

---

## 3. Enums & Constants (Define phía FE)

```ts
// src/constants/enums.ts

// ===== Trạng thái chung =====
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// ===== Giới tính =====
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: 'Nam',
  [Gender.FEMALE]: 'Nữ',
  [Gender.OTHER]: 'Khác'
}

// ===== Loại hợp đồng =====
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

// ===== Loại lương =====
export enum SalaryType {
  GROSS = 'GROSS',
  NET = 'NET'
}

// ===== Trạng thái Payroll =====
export enum PayrollStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID'
}

export const PayrollStatusLabel: Record<PayrollStatus, string> = {
  [PayrollStatus.UNPAID]: 'Chưa thanh toán',
  [PayrollStatus.PAID]: 'Đã thanh toán'
}

// ===== Cấp bậc =====
export enum PositionLevel {
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR'
}

// ===== Loại tăng ca =====
export enum OtType {
  WEEKDAY = 'WEEKDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  HOLIDAY = 'HOLIDAY'
}

// ===== Quan hệ người phụ thuộc =====
export enum Relationship {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  PARENT = 'PARENT'
}

// ===== Vai trò người dùng =====
export enum UserRole {
  HR_MANAGER = 'HR_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT'
}

// ===== Trạng thái User =====
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

// ===== Trạng thái hợp đồng =====
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}
```

---

## 4. Service Layer - Chi tiết theo Module

### 4.1 Authentication (`/auth`)

```ts
// src/api/auth.service.ts
import request from '@/utils/request'

// ===== Interfaces =====
interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  role: 'HR_MANAGER' | 'ACCOUNTANT'
  username: string
  employeeId?: string
}

// ===== API Calls =====
const AUTH_URL = '/auth'

export const authService = {
  /** Đăng nhập */
  login(data: LoginRequest) {
    return request.post<LoginResponse>(`${AUTH_URL}/login`, data)
  },

  /** Đăng xuất */
  logout() {
    return request.post(`${AUTH_URL}/logout`)
  },

  /** Refresh token */
  refreshToken() {
    return request.post(`${AUTH_URL}/refresh`)
  }
}
```

---

### 4.2 Department (`/departments`)

```ts
// src/api/department.service.ts
import request from '@/utils/request'

// ===== Interfaces =====
interface Department {
  id: string
  code: string
  name: string
  description?: string
  parentId?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

interface DepartmentSearchRequest {
  keyword?: string
  status?: string
  page: number
  size: number
}

interface DepartmentCreateRequest {
  code: string
  name: string
  description?: string
  parentId?: string
  status: string
}

// ===== API Calls =====
const DEPT_URL = '/departments'

export const departmentService = {
  /** Tìm kiếm phòng ban */
  search(data: DepartmentSearchRequest) {
    return request.post(`${DEPT_URL}/search`, data)
  },

  /** Chi tiết phòng ban */
  getById(id: string) {
    return request.get(`${DEPT_URL}/${id}`)
  },

  /** Tạo phòng ban */
  create(data: DepartmentCreateRequest) {
    return request.post(DEPT_URL, data)
  },

  /** Cập nhật phòng ban */
  update(id: string, data: Partial<DepartmentCreateRequest>) {
    return request.put(`${DEPT_URL}/${id}`, data)
  },

  /** Xóa phòng ban */
  delete(id: string) {
    return request.delete(`${DEPT_URL}/${id}`)
  }
}
```

---

### 4.3 Position (`/positions`)

```ts
// src/api/position.service.ts
import request from '@/utils/request'

interface Position {
  id: string
  code: string
  name: string
  description?: string
  level: 'JUNIOR' | 'MIDDLE' | 'SENIOR'
  status: 'ACTIVE' | 'INACTIVE'
}

interface PositionSearchRequest {
  keyword?: string
  status?: string
  level?: string
  page: number
  size: number
}

const POS_URL = '/positions'

export const positionService = {
  search(data: PositionSearchRequest) {
    return request.post(`${POS_URL}/search`, data)
  },

  getById(id: string) {
    return request.get(`${POS_URL}/${id}`)
  },

  create(data: Omit<Position, 'id'>) {
    return request.post(POS_URL, data)
  },

  update(id: string, data: Partial<Position>) {
    return request.put(`${POS_URL}/${id}`, data)
  },

  delete(id: string) {
    return request.delete(`${POS_URL}/${id}`)
  }
}
```

---

### 4.4 Employee (`/employees`)

```ts
// src/api/employee.service.ts
import request from '@/utils/request'

interface Employee {
  id: string
  code: string               // Format: NVYYMMDD### (auto-generated)
  name: string
  dob: string                // Format: YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  idCard: string             // CMND/CCCD (12 ký tự)
  email: string
  phone?: string
  address?: string
  deptId: string             // FK → Department
  positionId: string         // FK → Position
  hireDate: string           // Format: YYYY-MM-DD
  status: 'ACTIVE' | 'INACTIVE'
}

interface EmployeeSearchRequest {
  keyword?: string           // Tìm theo code, name, email
  status?: string
  deptId?: string            // Filter theo phòng ban
  positionId?: string        // Filter theo chức vụ
  page: number
  size: number
}

const EMP_URL = '/employees'

export const employeeService = {
  search(data: EmployeeSearchRequest) {
    return request.post(`${EMP_URL}/search`, data)
  },

  getById(id: string) {
    return request.get(`${EMP_URL}/${id}`)
  },

  create(data: Omit<Employee, 'id' | 'code'>) {
    return request.post(EMP_URL, data)
  },

  update(id: string, data: Partial<Employee>) {
    return request.put(`${EMP_URL}/${id}`, data)
  },

  /** Soft delete (chuyển status → INACTIVE) */
  delete(id: string) {
    return request.delete(`${EMP_URL}/${id}`)
  }
}
```

---

### 4.5 Contract (`/contracts`)

```ts
// src/api/contract.service.ts
import request from '@/utils/request'

interface Contract {
  id: string
  empId: string
  contractNumber: string
  contractType: 'PROBATION' | 'OFFICIAL' | 'SEASONAL'
  startDate: string
  endDate?: string
  baseSalary: number         // Lương cơ bản (tính BHXH)
  offerSalary: number        // Lương thỏa thuận
  salaryType: 'GROSS' | 'NET'
  terms?: string
  fileUrl?: string           // URL file PDF (nếu upload)
  status: 'ACTIVE' | 'EXPIRED'
}

interface ContractSearchRequest {
  keyword?: string
  empId?: string
  contractType?: string
  status?: string
  page: number
  size: number
}

const CONTRACT_URL = '/contracts'

export const contractService = {
  search(data: ContractSearchRequest) {
    return request.post(`${CONTRACT_URL}/search`, data)
  },

  getById(id: string) {
    return request.get(`${CONTRACT_URL}/${id}`)
  },

  create(data: Omit<Contract, 'id'>) {
    return request.post(CONTRACT_URL, data)
  },

  update(id: string, data: Partial<Contract>) {
    return request.put(`${CONTRACT_URL}/${id}`, data)
  },

  /** Upload file PDF hợp đồng (multipart/form-data) */
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

### 4.6 Attendance (`/attendance`)

```ts
// src/api/attendance.service.ts
import request from '@/utils/request'

interface Attendance {
  id: string
  empId: string
  attendanceDate: string     // YYYY-MM-DD
  startTime?: string         // Giờ vào
  endTime?: string           // Giờ ra
  workHours: number          // Tổng giờ làm
  normalHours: number        // Giờ làm thường
  otHours: number            // Giờ tăng ca
  otType?: 'WEEKDAY' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY'
  isWorkingDay: boolean
  note?: string
}

interface AttendanceSearchRequest {
  empId?: string
  month?: number             // 1-12
  year?: number
  page: number
  size: number
}

interface ImportResult {
  totalRows: number
  successCount: number
  failedCount: number
  errors: Array<{
    row: number
    employeeCode: string
    error: string
  }>
}

const ATT_URL = '/attendance'

export const attendanceService = {
  /** Tìm kiếm chấm công */
  search(data: AttendanceSearchRequest) {
    return request.post(`${ATT_URL}/search`, data)
  },

  /** Chi tiết chấm công */
  getById(id: string) {
    return request.get(`${ATT_URL}/${id}`)
  },

  /** Cập nhật chấm công */
  update(id: string, data: Partial<Attendance>) {
    return request.put(`${ATT_URL}/${id}`, data)
  },

  /** Download template Excel */
  downloadTemplate() {
    return request.get(`${ATT_URL}/template`, {
      responseType: 'blob'
    })
  },

  /** Import chấm công từ file Excel (multipart/form-data) */
  importExcel(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<ImportResult>(`${ATT_URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

---

### 4.7 Payroll (`/payroll`) ⭐ Core Module

```ts
// src/api/payroll.service.ts
import request from '@/utils/request'

// ===== Interfaces =====
interface CalculatePayrollRequest {
  employeeCode: string       // Mã nhân viên: "NV20260101001"
  monthYear: string          // Format: "YYYY-MM" (ví dụ: "2026-01")
}

interface PayrollResponse {
  payrollId: string
  employeeCode: string
  employeeName: string
  monthNum: number
  yearNum: number
  basicSalary: number        // Lương cơ bản
  offerSalary: number        // Lương thỏa thuận
  workingDays: number         // Số công thực tế
  standardDays: number        // Số công chuẩn (≈22)
  workingSalary: number       // Lương theo công
  allowance: number           // Tổng phụ cấp
  rewardAmount: number        // Tổng thưởng
  penaltyAmount: number       // Tổng phạt
  otHours: number             // Tổng giờ OT
  otSalary: number            // Lương OT
  bhxhAmount: number          // BHXH (10%)
  bhtnAmount: number          // BHTN (5%)
  bhytAmount: number          // BHYT (5%)
  taxAmount: number           // Thuế TNCN
  totalSalary: number         // Lương thực nhận (NET)
  grossNet: 'GROSS' | 'NET'
  status: 'UNPAID' | 'PAID'
  calculatedAt: string
  calculatedBy: string
}

interface PayrollSearchRequest {
  keyword?: string            // Tìm theo mã NV, tên NV
  status?: 'UNPAID' | 'PAID'
  month?: number
  year?: number
  employeeCode?: string
  page: number
  size: number
}

// ===== API Calls =====
const PAYROLL_URL = '/payroll'

export const payrollService = {
  /**
   * ⭐ Tính lương (Core)
   * Gọi stored procedure CALCULATE_PAYROLL trên database
   * - Phase 1: Tính lương theo công + phụ cấp + thưởng/phạt
   * - Phase 2: Tính lương tăng ca (OT)
   * - Phase 3: Tính bảo hiểm + thuế TNCN
   */
  calculate(data: CalculatePayrollRequest) {
    return request.post<PayrollResponse>(`${PAYROLL_URL}/calculate`, data)
  },

  /** Tìm kiếm bảng lương */
  search(data: PayrollSearchRequest) {
    return request.post(`${PAYROLL_URL}/search`, data)
  },

  /** Chi tiết bảng lương */
  getById(id: string) {
    return request.get<PayrollResponse>(`${PAYROLL_URL}/${id}`)
  },

  /** Cập nhật bảng lương (manual adjustment) */
  update(id: string, data: Partial<PayrollResponse>) {
    return request.put(`${PAYROLL_URL}/${id}`, data)
  },

  /** Xóa bảng lương (chỉ được xóa khi status = UNPAID) */
  delete(id: string) {
    return request.delete(`${PAYROLL_URL}/${id}`)
  }
}
```

---

### 4.8 Salary Payment (`/salary-payments`) ⭐ Core Module

```ts
// src/api/salary-payment.service.ts
import request from '@/utils/request'

// ===== Interfaces =====
interface CreatePaymentRequest {
  paymentDate: string         // ISO format: "2026-02-01T10:00:00Z"
  approvedBy: string          // Username người phê duyệt
  note?: string               // Ghi chú
}

interface CreatePaymentResponse {
  count: number               // Số phiếu chi đã tạo
  message: string             // "Đã tạo N phiếu chi lương thành công"
  paymentIds: string[]        // Danh sách UUID
}

interface SalaryPayment {
  id: string
  payrollId: string
  paymentDate: string
  approvedBy: string
  note?: string
  createdBy: string
  createdAt: string
}

interface PaymentSearchRequest {
  month?: number
  year?: number
  approvedBy?: string
  page: number
  size: number
}

// ===== API Calls =====
const PAYMENT_URL = '/salary-payments'

export const salaryPaymentService = {
  /**
   * ⭐ Tạo phiếu chi lương (Core)
   * Gọi stored procedure CREATE_SALARY_PAYMENT
   * - Tạo phiếu chi cho TẤT CẢ payroll có status = UNPAID
   * - Tự động update payroll.status = PAID
   */
  create(data: CreatePaymentRequest) {
    return request.post<CreatePaymentResponse>(`${PAYMENT_URL}/create`, data)
  },

  /** Tìm kiếm phiếu chi */
  search(data: PaymentSearchRequest) {
    return request.post(`${PAYMENT_URL}/search`, data)
  },

  /** Chi tiết phiếu chi */
  getById(id: string) {
    return request.get<SalaryPayment>(`${PAYMENT_URL}/${id}`)
  }
}
```

---

### 4.9 Configuration (`/config`)

```ts
// src/api/config.service.ts
import request from '@/utils/request'

// ===== Interfaces =====
interface SalaryFactor {
  id: string
  code: string          // 'OT', 'OT_SUN', 'OT_HOL'
  name: string
  value: number         // 1.5, 2.0, 3.0
  description?: string
  effectiveDate: string
}

interface TaxConfig {
  id: string
  code: string          // 'TAX_1', 'TAX_2', ... 'TAX_7'
  taxRate: number       // 5, 10, 15, 20, 25, 30, 35
  minIncome: number
  maxIncome?: number
  description?: string
}

interface InsuranceConfig {
  id: string
  contractType: string  // 'OFFICIAL', 'PROBATION', 'SEASONAL'
  bhxhRate: number      // 10.00
  bhtnRate: number      // 5.00
  bhytRate: number      // 5.00
  effectiveDate: string
}

interface Holiday {
  id: string
  holidayDate: string   // YYYY-MM-DD
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
  updateSalaryFactors(data: SalaryFactor[]) {
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

  /** Lấy danh sách ngày lễ */
  getHolidays() {
    return request.get<Holiday[]>(`${CONFIG_URL}/holidays`)
  },

  /** Thêm ngày lễ */
  createHoliday(data: Omit<Holiday, 'id'>) {
    return request.post(`${CONFIG_URL}/holidays`, data)
  }
}
```

---

### 4.10 Reports (`/reports`)

```ts
// src/api/report.service.ts
import request from '@/utils/request'

interface SalaryReportRequest {
  month: number
  year: number
  deptId?: string
}

interface DashboardResponse {
  totalEmployees: number
  totalPayroll: number
  totalOtHours: number
  totalInsurance: number
  totalTax: number
  // ... Thêm tùy BE trả về
}

const REPORT_URL = '/reports'

export const reportService = {
  /** Báo cáo lương theo phòng ban/tháng */
  generateSalaryReport(data: SalaryReportRequest) {
    return request.post(`${REPORT_URL}/salary`, data)
  },

  /** Dữ liệu Dashboard */
  getDashboard() {
    return request.get<DashboardResponse>(`${REPORT_URL}/dashboard`)
  },

  /**
   * Xuất bảng lương (Excel/PDF)
   * ⚠️ responseType: 'blob' để nhận file binary
   */
  exportPayroll(params: { month: number; year: number; format: 'EXCEL' | 'PDF' }) {
    return request.get(`${REPORT_URL}/export`, {
      params,
      responseType: 'blob'
    })
  }
}
```

#### Helper: Download file từ Blob response

```ts
// src/utils/download.ts
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// Sử dụng:
// const blob = await reportService.exportPayroll({ month: 1, year: 2026, format: 'EXCEL' })
// downloadFile(blob, 'payroll_2026_01.xlsx')
```

---

### 4.11 AI Workforce Planning (`/workforce`) — Optional

```ts
// src/api/workforce.service.ts
import request from '@/utils/request'

interface OTAnalysis {
  id: string
  monthNum: number
  yearNum: number
  totalOtHours: number
  totalOtCost: number
  avgOtPerEmp: number
  insights: string           // AI-generated text
  status: string
}

interface HiringPlan {
  id: string
  otAnalysisId: string
  deptId: string
  positionId: string
  avgOtHours: number
  currentHeadcount: number
  hireCount: number
  hireLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR'
  reason: string
  otCost: number
  hireCost: number
  roiPercent: number
  breakevenMonths: number
  priority: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED'
  approvedBy?: string
  approvedAt?: string
}

const WF_URL = '/workforce'

export const workforceService = {
  /** Trigger AI phân tích OT */
  analyze(data: { month: number; year: number }) {
    return request.post<OTAnalysis>(`${WF_URL}/analyze`, data)
  },

  /** Lấy kết quả phân tích theo tháng */
  getAnalysis(month: number, year: number) {
    return request.get<OTAnalysis>(`${WF_URL}/analysis/${month}/${year}`)
  },

  /** Danh sách đề xuất tuyển dụng */
  getHiringPlans(params?: { status?: string; page?: number; size?: number }) {
    return request.get<HiringPlan[]>(`${WF_URL}/hiring-plans`, { params })
  },

  /** Phê duyệt đề xuất */
  approveHiringPlan(id: string) {
    return request.put(`${WF_URL}/hiring-plans/${id}/approve`)
  },

  /** Từ chối đề xuất */
  rejectHiringPlan(id: string, reason: string) {
    return request.put(`${WF_URL}/hiring-plans/${id}/reject`, { reason })
  },

  /** Lấy cấu hình phân tích */
  getConfig() {
    return request.get(`${WF_URL}/config`)
  },

  /** Cập nhật cấu hình phân tích */
  updateConfig(data: {
    scheduleDay: number
    scheduleTime: string
    otThreshold: number
  }) {
    return request.put(`${WF_URL}/config`, data)
  }
}
```

---

## 5. Phân quyền trên giao diện (RBAC)

### 5.1 Permission Matrix

| Chức năng | HR_MANAGER | ACCOUNTANT |
|-----------|:----------:|:----------:|
| Quản lý Phòng ban (CRUD) | ✅ | ❌ (chỉ xem) |
| Quản lý Chức vụ (CRUD) | ✅ | ❌ (chỉ xem) |
| Quản lý Nhân viên (CRUD) | ✅ | ❌ (chỉ xem) |
| Quản lý Hợp đồng (CRUD) | ✅ | ❌ (chỉ xem) |
| Chấm công (import, update) | ✅ | ❌ (chỉ xem) |
| **Tính lương** (calculate) | ✅ | ❌ |
| Xem bảng lương | ✅ | ✅ |
| **Tạo phiếu chi** | ❌ | ✅ |
| Xem phiếu chi | ❌ | ✅ |
| Cấu hình hệ số lương | ✅ | ❌ |
| Cấu hình thuế / bảo hiểm | ✅ | ✅ |
| Xuất báo cáo | ✅ | ✅ |
| AI Workforce Planning | ✅ | ❌ |

### 5.2 FE Implementation

```ts
// src/utils/permission.ts
import { useUserStore } from '@/stores/user'

export function hasPermission(requiredRoles: string[]): boolean {
  const userStore = useUserStore()
  return requiredRoles.includes(userStore.role)
}

// Sử dụng trong template:
// v-if="hasPermission(['HR_MANAGER'])"
// v-if="hasPermission(['HR_MANAGER', 'ACCOUNTANT'])"
```

---

## 6. Cấu trúc thư mục khuyến nghị

```
src/
├── api/                          # Service layer (gọi API)
│   ├── auth.service.ts
│   ├── department.service.ts
│   ├── position.service.ts
│   ├── employee.service.ts
│   ├── contract.service.ts
│   ├── attendance.service.ts
│   ├── payroll.service.ts        # ⭐ Core
│   ├── salary-payment.service.ts # ⭐ Core
│   ├── config.service.ts
│   ├── report.service.ts
│   └── workforce.service.ts      # AI module
│
├── constants/
│   └── enums.ts                  # Tất cả enums + labels
│
├── types/                        # Hoặc đặt interfaces ngay trong service
│   ├── employee.ts
│   ├── payroll.ts
│   └── ...
│
├── utils/
│   ├── request.ts                # Axios instance + interceptors
│   ├── download.ts               # Helper download file
│   └── permission.ts             # Helper phân quyền
│
└── stores/
    └── user.ts                   # Pinia store lưu user info, token, role
```

---

## 7. Checklist tích hợp API

- [ ] Config `VITE_API_BASE_URL` trong `.env`
- [ ] Setup Axios instance với JWT interceptor
- [ ] Xử lý response interceptor (401 → logout, 403 → báo lỗi)
- [ ] Tạo file `enums.ts` với tất cả constants
- [ ] Tạo service files cho từng module (11 files)
- [ ] Test API login → lưu token → gọi API có auth
- [ ] Implement phân quyền hiển thị menu theo role
- [ ] Xử lý download file (Export Excel/PDF) với `responseType: 'blob'`
- [ ] Xử lý upload file (Import attendance, Upload contract) với `multipart/form-data`
- [ ] Kiểm tra tất cả search API dùng `POST` (không phải GET)
