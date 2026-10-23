import { Button, Icon } from '@/shared/ui'
import { Link } from 'react-router'
import { paths } from '@/shared/config/paths'

export default function AuthStatusScreen({ error, onRetry }) {
  return <main className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/50 p-8 text-center shadow-2xl">
      <Icon name={error ? 'cloud_off' : 'shield_lock'} className={`text-5xl ${error ? 'text-error' : 'text-primary'} mb-4`} />
      <h1 className="font-headline-lg text-headline-lg">{error ? 'Unable to restore your session' : 'Securing your session…'}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        {error ? error.message || 'The API gateway is not available.' : 'Checking your account securely through the gateway.'}
      </p>
      {error?.requestId && <p className="mt-2 text-xs text-outline">Reference: {error.requestId}</p>}
      {error && <Button variant="primary" className="mt-5" onClick={onRetry}>Try again</Button>}
      <Link className="mt-space-lg block text-primary underline underline-offset-4" to={paths.demo}>Chơi thử 1 người với bot</Link>
    </section>
  </main>
}
