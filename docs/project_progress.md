# Bối cảnh Dự án: Hệ thống Quản lý Nhiếp ảnh gia

Tài liệu này tóm tắt quá trình và trạng thái hiện tại của dự án.

## 1. Khởi động dự án & Định nghĩa Yêu cầu:

- **Mục tiêu:** Xây dựng một nền tảng toàn diện để quản lý studio nhiếp ảnh.
- **Yêu cầu chức năng:** Đã thảo luận chi tiết và tinh chỉnh các yêu cầu về:
  - Quản lý lịch trình công việc và điều phối nhân sự ("Thành viên").
  - Quản lý khách hàng và dự án/hợp đồng ("Show") với các trạng thái theo dõi tiến độ.
  - Theo dõi tiến độ công việc (bao gồm các giai đoạn hậu kỳ).
  - Quản lý tài sản (thiết bị studio).
  - Quản lý tài chính: Tính toán doanh thu, chi phí, phân bổ thu nhập theo vai trò (Key, Support, Blend, Retouch, Marketing, Art Lead, PM, Security, Wishlist), tính công nợ, quản lý chi Wishlist, thu ngoài.
  - Quản lý vai trò và phân quyền chi tiết (Admin, Manager, Art Lead, Vai trò tham gia Show...).
  - Đánh giá thành viên sau mỗi Show.
  - Lưu vết lịch sử thay đổi (Audit Trail).
- **Tài liệu:** Yêu cầu chi tiết được ghi lại trong `docs/specs.md`.

## 2. Thiết kế Kiến trúc & Database:

- **Công nghệ:** Flutter (Mobile), NextJS (Web), NestJS (Backend), PostgreSQL (Database), AWS (Cloud).
- **Kiến trúc Backend (NestJS):** Modular Monolith, hướng tới khả năng mở rộng (Scalability) với xử lý bất đồng bộ, caching, phân trang API bắt buộc.
- **Database (PostgreSQL):** Schema ban đầu cho Phase 1 đã được thiết kế, tập trung vào indexing và tối ưu query.
- **Frontend:** Flutter và NextJS, tập trung vào trải nghiệm người dùng, tìm kiếm/lọc hiệu quả, hiển thị danh sách lớn.
- **Tài liệu:** Chi tiết kiến trúc và schema được ghi lại trong `docs/architecture.md`.

## 3. Phát triển Backend (NestJS):

- **Thư mục:** `api/`
- **Tiến độ:**
  - Thiết lập cấu trúc dự án NestJS cơ bản.
  - Xây dựng module `auth` cho chức năng xác thực người dùng (login).
  - Tạo các thành phần chính: `AuthService`, `AuthController`, `LocalStrategy`, `JwtStrategy`, và các file test (`.spec.ts`) tương ứng.

## 4. Kiểm thử và Sửa lỗi:

- Đã thực hiện chạy các bài kiểm thử (`npm run test`) cho backend.
- Đã xác định và khắc phục các lỗi liên quan đến:
  - Đường dẫn import không chính xác (`../auth.service` vs `../../auth.service`).
  - Thiếu các dependency cần thiết (`passport-local`, `@nestjs/passport`, `@types/passport-local`).

## 5. Trạng thái Hiện tại:

- Phần backend NestJS đã có cấu trúc cơ bản.
- Module `auth` đã được xây dựng và hoạt động.
- **Tất cả các bài kiểm thử (tests) trong thư mục `api` hiện đang chạy thành công (passed).**
- Các tài liệu yêu cầu (`specs.md`) và kiến trúc (`architecture.md`) đã được tạo và cập nhật.

## 6. Bước Tiếp theo Đề xuất:

- Tập trung xây dựng các module backend cốt lõi: `Users`, `Roles`, `Permissions`.
- Thiết lập kết nối database và tạo/chạy migrations cho các bảng cơ bản.
- Viết unit/integration tests song song với quá trình phát triển.
