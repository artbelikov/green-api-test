# Changelog

## 1.0.0 — 2026-11-13

First public version of the Green API Messenger test task: a Telegram-flavored GREEN-API web client built with Vite + React 19 + TypeScript (strict), Mantine 9, Feature Sliced Design, and a full test pyramid.

### Messaging core

- GREEN-API client layer: typed fetch wrapper (`ApiError` kinds, abort, timeouts), per-method rate queue (spec limits, coalescing with jitter, 429 surfaced as typed errors), method facades (`sendMessage`, `getChatHistory`, `getChats`, `getContacts`, `getContactInfo`, `getAvatar`, `getStateInstance`, `getSettings`/`setSettings`, `receiveNotification`/`deleteNotification`, `readChat`), and defensive domain mappers for the unified `Chat`/`Message` models (live Telegram payload shapes pinned by regression tests).
- Notification engine: single in-flight long-poll (`receiveNotification` 10 s window), FIFO per chat, apply-then-ack ordering, backoff 1 s → 30 s on network errors with reset on success, session-keyed singleton safe against StrictMode double-mounts, `401` → session invalidation, visibility-aware dispatch, full abort guarantees on disconnect/unload.
- Live-sync stores: chats + messages zustand slices with dedupe merge by `idMessage`, chronological ordering, unread counters, pending→sent reconcile for optimistic sends, failed-send retention with retry, per-chat history capped at 200 messages, offline persistence to `localStorage` with throttled writes, cleared on disconnect.

### UI

- MAX-Web-inspired two-pane messenger: labeled icon rail, chat list with search pill and blue FAB, avatar/initials fallback, skeletons and empty states, floating conversation header over hand-authored space-doodle wallpaper.
- Conversation: white incoming / translucent mint outgoing bubbles, date-divider pills, gray→blue status ticks (pending/sent/delivered/read), virtualized message list with scroll anchoring and jump-to-latest.
- Composer: floating pill with mic↔send swap, 4000-char guard, offline-safe send flow (Enter / Shift+Enter, retry on failure).
- New chat modal: single field accepting RU/KZ phone numbers (normalized), `@nicknames`, full Telegram chatIds, and bare numeric ids; unknown recipients still create the chat named by the entered phone (gateway not-found re-verified live on 2026-11-13).
- Connect screen: credential validation via `getStateInstance`, masked token input, one-time idempotent webhook bootstrap (`SetSettings`, `webhookUrl` stays empty) with the "settling in" notice while the instance applies settings, session restore across reloads, disconnect wipe.

### Quality

- Test pyramid: 333 unit/integration tests (Vitest + MSW + Testing Library) with 85% coverage thresholds on `shared`/`entities`/`features`, 16 Playwright e2e scenarios in mock mode (connect, new chat, send/receive, delivery ticks, reconnect recovery, session invalidation, persistence, mobile layout, virtualizer/autoscroll, background toasts, axe accessibility pass).
- Tooling: Biome 2 lint+format (props typed as `type` aliases, locked by rule), FSD import-direction gate, knip dead-code sweep, bundle budget (<300 KB gzip initial; ships at ~157 KB with deferrable mock layer), lefthook git hooks with commitlint.
- Full code-review pass (15 findings) covering persistence throttling, credential-scoped rate-queue coalescing, disconnect races, live-shape mapper hardening (`bot` chat type, `@`-prefixed usernames, numeric phones), abort-during-backoff, midnight-stale day dividers, and i18n hygiene.
- Deployed to Railway (nginx alpine, healthcheck-gated); automated demo video and screenshots captured in mock mode — real credentials never enter the repository.
