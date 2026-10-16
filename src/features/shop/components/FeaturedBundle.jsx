import { Icon } from '@/shared/ui'

export default function FeaturedBundle({ onBuy }) {
  return <section className="w-full mt-space-sm mb-space-xl">
    <div className="relative rounded-2xl bg-gradient-to-r from-surface-container via-surface-container-low to-surface-container p-space-lg md:p-space-xl overflow-hidden shadow-2xl">
      <div className="absolute -right-16 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-2xl"></div>
      <div className="absolute left-1/3 bottom-0 w-64 h-32 bg-tertiary/10 rounded-full blur-xl"></div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
        <div className="lg:col-span-7 flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="px-space-sm py-0.5 rounded-full bg-primary-container/40 text-primary font-label-micro text-label-micro uppercase tracking-wider font-bold">Featured Cosmetic</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Royal Amethyst Violet Bundle</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Customize your table with reflective amethyst felt and a 20-piece animated emoji pack with spatial audio.
          </p>
          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <button type="button" onClick={onBuy} className="px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-action text-label-action hover:brightness-110 shadow-glow-primary transition-all flex items-center gap-space-xs">
              <Icon name="bolt" className="text-lg" />
              <span>Top Up to Buy</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden shadow-lg bg-surface-container-lowest flex items-center justify-center p-space-sm">
            <img alt="Royal Amethyst Violet Bundle" className="w-full h-full object-cover rounded-lg" src="/stitch-assets/shop-bundle-poker-rank.png" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent flex items-end p-space-md">
              <div className="flex items-center justify-between w-full">
                <span className="text-tertiary font-label-action text-label-action">Royal Table Felt + 20 Emojis</span>
                <span className="bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded text-primary font-label-micro text-label-micro font-bold">MYTHIC BUNDLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
}
