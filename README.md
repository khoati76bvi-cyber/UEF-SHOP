# UEF SHOP — Online Clothing Store Demo

Bản demo website phục vụ báo cáo cuối kỳ môn Công nghệ phần mềm.

## Chạy trên máy

Nhấp đúp `START-UEF-SHOP.cmd`. Hệ thống sẽ khởi động máy chủ cục bộ và mở thẳng trang quản trị. Nếu máy chủ đã chạy, trình khởi động sẽ dùng lại máy chủ hiện tại thay vì tạo thêm tiến trình trùng cổng.

- Cửa hàng: `http://127.0.0.1:4173/#/shop`
- Quản trị riêng: `http://127.0.0.1:4173/admin.html`
- Dừng website: đóng cửa sổ máy chủ hoặc nhấn `Ctrl+C`.

## Tài khoản demo

- Khách hàng: `user@demo.vn` / `demo123`
- Quản trị viên: `admin@demo.vn` / `admin123`

## Chức năng chính

- Tìm kiếm, lọc, sắp xếp và xem chi tiết sản phẩm.
- Giỏ hàng, cập nhật số lượng và checkout nhiều bước.
- Đăng nhập, hồ sơ, sổ địa chỉ, lịch sử và theo dõi đơn hàng.
- Dashboard quản trị, quản lý sản phẩm, đơn hàng, người dùng và báo cáo.
- UEF SHOP CMS là giao diện quản trị riêng, tách hoàn toàn khỏi trang mua hàng.
- Chỉnh thương hiệu, màu sắc, thanh menu và CSS tùy chỉnh, có xem trước desktop/mobile.
- Chỉnh toàn bộ nội dung: thông báo, hero, banner, chữ chạy, quyền lợi và chân trang.
- Thêm, sửa, ẩn hoặc xóa sản phẩm; quản lý ảnh, giá, tồn kho, size và mô tả.
- Quản lý trạng thái/chi tiết đơn hàng và hồ sơ người dùng.
- Thư viện ảnh cho phép tải lên, sao chép đường dẫn và xóa ảnh.
- Trung tâm dữ liệu hỗ trợ sao lưu, khôi phục và chỉnh trực tiếp toàn bộ JSON website.

## Vị trí dữ liệu

- Dữ liệu chính: `data/store-data.json`
- Ảnh tải lên: `dist/uploads`
- Giao diện website: `dist/index.html`, `dist/styles.css`, `dist/app.js`

Không mở trực tiếp `dist/index.html` nếu cần chỉnh sửa và lưu dữ liệu. Hãy dùng `START-UEF-SHOP.cmd` để API lưu tệp hoạt động đầy đủ.
