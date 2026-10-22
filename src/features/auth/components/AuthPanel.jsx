import { Icon } from '@/shared/ui'
import RegisterForm from './RegisterForm'
import SignInForm from './SignInForm'
import VerifyOtpForm from './VerifyOtpForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'

const tabClass = active => `flex-1 py-2.5 rounded-lg text-xs md:text-sm font-label-action transition-all flex items-center justify-center gap-1.5 ${
  active ? 'text-white bg-primary-container shadow-md' : 'text-on-surface-variant hover:text-white'}`

export default function AuthPanel({ mode, pending, error, verification, recovery, onModeChange, onLogin, onRegister,
  onVerify, onResend, onForgotPassword, onResetPassword, onResendRecovery }) {
  const verifying = mode === 'verify'
  const recovering = mode === 'forgot' || mode === 'reset'
  return <section className="lg:col-span-6 rounded-2xl bg-surface-container-low/95 border border-outline-variant/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
    <div>
      {!verifying && !recovering && <div className="flex items-center rounded-xl bg-surface-container-lowest p-1 mb-5 border border-outline-variant/30">
        <button className={tabClass(mode === 'sign-in')} type="button" onClick={() => onModeChange('sign-in')} disabled={pending}>
          <Icon name="login" className="text-sm" /> Sign In
        </button>
        <button className={tabClass(mode === 'register')} type="button" onClick={() => onModeChange('register')} disabled={pending}>
          <Icon name="person_add" className="text-sm" /> Create Account
        </button>
      </div>}

      {verifying && <div className="mb-5">
        <p className="text-xs font-label-action uppercase tracking-widest text-primary">One final step</p>
        <h2 className="mt-1 font-headline-lg text-headline-lg text-white">Verify your email</h2>
      </div>}

      {recovering && <div className="mb-5">
        <p className="text-xs font-label-action uppercase tracking-widest text-primary">Account recovery</p>
        <h2 className="mt-1 font-headline-lg text-headline-lg text-white">
          {mode === 'forgot' ? 'Recover your account' : 'Set a new password'}
        </h2>
      </div>}

      {error && <div className="mb-4 rounded-xl border border-error/35 bg-error-container/20 px-3 py-2.5 text-sm text-on-error-container" role="alert">
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

      <div className="mt-5 p-2.5 rounded-lg bg-tertiary-container/15 border border-tertiary/25 text-center">
        <span className="text-xs font-medium text-tertiary-fixed inline-flex items-center gap-1.5">
          <Icon name="lock" className="text-sm" /> Secure session protected by HTTP-only cookies
        </span>
      </div>
    </div>
  </section>
}
