import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { Button, PlaceholderScreen } from '@/shared/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return <PlaceholderScreen title="Page not found" message="This page does not exist.">
    <Button variant="primary" onClick={() => navigate(paths.lobby)}>Back to Lobby</Button>
  </PlaceholderScreen>
}
