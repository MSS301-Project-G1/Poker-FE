import { useState, useEffect } from 'react'
import { getDevUserId, setDevUserId } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'
import { Icon } from '@/shared/ui'

const ACCOUNTS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Tài khoản A (Chính)' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Tài khoản B (Phụ / Test)' },
]

export default function DevAccountSwitcher() {
  const [currentId, setCurrentId] = useState(getDevUserId())

  useEffect(() => {
    const onUserChanged = e => setCurrentId(e.detail)
    window.addEventListener('dev_user_changed', onUserChanged)
    return () => window.removeEventListener('dev_user_changed', onUserChanged)
  }, [])

  if (!env.isDev) return null

  const handleSwitch = id => {
    setDevUserId(id)
    setCurrentId(id)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high/90 border border-outline-variant/40 text-xs shadow-md">
      <div className="flex items-center gap-1 text-tertiary">
        <Icon name="verified_user" className="text-sm" />
        <span className="font-bold tracking-wider uppercase font-mono">Dev Identity:</span>
      </div>
      <div className="flex items-center gap-1.5">
        {ACCOUNTS.map(acc => {
          const active = currentId === acc.id
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => handleSwitch(acc.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                active
                  ? 'bg-primary text-slate-950 font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              {acc.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
