import DeckCard from './DeckCard'
import DeckPreview from './DeckPreview'

// Demo catalog until the cosmetics service is connected.
const decks = [
  { name: 'Royal Cyber Deck', rarity: 'MYTHIC', equipped: true, cornerValue: 'A', image: '/stitch-assets/shop-cyber-deck-no-price.png', edition: 'Season 1 Edition',
    description: 'Luminous metallic violet edge trims with dynamic breathing pulse when action is on you.',
    previewDescription: 'Exclusive futuristic styling with neon reactive edges synced to turn timing. Grants a 10% Jackpot win visual flair.' },
  { name: 'Golden Dragon Dynasty', rarity: 'LEGENDARY', cornerValue: 'K', image: '/stitch-assets/shop-golden-dragon-en.png', edition: 'Royal Handcrafted Finish',
    description: 'Imperial handcrafted gold foil with blazing dragon aura.' },
  { name: 'Dark Void Obsidian', rarity: 'MYTHIC', cornerValue: 'Q', image: '/stitch-assets/shop-dark-void-en.png', edition: 'Ancient Void Cosmic Relic',
    description: 'Deep cosmic fractal violet cards with vortex shading.' },
  { name: 'Neon Las Vegas 2077', rarity: 'LEGENDARY', cornerValue: 'J', image: '/stitch-assets/shop-neon-vegas-en.png', edition: '2077 Hologram Technology',
    description: 'Holographic cards shifting hues with pot action intensity.' },
]

const filters = ['All', 'Mythic', 'Legendary']

export default function DeckSkins({ onBuy }) {
  const equipped = decks.find(deck => deck.equipped)
  return <section className="w-full">
    <div className="flex items-center justify-between mb-space-md">
      <div className="flex items-center gap-space-xs">
        <span className="w-1.5 h-6 rounded-full bg-primary-container"></span>
        <h3 className="font-headline-md text-headline-md text-on-surface">Card Deck Skins</h3>
      </div>
      <div className="flex items-center gap-space-xs">
        <span className="font-label-micro text-label-micro text-on-surface-variant">Filter:</span>
        {filters.map((filter, index) => <button key={filter} type="button" className={`px-space-sm py-1 rounded text-label-micro font-label-micro ${index === 0
          ? 'bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors'
          : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors'}`}>{filter}</button>)}
      </div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
      <DeckPreview deck={equipped} />
      <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {decks.map(deck => <DeckCard key={deck.name} deck={deck} onBuy={onBuy} />)}
      </div>
    </div>
  </section>
}
