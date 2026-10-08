import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import LobbyPage from './pages/LobbyPage'
import RankedPage from './pages/RankedPage'
import { resolveGameTableRoute } from './features/game-table/routes'
import { resolveMatchSettingsRoute } from './features/admin/match-settings/routes'
import ShopPage from './pages/ShopPage'
import './App.css'

const routes = {
  '/': AuthPage,
  '/auth': AuthPage,
  '/lobby': LobbyPage,
  '/ranked': RankedPage,
  '/shop': ShopPage,
}

const routeFromButton = (label, page) => {
  if (page === '/lobby' && /find match/i.test(label)) return '/ranked'
  if (page === '/lobby' && /quick play/i.test(label)) return '/table'
  if (page === '/ranked' && /ready to join table/i.test(label)) return '/table'
  if (page === '/ranked' && /cancel queue/i.test(label)) return '/lobby'
  return null
}

function App() {
  const [page, setPage] = useState(window.location.pathname)
  const [checkInOpen, setCheckInOpen] = useState(true)
  const [notice, setNotice] = useState('')
  const [authMode, setAuthMode] = useState('sign-in')

  useEffect(() => {
    const onPopState = () => setPage(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const navigate = (path) => {
    if (path === page) return
    window.history.pushState({}, '', path)
    setPage(new URL(path, window.location.origin).pathname)
    setNotice('')
    window.scrollTo(0, 0)
  }

  const handleClick = (event) => {
    const link = event.target.closest('a[href]')
    if (link) {
      const url = new URL(link.href, window.location.origin)
      if (url.origin === window.location.origin && url.pathname !== page && url.pathname !== '/') {
        event.preventDefault()
        navigate(url.pathname)
        return
      }
      if (link.getAttribute('href') === '#') event.preventDefault()
    }

    const button = event.target.closest('button')
    if (!button) return
    const label = button.textContent.replace(/\s+/g, ' ').trim()
    const destination = routeFromButton(label, page)
    if (destination) return navigate(destination)

    if (page === '/lobby') {
      if (/7-day check-in/i.test(label)) setCheckInOpen(true)
      if (/^close$|^later$/i.test(label)) setCheckInOpen(false)
      if (/claim now|claim today's reward/i.test(label)) {
        setCheckInOpen(false)
        setNotice('Daily reward claimed in UI demo. Connect a backend to save it.')
      }
    }
    if (page === '/' || page === '/auth') {
      if (/create account/i.test(label)) setAuthMode('register')
      if (/sign in/i.test(label)) setAuthMode('sign-in')
      if (/guest play/i.test(label)) navigate('/lobby')
    }
    if (page === '/shop' && /top up to buy/i.test(label)) {
      setNotice('Skin purchases need a payment backend. This screen is ready for integration.')
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (page === '/' || page === '/auth') navigate('/lobby')
  }

  const featureRoute = resolveGameTableRoute(page) || resolveMatchSettingsRoute(page)
  const Page = featureRoute?.Page || routes[page]
  if (!Page) {
    return (
      <div className="placeholder-screen">
        <h1>{page === '/events' ? 'Events' : page === '/mailbox' ? 'Mailbox' : 'Page not found'}</h1>
        <p>This section is ready for the team to build.</p>
        <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
      </div>
    )
  }

  return (
    <div className={`app-shell ${page === '/lobby' && !checkInOpen ? 'checkin-closed' : ''} ${authMode === 'register' ? 'register-mode' : ''}`} onClick={handleClick} onSubmit={handleSubmit}>
      <Page key={`${page}:${window.location.search}`} mode={authMode} navigate={navigate} {...featureRoute?.props} />
      {notice && <div className="demo-notice" role="status">{notice}</div>}
    </div>
  )
}

export default App
