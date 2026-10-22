import { Icon } from '@/shared/ui'

export default function AuthHeader() {
  return <header className="w-full flex flex-col items-center text-center">
    <div className="flex items-center justify-center gap-3">
      <Icon name="playing_cards" className="text-tertiary-fixed text-4xl md:text-5xl filter drop-shadow-[0_0_12px_rgb(var(--color-tertiary)/0.5)]" />
      <h1 className="font-display-hero text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary-fixed via-primary to-secondary-fixed bg-clip-text text-transparent">POKER RANK</h1>
    </div>
    <p className="mt-1 text-xs md:text-sm font-label-action tracking-widest text-on-surface-variant/90 uppercase">HIGH ROLLER ARENA • CYBER POKER LOUNGE</p>
  </header>
}
