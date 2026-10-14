import { Icon } from '@/shared/ui'

function StatTile({ label, value, valueClass, note, noteClass, bar, barWidth }) {
  return <div className="bg-surface-container rounded-lg p-space-sm flex flex-col justify-between">
    <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
    <div className="flex items-baseline gap-space-xs mt-space-xs">
      <span className={`font-headline-md text-headline-md font-bold ${valueClass}`}>{value}</span>
      <span className={noteClass}>{note}</span>
    </div>
    <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-space-xs overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${bar} ${barWidth} rounded-full`}></div>
    </div>
  </div>
}

export default function PerformanceCard() {
  return <div className="lg:col-span-5 flex flex-col gap-space-md">
    <div className="bg-surface-container-low rounded-xl p-space-md relative overflow-hidden shadow-md">
      <div className="absolute -right-4 -bottom-4 text-surface-container-highest opacity-30 select-none">
        <Icon name="local_fire_department" className="text-8xl" />
      </div>
      <div className="flex items-center justify-between mb-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="hotel_class" className="text-tertiary text-lg" />
          <span className="font-label-action text-label-action uppercase text-tertiary">PERSONAL PERFORMANCE</span>
        </div>
        <span className="font-label-micro text-label-micro px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase">Last 20 Hands</span>
      </div>

      <div className="grid grid-cols-2 gap-space-sm mb-space-sm">
        <StatTile label="Current Win Streak" value="4" valueClass="text-primary" note="Consecutive Matches" noteClass="font-body-sm text-body-sm text-on-surface-variant"
          bar="from-primary-container to-primary" barWidth="w-4/5" />
        <StatTile label="Final Table Rate" value="68%" valueClass="text-tertiary" note="(Top 2)" noteClass="font-label-micro text-label-micro text-primary"
          bar="from-tertiary-container to-tertiary" barWidth="w-[68%]" />
      </div>

      <div className="bg-surface-container p-space-sm rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <Icon name="trending_up" className="text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-action text-label-action text-on-surface">Current ELO</span>
            <span className="font-label-micro text-label-micro text-on-surface-variant">+35 ELO to Grandmaster</span>
          </div>
        </div>
        <span className="font-label-numeric-lg text-label-numeric-lg text-secondary-fixed">2,485</span>
      </div>
    </div>

    <div className="bg-surface-container-low/60 rounded-xl p-space-sm flex items-start gap-space-sm">
      <Icon name="info" className="text-primary text-lg mt-0.5" />
      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
        Standard WSOP rules apply. Action time limit: <strong className="text-on-surface">15s</strong> (+ 30s Time Bank).
      </p>
    </div>
  </div>
}
