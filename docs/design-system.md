---
name: Royal Cyber Violet Poker
colors:
  surface: '#1b0b2d'
  surface-dim: '#1b0b2d'
  surface-bright: '#433255'
  surface-container-lowest: '#160628'
  surface-container-low: '#241436'
  surface-container: '#28183a'
  surface-container-high: '#332245'
  surface-container-highest: '#3e2d51'
  on-surface: '#efdbff'
  on-surface-variant: '#dabfcf'
  inverse-surface: '#efdbff'
  inverse-on-surface: '#3a294c'
  outline: '#a28a98'
  outline-variant: '#54414e'
  surface-tint: '#fface7'
  primary: '#fface7'
  on-primary: '#5e0052'
  primary-container: '#b0129b'
  on-primary-container: '#ffd0ee'
  inverse-primary: '#ac0a98'
  secondary: '#e5b5ff'
  on-secondary: '#4e0078'
  secondary-container: '#6c2399'
  on-secondary-container: '#dca1ff'
  tertiary: '#e5c457'
  on-tertiary: '#3c2f00'
  tertiary-container: '#c8a83f'
  on-tertiary-container: '#4e3e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd7f0'
  primary-fixed-dim: '#fface7'
  on-primary-fixed: '#3a0032'
  on-primary-fixed-variant: '#850075'
  secondary-fixed: '#f4d9ff'
  secondary-fixed-dim: '#e5b5ff'
  on-secondary-fixed: '#30004b'
  on-secondary-fixed-variant: '#692096'
  tertiary-fixed: '#ffe084'
  tertiary-fixed-dim: '#e5c457'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#1b0b2d'
  on-background: '#efdbff'
  surface-variant: '#3e2d51'
typography:
  display-hero:
    fontFamily: Sora
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
  display-hero-mobile:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Sora
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Outfit
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Outfit
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-numeric-lg:
    fontFamily: Sora
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
  label-numeric-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  label-action:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
  label-micro:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system defines an elite online poker environment that merges high-stakes VIP casino prestige with refined esports cyber aesthetics. It deliberately abandons traditional green felt and generic casino tropes in favor of an immersive deep purple universe.

The aesthetic blends **Glassmorphism** with subtle **Cyber-Luminescence**:
- **Atmospheric Depth:** Deep obsidian purple and dark violet gradients evoke private high-roller lounges and futuristic stadium tables.
- **Prestige Accents:** Radiant magenta and warm champagne gold accents punctuate key actions, chip stacks, pots, and royal achievements without visual clutter.
- **Edge Illumination:** Translucent cards, subtle luminous borders, and soft violet rim lighting create focus on the cards, turn timers, and decision chips.
- **Emotional Intent:** Strategic tension, calculated confidence, and exclusive luxury.

## Colors
The palette is rooted in the spectral tiers of the provided reference: shifting from bright electric magenta at the interactive apex down into deep obsidian violet at the base layer.

### Core Hierarchy
- **Primary (`#B0129B` / `#9A0B85`):** Cyber Magenta. Used for key call-to-actions, active player turn outlines, all-in indicators, and primary wins.
- **Secondary (`#5E0F8B` / `#4C0970`):** Royal Violet. Anchors table felt gradients, interactive secondary buttons, and badge backplates.
- **Tertiary (`#F6D365` / `#E5B83B`):** Imperial Gold. Reserved exclusively for high-value chips, pot values, tournament rank trophies, and VIP tiers.
- **Neutral Dark Canvas (`#0A0216` / `#120324` / `#230644`):** Obsidian Violet tiers. Replaces flat blacks and grays, serving as the canvas backdrop, table rail, and modal background.

### Semantic Tones
- **Table Felt Gradient:** Radial progression from `#4C0970` at the center to `#1A0433` and `#0A0216` at the outer rail.
- **Status Fold / Inactive:** `#472C61` at 60% opacity with low-saturation white labels.
- **Status Check / Call:** Radial gradient of `#5E0F8B` to `#380757` with sharp border `#9A0B85`.
- **Status Bet / Raise / All-in:** Intense glowing gradient from `#B0129B` to `#6E0963`.

## Typography
Typography balances technical game data with sleek esports modernism.

- **Headline & Numeric Typography (`Sora`):** Selected for its geometric structure, wide stance, and high visibility. Pot counts, player bankrolls, chip values, and timer countdowns utilize `Sora` with tabular figures to avoid layout jitter during real-time betting changes.
- **Body Typography (`Outfit`):** Provides pristine readability across hand histories, table chat, tournament rules, and settings modals against low-light dark violet surfaces.
- **Capitalization Rules:** Critical table calls (`FOLD`, `CHECK`, `CALL`, `RAISE`, `ALL-IN`) and tournament badges utilize uppercase lettering with `+0.05em` to `+0.1em` letter spacing for split-second legibility.

## Layout & Spacing
The system applies a hybrid viewport layout: an absolute responsive containment model for the poker table arena combined with a fluid 12-column grid for lobbies and account hubs.

- **Poker Arena (Felt Environment):** Built around a proportional 16:9 safe oval container that scales dynamically to fit the viewport while preserving fixed player seat vectors (2-max, 6-max, or 9-max). The felt boundary preserves minimum `space-lg` padding from HUD elements.
- **Lobby & Tournaments:** Utilizes a 12-column grid (gutter `1.25rem`, outer margin `2rem`) collapsing to 4 columns on mobile (margin `1rem`).
- **Control Bar (Action Dock):** Positioned along the bottom safe area with uniform `space-sm` gaps between bet sizing increment chips and action buttons.

## Elevation & Depth
Depth relies on tiered obsidian luminance, glassmorphic refraction, and purple neon penumbras rather than generic drop shadows.

- **Canvas Level (Base - 0dp):** Solid obsidian foundation `#0A0216`.
- **Table Felt Tier (1dp):** Radial gradient from `#4C0970` to `#18042B` with a subtle fine-grain micro-texture and a recessed inner rim shadow (`inset 0 0 40px rgba(10, 2, 22, 0.95)`).
- **Seat Pods & HUD Containers (2dp):** Frosted glass surfaces (`background: rgba(35, 6, 68, 0.65)`, `backdrop-filter: blur(16px)`) bounded by a 1px border (`rgba(176, 18, 155, 0.25)`).
- **Active Player & Timer Glow (3dp):** Outer neon halo (`box-shadow: 0 0 24px rgba(176, 18, 155, 0.55), 0 0 6px rgba(246, 211, 101, 0.4)`).
- **Modals, Buy-in Drawers, High-Tier Cards (4dp):** Deep glass stack (`background: rgba(18, 3, 36, 0.92)`, `backdrop-filter: blur(24px)`, `box-shadow: 0 16px 48px rgba(5, 1, 12, 0.85)` with a 1px top highlight gradient `rgba(246, 211, 101, 0.35)` to `rgba(154, 11, 133, 0.1)`).

## Shapes
A roundedness level of `2` provides balanced, ergonomic curves that soften tactical gaming interfaces while maintaining structured geometry.

- **Seat Pods & Betting Cards:** `rounded-lg` (1rem / 16px) creates comfortable pill-like capsules for player avatars and chip values.
- **Action Buttons & Chips:** Action buttons utilize `rounded-lg` (1rem / 16px), while bet-sizing shortcuts, chips, and dealer buttons (`D`, `SB`, `BB`) use full circular pill silhouettes.
- **Playing Cards:** Engineered with `0.5rem` (8px) corners to preserve the familiar physical card silhouette while matching the modern digital frame.
- **Modals & Drawers:** `rounded-xl` (1.5rem / 24px) for upper corners in mobile sheets and desktop overlays.

## Components

### Action Buttons (Fold, Check/Call, Raise/All-In)
- **Fold Button:** Subtle dark obsidian surface (`rgba(35, 6, 68, 0.75)`), 1px border of `rgba(255, 255, 255, 0.15)`, text color `#C6B5DC`. Hover state illuminates a faint `#4C0970` tint.
- **Check / Call Button:** Gradient background from `#5E0F8B` to `#3D075C`. 1px border of `#9A0B85`. Text in pure white with numeric call amount highlighted in `#F6D365`.
- **Raise / All-In Button:** High-intensity gradient from `#B0129B` to `#750668`. Box shadow provides a 12px outer neon glow (`rgba(176, 18, 155, 0.4)`). Active state applies a quick scaling snap (`scale-98`).

### Betting Slider & Sizing Chips
- **Slider Track:** 6px track filled with deep purple `#230644`. Active progress glows with a gradient from `#5E0F8B` to `#B0129B`.
- **Slider Thumb:** Metallic gold core (`#E5B83B`) with a neon magenta concentric ring.
- **Quick-Bet Chips (Min, 2.5x, 3x, Pot, Max):** Compact glass capsules (`rounded-md`, `space-xs` padding) styled with 1px border of `rgba(176, 18, 155, 0.4)`. Active chip takes solid `#5E0F8B` with gold numeric text.

### Playing Cards
- **Card Faces:** Crisp off-white card face (`#F7F3FB`) with suit colors modified to harmonize: Spades (`#0F081D`), Clubs (`#301548`), Hearts (`#B01248`), and Diamonds (`#C58A14`).
- **Card Back:** Obsidian-violet tapestry patterned with symmetrical cyber-filigree and a gold trim border.
- **Winning Cards Highlight:** Cards involved in the winning combination gain a pulsating dual border of `#B0129B` and `#F6D365`.

### Chips & Pot Display
- **Pot Counter:** Centralized floating glass badge with gold icon, numerical value set in `Sora` `label-numeric-lg` with pure `#F6D365` font color.
- **Chip Stacks:** Multi-tiered 3D isometric discs rendered with edge striping in Cyber Magenta, Deep Violet, and Imperial Gold.

### Player Seat Pods
- **Base State:** Compact horizontal rounded card showing avatar, username, bankroll, and hole cards.
- **Active Turn:** Framed with an animated SVG stroke progress bar in `#B0129B` that transitions to `#F6D365` when under 5 seconds remaining.
- **Winner State:** Emits a radial golden-magenta bloom with animated chip collection paths.

### Modals & Dialogs
- High-blur frosted violet backdrop (`rgba(10, 2, 22, 0.85)`).
- Windows framed with 1px radiant violet gradients (`#9A0B85` at top to `#230644` at bottom).
- Header typography in `headline-sm` using `Sora` with gold-tinted title accents.