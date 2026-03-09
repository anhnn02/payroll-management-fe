1. # **MODULE QUẢN LÝ PHÒNG BAN**

   1. ##  **MÀN HÌNH DANH SÁCH PHÒNG BAN**

**Mục đích:** Cung cấp chức năng quản lý phòng ban bao gồm:

* Danh sách phòng ban
* Tìm kiếm phòng ban
* Thêm mới phòng ban
* Chỉnh sửa phòng ban
* Xóa phòng ban
  1. **Danh sách phòng ban:**
- **Thông tin hiển thị trên danh sách**
* **STT:** Số thứ tự tự động tăng theo số lượng bản ghi trên danh sách.
* **Mã PB:** Hiển thị dept\_code (In hoa, Bold).
* *Mô tả: Định danh duy nhất để truy vấn nhanh.*
* **Tên phòng ban:** Hiển thị dept\_name.
* *Mô tả: Nhận diện thương hiệu đơn vị.*
* **Phòng ban cha:** Hiển thị tên phòng ban cấp trên.
* *Mô tả: Xây dựng sơ đồ phân cấp (Hierarchy).*
* **Số lượng NV:** Tổng số nhân viên đang Active.
* *Mô tả: Đánh giá quy mô đơn vị.*
* **Trạng thái:** Hiển thị dưới dạng Tag.
* Mô tả: Hiển thị trạng thái cuả phòng ban.
* Xanh – green: Đang hoạt động
* Xám: Ngừng hoạt động
* **Thao tác:**

  * **\[Sửa\] (Icon bút chì):** Cho phép người dùng chỉnh sửa thông tin phòng ban.

* **Luồng xử lý:** Tại mỗi dòng, người dùng click vào button \-\> Hiển thị Page chỉnh sửa thông tin phòng ban, hiển thị thông tin phòng ban lên form chỉnh sửa.

  * **\[Xóa\] (Icon thùng rác):** Cho phép người dùng xóa thông tin phòng ban.

* **Luồng xử lý:** Tại mỗi dòng, người dùng click vào button \-\> Thực hiện hiển thị Page yêu cầu người dùng confirm yêu cầu xóa như sau:
* **Nội dung:** Bạn có chắc muốn xóa phòng ban \+ \[Tên phòng ban\]
* **Button hủy:** Người dùng click vào button \-\> Hệ thống thực hiện hủy thao tác xóa dữ liệu.
* **Button Xác nhận:** Người dùng click vào button \-\> Hệ thống thực hiện xóa thông tin phòng ban người dùng đã chọn.
* **Phân trang:** Hiển thị phân trang

  * Mô tả: Số lượng bản ghi trên một trang mặc định là 50 dòng. Cho phép người dùng thay đổi số lượng bảng ghi trên một trang.

* Hiển thị các trang cho phép người dùng thực hiện chuyển trang.
* Thêm thao tác scroll cho phép người dùng cuộn danh sách từ trên xuống và dưới lên.
* **Dữ liệu đầu vào của danh sách:**

  * Mặc định: Hiển thị danh sách tất cả phòng ban có trạng thái là **\[Đang hoạt động\].**

- **Chức năng tìm kiếm:**
* **Tìm kiếm & Lọc:**

  * **Search Bar:** Cung cấp chức năng tìm kiếm phòng ban cho người dùng

* Placeholder: Nhập vào mã phòng ban, tên phòng ban để tìm kiếm.
* Cho phép người dùng tìm kiếm theo mã phòng ban, tên phòng ban.
* Tìm kiếm gần đúng theo ký tự người dùng nhập vào.
* Trường hợp có dữ liệu: Hiển thị danh sách phòng ban theo bộ lọc
* Trường hợp không có dữ liệu: Hiển thị danh sách trống và textinline: “Không có dữ liệu phòng ban’

  * **Lọc theo trạng thái:** Cung cấp chức năng lọc dữ liệu trên danh sách phòng ban theo trạng thái của phòng ban.

* Hiển thị dưới dạng dropdownlist:
* Các option trong combobox bao gồm:
* Tất cả: Khi người dùng chọn option này \-\> Hiển thị toàn bộ danh sách phòng ban bao gồm trạng thái: Không hoạt động và hoạt động.
* Đang hoạt động: Khi người dùng chọn option này \-\> hiển thị danh sách phòng ban bao có trạng thái là \[Đang hoạt động\].
* Ngừng hoạt động: Khi người dùng chọn option này \-\> hiển thị danh sách phòng ban bao có trạng thái là \[Ngừng hoạt động\].
* Trường hợp có dữ liệu: Hiển thị danh sách phòng ban theo bộ lọc
* Trường hợp không có dữ liệu: Hiển thị danh sách trống và textinline: “Không có dữ liệu phòng ban’.
- **Button thao tác:**
* **\[Thêm mới phòng ban\]:** Hiển thị button thêm mới phòng ban nằm phía trên danh sách phòng ban.
* **Luồng xử lý:** Người dùng thực hiện click vào button \-\> Mở giao diện Page thêm mới phòng ban. (Xem chi tiết tại mục 1.2 Thêm mới phòng ban).
  2. **Thêm mới phòng ban.**

**Mục đích:** Cho phép người dùng tạo một đơn phòng ban mới vào hệ thống.

- **Mô tả chi tiết các thành phần:**

| Trường thông tin | Loại | Quy chuẩn nhập liệu | Mô tả& Ràng buộc |
| :---- | :---- | :---- | :---- |
| **Mã phòng ban** | Textbox | Chữ in hoa, không dấu, không khoảng trắng. Max 10 ký tự. | **Bắt buộc.** Duy nhất (Unique). Dùng làm khóa ngoại trong bảng Employees. |
| **Tên phòng ban** | Textbox | Nhập văn bản tự do. Max 100 ký tự. | **Bắt buộc.** Tên hiển thị trên các báo cáo lương. |
| **Phòng ban cha** | Combobox | Searchable Select (Lấy từ list Departments hiện có). | Không bắt buộc. Để trống nếu là cấp cao nhất. |
| **Mô tả** | Textarea | Nhập tối đa 500 ký tự. | Diễn giải chức năng nhiệm vụ của phòng. |
| **Trạng thái phòng ban** | Radiobutton | Hiển thị 2 trạng thái:  \[Đang hoạt động\] ,\[Ngừng hoạt động\] | Mặc định:  Chọn trạng thái: \[Đang hoạt động\],  Disable trạng thái\[Ngừng hoạt động\] |
| **Button \[Lưu\]** | Button | Enable | Cho phép người dùng thực hiện lưu thông tin phòng ban. |
| **Button \[Đóng\]** | Button | Enable | Cho phép người dùng thực hiện đóng giao diện thêm mới phòng ban. |

**\- Luồng xử lý**

* **Đầu vào:** Người dùng nhập liệu vào Form \-\> Nhấn **\[Lưu\]**.
* **Validate:** Hệ thống kiểm tra các trường Bắt buộc.
* Kiểm tra Mã phòng ban đã tồn tại trong DB chưa (API GET /check-code).
* **Luồng xử lý:** Gọi API POST /api/departments \-\> Backend thực hiện Insert vào bảng departments (PostgreSQL 18).
* **Đầu ra:**
* Thành công: Đóng Modal, Flashmessage: "Thêm thành công" \-\> Loading form nhập. Ghi log vào bảng audit\_logs
* Thất bại: Hiển thị lỗi đỏ dưới chân mỗi trường (VD: "Mã này đã tồn tại").
  3. **Chỉnh sửa phòng ban**

**Mục đích:** Cho phép người dùng thực hiện cập nhật thông tin phòng ban.

- **Giao diện:**
- **Form:** Tương tự form Thêm mới nhưng dữ liệu được đổ sẵn (Pre-filled), dữ liệu được lấy từ dữ liệu phòng ban người dùng đã chọn trên danh sách.
* Danh sách nhân viên thuộc phòng ban:
* **Dữ liệu đầu vào:** Danh sách các nhân viên có phòng ban có giá trị mã phòng ban \= mã phòng ban người dùng đã chọn.
* **Thông tin hiển thị trên danh sách:**
* STT: Số thứ tự dòng dữ liệu
* Mã nhân viên: lấy từ thông tin nhân viên.
* Tên nhân viên: :Lấy từ thông tin nhân viên.
* Vị trí làm việc: Lấy thông tin vị trí làm việc của nhân viên, lấy trường thông tin \[tên vị trí làm việc\].
* Trạng thái: Hiển thị trạng thái làm việc của nhân viên.
* **Thao tác:**

  * **\[Xóa\] (Icon thùng rác):** Cho phép người dùng xóa thông tin nhân viên trong phòng ban.

* **Luồng xử lý:** Tại mỗi dòng, người dùng click vào button \-\> Thực hiện hiển thị popup yêu cầu người dùng confirm yêu cầu xóa như sau:
* **Nội dung:** Bạn có chắc muốn xóa nhân viên khỏi phòng ban ? \+ \[Mã nhân viên\] \+ \[Tên nhân viên\].
* **Button hủy:** Người dùng click vào button \-\> Hệ thống thực hiện hủy thao tác xóa dữ liệu.
* **Button Xác nhận:** Người dùng click vào button \-\> Hệ thống thực hiện xóa tin nhân viên đã chọn ra khỏi phòng ban, đồng thời cập nhật lại thông tin phòng ban của nhân viên.
* **Chức năng:** Thêm mới nhân viên.
* Người dùng thực hiện click vào button \-\> hiển thị Page danh sách nhân viên chưa có phòng ban \-\> thực hiện chọn nhân viên \-\> Click button xác nhận \-\> Thực hiện gán phòng ban cho nhân viên, thực hiện đóng Page danh sách nhân viên, reload lại danh sách Nhân viên trong phòng ban.
- **Quy chuẩn:**
* **Mã phòng ban:** Chuyển sang trạng thái Read-only (Disabled).
* *Mô tả: Tránh phá vỡ liên kết dữ liệu với các bảng đã tồn tại.*

  * **Trạng thái:** Cho phép người dùng thực hiện thay đổi thông tin trạng thái của phòng ban.

- **Luồng xử lý**
* **Đầu vào:** Chọn bản ghi \-\> Chỉnh sửa Tên hoặc Phòng ban cha \-\> Nhấn \[Cập nhật\].
* **Validate:** Kiểm tra đệ quy (Circular Reference): Phòng ban A không được chọn chính nó hoặc các phòng ban con của nó làm "Cha".
* **Luồng xử lý**: Gọi API Chỉnh sửa phòng ban \-\> truyền vào Mã phòng ban và thông tin trên  form.
* **Đầu ra:** Cập nhật DB \+ Ghi log vào bảng audit\_logs.
  4.  **Xóa phòng ban**

**Mục đích:** Xóa phòng ban khỏi danh sách.

- **Luồng xử lý & Ràng buộc**
* **Thao tác**: Nhấn nút \[Xóa\].
* Kiểm tra ràng buộc (Constraint Check):
* Hệ thống đếm số lượng nhân viên trong bảng employees có dept\_id bằng ID hiện tại
* Nếu Số NV \> 0: Chặn xóa. Hiển thị thông báo: "Phòng ban này đang có \[n\] nhân viên. Không thể xóa."
* Nếu Số NV \= 0: Kiểm tra xem có phòng ban con không. Nếu có \-\> Chặn xóa.
* **Luồng xử lý**: Nếu thỏa mãn các điều kiện sạch \-\> Hiển thị Popup xác nhận: "Bạn có chắc chắn muốn xóa phòng ban ?”.
* Click button Xác nhận: Thực hiện chuyển trạng thái phòng ban thành \[Đã xóa\].
* Click button Hủy: Thực hiện hủy thao tác xóa.
* **Đầu ra**: Thực hiện hiển thị Flashmessage: “Xóa thành công phòng ban \+\[Tên phòng ban\].
  5. **Chi tiết phòng ban**

**Mục đích:** Cho phép người dùng thực hiện xem thông tin chi tiết của phòng ban.

- **Giao diện:**
* Form thông tin: Tương tự chỉnh sửa thông tin phòng ban nhưng disable toàn bộ thông tin.
- **Quy chuẩn:**
* **Mã phòng ban:** Chuyển sang trạng thái Read-only (Disabled).
* *Mô tả: Tránh phá vỡ liên kết dữ liệu với các bảng đã tồn tại.*

  * **Trạng thái:** Cho phép người dùng thực hiện thay đổi thông tin trạng thái của phòng ban.

- **Luồng xử lý**
* **Đầu vào:** Chọn bản ghi \-\> Hiển thị thông tin chi tiết bản ghi
* **Luồng xử lý**: Gọi API thông tin phòng ban \-\> truyền vào Mã phòng ban.
  **Đầu ra:** Thông tin chi tiết của phòng ban.
2. **MODULE QUẢN LÝ VỊ TRÍ LÀM VIỆc**
   1. **Màn hình danh sách vị trí.**

**Mục đích:** Quản lý danh mục chức danh và khung lương cơ bản.

1. **Giao diện hiển thị**
- **Các trường thông tin:**
* **Mã vị trí:** Hiển thị thông tin mã vị trí.
* **Tên vị trí:** Hiển thị tên vị trí làm việc.
* **Khung lương:** Hiển thị \[Min\] \- \[Max\] VNĐ.
* *Mô tả: Hiển thị thông tin lương đã cấu hình cho vị trí.*
* **Mô tả:** Hiển thị trường thông tin mô tả.
* **Thao tác:**

  * **\[Sửa\] (Icon bút chì):** Cho phép người dùng chỉnh sửa thông tin vị trí .

* **Luồng xử lý:** Tại mỗi dòng, người dùng click vào button \-\> Hiển thị Page chỉnh sửa thông tin vị trí, hiển thị thông tin vị trí lên form chỉnh sửa.

  * **\[Xóa\] (Icon thùng rác):** Cho phép người dùng xóa thông tin vị trí.

* **Luồng xử lý:** Tại mỗi dòng, người dùng click vào button \-\> Thực hiện hiển thị popup yêu cầu người dùng confirm yêu cầu xóa như sau:
* **Nội dung:** Bạn có chắc muốn xóa vị trí+ \[Tên vị trí\]
* **Button hủy:** Người dùng click vào button \-\> Hệ thống thực hiện hủy thao tác xóa dữ liệu.
* **Button Xác nhận:** Người dùng click vào button \-\> Hệ thống thực hiện xóa thông tin vị trí người dùng đã chọn.
* **Phân trang:** Hiển thị phân trang

  * Mô tả: Số lượng bản ghi trên một trang mặc định là 50 dòng. Cho phép người dùng thay đổi số lượng bảng ghi trên một trang.

* Hiển thị các trang cho phép người dùng thực hiện chuyển trang.
* Thêm thao tác scroll cho phép người dùng cuộn danh sách từ trên xuống và dưới lên.
* **Dữ liệu đầu vào của danh sách:**

  * Mặc định: Hiển thị danh sách tất cả vị trí có trạng thái là **\[Đang hoạt động\].**

- **Chức năng tìm kiếm:**
* **Tìm kiếm & Lọc:**

  * **Search Bar:** Cung cấp chức năng tìm kiếm vị trí cho người dùng

* Placeholder: Nhập vào mã vị trí, tên vị trí để tìm kiếm.
* Cho phép người dùng tìm kiếm theo mã vị trí, tên vị trí.
* Tìm kiếm gần đúng theo ký tự người dùng nhập vào.
* Trường hợp có dữ liệu: Hiển thị danh sách vị trí theo bộ lọc
* Trường hợp không có dữ liệu: Hiển thị danh sách trống và textinline: “Không có dữ liệu vị trí

  * **Lọc theo trạng thái:** Cung cấp chức năng lọc dữ liệu trên danh sách vị trí theo trạng thái của vị trí.

* Hiển thị dưới dạng dropdownlist:
* Các option trong combobox bao gồm:
* Tất cả: Khi người dùng chọn option này \-\> Hiển thị toàn bộ danh sách vị trí bao gồm trạng thái: Không hoạt động và hoạt động.
* Đang hoạt động: Khi người dùng chọn option này \-\> hiển thị danh sách vị trí bao có trạng thái là \[Đang hoạt động\].
* Ngừng hoạt động: Khi người dùng chọn option này \-\> hiển thị danh sách vị trí bao có trạng thái là \[Ngừng hoạt động\].
* Trường hợp có dữ liệu: Hiển thị danh sách vị trí theo bộ lọc
* Trường hợp không có dữ liệu: Hiển thị danh sách trống và textinline: “Không có dữ liệu vị trí”.
- **Button thao tác:**
* **\[Thêm mới vị trí\]:** Hiển thị button thêm mới vị trí nằm phía trên danh sách vị trí.
* **Luồng xử lý:** Người dùng thực hiện click vào button \-\> Mở giao diện Page thêm mới vị trí. (Xem chi tiết tại mục 2.1.1. Thêm mới vị trí).
  2. **Thêm mới vị trí làm việc**
- **Chi tiết Form (Modal UI)**

| Trường thông tin | Loại | Quy chuẩn nhập liệu | Sở cứ & Ràng buộc |
| :---- | :---- | :---- | :---- |
| **Tên vị trí** | Textbox | Nhập văn bản. Max 100 ký tự. | **Bắt buộc.** Duy nhất (Unique). |
| **Lương tối thiểu (Min)** | Number | Input số, tự động format dấu ,. | **Bắt buộc.** Không âm. |
| **Lương tối đa (Max)** | Number | Input số, tự động format dấu ,. | **Bắt buộc.** Phải lớn hơn Lương tối thiểu ($Max \\ Min$). |
| **Mô tả công việc** | Textarea | Tối đa 1000 ký tự. | Dùng để hiển thị trong thông tin tuyển dụng/chi tiết hồ sơ. |
| **Trạng thái vị trí** | Radiobutton | Hiển thị 2 trạng thái:  \[Đang hoạt động\] ,\[Ngừng hoạt động\] | Mặc định:  Chọn trạng thái: \[Đang hoạt động\],  Disable trạng thái\[Ngừng hoạt động\] |
| **Button \[Lưu\]** | Button | Enable | Cho phép người dùng thực hiện lưu thông tin vị trí. |
| **Button \[Đóng\]** | Button | Enable | Cho phép người dùng thực hiện đóng giao diện thêm mới vị trí. |


- **Luồng xử lý**
* **Đầu vào:** Người dùng nhập liệu vào Form \-\> Nhấn **\[Lưu\]**.
* **Validate:** Hệ thống kiểm tra các trường Bắt buộc.
* Kiểm tra Mã vị trí đã tồn tại trong DB chưa (API GET /check-code).
* **Luồng xử lý:** Gọi API \-\> Backend thực hiện Insert vào bảng vị trí làm việc.
* **Đầu ra:**
* Thành công: Đóng Modal, Flashmessage: "Thêm thành công" \-\> Loading form nhập. Ghi log vào bảng audit\_logs
* Thất bại: Hiển thị lỗi đỏ dưới chân mỗi trường (VD: "Mã này đã tồn tại").

**2.1.3 Chỉnh sửa thông tin vị trí làm việc**

**\- 	Mục đích:** Cho phép người dùng thay đổi mức lương cho vị trí.

- **Giao diện:** Tương tự Form Thêm mới nhưng dữ liệu được đổ sẵn (Pre-filled), dữ liệu được lấy từ dữ liệu vị trí người dùng đã chọn trên danh sách.
* Danh sách nhân viên thuộc vị trí làm việc:
* **Dữ liệu đầu vào:** Danh sách các nhân viên có giá trị mã vị trí \= mã mã vị trí người dùng đã chọn.
* **Thông tin hiển thị trên danh sách:**
* STT: Số thứ tự dòng dữ liệu
* Mã nhân viên: lấy từ thông tin nhân viên.
* Tên nhân viên: :Lấy từ thông tin nhân viên.
* Vị trí làm việc: Lấy thông tin vị trí làm việc của nhân viên, lấy trường thông tin \[tên vị trí làm việc\].
* Trạng thái: Hiển thị trạng thái làm việc của nhân viên.
* **Thao tác:**

  * **\[Xóa\] (Icon thùng rác):** Cho phép người dùng xóa thông tin nhân viên trong vị trí.

* **Luồng xử lý:** Tại mỗi dòng, người dùng click vào button \-\> Thực hiện hiển thị popup yêu cầu người dùng confirm yêu cầu xóa như sau:
* **Nội dung:** Bạn có chắc muốn xóa nhân viên khỏi vị trí này? \+ \[Mã nhân viên\] \+ \[Tên nhân viên\].
* **Button hủy:** Người dùng click vào button \-\> Hệ thống thực hiện hủy thao tác xóa dữ liệu.
* **Button Xác nhận:** Người dùng click vào button \-\> Hệ thống thực hiện xóa tin nhân viên đã chọn ra khỏi vị trí làm việc, đồng thời cập nhật lại thông tin vị trí làm việc của nhân viên.
* **Chức năng:** Thêm mới nhân viên.
* Người dùng thực hiện click vào button \-\> hiển thị Page danh sách nhân viên chưa có vị trí làm việc \-\> thực hiện chọn nhân viên \-\> Click button xác nhận \-\> Thực hiện gán vị trí làm việc cho nhân viên, thực hiện đóng Page danh sách nhân viên, reload lại danh sách Nhân viên trong danh sách nhân viên thuộc vị trí làm việc.
- **Quy chuẩn:**
* **Mã vị trí:** Chuyển sang trạng thái Read-only (Disabled).
* *Mô tả: Tránh phá vỡ liên kết dữ liệu với các bảng đã tồn tại.*

  * **Trạng thái:** Cho phép người dùng thực hiện thay đổi thông tin trạng thái của vị trí.

- **Luồng xử lý**
* **Đầu vào:** Chọn bản ghi \-\> Chỉnh sửa thông tin bản ghi \-\> Nhấn \[Cập nhật\].
* **Validate:** Kiểm tra thông tin các trường bắt bộc nhập đã có dữ liệu hay chưa \-\> nếu chưa có dữ liệu \-\> Hiển thị lỗi đỏ dưới chân mỗi trường (VD: "Không được bỏ trống trường thông tin này").
* **Luồng xử lý**: Gọi API Chỉnh sửa vị trí-\> truyền vào mã vị trí và thông tin trên  form.

  * Sau khi lưu, hệ thống thực hiện quét danh sách nhân viên đang thuộc vị trí này. Nếu lương thực tế của nhân viên nằm ngoài khung mới \-\> Backend đẩy một thông báo cảnh báo (Alert) vào màn hình quản lý nhân sự để HR Manager nắm bắt và điều chỉnh hợp đồng nếu cần.

* **Đầu ra:** Cập nhật DB \+ Ghi log vào bảng audit\_logs.
  4. **Xóa thông tin vị trí**
- **Luồng xử lý (Strict Logic)**
- **Mục đích:** Xóa vị trí khỏi danh sách vị trí.
- **Luồng xử lý & Ràng buộc**
* **Thao tác**: Nhấn nút \[Xóa\].
* Kiểm tra ràng buộc (Constraint Check):
* Hệ thống đếm số lượng nhân viên trong bảng employees có dept\_id bằng ID hiện tại
* Nếu Số NV \> 0: Chặn xóa. Hiển thị thông báo: "Vị trí này đang có \[n\] nhân viên. Không thể xóa."
* Nếu Số NV \= 0: Kiểm tra xem có phòng ban con không. Nếu có \-\> Chặn xóa.
* **Luồng xử lý**: Nếu thỏa mãn các điều kiện sạch \-\> Hiển thị Popup xác nhận: "Bạn có chắc chắn muốn xóa vị trí này?”.
* Click button Xác nhận: Thực hiện chuyển trạng thái vị trí thành \[Đã xóa\].
* Click button Hủy: Thực hiện hủy thao tác xóa.
* **Đầu ra**: Thực hiện hiển thị Flashmessage: “Xóa thành công vị trí \+\[Tên vị trí\].
  5. **Chi tiết vị trí làm việc**

**Mục đích:** Cho phép người dùng thực hiện cập nhật thông tin vị trí làm việc.

- **Giao diện:**
* **Form thông tin**: Tương tự chỉnh sửa thông tin vị trí làm việc nhưng disable toàn bộ thông tin.
- **Quy chuẩn:**
* **Mã vị trí:** Chuyển sang trạng thái Read-only (Disabled).
* *Mô tả: Tránh phá vỡ liên kết dữ liệu với các bảng đã tồn tại.*

  * **Trạng thái:** Cho phép người dùng thực hiện thay đổi thông tin trạng thái của vị trí.

- **Luồng xử lý**
* **Đầu vào:** Chọn bản ghi \-\> Hiển thị thông tin chi tiết bản ghi
* **Luồng xử lý**: Gọi API thông tin phòng ban \-\> truyền vào Mã vị trí.
  **Đầu ra:** Thông tin chi tiết của vị trí làm việc


