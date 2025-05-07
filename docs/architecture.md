# Kiến trúc Hệ thống Quản lý Nhiếp ảnh gia

Phần này mô tả các công nghệ và nguyên tắc thiết kế kiến trúc được sử dụng để xây dựng hệ thống, đặc biệt chú trọng đến khả năng mở rộng và bảo trì.

## Công nghệ sử dụng

- Flutter
- NextJS
- NestJS
- PostgreSQL
- Cucumber Test
- Playwright (cho Kiểm thử End-to-End)
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

## Chiến lược Kiểm thử

- **Kiểm thử Đơn vị (Unit Tests):** Viết đồng thời với quá trình phát triển cho services và controllers phía backend (NestJS), sử dụng Jest.
- **Kiểm thử Tích hợp (Integration Tests):** Kiểm tra sự tương tác giữa các thành phần khác nhau, ví dụ như service với database.
- **Kiểm thử End-to-End (E2E Tests):**
  - Sử dụng Playwright để kiểm thử các luồng người dùng quan trọng từ đầu đến cuối cho các API đã triển khai.
  - Đảm bảo các kịch bản CRUD cơ bản và các luồng nghiệp vụ chính được bao phủ.
  - Các bài kiểm thử E2E được đặt trong thư mục `e2e/` ở gốc dự án.

## Database Schema (Phase 1)

Dưới đây là cấu trúc ban đầu cho các bảng chính trong cơ sở dữ liệu PostgreSQL.

**1. `users`**

- `id` (UUID, PK)
- `email` (VARCHAR, Unique, Not Null)
- `password_hash` (VARCHAR, Not Null)
- `first_name` (VARCHAR, Not Null)
- `last_name` (VARCHAR, Not Null)
- `phone_number` (VARCHAR, Nullable)
- `avatar_url` (VARCHAR, Nullable)
- `is_active` (BOOLEAN, Not Null, Default: true)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `last_login_at` (TIMESTAMPTZ, Nullable)
- _Relations: M2M with `roles` (via `user_roles`)_

**2. `roles`**

- `id` (UUID, PK)
- `name` (VARCHAR, Unique, Not Null)
- `description` (TEXT, Nullable)
- `is_system_role` (BOOLEAN, Not Null, Default: false)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Relations: M2M with `users` (via `user_roles`), M2M with `permissions` (via `role_permissions`)_

**3. `permissions`**

- `id` (UUID, PK)
- `action` (VARCHAR, Not Null)
- `subject` (VARCHAR, Not Null)
- `description` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Constraint: Unique on (`action`, `subject`)_
- _Relations: M2M with `roles` (via `role_permissions`)_

**4. `clients`**

- `id` (UUID, PK)
- `name` (VARCHAR, Not Null)
- `phone_number` (VARCHAR, Not Null)
- `email` (VARCHAR, Nullable, Unique)
- `address` (TEXT, Nullable)
- `source` (VARCHAR, Nullable)
- `notes` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Relations: O2M with `shows`_

**5. `shows`**

- `id` (UUID, PK)
- `client_id` (UUID, FK -> clients.id, Not Null)
- `title` (VARCHAR, Nullable)
- `show_type` (VARCHAR, Not Null)
- `start_datetime` (TIMESTAMPTZ, Not Null)
- `end_datetime` (TIMESTAMPTZ, Nullable)
- `location_address` (TEXT, Nullable)
- `location_details` (TEXT, Nullable)
- `requirements` (TEXT, Nullable)
- `status` (VARCHAR, Not Null, Default: 'Pending')
- `total_price` (DECIMAL(12, 2), Not Null, Default: 0.00)
- `deposit_amount` (DECIMAL(12, 2), Nullable, Default: 0.00)
- `deposit_date` (DATE, Nullable)
- `total_collected` (DECIMAL(12, 2), Not Null, Default: 0.00)
- `amount_due` (DECIMAL(12, 2), Not Null, Default: 0.00)
- `payment_status` (VARCHAR, Not Null, Default: 'Unpaid')
- `post_processing_deadline` (DATE, Nullable)
- `delivered_at` (TIMESTAMPTZ, Nullable)
- `completed_at` (TIMESTAMPTZ, Nullable)
- `cancelled_at` (TIMESTAMPTZ, Nullable)
- `cancellation_reason` (TEXT, Nullable)
- `created_by_user_id` (UUID, FK -> users.id, Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Relations: M2O with `clients`, O2M with `show_assignments`, O2M with `equipment_assignments`, O2M with `payments`, O2M with `revenue_allocations`, O2M with `member_evaluations`, M2O with `users` (created_by)_

**6. `show_roles`**

- `id` (UUID, PK)
- `name` (VARCHAR, Unique, Not Null)
- `description` (TEXT, Nullable)
- `default_allocation_percentage` (DECIMAL(5, 2), Nullable, Default: 0.00)
- `is_active` (BOOLEAN, Not Null, Default: true)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Relations: O2M with `show_assignments`_

**7. `show_assignments`**

- `id` (UUID, PK)
- `show_id` (UUID, FK -> shows.id, Not Null)
- `user_id` (UUID, FK -> users.id, Not Null)
- `show_role_id` (UUID, FK -> show_roles.id, Not Null)
- `confirmation_status` (VARCHAR, Not Null, Default: 'Pending')
- `decline_reason` (TEXT, Nullable)
- `assigned_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `confirmed_at` (TIMESTAMPTZ, Nullable)
- `assigned_by_user_id` (UUID, FK -> users.id, Nullable)
- _Constraint: Unique on (`show_id`, `user_id`)_
- _Relations: M2O with `shows`, M2O with `users`, M2O with `show_roles`, M2O with `users` (assigned_by)_

**8. `equipment`**

- `id` (UUID, PK)
- `name` (VARCHAR, Not Null)
- `description` (TEXT, Nullable)
- `serial_number` (VARCHAR, Unique, Nullable)
- `category` (VARCHAR, Nullable)
- `brand` (VARCHAR, Nullable)
- `model` (VARCHAR, Nullable)
- `purchase_date` (DATE, Nullable)
- `purchase_price` (DECIMAL(10, 2), Nullable, Default: 0.00)
- `status` (ENUM EquipmentStatus, Not Null, Default: 'Available')
- `notes` (TEXT, Nullable)
- `last_maintenance_date` (DATE, Nullable)
- `next_maintenance_date` (DATE, Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Relations: O2M with `equipment_assignments`_

**9. `equipment_assignments`**

- `id` (UUID, PK)
- `equipment_id` (UUID, FK -> equipment.id, Not Null)
- `show_id` (UUID, FK -> shows.id, Nullable)
- `user_id` (UUID, FK -> users.id, Nullable)
- `assigned_by_user_id` (UUID, FK -> users.id, Not Null)
- `assignment_date` (TIMESTAMPTZ, Not Null)
- `expected_return_date` (TIMESTAMPTZ, Nullable)
- `actual_return_date` (TIMESTAMPTZ, Nullable)
- `status` (ENUM AssignmentStatus, Not Null, Default: 'Assigned')
- `notes` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())
- _Relations: M2O with `equipment`, M2O with `shows`, M2O with `users` (user_id for who is assigned), M2O with `users` (assigned_by_user_id)_

**10. `payments`** - `id` (UUID, PK) - `show_id` (UUID, FK -> shows.id, Not Null) - `amount` (DECIMAL(12, 2), Not Null) - `payment_date` (TIMESTAMPTZ, Not Null, Default: NOW()) - `payment_method` (VARCHAR, Nullable) - `transaction_reference` (VARCHAR, Nullable) - `notes` (TEXT, Nullable) - `is_deposit` (BOOLEAN, Not Null, Default: false) - `recorded_by_user_id` (UUID, FK -> users.id, Nullable) - `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - _Relations: M2O with `shows`, M2O with `users` (recorded_by)_

**11. `expenses`** - `id` (UUID, PK) - `description` (VARCHAR, Not Null) - `amount` (DECIMAL(12, 2), Not Null) - `expense_date` (DATE, Not Null) - `category` (VARCHAR, Not Null) - `is_wishlist_expense` (BOOLEAN, Not Null, Default: false) - `payment_method` (VARCHAR, Nullable) - `vendor` (VARCHAR, Nullable) - `receipt_url` (VARCHAR, Nullable) - `notes` (TEXT, Nullable) - `recorded_by_user_id` (UUID, FK -> users.id, Nullable) - `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - _Relations: M2O with `users` (recorded_by)_

**12. `revenue_allocations`** - `id` (UUID, PK) - `show_id` (UUID, FK -> shows.id, Not Null) - `user_id` (UUID, FK -> users.id, Nullable) - `allocated_role_name` (VARCHAR, Not Null) - `show_role_id` (UUID, FK -> show*roles.id, Nullable) - `amount` (DECIMAL(12, 2), Not Null) - `calculation_notes` (TEXT, Nullable) - `allocation_datetime` (TIMESTAMPTZ, Not Null, Default: NOW()) - `is_paid_out` (BOOLEAN, Not Null, Default: false) *(Consider for Phase 2)_ - `paid_out_date` (TIMESTAMPTZ, Nullable) _(Consider for Phase 2)_ - \_Relations: M2O with `shows`, M2O with `users`, M2O with `show_roles`_

**13. `member_evaluations`** - `id` (UUID, PK) - `show_id` (UUID, FK -> shows.id, Not Null) - `evaluated_user_id` (UUID, FK -> users.id, Not Null) - `evaluator_user_id` (UUID, FK -> users.id, Not Null) - `rating` (SMALLINT, Nullable) - `comments` (TEXT, Nullable) - `evaluation_date` (TIMESTAMPTZ, Not Null, Default: NOW()) - `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - _Constraint: Unique on (`show_id`, `evaluated_user_id`)_ - _Relations: M2O with `shows`, M2O with `users` (evaluated), M2O with `users` (evaluator)_

**14. `audit_logs`** - `id` (UUID, PK) - `entity_name` (VARCHAR, Not Null) - `entity_id` (UUID, Not Null) - `action` (VARCHAR, Not Null) - `changed_by_user_id` (UUID, FK -> users.id, Nullable) - `change_timestamp` (TIMESTAMPTZ, Not Null, Default: NOW()) - `old_values` (JSONB, Nullable) - `new_values` (JSONB, Nullable) - `details` (TEXT, Nullable) - _Relations: M2O with `users` (changed_by)_

**15. `configurations`** - `key` (VARCHAR, PK) - `value` (VARCHAR, Not Null) - `description` (TEXT, Nullable) - `value_type` (VARCHAR, Not Null, Default: 'string') - `is_editable` (BOOLEAN, Not Null, Default: true) - `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW())

**16. `external_incomes`** - `id` (UUID, PK) - `description` (VARCHAR, Not Null) - `amount` (DECIMAL(12, 2), Not Null) - `income_date` (DATE, Not Null) - `source` (VARCHAR, Nullable) - `notes` (TEXT, Nullable) - `recorded_by_user_id` (UUID, FK -> users.id, Nullable) - `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - _Relations: M2O with `users` (recorded_by)_

**17. `user_roles`** (Junction Table) - `user_id` (UUID, FK -> users.id, PK part) - `role_id` (UUID, FK -> roles.id, PK part) - `assigned_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `assigned_by_user_id` (UUID, FK -> users.id, Nullable) - _Relations: M2O with `users`, M2O with `roles`, M2O with `users` (assigned_by)_

**18. `role_permissions`** (Junction Table) - `role_id` (UUID, FK -> roles.id, PK part) - `permission_id` (UUID, FK -> permissions.id, PK part) - `assigned_at` (TIMESTAMPTZ, Not Null, Default: NOW()) - `assigned_by_user_id` (UUID, FK -> users.id, Nullable) - _Relations: M2O with `roles`, M2O with `permissions`, M2O with `users` (assigned_by)_
