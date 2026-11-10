import { useNavigate } from 'react-router'
import { Button } from '../shared/ui'
import styles from './FeaturedBundle.module.css'

export default function FeaturedBundle() {
  const navigate = useNavigate()

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerCard}>

        <div className={styles.contentGrid}>
          <div className={styles.textColumn}>

            <h2 className={styles.bannerTitle}>VIP Coin packs on offer</h2>
            <p className={styles.bannerLead}>Top up VIP Coin with PayOS to buy card skins, tables and avatars.</p>
            <div className={styles.ctaRow}>
              <Button
                variant="gold"
                size="md"
                icon="bolt"
                onClick={() => navigate('/shop/bundles')}
              >
                View packs
              </Button>
            </div>
          </div>

          <div className={styles.imageColumn}>
            <div className={styles.previewFrame}>
              <img
                alt="VIP Coin packs"
                className={styles.bannerImage}
                src="/stitch-assets/shop-bundle-poker-rank.png"
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 24 24" fill="%23b0129b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
