import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { Button, Icon, useToast } from '@/shared/ui'
import BanUserDialog from './components/BanUserDialog'
import UserBanDetails from './components/UserBanDetails'
import { useAdminUsers } from './hooks/useAdminUsers'
import { dateTime, errorMessage, inputClass } from './format'

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const { user: admin } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState({ keyword: '', banned: '', page: 0 })
  const [attempt, setAttempt] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [editing, setEditing] = useState(null)
  const state = useAdminUsers({ ...filters, attempt })
  const reload = () => setAttempt(value => value + 1)
  const saved = result => {
    setEditing(null)
    setFilters(current => ({ ...current, page: 0 }))
    reload()
    notify(result.banned ? 'Đã khóa tài khoản và thu hồi phiên đang dùng.' : 'Đã gỡ khóa. Người dùng có thể đăng nhập lại.')
  }
  return <div className="w-full px-margin pb-space-lg pt-space-md">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-md">
      <header className="flex flex-wrap items-center justify-between gap-space-md">
        <div><p className="font-label-action text-label-action uppercase tracking-widest text-primary">Quản trị tài khoản</p><h1 className="font-headline-lg text-headline-lg">Người dùng</h1></div>
        <div className="flex gap-3"><Button onClick={reload} disabled={state.loading}><Icon name="refresh" />Tải lại</Button><Button onClick={() => navigate(paths.admin)}>Về quản trị</Button></div>
      </header>
      <p className="text-sm text-on-surface-variant">Khóa toàn tài khoản theo thời hạn hoặc đến khi gỡ. Tài khoản ADMIN được bảo vệ.</p>
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-space-md" onSubmit={event => { event.preventDefault(); setFilters(current => ({ ...current, keyword: keyword.trim(), page: 0 })) }}>
        <div className="min-w-56 flex-1"><label className="mb-1 block text-sm" htmlFor="user-search">Tìm người dùng</label><input id="user-search" className={inputClass} value={keyword} maxLength={100} onChange={event => setKeyword(event.target.value)} placeholder="Email, tên hiển thị hoặc mã người chơi" /></div>
        <div><label className="mb-1 block text-sm" htmlFor="user-ban-filter">Trạng thái khóa</label><select id="user-ban-filter" className={inputClass} value={filters.banned} onChange={event => setFilters(current => ({ ...current, banned: event.target.value, page: 0 }))}>
          <option value="">Tất cả</option><option value="true">Đang khóa</option><option value="false">Không bị khóa</option>
        </select></div><Button variant="primary" type="submit">Tìm kiếm</Button>
      </form>
      <section className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-low" aria-label="Danh sách người dùng">
        {state.loading ? <p role="status" className="p-space-lg">Đang tải người dùng…</p> : state.error ? <div role="alert" className="p-space-lg"><p>{errorMessage(state.error)}</p><Button className="mt-3" onClick={reload}>Thử lại</Button></div> : <>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="bg-surface-container text-on-surface-variant"><tr><th scope="col" className="p-4">Tài khoản</th><th scope="col" className="p-4">Vai trò / xác thực</th><th scope="col" className="p-4">Trạng thái</th><th scope="col" className="p-4">Thao tác</th></tr></thead>
            <tbody>{state.data.content.map(user => <tr key={user.accountId} className="border-t border-outline-variant/30">
              <td className="p-4"><p className="font-semibold">{user.displayName || 'Chưa đặt tên'}</p><p className="break-all text-on-surface-variant">{user.email}</p><p className="text-xs text-outline">{user.playerCode || user.accountId}</p></td>
              <td className="p-4"><p>{user.role}{user.accountId === admin.accountId ? ' (bạn)' : ''}</p><p className="text-xs text-on-surface-variant">{user.emailVerified ? 'Đã xác thực email' : 'Chờ xác thực email'}</p></td>
              <td className="p-4"><p className={user.banned ? 'font-semibold text-error' : 'text-success'}>{user.banned ? 'Đang khóa' : 'Không bị khóa'}</p>{user.banned && <><p className="text-xs text-on-surface-variant">{user.bannedUntil ? `Đến ${dateTime(user.bannedUntil)}` : 'Đến khi quản trị viên gỡ'}</p><p className="mt-1 max-w-xs break-words text-xs">{user.banReason}</p></>}</td>
              <td className="p-4"><div className="flex flex-wrap gap-2"><Button onClick={() => setSelectedId(user.accountId)}>Chi tiết</Button><Button variant={user.banned ? 'primary' : 'danger'} disabled={user.role === 'ADMIN' || user.accountId === admin.accountId} onClick={() => setEditing(user)}>{user.banned ? 'Gỡ khóa' : 'Khóa'}</Button></div></td>
            </tr>)}</tbody>
          </table></div>
          {state.data.content.length === 0 && <p className="p-space-lg text-center text-on-surface-variant">Không tìm thấy tài khoản phù hợp.</p>}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 p-4"><span className="text-sm">{state.data.totalElements} tài khoản · Trang {filters.page + 1}/{Math.max(state.data.totalPages, 1)}</span><div className="flex gap-3"><Button disabled={filters.page === 0} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}>Trước</Button><Button disabled={filters.page + 1 >= state.data.totalPages} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}>Sau</Button></div></footer>
        </>}
      </section>
      {selectedId && <UserBanDetails key={selectedId} accountId={selectedId} attempt={attempt} onClose={() => setSelectedId(null)} />}
      {editing && <BanUserDialog key={editing.accountId} user={editing} onClose={() => setEditing(null)} onSaved={saved} onReload={() => { setEditing(null); reload() }} />}
    </div>
  </div>
}
