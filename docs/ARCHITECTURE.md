# Kiến trúc Frontend – Poker Rank

Tài liệu này là **quy ước bắt buộc** cho mọi PR vào `develop`. Mục tiêu: ai mở project cũng biết
code mới đặt ở đâu, style viết thế nào, và UI vẫn đồng bộ khi team mở rộng thêm màn hình.

> Tóm tắt 30 giây
> - Màn hình mới → `src/features/<tên>/`, export page qua `index.js`, khai báo route trong `src/app/router.jsx`.
> - Màu, font, shadow, z-index **chỉ** khai báo trong `src/styles/tokens.css`. Không viết `#hex`/`rgba()` ở chỗ khác.
> - Gọi backend qua `features/<tên>/api/*.js` → `@/shared/api/httpClient`. Component không gọi `fetch`.
> - Code dùng chung cho nhiều feature → `src/shared/`. `shared` không bao giờ import `features`.
> - `npm run lint` sẽ tự chặn các vi phạm trên. Lint đỏ thì không merge.

---

## 1. Cây thư mục

```
src/
├── app/                      # Lắp ráp ứng dụng. KHÔNG chứa UI nghiệp vụ
│   ├── main.jsx              # Entry: import styles/index.css + render <App />
│   ├── App.jsx               # Router + các provider dùng chung (Toast, sau này Auth…)
│   ├── router.jsx            # Bảng route DUY NHẤT của app
│   ├── NotFoundPage.jsx
│   └── ScrollToTop.jsx
│
├── styles/                   # CSS global – nguồn sự thật duy nhất của design system
│   ├── index.css             # Entry, thứ tự: fonts → tokens → base → components → Tailwind
│   ├── tokens.css            # ⭐ Design tokens: màu, font, cỡ chữ, spacing, radius, shadow, z-index
│   ├── base.css              # Mặc định cho thẻ HTML (:root, body, focus ring, icon font)
│   ├── components.css        # Helper global rất nhỏ (vd .icon-filled). Hạn chế thêm vào đây
│   └── fonts.css             # @font-face (file font nằm ở public/fonts)
│
├── shared/                   # Dùng lại được ở MỌI feature, không chứa logic nghiệp vụ riêng
│   ├── api/httpClient.js     # fetch + JSON + Bearer token + X-Dev-User + ApiError
│   ├── config/
│   │   ├── env.js            # Nơi DUY NHẤT đọc import.meta.env
│   │   └── paths.js          # Mọi đường dẫn route (paths.lobby, paths.tableById(id)…)
│   ├── lib/                  # Hàm tiện ích thuần (devIdentity…)
│   ├── layout/MainLayout/    # Header + nav + footer ticker cho các màn hình đã đăng nhập
│   ├── skin/                 # Renderer mặc định cho cosmetic: lá bài, bàn, avatar, dealer
│   └── ui/                   # Component UI chung: Button, Icon, Eyebrow, Toast, PlaceholderScreen
│
└── features/                 # Mỗi thư mục = 1 tính năng, do 1 người/nhóm sở hữu
    ├── auth/  lobby/  ranked/  shop/  events/  mailbox/
    ├── game-table/
    └── admin/match-settings/
```

Ngoài `src/`: `public/` (ảnh, font tĩnh), `tests/` (Playwright e2e), `docs/` (tài liệu).

## 2. Quy tắc phụ thuộc giữa các tầng

```
app  ──▶  features  ──▶  shared  ──▶  styles (tokens)
 │                         ▲
 └─────────────────────────┘
```

| Từ \ được import | `app` | `features/<khác>` | `shared` |
|---|---|---|---|
| `app` | ✅ | ✅ qua `index.js` | ✅ |
| `features/<x>` | ❌ | ✅ **chỉ** `@/features/<y>` (index) | ✅ |
| `shared` | ❌ | ❌ | ✅ |

- Trong cùng một feature: import tương đối (`./components/Board`, `../api/gameApi`).
- Ra ngoài thư mục của mình: dùng alias `@/` (`@/shared/ui`, `@/features/lobby`). Cấm `../../`.
- Chỉ `src/shared/api` được gọi `fetch`. Chỉ `src/shared/config/env.js` được đọc `import.meta.env`.

Tất cả các luật trên được ESLint kiểm tra (`eslint.config.js`). Nếu cần phá luật, nghĩa là code đang đặt
sai chỗ: chuyển phần dùng chung xuống `shared/`, hoặc truyền vào qua props/context.

## 3. Cấu trúc một feature

```
features/ranking/
├── index.js                  # Public API: export page + thứ feature khác được dùng
├── LeaderboardPage.jsx       # Page: chỉ ghép các section, giữ state của trang
├── components/               # Section/component riêng của feature
│   ├── LeaderboardTable.jsx
│   └── LeaderboardTable.module.css   # (nếu component cần CSS riêng)
├── hooks/                    # useLeaderboard.js… (state, gọi api)
├── api/                      # rankingApi.js: hàm gọi backend, KHÔNG có JSX
└── runtime.js                # (tuỳ chọn) React context làm "cổng tích hợp" với feature khác
```

- **Page** mỏng: lấy dữ liệu từ hook, ghép các component. Không viết 300 dòng markup trong page.
- **Component** nhận dữ liệu qua props. Dữ liệu demo đặt thành mảng hằng ở đầu file kèm comment
  `// Demo data until … is connected`, render bằng `.map()`, không copy-paste từng khối.
- **index.js** là cửa duy nhất để bên ngoài dùng feature:
  ```js
  export { default as LeaderboardPage } from './LeaderboardPage'
  ```

## 4. Thêm một màn hình mới

1. Tạo `src/features/<tên>/<Tên>Page.jsx` và `index.js`.
2. Thêm path vào `src/shared/config/paths.js`.
3. Khai báo route trong `src/app/router.jsx`:
   - Màn hình có header/nav chung → đặt **bên trong** `<Route element={<MainLayout />}>`.
     Page khi đó chỉ trả về phần nội dung, không tự vẽ header/footer.
   - Màn hình toàn trang riêng (auth, bàn chơi, admin) → đặt ngoài layout.
4. Điều hướng bằng `<Link to={paths.x}>` hoặc `useNavigate()`; lấy tham số bằng `useParams()`.
   Không dùng `window.location`, không bắt sự kiện theo chữ trên nút.

## 5. Gọi API

```js
// features/ranking/api/rankingApi.js
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

export const fetchLeaderboard = identity =>
  request(`${env.gameApiBaseUrl}/api/ranking/leaderboard`, { errorMessage: 'Unable to load the leaderboard', ...identity })
```

- `identity = { accessToken, devUser, signal }` — token lấy từ provider auth, `devUser` từ `devIdentity()` (chỉ dev).
- Lỗi HTTP ném ra `ApiError` có `status`, `code`, `message` (message lấy từ backend nếu có).
- Biến môi trường mới: thêm vào `shared/config/env.js` kèm comment, đặt tên `VITE_*`.
- Proxy dev cho service mới: thêm vào `vite.config.js` (cần review như mọi thay đổi config dùng chung).

## 6. Hệ thống CSS

### 6.1 Design tokens – `src/styles/tokens.css`

Mọi giá trị thiết kế nằm ở đây, được dùng ở hai nơi:

| Dùng ở | Cách viết |
|---|---|
| Tailwind (JSX) | `bg-surface-container text-on-surface-variant border-border/40 shadow-glow-primary z-header` |
| CSS Module | `color: rgb(var(--color-primary));` · `background: rgb(var(--color-obsidian) / 0.7);` · `font: 600 10px var(--font-display);` · `z-index: var(--z-modal);` |

Màu được lưu dạng **kênh RGB** (`--color-primary: 255 172 231;`) để thêm được độ trong suốt ở cả hai nơi
(`bg-primary/20` hoặc `rgb(var(--color-primary) / 0.2)`). Mã hex nằm trong comment để tham khảo.

Nhóm token chính:

- **Palette Stitch**: `surface-*`, `on-surface*`, `primary*`, `secondary*`, `tertiary*`, `error*`, `outline*`.
- **Palette mở rộng** (bàn chơi, lá bài): `obsidian`, `border`, `border-gold`, `felt*`, `card-*`, `allin`…
- **Typography**: `--font-display` (Sora – tiêu đề, số), `--font-body` (Outfit), thang cỡ chữ `--text-*`
  → Tailwind `font-headline-md text-headline-md`, `font-label-micro text-label-micro`…
- **Spacing**: `space-xs … space-xl`, `gutter`, `margin` → `p-space-md`, `gap-gutter`, `px-margin`.
- **Radius**: `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full`.
- **Shadow**: `shadow-header`, `shadow-footer`, `shadow-raised`, `shadow-popover`, `shadow-dialog`, `shadow-glow-primary`.
- **z-index** (chọn tầng, không tự đặt số): `footer 40 < overlay 50 < header 60 < popover 70 < modal 80 < toast 100`.

**Thêm token mới**: (1) khai báo trong `tokens.css` đúng nhóm, kèm comment; (2) nếu muốn dùng bằng class
Tailwind, thêm tên vào danh sách tương ứng trong `tailwind.config.js` (file này chỉ map tên → biến, không chứa giá trị).

### 6.2 Khi nào dùng Tailwind, khi nào dùng CSS Module

| Tình huống | Dùng |
|---|---|
| Bố cục, spacing, màu nền/chữ của section trong page | Tailwind với class token |
| Component tái sử dụng có biến thể (`shared/ui/*`) | CSS Module + token |
| Hình ảnh phức tạp: pseudo-element, keyframes, grid đặc thù, nhiều media query (bàn chơi) | CSS Module + token |
| Style cho cả app (thẻ HTML, focus ring) | `styles/base.css` – hỏi leader trước khi sửa |

### 6.3 Luật bắt buộc

1. **Không** viết `#hex`, `rgb(…)`/`rgba(…)` với số cứng, tên font, z-index số ngoài `tokens.css`.
   Từ khoá `white`, `transparent`, `currentColor` thì được dùng.
2. **Không** dùng màu mặc định của Tailwind (`emerald-400`, `gray-700`…). Thiếu màu → thêm token.
3. Giá trị arbitrary của Tailwind chỉ dùng cho kích thước/hiệu ứng; nếu có màu thì màu phải lấy từ token:
   `shadow-[0_0_22px_rgb(var(--color-primary)/0.35)]`. Dùng từ 2 chỗ trở lên → tạo token.
4. **Không** tạo file `.css` global mới trong `features/`. Style riêng → `<Component>.module.css` đặt cạnh component.
5. **Không** `!important`; **không** selector theo thẻ ảnh hưởng con cháu kiểu `.page button {}` – style trực tiếp
   lên component hoặc truyền `className`/prop (vd `PlayingCard size="lg"`).
6. Inline `style={{}}` chỉ cho giá trị động (vd `backgroundImage` từ dữ liệu).
7. Icon dùng `<Icon name="settings" filled? className="…" />`, không viết `<span className="material-symbols-outlined">`.
8. Nút trong code mới dùng `<Button variant="primary|secondary">`; nhãn nhỏ màu vàng dùng `<Eyebrow>`;
   thông báo dùng `useToast()`.

### 6.4 Component dùng chung hiện có

| Import | Dùng cho |
|---|---|
| `Button` từ `@/shared/ui` | Nút chuẩn (`primary`, `secondary`), mặc định `type="button"` |
| `Icon` | Icon Material Symbols, tự ẩn với screen reader |
| `Eyebrow` | Nhãn overline vàng phía trên tiêu đề |
| `useToast()` / `ToastProvider` | Thông báo ngắn ở góc màn hình |
| `PlaceholderScreen` | Màn hình "đang xây dựng", 404 |
| `MainLayout` từ `@/shared/layout` | Header + nav + footer, dùng làm layout route |
| `PlayingCard`, `CardBack`, `TableTheme`, `AvatarFrame`, `Dealer`, `VictoryEffect` từ `@/shared/skin` | Cosmetic mặc định của bàn chơi |

Trước khi tự viết component mới, kiểm tra bảng này. Nếu component của bạn hữu ích cho feature khác, chuyển
nó xuống `shared/ui` (không phụ thuộc dữ liệu nghiệp vụ, chỉ nhận props).

## 7. Đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase.jsx`, 1 component export default / file | `PlayerSeat.jsx` |
| CSS của component | trùng tên component | `PlayerSeat.module.css` |
| Hook | `useCamelCase.js` | `useGameSession.js` |
| API, util, config | `camelCase.js` | `gameApi.js`, `paths.js` |
| Thư mục feature | `kebab-case` | `game-table`, `custom-room` |
| Class trong CSS Module | `camelCase` | `.boardSlot`, `.chatSlot` |

## 8. Checklist trước khi tạo PR

- [ ] `npm run lint` và `npm run build` sạch.
- [ ] Không có mã màu mới ngoài `tokens.css`: `git diff develop -- src | grep -E "#[0-9a-fA-F]{3,8}|rgba?\([0-9]"` không ra kết quả.
- [ ] Page mới nằm trong `features/<tên>/`, có `index.js`, route khai báo trong `app/router.jsx`, path trong `paths.js`.
- [ ] Không có file nào > ~150 dòng markup; khối lặp lại đã chuyển thành dữ liệu + `.map()`.
- [ ] Đã kiểm tra giao diện ở desktop và mobile (390px).
- [ ] Thay đổi `vite.config.js`, `app/router.jsx`, `styles/*`, `shared/*` → tag leader/owner review.

## 9. Chuyển nhánh làm theo cấu trúc cũ

Nhánh tạo trước đợt refactor này cần rebase lên `develop` và sửa như sau:

| Kiểu cũ | Kiểu mới |
|---|---|
| `features/x/routes.js` + `resolveXRoute()` sửa trong `App.jsx` | Export page ở `index.js`, thêm `<Route>` trong `app/router.jsx`, path trong `shared/config/paths.js` |
| Nhận prop `navigate` từ App | `useNavigate()` / `<Link>` của `react-router` |
| `features/x/xApi.js` tự viết `fetch`, tự gắn header | `features/x/api/xApi.js` gọi `request()` từ `@/shared/api/httpClient` |
| Đọc `import.meta.env` / `sessionStorage.getItem('poker.game.devUser')` trong feature | `env` từ `@/shared/config/env`, `devIdentity()` từ `@/shared/lib/devIdentity` |
| `features/x/x.css` import global, class `.x-*`, mã hex | `Component.module.css` cạnh component, chỉ dùng biến token |
| Nút `.x-primary` tự style | `<Button variant="primary">` |
| `import … from '../../shared/…'` | `import … from '@/shared/…'` |

## 10. Tích hợp giữa các feature

- Game table nhận auth/profile/chat/reward qua `GameRuntimeContext` (`@/features/game-table`).
  Chi tiết: [game-integration.md](game-integration.md).
- Feature cần dịch vụ từ feature khác thì định nghĩa một context "cổng tích hợp" trong `runtime.js` của mình,
  provider được gắn ở `src/app/App.jsx`. Không import thẳng vào bên trong feature khác.
- Màu sắc/hướng thiết kế tổng thể: [design-system.md](design-system.md). Giá trị thật dùng trong code luôn là `tokens.css`.
