# Game table and Admin settings integration

Owned by Bảo. The connected feature preserves the violet design, uses server
legal actions and personal snapshots, and never calculates wallet/Elo rewards.

## App integration

`src/app/router.jsx` maps `/table` and `/table/:tableId` to `GameTablePage`.
The first loads `/api/game/me/active-table`; the second loads the specified
table, with server membership enforcement. `features/game-table/index.js`
exports the page and the table components for Tutorial: `Board`, `PlayerSeat`,
`ActionDock`, `TurnTimer`, `MatchResult`, `HandGuide`. They take props, while
`GameTablePage` owns the network session (`hooks/useGameSession.js`, REST calls
in `api/gameApi.js` through `@/shared/api/gatewayClient`).

The app shell wraps the routes in `GameRuntimeContext.Provider`
(`src/app/GameRuntimeBridge.jsx`):

```jsx
import { GameRuntimeContext } from '@/features/game-table'

<GameRuntimeContext.Provider value={{
  getAccessToken, // async function from shared auth; must return a fresh token
  profiles,       // accountId -> profile from shared useProfiles/batch cache
  ChatPanel,     // shared chat component, receives conversationId = matchId
  rewards,       // authoritative result from ranking/wallet; null while pending
}}>
  <AppRoutes />
</GameRuntimeContext.Provider>
```

The context is an integration port: `getAccessToken` returns the in-memory
`/api/auth/ws-token` JWT for STOMP only. Seat names and avatars come from
`fetchProfilesByIds` (public API of `features/account`); `runtime.profiles`
overrides them. Without a `ChatPanel`, the table shows Duy's `MatchChat`.
`shared/skin` supplies default renderers until Tùng integrates owned cosmetics.
`/admin/match-settings` sits inside `AdminOnlyRoute`; only `npm run dev:game`
registers it outside the guard for `?devUser` testing. The backend requires ADMIN
outside dev; the route guard does not grant or enforce a role.

HTTP uses the gateway session cookie (`gatewayRequest`, CSRF on writes); the
browser never sends Bearer tokens or identity headers to REST. A `?devUser`
identity in game dev mode calls the dev game directly. STOMP `/ws/game`
uses Authorization in CONNECT and subscribes only to user queues. Reconnect
automatically requests a fresh snapshot; periodic sync and sequence checks
discard stale updates and prevent duplicate actions. The server controls turn
deadlines, raises and pots. Rank rewards show only for RANK games: a finished
match polls `GET /api/ranking/me/matches/{matchId}` (every 3 s, 10 attempts,
since ranking returns 404 until it processes `match.finished`) and shows the
applied Elo change and coins; `runtime.rewards` overrides it. Table chips never
become wallet coins here.

## Local development

BE: Docker PostgreSQL at 54329 and RabbitMQ at 56729, Java game-service dev
profile at 8082. FE: `npm run dev:game`, then `/table`. The launcher provides
one URL per human (`devUser=<uuid>`) and supports bots. Reload keeps identity
in session storage; each personal URL selects its own identity. Without dev
mode or a shared token source the screen reports missing authentication.

Vite proxy configuration and app route changes require Khanh's review. Default
skin renderers require Tùng's review. CreateTable, match result events and the
simultaneous elimination rule require Duy/Hoài Anh review. No main branch merge
or group integration approval is implied by the implementation.

## Checks and known dependencies

`npm run lint`, `npm run build`, and five Playwright scenarios (backend must run)
cover launcher, two-player action/reload privacy, complete match results,
390px mobile width and Admin persistence. Screenshots were inspected on desktop
and mobile. Errors from the game backend are Vietnamese; the surrounding
product copy follows the existing English design.

`npm audit fix --ignore-scripts` applied compatible updates. Seven dev dependency
advisories remain in the existing Tailwind 3 toolchain (5 high, 2 moderate);
fixing them requires a reviewed Tailwind 4 migration. Production dependencies
have no advisories in the checked audit. Still external: a gateway `/ws/game`
route (STOMP currently reaches game-service through the Vite and nginx proxies).
