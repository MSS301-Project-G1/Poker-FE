import { useNavigate } from 'react-router'
import { Button } from '../shared/ui'
import styles from './FeaturedBundle.module.css'

export default function FeaturedBundle() {
  const navigate = useNavigate()

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerCard}>
        <div className={styles.glowTopRight} />
        <div className={styles.glowBottomLeft} />

        <div className={styles.contentGrid}>
          <div className={styles.textColumn}>
            <div className={styles.tagGroup}>
              <span className={styles.tagPromo}>Ưu Đãi Đặc Biệt</span>
              <span className={styles.tagBonus}>+30% Bonus Coin</span>
            </div>

            <h2 className={styles.bannerTitle}>Gói Nạp Khuyến Mãi VIP Coin</h2>

            <p className={styles.bannerDescription}>
              Nhận thêm tới 30% VIP Coin thưởng khi nạp qua PayOS. Sử dụng VIP Coin để sở hữu các bộ
              bài Hoàng Gia, hiệu ứng All-In Rồng Lửa và khung avatar danh giá.
            </p>

            <div className={styles.ctaRow}>
              <Button
                variant="gold"
                size="md"
                icon="bolt"
                onClick={() => navigate('/shop/bundles')}
              >
                Khám Phá Gói Nạp PayOS
              </Button>
            </div>
          </div>

          <div className={styles.imageColumn}>
            <div className={styles.previewFrame}>
              <img
                alt="Gói Nạp VIP Coin"
                className={styles.bannerImage}
                src="/stitch-assets/shop-bundle-poker-rank.png"
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 24 24" fill="%23b0129b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                }}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.overlayInfo}>
                  <span className={styles.payosTag}>PayOS Cổng Thanh Toán</span>
                  <span className={styles.hotTag}>HOT DEALS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
