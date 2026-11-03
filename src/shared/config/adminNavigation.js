import { paths } from './paths'

export const adminNavigation = [
  { path: paths.adminUsers, label: 'Người dùng', icon: 'manage_accounts', description: 'Tìm tài khoản, khóa/gỡ khóa và xem lịch sử xử lý.' },
  { path: paths.adminAvatars, label: 'Avatar', icon: 'account_circle', description: 'Upload và quản lý danh mục avatar có sẵn.' },
  { path: paths.adminShop, label: 'Cửa hàng', icon: 'storefront', description: 'Quản lý sản phẩm, danh mục và gói nạp.' },
  { path: paths.adminSeasons, label: 'Mùa giải', icon: 'leaderboard', description: 'Quản lý mùa giải và phần thưởng xếp hạng.' },
  { path: paths.adminTournaments, label: 'Giải đấu', icon: 'emoji_events', description: 'Quản lý các giải đấu và lịch thi đấu.' },
  { path: paths.adminMatchSettings, label: 'Bàn chơi', icon: 'tune', description: 'Quản lý cấu hình và quy tắc bàn chơi.' },
]
