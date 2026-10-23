import { Icon } from '@/shared/ui'

const showcase = [
  { rank: 'A', suit: '♠', icon: 'keyboard_arrow_up', red: false, tilt: '-rotate-12' },
  { rank: 'K', suit: '♥', icon: 'favorite', red: true, tilt: '-rotate-3' },
  { rank: 'Q', suit: '♦', icon: 'diamond', red: true, tilt: 'rotate-3' },
  { rank: 'J', suit: '♣', icon: 'spa', red: false, tilt: 'rotate-12' },
]

function ShowcaseCard({ card }) {
  const ink = card.red ? 'text-error' : 'text-white'
  return <div className={`w-12 h-16 rounded-lg bg-surface-container-lowest border ${card.red ? 'border-primary/40' : 'border-outline-variant/60'} shadow-md flex flex-col justify-between p-1 transform ${card.tilt} hover:-translate-y-1 transition-all`}>
    <span className={`text-xs font-bold ${ink} leading-none`}>{card.rank}{card.suit}</span>
    <Icon name={card.icon} className={`text-base ${ink} mx-auto`} />
    <span className={`text-xs font-bold ${ink} text-right leading-none`}>{card.rank}</span>
  </div>
}

export default function WelcomePanel() {
  return <section className="lg:col-span-6 relative rounded-2xl bg-gradient-to-b from-surface-container-high/80 via-surface-container/70 to-surface-container-low/90 border border-outline-variant/40 p-6 md:p-8 flex flex-col justify-between gap-space-lg shadow-2xl backdrop-blur-xl overflow-hidden">
    <div className="absolute -top-16 -left-16 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
    <div>
      <div className="flex items-start justify-between gap-space-md mb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary-fixed text-xs font-label-action tracking-wider uppercase mb-4">
            <Icon name="stars" className="text-sm" />
            SECURE PLAYER IDENTITY
          </div>
          <h2 className="font-headline-xl text-3xl md:text-4xl font-bold tracking-tight text-white">Poker Reborn</h2>
        </div>
        <div className="hidden sm:flex -space-x-3 pt-2 pr-1 shrink-0" aria-hidden="true">
          {showcase.map(card => <ShowcaseCard key={card.rank} card={card} />)}
        </div>
      </div>
      <p className="text-body-md text-on-surface-variant leading-relaxed mb-5">Step into the premier cyber arena. Compete in high-stakes No-Limit Hold&apos;em &amp; Omaha alongside top global players.</p>

      <div className="relative rounded-xl bg-surface-container-lowest/85 border border-primary/25 p-4 shadow-inner overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-10 pointer-events-none">
          <Icon name="casino" className="text-8xl text-primary" />
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-label-action uppercase tracking-wider text-primary font-bold">Verified Account</span>
          <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-primary-container/40 text-primary-fixed border border-primary/30">Protected Access</span>
        </div>
        <div className="font-headline-lg text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-tertiary-fixed via-tertiary to-tertiary-fixed tracking-tight mb-2">
          ONE ACCOUNT. EVERY TABLE.
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
          <Icon name="verified" className="text-secondary text-sm" />
          Verify your email, restore your session securely, and keep your player identity consistent.
        </p>
      </div>
    </div>

    <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
        </span>
        <span className="font-medium text-on-surface">18,429+ Players Online</span>
      </div>
      <span className="text-tertiary font-semibold flex items-center gap-1">
        <Icon name="local_fire_department" className="text-xs" /> Hot Tables
      </span>
    </div>
  </section>
}
