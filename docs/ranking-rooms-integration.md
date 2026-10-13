# Leaderboard and Custom Room integration

Owned by Hoài Anh (`features/ranking`, `features/custom-room`). Data comes from
ranking-service and competition-service; the screens never calculate Elo,
coins or table state themselves.

## Routes

| Path | Screen | Backend |
| --- | --- | --- |
| `/ranking` | Season leaderboard and own standing | `GET /api/seasons/current`, `/api/ranking/leaderboard`, `/api/ranking/me` |
| `/rooms` | Create a room, join with a code, public room list | `/api/rooms`, `/api/rooms/me`, `/api/rooms/{code}/join` |
| `/rooms/:code` | Waiting room: seats, ready, host controls, invite, leave, start | `/api/rooms/{code}/**` |

`resolveRankingRoute` and `resolveCustomRoomRoute` are chained in `src/App.jsx`
after the game routes, and the Lobby's "Create Private Room" button opens
`/rooms`. Each feature exports its page and runtime context from `index.js`;
`features/ranking` also exports `TierBadge` and `tiers` for the Lobby/Profile.

## App integration

Wrap the routes in the runtime contexts once shared auth and profiles exist:

```jsx
import { RankingRuntimeContext } from '../features/ranking'
import { RoomRuntimeContext } from '../features/custom-room'

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
  `/table/{tableId}`; players returning later see an "Open table" button.
- A player belongs to one open room; `/rooms` resumes it after a reload.
- Invitations take a friend's account id until the friends feature can supply a
  picker. Backend error messages (Vietnamese) are shown as returned.
- Loading, empty and error states exist on every screen; layouts were checked at
  375 px and 1280 px wide.

## Local development

Start ranking-service (8086), competition-service (8087) and game-service (8082)
with their `dev` profiles, then:

```bash
npx vite --mode competition
```

`.env.competition` enables the local identity for these features and the game
table. Open `/ranking?devUser=<uuid>` or `/rooms?devUser=<uuid>`; the identity is
kept per browser tab and sent as `X-User-Id`, which the services trust because
the gateway normally sets it. Use one tab per player. `vite.config.js` proxies
`/api/ranking`, `/api/seasons`, `/api/rooms` and `/api/tournaments` in dev.

## Review

The `src/App.jsx` route/button lines and the `vite.config.js` proxy entries
touch Khanh's shared files and need his review. Tournament and season screens
are GĐ2.
