import { Link } from 'react-router'
import { adminNavigation } from '@/shared/config/adminNavigation'
import { Icon } from '@/shared/ui'

export default function AdminHomePage() {
  return <div className="mx-auto w-full max-w-6xl px-margin py-space-lg">
    <header className="mb-space-lg">
      <h1 className="font-headline-lg text-headline-lg">Admin</h1>
      <p className="mt-2 text-on-surface-variant">Choose what to manage.</p>
    </header>
    <nav aria-label="Admin tools" className="grid gap-space-md md:grid-cols-2 xl:grid-cols-3">
      {adminNavigation.map(item => <Link key={item.path} to={item.path}
        className="group rounded-2xl border border-outline-variant/40 bg-surface-container-low p-space-lg transition-colors hover:border-primary/60 hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <Icon name={item.icon} className="mb-space-md text-3xl text-primary" />
        <h2 className="font-headline-md text-headline-md">{item.label}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{item.description}</p>
        <span className="mt-space-md inline-flex items-center gap-1 text-sm text-primary">Open<Icon name="arrow_forward" className="text-base" /></span>
      </Link>)}
    </nav>
  </div>
}
