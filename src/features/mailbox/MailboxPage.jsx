import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, PlaceholderScreen } from '@/shared/ui'

// Placeholder until the Mailbox design is ready.
export default function MailboxPage() {
  const navigate = useNavigate()
  return <PlaceholderScreen title="Mailbox">
    <Button variant="primary" onClick={() => navigate(paths.lobby)}>Back to Lobby</Button>
  </PlaceholderScreen>
}
