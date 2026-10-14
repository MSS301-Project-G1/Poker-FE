import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, PlaceholderScreen } from '@/shared/ui'

// Placeholder until the Events design is ready.
export default function EventsPage() {
  const navigate = useNavigate()
  return <PlaceholderScreen title="Events">
    <Button variant="primary" onClick={() => navigate(paths.lobby)}>Back to Lobby</Button>
  </PlaceholderScreen>
}
