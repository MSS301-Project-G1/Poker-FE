// Labels follow the ranking-service tier codes (SPEC §8); CARD_GOD is the top 50 Grand Champions.
// tone names a color class in components/TierBadge.module.css.
export const tiers = {
  NEWBIE: { label: 'Newbie', tone: 'newbie' },
  IRON: { label: 'Iron', tone: 'iron' },
  BRONZE: { label: 'Bronze', tone: 'bronze' },
  SILVER: { label: 'Silver', tone: 'silver' },
  GOLD: { label: 'Gold', tone: 'gold' },
  PLATINUM: { label: 'Platinum', tone: 'platinum' },
  DIAMOND: { label: 'Diamond', tone: 'diamond' },
  CHAMPION: { label: 'Champion', tone: 'champion' },
  GRAND_CHAMPION: { label: 'Grand Champion', tone: 'grandChampion' },
  CARD_GOD: { label: 'Card God', tone: 'cardGod' },
}
