# Task 2: kiểm tra ảnh avatar trước khi upload

JPG/PNG đã được BE hỗ trợ. Phần này bổ sung kiểm tra ở FE trước khi xin URL S3
để người dùng thấy lý do cụ thể thay vì chờ upload xong mới nhận lỗi avatar.

- Avatar user và avatar preset admin dùng chung kiểm tra: file không rỗng,
  tối đa 2 MiB, PNG/JPEG thực sự và mỗi chiều tối đa 2048 px.
- Đọc chữ ký ảnh và cho browser đọc kích thước; đổi đuôi file không làm một
  định dạng khác trở thành PNG/JPEG. File hỏng hoặc MIME không khớp bị từ chối.
- File thiếu MIME được nhận diện từ dữ liệu. Alias `image/jpg`/`image/pjpeg`
  được chuẩn hóa thành `image/jpeg`. Không resize, nén hoặc đổi byte ảnh.
- Khi không hợp lệ, chưa gọi presign, PUT hay confirm. Giao diện nêu kích thước
  thực tế nếu ảnh vượt giới hạn, và có ghi rõ giới hạn cạnh trong hướng dẫn.
- File hợp lệ giữ luồng gateway GET presign → PUT trực tiếp S3 với
  `credentials: omit` và headers được ký → POST xác nhận key qua gateway.
- Kiểm tra BE hiện có vẫn là quyết định cuối; browser và BE có thể khác khả
  năng giải mã một số ảnh đặc biệt. Chưa có file gốc nên không kết luận ảnh
  trong báo lỗi trước đây chắc chắn sai vì kích thước hay định dạng.

Phạm vi chỉ avatar user/preset. Không sửa upload asset/skin bộ bài của shop,
không đổi giới hạn BE hoặc cấu hình S3. Task 3 bỏ Reference làm riêng.

Kiểm tra UI bằng API/S3 giả lập:

```bash
npx playwright test --config playwright.avatar.config.js
```

Cần dependency FE và Chromium của Playwright. Các test không upload lên S3 thật
hoặc sửa avatar người dùng thật.

Kết quả: 8 test Chromium pass; ESLint các file thay đổi, production build và
`git diff --check` đều pass. Đây là kiểm tra với API/S3 giả lập, chưa xác minh
bằng upload AWS thật hoặc file gốc trong ảnh báo lỗi.
