import { Button, Icon } from '@/shared/ui'

export default function AuthStatusScreen({ error, onRetry }) {
  return <main className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/50 p-8 text-center shadow-raised" role={error ? 'alert' : 'status'}>
      {error && <Icon name="cloud_off" className="text-4xl text-error mb-3" />}
      <h1 className="font-headline-md text-headline-md">{error ? 'Unable to restore your session' : 'Checking your session…'}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        {error ? error.message || 'The server is not reachable right now.' : 'This only takes a moment.'}
      </p>
      {error?.requestId && <p className="mt-2 text-xs text-outline">Reference: {error.requestId}</p>}
      {error && <Button variant="primary" className="mt-5" onClick={onRetry}>Try again</Button>}
    </section>
  </main>
}
