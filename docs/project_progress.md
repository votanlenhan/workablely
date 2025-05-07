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
- **Database (PostgreSQL):** Schema ban đầu cho Phase 1 đã được thiết kế, tập trung vào indexing và tối ưu query. TypeORM CLI và cấu hình migrations đã được thiết lập (`api/ormconfig.ts`, `api/package.json`).
- **Frontend:** Flutter và NextJS, tập trung vào trải nghiệm người dùng, tìm kiếm/lọc hiệu quả, hiển thị danh sách lớn.
- **Tài liệu:** Chi tiết kiến trúc và schema được ghi lại trong `docs/architecture.md`.

## 3. Phát triển Backend (NestJS):

- **Thư mục:** `api/`
- **Tiến độ:**
  - Thiết lập cấu trúc dự án NestJS cơ bản.
  - Xây dựng module `auth` cho chức năng xác thực người dùng (signup, login).
  - Xây dựng module `users` cơ bản (Entity, Service với `createUser`, `findOneByEmail`).
  - Tạo các thành phần chính: `AuthService`, `AuthController`, `LocalStrategy`, `JwtStrategy`, `UsersService`.
  - **Triển khai module `Permissions`:** Entity, DTOs (`CreatePermissionDto`, `UpdatePermissionDto`), `PermissionsService` (CRUD, phân trang), `PermissionsController` (CRUD endpoints, phân trang).
  - **Triển khai module `Roles`:** Entity, DTOs (`CreateRoleDto`, `UpdateRoleDto`), `RolesService` (CRUD, load permissions, phân trang), `RolesController` (CRUD endpoints, phân trang).
  - **Bổ sung `Users` module:** Hoàn thiện CRUD cho `UsersService` và `UsersController`, thêm chức năng gán/bỏ gán `Role`, hỗ trợ phân trang cho `findAll` trả về `PlainUser`.
  - **Triển khai module `Clients`:** Entity, DTOs, `ClientsService` (CRUD, phân trang), `ClientsController` (CRUD endpoints, phân trang).
  - **Triển khai module `ShowRoles`:** Entity, DTOs, `ShowRolesService` (CRUD, phân trang), `ShowRolesController` (CRUD endpoints, phân trang).
  - **Triển khai module `Shows`:** Entity, DTOs, `ShowsService` (CRUD, phân trang, logic tính toán cơ bản, `updateShowFinancesAfterPayment`), `ShowsController` (CRUD endpoints, phân trang).
  - **Triển khai module `ShowAssignments`:** Entity, DTOs, `ShowAssignmentsService` (CRUD, phân trang), `ShowAssignmentsController` (CRUD endpoints, phân trang).
  - **Triển khai module `Payments`:**
    - Entity (`Payment` với quan hệ tới `Show` và `User`).
    - DTOs (`CreatePaymentDto`, `UpdatePaymentDto`).
    - `PaymentsService` (CRUD, phân trang, xử lý transaction với `QueryRunner`, gọi `showsService.updateShowFinancesAfterPayment`).
    - `PaymentsController` (CRUD endpoints, Swagger, Guards, Roles).
    - Cập nhật `AppModule` và `ormconfig.ts`.
  - **Triển khai module `Equipment`:**
    - Entity (`Equipment` với enum `EquipmentStatus`).
    - DTOs (`CreateEquipmentDto`, `UpdateEquipmentDto`).
    - `EquipmentService` (CRUD, phân trang).
    - `EquipmentController` (CRUD endpoints, Swagger, Guards, Roles).
    - Cập nhật `AppModule` và `ormconfig.ts`.
  - **Triển khai module `EquipmentAssignments`:**
    - Entity (`EquipmentAssignment` với enum `AssignmentStatus`, quan hệ tới `Equipment`, `Show`, `User`).
    - DTOs (`CreateEquipmentAssignmentDto`, `UpdateEquipmentAssignmentDto`).
    - `EquipmentAssignmentsService` (CRUD, phân trang, logic cập nhật `Equipment.status` khi assignment thay đổi).
    - `EquipmentAssignmentsController` (CRUD endpoints, Swagger, Guards, Roles).
    - Cập nhật `AppModule` và `ormconfig.ts`, bao gồm cả việc inject repositories cần thiết vào service.
  - **Triển khai module `Expenses`:**
    - Entity (`Expense` với quan hệ tới `User` cho `recorded_by_user_id`).
    - DTOs (`CreateExpenseDto`, `UpdateExpenseDto` với validation và Swagger decorators).
    - `ExpensesService` (CRUD, phân trang, xử lý `expense_date` string to Date).
    - `ExpensesController` (CRUD endpoints, Swagger, Guards (`JwtAuthGuard`, `RolesGuard`), Roles (`Admin`, `Manager`), xử lý `AuthenticatedRequest`).
    - `ExpensesModule` (imports `TypeOrmModule.forFeature([Expense, User])`).
    - Cập nhật `AppModule` và `ormconfig.ts`.
  - **Migrations:**
    - Các migration ban đầu cho schema đã được tạo và chạy.
    - Xử lý sự cố migration cho `ShowAssignments` và các quan hệ liên quan.
    - Tạo và chạy thành công migration cho `Payments` (`CreatePaymentsTableAndRelations`) sau khi sửa các lỗi TypeScript liên quan đến định nghĩa entity và quan hệ (`Payment`, `Show`, `User`).
    - Cập nhật `ormconfig.ts` để TypeORM CLI nhận diện đúng các entity mới.
    - Tạo và chạy thành công migration cho `Equipment` và `EquipmentAssignments` (`CreateEquipmentAndAssignmentsTables`) sau khi sửa các lỗi TypeScript và import path.
    - Tạo và chạy thành công migration cho `Expenses` (`CreateExpensesTable`).

## 4. Kiểm thử và Sửa lỗi:

- **Đã khắc phục các lỗi chung:** Đường dẫn import, thiếu dependency, lỗi khởi động server, lỗi TypeScript, lỗi NestJS, lỗi TypeORM, lỗi logic.
- **Unit Testing:**
  - Đã viết và sửa lỗi unit tests toàn diện cho tất cả các Services và Controllers đã triển khai, bao gồm: `Auth`, `Users`, `Roles`, `Permissions`, `Clients`, `ShowRoles`, `Shows`, `ShowAssignments`, `Payments`, `Equipment`, `EquipmentAssignments`, và `Expenses`.
  - Quá trình sửa lỗi unit test bao gồm:
    - Chuẩn hóa và sửa lỗi đường dẫn import (relative vs. alias `@/`).
    - Cấu hình Jest (`moduleNameMapper` trong `package.json`) và xử lý các vấn đề liên quan đến `ts-jest` và `modulePaths`.
    - Sửa lỗi mock TypeORM repository (bao gồm `QueryRunner`, `DataSource`, `manager.getRepository`) và các service phụ thuộc.
    - Đảm bảo các đối tượng mock (mock data) cung cấp đầy đủ các thuộc tính bắt buộc theo type definition (ví dụ: `created_at`, `updated_at` từ `BaseEntity`).
    - Sửa lỗi logic trong các bài test (ví dụ: thứ tự tham số, kỳ vọng đúng cho mock calls, xử lý promise rejection).
    - Ép kiểu (casting) cho các mock function của Jest (`as jest.Mock`) để giải quyết lỗi TypeScript `TS2339`.
    - Điều chỉnh logic test cho phù hợp với thay đổi trong service (ví dụ: cách `ShowsService.remove` hoạt động, cách `PaymentsService.update` xử lý transaction và fetch dữ liệu).
    - Khắc phục các lỗi TypeScript cụ thể như `TS2561` (sai tên thuộc tính trong `orderBy`), `TS2322` (gán `null` cho type không cho phép `null`), và các vấn đề với mock `Pagination` constructor trong `ExpensesService.spec.ts`.
    - Sửa lỗi mock `User` entity trong `ExpensesController.spec.ts` để bao gồm các thuộc tính và phương thức cần thiết.
  - **Kết quả:** Tất cả 26 bộ unit test (292 bài test) cho backend (`npm run test`) đều đang PASS.
- Đã chạy linter (`npm run lint`) và formatter (`npm run format`).

## 5. Kiểm thử End-to-End (E2E) với Playwright:

- **Thiết lập:**
  - Cài đặt Playwright, cấu hình `playwright.config.ts` (`testDir: './e2e'`, `baseURL`).
  - Tạo các file spec E2E cho mỗi module API.
- **Các thách thức và giải pháp chính trong quá trình viết và gỡ lỗi E2E tests:**
  - Quản lý Người dùng Admin và Vai trò Admin (chuẩn hóa `test.beforeAll`, migration `SeedDefaultRoles`).
  - Validation DTO (snake_case vs. camelCase cho request payload).
  - Đặt tên Thuộc tính API Response (snake_case vs. camelCase).
  - Validation Số điện thoại (sử dụng E.164).
  - HTTP Status Code cho Endpoint DELETE (sử dụng `@HttpCode(HttpStatus.NO_CONTENT)`).
  - Xử lý Xung đột khi Tạo Tài nguyên Trùng lặp (sửu dụng `ConflictException`).
  - Assertion cho Kiểu Dữ liệu Số thập phân/Number.
  - Lỗi 500 khi GET `Show` với Relations (tạm thời đơn giản hóa relations, sau đó khôi phục và pass).
  - **Sửa lỗi `TypeError: (0 , _randomHelpers.generateRandomString) is not a function`:** Tạo và export đúng các helper function trong `e2e/utils/random-helpers.ts`.
  - **Sửa lỗi `TypeError: playwright.request.post is not a function`:** Sử dụng đúng fixture `request` từ `test.beforeAll(async ({ request }) => {...})` thay vì `playwright.request`.
  - **Sửa lỗi 404 `Cannot POST /api/auth/signup` và `Cannot GET /auth/profile`:**
    - Thêm global prefix `app.setGlobalPrefix('api');` vào `api/src/main.ts`.
    - Sửa lỗi logic `baseURL` trong `APIRequestContext` của Playwright, chuyển sang sử dụng full URL path cho các request trong `adminRequestContext` (trong `payments.spec.ts`).
    - Đồng bộ hóa tất cả các file spec E2E khác (`auth`, `roles`, `clients`, `permissions`, `users`, `shows`, `show-assignments`, `show-roles`) để sử dụng `BASE_URL` và full path cho các API calls.
  - **Sửa lỗi `QueryRunnerAlreadyReleasedError` trong `PaymentsService`:** Refactor lại logic `create` và `update` để đảm bảo `QueryRunner` được release đúng lúc và việc fetch lại entity sau transaction sử dụng query mới.
  - **Sửa lỗi `Playwright Test did not expect test.beforeAll()` và `test.describe()` errors:** Di chuyển `test.beforeAll` và `test.afterAll` vào trong `test.describe` cho các file spec mới (`equipment.spec.ts`, `equipment-assignments.spec.ts`). Reinstall `node_modules` để giải quyết vấn đề phiên bản Playwright tiềm ẩn.
  - **Sửa lỗi payload và DTO trong E2E tests cho `Equipment` và `EquipmentAssignments`:**
    - `equipment.spec.ts`: Sửa payload POST (bỏ các trường không có trong DTO), đảm bảo `serial_number` là duy nhất.
    - `equipment-assignments.spec.ts`: Sửa logic tạo Role (để xử lý conflict 409 khi chạy song song), sửa định dạng số điện thoại client, sửa payload DTO (thay `assigned_to_user_id` bằng `user_id`, `assignment_notes` bằng `notes`, `return_notes` bằng `notes`).
  - **Giải quyết các vấn đề phức tạp khi chạy E2E tests cho `Expenses` module:**
    - **Lỗi `TypeError: Cannot read properties of undefined (reading 'constructor')` khi Playwright import các file API (ví dụ: `RoleName` enum):**
      - Thử rebuild API, reinstall `node_modules` (root và `api/`).
      - Thử import `reflect-metadata` trong file test (`expenses.spec.ts`) và sau đó trong `e2e/global-setup.ts`.
      - Cài đặt `reflect-metadata` làm dev dependency ở root.
      - **Giải pháp cuối cùng:** Loại bỏ việc import enum (`RoleName`) từ source code API trong file test E2E, thay vào đó sử dụng string literals trực tiếp cho tên vai trò. Điều này ngăn Playwright cố gắng xử lý decorator của NestJS.
    - **Lỗi `TypeError: (0 , _randomHelpers.generateRandomUser) is not a function`:** Chuyển hàm `generateRandomUser` từ định nghĩa cục bộ trong các file spec khác vào file dùng chung `e2e/utils/random-helpers.ts`.
    - **Lỗi 404 `Cannot GET /auth/profile` và `Cannot POST /users` khi sử dụng `adminRequestContext` (được tạo với `newContext({ baseURL })`):**
      - Xác nhận server đang chạy và `globalPrefix` hoạt động.
      - Debug bằng cách log token và response của `/auth/profile`, thấy rằng API trả về 404 cho `/auth/profile` (không có `/api`).
      - **Giải pháp:** Chỉnh sửa tất cả các lệnh gọi API trong `expenses.spec.ts` (sử dụng `adminRequestContext`, `managerRequestContext`, `regularUserRequestContext`) để sử dụng full path (`${BASE_URL}/endpoint`) thay vì dựa vào `baseURL` của context. Điều này cho thấy có thể có vấn đề với cách Playwright xử lý `baseURL` trong `newContext` ở một số trường hợp cụ thể.
    - **Sửa lỗi `login` method trong `AuthController` không trả về HTTP 200:** Thêm `@HttpCode(HttpStatus.OK)` vào `login` method.
- **Trạng thái Kiểm thử E2E Hiện tại:**
  - **Tất cả 84 bài test E2E (`npx playwright test`) cho tất cả các module đã triển khai (bao gồm cả `Expenses`) đều đang PASS.**

## 6. Trạng thái Hiện tại:

- Phần backend NestJS đã có các module `Auth`, `Users`, `Roles`, `Permissions`, `Clients`, `ShowRoles`, `Shows`, `ShowAssignments`, `Payments`, `Equipment`, `EquipmentAssignments`, và `Expenses` được triển khai với CRUD và logic nghiệp vụ cốt lõi.
- Các chức năng liên quan đến các module trên hoạt động ổn định.
- Tất cả các API endpoints hỗ trợ phân trang.
- **Migrations:** Tất cả các migration, bao gồm cả cho `Payments`, `Equipment`, `EquipmentAssignments`, và `Expenses`, đã chạy thành công.
- **Server backend (`npm run start:dev`) đang chạy ổn định.**
- **Unit Tests:** Tất cả unit tests đều PASS (26 suites, 292 tests).
- **E2E Tests:** Tất cả E2E tests đều PASS (84 tests).
- Các tài liệu yêu cầu (`specs.md`) và kiến trúc (`architecture.md`) đã được cập nhật. `project_progress.md` được cập nhật thường xuyên.

## 7. Bước Tiếp theo Đề xuất:

- **Triển khai các module nghiệp vụ còn lại theo `docs/architecture.md` và `docs/specs.md`:**
  - Ưu tiên tiếp theo có thể là các module tài chính khác như `Expenses`, `ExternalIncomes`, `RevenueAllocations`.
  - Sau đó là `MemberEvaluations`, `AuditLogs`, `Configurations`.
- **Xem xét lại các TODO:** Giải quyết các ghi chú TODO còn lại trong code.
- **Tích hợp Frontend:** Bắt đầu kế hoạch tích hợp với các giao diện Flutter và NextJS khi các API chính đã ổn định.

- [x] `ShowAssignmentsController`
- [x] `ShowsController`
- [x] `ClientsController`
- [x] `ShowRolesController`
- [x] `UsersController`
- [x] `PermissionsController`
- [x] `RolesController`
- [x] `AuthController`
- [x] `PaymentsController`
- [x] `EquipmentController`
- [x] `EquipmentAssignmentsController`
- [x] `ExpensesController`
