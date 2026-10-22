# BE trả lời câu hỏi của FE

Đối chiếu ngày **19/10/2026** theo code BE và cấu hình local trong repository.
Trả lời cho [FE-response.md](FE-response.md); đi cùng [spec-for-fe.md](spec-for-fe.md).

Tài liệu phân biệt **hợp đồng FE cần dùng**, **code/cấu hình đã có**, và **phần tích hợp chưa hoàn tất**.
Đợt trả lời này chỉ đọc code, kiểm tra Compose và viết tài liệu; không đổi code/config, không chạy container,
không đổi role tài khoản, không gọi AWS/mail/wallet thật. `.env` chỉ được kiểm tra các cờ cấu hình cần thiết,
không đưa mật khẩu/key/secret vào tài liệu.

## 1. HTTP game dùng cookie hay Bearer?

**Chốt cho FE tích hợp: HTTP game đi qua gateway và dùng cookie. Đồng ý tách `getWsToken()` khỏi xác thực REST.**

1. FE gọi `http://localhost:8080/api/game/**` bằng `credentials: "include"` ở local.
   Deploy dùng API origin của gateway/reverse proxy do nhóm triển khai cung cấp; chưa có domain production để điền.
2. REST không gửi `Authorization: Bearer ...`, không tự gửi `X-User-Id`/`X-User-Role`/service key.
   Các thao tác ghi qua gateway vẫn áp dụng CSRF theo HTTP client chung.
3. Gateway verify JWT từ cookie, sau đó chuyển danh tính bằng header nội bộ:

   | Header gateway → game | Nguồn |
   |---|---|
   | `X-User-Id` | `sub` của JWT đã verify |
   | `X-User-Role` | `role` của JWT đã verify |
   | `X-Game-Service-Key` | Cấu hình BE dùng chung giữa gateway và game |
   | `X-Request-Id` | Gateway sinh cho request |

   Gateway loại các header danh tính và `Authorization` do browser tự gửi trước khi tạo header đáng tin cậy.
   Game ở chế độ không phải `dev` kiểm tra service key, lấy ID từ header gateway và kiểm tra nghiệp vụ/quyền của game.
   HTTP game hiện không dùng Bearer JWT do browser gửi để thay thế cơ chế trên.
4. `/api/auth/ws-token` chỉ dùng ở FE để lấy JWT tạm cho **frame STOMP CONNECT**; giữ trong bộ nhớ,
   không lưu localStorage/sessionStorage hoặc đưa vào query URL. Không dùng nó để xây HTTP client REST.

`game-integration.md` mà FE mô tả đang nói REST và STOMP cùng Bearer cần được sửa theo hợp đồng trên.
Trong workspace BE hiện không thấy file đó để sửa/đối chiếu trực tiếp; kết luận REST được xác nhận từ code ingress của game và gateway.
Code `useGameSession` được FE mô tả cần tách đường xác thực REST và STOMP.

**Điều kiện BE còn thiếu trước khi gọi game qua gateway trên cấu hình local hiện tại:**

- `.env` được kiểm tra chưa đặt `GAME_SERVICE_KEY`. Gateway mặc định key rỗng, còn Compose game có fallback riêng.
  Gateway sẽ trả **503 `GATEWAY_UPSTREAM_UNAVAILABLE`** cho route game khi key ở gateway rỗng.
- Người chạy BE cần đặt cùng một giá trị `GAME_SERVICE_KEY` cho gateway và game rồi recreate đúng container.
  Không gửi key này sang FE và không bật chế độ dev bỏ kiểm tra key để thay cho cấu hình tích hợp.
- Game phải chạy, gateway phải tới được `GAME_SERVICE_URL`; đây là điều kiện runtime, chưa được kiểm chứng trong đợt đọc code này.

Nguồn: [TrustedIdentityFilter](../../api-gateway/src/main/java/com/msspoker/apigateway/shared/security/TrustedIdentityFilter.java),
[GatewayRequestFilter](../../api-gateway/src/main/java/com/msspoker/apigateway/shared/security/GatewayRequestFilter.java),
[TrustedIngressFilter](../../game-service/src/main/java/com/msspoker/gameservice/security/TrustedIngressFilter.java).

## 2. URL WebSocket/STOMP, destination và hết hạn token

### 2.1. Hiện có gì chạy được theo code?

| Mục | Trạng thái được xác nhận từ code |
|---|---|
| Endpoint native WebSocket của game | `/ws/game` trên game-service, local mặc định `ws://localhost:8082/ws/game` |
| Gateway proxy WebSocket upgrade `/ws/game` | **Chưa có route WebSocket** trong cấu hình gateway hiện tại |
| URL `/ws/game` qua gateway/nginx ở production | **Chưa triển khai/chốt cấu hình deploy**, không coi `ws://localhost:8080/ws/game` là đã dùng được |
| SockJS | Cấu hình hiện đăng ký native WebSocket, không có `.withSockJS()` |
| Auth STOMP | Header `Authorization: Bearer <JWT>` trong frame CONNECT, xác thực bằng JWKS của auth |

Đồng ý hướng một API origin qua gateway/nginx cho deploy. Tuy nhiên đó còn là việc cấu hình BE/proxy;
không thể trả lời rằng route này đã sẵn sàng. FE nên cấu hình URL WebSocket độc lập với HTTP base URL,
không suy ra bằng cách đổi `http` thành `ws` trên gateway rồi tự nối path.

Nếu cần test game local trước khi có proxy, có thể dùng **kết nối trực tiếp game riêng cho WebSocket**:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_GAME_WS_URL=ws://localhost:8082/ws/game
```

Điều này không đổi hợp đồng HTTP: REST vẫn qua gateway. Kết nối local này cần game đang chạy,
JWKS/issuer/audience của game cấu hình đúng, browser origin được phép và user có quyền với bàn đang truy cập.
Đây là địa chỉ từ cấu hình code, chưa phải kết quả smoke-test kết nối thật trong đợt này.

### 2.2. STOMP headers/destination hiện tại

FE gọi HTTP `/api/auth/ws-token`, sau đó đặt token trong `connectHeaders` của STOMP client.
Không phải cố thêm custom header vào HTTP WebSocket handshake của trình duyệt.

```text
CONNECT header: Authorization: Bearer <result.accessToken>
SUBSCRIBE:      /user/queue/tables/{tableId}
SUBSCRIBE:      /user/queue/game-errors
SEND:           /app/tables/{tableId}/action
SEND:           /app/tables/{tableId}/sync
```

Không có thay đổi destination trong đợt auth/avatar này. Payload game vẫn theo contract của owner game.
`devUser`/`X-Dev-User` là công cụ riêng của profile dev, không phải hợp đồng auth production.

### 2.3. Khi JWT hết hạn

**Hiện chưa có cơ chế chủ động đóng WebSocket đúng lúc access token hết hạn.**
Game verify JWT khi CONNECT; sau đó principal chỉ giữ ID. SEND/SUBSCRIBE kiểm tra principal/destination/membership,
chưa verify lại hạn JWT trên từng frame hoặc có job đóng session theo `exp`.
Vì vậy FE không nên chờ một header “token hết hạn” để chắc chắn được server báo ở connection đang mở.

Nếu CONNECT bị từ chối vì token không hợp lệ/hết hạn:

- Server tạo STOMP frame **ERROR**, `content-type: application/json`, body dạng ErrorResponse có `code: "GAME_UNAUTHORIZED"`.
- Header `message` là thông báo mô tả, không có header chuyên biệt `token-expired`.
- Nhánh từ chối trong interceptor gửi ERROR rồi đóng socket bằng `CloseStatus.POLICY_VIOLATION` (**1008**).
- 1008 còn dùng cho những lỗi policy khác; không coi mọi 1008 là token hết hạn. Đọc mã lỗi body nếu có.
  Lỗi network/handshake cũng có thể không nhận được STOMP ERROR.

FE có thể dùng `expiresAt` từ `/ws-token` để hẹn một lần refresh HTTP/xin token mới và chủ động reconnect có kiểm soát;
không gửi CONNECT bằng token cũ mãi. Lỗi `GAME_UNAUTHORIZED` khi CONNECT có thể thử refresh HTTP → xin ws-token mới
→ reconnect một lần; lỗi thiếu quyền/membership không xử lý bằng refresh liên tục.
Quy tắc server buộc đóng session ở `exp` vẫn cần owner game bổ sung/xác nhận trước khi coi là tính năng production.

### 2.4. Origin handshake local

Game mặc định cho **`http://localhost:5173`**, chưa có `http://localhost:3000`.
Game đọc `GAME_ALLOWED_ORIGINS`, nhưng file `game-service/compose.yml` hiện chưa truyền biến này vào container.
Nếu test FE port 3000 thì owner game cần cập nhật environment runtime/Compose phù hợp; chỉ thêm biến vào `.env`
chưa đủ nếu Compose không chuyển biến đó vào game. Không sửa bằng cách cho phép mọi origin.

Nguồn: [WebSocketConfig](../../game-service/src/main/java/com/msspoker/gameservice/config/WebSocketConfig.java),
[GameChannelInterceptor](../../game-service/src/main/java/com/msspoker/gameservice/websocket/GameChannelInterceptor.java),
[GameSocketSessions](../../game-service/src/main/java/com/msspoker/gameservice/websocket/GameSocketSessions.java),
[GameStompErrorHandler](../../game-service/src/main/java/com/msspoker/gameservice/websocket/GameStompErrorHandler.java),
[GameIdentity](../../game-service/src/main/java/com/msspoker/gameservice/security/GameIdentity.java).

## 3. Response envelope giữa các service

**Gateway giữ nguyên response body từng service, không chuẩn hóa mọi response về `result`.**
Gateway có thể tự trả ErrorResponse cho lỗi route/auth/upstream trước khi tới service; đó là lỗi của gateway,
không làm thay đổi envelope của response thành công từ service.

| Nhóm API đã kiểm tra | Thành công hiện tại | Cách FE đọc |
|---|---|---|
| Auth/profile/avatar/admin avatar/check-in | `{code:"success_request", message, result?, timestamp, path}` | Đọc `result` nếu API có dữ liệu; API void không có field này |
| Game REST ở `GameController` | DTO/raw page trực tiếp, không bọc `result` | Giữ raw body |
| Shop REST dùng `ApiResponse` của shop | `{code:"SHOP_SUCCESS", message, data, timestamp, ...}` | Đọc `data` |
| Wallet REST dùng `ApiResponse` của wallet | `{code:"WALLET_SUCCESS", message, data, timestamp, ...}` | Đọc `data` |
| PUT/GET object trực tiếp từ S3 | Response của S3/bytes ảnh | Không unwrap envelope của BE |

Game active-table trả `Optional<TableCreatedResponse>`; FE cần chấp nhận không có bàn hoạt động,
không ép response đó vào `result`. Shop có endpoint webhook riêng trả map; bảng trên không tuyên bố mọi endpoint
trong mọi service đều có cùng kiểu thành công/lỗi.

**Đồng ý đề xuất FE:** HTTP transport xử lý status/network/cookie, còn adapter API chọn rõ `raw`/`data`/`result` theo endpoint.
Không dùng `body.result ?? body.data ?? body` làm quy tắc toàn cục, vì `result` thiếu/null và field `data` trong raw DTO
có thể có ý nghĩa khác. Với Axios, phân biệt `response.data` là HTTP body với `response.data.data` của envelope shop/wallet.
Mã thành công cũng khác nhau; không so `code === "success_request"` cho mọi service.

**Vướng route cần xử lý ở BE:** gateway hiện có `StripPrefix=2` cho shop và wallet.
Ví dụ `/api/wallet/me` bị chuyển thành `/me`, trong khi WalletController nhận `/api/wallet/me`.
Tương tự shop controller nhận `/api/shop/...` nhưng route đang cắt prefix; các nhóm `/api/inventory`, `/api/payments`,
`/api/admin/shop...` cũng chưa mặc nhiên có route chỉ vì shop đã có controller.
Do đó biết envelope không đồng nghĩa các API này đã gọi được qua gateway. FE không né bằng cách tự gửi header danh tính
hoặc gọi thẳng service như một giải pháp production; cần Khanh/owner thống nhất route và prefix trước.

Nguồn: [GameController](../../game-service/src/main/java/com/msspoker/gameservice/controller/GameController.java),
[shop ApiResponse](../../shop-service/src/main/java/com/msspoker/shopservice/dto/response/ApiResponse.java),
[wallet ApiResponse](../../wallet-service/src/main/java/com/msspoker/walletservice/dto/response/ApiResponse.java),
[gateway routes](../../api-gateway/src/main/resources/application.yml).

## 4. Cấu hình local FE qua gateway

### 4.1. Stack tối thiểu cho auth/profile/avatar/check-in

Chạy từ root `Poker-BE`, sau khi có `.env` của BE:

```bash
docker compose --env-file .env \
  -f docker/compose.infra.yml \
  -f auth-service/compose.yml \
  -f auth-service/compose.dev.yml \
  -f api-gateway/compose.yml \
  -f api-gateway/compose.dev.yml \
  up -d --build api-gateway
```

Không build lại thì bỏ `--build`. Cấu hình này đã kiểm tra render bằng `docker compose ... config --quiet`;
đợt trả lời này không start/rebuild/recreate container.

Stack trên gồm gateway, auth, auth-postgres và RabbitMQ; **không tự chạy game/shop/wallet/Mailpit**.
`api-gateway/compose.dev.yml` giới hạn dependency về auth để không kéo toàn bộ service của nhóm.
`auth-service/compose.dev.yml` mở DB ra local và override RabbitMQ; không chạy file override riêng lẻ.
Đây là lệnh dev auth/gateway, không phải lệnh deploy toàn hệ thống.

| Thành phần | Địa chỉ mặc định với đúng bộ file trên |
|---|---|
| HTTP API | `http://localhost:8080` |
| Swagger | `http://localhost:8080/swagger-ui.html` |
| Auth trực tiếp | `http://localhost:8090` |
| PostgreSQL auth cho IDE | `localhost:54330`, database `auth_db`; credential lấy từ `.env` BE |
| RabbitMQ AMQP trên host | `localhost:${AUTH_RABBIT_PORT}`, fallback của dev là `5673`; đây không phải URL FE cần gọi |
| RabbitMQ management với dev override | `http://localhost:15673` |

Dev override truyền cùng `AUTH_RABBIT_USERNAME`/`AUTH_RABBIT_PASSWORD` vào app và broker;
`.env` có giá trị thì ưu tiên hơn fallback. Broker dùng volume đã tạo vẫn có thể giữ credential cũ;
nếu app không nối được thì BE kiểm tra cấu hình thực tế, không xóa volume tùy tiện để chữa lỗi.

### 4.2. CORS và cookie hiện tại

| Mục | Đã có theo `.env`/default hiện tại? |
|---|---|
| Origin FE `http://localhost:5173` ở gateway/auth | Có |
| Origin FE `http://localhost:3000` ở gateway/auth | **Chưa có** |
| Credentials | Có, gateway/auth cho phép credentialed CORS |
| Cookie Docker local | `SameSite=Lax`, `Secure=false`, HttpOnly |
| Cookie domain | Không set Domain; gắn theo hostname response, dùng thống nhất `localhost` |

Nếu FE chạy 3000, người quản lý BE cần thêm origin đó vào cả hai biến rồi recreate gateway/auth:

```dotenv
AUTH_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://localhost:8090
GATEWAY_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://localhost:8090
```

Đây là hướng dẫn thay đổi khi cần, **chưa chỉnh `.env`** trong đợt trả lời. Dùng 5173 hiện không cần đổi hai biến này.
Không dùng wildcard với cookie. Đổi CORS HTTP không tự đổi allowed origins WebSocket của game hoặc CORS bucket S3.

### 4.3. Health

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8090/actuator/health
```

Đây là endpoint public, response Actuator dạng `{ "status": "UP", ... }`, không bọc `result`.
Health 8080 là gateway; không đảm bảo auth hoặc mọi upstream đều sẵn sàng. Health 8090 kiểm tra auth và các health contributor được bật,
không chứng minh S3/game/wallet đã tích hợp end-to-end. Khi FE thấy login lỗi, xem HTTP response, health riêng và log service liên quan.

## 5. Account ADMIN để test avatar

**Hiện không có seed account/migration tạo ADMIN hoặc API tự nâng quyền. Mỗi người dùng account test của mình.**
Đăng ký → verify OTP tạo account USER + ACTIVE. Nếu cần test admin local, người quản lý BE/DB có thể chạy thủ công
SQL dưới đây trên **DB local của mình**, thay email mẫu bằng account test đã verify:

```sql
UPDATE accounts
SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin-test@example.com'
  AND is_deleted = FALSE
  AND is_email_verified = TRUE
  AND account_status = 'ACTIVE'
RETURNING id, email, role;
```

Không thấy dòng trả về thì kiểm tra email/trạng thái account, không bỏ điều kiện để nâng quyền một account không xác định.
Đây là bước thủ công cho local, không phải luồng sản phẩm và không phải endpoint FE được phép tự thực hiện.
Không có account/mật khẩu fixture chung được công bố trong đợt này.

Sau khi đổi role: **logout rồi login lại** là quy trình test chuẩn, để gateway nhận JWT có role ADMIN.
Refresh thành công cũng phát access JWT mới từ role hiện tại trong DB, nhưng không nên yêu cầu FE dùng refresh như API nâng quyền.
Auth admin avatar còn kiểm tra role hiện tại trong DB; cookie role cũ không đảm bảo được quyền nếu account đã bị hạ role.

SQL trên chưa được thực thi. Credential DB/password account không ghi vào tài liệu.

## 6. Mail đăng ký và quên mật khẩu

### 6.1. Trạng thái cấu hình hiện tại

`.env` được kiểm tra đang chọn **SMTP Gmail port 587, SMTP auth và STARTTLS bật**.
Không kiểm tra thông tin đăng nhập SMTP hoặc gửi thử thư trong đợt này.
Mailpit là service tùy chọn với profile `mailpit`; lệnh stack tối thiểu ở mục 4 **không bật Mailpit**.
Chạy Mailpit đơn thuần không tự chuyển mail Gmail sang Mailpit; cần đổi SMTP host/port của auth.

### 6.2. Khi nhóm muốn test bằng Mailpit

Đặt cấu hình SMTP trong `.env` BE cho môi trường test đó:

```dotenv
AUTH_MAIL_HOST=auth-mailpit
AUTH_MAIL_PORT=1025
AUTH_MAIL_FROM=no-reply@poker.local
AUTH_MAIL_USERNAME=
AUTH_MAIL_PASSWORD=
AUTH_MAIL_SMTP_AUTH=false
AUTH_MAIL_STARTTLS=false
```

Sau đó dùng cùng bộ Compose với profile Mailpit:

```bash
docker compose --env-file .env \
  -f docker/compose.infra.yml \
  -f auth-service/compose.yml \
  -f auth-service/compose.dev.yml \
  -f api-gateway/compose.yml \
  -f api-gateway/compose.dev.yml \
  --profile mailpit up -d --build api-gateway auth-mailpit
```

- Mailpit UI: **`http://localhost:8026`**.
- Auth trong Docker gửi tới **`auth-mailpit:1025`**.
- Với dev override, SMTP cho app Java chạy trên host là **`localhost:1026`**; port 1026 không phải port auth container dùng.
- Nếu chỉ đổi env không đổi code, có thể bỏ `--build`; dùng `up` để Compose nhận environment mới, không chỉ `restart`.

OTP đăng ký và OTP reset đều được gửi qua `AuthMailSender`, nên khi auth thực sự trỏ Mailpit,
cả hai loại thư đều xem trong UI Mailpit. Dùng đúng thư mới nhất/đúng email/đúng flow;
cooldown có thể khiến một lần gọi không tạo mail mới. Không có API FE đọc OTP trực tiếp và không dùng OTP đăng ký để reset.

**Xác nhận cơ chế lỗi:** nếu SMTP đích không dùng được, register/resend trả 503 `AUTH_MAIL_UNAVAILABLE` và rollback thay đổi tương ứng.
Forgot-password vẫn trả HTTP 200 và thông báo chung, không xác nhận mail đã gửi. Nếu Mailpit không chạy nhưng auth vẫn trỏ Gmail hoạt động,
thì việc Mailpit vắng mặt không phải lỗi SMTP của auth.

## 7. S3/avatar đã sẵn sàng cho browser chưa?

**Theo `.env` local được kiểm tra: chưa bật S3 và chưa điền bucket/access key/secret.**
`AUTH_S3_ENABLED` chưa đặt, default là false. Không có bằng chứng bucket CORS/IAM/browser upload thật đã được cấu hình hoặc chạy thử.
Không thể xác nhận môi trường local này đã sẵn sàng test upload S3 thật chỉ vì các test BE đã qua.

- Presigned `uploadUrl` đúng là URL browser PUT **trực tiếp tới S3**, không qua gateway.
- User và admin cùng flow GET presign → PUT S3 → POST xác nhận, nhưng khác endpoint và namespace key.
- FE không có AWS credentials, không tự ký URL. Không đưa secret vào `VITE_*`.

Để mở test browser thật, người quản lý BE/S3 cần:

1. Điền các biến `AUTH_S3_*` trong `.env` theo `.env.example`, bật `AUTH_S3_ENABLED=true` và recreate auth.
2. Kiểm tra bucket đúng region, quyền đọc/ghi/copy/xóa trong prefix avatar.
3. Cấu hình bucket CORS cho đúng origin FE; có PUT/GET (HEAD nếu dùng) và toàn bộ header trong `result.headers` thực tế.
   Nếu dùng 3000 thì origin đó cũng phải được thêm riêng vào bucket, không chỉ CORS gateway/auth.
4. Test một vòng presign → browser PUT → confirm → GET ảnh, cho cả admin preset và user upload.

Khi chưa cấu hình S3 và danh mục còn rỗng, FE có thể test auth/profile không có ảnh, danh sách `[]`, fallback avatar
và lỗi 503 từ xin presign. Nếu DB đã có avatar S3, việc đọc URL cũng cần S3 được bật; không cam kết mọi profile có ảnh vẫn đọc được khi tắt S3.
Không còn avatar SVG mẫu được BE cung cấp.

BE có `S3TestServer` làm HTTP fixture cho các test, **không có storage emulator/MinIO local được expose cho FE** trong Compose.
FE có thể mock UI theo đúng contract trong lúc chờ môi trường S3; cần ghi rõ đó là mock, không coi là kiểm thử upload thật.

Xem [hướng dẫn avatar S3](../auth/avatar-s3.md) và [S3AvatarStorage](../../auth-service/src/main/java/com/msspoker/authservice/shared/infrastructure/storage/S3AvatarStorage.java).

## 8. Wallet và kiểm thử check-in

### 8.1. Đã có API để REWARDED chưa?

**Có trong code:** wallet có `POST /internal/wallet/credit`; auth gọi trực tiếp API này,
không cần chờ một consumer RabbitMQ cho phần thưởng check-in.
Wallet credit hiện có thể khởi tạo ví khi chưa có và trả lại giao dịch cũ theo idempotency key.
Auth kiểm tra response đúng account/số xu/reason/currency/refId/key rồi mới chuyển REWARDED.

Điều này chưa chứng minh stack wallet đang chạy hoặc đã test thật với auth.
Stack ở mục 4 chưa chạy wallet. Trong Docker, auth mặc định gọi `http://wallet-service:8089`;
cần wallet + DB của nó chạy, cùng mạng mà auth truy cập được, và endpoint trả đúng hợp đồng.
Phần này cần phối hợp owner wallet khi dựng stack tích hợp, không yêu cầu FE gọi endpoint `/internal/**`.

### 8.2. Test hai trạng thái một cách xác định

Chỉ thực hiện trên môi trường/account test, không thao tác dữ liệu thật của nhóm:

- **REWARDED:** người chạy BE bật wallet đúng URL/network, dùng account test chưa điểm danh hôm nay,
  POST check-in rồi đọc `rewardStatus`; nếu API ví trả hợp lệ, auth trả 201/REWARDED.
- **PENDING:** ở bản auth dùng riêng cho kiểm thử, trỏ `AUTH_WALLET_BASE_URL` sang địa chỉ chắc chắn không phục vụ ví
  (ví dụ `http://127.0.0.1:1`) và đặt `AUTH_CHECKIN_RETRY_ENABLED=false`, recreate auth, rồi dùng account test chưa điểm danh hôm nay.
  POST trả 201/PENDING. Thay env là bước BE thực hiện, không phải FE tự gắn cờ vào request.
- Để kiểm tra tiến trình retry: giữ nguyên bản ghi PENDING, đưa URL ví về đúng, bật retry và recreate auth.
  Job thử lại cùng key sau backoff; FE đọc calendar để thấy chuyển REWARDED, **không tạo thêm lần điểm danh**.
- Không xóa record/checkin, sửa ngày hệ thống hay gửi credit thủ công từ FE để tạo một màn demo nhận thưởng.
  Mỗi account chỉ có một bản ghi/ngày; dùng account test khác nếu cần một lần POST mới trong cùng ngày.

Các fixture/test BE cho PENDING, timeout và retry đã tồn tại, nhưng không phải một endpoint giả lập FE có thể gọi.
UI mock vẫn có thể bao phủ hai trạng thái trước khi owner wallet bật môi trường thật.

### 8.3. Endpoint số dư cho FE

WalletController hiện định nghĩa **GET `/api/wallet/me`**, nhận `X-User-Id` từ gateway,
trả envelope `WALLET_SUCCESS` với dữ liệu trong `data`:

```json
{
  "code": "WALLET_SUCCESS",
  "message": "Lấy thông tin ví thành công",
  "data": {
    "accountId": "019a9231-0000-7000-8000-000000000001",
    "balance": 50,
    "coinBalance": 50,
    "vipCoinBalance": 0,
    "createdAt": "2026-10-19T03:00:00Z",
    "updatedAt": "2026-10-19T03:00:00Z"
  },
  "timestamp": "2026-10-19T03:00:01Z"
}
```

`balance` hiện là alias của `coinBalance`, **không cộng `balance + coinBalance`**.
Check-in cấp COIN, không phải VIP_COIN. FE đọc `data.coinBalance` khi cập nhật ví xu.
Địa chỉ dự kiến cho FE vẫn là `http://localhost:8080/api/wallet/me` bằng cookie, không tự gửi ID người dùng.
**Nhưng route hiện bị StripPrefix lệch controller như mục 3, nên chưa cam kết URL gateway này chạy được trước khi BE sửa route.**
Endpoint `/internal/wallet/{accountId}/balance` không dành cho browser và bị gateway chặn.

### 8.4. POST timeout / 409

Đồng ý đề xuất FE: POST thành công hoặc 409 thì GET calendar; PENDING vẫn tính đã điểm danh.
POST timeout thì **GET calendar để đối soát trước**, không POST lặp tự động và không tự cộng số dư.
Lưu ý request timeout ở browser có thể vẫn đang được BE xử lý; một lần GET quá sớm chưa thấy record
không đủ để kết luận lần POST chắc chắn thất bại. Cho tải lại có giới hạn/hiển thị đang kiểm tra,
thay vì vòng retry POST không kiểm soát.
Chỉ tải lại số dư ví khi server báo REWARDED và API số dư đã được nối route đúng.

Nguồn: [InternalWalletController](../../wallet-service/src/main/java/com/msspoker/walletservice/controller/InternalWalletController.java),
[WalletServiceImpl](../../wallet-service/src/main/java/com/msspoker/walletservice/service/impl/WalletServiceImpl.java),
[WalletController](../../wallet-service/src/main/java/com/msspoker/walletservice/controller/WalletController.java),
[WalletMapper](../../wallet-service/src/main/java/com/msspoker/walletservice/mapper/WalletMapper.java),
[WalletClient của auth](../../auth-service/src/main/java/com/msspoker/authservice/integration/wallet/WalletClient.java).

## 9. Account ACTIVE nhưng thiếu profile

**Luồng đăng ký bình thường tạo account và profile trong cùng transaction.**
Profile được tạo ngay khi `register`, với account ID và displayName; verify OTP đổi account sang ACTIVE,
không đợi một consumer/service khác mới tạo profile. Account/profile thiếu một bên không phải trạng thái onboarding được thiết kế.

Nếu `/api/auth/me` trả `profile:null`, hoặc GET profile trả 404 `AUTH_NOT_FOUND`, coi là dữ liệu thiếu cần BE kiểm tra/sửa,
có thể do seed/manual edit/dữ liệu cũ. Hiện **chưa có API “tạo lại profile” cho FE**, cũng chưa có cam kết một endpoint tương lai.
FE không gọi PUT profile để tự tạo và không tự tạo avatarId/displayName như dữ liệu thật.

Đồng ý UX: giữ trạng thái đã xác thực nếu `/me` vẫn 200, dùng fallback hiển thị an toàn;
màn profile báo lỗi có requestId và nút tải lại/liên hệ hỗ trợ. Không tự logout chỉ vì thiếu profile.
Fallback UI không được gửi ngược làm profile đã tồn tại.

Về lobby/game:

- FE có thể render lobby với fallback, không coi `profile:null` tự động là chưa login.
- Theo code hiện tại, gateway/game HTTP không có điều kiện “phải có profile” trong bước xác thực danh tính;
  membership, account restrictions và luật vào bàn là kiểm tra nghiệp vụ khác.
- Vì vậy thiếu profile hiện không tự bị ingress game từ chối chỉ vì thiếu profile, **nhưng không có nghĩa user chắc chắn được vào mọi bàn**.
  Tích hợp restrictions/join game vẫn cần owner game xác nhận. Không suy ra quyền chơi từ profile batch hoặc fallback UI.

Nguồn: [AuthServiceImpl.register/currentUser](../../auth-service/src/main/java/com/msspoker/authservice/service/impl/AuthServiceImpl.java),
[ProfileServiceImpl](../../auth-service/src/main/java/com/msspoker/authservice/service/impl/ProfileServiceImpl.java).

## Các việc còn phải phối hợp sau phản hồi này

| Việc | Bên phụ trách | FE có thể làm ngay |
|---|---|---|
| Game REST bỏ Bearer, dùng cookie qua gateway | FE + Khanh cấu hình gateway + owner game | Tách adapter REST/STOMP; BE cần đồng bộ service key |
| WebSocket qua gateway/nginx và chính sách hết hạn session | Khanh/triển khai + owner game | Để WS URL cấu hình riêng; local có thể test trực tiếp game khi đủ điều kiện |
| Route/prefix shop/wallet chưa khớp controller | Khanh phối hợp owner shop/wallet | Dùng adapter envelope riêng, chưa coi API qua gateway đã sẵn sàng |
| Origin 3000 | Người quản lý môi trường BE/S3/game | Dùng 5173 đã cho phép, hoặc đề nghị cấu hình đầy đủ từng tầng |
| Mailpit | Người chạy BE | Chọn SMTP test và dùng profile/lệnh ở mục 6 |
| Account ADMIN local | Người quản lý DB local | Đăng ký/verify account test rồi xin nâng role; login lại |
| Bucket S3 thật | Khanh/người giữ cấu hình AWS | Làm empty/error/mock UI; chưa khẳng định upload thật đã kiểm thử |
| REWARDED và refresh số dư qua gateway | Khanh + owner wallet | Làm 201/PENDING/409 và đối soát calendar, không cộng xu lạc quan |
| Dữ liệu thiếu profile | BE auth/người quản lý DB | Fallback UI và báo requestId, không tự sửa dữ liệu |

Những mục này là phần việc còn thiếu được xác định khi đọc code, **không phải các thay đổi đã được triển khai trong đợt viết trả lời**.
Các điểm FE đã coi là chốt ở cuối `FE-response.md` tiếp tục giữ nguyên.
