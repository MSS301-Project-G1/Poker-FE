import { Icon } from '@/shared/ui'

const tabClass = active => `flex-1 py-2.5 rounded-lg text-xs md:text-sm font-label-action transition-all flex items-center justify-center gap-1.5 ${
  active ? 'text-white bg-primary-container shadow-md' : 'text-on-surface-variant hover:text-white'}`
const labelClass = 'block text-xs font-label-action text-on-surface mb-1.5 tracking-wider uppercase'
const inputClass = 'w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl py-3 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md'
const socialClass = 'py-2.5 px-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-high transition-all flex items-center justify-center gap-1 text-xs font-semibold'

const providers = [
  { title: 'Sign in with Google', label: 'G' },
  { title: 'Sign in with Facebook', label: 'f' },
  { title: 'Sign in with Apple', icon: 'terminal' },
]

/** @param {{ mode: 'sign-in' | 'register', onModeChange: Function, onSubmit: Function, onGuest: Function }} props */
export default function AuthPanel({ mode, onModeChange, onSubmit, onGuest }) {
  const registering = mode === 'register'
  return <section className="lg:col-span-6 rounded-2xl bg-surface-container-low/95 border border-outline-variant/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
    <div>
      <div className="flex items-center rounded-xl bg-surface-container-lowest p-1 mb-6 border border-outline-variant/30">
        <button className={tabClass(!registering)} type="button" onClick={() => onModeChange('sign-in')}>
          <Icon name="login" className="text-sm" />
          Sign In
        </button>
        <button className={tabClass(registering)} type="button" onClick={() => onModeChange('register')}>
          <Icon name="person_add" className="text-sm" />
          Create Account
        </button>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className={labelClass} htmlFor="auth-username">
            USERNAME / EMAIL <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Icon name="account_circle" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none" />
            <input id="auth-username" className={`${inputClass} pl-11 pr-4`} placeholder="player_poker_rank" type="text" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-label-action text-on-surface tracking-wider uppercase" htmlFor="auth-password">
              PASSWORD <span className="text-primary">*</span>
            </label>
            <button className="text-xs font-label-action text-primary hover:text-primary-fixed underline transition-colors" type="button">Forgot password?</button>
          </div>
          <div className="relative">
            <Icon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none" />
            <input id="auth-password" className={`${inputClass} pl-11 pr-11`} placeholder="••••••••" type="password" />
            <button className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-lg focus:outline-none" type="button" aria-label="Show password">visibility</button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary-container focus:ring-0 focus:ring-offset-0 cursor-pointer" type="checkbox" />
            <span className="text-xs text-on-surface-variant font-medium">Remember me</span>
          </label>
          <div className="inline-flex items-center gap-1 text-[11px] text-outline">
            <Icon name="lock" className="text-xs text-success" />
            256-bit SSL Protected
          </div>
        </div>

        {registering && <>
          <div>
            <label className={labelClass} htmlFor="auth-email">EMAIL ADDRESS *</label>
            <input id="auth-email" className="w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className={labelClass} htmlFor="auth-confirm">CONFIRM PASSWORD *</label>
            <input id="auth-confirm" className="w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary" type="password" placeholder="••••••••" required />
          </div>
        </>}

        <div className="pt-2">
          <button className="w-full py-3.5 px-4 rounded-xl font-label-action text-sm tracking-wider uppercase font-bold text-on-primary bg-gradient-to-r from-primary via-primary-fixed to-secondary shadow-[0_0_22px_rgb(var(--color-primary)/0.35)] hover:shadow-[0_0_28px_rgb(var(--color-primary)/0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2" type="submit">
            <span>{registering ? 'CREATE ACCOUNT' : 'ENTER ARENA NOW'}</span>
            <span className="text-base font-bold">→</span>
          </button>
        </div>
      </form>

      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/40"></div>
        </div>
        <span className="relative px-3 bg-surface-container-low text-[11px] font-label-action uppercase tracking-widest text-outline">OR CONTINUE WITH</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {providers.map(provider => <button key={provider.title} className={`${socialClass} hover:border-primary/40 text-white`} title={provider.title} type="button">
          {provider.icon ? <Icon name={provider.icon} className="text-sm" /> : <span className="font-bold text-sm">{provider.label}</span>}
        </button>)}
        <button className={`${socialClass} hover:border-tertiary/40 text-tertiary`} title="Play as Guest" type="button" onClick={onGuest}>
          <Icon name="person" className="text-sm" />
        </button>
      </div>

      <div className="p-2.5 rounded-lg bg-tertiary-container/15 border border-tertiary/25 text-center">
        <span className="text-xs font-medium text-tertiary-fixed">
          Instant Guest Play: <strong className="text-white">+50,000 Free Chips</strong>
        </span>
      </div>
    </div>
  </section>
}
