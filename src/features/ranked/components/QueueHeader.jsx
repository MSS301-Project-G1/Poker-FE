import { Icon } from '@/shared/ui'

export default function QueueHeader() {
  return <div className="px-space-md sm:px-space-xl pt-space-lg pb-space-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
    <div className="flex items-center gap-space-md">
      <div className="w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center shadow-glow-primary shrink-0">
        <Icon name="military_tech" filled className="text-primary text-2xl" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-space-xs">
          <span className="px-space-xs py-0.5 rounded bg-tertiary-container/30 font-label-micro text-label-micro text-tertiary uppercase tracking-widest">RANKED SEASON 12 • 6-MAX NO-LIMIT HOLD&apos;EM</span>
        </div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-wide flex items-center gap-space-xs">
          Ranked Match <span className="text-tertiary font-headline-sm text-headline-sm">• Master Tier</span>
          <span className="font-label-micro text-label-micro px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary-fixed">Master Tier</span>
        </h1>
      </div>
    </div>

    <div className="flex items-center gap-space-xs self-stretch sm:self-auto justify-end bg-surface-container-low px-space-md py-space-xs rounded-lg shadow-inner">
      <div className="flex flex-col text-right">
        <span className="font-label-micro text-label-micro text-on-surface-variant uppercase">BLINDS</span>
        <span className="font-label-numeric-md text-label-numeric-md text-tertiary">25,000 / 50,000</span>
      </div>
      <Icon name="toll" className="text-tertiary text-lg ml-space-xs" />
    </div>
  </div>
}
