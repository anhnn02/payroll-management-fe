# API Integration Checklist

> So sánh giữa tài liệu BE (`docs/be/API_SPECIFICATIONS-v2.md`) và code FE thực tế.
>
> Base URL (FE): `https://be-salary.goldhorizon.asia/api/v1` (từ `.env.development`)
>
> Base URL (Doc): `/api/v1`
>
> **Cập nhật lần cuối:** 2026-03-24 — **Đã cập nhật theo API v2**

**Tất cả 41 API trong tài liệu BE đã được triển khai ở FE.** ✅

---

## 1. Authentication (`auth.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 2.1 | Đăng nhập | POST | `/auth/login` | ✅ |
| 2.2 | Refresh Token | POST | `/auth/refresh` | ✅ |
| 2.3 | Đăng xuất | POST | `/auth/logout` | ✅ |
| 2.4 | Lấy thông tin user | GET | `/auth/me` | ✅ |

**v2 changes:** AuthResponse chỉ còn `accessToken`, `refreshToken`. UserInfoResponse: `username`, `roles[]`.

---

## 2. Employee (`employee.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 3.1 | Tạo nhân viên | POST | `/employees` | ✅ |
| 3.2 | Tìm kiếm nhân viên | POST | `/employees/search` | ✅ |
| 3.3 | Chi tiết nhân viên | GET | `/employees/{id}` | ✅ |
| 3.4 | Cập nhật nhân viên | PUT | `/employees/{id}` | ✅ |
| 3.5 | Xóa nhân viên | DELETE | `/employees/{id}` | ✅ |
| 3.6 | Export Excel | POST | `/employees/export` | ✅ |

**v2 changes:** Search dùng `deptIds[]`, `positionIds[]` (array), thêm `code`, `name`, `gender`.

---

## 3. Department (`department.services.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 4.1 | Tạo phòng ban | POST | `/departments` | ✅ |
| 4.2 | Tìm kiếm phòng ban | POST | `/departments/search` | ✅ |
| 4.3 | Chi tiết phòng ban | GET | `/departments/{id}` | ✅ |
| 4.4 | Cập nhật phòng ban | PUT | `/departments/{id}` | ✅ |
| 4.5 | Xóa phòng ban | DELETE | `/departments/{id}` | ✅ |

**v2 changes:** Search dùng `code`, `name` thay cho `keyword`.

---

## 4. Position (`position.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 5.1 | Tạo chức vụ | POST | `/positions` | ✅ |
| 5.2 | Tìm kiếm chức vụ | POST | `/positions/search` | ✅ |
| 5.3 | Chi tiết chức vụ | GET | `/positions/{id}` | ✅ |
| 5.4 | Cập nhật chức vụ | PUT | `/positions/{id}` | ✅ |
| 5.5 | Xóa chức vụ | DELETE | `/positions/{id}` | ✅ |

**v2 changes:** Bỏ `minSalary`/`maxSalary`/`employeeCount`, thêm `level` (JUNIOR/MIDDLE/SENIOR). Search dùng `code`, `name`, `level`.

---

## 5. Contract (`contract.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 6.1 | Tạo hợp đồng | POST | `/contracts` | ✅ |
| 6.2 | Tìm kiếm hợp đồng | POST | `/contracts/search` | ✅ |
| 6.3 | Chi tiết hợp đồng | GET | `/contracts/{id}` | ✅ |
| 6.4 | Cập nhật hợp đồng | PUT | `/contracts/{id}` | ✅ |
| 6.5 | Xóa hợp đồng | DELETE | `/contracts/{id}` | ✅ |
| 6.6 | Upload file hợp đồng | POST | `/contracts/{id}/upload` | ✅ |

**v2 changes:** Search dùng `contractNumber`, `startDateFrom`, `startDateTo` (bỏ `keyword`, `contractType`). Response dùng `fileUrl`.

---

## 6. Attendance (`attendance.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 7.1 | Tạo bản ghi chấm công | POST | `/attendance` | ✅ |
| 7.2 | Tìm kiếm chấm công | POST | `/attendance/search` | ✅ |
| 7.3 | Bảng chấm công tháng | GET | `/attendance/monthly` | ✅ |
| 7.4 | Cập nhật chấm công tháng | PUT | `/attendance/monthly/{empId}` | ✅ |
| 7.5 | Chi tiết bản ghi chấm công | GET | `/attendance/{id}` | ✅ |
| 7.6 | Cập nhật bản ghi chấm công | PUT | `/attendance/{id}` | ✅ |
| 7.7 | Xóa bản ghi chấm công | DELETE | `/attendance/{id}` | ✅ |
| 7.8 | Tải template Excel | GET | `/attendance/template` | ✅ |
| 7.9 | Import chấm công (legacy) | POST | `/attendance/import` | ✅ |
| 7.10 | Preview import | POST | `/attendance/import/preview` | ✅ |
| 7.11 | Áp dụng import | POST | `/attendance/import/apply` | ✅ |

**v2 changes:** `month` là query param ở `PUT monthly/{empId}`. OT type: WEEKDAY/SATURDAY/SUNDAY/HOLIDAY. Response row dùng `employeeCode`/`employeeName`/`standardDays`.

---

## 7. Payroll (`payroll.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 8.1 | Tính lương | POST | `/payroll/calculate` | ✅ |
| 8.2 | Xem breakdown lương | POST | `/payroll/breakdown` | ✅ |
| 8.3 | Tìm kiếm bảng lương | POST | `/payroll/search` | ✅ |
| 8.4 | Cập nhật bảng lương | PUT | `/payroll/{id}` | ✅ |
| 8.5 | Xóa bảng lương | DELETE | `/payroll/{id}` | ✅ |

**v2 changes:** Calculate trả về `Void`. Search chỉ dùng `empId`, `status`, `monthNum`, `yearNum`. Update dùng `PayrollCalculateRequest`.

---

## 8. Salary Payment (`salary-payment.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 9.1 | Tạo thanh toán lương | POST | `/salary-payments/create` | ✅ |
| 9.2 | Tìm kiếm phiếu thanh toán | POST | `/salary-payments/search` | ✅ |
| 9.3 | Chi tiết phiếu thanh toán | GET | `/salary-payments/{id}` | ✅ |

**v2 changes:** CreateResponse dùng `paymentCount`, `createdIds[]`. SearchRequest bỏ `page`/`size`.

---

## 9. Config (`config.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 10.1 | Lấy hệ số lương | GET | `/config/salary-factors` | ✅ |
| 10.2 | Cập nhật hệ số lương | PUT | `/config/salary-factors` | ✅ |
| 10.3 | Lấy cấu hình thuế | GET | `/config/tax` | ✅ |
| 10.4 | Lấy cấu hình bảo hiểm | GET | `/config/insurance` | ✅ |
| 10.5 | Lấy ngày nghỉ lễ | GET | `/config/holidays` | ✅ |
| 10.6 | Thêm ngày nghỉ lễ | POST | `/config/holidays` | ✅ |

**v2 changes:** TaxConfig dùng `personalDeduction`/`dependentDeduction` thay `minIncome`/`maxIncome`. SalaryFactor/Insurance/Holiday có audit fields.

---

## 10. Report & Dashboard (`dashboard.service.ts`)

| # | API | Method | URL | Status |
|---|-----|--------|-----|--------|
| 11.1 | Tạo báo cáo lương | POST | `/reports/salary` | ✅ |
| 11.2 | Dashboard tổng quan | GET | `/reports/dashboard` | ✅ |
| 11.3 | Dashboard PYC (nâng cao) | GET | `/reports/dashboard-pyc` | ✅ |
| 11.4 | Export báo cáo Excel/PDF | GET | `/reports/export` | ✅ |

---

## TỔNG KẾT

| Trạng thái | Số lượng |
|------------|----------|
| ✅ Đã ghép đúng (v2) | **41/41** |
| ⚠️ Ghép sai | **0** |
| ❌ Chưa ghép | **0** |
