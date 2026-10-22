import { Navigate, useSearchParams } from 'react-router'
import { paths } from '@/shared/config/paths'

// Compatibility for saved links: matchmaking now opens over the lobby.
export default function RankedPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'NORMAL' ? 'NORMAL' : 'RANK'
  return <Navigate replace to={`${paths.lobby}?match=${mode}`} />
}
