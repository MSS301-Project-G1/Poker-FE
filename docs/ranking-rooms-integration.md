# Ranking, season and Custom Room integration

Owned by Hoài Anh (`features/ranking`, `features/season`, `features/custom-room`).
Data comes from ranking-service and competition-service; the screens never
calculate Elo, rewards, coins or table state themselves. The features follow
[ARCHITECTURE.md](ARCHITECTURE.md): pages, `components/` with CSS Modules,
`hooks/`, `api/` through `@/shared/api/httpClient`, and a `runtime.js` port.

## Routes

| Path (`paths.*`) | Screen | Backend |
| --- | --- | --- |
| `/ranking` (`paths.ranking`) | Own standing, then a Season / Friends tab (`?view=friends`) | `GET /api/seasons/current`, `/api/ranking/leaderboard`, `/api/ranking/me`, `/api/ranking/friends` |
| `/seasons` (`paths.seasons`) | Active season, tier reward ladder, rewards of ended seasons and claiming | `GET /api/seasons/current`, `/api/seasons/{id}/rewards`, `/api/ranking/me`, `/api/seasons/rewards/me`, `POST /api/seasons/{id}/rewards/claim` |
| `/rooms` (`paths.rooms`) | Create a room, join with a code, public room list | `/api/rooms`, `/api/rooms/me`, `/api/rooms/{code}/join` |
| `/rooms/:roomCode` (`paths.roomByCode`) | Waiting room: seats, ready, host controls, invite, leave, start | `/api/rooms/{code}/**` |

The routes sit inside `MainLayout` in `src/app/router.jsx`, so they use the
shared header and footer. `/ranking` and `/seasons` link to each other. Nothing
else links to them yet: the Lobby's "Create Private Room" button and menu items
belong to the Lobby and layout owners. `features/ranking` exports `TierBadge`,
`tiers` and `tierOrder` for Lobby, Profile and season screens.

## App integration

Wrap the routes in the runtime contexts once shared auth and profiles exist
(in `src/app/App.jsx`):

```jsx
import { RankingRuntimeContext } from '@/features/ranking'
import { SeasonRuntimeContext } from '@/features/season'
import { RoomRuntimeContext } from '@/features/custom-room'

<RankingRuntimeContext.Provider value={{ getAccessToken, profiles }}>
<SeasonRuntimeContext.Provider value={{ getAccessToken }}>
<RoomRuntimeContext.Provider value={{ getAccessToken, accountId, profiles }}>
```

- `getAccessToken`: async, returns a fresh access token sent as `Authorization: Bearer`.
- `accountId`: the signed-in account; marks "You" and shows host controls.
- `profiles`: accountId → `{ displayName, avatarUrl }` from the shared profile cache.

Without them the screens show "Sign in…" states and `Player xxxxxx` names.

## Behaviour

- Friends tab: the player and up to 199 friends ranked together, with each
  friend's season position as "Server rank"; friends without a ranked match this
  season are listed last as unranked. It loads only when the tab is open.
- Season screen: the reward ladder marks tiers up to the player's current tier as
  reached; rewards are granted for the tier when the season closes. Claiming
  replaces the card with the server's answer and shows a toast; coins and skins
  are delivered by wallet and shop in the background. Skin names are not shown
  yet because shop-service has no product lookup for them.
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
  390 px and desktop width. Dates show in Vietnam time (SPEC §5.2).

## Local development

Start ranking-service (8086), competition-service (8087) and game-service (8082)
with their `dev` profiles, then:

```bash
npm run dev:game
```

Open `/ranking?devUser=<uuid>`, `/seasons?devUser=<uuid>` or
`/rooms?devUser=<uuid>`, one tab per player. `devIdentity()` sends the id as
`X-Dev-User`. In their `dev` profile only, ranking-service and
competition-service let `X-Dev-User` win over the default `X-User-Id` that the
shared http client adds in dev (like game-service), and requests without a role
act as `ADMIN`. The room screens remember the id for the tab because in-app links
drop the query.

`vite.config.js` proxies `/api/ranking`, `/api/seasons`, `/api/tutorial` and
`/api/admin/seasons` to 8086, and `/api/rooms`, `/api/tournaments` and
`/api/admin/tournaments` to 8087. The two admin entries must stay above the
`/api/admin` entry that sends the rest of `/api/admin` to shop-service.

## Review

`src/app/router.jsx`, `src/shared/config/paths.js` and `vite.config.js` are shared
files and need the owner's review. Tournament screens and the admin screens are
the next GĐ2 batches.
