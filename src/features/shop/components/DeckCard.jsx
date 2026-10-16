import { Icon } from '@/shared/ui'

const rarityStyles = {
  MYTHIC: 'bg-primary-container text-on-primary-container',
  LEGENDARY: 'bg-tertiary-container/30 text-tertiary',
}

export default function DeckCard({ deck, onBuy }) {
  return <div className={`group relative rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${deck.equipped ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center justify-between mb-space-sm">
      <span className={`px-space-sm py-0.5 rounded-full ${rarityStyles[deck.rarity]} font-label-micro text-label-micro font-bold tracking-wider`}>{deck.rarity}</span>
      {deck.equipped && <span className="flex items-center gap-1 text-primary font-label-action text-label-action">
        <Icon name="check_circle" className="text-base" /> Equipped
      </span>}
    </div>

    <div className="relative w-full h-52 rounded-xl bg-surface-container-lowest overflow-hidden mb-space-sm shadow-md">
      <img alt={deck.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={deck.image} />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent flex items-end p-space-sm">
        <span className="text-outline font-label-micro text-label-micro">{deck.edition}</span>
      </div>
    </div>
    <div className="flex flex-col gap-1 mb-space-md">
      <h4 className="font-headline-sm text-headline-sm text-on-surface">{deck.name}</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{deck.description}</p>
    </div>

    <div className="flex items-center justify-between pt-space-xs">
      {deck.equipped ? <>
        <span className="text-primary font-label-action text-label-action">Owned</span>
        <button type="button" className="px-space-md py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-action text-label-action cursor-default opacity-80 flex items-center gap-1">
          <Icon name="verified" className="text-base" />
          <span>Equipped</span>
        </button>
      </> : <>
        <div className="flex flex-col">
          <span className="text-on-surface-variant font-label-action text-label-action">Cosmetic only</span>
        </div>
        <button type="button" onClick={onBuy} className="px-space-md py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-action text-label-action hover:brightness-110 shadow-md transition-transform active:scale-95 flex items-center gap-1">
          <Icon name="shopping_cart" className="text-base" />
          <span>Top Up to Buy</span>
        </button>
      </>}
    </div>
  </div>
}
