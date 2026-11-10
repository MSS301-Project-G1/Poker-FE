import { Icon } from '@/shared/ui'

const rings = [{ r: 150, opacity: 0.35, dash: '4 6' }, { r: 110, opacity: 0.5, dash: '2 4' }, { r: 70, opacity: 0.45, dash: '6 6' }]

// The sweep only turns while the server is matching, so a moving radar always means "searching".
export default function MatchRadar({ elapsed = '00:00', title = 'Ready to search', detail = 'Choose Find match to start', active = false }) {
  return <div className="lg:col-span-7 flex flex-col items-center justify-center relative p-space-sm lg:p-0">
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-64 lg:h-64 short:w-56 short:h-56 flex items-center justify-center">
      <div className="absolute inset-4 rounded-full bg-surface-container-high/40"></div>
      <div className="absolute inset-12 rounded-full bg-surface-container/60"></div>
      <div className="absolute inset-24 rounded-full bg-surface-container-lowest/90"></div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none text-primary/30" viewBox="0 0 320 320" aria-hidden="true">
        {rings.map(ring => <circle key={ring.r} cx="160" cy="160" fill="none" opacity={ring.opacity} r={ring.r} stroke="currentColor" strokeDasharray={ring.dash} strokeWidth="1" />)}
      </svg>

      {active && <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none animate-[spin_3.5s_linear_infinite] motion-reduce:animate-none">
        <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-gradient-to-tr from-primary/40 via-primary-container/15 to-transparent"></div>
      </div>}

      <div className="relative z-10 flex flex-col items-center text-center select-none">
        <span className="font-label-action text-label-action text-on-surface-variant">{title}</span>
        <div className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold tabular-nums my-space-xs">{elapsed}</div>
        {active && <span className="font-body-sm text-body-sm text-on-surface-variant">Matching players</span>}
      </div>
    </div>

    <div className="mt-space-md lg:mt-space-sm flex items-center gap-space-xs">
      {active && <Icon name="sync" className="text-primary text-sm animate-spin motion-reduce:animate-none" />}
      <span className="font-body-sm text-body-sm text-on-surface-variant">{detail}</span>
    </div>
  </div>
}
