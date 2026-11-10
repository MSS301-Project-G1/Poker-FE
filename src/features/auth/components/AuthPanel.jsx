import RegisterForm from './RegisterForm'
import SignInForm from './SignInForm'
import VerifyOtpForm from './VerifyOtpForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'

const tabClass = active => `flex-1 py-2 rounded-lg text-sm font-label-action transition-colors ${
  active ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`

export default function AuthPanel({ mode, pending, error, verification, recovery, onModeChange, onLogin, onRegister,
  onVerify, onResend, onForgotPassword, onResetPassword, onResendRecovery }) {
  const verifying = mode === 'verify'
  const recovering = mode === 'forgot' || mode === 'reset'
  return <section className="w-full rounded-2xl bg-surface-container-low border border-outline-variant/50 p-6 sm:p-8 shadow-raised">
    <div>
      {!verifying && !recovering && <div className="flex items-center rounded-xl bg-surface-container-lowest p-1 mb-6" role="group" aria-label="Sign in or create an account">
        <button className={tabClass(mode === 'sign-in')} type="button" aria-pressed={mode === 'sign-in'} onClick={() => onModeChange('sign-in')} disabled={pending}>Sign in</button>
        <button className={tabClass(mode === 'register')} type="button" aria-pressed={mode === 'register'} onClick={() => onModeChange('register')} disabled={pending}>Create account</button>
      </div>}

      {verifying && <h2 className="mb-5 font-headline-md text-headline-md text-on-surface">Verify your email</h2>}

      {recovering && <h2 className="mb-5 font-headline-md text-headline-md text-on-surface">
        {mode === 'forgot' ? 'Recover your account' : 'Set a new password'}
      </h2>}

      {error && <div className="mb-4 rounded-lg border border-error/35 bg-error-container/20 px-3 py-2.5 text-sm text-on-error-container" role="alert">
        {error}
      </div>}

      {mode === 'sign-in' && <SignInForm pending={pending} onSubmit={onLogin} onForgotPassword={() => onModeChange('forgot')} />}
      {mode === 'register' && <RegisterForm pending={pending} onSubmit={onRegister} />}
      {verifying && <VerifyOtpForm email={verification.email} otpExpiresAt={verification.otpExpiresAt}
        resendAvailableAt={verification.resendAvailableAt} pending={pending} onSubmit={onVerify} onResend={onResend}
        onBack={() => onModeChange('sign-in')} />}
      {mode === 'forgot' && <ForgotPasswordForm pending={pending} initialEmail={recovery.email}
        onSubmit={onForgotPassword} onBack={() => onModeChange('sign-in')} />}
      {mode === 'reset' && <ResetPasswordForm pending={pending} email={recovery.email}
        resendAvailableAt={recovery.resendAvailableAt} onSubmit={onResetPassword} onResend={onResendRecovery}
        onBack={() => onModeChange('sign-in')} />}
    </div>
  </section>
}
