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
| `/` or `/auth` | Sign in / create account | `src/pages/AuthPage.jsx` |
| `/lobby` | Lobby and daily check-in | `src/pages/LobbyPage.jsx` |
| `/ranked` | Ranked matchmaking | `src/pages/RankedPage.jsx` |
| `/table` or `/table/:tableId` | Connected poker table | `src/features/game-table/GameTablePage.jsx` |
| `/admin/match-settings` | Match settings editor | `src/features/admin/match-settings/MatchSettingsPage.jsx` |
| `/shop` | Cosmetics shop | `src/pages/ShopPage.jsx` |

The top navigation also includes Events and Mailbox placeholders; Stitch does not provide their screens yet.

## Design and implementation notes

- `docs/design-system.md` records the Stitch palette and visual direction. Each React page contains the adapted markup and can be edited directly.
- `public/stitch-assets` contains English versions of the Stitch artwork. Original images with Vietnamese text remain in the local reference archive and are excluded from Git. Two unavailable source image links use local SVG logo/avatar placeholders.
- `tailwind.config.js` mirrors the Stitch color, spacing, and typography tokens. Sora, Outfit, and Material Symbols are stored locally under `public/fonts`.
- Routes use the browser History API through `src/App.jsx`. Game table actions and Admin Match Settings connect to the game service. Sign-in, matchmaking, reward and shop interactions remain frontend demos; shared authentication, profiles, chat, skins and reward sources require their owners' integration.
- Product direction: players top up to buy cosmetic skins. There is no VIP tier, diamond balance, or Ruby currency. The shop shows no prices until payment and product data are defined.
- Edit the React page components directly as the product grows.

## Suggested next work

Connect the API and authentication flow, replace demo state with server data, split large page components into reusable UI pieces, and add the missing Events/Mailbox designs.

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
