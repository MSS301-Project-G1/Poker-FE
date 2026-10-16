# Leaderboard and Custom Room integration

Owned by Hoài Anh (`features/ranking`, `features/custom-room`). Data comes from
ranking-service and competition-service; the screens never calculate Elo,
coins or table state themselves. Both features follow
[ARCHITECTURE.md](ARCHITECTURE.md): pages, `components/` with CSS Modules,
`hooks/`, `api/` through `@/shared/api/httpClient`, and a `runtime.js` port.

## Routes

| Path (`paths.*`) | Screen | Backend |
| --- | --- | --- |
| `/ranking` (`paths.ranking`) | Season leaderboard and own standing | `GET /api/seasons/current`, `/api/ranking/leaderboard`, `/api/ranking/me` |
| `/rooms` (`paths.rooms`) | Create a room, join with a code, public room list | `/api/rooms`, `/api/rooms/me`, `/api/rooms/{code}/join` |
| `/rooms/:roomCode` (`paths.roomByCode`) | Waiting room: seats, ready, host controls, invite, leave, start | `/api/rooms/{code}/**` |

The three routes sit inside `MainLayout` in `src/app/router.jsx`, so they use the
shared header and footer. Nothing links to them yet: the Lobby's "Create Private
Room" button and a "Ranking" menu item belong to the Lobby and layout owners.
`features/ranking` also exports `TierBadge` and `tiers` for Lobby/Profile screens.

## App integration

Wrap the routes in the runtime contexts once shared auth and profiles exist
(in `src/app/App.jsx`):

```jsx
import { RankingRuntimeContext } from '@/features/ranking'
import { RoomRuntimeContext } from '@/features/custom-room'

<RankingRuntimeContext.Provider value={{ getAccessToken, profiles }}>
<RoomRuntimeContext.Provider value={{ getAccessToken, accountId, profiles }}>
```

- `getAccessToken`: async, returns a fresh access token sent as `Authorization: Bearer`.
- `accountId`: the signed-in account; marks "You" and shows host controls.
- `profiles`: accountId → `{ displayName, avatarUrl }` from the shared profile cache.

Without them the screens show "Sign in…" states and `Player xxxxxx` names.

## Behaviour

- The waiting room polls `GET /api/rooms/{code}` every 3 seconds until the
  `/ws/social` notification socket (Duy) delivers `ROOM_UPDATED`/`ROOM_STARTED`.
  When the room switches from `WAITING` to `PLAYING`, every member is sent to
  `paths.tableById(tableId)`; players returning later see an "Open table" button.
- A player belongs to one open room; `/rooms` resumes it after a reload.
- Invitations take a friend's account id until the friends feature can supply a
  picker. Backend error messages (Vietnamese) are shown as returned.
- Tier colors reuse existing tokens (`TierBadge.module.css`); dedicated tier
  tokens can be added to `tokens.css` later with the design owner.
- Loading, empty and error states exist on every screen; layouts were checked at
  390 px and desktop width.

## Local development

Start ranking-service (8086), competition-service (8087) and game-service (8082)
with their `dev` profiles, then:

```bash
npm run dev:game
```

Open `/ranking?devUser=<uuid>` or `/rooms?devUser=<uuid>`, one tab per player.
`devIdentity()` sends the id as `X-Dev-User`; ranking-service and
competition-service accept it in their `dev` profile only (like game-service),
and such requests also act as `ADMIN`. The room screens remember the id for the
tab because in-app links drop the query. `vite.config.js` proxies `/api/ranking`,
`/api/seasons`, `/api/rooms` and `/api/tournaments` in dev.

## Review

`src/app/router.jsx`, `src/shared/config/paths.js` and `vite.config.js` are shared
files and need the owner's review. Tournament and season screens are GĐ2.
