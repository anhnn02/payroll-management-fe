**PHIẾU YÊU CẦU NGHIỆP VỤ MODULE QUẢN LÝ NHÂN SỰ**

* **Mục đích tài liệu:**    
- Tài liệu này mô tả chi tiết chức năng:  
- Quản lý Nhân viên từ góc nhìn người dùng cuối (HR Manager và Accountant), tập trung vào giao diện người dùng (UI), trải nghiệm sử dụng (UX) và quy trình nghiệp vụ thực tế. Không đi sâu vào kỹ thuật triển khai, chỉ mô tả những gì người dùng thấy, thao tác và kết quả mong đợi.

# **1\. Tổng quan chức năng**

## **1.1 Mục đích nghiệp vụ**

- Chức năng : Quản lý Nhân viên, giúp HR Manager:  
* Tạo hồ sơ nhân viên mới khi tuyển dụng.  
* Xem tổng quan toàn bộ nhân sự công ty.  
* Tìm kiếm và lọc nhanh để kiểm tra phân bổ nhân sự theo phòng ban, vị trí.  
* Cập nhật thông tin nhân viên (thay đổi phòng ban/vị trí khi thuyên chuyển, cập nhật thông tin cá nhân).  
* Vô hiệu hóa nhân viên khi nghỉ việc (không xóa hoàn toàn để giữ lịch sử).  
- Rules:  
* Accountant chỉ được xem danh sách và chi tiết để đối chiếu lương, không được sửa.  
* Chức năng này đảm bảo dữ liệu nhân viên luôn chính xác, nhất quán và dễ tra cứu, hỗ trợ các quy trình sau như chấm công, tính lương, báo cáo nhân sự.

## **1.2. Người dùng chính**

\- **HR Manager:** Toàn quyền tạo, xem, sửa, vô hiệu hóa.

\- **Accountant:** Chỉ xem danh sách và chi tiết (không có nút sửa hoặc vô hiệu hóa).

## **1.3 Lợi ích nghiệp vụ**

\- Giảm thời gian tìm kiếm nhân viên từ vài phút xuống vài giây.

\- Đảm bảo phân công phòng ban/vị trí đúng ngay từ đầu, tránh sai sót khi tính lương theo phòng ban.

\- Dễ dàng kiểm tra tình trạng nhân sự (ai đang làm, ai đã nghỉ).

\- Hỗ trợ báo cáo nhanh (ví dụ: danh sách nhân viên phòng Kinh doanh).

# **2\. Các màn hình chính và mô tả giao diện (UI/UX)**

## **2.1 Màn hình Danh sách Nhân viên**

- Tên màn hình: Danh sách nhân viên    
- Đường dẫn gợi ý: Trang chủ Nhân sự → Danh sách nhân viên


- Mô tả tổng quan giao diện:  
* Trang mở ra là một bảng lớn chiếm phần chính màn hình.  
* Phía trên bảng có thanh tìm kiếm và bộ lọc.  
* Nút "Thêm nhân viên mới" nổi bật màu xanh ở góc phải.  
* Bảng có phân trang ở dưới cùng, dễ cuộn và sắp xếp bằng cách click tiêu đề cột.  
* **Các thành phần giao diện và chức năng:**  
- **Thanh tìm kiếm nhanh:**  
* Người dùng gõ tên, mã nhân viên, email, số điện thoại hoặc số CCCD.  
* Kết quả tự động lọc ngay khi ngừng gõ 1 giây (không cần nhấn Enter).  
* Mục đích: Tìm nhanh khi chỉ nhớ một phần thông tin (ví dụ: gõ "Huy" → hiện tất cả nhân viên có tên chứa "Huy").  
- **Bộ lọc nâng cao (nút "Bộ lọc" mở ra panel bên phải hoặc modal):**  
* Phòng ban: Chọn nhiều phòng ban từ danh sách (hiển thị tên phòng ban có trạng thái đang hoạt động).  
* Vị trí: Chọn nhiều vị trí từ danh sách (Chọn vị trí có trạng thái “Đang hoạt động”).  
* Trạng thái: Đang làm việc / Đã nghỉ việc / Tất cả.  
* Giới tính: Nam / Nữ / Khác / Tất cả.  
* Nút "Áp dụng lọc" và "Xóa lọc".  
* Mục đích: Xem nhân sự theo tổ chức  
- **Nút "Thêm nhân viên mới":**  
* Nút lớn màu xanh, có icon dấu cộng.  
* Click → mở form tạo nhân viên mới.  
* Mục đích: Bắt đầu quy trình tuyển dụng mới.  
- **Nút "Xuất danh sách" (icon Excel):**  
* Xuất bảng hiện tại (sau tìm kiếm/lọc) ra file Excel.  
* Mục đích: In báo cáo hoặc gửi sếp.  
* Dữ liệu: Xuất toàn bộ dữ liệu theo dữ liệu trên giao diện danh sách.  
- Bảng danh sách nhân viên (20 dòng/trang) cho phép cấu hình số lượng hiển thị trên giao diện:  
- **Các cột hiển thị:**  
* STT: Số thứ tự (tự động). Số thứ tự tự động (1, 2, 3...) ở cột đầu.  
* Mã nhân viên: Mã tự động để nhận diện nhanh, chữ đậm.  
* Họ và tên: Tên đầy đủ – thông tin chính để nhận diện người, Text đầy đủ, chữ in hoa đầu từ.  
* Giới tính: Nam/Nữ/Khác – hỗ trợ báo cáo đa dạng giới tính.  
* Ngày sinh: Để kiểm tra tuổi lao động. Format DD/MM/YYYY  
* CCCD/CMND: Số định danh pháp lý. Text số (ẩn 4 chữ số giữa cho Accountant và hiển thị đầy đủ với HR Manager).  
* Email: Email công ty hoặc cá nhân.  
* Số điện thoại: Liên lạc nhanh.  
* Phòng ban: Tên phòng ban hiện tại – xem phân bổ tổ chức.  
* Vị trí: Tên vị trí/chức danh – biết vai trò công việc.  
* Ngày vào làm: Biết thâm niên. Format DD/MM/YYYY.  
* Trạng thái: "Đang làm việc" (xanh) hoặc "Đã nghỉ" (xám).  
* Hành động: 3 icon nhỏ:  
* Mắt:   
  * Xem chi tiết.  
* Bút chì: Sửa (chỉ HR Manager thấy) \-\> Hiển thị form chi tiết.  
* Thùng rác: Vô hiệu hóa (chỉ HR Manager thấy) \-\> hiển thị form chỉnh sửa.  
- **Action Rules:**  
* Click vào tiêu đề cột → sắp xếp tăng/giảm.  
* Click vào dòng → mở chi tiết.  
- **Yêu cầu phi chức năng:**  
* Bảng luôn load nhanh, có loading spinner nếu chậm.  
* Khi không có dữ liệu: Hiển thị thông báo thân thiện "Chưa có nhân viên nào. Hãy thêm mới\!".  
* Thông báo thành công/lỗi hiện ở góc màn hình (toast notification).

**2.2 Màn hình Form Thêm / Sửa Nhân viên**

- **Tên màn hình:** Thêm nhân viên mới / Chỉnh sửa thông tin nhân viên    
- **Cách mở:** Từ nút "Thêm mới" hoặc icon sửa trong danh sách.  
- **Mô tả tổng quan giao diện:**  
* Form đầy đủ các trường, chia thành các nhóm rõ ràng (Thông tin cá nhân, Công việc, Tài khoản, v.v.).  
* Các trường bắt buộc có dấu sao đỏ.  
* Dropdown có ô tìm kiếm bên trong khi danh sách dài.  
* Nút Lưu màu xanh lớn ở dưới cùng.  
* Thiết kế sạch, dễ nhập liệu trên một trang (cuộn dọc nếu giao diện dài hơn kích trước 1080px).  
- Các nhóm trường và mục đích:  
* **Thông tin định danh:**  
* Mã nhân viên: Tự động sinh (không cho sửa khi chỉnh sửa) – để nhận diện duy nhất. Tự sinh bắt đầu bằng “NV”. Mã nhân viên không được trùng.  
* Họ và tên: Nhập đầy đủ – thông tin chính. placeholder "Nguyễn Văn A".  
* Giới tính: Chọn Nam/Nữ/Khác – báo cáo nhân sự. Radio button (Nam/Nữ/Khác)  
* Ngày sinh: Chọn ngày – kiểm tra tuổi ≥18. Date picker lịch, format DD/MM/YYYY.  
* CCCD/CMND: Nhập số – định danh pháp lý. Ô text số, placeholder "Nhập số CCCD/CMND".  
* **Thông tin liên lạc:**  
* Email: Nhập email – liên lạc nội bộ. placeholder "ten@congty.com".  
* Số điện thoại: Nhập số – liên lạc khẩn. Ô text số, placeholder "0123456789".   
* Địa chỉ: Nhập tự do – hồ sơ cá nhân. Ô textarea giới hạn 400 ký tự,  
* **Thông tin công việc:**  
* Phòng ban: Dropdown chọn 1 phòng ban từ danh sách hiện có – phân công đơn vị tổ chức.  
* Vị trí: Dropdown với search box, hiển thị tên vị trí.  
* Ngày vào làm: Chọn ngày – tính thâm niên. Date picker lịch.  
* **Tài khoản hệ thống (chỉ hiện khi thêm mới hoặc sửa):**  
* Username: Nhập tên đăng nhập – để nhân viên sau này tự truy cậpÔ text, placeholder "ten.dangnhap". Kiểm tra trùng. Tên đăng nhập duy nhất.  
* Password: Nhập mật khẩu (chỉ thêm mới và chỉnh sửa) – bảo mật. Ô password (ẩn ký tự/Hiển thị ký tự), chỉ hiển thị khi thêm mới/chỉnh sửa.  
* **Trạng thái và ghi chú:**  
* Trạng thái: Chọn "Đang làm việc" hoặc "Đã nghỉ".  
* Ghi chú: Ô textarea. Giới hạn 400 ký tự.  
- **Các nút ở dưới form:**  
* Lưu: Lưu và quay lại danh sách.  
* Lưu và thêm tiếp (chỉ khi thêm mới): Lưu xong, form làm trống để thêm người mới.  
* Hủy: Quay lại danh sách mà không lưu.  
- **Phi chức năng:**  
* Khi nhập sai (ví dụ: email đã tồn tại): Hiện lỗi đỏ ngay dưới trường \+ không cho lưu.  
* Dropdown phòng ban/vị trí: Tự động load danh sách hiện có, có ô tìm kiếm nếu dài.  
* Thông báo thành công: "Thêm nhân viên thành công\!" và quay lại danh sách (dòng mới hiện lên đầu).

**2.3 Màn hình Chi tiết Nhân viên**

- Tên màn hình: Chi tiết nhân viên    
- Cách mở: Click icon mắt hoặc dòng trong danh sách.  
* **Mô tả giao diện:**  
- Hiển thị tất cả thông tin giống form nhưng chỉ đọc (không chỉnh sửa được).  
- Chia nhóm rõ ràng như form.  
* Nút "Sửa thông tin" (chỉ HR Manager thấy) → mở form sửa.  
* Nút "Vô hiệu hóa" (chỉ HR Manager thấy, nếu đang làm việc) → mở hộp thoại xác nhận.  
- **Mục đích:** Xem đầy đủ hồ sơ

**3\. Quy trình nghiệp vụ chi tiết (Luồng xử lý)**

**3.1 Thêm nhân viên mới**

- Bước 1: HR Manager vào danh sách → click "Thêm nhân viên mới".  
- Bước 2: Form mở ra → nhập thông tin cá nhân, chọn phòng ban và vị trí từ danh sách.  
* Bước 2.1: Chỉ hiển thị phòng ban và vị trí có trạng thái là đang hoạt động.  
- Bước 3: Click "Lưu" → hệ thống kiểm tra lỗi (email trùng, tuổi \<18, v.v.).  
- Bước 4: Thành công → quay lại danh sách, nhân viên mới hiện lên đầu, thông báo "Thêm thành công".

**3.2 Tìm kiếm và lọc danh sách**

- Bước 1: Gõ vào ô tìm kiếm → bảng tự lọc ngay (tìm theo tên, mã, email, số điện thoại).  
- Bước 2: Mở bộ lọc → chọn phòng ban/vị trí → click Áp dụng → bảng chỉ hiện nhân viên phù hợp.  
- Bước 3: Kết hợp tìm kiếm \+ lọc để tìm chính xác hơn.

**3.3 Xem chi tiết và sửa thông tin**

- Bước 1 : Từ danh sách → click icon mắt → xem chi tiết(Hiển thị thông tin chi tiết của đối tượng, không cho chỉnh sửa0.  
- Bước 2: Click "Sửa" → form mở với dữ liệu hiện tại cuả đối tượng đã chọn trên danh sách..  
- Bước 3: Thay đổi (ví dụ: chuyển phòng ban) → Lưu → thông báo thành công, quay lại danh sách cập nhật.

**3.4 Vô hiệu hóa nhân viên (nghỉ việc)**

- Bước 1: Từ danh sách hoặc chi tiết → click icon thùng rác.  
- Bước 2: Hộp thoại xác nhận: "Vô hiệu hóa nhân viên này? Sẽ ngừng tính lương và chấm công."  
- Bước 3: Xác nhận → trạng thái thành "Đã nghỉ", thông báo thành công.

**3.5 Ngoại lệ**

- Email/sdt/CCCD trùng: "Thông tin này đã tồn tại, vui lòng kiểm tra".  
- Chưa chọn phòng ban/vị trí: "Vui lòng chọn phòng ban và vị trí".  
- Không có quyền: Nút sửa/vô hiệu hóa không hiện với Accountant

