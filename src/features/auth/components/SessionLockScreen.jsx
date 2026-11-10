import { Button, Icon } from '@/shared/ui'
import { sessionErrors } from '@/shared/api/tabSession'

// Shown instead of the whole app once another tab or another login owns the account.
// Reloading is a fresh page load: it may take the tab back, or it shows sign-in if the session was replaced.
export default function SessionLockScreen({ error, onSignIn }) {
  const tabReplaced = error?.code === sessionErrors.tabReplaced
  const banned = error?.code === sessionErrors.banned
  return <main className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/50 p-8 text-center shadow-2xl">
      <Icon name={banned ? 'block' : tabReplaced ? 'tab' : 'devices'} className="text-5xl text-primary mb-4" />
      <h1 className="font-headline-lg text-headline-lg">{banned ? 'Tài khoản đã bị khóa' : tabReplaced ? 'Đang dùng ở tab khác' : 'Đã đăng nhập ở nơi khác'}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">{error?.message}</p>
      <Button variant="primary" className="mt-5" onClick={() => window.location.reload()}>
        {banned ? 'Kiểm tra lại' : tabReplaced ? 'Dùng tab này' : 'Đăng nhập lại'}
      </Button>
      {banned && <Button className="mt-3" onClick={onSignIn}>Đăng nhập tài khoản khác</Button>}
    </section>
  </main>
}
