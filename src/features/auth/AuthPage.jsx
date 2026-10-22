import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon, useToast } from '@/shared/ui'
import { useAuth } from './useAuth'
import { forgotPassword, registerAccount, resendRegistrationOtp, resetPassword, verifyRegistrationOtp } from './api/authApi'
import AuthHeader from './components/AuthHeader'
import AuthPanel from './components/AuthPanel'
import AuthStatusScreen from './components/AuthStatusScreen'
import WelcomePanel from './components/WelcomePanel'

const trustBadges = [
  { icon: 'shield', color: 'text-success', label: 'Secure Account Access' },
  { icon: 'verified_user', color: 'text-tertiary', label: 'Verified Email Protection' },
  { icon: 'support_agent', color: 'text-primary', label: 'Request ID Support' },
]

function messageOf(error) {
  const message = error?.message || 'Something went wrong. Please try again.'
  return error?.requestId ? `${message} Reference: ${error.requestId}` : message
}

export default function AuthPage() {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState('sign-in')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [verification, setVerification] = useState({ email: '', otpExpiresAt: null, resendAvailableAt: null })
  const [recovery, setRecovery] = useState({ email: '', resendAvailableAt: null })
  const from = location.state?.from
  const resolveDestination = user => {
    if (from?.pathname) return `${from.pathname}${from.search || ''}`
    return user?.role === 'ADMIN' ? paths.adminShop : paths.lobby
  }
  const destination = resolveDestination(auth.user)

  if (auth.status === 'loading') return <AuthStatusScreen />
  if (auth.status === 'error') return <AuthStatusScreen error={auth.error} onRetry={auth.bootstrap} />
  if (auth.status === 'authenticated') return <Navigate to={destination} replace />

  const changeMode = nextMode => {
    setError('')
    setMode(nextMode)
  }

  const run = async action => {
    setPending(true)
    setError('')
    try { await action() } catch (failure) { setError(messageOf(failure)); throw failure } finally { setPending(false) }
  }

  const login = values => run(async () => {
    try {
      const user = await auth.login(values)
      navigate(resolveDestination(user), { replace: true })
    } catch (failure) {
      if (failure.code === 'AUTH_EMAIL_VERIFICATION_PENDING') {
        setVerification({ email: values.email, otpExpiresAt: null, resendAvailableAt: null })
        setMode('verify')
      }
      throw failure
    }
  }).catch(() => {})

  const register = values => run(async () => {
    try {
      const result = await registerAccount(values)
      setVerification(result)
      setMode('verify')
      notify('Verification code sent. Check your email.')
    } catch (failure) {
      if (failure.code === 'AUTH_EMAIL_VERIFICATION_PENDING') {
        setVerification({ email: values.email, otpExpiresAt: null, resendAvailableAt: null })
        setMode('verify')
      }
      throw failure
    }
  }).catch(() => {})

  const verify = values => run(async () => {
    try {
      await verifyRegistrationOtp(values)
      setMode('sign-in')
      notify('Email verified. You can now sign in.')
    } catch (failure) {
      if (failure.code === 'AUTH_EMAIL_ALREADY_VERIFIED') {
        setMode('sign-in')
        notify('This email is already verified. Please sign in.')
        return
      }
      throw failure
    }
  }).catch(() => {})

  const resend = () => run(async () => {
    try {
      const result = await resendRegistrationOtp({ email: verification.email })
      setVerification(result)
      notify('A new verification code was sent.')
    } catch (failure) {
      if (failure.code === 'AUTH_EMAIL_ALREADY_VERIFIED') {
        setMode('sign-in')
        notify('This email is already verified. Please sign in.')
        return
      }
      throw failure
    }
  }).catch(() => {})

  const requestRecovery = values => run(async () => {
    await forgotPassword(values)
    setRecovery({ email: values.email, resendAvailableAt: Date.now() + 60_000 })
    setMode('reset')
    notify('If the account is eligible, a recovery code has been sent.')
  }).catch(() => {})

  const resendRecovery = () => run(async () => {
    await forgotPassword({ email: recovery.email })
    setRecovery(current => ({ ...current, resendAvailableAt: Date.now() + 60_000 }))
    notify('If the account is eligible, a new recovery code has been sent.')
  }).catch(() => {})

  const completeRecovery = values => run(async () => {
    await resetPassword(values)
    setMode('sign-in')
    setRecovery({ email: '', resendAvailableAt: null })
    notify('Password reset. Sign in with your new password.')
  }).catch(() => {})

  return <div className="bg-background text-on-surface min-h-screen relative overflow-x-hidden font-body-md selection:bg-primary-container selection:text-white">
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[48rem] h-[28rem] bg-primary-container/20 rounded-full blur-[130px]"></div>
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-secondary-container/25 rounded-full blur-[110px]"></div>
      <div className="absolute -bottom-20 -right-20 w-[32rem] h-[32rem] bg-tertiary-container/15 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/10 via-background to-surface-container-lowest"></div>
    </div>
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 md:py-12 relative z-10 max-w-7xl mx-auto">
      <AuthHeader />
      <Link to={paths.demo} className="my-space-md inline-flex items-center gap-space-sm rounded-xl border border-primary/40 bg-primary-container/20 px-space-lg py-space-gutter-mobile text-primary font-label-action text-label-action"><Icon name="smart_toy" />Chơi thử 1 người với bot · Không cần tài khoản</Link>
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
        <WelcomePanel />
        <AuthPanel mode={mode} pending={pending} error={error} verification={verification} recovery={recovery}
          onModeChange={changeMode} onLogin={login} onRegister={register} onVerify={verify} onResend={resend}
          onForgotPassword={requestRecovery} onResetPassword={completeRecovery} onResendRecovery={resendRecovery} />
      </main>
      <footer className="w-full max-w-4xl mt-8 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs text-on-surface-variant">
        {trustBadges.map(badge => <div key={badge.label} className="inline-flex items-center gap-1.5">
          <Icon name={badge.icon} className={`${badge.color} text-sm`} /><span>{badge.label}</span>
        </div>)}
      </footer>
    </div>
  </div>
}
