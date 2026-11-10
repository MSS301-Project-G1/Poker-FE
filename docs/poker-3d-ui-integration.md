# Poker-3D UI integration into Poker-FE

Source reference: `D:/poker-3d/poker-3d/src/ui` and `src/styles.css`.
Target: the existing React application in `D:/Poker-FE`.

## What was ported

- Lobby: the two mode cards, party card, invitation code/member controls, lounge toolbar and responsive main/sidebar layout.
- Matchmaking: radar, waiting-time/countdown metrics, confirmation actions and minimization back to the lobby. Existing `useMatchmaking` remains responsible for real queue state and READY navigation.
- Social: friends/incoming/outgoing/blocks panels, add-by-account-ID, mutations and direct-chat entry. Names/avatars are loaded through the Profile batch API with ID fallbacks.
- Chat: reusable text chat with history cursor pagination, HTTP sends, retry/idempotency and STOMP reception. The match panel resolves a MATCH conversation by `refId === matchId`; table IDs are not used as conversation IDs.
- Notifications: deduplicated session events from `/user/queue/notifications`. These are session notifications, not persisted server read/unread state.

The source project's DOM classes were adapted to React and CSS Modules using Poker-FE design tokens. Real-player routes do not use the local bot roster, simulated queue, fake coins or local game engine. The standalone source engine is available separately in the public /demo route as an explicitly labeled single-player simulation. Existing real-match gameplay remains separate.

## Main locations

- `src/features/community/`: provider, API adapters, resource hook, Party/Friends/Chat/Notification panels and shared visual styles.
- `src/features/lobby/components/LoungeModes.*`: lobby mode cards and queue resume.
- `src/features/ranked/QueuePanel.module.css`: queue presentation.
- `src/app/App.jsx`, `AuthenticatedLayout.jsx`: authenticated community state and shared drawer.
- `src/features/game-table/GameTablePage.jsx`: match-chat integration; external runtime ChatPanel overrides remain supported.

## Network and auth

REST uses `gatewayRequest`, cookies and CSRF. Browser code never supplies X-User-Id or ingress secrets.
STOMP obtains the current token with authenticated GET `/api/auth/ws-token`, keeps it in memory and supplies Bearer Authorization on CONNECT. Tokens are not stored in localStorage. Connections close on logout/account changes. REST polling provides a fallback if WebSocket reconnects.
Default socket paths are `/ws/social` and `/ws/chat`; Vite proxies and nginx service-specific locations handle them. Override with `VITE_SOCIAL_WS_URL` / `VITE_CHAT_WS_URL` when required. Production nginx has SOCIAL_SERVICE_URL and CHAT_SERVICE_URL environment variables.

The accompanying backend fix updates the Social catalog to `/api/friends/**` and `/api/blocks/**`, preserves `/api/chat/**` paths and supplies the service-specific ingress keys from Gateway. Incoming browser-supplied ingress headers are stripped. Configure SOCIAL_GATEWAY_KEY / CHAT_GATEWAY_KEY identically in Gateway and the target service; these values belong only on the backend.

## Boundaries

- Party invites still use the existing invite + code flow. No PARTY_INVITE push event or invitation history is fabricated.
- Only TEXT chat is supported. No presence, typing, seen receipts, stickers or attachment endpoints are assumed.
- The existing application's demo leaderboard/player summary/ticker are unchanged and are not presented as newly integrated backend data.
- /lobby is the pre-game poker lounge. Real matches still open at `/table/:tableId`.

## Verification

```powershell
npm run build
# Use installed Chrome if Playwright's browser runtime is not installed:
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:community
```

The community test config runs both new community tests and the existing matchmaking regression suite on its own port 5297. Browser tests intercept API/STOMP contracts; they verify UI behavior, not a complete live two-account session.
Screenshots are written to `artifacts/community-*.png`. Fixtures exist only in tests; production components call the backend.
Backend Gateway tests include path preservation, verified identity, service-key injection and removal of spoofed/irrelevant credentials.
## Single-player demo

Open /demo without signing in. It embeds /demo/poker.html, auto-starts a six-seat local table with exactly one human and five bots, and has a reset control. The engine is vendored under src/features/demo/engine from poker-3d. Simulated coins use the separate poker-rank:solo-demo:profile:v1 storage key. It does not call game, matchmaking or wallet APIs. The public AuthProvider can fail to reach its backend without blocking the demo route.

From /lobby, choose **Test 1 người · 10 giây**. A floating card counts down against a 10-second deadline, then opens /demo. **Hủy chơi thử** or Escape cancels it. The test button is disabled during an active real queue; starting a real queue cancels the pending test. Leaving the lobby also clears the countdown. This flow uses local bots and simulated coins, without changing real matchmaking minimum-player settings. The community browser suite verifies cancellation, staying in the lobby before the deadline, navigation at ten seconds and no queue join request.

Vite builds the demo HTML as a separate entry, so Three.js is not added to the main application's JS chunk. Run npm run test:solo-demo to verify an actual turn/action with the backend deliberately unavailable.

## Lobby 3D and floating matchmaking update

- Ranked is available in the navigation menu again and opens the restored dedicated matchmaking screen with radar, queue information and gathering slots. Timers, counts and actions use the shared queue state; profile/Elo values of opponents are not fabricated.
- Both lobby mode buttons start real matchmaking and open the radar screen: /ranked for Rank, /ranked?mode=NORMAL for Normal. Returning to the lobby preserves the queue; its resume button returns to the radar without another join request. MatchmakingProvider owns both queue states across route changes.
- Queue progress and Rank acceptance are displayed on the radar screen. MatchmakingCard remains only for a match already in progress, with return-to-table/forfeit controls. Queue cancellation still calls DELETE on the active queue.
- /ranked displays Rank matchmaking; /ranked?mode=NORMAL displays Normal matchmaking. No floating queue card is shown while waiting. Legacy /lobby?match=RANK or NORMAL links also open the radar screen.
- Queue status includes `playerIds`. Radar resolves these through `/api/profiles/batch` and updates identities/avatars on every membership change. Before a proposal, this is a bounded preview of the oldest entries in the mode's queue, not guaranteed final table seats (Rank Elo and Normal party selection still happen on the server). Proposals return the actual proposal roster. Missing profiles fall back to an ID label and default avatar; names are not invented.
- LobbyBackdrop lazily renders the same Three.js TableScene geometry and lights as poker-3d behind the real React lounge. This adapter does not run the demo game's queue or economy.
- WebGL resources are disposed on unmount; React Strict Mode can reuse the canvas context. Rendering is capped at 30 fps / DPR 1.25 and paused under modal panels or when the document is hidden. Reduced-motion mode renders a static scene. A CSS fallback keeps the lounge usable without WebGL.
- Shared procedural sound effects cover clicks, queue found/ready, card/chip/turn changes, chat and notifications. The header's sound button persists a local preference. Browsers unlock audio only after a user gesture. The solo demo uses the same audio synthesizer inside its standalone document.

## Live 3D table and camera entrance

- `/table/:tableId` now renders the same procedural 3D table, characters, cards and chips as the demo, driven exclusively by the authenticated Game Service snapshot. The local demo engine does not control live games. Only card faces disclosed by the server are rendered; pooled card materials are reset before reuse.
- Rank proposals have a configurable 30-second acceptance deadline (`MATCHMAKING_RANK_ACCEPT_TIMEOUT`). The radar follows the server deadline. Once all accept and the server reports READY, navigation opens the table and the camera rises from floor height into the playing view over 3.2 seconds. Normal starts the camera entrance on READY without an acceptance phase.
- Actions and the server turn clock continue throughout the entrance. Skip is available; reduced motion goes directly to the playing view. Completed entrances are remembered per table in sessionStorage so reconnecting does not replay them. The solo demo also uses the entrance.
- Name plates and the pot follow projected world anchors on desktop; mobile uses spaced plates around the viewport. The existing shared skin components remain the HUD/accessibility layer. If WebGL creation fails or its context is lost, the standard table stays usable with the same server actions.
- `npm run test:live-table` checks acceptance-to-READY navigation, low-to-high camera movement, live action/snapshot updates, hidden opponent cards, reconnect, mobile/reduced motion, skipping and WebGL fallback. These tests mock transport contracts; they are not a live multi-account backend session.


## Updated matchmaking flow (2026-10-24)

Both Normal and Rank now wait for the server fill deadline (30 seconds from the minimum roster, currently 2 players). A full table no longer bypasses that deadline. Below the minimum, the fill countdown resets while elapsed waiting time continues from joinedAt.

After the server reserves the roster, PROPOSED displays a full-screen black reveal and a 3D table preview with Accept/Decline controls. The separate acceptance deadline is 30 seconds. No cards are dealt and no game is created during this preview. Every player must accept. READY navigates to the real full-screen 3D game; a completed preview camera animation is not replayed on entry.

Normal rejection/expiry returns the entire proposal to the lobby, preserving party membership and clearing party queue locks. Rank retains its existing decline/timeout requeue/cooldown rules. WebGL failure keeps confirmation/actions usable with an explicit fallback message.

Tests use mocked HTTP/STOMP transport for browser scenarios, and backend unit tests cover acceptance, expiry, rejection, membership, and countdowns.


## Confirmed presentation correction

The 3D camera/table is only the matchmaking confirmation stage. Once every player accepts and the server returns READY, `/table/:tableId` uses the original 2D table, cards, bets, actions, and chat. The real game does not initialize WebGL. The standalone `/demo` remains 3D. The 30-second fill and acceptance deadlines remain unchanged.
