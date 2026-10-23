import { Icon } from '@/shared/ui'

export default function QueueActions({ onCancel, onReady }) {
  return <div className="px-space-md sm:px-space-xl py-space-md bg-surface-container-low flex flex-col-reverse sm:flex-row items-center justify-between gap-space-md">
    <div className="flex items-center gap-space-xs text-on-surface-variant">
      <Icon name="lock" className="text-base" />
      <span className="font-body-sm text-body-sm">Table protected by AI RNG Certified Anti-Cheat</span>
    </div>
    <div className="flex items-center gap-space-md w-full sm:w-auto">
      <button type="button" onClick={onCancel} className="flex-1 sm:flex-initial px-space-lg py-space-sm rounded-lg bg-surface-container-highest hover:bg-error-container text-on-surface hover:text-on-error-container font-label-action text-label-action transition-all flex items-center justify-center gap-space-xs shadow-md">
        <Icon name="close" className="text-base" />
        <span>CANCEL QUEUE</span>
      </button>
      <button type="button" onClick={onReady} className="flex-1 sm:flex-initial px-space-xl py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary-container hover:text-on-primary font-label-action text-label-action transition-all transform active:scale-95 shadow-glow-primary flex items-center justify-center gap-space-xs">
        <Icon name="check_circle" filled className="text-base" />
        <span>READY TO JOIN TABLE</span>
      </button>
    </div>
  </div>
}
