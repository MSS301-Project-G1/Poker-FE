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
| `/table` | Live poker table | `src/pages/TablePage.jsx` |
| `/shop` | Cosmetics shop | `src/pages/ShopPage.jsx` |

The top navigation also includes Events and Mailbox placeholders; Stitch does not provide their screens yet.

## Design and implementation notes

- `docs/design-system.md` records the Stitch palette and visual direction. Each React page contains the adapted markup and can be edited directly.
- `public/stitch-assets` contains English versions of the Stitch artwork. Original images with Vietnamese text remain in the local reference archive and are excluded from Git. Two unavailable source image links use local SVG logo/avatar placeholders.
- `tailwind.config.js` mirrors the Stitch color, spacing, and typography tokens. Sora, Outfit, and Material Symbols are stored locally under `public/fonts`.
- Routes use the browser History API through `src/App.jsx`. The sign-in, matchmaking, reward, table actions, and shop purchase interactions are frontend demos only; remaining controls are visual placeholders. No authentication, game server, wallet, or payment API is connected.
- Edit the React page components directly as the product grows.

## Suggested next work

Connect the API and authentication flow, replace demo state with server data, split large page components into reusable UI pieces, and add the missing Events/Mailbox designs.
