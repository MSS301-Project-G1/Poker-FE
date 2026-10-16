import { Icon } from '@/shared/ui'

function CornerMark({ value, className = '' }) {
  return <div className={`absolute flex flex-col items-center ${className}`}>
    <span className="font-headline-sm text-headline-sm text-tertiary font-bold leading-none">{value}</span>
    <Icon name="diamond" className="text-sm text-tertiary" />
  </div>
}

export default function DeckPreview({ deck }) {
  return <div className="xl:col-span-4 rounded-2xl bg-surface-container-low p-space-lg flex flex-col gap-space-md shadow-xl sticky top-24">
    <div className="flex items-center justify-between">
      <span className="text-on-surface-variant font-label-micro text-label-micro uppercase tracking-wider flex items-center gap-1">
        <Icon name="3d_rotation" className="text-sm text-primary" />
        3D INTERACTIVE PREVIEW
      </span>
      <span className="px-space-xs py-0.5 rounded bg-primary-container/40 text-primary font-label-micro text-label-micro font-bold">{deck.rarity}</span>
    </div>

    <div className="relative w-full h-80 rounded-xl bg-surface-container-lowest flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing shadow-inner group">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-container/10 via-transparent to-secondary-container/15"></div>
      <div className="absolute w-48 h-48 rounded-full bg-primary/20 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>

      <div className="relative w-44 h-64 rounded-xl shadow-[0_15px_35px_rgb(var(--color-obsidian)/0.7)] transition-transform duration-200 ease-out [transform-style:preserve-3d] [transform:rotateY(-12deg)_rotateX(10deg)]">
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-tertiary rounded-xl opacity-80 blur-[2px]"></div>
        <div className="relative w-full h-full rounded-xl bg-surface-container p-2 flex flex-col justify-between overflow-hidden shadow-2xl">
          <img alt={`${deck.name} card back`} className="w-full h-full object-cover rounded-lg" src="/stitch-assets/shop-cyber-box-no-price.png" />
          <CornerMark value={deck.cornerValue} className="top-3 left-3" />
          <CornerMark value={deck.cornerValue} className="bottom-3 right-3 rotate-180" />
        </div>
      </div>
      <div className="absolute bottom-3 text-center w-full pointer-events-none">
        <span className="text-outline font-label-micro text-label-micro bg-surface-container-lowest/80 px-2.5 py-1 rounded-full backdrop-blur-md">
          Hover to rotate 360° view
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-space-xs pt-space-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-headline-sm text-headline-sm text-on-surface">{deck.name}</h4>
        <span className="text-tertiary font-label-action text-label-action flex items-center gap-1">
          <Icon name="stars" filled className="text-sm" /> 5.0
        </span>
      </div>
      <p className="text-body-sm font-body-sm text-on-surface-variant">{deck.previewDescription}</p>
    </div>

    <div className="grid grid-cols-2 gap-space-xs pt-1">
      {[['Flip Effect', 'Hologram Sparkle'], ['Deal Sound', 'Neon Shimmer SFX']].map(([label, value]) => <div key={label} className="bg-surface-container p-2.5 rounded-lg flex flex-col">
        <span className="text-outline font-label-micro text-label-micro uppercase">{label}</span>
        <span className="text-on-surface font-label-action text-label-action text-sm">{value}</span>
      </div>)}
    </div>
  </div>
}
