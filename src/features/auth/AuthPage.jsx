import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Icon } from '@/shared/ui'
import AuthHeader from './components/AuthHeader'
import AuthPanel from './components/AuthPanel'
import WelcomePanel from './components/WelcomePanel'

const trustBadges = [
  { icon: 'shield', color: 'text-success', label: 'Bank-Grade Encryption' },
  { icon: 'verified_user', color: 'text-tertiary', label: 'Fair Play RNG Certified' },
  { icon: 'support_agent', color: 'text-primary', label: '24/7 Player Support' },
]

// Sign-in and registration are UI only until the auth service is connected: both enter the lobby.
export default function AuthPage() {
  const [mode, setMode] = useState('sign-in')
  const navigate = useNavigate()
  const enterLobby = event => {
    event.preventDefault()
    navigate(paths.lobby)
  }

  return <div className="bg-background text-on-surface min-h-screen relative overflow-x-hidden font-body-md selection:bg-primary-container selection:text-white">
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[48rem] h-[28rem] bg-primary-container/20 rounded-full blur-[130px]"></div>
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-secondary-container/25 rounded-full blur-[110px]"></div>
      <div className="absolute -bottom-20 -right-20 w-[32rem] h-[32rem] bg-tertiary-container/15 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/10 via-background to-surface-container-lowest"></div>
    </div>

    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 md:py-12 relative z-10 max-w-7xl mx-auto">
      <AuthHeader />
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
        <WelcomePanel />
        <AuthPanel mode={mode} onModeChange={setMode} onSubmit={enterLobby} onGuest={enterLobby} />
      </main>
      <footer className="w-full max-w-4xl mt-8 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs text-on-surface-variant">
        {trustBadges.map(badge => <div key={badge.label} className="inline-flex items-center gap-1.5">
          <Icon name={badge.icon} className={`${badge.color} text-sm`} />
          <span>{badge.label}</span>
        </div>)}
      </footer>
    </div>
  </div>
}
