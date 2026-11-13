# TASKS — session-ready decomposition (5-day schedule)

Each task = one AI coding session. Format: Goal → Scope (files) → Acceptance criteria (AC). Ordered by dependency; matches PLAN §8. Feature branches `feat/tN-slug`, squash merge on CI green.

Global rules for every session (paste with each task):
- **Session protocol:** before starting read `AGENTS.md` → `docs/PROGRESS.md` → `docs/PLAN.md` → the task spec below. Before ending: update `docs/PROGRESS.md` (task status, Current handoff block, append Session log row, append new Decisions). Rules in `AGENTS.md` are binding.
- Stack: Vite 8 + React 19 + TS (strict), Mantine 9 (light theme, tokens per `docs/resources/max-web-ui/visual-spec.md` — blue accent ≈ #1D7DF2, wallpaper, mint outgoing bubbles), TanStack Query 5, Zustand 5, Vitest 5 + MSW 3 + Testing Library, Playwright 1.65, pnpm.
- FSD: imports only downwards; public API via `index.ts`. UI copy centralized `shared/config/i18n.ts`. **No code comments anywhere (project rule).**
- Every task ends with `pnpm lint`, `pnpm typecheck`, `pnpm test` (coverage ≥85% for shared/domain code), `pnpm build` — all green; README updated when behavior changes.
- Never commit real GREEN-API credentials (they exist only in the user's private notes / runtime localStorage). apiUrl default `https://api.green-api.com`.
- API contract sources: `docs/resources/green-api/*` (v2/telegram) and `docs/resources/green-api/v3/*` (MAX v3); verified live behaviors listed in `docs/PLAN.md` §2 — treat those facts as authoritative over docs when they conflict.

---

## Day 1

### T0. Scaffold + quality gates
- Goal: runnable skeleton with all gates wired.
- Scope: pnpm `package.json`; Vite+React+TS config (strict flags); Mantine 9 provider + theme wired to `docs/resources/max-web-ui/visual-spec.md` tokens (accent ≈ #1D7DF2, wallpaper/mint/bubble tokens, system font stack); **Biome 2** (linter + formatter, `.editorconfig`-aware; replaces ESLint + Prettier); Vitest + v8 coverage thresholds + jsdom config (placeholder render test keeps the gate green); MSW init; CI workflow (lint → typecheck → test → build); `.env.example` (VITE_API_MODE=live|mock; VITE_GREENAPI_API_URL/ID/TOKEN — names only, empty values); FSD tree scaffold (`app/pages/widgets/features/entities/shared`) with barrels; git init + `.gitignore`; README skeleton. **Deferred to T9 by design (Day-1 protection): knip, lefthook, commitlint, `check:arch` script.**
- AC: **git hygiene first** — `.gitignore` covers `followup.txt`, `taskdesc.txt`, `redirect.pdf` (they contain the real token / personal data) **before** `git init`; AC asserts `git status` lists none of them; `pnpm dev` renders Mantine-themed placeholder; all checks green locally; CI config valid; knip passes on clean scaffold.

### T1. GREEN-API client + per-method rate queue + domain mappers
- Scope: `shared/api/greenapi/` — `http-client.ts` (fetch wrapper, ApiError, abort, timeout), `rate-queue.ts`, facades: `sendMessage`, `getChatHistory`, `getChats`, `getContacts`, `getContactInfo`, `getAvatar`, `getStateInstance`, `getSettings`, `setSettings`, `receiveNotification(receiveTimeout)`, `deleteNotification(receiptId)`, `readChat`; `domain/` mappers: `chat.ts` (telegram GetChats|GetContacts|getContactInfo → unified `Chat`), `message.ts` (journal/notification → `Message`), `phone.ts` (normalize RU/KZ phone → `@c.us` form).
- AC: rate queue per-method limits (history/contacts/chats/getSettings 1 rps; getContactInfo/getAvatar/readChat 10 rps; sendMessage 50 rps; receiveNotification/deleteNotification 100 rps) with coalescing + jitter, 429 → `ApiError` typed and testable; mappers tolerate unknown typeMessage/extra fields (fixtures from `docs/resources/green-api` + live samples in PLAN §2); phone mapper unit tests (7/8/+7, KZ `7…`, RB `375…` non-supported → error message); coverage ≥85% shared domain code.

### T2. Session store + Connect screen + SetSettings bootstrap
- Scope: `entities/session/` (zustand + localStorage adapter `shared/lib/storage.ts`), `features/connect-session/` (form, validation, masked token input), `pages/connect/`; MSW handlers (node+worker): getStateInstance, getSettings, setSettings, getContactInfo, error paths; **mock mode activatable at runtime via `?mock=1` URL parameter** (reviewer exploration without credentials; PLAN D5).
- AC: connect validates via `getStateInstance`; invalid creds → inline error (correct ApiError surfaced); on success: session persisted, one-time bootstrap idempotently flips webhook flags `no`→`yes` (incoming/outgoing/status/state) leaving `webhookUrl` empty; bootstrap result logged without secrets; settings apply propagates server-side for up to ~5 min — app shows an unobtrusive "settling in" state, treats empty `getChatHistory` as normal until data flows; disconnect clears storage + stops loops. RTL tests: form validation, store transitions. Resumes session on reload.

## Day 2

### T3. Notification engine (long-poll)
- Scope: `shared/api/greenapi/notification-engine.ts`; integration tests with MSW node.
- AC: starts after session ready; engine is a session-keyed singleton (React 19 StrictMode double-mount in dev must not start a second loop — guard tested); single in-flight `receiveNotification(receiveTimeout=25)` always (no overlap); ack order: event applied by subscribers → `deleteNotification(receiptId)`; timeout `null` → immediate re-poll (no gap on 429 due to queue); backoff 1s→30s on network errors, reset on success; `401` → session invalidated event; aborts fully on disconnect/unload (leak tests); FIFO per chat preserved in emitted order; unknown `typeWebhook` → logged+skipped; visibility-aware (document hidden → poll continues, throttled UI dispatch).

### T4. Chats + messages stores (live-sync core)
- Scope: `entities/chats/`, `entities/messages/` zustand slices + selectors; engine wiring (`app/providers/` integration); history hydrate via rate-queue on chat open; merge by `idMessage`; unread counters (client-side); `readChat` on open; outgoing optimistic reconcile.
- AC: reducer property tests: idempotent replay of same notification; dedupe merge; chronological order maintained (history desc init + live append); **incoming message for an unknown chatId upserts a chat summary (display name from `senderData.chatName`/`senderName`) so a first-ever reply is never dropped**; pending→reconcile by returned `idMessage`; failure path keeps bubble visible with failed state + toast; persistence: chats/messages capped (200/chat), cleared on disconnect; vitest coverage ≥85% for domain slices; perf smoke: 5k messages memoized render < 100ms.

## Day 3

### T5. Chat list pane + New chat modal (MAX-Web look)
- Scope: per `docs/resources/max-web-ui/visual-spec.md` — labeled icon rail (reduced: Все/Контакты/Настройки-bottom, `widgets/nav-rail/`), chat-list header (`Чаты` + solid-blue round FAB), search pill, `entities/chat/ui/` (ChatRow, Avatar: getAvatar → initials on saturated gradient circle), `widgets/chat-list-pane/`, `features/pick-chat/` (NewChatModal: phone input auto-normalize, full chatId field for Telegram, resolve via getContactInfo → creates chat), skeletons, empty state, connection chip, pane-switch hook for mobile.
- AC: visual identity matches screenshots (blue accents, pill search, circular badges, airy rows); rows show avatar/preview/time/unread/active/hover states; modal a11y (focus trap, Esc, labels); demo: phone of existing contact resolves to canonical chatId & opens chat; **unknown phone → live-verified behavior: `getContactInfo` returns 200 with empty profile (not an error) — chat is still created, display name falls back to the entered phone, later incoming message enriches it from `senderData`; true errors (network/4xx/limits) → friendly error**; API limit errors (Developer plan: 3 chats) surface as clear toasts; RTL tests for row + modal.

### T6. Conversation pane + bubbles (MAX-Web look)
- Scope: per visual-spec — **wallpaper**: hand-authored SVG doodle tile (light-blue space doodles, repeat) behind conversation (`shared/ui/wallpaper/` or assets); floating header (back chevron, avatar, bold name, gray subtitle) directly on wallpaper; `entities/message/ui/` (MessageBubble: **incoming solid white / outgoing translucent mint**, radius ~18px, no tails, time inside bottom-right; DateDivider: centered white pill; StatusTicks: gray ✓/✓✓ → blue ✓✓ when read), virtualized list (@tanstack/react-virtual) with scroll anchoring + jump-to-latest pill.
- AC: wallpaper renders tiled with correct base/pattern colors; bubbles match visual-spec colors/radii; day-grouped fixtures render correctly; autoscroll only when pinned to bottom; keyboard scroll; failing path styling ready; RTL tests per bubble variant; mobile: single-pane switching works.

### T7. Composer + send flow (task core requirement)
- Scope: per visual-spec — floating white composer **pill** (radius-full, soft shadow): placeholder `Сообщение`, mic icon that **swaps to send** when text is non-empty; `features/send-message/` (composer component, store action `sendText`, typing-time off, char limit 4000 guard), Enter/Shift+Enter, offline disable, failed send toast + retry action.
- AC: text validation (empty, >4000, UTF-8 emoji) — unit tests; optimistic flow e2e-ready in mock mode; real-instance smoke manually verified (message lands in messenger). Demo-flow items #1–#4 of task achieved.

## Day 4

### T8. MVP-2: statuses, reconnect UX, mobile polish
- Scope: `outgoingMessageStatus` subscription → StatusTicks — **mandatory: pending→sent and failed+tooltip; delivered/read best-effort (the Telegram bridge may not always emit those statuses — never block the demo on them)**; connection chip states (authorized/connecting/offline) + auto-reconnect banner; unread badge increments from engine while chat closed + toast on new message in background chat (Mantine notifications); mobile viewport audit (<=768px) with back navigation; visual QA vs web.max.ru look (spacing/radii/accent).
- AC: status transitions unit tests; e2e scenario: message in non-open chat → badge+toast, open → read mark + badge clears; axe Playwright zero critical violations.

### T9. Test pyramid hardening + repo hygiene automation (quality iteration)
- Scope: **hygiene automation deferred from T0**: knip (dead-code/export sweep), lefthook (pre-commit: `biome check --write` staged files + `pnpm check:arch` FSD-direction script; pre-push: typecheck + unit tests), commitlint (conventional commits). Plus: complete MSW handler set; e2e suite final: connect(valid/invalid), new chat by phone, send/receive happy path, status ticks (pending→sent mandatory path), disconnect/offline recovery, reload persistence, mobile viewport, unknown webhook resilience; flake quarantine (retries=2 CI only); coverage artifact; bundle-size budget check (<300KB gzip initial) + `rollup-plugin-visualizer` report once.
- AC: CI green end-to-end < 10 min; 3 consecutive local runs without flake; thresholds enforced for real.

## Day 5

### T10. Railway deployment + README/deploy instructions
- Scope: `Dockerfile` (pnpm build → nginx alpine), `nginx.conf` (gzip, cache, SPA fallback, security headers, `/healthz`), `railway.toml`, `robots.txt`; README deploy section (GitHub service flow + `railway up`), live-run checklist verified against deployed URL (deep-link refresh works, connect→chat demo on prod).
- AC: deployed URL reachable; all routes SPA-refresh-safe; README complete: setup, scripts, env, architecture overview, testing pyramid, deploy, **reviewer guidance (own free instance / `?mock=1` demo link / video)**, limitations (unread client-side, Telegram phone caveat, `readChat` marks the linked real account's chats read, history of pre-enable messages), screenshots section.
### T11. Final QA + submission package (quality iteration)

- Scope: full PLAN §11 demo script on real instance; CHANGELOG; tag v1.0.0; screenshots/video capture (mock or live, token never visible); submission checklist compiled (see PLAN §11 items).
- AC: everything merged, CI green on `main`, README claims verified item-by-item, submission text ready (hr@green-api.com format).

### T12. Tabler icon migration (polish)

- Goal: replace every hand-authored/inline SVG icon in the app with `@tabler/icons-react` (https://tabler.io/icons) for a consistent, professional icon set.
- Scope: install `@tabler/icons-react`; swap inline SVGs in `widgets/nav-rail` (chats/contacts/settings), the FAB plus icon in `widgets/chat-list-pane`, the composer mic/send icons, back chevron and any other ad-hoc glyphs across `features/*` / `widgets/*` / `entities/message` (status ticks stay custom — they are domain state, not icons); verify sizes/stroke width (1.5–2) match the visual spec; keep i18n `aria-label`s; delete dead inline SVG code.
- AC: no inline decorative SVG remains except domain-state marks (ticks, doodle wallpaper); all icons render at consistent sizes; lint/typecheck/test/build + `check:bundle` green (bundle delta noted in PROGRESS); e2e still pass; screenshots re-captured.

### T13. Props typing refactor: `interface` → `type` (code-style)

- Goal: all React component props and object-shaped declarations use `type` aliases instead of `interface` (interfaces are for OOP-style declaration merging, which this codebase does not use; type aliases are the idiomatic default for props).
- Scope: sweep `src/**` (and `e2e/**`) replacing `interface X { … }` with `type X = { … }` for props types (`*Props`), store/state shapes, helper params, and MSW payload types — unless a specific interface is intentionally extendable/merged (expected: none); Biome rule enforcement if available (e.g. `noInterface` / `useConsistentTypeDefinitions` in `biome.json`) so the style is locked by lint, not memory.
- AC: `grep` finds zero `interface ` declarations for props/objects outside intentional cases (none expected); lint config carries the enforcement rule; all gates green (`lint`, `typecheck`, `test`, `build`, `check:bundle`, e2e).

### T16. Code-review fixes (from the full `src/` review, 2026-11-13)

- Goal: resolve the 15 findings of the full `src/` code review — 5 medium behavior/perf issues, 5 minor correctness edges, 5 hygiene items. One session; branch `feat/t16-review-fixes`; squash-merge on gates green.
- Scope (grouped, files in brackets):
  1. **Debounced store persistence** — `commitChat`→`persist()` in `entities/messages/create-messages-store.ts` and `commit` in `entities/chats/create-chats-store.ts` serialize the whole store synchronously on every event (each webhook, status escalation, unread change). Throttle/debounce writes (trailing window ~500ms, flush on `clear()` and `beforeunload`), keeping pending-bubble exclusion and validators intact.
  2. **Rate-queue coalescing keyed without credentials** — `shared/api/greenapi/rate-queue.ts` dedupe key (method + coalesceId) plus facades' constant ids ('all', 'state', 'settings') can deliver one session's response to another during a reconnect/credential-switch race. Include a credentials fingerprint in the dedupe key (or document + guard the single-session assumption in `facades.ts`).
  3. **Preview sweep vs disconnect race** — `widgets/chat-list-pane/use-chat-list.ts` `hydratePreviewsInBackground` re-checks `credentials !== null` only *before* each `getChatHistory`; a disconnect during the await still applies `applyNewMessage` after the stores were cleared (ghost persisted summary). Re-check after the await, before applying.
  4. **Bare-word drafts bypass the D56 guard** — `features/pick-chat/create-new-chat.ts` treats only `@`-prefixed drafts as nicknames; a bare word (`durov`) takes the verbatim path and, when the gateway echoes the draft chatId (the mock handler does), a phantom chat materializes. Extend the distinct-resolved-chatId guard to all non-phone drafts, or reject non-phone non-`@` drafts with `resolveFailed`.
  5. **`waitBackoff` ignores an already-aborted signal** — `shared/api/greenapi/notification-engine.ts`: if abort fires during the preceding `await emit`, the loop still waits out the full backoff timer before `stop()` settles. Resolve immediately when `signal.aborted` at entry; add a leak-timing test.
  6. **Day dividers go stale across midnight** — `widgets/conversation-pane/ui/conversation-pane.tsx` `useMemo([messages])` reads `Date.now()`; the "Today" divider survives midnight until a new message. Make `nowMs` reactive (cheap ticker or recompute on visibility change) and cover with a test.
  7. **Out-of-order preview regression** — `entities/chats/create-chats-store.ts` `applyNewMessage` overwrites `lastMessage`/`lastActivityAt` unconditionally; a late older event regresses the chat's sort position. Ignore events older than the current preview (never regress `lastActivityAt`).
  8. **Composer offline affordance is dead UI** — `features/send-message/ui/message-composer.tsx`: the App unmounts MessengerPage while `status !== 'connected'`, so `offline` is unreachable, and the Enter path bypasses the disabled check anyway. Remove the dead affordance (or wire it properly if the composer ever outlives the gate); keep the D54 UI-acceptance rule: every visible control ships wired or not at all.
  9. **Digit-leading targets can't take the chatId path** — `features/pick-chat/ui/new-chat-modal.tsx` `PHONE_DRAFT_PATTERN` routes all digit-leading drafts to the phone path, so a bare numeric bot id (live-verified resolvable, D64) fails with `notANumber` instead of attempting `getContactInfo`. Route bare-digit drafts that fail phone normalization to the chatId path.
  10. **`ChatAvatarWithUrl` query hygiene** — `entities/chat/ui/avatar-with-url.tsx`: queryKey omits credentials (cross-account cache collision) and the `credentials === null` branch inside `queryFn` is unreachable given `enabled`. Add the credentials identity to the key; drop the dead branch.
  11. **i18n copy drift** — `shared/config/i18n.ts` `phone.errors.unsupportedRegion` still says "enter a full chatId" while the field is "Phone number or nickname" (D56). Rewrite the copy to match the single-field UX.
  12. **Dead i18n + cross-namespace borrow** — remove `i18n.session.disconnectAction` (no consumer), `i18n.newChat.errors.emptyChatId` and the unreachable `NewChatErrorCode 'emptyChatId'` in `create-new-chat.ts`; give `SettingsModal` a proper `sessionSettings.errors.notConnected` key instead of borrowing `i18n.newChat.errors.notConnected`.
  13. **Duplicated status-ranking logic** — `STATUS_RANK`/`rankOf` duplicated in `entities/messages/create-messages-store.ts` and `entities/chats/create-chats-store.ts` with subtly different semantics (escalation vs failed-overrides-all). Extract one shared primitive next to `MessageDeliveryStatus` in `shared/api/greenapi/domain/message.ts`; both stores consume it.
  14. **Swallowed history error** — `entities/messages/create-messages-store.ts` `loadChatHistory` `catch {}` returns 'failed' silently; add a `console.warn` (live-API forensics pattern, D57/D64) without changing the returned phase.
  15. **Fragile toast snapshot** — `app/providers/chat-stores.ts` reads `chats.activeChatId` from the pre-`applyNewMessage` snapshot; correct only because that action never mutates `activeChatId`. Read from `getState()` after applying.
- AC: each finding gets a test proving the fixed behavior (persistence throttling via fake timers, abort-during-backoff timing, ghost-chat race, bare-word/bare-digit modal paths, midnight divider, out-of-order preview); no recorded decision contradicted (D56 guard widened, not weakened); all gates green (`pnpm lint`, `typecheck`, `test` coverage ≥85%, `build`, `check:arch`, `check:knip`, `check:bundle`) + 16 e2e pass; PROGRESS updated with a decision noting any semantics change (esp. items 1, 4, 7, 9).

---

**Dependency graph:** T0 (git hygiene AC first) → T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T10.5 → T12 → T13 → T16 (code-review fixes) → T15 (final QA — renamed from T11; runs last, after all polish). Sessions run **strictly sequentially** — an in-flight session owns `docs/PROGRESS.md`; only after its branch merges does the next session start (even the T5/T6 "pair" is sequential unless two sessions explicitly coordinate their PROGRESS edits). No re-order otherwise — 5-day budget is tight by design.
