# Kiến trúc Hệ thống Quản lý Nhiếp ảnh gia

Phần này mô tả các công nghệ và nguyên tắc thiết kế kiến trúc được sử dụng để xây dựng hệ thống, đặc biệt chú trọng đến khả năng mở rộng và bảo trì.

## Công nghệ sử dụng

- Flutter
- NextJS
- NestJS
- PostgreSQL
- Cucumber Test
- AWS Cloud services

## Thiết kế Hướng tới Khả năng Mở rộng (Scalability - Mục tiêu 500+ người dùng)

- **Kiến trúc Backend (NestJS):**

  - **Modular Monolith:** Thiết kế các module chức năng (User, Show, Schedule, Finance, Notification...) tách biệt tương đối để dễ bảo trì và có khả năng tách thành microservices trong tương lai nếu cần.
  - **Xử lý Bất đồng bộ:** Sử dụng Message Queues (ví dụ: AWS SQS) cho các tác vụ nền như gửi thông báo, tạo báo cáo phức tạp, xử lý dữ liệu lớn, tích hợp AI...
  - **API & Phân trang:** **Bắt buộc** triển khai phân trang (pagination) cho tất cả các API endpoints trả về danh sách.
  - **Caching:** Áp dụng chiến lược caching (ví dụ: Redis/Elasticache) cho dữ liệu thường xuyên truy cập và ít thay đổi (cấu hình, vai trò...).

- **Database (PostgreSQL):**

  - **Indexing:** Thiết kế và áp dụng Indexing hiệu quả cho các bảng lớn (users, shows, assignments, payments, ratings, logs) dựa trên các mẫu truy vấn phổ biến.
  - **Query Optimization:** Viết truy vấn SQL tối ưu, tránh N+1, sử dụng JOIN hiệu quả.
  - **Connection Pooling:** Sử dụng connection pooling để quản lý kết nối CSDL hiệu quả.

- **Frontend (Flutter & NextJS):**

  - **Nền tảng:** Sử dụng **Flutter** cho ứng dụng di động (iOS/Android) và **NextJS** cho giao diện web/desktop.
  - **Tìm kiếm & Lọc Nâng cao:** Giao diện quản lý (đặc biệt là quản lý Thành viên và Show) phải cung cấp công cụ tìm kiếm và lọc mạnh mẽ, đa tiêu chí để xử lý hiệu quả hàng trăm bản ghi.
  - **Hiển thị Danh sách Lớn:** Áp dụng các kỹ thuật lazy loading, infinite scrolling, hoặc virtual lists để tải và hiển thị danh sách lớn một cách mượt mà.
  - **Tác vụ Hàng loạt (Bulk Actions):** Xem xét triển khai các tác vụ hàng loạt cho Admin/Manager nếu phù hợp (ví dụ: cập nhật trạng thái nhiều Show).
  - **Tối ưu Dashboard:** Các truy vấn dữ liệu cho Dashboard cần được tối ưu, có thể cần tính toán trước hoặc caching.

- **Hạ tầng (AWS):**
  - Sử dụng các dịch vụ quản lý và có khả năng tự động co giãn như RDS (PostgreSQL), ECS/EKS hoặc Lambda (Compute), ELB (Load Balancing), CloudFront (CDN), SQS (Queue), Elasticache (Cache).
  - **Giám sát & Logging:** Thiết lập CloudWatch hoặc các công cụ tương đương để giám sát hiệu suất và ghi log chi tiết ngay từ đầu.
