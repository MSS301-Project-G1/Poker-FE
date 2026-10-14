import { Icon } from '@/shared/ui'

const categories = [
  { label: 'Card Skins', icon: 'style', active: true },
  { label: 'Table Felts', icon: 'casino' },
  { label: 'Animated Emojis & Sounds', icon: 'mood' },
  { label: 'Top Up', icon: 'paid' },
]

export default function CategoryTabs() {
  return <section className="w-full pt-space-lg pb-space-md">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-xs p-1.5 bg-surface-container-low rounded-xl backdrop-blur-xl overflow-x-auto shadow-inner">
        {categories.map(category => <button key={category.label} type="button" className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-label-action text-label-action shrink-0 ${category.active
          ? 'bg-primary-container text-on-primary-container shadow-md transition-transform active:scale-95'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all'}`}>
          <Icon name={category.icon} filled={category.active} className="text-lg" />
          <span>{category.label}</span>
        </button>)}
      </div>

      <div className="flex items-center gap-space-md">
        <span className="text-on-surface-variant font-label-micro text-label-micro uppercase tracking-widest flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          CURRENT COLLECTION: <strong className="text-primary font-bold">14/68</strong>
        </span>
      </div>
    </div>
  </section>
}
