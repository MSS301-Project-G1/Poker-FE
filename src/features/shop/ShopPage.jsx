import { Icon, useToast } from '@/shared/ui'
import CategoryTabs from './components/CategoryTabs'
import DeckSkins from './components/DeckSkins'
import FeaturedBundle from './components/FeaturedBundle'

export default function ShopPage() {
  const notify = useToast()
  const requirePayment = () => notify('Skin purchases need a payment backend. This screen is ready for integration.')

  return <div className="flex flex-col w-full">
    <div className="relative w-full overflow-hidden pb-16">
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="w-full max-w-7xl mx-auto px-margin">
        <CategoryTabs />
        <FeaturedBundle onBuy={requirePayment} />
        <DeckSkins onBuy={requirePayment} />
        <section className="w-full mt-space-xl">
          <div className="rounded-xl bg-surface-container p-space-md flex items-center gap-space-md shadow-lg">
            <Icon name="palette" className="text-2xl text-tertiary" />
            <div>
              <h5 className="font-headline-sm text-headline-sm text-on-surface">Skins are cosmetic only</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Top up to buy skins and customize your cards or table. Skins do not affect gameplay.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
}
