# Câu hỏi FE cần BE xác nhận

Ngày lập: **19/10/2026**

Tài liệu này chỉ ghi các điểm chưa thể kết luận từ `spec-for-fe.md` và code FE hiện tại. Những contract đã được mô tả rõ trong spec sẽ được FE triển khai đúng như tài liệu, không hỏi lại.

## P0 — Cần chốt trước khi nối auth với game

### 1. HTTP của game dùng cookie hay Bearer token?

Hai tài liệu hiện đang không thống nhất:

- `spec-for-fe.md` quy định các HTTP API đi qua gateway bằng cookie HttpOnly; gateway loại `Authorization`, `X-User-Id` và `X-User-Role` do browser tự gửi. Bearer token từ `/api/auth/ws-token` chỉ dùng trong frame STOMP CONNECT.
- `game-integration.md` lại ghi game REST và STOMP cùng dùng Bearer token. Code `useGameSession` hiện cũng lấy một token rồi dùng cho cả REST và STOMP.

BE vui lòng xác nhận contract production cuối cùng:

1. FE gọi `/api/game/**` qua gateway `:8080` hay gọi thẳng game-service `:8082`?
2. Với game REST, FE chỉ gửi cookie bằng `credentials: "include"`, hay phải gửi `Authorization: Bearer ...`?
3. Nếu đi qua gateway, gateway chuyển danh tính xuống game-service bằng cơ chế/header nội bộ nào?
4. Có đúng `/api/auth/ws-token` chỉ được dùng cho STOMP CONNECT và tuyệt đối không lưu vào `localStorage` không?

**Đề xuất của FE:** mọi HTTP production dùng cookie qua gateway; `/api/auth/ws-token` chỉ cấp token tạm trong bộ nhớ cho STOMP. FE sẽ tách `getWsToken()` khỏi xác thực REST.

**BE trả lời:** _Chưa trả lời._

### 2. WebSocket/STOMP production đi qua URL nào?

`spec-for-fe.md` nói gateway chưa có WebSocket route hoàn chỉnh. BE vui lòng xác nhận:

1. URL production/local chính thức là `ws(s)://<gateway>/ws/game` hay kết nối thẳng game-service?
2. Gateway hiện đã proxy WebSocket upgrade cho `/ws/game` chưa?
3. STOMP vẫn gửi `Authorization: Bearer <ws-token>` trong CONNECT và giữ nguyên các destination hiện có chứ?
4. Khi token hết hạn, server đóng connection bằng lỗi/header nào để FE refresh HTTP, xin lại ws-token rồi reconnect?
5. Origin nào đang được phép cho handshake local (`http://localhost:5173`, `http://localhost:3000`)?

**Đề xuất của FE:** ưu tiên một origin qua gateway/nginx để tránh thêm contract CORS và cookie cho kết nối trực tiếp service.

**BE trả lời:** _Chưa trả lời._

### 3. Response envelope có thống nhất giữa các microservice không?

Auth trả `{ code, message, result, ... }`, trong khi code FE hiện tại của game/shop/wallet có nơi đang dùng raw body hoặc `{ data: ... }`.

BE vui lòng cho biết:

1. Gateway có giữ nguyên response từng service hay chuẩn hóa tất cả về một envelope?
2. Game REST trả raw DTO hay nằm trong `result`?
3. Shop/wallet hiện trả `data`, `result`, hay raw DTO?

**Đề xuất của FE:** trước khi toàn bộ service thống nhất, HTTP client hỗ trợ response mode theo từng API và không tự unwrap toàn cục; riêng auth/profile/check-in sẽ unwrap `result` theo `spec-for-fe.md`.

**BE trả lời:** _Chưa trả lời._

## P1 — Cần để kiểm thử tích hợp đầy đủ

### 4. Cấu hình local chuẩn để FE test qua gateway là gì?

BE vui lòng cung cấp hoặc xác nhận:

- Lệnh Compose/profile cần chạy cho gateway, auth, PostgreSQL, RabbitMQ và Mailpit.
- Base URL chính thức cho FE local, dự kiến `http://localhost:8080`.
- Gateway và auth đã allow cả `http://localhost:5173` và `http://localhost:3000` với credentials chưa.
- Cookie local đang dùng `SameSite=Lax`, `Secure=false`, đúng hostname `localhost` chứ.
- Có health endpoint nào FE nên dùng để phân biệt gateway/auth chưa sẵn sàng không.

Không dùng lẫn `localhost` và `127.0.0.1` trong hướng dẫn test vì sẽ làm sai cookie/CORS.

**BE trả lời:** _Chưa trả lời._

### 5. Cách tạo account ADMIN để test admin avatar

Đăng ký bình thường chỉ tạo USER và chưa có API nâng quyền. BE vui lòng xác nhận cách chuẩn để có ADMIN trong local/test:

- Seed/migration/dev command nào tạo hoặc đổi role?
- Sau khi đổi role có bắt buộc logout/login lại để JWT mới chứa role ADMIN không?
- Có account fixture dùng chung hay mỗi người tự tạo account rồi cập nhật DB?

Không ghi mật khẩu hoặc secret thật vào file này. Nếu cần credential test, dùng `.env`/kênh nội bộ phù hợp.

**BE trả lời:** _Chưa trả lời._

### 6. Mail local cho đăng ký và quên mật khẩu

BE vui lòng xác nhận:

- Mailpit local có được bật trong stack chuẩn không, và UI/SMTP chạy ở port nào?
- OTP đăng ký và OTP reset-password có thể xem ổn định trong Mailpit khi test không?
- Nếu mail service chưa chạy, register/resend trả `AUTH_MAIL_UNAVAILABLE`, còn forgot-password vẫn trả thông báo chung như spec, đúng không?

**BE trả lời:** _Chưa trả lời._

### 7. S3/avatar đã sẵn sàng cho browser test chưa?

BE vui lòng xác nhận môi trường FE nên dùng:

- `AUTH_S3_ENABLED` đã bật ở local/integration chưa?
- Bucket CORS đã allow origin FE, method PUT/GET và toàn bộ header có thể xuất hiện trong presign response chưa?
- Presigned upload URL có truy cập trực tiếp từ browser, không qua gateway, đúng không?
- Nếu S3 chưa sẵn sàng, FE nên chỉ kiểm thử error/empty state hay có fixture storage local nào?

FE sẽ không đưa AWS key/secret hoặc bucket credential vào biến `VITE_*`.

**BE trả lời:** _Chưa trả lời._

### 8. Trạng thái wallet khi test check-in

Check-in thuộc auth-service nhưng kết quả thưởng phụ thuộc wallet-service. BE/owner wallet vui lòng xác nhận:

1. Stack tích hợp hiện đã có wallet consumer/API để check-in có thể thành `REWARDED` chưa?
2. Có cách an toàn, xác định trước để test cả hai nhánh `REWARDED` và `PENDING` không?
3. Sau `REWARDED`, endpoint chính thức nào để FE tải lại số dư ví?
4. Nếu POST check-in timeout, chỉ GET lại calendar để đối soát, không POST lặp tự động, đúng không?

**Đề xuất của FE:** check-in thành công hoặc 409 đều tải lại calendar; chỉ refresh wallet khi server báo `REWARDED`; không cộng số dư lạc quan ở client.

**BE trả lời:** _Chưa trả lời._

## P2 — Edge case cần thống nhất UX

### 9. Account ACTIVE nhưng thiếu profile phải xử lý thế nào?

Theo spec, `/api/auth/me` có thể trả `profile: null`, còn `GET /api/profiles/me` có thể trả `AUTH_NOT_FOUND`; FE cũng không được tự PUT để tạo profile.

BE vui lòng xác nhận:

- Register/verify thành công có bảo đảm profile luôn được tạo trong cùng transaction/flow không?
- Trường hợp profile thiếu là lỗi dữ liệu cần FE hiện màn retry/support, hay sẽ có endpoint khởi tạo profile trong tương lai?
- User thiếu profile có vẫn được vào lobby/game không?

**Đề xuất của FE:** không tự chế tạo profile; dùng display name/avatar fallback an toàn và hiện lỗi có `requestId` ở màn profile.

**BE trả lời:** _Chưa trả lời._

## Các điểm FE đã coi là chốt, không cần BE trả lời lại

- Auth/profile/check-in HTTP dùng cookie HttpOnly và CSRF theo bảng trong `spec-for-fe.md`.
- FE không lưu access/refresh token trong localStorage và không tự đọc cookie HttpOnly.
- Verify OTP xong quay về login, không tự đăng nhập.
- Profile update là PUT toàn bộ form; FE phải giữ các field hiện tại để tránh vô tình xóa dữ liệu.
- Avatar upload là PUT file trực tiếp lên presigned S3 URL, sau đó mới gọi API confirm.
- Check-in hiện không có streak reward, makeup hoặc thưởng tăng theo chuỗi; ngày nghiệp vụ theo `Asia/Ho_Chi_Minh`.
- `PENDING` vẫn là đã điểm danh và FE không tự cộng xu.
- Chưa triển khai social login, guest login, remember-me tùy chọn, logout-all, quản lý thiết bị, first-login reward, quản lý user/report/penalty hoặc wallet balance trong phạm vi auth-service hiện tại.
