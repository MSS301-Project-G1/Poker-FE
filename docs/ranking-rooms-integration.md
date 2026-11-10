# Ranking, season, Custom Room and tournament integration

Owned by Hoài Anh (`features/ranking`, `features/season`, `features/custom-room`,
`features/tournament`, `features/tutorial`, `features/admin/seasons`, `features/admin/tournaments`).
Data comes from ranking-service and competition-service; the screens never
calculate Elo, rewards, coins or table state themselves. The features follow
[ARCHITECTURE.md](ARCHITECTURE.md): pages, `components/` with CSS Modules,
`hooks/`, and `api/` adapters that call the API gateway (`@/shared/api/gatewayClient`).

## Routes

| Path (`paths.*`) | Screen | Backend |
| --- | --- | --- |
| `/ranking` (`paths.ranking`) | Own standing, then a Season / Friends tab (`?view=friends`) | `GET /api/seasons/current`, `/api/ranking/leaderboard`, `/api/ranking/me`, `/api/ranking/friends` |
| `/seasons` (`paths.seasons`) | Active season, tier reward ladder, rewards of ended seasons and claiming | `GET /api/seasons/current`, `/api/seasons/{id}/rewards`, `/api/ranking/me`, `/api/seasons/rewards/me`, `POST /api/seasons/{id}/rewards/claim` |
| `/rooms` (`paths.rooms`) | Create a room, join with a code, public room list | `/api/rooms`, `/api/rooms/me`, `/api/rooms/{code}/join` |
| `/rooms/:roomCode` (`paths.roomByCode`) | Waiting room: seats, ready, host controls, invite, leave, start | `/api/rooms/{code}/**` |
| `/tournaments` (`paths.tournaments`) | Upcoming / Past tabs (`?view=past`) of tournament cards | `GET /api/tournaments?past=` |
| `/tournaments/:tournamentId` (`paths.tournamentById`) | Own entry (register, accept invitation, open table), prize pool, bracket, players | `GET /api/tournaments/{id}`, `POST .../register`, `POST .../confirm` |
| `/admin/seasons` (`paths.adminSeasons`), ADMIN only | Seasons, new season (rewards copied from another), coins and skins per tier, close the active season | `/api/admin/seasons/**`, skins from `GET /api/shop/products` |
| `/admin/tournaments` (`paths.adminTournaments`), ADMIN only | Schedule Open/Elite tournaments, start early, cancel with refunds | `/api/admin/tournaments/**`, `GET /api/tournaments?past=` |
| `/tutorial` (`paths.tutorial`), full screen like `/table` | Scripted lesson on the game table, then the one-time reward | `GET /api/tutorial/me`, `POST /api/tutorial/complete` |

The routes sit inside `AuthenticatedLayout` in `src/app/router.jsx`, so only
signed-in players reach them and they use the shared header and footer. `/ranking` and `/seasons` link to each other.

Entry points (done at Khanh's request in the Lobby and the header):

- Header: Rooms, Tournaments and Leaderboard from 1360 px wide (the player's name
  moved to 2xl to make room); admins get Rank seasons and Manage tournaments icons.
- Lobby: the leaderboard title and the player's row open `/ranking`; the "Chế độ khác"
  panel under it opens `/rooms`, `/tournaments` and `/tutorial` (with the unclaimed
  reward); the championship banner shows the next tournament and opens it.

Exports for other features: `features/ranking` has `TierBadge`, `tiers`, `tierOrder`
and `useLeaderboardPreview(size)` (season, top `size`, own standing, profiles), which
feeds the Lobby leaderboard and the tier/Elo/rank line of its player summary.
`features/tournament` has `useNextTournament()` (the soonest scheduled tournament,
else the soonest running one) for the Lobby banner. `features/tutorial` has
`useTutorialStatus()` for the reward badge.

## Gateway

Every adapter calls `gatewayRequest(path, ...)` on `env.apiBaseUrl` (8080 in dev).
The browser sends the session cookie; the gateway checks it, adds `X-User-*` and
routes `/api/ranking`, `/api/seasons`, `/api/tutorial`, `/api/rooms` and
`/api/tournaments` to the services registered in Eureka. The screens never add a
token or `X-User-*` header themselves. Ranking and competition return their DTOs
directly, so the adapters read the payload as is (no `result`/`data`).

- Public GETs (leaderboard, current season, tier rewards, public rooms) pass
  `auth: false`, so a 401 does not trigger a session refresh.
- `accountId` for "You" and host controls comes from `useAuth()`.
- Player names come from `fetchProfilesByIds` (`@/features/account`) through each
  feature's `hooks/useProfiles.js`, 100 ids per call. If that fails the rows keep
  `Player xxxxxx`.

## Behaviour

- Friends tab: the player and up to 199 friends ranked together, with each
  friend's season position as "Server rank"; friends without a ranked match this
  season are listed last as unranked. It loads only when the tab is open.
- Season screen: the reward ladder marks tiers up to the player's current tier as
  reached; rewards are granted for the tier when the season closes. Claiming
  replaces the card with the server's answer and shows a toast; coins and skins
  are delivered by wallet and shop in the background. Skin names are not shown
  yet because shop-service has no product lookup for them.
- The waiting room reloads `GET /api/rooms/{code}` as soon as `useCommunity().notifications`
  (Duy's `/ws/social`) receives `ROOM_UPDATED`/`ROOM_STARTED` for its code. Polling stays
  as the fallback: every 15 seconds while that socket is connected, every 3 seconds
  while it is down and for `?devUser` identities. When the room switches from `WAITING` to `PLAYING`, every member is sent to
  `paths.tableById(tableId)`; players returning later see an "Open table" button.
- A player belongs to one open room; `/rooms` resumes it after a reload.
- Invitations take a friend's account id until the friends feature can supply a
  picker. Backend error messages (Vietnamese) are shown as returned. `ROOM_INVITE`
  notifications of the session are listed on `/rooms` ("Friends invited you") with a
  Join button and a password field when the room has one.
- Tournaments: the detail polls `GET /api/tournaments/{id}` every 5 seconds until
  the tournament finishes or is cancelled (the bracket changes without a notification),
  and reloads at once on `TOURNAMENT_INVITE` or `TOURNAMENT_TABLE_READY` for its id.
  When the player's table turns `PLAYING`
  while they wait on the page they are sent to `paths.tableById(tableId)`; later
  visits show "Open your table". Paid registration asks first (`useConfirm`).
  The prize split comes from the server (`prizes[]`), the champion's skin is only
  announced (no product lookup yet).
- Admin screens: dates are entered in Vietnam time (`datetime-local`, fixed +07:00).
  Skin pickers list `GET /api/shop/products`; without shop-service they accept a
  product id. Closing a season, starting early and cancelling ask first. The header's
  admin icons open them and the two pages link to each other; the shop admin sidebar
  (Tùng) does not list them yet.
- My new pages keep 8rem below the content so the floating community dock (fixed
  56px from the bottom) never covers the last button.
- Tutorial: two scripted hands against two bots in `tutorial/script.js` (no game-service).
  The first teaches blinds and the dealer button, RAISE, CHECK, CALL, RAISE on the river
  and the showdown; the second teaches FOLD. Only the step's action is enabled in the
  game-table `ActionDock`; the felt, `Board`, `PlayerSeat` and `HandGuide` are game-table's
  public components. The route sits outside `AuthenticatedLayout` like `/table` and
  redirects to sign-in itself. Finishing calls `POST /api/tutorial/complete`; the status
  read on arrival tells the dialog whether this run paid the coins.
- Tier colors reuse existing tokens (`TierBadge.module.css`); dedicated tier
  tokens can be added to `tokens.css` later with the design owner.
- Loading, empty and error states exist on every screen; layouts were checked at
  390 px and desktop width. Dates show in Vietnam time (SPEC §5.2).

## Local development

Through the gateway: start the stack from `api-gateway/ONBOARDING.md` with
`-f ranking-service/compose.yml -f competition-service/compose.yml`, check that
RANKING-SERVICE and COMPETITION-SERVICE are UP on http://localhost:8761, run
`npm run dev` and sign in.

Several players on one machine: start ranking-service (8086), competition-service
(8087) and game-service (8082) with their `dev` profiles, run `npm run dev:game`,
sign in, then open `/ranking?devUser=<uuid>`, `/seasons?devUser=<uuid>`,
`/rooms?devUser=<uuid>` or `/tournaments?devUser=<uuid>`, one tab per player. With `?devUser` the adapters skip
the gateway and call the dev services through the Vite proxy with `X-Dev-User`,
like game-table. In their `dev` profile only, ranking-service and
competition-service let `X-Dev-User` win over `X-User-Id`, and requests without a
role act as `ADMIN`. The room and tournament screens remember the id for the tab
because in-app links drop the query.

`vite.config.js` proxies `/api/ranking`, `/api/seasons`, `/api/tutorial` and
`/api/admin/seasons` to 8086, and `/api/rooms`, `/api/tournaments` and
`/api/admin/tournaments` to 8087, for the `?devUser` mode only. The two admin
entries must stay above the `/api/admin` entry that sends the rest of
`/api/admin` to shop-service.

## Review

`src/app/router.jsx`, `src/shared/config/paths.js` and `vite.config.js` are shared
files and need the owner's review, as do the Lobby files (`LobbyPage`, `Leaderboard`,
`PlayerSummary`, `ChampionshipBanner`, `MoreModes`) and `AppHeader`.
