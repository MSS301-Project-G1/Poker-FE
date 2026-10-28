import { Icon } from '@/shared/ui'

const rings = [{ r: 150, opacity: 0.4, dash: '4 6' }, { r: 110, opacity: 0.6, dash: '2 4' }, { r: 70, opacity: 0.5, dash: '6 6' }]

export default function MatchRadar({ elapsed = '00:00', title = 'SẴN SÀNG TÌM TRẬN', detail = 'Chọn tìm trận để bắt đầu', active = false }) {
  const pulse = active ? ' animate-pulse' : ''
  return <div className="lg:col-span-7 flex flex-col items-center justify-center relative p-space-sm">
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
      <div className={"absolute inset-0 rounded-full bg-secondary-container/15 opacity-30" + (active ? " animate-ping" : "")}></div>
      <div className="absolute inset-4 rounded-full bg-surface-container-high/40 shadow-inner"></div>
      <div className="absolute inset-12 rounded-full bg-surface-container/60"></div>
      <div className="absolute inset-24 rounded-full bg-surface-container-lowest/90 shadow-glow-primary"></div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none text-primary/30" viewBox="0 0 320 320" aria-hidden="true">
        {rings.map(ring => <circle key={ring.r} cx="160" cy="160" fill="none" opacity={ring.opacity} r={ring.r} stroke="currentColor" strokeDasharray={ring.dash} strokeWidth="1" />)}
        <line opacity="0.4" stroke="currentColor" strokeDasharray="2 6" strokeWidth="1" x1="160" x2="160" y1="10" y2="310" />
        <line opacity="0.4" stroke="currentColor" strokeDasharray="2 6" strokeWidth="1" x1="10" x2="310" y1="160" y2="160" />
      </svg>

      <div className={"absolute inset-0 rounded-full overflow-hidden pointer-events-none" + (active ? " animate-[spin_3.5s_linear_infinite]" : " hidden")}>
        <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-gradient-to-tr from-primary/45 via-primary-container/20 to-transparent blur-[1px]"></div>
      </div>

      <div className={"absolute top-16 left-20 w-3 h-3 rounded-full bg-primary text-primary shadow-[0_0_12px_currentColor]" + pulse}></div>
      <div className={"absolute top-28 right-16 w-2.5 h-2.5 rounded-full bg-tertiary text-tertiary shadow-[0_0_10px_currentColor]" + pulse}></div>
      <div className={"absolute bottom-20 left-28 w-3 h-3 rounded-full bg-secondary text-secondary shadow-[0_0_12px_currentColor]" + pulse}></div>
      <div className={"absolute bottom-16 right-24 w-2 h-2 rounded-full bg-primary" + pulse}></div>

      <div className="relative z-10 flex flex-col items-center text-center select-none">
        <span className="font-label-micro text-label-micro uppercase tracking-widest text-secondary-fixed-dim">{title}</span>
        <div className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold my-space-xs">{elapsed}</div>
        <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high/70">
          <span className={"w-2 h-2 rounded-full bg-tertiary" + (active ? " animate-ping" : "")}></span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{active ? 'Đang ghép người chơi' : 'NO-LIMIT HOLD’EM'}</span>
        </div>
      </div>
    </div>

    <div className="mt-space-md flex items-center gap-space-xs">
      <Icon name={active ? "sync" : "info"} className={"text-primary text-sm" + (active ? " animate-spin" : "")} />
      <span className="font-body-sm text-body-sm text-on-surface-variant">{detail}</span>
    </div>
  </div>
}
