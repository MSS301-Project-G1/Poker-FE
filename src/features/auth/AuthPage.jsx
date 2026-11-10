import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { paths } from '@/shared/config/paths'
import { useToast } from '@/shared/ui'
import { useAuth } from './useAuth'
import { forgotPassword, registerAccount, resendRegistrationOtp, resetPassword, verifyRegistrationOtp } from './api/authApi'
import AuthPanel from './components/AuthPanel'
import AuthStatusScreen from './components/AuthStatusScreen'
import WelcomePanel from './components/WelcomePanel'

function messageOf(error) {
  const message = error?.message || 'Something went wrong. Please try again.'
  return error?.requestId ? `${message} Reference: ${error.requestId}` : message
}

export default function AuthPage() {
  const auth = useAuth()
  const location = useLocation()
  const notify = useToast()
  const [mode, setMode] = useState('sign-in')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [verification, setVerification] = useState({ email: '', otpExpiresAt: null, resendAvailableAt: null })
  const [recovery, setRecovery] = useState({ email: '', resendAvailableAt: null })
  const from = location.state?.from
  const resolveDestination = user => {
    const adminPath = from?.pathname === paths.admin || from?.pathname?.startsWith(`${paths.admin}/`)
    if (user?.role === 'ADMIN') return adminPath ? `${from.pathname}${from.search || ''}` : paths.admin
    if (from?.pathname && !adminPath) return `${from.pathname}${from.search || ''}`
    return paths.lobby
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

  // On success the provider opens a running table itself; otherwise the authenticated redirect above applies.
  const login = values => run(async () => {
    try {
      await auth.login(values)
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

  // One soft pool of felt light behind the hand; the rest of the page stays the app's deep violet.
  return <div className="bg-background text-on-surface min-h-screen font-body-md bg-[radial-gradient(60rem_40rem_at_20%_35%,rgb(var(--color-felt)/0.45),transparent_70%)]">
    <main className="min-h-screen w-full max-w-6xl mx-auto px-margin-mobile sm:px-margin py-space-xl grid content-center grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] gap-space-xl lg:gap-20 items-center">
      <WelcomePanel />
      <AuthPanel mode={mode} pending={pending} error={error} verification={verification} recovery={recovery}
        onModeChange={changeMode} onLogin={login} onRegister={register} onVerify={verify} onResend={resend}
        onForgotPassword={requestRecovery} onResetPassword={completeRecovery} onResendRecovery={resendRecovery} />
    </main>
  </div>
}
