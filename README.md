# Poker Rank Frontend

React 19 + Vite + Tailwind CSS frontend based on five Poker Rank Stitch screens. All project copy and visible text inside images is in English.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Run `npm run build` and `npm run lint` before a PR.

## Screens

| Route | Screen | Source component |
| --- | --- | --- |
| `/` or `/auth` | Sign in / create account | `src/features/auth/AuthPage.jsx` |
| `/lobby` | Lobby and daily check-in | `src/features/lobby/LobbyPage.jsx` |
| `/ranked` | Ranked matchmaking | `src/features/ranked/RankedPage.jsx` |
| `/shop` | Cosmetics shop | `src/features/shop/ShopPage.jsx` |
| `/events`, `/mailbox` | Placeholders (no Stitch design yet) | `src/features/events`, `src/features/mailbox` |
| `/table` or `/table/:tableId` | Connected poker table | `src/features/game-table/GameTablePage.jsx` |
| `/admin/match-settings` | Match settings editor | `src/features/admin/match-settings/MatchSettingsPage.jsx` |

All routes are declared in `src/app/router.jsx`; paths live in `src/shared/config/paths.js`.

## Architecture

**Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before writing code.** In short:

```
src/
├── app/        entry point, providers, the single route table
├── styles/     global CSS; tokens.css is the only place for colors, fonts, shadows, z-index
├── shared/     api client, env/paths config, layout, skins and reusable UI (Button, Icon, Toast…)
└── features/   one folder per feature (auth, lobby, ranked, shop, game-table, admin/…)
```

Dependencies only point downwards (`app → features → shared → styles`); ESLint enforces it.

## Design and implementation notes

- `docs/design-system.md` records the Stitch palette and visual direction. Pages compose section components from their feature's `components/` folder.
- `public/stitch-assets` contains English versions of the Stitch artwork. Original images with Vietnamese text remain in the local reference archive and are excluded from Git. Two unavailable source image links use local SVG logo/avatar placeholders.
- `src/styles/tokens.css` defines the Stitch color, spacing, typography, shadow and z-index tokens as CSS variables; `tailwind.config.js` only maps class names to them, and CSS Modules read them directly. Sora, Outfit, and Material Symbols are stored locally under `public/fonts`.
- Routing uses React Router (`src/app/router.jsx`). Game table actions and Admin Match Settings connect to the game service. Sign-in, matchmaking, reward and shop interactions remain frontend demos; shared authentication, profiles, chat, skins and reward sources require their owners' integration.
- Product direction: players top up to buy cosmetic skins. There is no VIP tier, diamond balance, or Ruby currency. The shop shows no prices until payment and product data are defined.

## Suggested next work

Connect the API and authentication flow, replace the demo data arrays in each feature's components with server data, and add the missing Events/Mailbox designs.

## Connected game development

Start the BE PostgreSQL/RabbitMQ Docker stack and game-service with the `dev`
profile (see BE `game-service/README.md`), then run:

```bash
npm ci
npm run dev:game
```

Open `/table` to create a local human/bot game. Vite proxies game REST/STOMP and
Admin settings to `127.0.0.1:8082`. These local identity shortcuts are enabled
only by `.env.game` **and** Vite development mode, and are disabled in production
builds. The backend also requires its `dev` profile. Real deployments require
the authenticated gateway and shared auth adapter.

Integration points and review dependencies: [docs/game-integration.md](docs/game-integration.md).
Browser verification: start the backend, install Chromium with
`npx playwright install chromium`, then run `npm run test:e2e` (five scenarios).
`npm run lint` and `npm run build` must also pass.
