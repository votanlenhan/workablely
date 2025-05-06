# Thông số kỹ thuật Hệ thống Quản lý Nhiếp ảnh gia

## Quy tắc Tài liệu

- **Cập nhật Yêu cầu:** Tài liệu này (`docs/specs.md`) PHẢI được cập nhật mỗi khi có thay đổi quan trọng về yêu cầu chức năng hoặc luồng hoạt động của hệ thống.
- **Cập nhật Ngữ cảnh:** Tài liệu `docs/project_progress.md` PHẢI được cập nhật để phản ánh bối cảnh và trạng thái mới nhất của dự án khi có thay đổi đáng kể.

## Tên dự án: Photographer Management System

## Mô tả chung

- Xây dựng nền tảng toàn diện để quản lý studio nhiếp ảnh, bao gồm:
  - Quản lý lịch trình công việc và điều phối nhân sự (photographer, designer, editor...).
  - Quản lý khách hàng và dự án/hợp đồng (gọi là "Show"). Mỗi Show sẽ có các **Trạng thái** để theo dõi tiến độ.
  - Theo dõi tiến độ công việc (các giai đoạn hậu kỳ).
  - Quản lý tài sản (thiết bị studio).
  - Quản lý tài chính: Tính toán doanh thu, chi phí, xuất hóa đơn, và phân bổ thu nhập.

## Vai trò nhân sự và Phân quyền

Hệ thống phân biệt các vai trò với quyền hạn khác nhau:

- **Admin:**
  - **Quyền hạn:** Toàn quyền quản trị hệ thống.
  - **Chức năng chính:** Định nghĩa và quản lý các Vai trò Quản lý/Cố định (như Manager, Art Lead...), quản lý người dùng (tạo, sửa, xóa, gán vai trò), **có thể ủy quyền một phần quyền quản lý người dùng cho vai trò khác**, cấu hình chi tiết quyền hạn cho từng vai trò, cấu hình hệ thống (Thể loại Show, Vai trò tham gia Show, Tỷ lệ % phân bổ doanh thu cho các vai trò và quỹ...), xem tất cả báo cáo, và thực hiện mọi chức năng khác.
- **Manager (Bộ quyền Quản lý Show - Được gán bởi Admin):**
  - **Quyền hạn:** Bao gồm các quyền hạn **điển hình** liên quan đến quản lý vận hành Show và nhập liệu tài chính cơ bản. **Admin có thể tùy chỉnh (thêm/bớt) các quyền hạn cụ thể** cho bộ quyền này và gán nó cho một hoặc nhiều người (bao gồm cả Founder).
  - **Chức năng chính điển hình:** Nhập thông tin Show mới, phân công vai trò tham gia Show (đặc biệt là các vai trò chụp ảnh như Key, Support, Selective), nhập thông tin thanh toán (cọc, các đợt khác), nhập liệu Chi Wishlist, nhập liệu Thu ngoài. Có thể xem các báo cáo liên quan đến Show và tài chính cơ bản.
  - _Tỷ lệ % phân bổ doanh thu (nếu có) cho vai trò này được cấu hình bởi Admin._
  - _Không có quyền:_ Thay đổi cấu hình hệ thống, **quản lý người dùng (trừ khi được Admin ủy quyền cụ thể, ví dụ: quyền tạo user)**, thay đổi tỷ lệ phân bổ...
- **Art Lead, Marketing, Security... (Các Vai trò Quản lý/Cố định khác - Được gán bởi Admin):**
  - **Quyền hạn:** Được xác định và **có thể tùy chỉnh bởi Admin**. Có thể bao gồm xem báo cáo cụ thể hoặc thực hiện một số chức năng giới hạn liên quan đến vai trò của họ.
  - **Ví dụ cụ thể:** **Art Lead** thường có quyền **điển hình** là phân công các vai trò hậu kỳ (Blend, Retouch) và quản lý quy trình hậu kỳ (Xem Bước 6). Admin có thể cấp thêm/bớt quyền cho vai trò Art Lead.
  - _Tỷ lệ % phân bổ doanh thu cho các vai trò này được cấu hình bởi Admin._
- **Vai trò tham gia Show (Photographer Key, Support, Selective, Blend, Retouch... - Được gán bởi Manager/Art Lead cho từng Show):**
  - **Quyền hạn:** Giới hạn trong phạm vi công việc của Show được giao (ví dụ: xem lịch cá nhân, xác nhận lịch, cập nhật trạng thái công việc nếu có chức năng đó).
  - _Không có quyền quản lý hay cấu hình._

## Luồng hoạt động của Studio (Chi tiết)

**1. Tiếp nhận và Xác nhận Lịch Chụp:**

- **Nguồn gốc:** Lịch chụp được tiếp nhận từ nhiều kênh (ví dụ: đặt online qua website/app, gọi điện thoại, email, quản lý tự thêm).
- **Thu thập thông tin:** Ghi nhận đầy đủ thông tin cần thiết:
  - Thông tin khách hàng (tên, liên hệ).
  - Loại hình chụp (cưới, sự kiện, sản phẩm,...).
  - Thời gian cụ thể (ngày, giờ bắt đầu, thời lượng dự kiến).
  - Địa điểm chụp.
  - Yêu cầu đặc biệt (thiết bị cụ thể, phong cách mong muốn).
  - **Giá tiền đã chốt (Total Price)**.
  - **Ghi chú cho Photographer (Nhập bởi Manager):** Trường riêng để Manager ghi chú các thông tin quan trọng cho Photographer được phân công (ví dụ: địa chỉ chi tiết, SĐT liên hệ khách, yêu cầu thiết bị bổ sung, lưu ý đặc biệt về buổi chụp...). Thông tin này sẽ hiển thị cho photographer khi họ xem chi tiết lịch trình.
- **Xác nhận với khách hàng:** Gửi xác nhận (email/tin nhắn) về thông tin lịch trình, yêu cầu và **giá tiền đã chốt** cho khách hàng.
- **Trạng thái Show:** "Đã nhận".

**2. Kiểm tra Lịch trình và Phân công Thành viên:**

- **Kiểm tra lịch:** Hệ thống hiển thị lịch rảnh/bận của tất cả thành viên.
- **Gợi ý phân công:**
  - Hệ thống có thể tự động gợi ý thành viên phù hợp dựa trên:
    - Lịch rảnh trùng khớp.
    - Kỹ năng chuyên môn (phù hợp với loại hình chụp).
    - Vị trí địa lý (nếu cần tối ưu di chuyển).
  - **Cơ chế ưu tiên:** Áp dụng các quy tắc ưu tiên khi phân công (ví dụ: ưu tiên thành viên có kinh nghiệm hơn, thành viên đang cần thêm giờ làm, hoặc theo chỉ định của quản lý).
- **Phân công chính thức (Thực hiện bởi Manager):** Dựa trên việc kiểm tra lịch và thông tin Show (bao gồm cả phân công sơ bộ nếu có từ Bước 7), Manager chọn và gán vai trò chính thức cho các thành viên trên hệ thống. _Lưu ý về Scalability: Giao diện phân công cần hỗ trợ tìm kiếm/lọc thành viên hiệu quả khi số lượng lớn._
- **Thông báo Phân công:** Hệ thống tự động gửi **thông báo mới** (qua app/email, có thể qua message queue) cho thành viên được phân công về chi tiết lịch trình (Show, vai trò, thời gian, địa điểm, ghi chú...). Thông báo này hiển thị trong mục thông báo của Thành viên. (Xem thêm logic thông báo ở Bước 7).
- _(Trạng thái Show vẫn là "Đã nhận" hoặc có thể chuyển sang "Đã phân công" nếu cần theo dõi chi tiết hơn)._

**3. Quản lý Lịch cá nhân và Xác nhận của Thành viên:**

- **Xem lịch cá nhân:** Thành viên truy cập hệ thống để xem lịch làm việc đã được phân công.
- **Xác nhận/Báo bận:**
  - Thành viên xác nhận tham gia lịch trình.
  - Hoặc, thành viên báo bận (nêu lý do) để quản lý nhận thông tin.
- **Xử lý báo bận:** Nếu thành viên báo bận, quản lý nhận thông báo và quay lại bước 2 để tìm thành viên thay thế hoặc sắp xếp lại với khách hàng.

**4. Phân công và Quản lý Thiết bị:**

- **Yêu cầu thiết bị:** Hệ thống dựa trên loại hình chụp hoặc quản lý chỉ định các thiết bị cần thiết (máy ảnh, ống kính, đèn, phụ kiện...).
- **Kiểm tra tình trạng:** Kiểm tra tình trạng sẵn có và hoạt động của thiết bị. Ghi nhận nếu thiết bị cần bảo trì.
- **Phân công thiết bị:** Gán cụ thể thiết bị cho thành viên phụ trách lịch trình.
- **Quy trình giao nhận:**
  - **Giao:** Thành viên nhận thiết bị tại studio, ký nhận hoặc xác nhận qua hệ thống, ghi chú tình trạng thiết bị (nếu cần).
  - **Trả:** Sau khi hoàn thành công việc, thành viên trả thiết bị, ghi chú tình trạng sau sử dụng. Quản lý/bộ phận kho kiểm tra và cập nhật trạng thái.
- **Theo dõi bảo trì:** Hệ thống ghi nhận lịch sử sử dụng và lên lịch bảo trì định kỳ cho thiết bị.

**5. Thực hiện Công việc và Cập nhật Trạng thái:**

- **Thực hiện chụp:** Thành viên thực hiện công việc theo lịch trình đã xác nhận và yêu cầu.
- **Cập nhật Trạng thái Show thành "Hoàn thành buổi chụp":**
  - **Ưu tiên:** Dựa trên hành động xác nhận thủ công từ Manager hoặc Thành viên (ví dụ: nhấn nút "Xác nhận hoàn thành chụp" sau khi buổi chụp kết thúc).
  - **Tự động (Tùy chọn/Tham khảo):** Hệ thống _có thể_ tự động đề xuất hoặc chuyển trạng thái khi ngày hiện tại > ngày kết thúc lịch trình Show. **Tuy nhiên, do khách hàng thường xuyên đổi lịch, logic tự động này cần được xem xét cẩn thận và _luôn cần_ cơ chế xác nhận/điều chỉnh thủ công bởi Manager** để đảm bảo trạng thái phản ánh đúng thực tế công việc đã hoàn thành.

**6. Quy trình Hậu kỳ (Design Stages):**

- **Chuẩn bị Hậu kỳ:**
  - Art Lead nhận sản phẩm gốc từ photographer (theo quy trình bên ngoài hệ thống trong Phase 1).
  - Làm việc với khách hàng để chọn demo, thống nhất phong cách (nếu cần).
  - Lọc và chọn ra các file cần xử lý hậu kỳ.
- **Bắt đầu Giai đoạn Blend:**
  - Art Lead chỉ định Designer thực hiện Blend, **có thể đặt deadline cho giai đoạn này,** và cập nhật Trạng thái Show thành "Blend". _Thông tin deadline sẽ được hiển thị trong giao diện quản lý Show._
  - Designer thực hiện Blend theo yêu cầu.
  - _(Quy trình duyệt nội bộ giữa Designer và Art Lead: Designer báo hoàn thành -> Art Lead duyệt (Approve/Retake). Tiến độ này (bao gồm cả việc theo dõi deadline nếu có) sẽ được theo dõi bằng trạng thái phụ (sub-status) hoặc task riêng, không làm thay đổi trạng thái chính ("Blend") của Show)._
- **Bắt đầu Giai đoạn Retouch (Nếu cần):**
  - Sau khi giai đoạn Blend được Art Lead xác nhận hoàn thành (nội bộ), Art Lead chỉ định Designer thực hiện Retouch, **có thể đặt deadline cho giai đoạn này,** và cập nhật Trạng thái Show thành "Retouch". _Thông tin deadline sẽ được hiển thị trong giao diện quản lý Show._
  - Designer thực hiện Retouch theo yêu cầu.
  - _(Quy trình duyệt nội bộ tương tự như Blend. Tiến độ này (bao gồm cả việc theo dõi deadline nếu có) sẽ được theo dõi bằng trạng thái phụ (sub-status) hoặc task riêng, không làm thay đổi trạng thái chính ("Retouch") của Show)._
- **Hoàn thành Hậu kỳ và Bàn giao:**
  - Sau khi giai đoạn Retouch (hoặc Blend nếu không có Retouch) được Art Lead xác nhận hoàn thành (nội bộ), Art Lead/Manager tiến hành bàn giao sản phẩm cuối cùng cho khách hàng (qua link download, USB, ...).
  - Manager/Art Lead **cập nhật Trạng thái Show thành "Đã giao khách"** và có thể nhập Ghi chú/Link bàn giao.
- **Ghi nhận phản hồi:** Thu thập phản hồi từ khách hàng về sản phẩm cuối cùng (nếu có).

**7. Quản lý Tài chính và Phân bổ Doanh thu:**

- **Quản lý "Show" (Hợp đồng/Dự án):** Mỗi Show sẽ có các thuộc tính tài chính quan trọng ngoài thông tin cơ bản:
  - `total_price` (Tổng giá tiền)
  - `deposit_amount` (Số tiền cọc đã nhận)
  - `deposit_date` (Ngày nhận cọc)
  - `total_collected` (Tổng số tiền đã thu từ khách hàng cho Show này)
  - `amount_due` (Số tiền còn lại phải thu, tính bằng `total_price - total_collected`)
  - `payment_status` (Trạng thái thanh toán - **Tự động suy luận bởi hệ thống**):
    - Nếu `total_collected == 0`: "**Chưa thanh toán**"
    - Nếu `total_collected > 0` AND `total_collected < total_price`: "**Còn nợ**" (Số tiền nợ cụ thể xem ở `amount_due`)
    - Nếu `total_collected >= total_price`: "**Đã thanh toán đủ**"
  - **Nhập Show (Thực hiện bởi Manager):**
    - Tạo mới "Show" khi chốt đơn với khách hàng (Trạng thái ban đầu: "Đã nhận", `payment_status` ban đầu sẽ là "**Chưa thanh toán**").
    - Nhập thông tin khách hàng (có thể liên kết với danh bạ khách hàng).
    - Nhập **Thời gian thực hiện Show**.
    - Nhập **Tổng giá tiền** (`total_price`) của Show (đã chốt ở Bước 1).
    - Chọn **Thể loại Show** (Ví dụ: Chụp cưới, Chụp sản phẩm, Sự kiện,...). _Admin có thể quản lý (thêm/sửa/xóa) danh sách Thể loại._
    - **Phân công Thành viên Ban đầu (Optional):** Cho phép Manager gán **ngay lúc tạo Show** thành viên dự kiến cho các vai trò tham gia chính (Key, Support, Design...). Việc này có thể bỏ trống và sẽ được xác nhận/bổ sung/thay đổi ở Bước 2 hoặc mục cập nhật bên dưới.
  - **Phân công / Cập nhật Vai trò Tham gia (Thực hiện bởi Manager):**
    - Manager có thể **gán hoặc thay đổi** thành viên cụ thể cho các vai trò tham gia vào Show (Key, Support 1, Support 2, Selective, Blend, Retouch...) **bất cứ lúc nào** trước khi Show hoàn thành việc tính toán phân bổ doanh thu (thường là sau Bước 2 và có thể cập nhật thêm).
    - **Thông báo Thay đổi Phân công:**
      - Khi một Thành viên **được gán mới** vào một vai trò trong Show: Hệ thống gửi **thông báo mới** cho Thành viên đó.
      - Khi một Thành viên **bị hủy gán** khỏi một vai trò trong Show: Hệ thống **cập nhật hoặc xóa thông báo cũ** liên quan đến Show đó của Thành viên, đồng thời có thể gửi thông báo về việc hủy gán (tùy cấu hình).
    - Các vai trò này nhận phân chia từ "Quỹ Người tham gia".
    - _Admin có thể quản lý (thêm/sửa/xóa) danh sách các vai trò tham gia Show này._
    - _(Lưu ý: Bất kỳ người dùng nào trong hệ thống, kể cả những người đang giữ vai trò quản lý như Art Lead hay Manager (do Admin gán), đều có thể được Manager gán các vai trò tham gia Show nếu họ trực tiếp thực hiện công việc đó cho Show cụ thể.)_
  - **Theo dõi Thanh toán (Thực hiện bởi Manager):**
    - Cho phép ghi nhận **nhiều đợt thanh toán** từ khách hàng cho một Show (không chỉ tiền cọc).
    - Mỗi lần ghi nhận thanh toán, cần nhập số tiền và ngày thanh toán.
    - Hệ thống **tự động cập nhật** `total_collected` và `amount_due` cho Show.
    - Khi ghi nhận tiền cọc lần đầu, hệ thống cập nhật `deposit_amount` và `deposit_date`.
    - Hệ thống tự động cập nhật `payment_status` dựa trên `total_collected` và `total_price`.
  - **Theo dõi Lịch sử Thay đổi (Audit Trail):**
    - **Mục đích:** Để tránh nhập liệu sai và cho phép truy vết, kiểm tra lại thông tin khi cần thiết.
    - **Yêu cầu:** Hệ thống cần tự động ghi lại lịch sử các thay đổi quan trọng đối với dữ liệu của Show.
    - **Dữ liệu cần log:** Ít nhất bao gồm các thay đổi về: `total_price`, `deposit_amount`, `total_collected`, các lần gán/hủy gán vai trò tham gia (ai được gán/hủy, vai trò nào, bởi ai), các lần thay đổi Trạng thái Show (trạng thái cũ, trạng thái mới, bởi ai).
    - **Chi tiết Log:** Mỗi bản ghi lịch sử nên chứa: Trường dữ liệu thay đổi, Giá trị cũ, Giá trị mới, Người thực hiện thay đổi, Thời gian thay đổi.
    - **Truy cập Lịch sử:** Admin (và có thể Manager) cần có quyền xem lịch sử thay đổi chi tiết của từng Show.
    - **Khả năng Khôi phục (Nâng cao/Phase 2):** Xem xét khả năng cho phép Admin khôi phục lại một phiên bản dữ liệu cũ của Show từ lịch sử trong trường hợp nhập sai nghiêm trọng.
- **Phân bổ Doanh thu (Tính toán tự động dựa trên Tổng giá tiền Show khi Show chuyển sang trạng thái phù hợp, ví dụ: "Đã giao khách" hoặc "Đã thanh toán đủ"):**
  - **Cấu hình Tỷ lệ % (Bởi Admin):** Admin cấu hình tỷ lệ phần trăm cố định trên `Tổng giá tiền` cho các vai trò và quỹ sau. **Lưu ý:** Các giá trị % dưới đây là **mặc định/ví dụ** và **có thể được Admin thay đổi** trong cài đặt hệ thống.
    - **Vai trò tham gia Show:**
      - _Key & Support:_ Ngân sách tổng cộng cố định là **35%** (con số này cũng có thể được Admin cấu hình). Việc phân chia cụ thể giữa Key và Support(s) được tính toán động dựa trên số lượng Support và cơ chế bonus (xem chi tiết ở phần Tính toán bên dưới).
      - Selective: **2%**
      - Blend: **4.50%**
      - Retouch: **3.50%**
      - _(Có thể có các vai trò khác với % riêng do Admin cấu hình)_
    - **Vai trò/Quỹ Cố định:**
      - Marketing: **7%**
      - Art Lead: **5%**
      - PM (Manager): **5%**
      - Security: **2%**
      - Wishlist: **20%**
    - **Bonus cho Key (Tính thêm vào lương Key):**
      - Bonus 1: **4%** (Áp dụng khi Show có gán 1 Support)
      - Bonus 2: **3%** (Áp dụng khi Show có gán 2 Support)
  - **Tính toán Phân bổ cho từng Show:** Khi Show hoàn thành:
    - **Xác định các biến đầu vào:**
      - `Tổng giá tiền` (Price)
      - `Ngân sách Photographer (%)` = 35% (Cố định hoặc do Admin cấu hình)
      - `% Bonus 1` = 4% (Cố định hoặc do Admin cấu hình)
      - `% Bonus 2` = 3% (Cố định hoặc do Admin cấu hình)
      - Số lượng Support được gán (0, 1, hoặc 2)
    - **Tính toán Lương Key và Support:**
      - `Ngân sách Photographer (Tiền)` = `Tổng giá tiền` \* `Ngân sách Photographer (%)`
      - `Bonus Amount` = 0
      - Nếu có 1 Support: `Bonus Amount` = `Tổng giá tiền` \* `% Bonus 1`
      - Nếu có 2 Supports: `Bonus Amount` = `Tổng giá tiền` \* `% Bonus 2`
      - `Ngân sách Chia sẻ` = `Ngân sách Photographer (Tiền)` - `Bonus Amount`
      - `Số người Chia sẻ` = 1 (Key) + Số lượng Support (0, 1, hoặc 2)
      - `Phần Chia đều` = `Ngân sách Chia sẻ` / `Số người Chia sẻ`
      - **Tổng lương Key** = `Phần Chia đều` + `Bonus Amount`
      - **Lương Support 1 (nếu có)** = `Phần Chia đều`
      - **Lương Support 2 (nếu có)** = `Phần Chia đều`
      - _(Lưu ý: Đảm bảo `Ngân sách Chia sẻ` không âm. Nếu `Bonus Amount` lớn hơn `Ngân sách Photographer`, cần có quy tắc xử lý - ví dụ: Lương Support bằng 0 và Key nhận tối đa `Ngân sách Photographer`?)_
    - **Tính Tiền cho các Vai trò Tham gia khác:**
      - **Selective:** = `Tổng giá tiền` \* 2%
      - **Blend:** = `Tổng giá tiền` \* 4.5%
      - **Retouch:** = `Tổng giá tiền` \* 3.5%
      - _(Tính tương tự cho các vai trò khác nếu có)_
    - **Tổng Chi lương Show:** = Tổng lương Key + Lương Support 1 (nếu có) + Lương Support 2 (nếu có) + Lương Selective + Lương Blend + Lương Retouch + ...
    - **Tính Tiền cho Vai trò/Quỹ Cố định:**
      - Marketing: = `Tổng giá tiền` \* 7%
      - Art Lead: = `Tổng giá tiền` \* 5%
      - PM: = `Tổng giá tiền` \* 5%
      - Security: = `Tổng giá tiền` \* 2%
      - Wishlist: = `Tổng giá tiền` \* 20%
    - **Tổng Chi cố định:** = Tổng tiền của tất cả các vai trò/quỹ cố định (Marketing + Art Lead + PM + Security + Wishlist)
    - **Lợi nhuận ròng (Operation) của Show:** = `Tổng giá tiền` - Tổng Chi lương Show - Tổng Chi cố định.
    - **Xuất Hóa đơn:** Cho phép tạo và xuất hóa đơn cho khách hàng dựa trên thông tin Show.

**7.1. Đánh giá Thành viên sau Show:**

- **Người thực hiện:** Những người dùng được Admin gán bộ quyền **Manager** (bao gồm cả Founder nếu được gán quyền).
- **Đối tượng:** Các Thành viên đã tham gia vào Show (Key, Support, Selective, Blend, Retouch...).\n- **Thời điểm:** Sau khi Show đã hoàn thành các giai đoạn chính (ví dụ: sau trạng thái \"Đã giao khách\").
- **Cơ chế:**
  - Cho phép người thực hiện đánh giá đưa ra nhận xét cho từng thành viên tham gia Show đó.
  - **Nội dung đánh giá:**
    - Thang điểm (ví dụ: 1-10 sao).
    - Ghi chú/Nhận xét chi tiết (về thái độ, chất lượng công việc, tính chuyên nghiệp, đúng giờ...).
- **Mục đích:** Lưu trữ lịch sử hiệu suất làm việc của thành viên, làm cơ sở tham khảo cho các quyết định phân công trong tương lai hoặc đánh giá định kỳ.
- _Lưu ý về Scalability: Bảng lưu trữ đánh giá cần được thiết kế để truy vấn hiệu quả khi dữ liệu tăng lên._

## Báo cáo và Thống kê

### Báo cáo Tài chính:

- Báo cáo thu nhập chi tiết theo từng nhân sự tham gia Show.
- Báo cáo tổng hợp doanh thu, các khoản đã phân bổ (Người tham gia, Founder/Management cố định, Wishlist, Phần còn lại) theo thời gian.
- Báo cáo công nợ khách hàng (`amount_due`).
- **Quản lý Chi tiêu Wishlist:**
  - Cần có bảng/module riêng để **Manager** nhập các khoản chi tiêu từ Quỹ Wishlist (Ví dụ: chi phí vận hành, mua sắm thiết bị, chi phí cố định...).
  - Báo cáo chi tiết các khoản chi từ Wishlist và số dư quỹ.
- **Quản lý Thu nhập Ngoài luồng:**
  - Cần có bảng/module riêng để **Manager** nhập các khoản thu nhập không đến từ Show (Ví dụ: cho thuê thiết bị, bán vật tư, **vốn góp thêm từ chủ sở hữu**...).
  - Báo cáo chi tiết các khoản Thu ngoài.

### Dashboard Thống kê Tổng quan (Dành cho Admin/Manager - Thường xem theo Tháng/Quý/Năm):

- **Tiền mặt đầu kỳ:** Số dư tiền mặt cuối kỳ của kỳ báo cáo trước. Cần giá trị khởi tạo ban đầu.
- **Doanh thu (Tổng giá trị Show):** Tổng giá trị (`total_price`) các Show đã hoàn thành trong kỳ.
- **Đã thu:** Tổng số tiền thực tế thu được từ khách hàng trong kỳ (Tổng `total_collected` của các Show có thanh toán trong kỳ).
- **Chưa thu (Công nợ cuối kỳ):** Tổng `amount_due` của tất cả các Show chưa thanh toán đủ tính đến cuối kỳ.
- **Chi lương (Đã phân bổ):** Tổng tiền lương **đã được tính toán và phân bổ** cho Người tham gia Show (bao gồm bonus) và các Vai trò Quản lý/Cố định (PM, Art Lead, Marketing, Security...) dựa trên các Show hoàn thành trong kỳ. _Lưu ý: Đây là số liệu ghi nhận nghĩa vụ chi trả lương phát sinh, việc chi trả thực tế (thực chi) thường diễn ra định kỳ (ví dụ: cuối tháng) và cần được theo dõi riêng nếu muốn tính dòng tiền chính xác._
- **Quỹ Wishlist đã trích:** Tổng tiền đã trích vào Quỹ Wishlist trong kỳ, tính bằng: `Tổng Đã thu (trong kỳ) * % Wishlist`. (% Wishlist được cấu hình bởi Admin, mặc định 20%).
- **Lợi nhuận ròng (Đã phân bổ):** Tổng lợi nhuận ròng (Operation) từ các Show hoàn thành trong kỳ.
- **Chi Wishlist (Thực chi):** Tổng tiền **thực tế đã chi tiêu** từ Quỹ Wishlist trong kỳ (lấy từ bảng nhập liệu Chi Wishlist).
- **Thu ngoài:** Tổng tiền thu nhập ngoài luồng trong kỳ (lấy từ bảng nhập liệu Thu ngoài).
- **Lợi nhuận/Lỗ ròng (Dòng tiền):** Phản ánh lợi nhuận/lỗ thực tế dựa trên dòng tiền trong kỳ. Tính bằng: `(Đã thu (trong kỳ) + Thu ngoài (trong kỳ)) - (Chi lương (thực chi nếu có theo dõi) + Chi Wishlist (Thực chi))`. Chỉ số này có thể âm nếu tổng chi thực tế vượt quá tổng thu thực tế.
- **Tiền mặt cuối kỳ (Dòng tiền ước tính):** `Tiền mặt đầu kỳ + Đã thu (trong kỳ) + Thu ngoài (trong kỳ) - Chi lương (thực chi nếu có theo dõi) - Chi Wishlist (Thực chi)`. _Lưu ý: Ước tính này sẽ chính xác nhất nếu hệ thống có theo dõi được số liệu Chi lương thực tế trong kỳ. Khoản 'Thu ngoài' có thể bao gồm cả vốn góp thêm để đảm bảo khả năng chi trả, đặc biệt là chi trả lương đúng hạn._
- **Tiền mặt hiện tại (Tính toán theo dòng tiền):** `Tiền mặt đầu kỳ + Tổng Đã thu lũy kế từ đầu kỳ + Tổng Thu ngoài lũy kế từ đầu kỳ - Tổng Chi lương (thực chi) lũy kế từ đầu kỳ - Tổng Chi Wishlist (thực chi) lũy kế từ đầu kỳ`. _(Cần theo dõi Chi lương và Chi Wishlist thực tế thay vì chỉ số đã phân bổ/trích để con số này chính xác hơn. Khoản 'Thu ngoài' có thể bao gồm cả vốn góp thêm để đảm bảo khả năng chi trả.)_
- _Lưu ý về Scalability: Các báo cáo và Dashboard cần được tối ưu về truy vấn CSDL và có thể cần cơ chế caching/pre-computation để đảm bảo hiệu suất khi dữ liệu lớn._

## Xử lý Trường hợp Ngoại lệ

- **Khách hàng hủy/đổi lịch:** Quy trình cập nhật lịch trên hệ thống, thông báo cho thành viên đã được phân công, và sắp xếp lại (nếu cần).
- **Thành viên báo bận đột xuất:** Quy trình tìm thành viên thay thế khẩn cấp hoặc thông báo cho khách hàng. Có thể cần danh sách thành viên dự phòng.
- **Sự cố thiết bị:** Quy trình báo cáo sự cố, cung cấp thiết bị thay thế (nếu có), và ghi nhận để sửa chữa/bảo trì.

## Kế hoạch Mở rộng (Phase 2)

- **Khách hàng tự đặt lịch:** Phát triển giao diện/module cho phép khách hàng xem lịch trống (của studio hoặc của photographer cụ thể nếu được phép), chọn dịch vụ và tự đặt lịch hẹn trực tiếp trên ứng dụng/website. Quy trình này cần tích hợp với hệ thống xác nhận và phân công hiện có.
- **Nhắn tin nội bộ:** Tích hợp tính năng chat/nhắn tin giữa các thành viên trong nhóm hoặc trên từng dự án cụ thể.
- **Ghi chú dự án:** Cho phép thêm ghi chú, tài liệu đính kèm cho từng lịch trình, khách hàng hoặc dự án.
- **Quản lý Sản phẩm gốc:** Tích hợp chức năng upload, lưu trữ và theo dõi file ảnh/video gốc trực tiếp trên hệ thống.
- **Phân tích đánh giá bằng AI:** Tích hợp AI để tự động phân tích các đánh giá và nhận xét của Manager/Founder về thành viên, đưa ra các insight về hiệu suất.
- **Tích hợp API:** Mở rộng khả năng tích hợp với các hệ thống khác (ví dụ: Lịch Google, phần mềm kế toán bên ngoài nếu cần).
