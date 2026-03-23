**HRM – PAYROLL MANAGEMENT SYSTEM**

**SOFTWARE REQUIREMENTS SPECIFICATION**

| Tài liệu | SRS – Module 3.8: Dashboard Tổng Hợp |
| :---- | :---- |
| **Phiên bản** | 1.0 |
| **Ngày tạo** | 15/03/2026 |
| **Trạng thái** | Draft |
| **Use Case** | UC-13 – Xem Dashboard |
| **Chức năng** | FR-DSH-001 |
| **Actor** | HR Manager (đầy đủ) | Accountant (giới hạn role) |
| **Sprint** | Sprint 2 |

# **3.8  DASHBOARD TỔNG HỢP**

UC-13 · Sprint 2 · Actor: HR Manager (đầy đủ), Accountant (giới hạn role)

## **3.8.1  DASHBOARD – TRANG CHỦ HỆ THỐNG**

FR-DSH-001 · Sprint 2 · Actor: HR Manager, Accountant

### **1.1  Thông Tin Chung**

| Thuộc Tính | Nội Dung |
| :---- | :---- |
| Mã chức năng | FR-DSH-001 |
| Tên màn hình | Dashboard Tổng Hợp – Trang Chủ Hệ Thống |
| URL | /dashboard  (redirect mặc định ngay sau khi đăng nhập) |
| Actor | HR Manager (xem đầy đủ, click điều hướng) | Accountant (xem giới hạn theo role) |
| Điều kiện tiên quyết | User đã đăng nhập; JWT hợp lệ; hệ thống có ít nhất 1 module dữ liệu |
| Hậu điều kiện | Màn hình hiển thị dữ liệu tổng hợp; không thay đổi bất kỳ dữ liệu DB nào |
| Use Case | UC-13: Xem Dashboard |
| Business Rules | BR-DSH-01 đến BR-DSH-08 |
| API | GET /api/v1/reports/dashboard?month=YYYY-MM |
| Phụ thuộc | Module 3.3 (Nhân viên) · Module 3.4 (Phòng ban/HĐ) · Module 3.6 (Chấm công) · Module 3.7 (Lương) |

### **1.2  Màn Hình / Giao Diện**

Màn hình 1 – Dashboard HR Manager (tháng 03/2026, đầy đủ dữ liệu):

![][image1]

*Hình 1 – FR-DSH-001: Dashboard HR Manager – Alert 2 cảnh báo, 4 KPI cards, Line chart xu hướng lương, Donut chart phân bổ phòng ban, bảng trạng thái, quick links*

Màn hình 2 – Dashboard Accountant (hiển thị khác biệt theo role):

![][image2]

*Hình 2 – FR-DSH-001: Dashboard Accountant – Alert 'Bảng lương chờ duyệt' xanh lá, KPI-4 có nút \[Duyệt ngay\], ẩn cột chấm công, Quick Links chỉ hiện Phê duyệt*

Màn hình 3 – Dashboard Empty State (tháng 04/2026 chưa có dữ liệu):

![][image3]

*Hình 3 – FR-DSH-001: Dashboard Empty State – KPI-2/3/4 hiển thị '—', Charts empty state, Alert 'Chưa tính lương' và 'NV chưa chấm công'*

### **1.3  Mô Tả Chi Tiết Các Thành Phần**

**Vùng 1 – Alert Banner:**

| Thành Phần | Loại | Mô Tả Chi Tiết |
| :---- | :---- | :---- |
| Alert: HĐ sắp hết hạn | Banner vàng ⚠ | Trigger: COUNT(contract WHERE end\_date BETWEEN NOW() AND NOW()+30d) \> 0; nội dung: 'X hợp đồng sắp hết hạn trong 30 ngày tới'; click → /contracts?filter=expiring; chỉ HR Manager thấy |
| Alert: NV chưa chấm công | Banner cam ⚠ | Trigger: có NV ACTIVE không có attendance tháng hiện tại; nội dung: 'X nhân viên chưa có dữ liệu chấm công tháng này'; click → /attendance/manage?tab=import; chỉ HR Manager thấy |
| Alert: Bảng lương chờ duyệt | Banner xanh lá ℹ | Trigger: payroll.status=UNPAID tháng hiện tại; nội dung: 'Bảng lương tháng X/YYYY đang chờ phê duyệt'; click → /payroll/approve; chỉ Accountant thấy (ưu tiên cao) |
| Alert: Chưa tính lương | Banner vàng ⚠ | Trigger: không có payroll record nào tháng hiện tại; nội dung: 'Chưa tính lương tháng X/YYYY'; click → /payroll/calculate; chỉ HR Manager thấy |
| Alert: Nghỉ không phép | Banner đỏ ❗ | Trigger: COUNT(attendance WHERE note LIKE '%không phép%') \> threshold; cả 2 role thấy |

  *ℹ  Alert Banner ẩn hoàn toàn nếu không có điều kiện nào được kích hoạt. Không hiển thị placeholder hay banner rỗng (BR-DSH-03).*

**Vùng 2 – KPI Cards (4 thẻ):**

| Thẻ KPI | Loại | Mô Tả Chi Tiết |
| :---- | :---- | :---- |
| KPI-1: Nhân Viên Active | Stat card (xanh dương) | SELECT COUNT(\*) FROM employee WHERE status='ACTIVE'; sub-label: 'đang làm việc'; click → /employees; cả 2 role thấy |
| KPI-2: Quỹ Lương Tháng | Stat card (xanh lá) | SELECT SUM(total\_salary) FROM payroll WHERE month=?; nếu null → hiển thị '—' \+ text nhỏ màu đỏ 'Chưa tính lương'; click → /payroll/calculate |
| KPI-3: Tổng Giờ OT | Stat card (cam) | SELECT SUM(ot\_hours) FROM attendance WHERE month=?; nếu null → '—'; click → /attendance/manage |
| KPI-4: Chờ Phê Duyệt | Stat card (tím) | SELECT COUNT(\*) FROM payroll WHERE status='UNPAID' AND month=?; Accountant: thêm nút \[✅ Duyệt ngay →\] xanh lá nổi bật ngay dưới số; HR Manager: click → /payroll/approve |

**Vùng 3 – Charts:**

| Thành Phần | Loại | Mô Tả Chi Tiết |
| :---- | :---- | :---- |
| Chart 1: Xu Hướng Quỹ Lương | Line chart (50% trái) | SUM(total\_salary) GROUP BY month/year LIMIT 6 tháng gần nhất; Trục X: T10/25…T3/26; Trục Y: VNĐ; area gradient fill; hover tooltip; không click |
| Chart 2: Phân Bổ Lương Theo Phòng Ban | Donut chart (50% phải) | SUM(total\_salary) JOIN employee JOIN department GROUP BY dept; click slice → navigate /reports/payroll?dept={deptId} (UC-13 A1); empty state nếu chưa có payroll |
| Bar Chart: OT Theo Phòng Ban | Bar chart (dưới Charts) | SUM(ot\_hours) GROUP BY dept tháng hiện tại; màu bar theo phòng ban; không click |

**Vùng 4 – Bảng Trạng Thái Theo Phòng Ban:**

| Cột | Nguồn DB | Hiển Thị Với | Mô Tả |
| :---- | :---- | :---- | :---- |
| Phòng Ban | department.name | HR \+ Accountant | Badge màu riêng mỗi phòng ban; không phân trang |
| Số NV | COUNT(employee WHERE dept AND status=ACTIVE) | HR \+ Accountant | Tổng NV đang làm việc thuộc phòng ban |
| Đã Chấm Công | COUNT(DISTINCT emp\_id) có attendance tháng | Chỉ HR Manager | Số NV đã có ≥1 bản ghi attendance; ẩn với Accountant (BR-DSH-06) |
| Chưa CC | Số NV – Đã CC | Chỉ HR Manager | Badge đỏ nếu \> 0; click → /attendance/manage?dept={id}; ẩn với Accountant |
| Tổng OT (h) | SUM(ot\_hours) GROUP BY dept tháng hiện tại | HR \+ Accountant | Badge cam |
| Trạng Thái Lương | payroll.status tháng hiện tại | HR \+ Accountant | PAID (xanh ✓) | UNPAID (vàng ⏳) | Chưa tính (xám —) |

**Vùng 5 – Quick Links:**

| Icon / Nhãn | Điều Hướng Đến | Hiển Thị Với Role |
| :---- | :---- | :---- |
| 👥 Nhân Viên | /employees | HR Manager, Accountant |
| 📋 Hợp Đồng | /contracts | HR Manager (ẩn với Accountant) |
| 📆 Import Chấm Công | /attendance/manage?tab=import | HR Manager (ẩn với Accountant) |
| 📊 Quản Lý Chấm Công | /attendance/manage | HR Manager, Accountant |
| 🧮 Tính Lương | /payroll/calculate | HR Manager (ẩn với Accountant) |
| ✅ Phê Duyệt & TT | /payroll/approve | Accountant (ẩn với HR Manager) |

### **1.4  Luồng Xử Lý**

**Luồng chính – Tải Dashboard (UC-13)**

| 1 | User đăng nhập thành công → hệ thống redirect về /dashboard |
| :---- | :---- |
| **2** | Hệ thống đọc role từ JWT: HR\_MANAGER hoặc ACCOUNTANT; chuẩn bị filter response theo role |
| **3** | Frontend gọi GET /api/v1/reports/dashboard?month={currentYYYYMM} |
| **4** | Backend thực hiện song song 8 query (Q1–Q8); mỗi query có timeout riêng |
| **4a** | Q1: COUNT(employee WHERE status='ACTIVE') → KPI-1 |
| **4b** | Q2: SUM(payroll.total\_salary) tháng hiện tại → KPI-2 |
| **4c** | Q3: SUM(attendance.ot\_hours) tháng hiện tại → KPI-3 |
| **4d** | Q4: COUNT(payroll WHERE status='UNPAID') → KPI-4 |
| **4e** | Q5: SUM(total\_salary) GROUP BY month LIMIT 6 → Chart 1 xu hướng |
| **4f** | Q6: SUM(total\_salary) GROUP BY dept → Chart 2 phân bổ |
| **4g** | Q7: SUM(ot\_hours) GROUP BY dept → Bar chart OT |
| **4h** | Q8: Aggregate attendance \+ payroll GROUP BY dept → Vùng 4 bảng trạng thái |
| **5** | Backend kiểm tra điều kiện alert: HĐ sắp hết hạn, NV chưa CC, payroll UNPAID/missing |
| **6** | Backend trả về JSON response; frontend render skeleton loading cho từng vùng |
| **7** | Frontend render lần lượt: Vùng 1 (Alert) → Vùng 2 (KPI) → Vùng 3 (Charts) → Vùng 4 (Bảng) → Vùng 5 (Quick Links) |
| **8** | Tất cả vùng hiển thị dữ liệu thật; spinner ẩn; Dashboard sẵn sàng sử dụng |

**Luồng thay thế – A1: Click vào biểu đồ phân bổ phòng ban (UC-13 A1)**

| 1 | User click vào 1 slice của Chart 2 – Phân bổ lương theo phòng ban |
| :---- | :---- |
| **2** | Hệ thống xác định deptId tương ứng với slice được click |
| **3** | Navigate → /reports/payroll?dept={deptId}\&month={currentMonth}; load trang báo cáo chi tiết đã filter theo phòng ban đó |

**Luồng thay thế – A2: User đổi tháng xem**

| 1 | User chọn tháng khác từ month-selector dropdown trên topbar (VD: tháng 02 → tháng 01\) |
| :---- | :---- |
| **2** | Frontend gọi lại GET /api/v1/reports/dashboard?month={selectedMonth} |
| **3** | Vùng 1–4 reload dữ liệu theo tháng mới; Vùng 5 (Quick Links) giữ nguyên không reload |

**Luồng lỗi**

| E1 | Một query đơn lẻ timeout (\> 1000ms) → chỉ vùng đó hiển thị skeleton/empty state; các vùng khác render bình thường; không crash toàn màn hình (BR-DSH-08) |
| :---- | :---- |
| **E2** | Lỗi kết nối API (network error) → hiển thị toast đỏ: 'Không thể tải dữ liệu Dashboard. Vui lòng thử lại.' \+ nút \[Retry\] |
| **E3** | Token hết hạn hoặc chưa đăng nhập → Backend trả 401; hệ thống redirect về trang đăng nhập |
| **E4** | Tháng hiện tại không có dữ liệu payroll/attendance → KPI-2, KPI-3, KPI-4 hiển thị '—'; Chart 2 \+ Bar chart empty state; Vùng 4 cột lương \= '—' |

### **1.5  Business Rules**

| Mã Quy Tắc | Nội Dung |
| :---- | :---- |
| **BR-DSH-01** | Dashboard hoàn toàn read-only – không ghi bất kỳ dữ liệu nào vào DB |
| **BR-DSH-02** | Dữ liệu mặc định theo tháng hiện tại; người dùng có thể chọn tháng khác qua month-selector trên topbar |
| **BR-DSH-03** | Alert Banner chỉ render các cảnh báo thỏa điều kiện; không render banner rỗng hay placeholder |
| **BR-DSH-04** | Alert 'NV chưa CC', 'Chưa tính lương' và Quick Link 'Import CC', 'Hợp đồng', 'Tính Lương' chỉ hiển thị với HR Manager; backend guard 403 nếu Accountant gọi API tương ứng trực tiếp |
| **BR-DSH-05** | Alert 'Bảng lương chờ duyệt' và Quick Link 'Phê duyệt' chỉ hiển thị với Accountant; KPI-4 có thêm nút \[✅ Duyệt ngay\] xanh lá nổi bật |
| **BR-DSH-06** | Cột 'Đã CC' và 'Chưa CC' trong Vùng 4 ẩn với Accountant; chấm công thuộc quyền HR Manager (FR-ATT-001/002) |
| **BR-DSH-07** | Chart 2 (phân bổ phòng ban) hiển thị empty state nếu không có payroll record trong tháng đang xem; không tự động lấy data tháng khác thay thế |
| **BR-DSH-08** | Nếu 1 query fail hoặc timeout, chỉ vùng đó hiển thị empty state; các vùng còn lại không bị ảnh hưởng; toàn trang không crash |

### **1.6  Test Cases**

| \# | Điều Kiện | Kết Quả Mong Đợi |
| :---- | :---- | :---- |
| **1** | HR Manager đăng nhập; T03/2026: 42 NV active, 3 NV chưa CC, 2 HĐ sắp hết hạn, payroll UNPAID | Alert Banner 2 dòng (HĐ \+ NV chưa CC); 4 KPI hiển thị đúng; Quick Link 'Phê duyệt' KHÔNG hiển thị với HR Manager |
| **2** | Accountant đăng nhập; T03/2026 có 8 payroll UNPAID | Alert 'Bảng lương chờ duyệt' xanh lá hiển thị; KPI-4 có nút \[✅ Duyệt ngay\]; Quick Link 'Import CC' và 'Hợp đồng' bị ẩn; cột 'Đã CC'/'Chưa CC' bị ẩn trong Vùng 4 |
| **3** | HR Manager click KPI-1 (42 NV Active) | Navigate → /employees |
| **4** | HR Manager click KPI-2 (Quỹ lương 203.5M) | Navigate → /payroll/calculate?month=2026-03 |
| **5** | HR Manager click KPI-4 (8 UNPAID) | Navigate → /payroll/approve?month=2026-03 |
| **6** | Click slice 'Kỹ thuật' trên Chart 2 Phân bổ | Navigate → /reports/payroll?dept=dept\_kt\&month=2026-03; trang báo cáo đã filter đúng phòng ban Kỹ thuật |
| **7** | Tháng 04/2026 chưa có payroll record | KPI-2, KPI-4 hiển thị '—' \+ text đỏ 'Chưa tính lương'; Chart 2 empty state; Bảng trạng thái cột lương \= '—'; Alert 'Chưa tính lương' xuất hiện với HR Manager |
| **8** | Tất cả 42 NV đã có attendance T03/2026 | Alert 'NV chưa CC' không xuất hiện; Bảng Vùng 4 cột 'Chưa CC' \= 0 với badge xanh lá |
| **9** | Query Chart 1 (xu hướng lương) timeout \> 1000ms | Chart 1 hiển thị skeleton animation; KPI cards, Chart 2, Bảng trạng thái, Quick Links vẫn render bình thường (BR-DSH-08) |
| **10** | Accountant gọi trực tiếp GET /api/v1/attendance/import (bypass UI) | Backend trả HTTP 403 Forbidden; không trả dữ liệu chấm công |

## **3.8.2  DATABASE MAPPING & API ENDPOINTS**

### **DB – Các Bảng Nguồn**

| Bảng DB | Module Nguồn | Trường Sử Dụng | Mục Đích Trong Dashboard |
| :---- | :---- | :---- | :---- |
| employee | Module 3.3 | id, status, dept\_id, hire\_date | KPI-1; Vùng 4 số NV; Alert NV chưa CC |
| department | Module 3.4 | id, name, status | Label phòng ban trong Chart 2, Bar chart, Vùng 4 |
| contract | Module 3.3 | id, emp\_id, end\_date, status | Alert: HĐ sắp hết hạn (end\_date trong 30 ngày tới) |
| attendance | Module 3.6 | emp\_id, attendance\_date, ot\_hours, is\_working\_day | KPI-3; Vùng 4 Đã CC/Chưa CC; Bar chart OT; Alert CC |
| payroll | Module 3.7 | emp\_id, month\_num, year\_num, total\_salary, ot\_salary, status | KPI-2/4; Chart 1 trend; Chart 2 phòng ban; Alert UNPAID |
| salary\_payment | Module 3.7 | payroll\_id, payment\_date, approved\_by | Xác nhận PAID để hiển thị badge trong Vùng 4 |

### **API Endpoints**

| Method | Endpoint | Role | Mô Tả |
| :---- | :---- | :---- | :---- |
| GET |   /api/v1/reports/dashboard | HR\_MANAGER, ACCOUNTANT | Lấy toàn bộ dữ liệu dashboard; params: month (YYYY-MM, default tháng hiện tại) |
| POST |  /api/v1/reports/salary | HR\_MANAGER, ACCOUNTANT | Báo cáo chi tiết theo phòng ban; dùng khi click Chart 2 drill-down (UC-13 A1) |
| GET |   /api/v1/reports/dashboard/alerts | HR\_MANAGER, ACCOUNTANT | Refresh riêng phần Alert mà không reload toàn trang |

### **Response Schema – GET /api/v1/reports/dashboard**

| Field | Type | Mô Tả |
| :---- | :---- | :---- |
| kpi.employeeActive | Integer | COUNT(employee WHERE status='ACTIVE') |
| kpi.payrollFund | Decimal | SUM(payroll.total\_salary) tháng hiện tại; null nếu chưa tính lương |
| kpi.totalOT | Decimal | SUM(attendance.ot\_hours) tháng hiện tại; null nếu chưa có chấm công |
| kpi.unpaidCount | Integer | COUNT(payroll WHERE status='UNPAID') tháng hiện tại |
| alerts | Array | \[ { type, message, severity, navigateTo } \] – chỉ chứa alerts thỏa điều kiện trigger |
| trendChart | Array | \[ { monthYear: 'YYYY-MM', totalFund: Decimal } \] – 6 phần tử gần nhất |
| deptPieChart | Array | \[ { deptId, deptName, totalFund, percentage } \] |
| deptOTBarChart | Array | \[ { deptId, deptName, totalOTHours } \] |
| deptStatusTable | Array | \[ { deptName, totalEmp, hasAttendance, noAttendance, totalOT, payrollStatus } \] |
| currentMonth | String | Tháng đang hiển thị – YYYY-MM |
| generatedAt | Timestamp | Thời điểm query; client hiển thị 'Cập nhật lúc HH:mm' |

*— Hết tài liệu SRS Module 3.8: Dashboard Tổng Hợp —*
