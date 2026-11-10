import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { AuthStatusScreen, useAuth } from '@/features/auth'
import { ActionDock, HandGuide } from '@/features/game-table'
import { paths } from '@/shared/config/paths'
import { devIdentity } from '@/shared/lib/devIdentity'
import { Button, Icon } from '@/shared/ui'
import { completeTutorial } from './api/tutorialApi'
import CoachPanel from './components/CoachPanel'
import CompleteDialog from './components/CompleteDialog'
import TutorialTable from './components/TutorialTable'
import { useTutorialStatus } from './hooks/useTutorialStatus'
import { steps, YOU } from './script'
import styles from './TutorialPage.module.css'

// A full-screen table like /table, so it sits outside the main layout and checks the session itself.
export default function TutorialPage() {
  const auth = useAuth()
  const location = useLocation()
  const devUser = devIdentity()
  if (!devUser) {
    if (auth.status === 'loading') return <AuthStatusScreen />
    if (auth.status === 'error') return <AuthStatusScreen error={auth.error} onRetry={auth.bootstrap} />
    if (auth.status !== 'authenticated') return <Navigate to={paths.auth} replace state={{ from: location }} />
  }
  return <TutorialSession devUser={devUser} user={auth.user} />
}

function TutorialSession({ devUser, user }) {
  const navigate = useNavigate()
  const [status, setStatus] = useTutorialStatus(devUser)
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const step = steps[index]
  const accountId = devUser || user?.accountId || 'tutorial-you'

  const advance = () => setIndex(value => Math.min(value + 1, steps.length - 1))
  const finish = async () => {
    setBusy(true)
    setError('')
    try {
      const saved = await completeTutorial({ devUser })
      // Completing again returns the first completion, so the status read on arrival tells whether this one paid.
      setDone({ rewarded: status ? !status.completed : null, coins: saved.rewardCoins })
      setStatus(saved)
    } catch (failure) {
      setError(failure.message)
    } finally { setBusy(false) }
  }
  const replay = () => {
    setDone(null)
    setIndex(0)
  }
  const rewardNote = status && (status.completed ? 'ĐÃ NHẬN THƯỞNG' : `THƯỞNG ${status.rewardCoins.toLocaleString()} XU`)

  return <div className={styles.page}>
    <header className={styles.header}>
      <Link to={paths.lobby} className={styles.brand}><span>♠</span> POKER<span>RANK</span></Link>
      <nav className={styles.headerNav}><HandGuide />
        <Button className={styles.compactButton} onClick={() => navigate(paths.lobby)}>Thoát</Button></nav>
    </header>
    <main className={styles.arena}>
      <div className={styles.infoBar}>
        <div className={styles.tableName}><strong>BÀN TẬP</strong><span className={styles.tag}>HƯỚNG DẪN</span><span className={styles.muted}>NO LIMIT HOLD’EM</span></div>
        <div className={styles.tableMeta}>
          {rewardNote && <span className={styles.pill}><Icon name="toll" />{rewardNote}</span>}
          <span className={styles.pill}><Icon name="history" /> VÁN SỐ #{step.dealer === YOU ? 1 : 2}</span>
        </div>
      </div>
      <TutorialTable step={step} accountId={accountId} profile={user?.profile} glow={Boolean(step.expect)} />
      <div className={styles.bottom}>
        <CoachPanel step={step} index={index} total={steps.length} busy={busy} error={error} onContinue={step.final ? finish : advance} />
        <div className={styles.dockSlot}>
          <p className={styles.turnCaption} role="status">{step.expect ? 'Đến lượt bạn. Làm theo hướng dẫn.' : 'Đọc hướng dẫn rồi bấm Tiếp tục.'}</p>
          {/* Only the action the step teaches is legal; keyed by step so the raise slider starts fresh. */}
          <ActionDock key={index} legalActions={step.expect ? [step.expect] : []} callAmount={step.dock?.callAmount ?? 0}
            minRaiseTo={step.dock?.minRaiseTo ?? 0} maxRaiseTo={step.dock?.maxRaiseTo ?? 0} pot={step.pot}
            disabled={!step.expect} onAction={action => { if (action === step.expect) advance() }} />
        </div>
      </div>
    </main>
    <footer className={styles.footer}><span>NO-LIMIT TEXAS HOLD’EM</span><span>Chip ở bàn tập không phải xu thật.</span></footer>
    {done && <CompleteDialog rewarded={done.rewarded} coins={done.coins} onReplay={replay}
      onLobby={() => navigate(paths.lobby)} onRanked={() => navigate(paths.ranked)} />}
  </div>
}
