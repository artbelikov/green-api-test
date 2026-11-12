# Green API Messenger — Detailed Plan

**Test task: “Фронтенд разработчик React”** (hh.kz vacancy 139289090, GREEN-API). The task text (`taskdesc.txt`) requires a UI for sending and receiving **text messages in MAX** via GREEN-API; **Telegram is allowed as an alternative** — we build for Telegram (instance already registered), with the architecture trivially retargetable to MAX (verified below).

Stack: **Vite + React + TypeScript (SPA)**, **Mantine UI**, **Feature Sliced Design**, test pyramid (Vitest + RTL + Playwright/MSW), deploy to **Railway.com**. No Next.js, no backend.

---

## 1. Task requirement mapping

| # | Requirement (from taskdesc.txt) | Our implementation |
|---|---|---|
| 1 | UI для отправки и получения сообщений | Two-pane messenger: chat list + conversation, text messages only |
| 2 | Сервис GREEN-API | GREEN-API gateway API (see §2 verified contracts) |
| 3 | Только текстовые сообщения | MVP = text only. Media/edit/delete/reactions are **out of scope** (stretch, clearly separated) |
| 4 | Прототип = внешний вид web.max.ru | MAX Web look: chat list left, conversation right, MAX-style accents. See §5 |
| 5 | Максимально простой, минимальный набор функций | Scope tiers: MVP-1 (requirement 1:1), MVP-2 (credibility), Tier-3 (optional). Feature freeze after MVP-2 |
| 6 | Отправка через SendMessage | `POST {apiUrl}/waInstance{id}/sendMessage/{token}` with `{chatId, message}` |
| 7 | Получение через technology-http-api | Long-poll loop `receiveNotification`(timeout up to 60s) → ack `deleteNotification` |
| 8 | React | React 19 + TypeScript |
| — | Expected demo flow | Credentials screen → enter recipient phone → create chat → send message → recipient replies in messenger → reply appears live in the app |
| — | Submission format | Send to hr@green-api.com: CV pdf, GitHub repo link, local-run instructions link, deployed service link, screenshots/video |

Time budget: **5 working days** (see §7 schedule).

## 2. Verified facts about the environment (ground truth, tested live 2026-11-12 against the user's registered Telegram instance; identifiers redacted — repo is public)

| Fact | Value |
|---|---|
| API host | `https://api.green-api.com` (universal host works for WhatsApp, Telegram, MAX) |
| Path pattern | `{apiUrl}/waInstance{idInstance}/{method}/{apiTokenInstance}` — identical across messengers; for MAX an optional `/v3/` prefix exists (per v3 docs; `green-api.com/v3/docs` = MAX API docs) |
| CORS | `Access-Control-Allow-Origin: *`, all methods/headers (preflight OPTIONS → 204 verified) → **pure SPA, no backend needed** |
| Instance state | `getStateInstance` → `{"stateInstance": "authorized"}`; `typeInstance: "telegram"` (MAX returns `"v3"`, WhatsApp `"whatsapp"` — same field, useful for messenger-agnostic UI) |
| Chat id (v3 & Telegram reality) | Numeric **string**, positive for private chats, negative for groups; `@c.us`/`@g.us` prefixes deprecated in v3. Live checks: `getContactInfo` accepts bare id, bare phone, and `phone@c.us` (resolved phone → canonical telegram chat id, a short numeric string) |
| Phone → chat resolution | `getContactInfo {chatId: "7XXXXXXXXXX@c.us"}` → `{chatId, name, username, chatType, lastSeen, avatar…}` (verified live on a real contact). `checkWhatsapp` → **404 on Telegram instance** (UA-only method; MAX uses `CheckAccount`); phone resolution must go through `getContactInfo` |
| Notifications | `GET receiveNotification?receiveTimeout=5..60` long-poll → `{receiptId, body}` or `null` on timeout → `POST deleteNotification {receiptId}` acks. FIFO, 24h retention. `webhookUrl` must stay empty; flags enabled via `SetSettings` |
| Notification envelope | `{typeWebhook, instanceData, timestamp, idMessage, senderData{chatId, sender, senderName, senderContactName, chatName?}, messageData{typeMessage, textMessageData{textMessage}}}` — structurally identical in v2 docs, v3 docs, and live Telegram journal |
| Message journal/history | `getChatHistory` POST `{chatId, count}` (default 100, desc sort). Requires `incomingWebhook`/`outgoingMessageWebhook` settings ON (they are OFF on user's instance → bootstrap should enable via `SetSettings`, non-destructive flip `no`→`yes`) |
| Telegram live payloads | `getChats` → `[{chatId, name, type: supergroup|group|channel|user, phoneNumber, username}]` (differs from WhatsApp docs shape — normalize defensively); `lastIncomingMessages` → items with `idMessage` (numeric string), `textMessage`, `jpegThumbnail`, `isEdited`, `isDeleted` |
| Rate limits (rps) | getChatHistory 1, getChats 1, getContacts 1, getContactInfo 10, getAvatar 10, sendMessage 50, receiveNotification 100, deleteNotification 100, readChat 10, getSettings 1 |
| SendMessage limits | message ≤ 20000 chars (Telegram, v2 docs) / ≤ 4000 chars (MAX, v3 docs) — client validates min(2) conservatively |
| Own account | wid is `phone@c.us`-form; Telegram-flavored. Exact instance id / token / wid / contact phone numbers are **never written into repo docs or fixtures** (repo is public); live values live only in the user's private notes and runtime `localStorage` |

Consequences:
1. **No backend** → static SPA on Railway (Docker + nginx SPA fallback).
2. Token in browser `localStorage` (entered on connect screen, never committed) — acceptable for a test task; demo/mock mode exists for public recordings.
3. Schemas are defensively normalized — the bridge evolves independently of docs (Telegram `getChats` already deviates).
4. Because paths are unified, pointing this client at a **MAX instance later = changing only credentials**; mappers key off `instanceData.typeInstance`.

## 3. Product scope

**MVP-1 — the required demo flow (pure task requirements):**
1. **Connect screen**: form `idInstance`, `apiTokenInstance` (apiUrl fixed to `https://api.green-api.com`, editable in advanced section); "Connect" validates via `getStateInstance`, persists to `localStorage`, bootstrap enables webhook flags once via `SetSettings`; error if invalid; "Disconnect" clears.
2. **New chat**: input for recipient **phone** (validated, normalized to `@c.us` form) — resolved via `getContactInfo`; fallback input accepts raw chatId (Telegram requirement, documented in UI hint); resolved contact → chat created in the list.
3. **Conversation**: history via `getChatHistory`, incoming bubbles left, outgoing right, timestamps, date dividers.
4. **Composer**: textarea (Enter=send, Shift+Enter=newline), char-count validation, disabled while disconnected.
5. **Live receive**: notification engine long-polls, appends messages in real time, keeps FIFO order; unseen counter increments, clears when chat open (client-side `readChat` call).
6. **Chat list**: chats sorted by last activity, last message preview, unread badge, avatars via `getAvatar` (initials fallback).

**MVP-2 — credibility/minimal-but-real (still "simple"):**
- Connection status indicator (authorized/connecting/offline chip) with auto-reconnect.
- Delivery ticks on outgoing messages from `outgoingMessageStatus` — **pending→sent and failed are mandatory; delivered/read are best-effort** (the Telegram bridge may not always emit them) — same engine.
- Message delivery failure toast.
- Mobile viewport: single-pane switch (list ↔ chat), back navigation.

**Tier-3 — optional stretch, only if MVP-2 is green early (explicitly not required):**
- Dark theme toggle, typing indicator (`sendTyping`), paste of inline reply quotes (`quotedMessageId`), message search, notification sound, i18n.

**Out of scope (all tiers):** media send/render, group management, edit/delete, reactions, polls, statuses, calls, catalogs.

## 4. Architecture

```
┌────────────────────────── Application (browser) ──────────────────────────┐
│  UI (Mantine): ConnectPage · MessengerPage (list+conversation+compose)    │
│                                                                          │
│  State:                                                                  │
│  ├─ TanStack Query  — contacts resolution, avatars, history fetch        │
│  ├─ Zustand stores  — session, chats, messages, connection state         │
│  └─ NotificationEngine — long-poll loop → normalized domain events       │
│                                                                          │
│  shared/api/greenapi:                                                    │
│  ├─ http client (fetch, ApiError, abort)                                 │
│  ├─ per-method façades + rate-limit coalescing queue                     │
│  └─ domain mappers (telegram/v3 flavor → unified Chat/Message types)     │
│                                                                          │
│  Mock layer: VITE_API_MODE=mock → MSW (service worker) scripted bridge   │
└───────────────────────────────────────────────────────────────────────────┘
```

Key decisions:

- **D1 — Pure SPA** (CORS verified). Deploy: multi-stage Docker → nginx (`try_files` SPA fallback, gzip, cache headers, `/healthz`). Railway (builder=Dockerfile) or GitHub-connected service.
- **D2 — Notification-driven sync**: one long-poll loop for the whole app; ack (`deleteNotification`) only after the event is applied (at-least-once, idempotent reducers keyed by `idMessage`); backoff 1s→30s on network errors; `401`→session invalid; visibility-aware (tab hidden → keep polling, drop UI work).
- **D3 — Data flow**: open chat → history hydrates store (rate-queue 1 rps) → merged with live events by `idMessage`; outgoing → optimistic pending bubble → replace by returned id → status updates from webhooks.
- **D4 — Ids**: `chatId` strings are opaque; phone number is used only for resolution (phone → `phone@c.us` → `getContactInfo` → canonical chatId). Uniqueness: `chatId + idMessage`.
- **D5 — Mock mode**: MSW handlers implement a scripted fake gateway (scenarios: receive, status ticks, disconnect, 429). Powers component tests, integration tests, and Playwright e2e without touching the real account. **Reviewer path: mock mode is activatable at runtime via `?mock=1` URL parameter** (no build flag, no credentials needed) so anyone can explore the UI; README says so explicitly.
- **D6 — State**: TanStack Query v5 (request/response data) + Zustand v5 (live-sync stores). No Redux.
- **D7 — Security**: credentials in localStorage only, masked in UI, `.env.example` documents names without values; no secrets in repo/CI logs; `Referrer-Policy` header; input sanitized (no `dangerouslySetInnerHTML`).

## 5. UI specification (prototype of web.max.ru)

**Visual contract: `docs/resources/max-web-ui/visual-spec.md`** — pixel-level tokens sampled from real MAX Web screenshots saved in `docs/resources/max-web-ui/screenshots/` (main screen, login, conversation). Key identity traits: **three-column layout** (labeled icon rail → chat list → conversation), **light-blue doodle wallpaper** behind the conversation, white incoming / **translucent mint outgoing** bubbles, **blue accents** (badges, FAB, read ticks), floating composer pill (mic → send swap), floating header on the wallpaper. Scope decisions below; exact colors/radii/spacing live in the visual spec.

**Layout**: full-viewport flex; icon rail ~76px (reduced to `Все`, `Контакты`, bottom `Настройки` — MAX-Web structure kept, messenger-only sections dropped); chat list ~420px; conversation fills the rest; <768px → one visible pane at a time (list ↔ chat with back chevron).

**Connect screen (no session)**: MAX-style centered white card on wallpaper: bold heading, gray subtitle, light-gray rounded inputs (`idInstance`, `apiTokenInstance` password-style; apiUrl in advanced section), primary blue pill button `Connect`, inline validation errors, footer link "Как получить данные" → console.green-api.com.

**Chat list pane (left)**:
- Header: `Чаты` (bold, large) + round solid-blue FAB (white `+`) top-right → New chat modal.
- Search: light-gray pill, filters by name/last-message text.
- Rows: avatar (getAvatar url → initials on saturated gradient circle), bold name, meta line (tick on own last message + short time + pin), gray 2-line preview with sender prefix (`Вы: …` for outgoing), solid-blue circular unread badge; active/hover states; bold name when unread.
- Sorted by last activity desc. Empty state: "Создайте первый чат — введите номер телефона получателя". Skeleton loaders.

**New chat modal**: phone number input (auto-normalizes leading `7`/`8`/`+7`), "или укажите полный chatId для Telegram", Create → resolves via getContactInfo (`phone@c.us`, verified live incl. KZ +7 numbers); resolved profile → opens chat; **empty profile (unknown recipient) → chat still created, named by the phone**; true errors → inline message.

**Conversation pane (right)**:
- Floating header on wallpaper: back chevron (mobile), avatar, bold name (+username subtitle when known).
- Body: wallpaper (SVG doodle tile per visual spec); ScrollArea; centered white date-pill dividers ("Сегодня"/"Вчера"); day-grouped bubbles; incoming = solid white left; outgoing = translucent mint right; time inside bubble bottom-right; outgoing ticks: gray `✓`/`✓✓` → **blue `✓✓` on read** (MVP-2), failed → error tint + tooltip.
- Composer: floating white pill — placeholder `Сообщение`, emoji icon (Tier-3), mic icon that swaps to send when text non-empty; Enter=send, Shift+Enter=newline; char limit 4000; disabled with tooltip when offline.

**Language**: interface copy — English base, centralized in `shared/config/i18n.ts` (RU switch trivial).

**Visual tokens**: see visual-spec.md (blue accent ≈ `#1D7DF2`, mint outgoing ≈ `#DFF3E9` translucent, wallpaper gradient + doodle SVG tile, airy spacing, pill controls). Mantine theme maps these tokens; dark-ready but ships light only.
## 6. Testing strategy — pyramid (mandatory per followup.txt)

| Level | Tools | Counts (target) | Covers |
|---|---|---|---|
| Unit (many, fast) | Vitest | 60–80% of all tests | mappers (telegram/v3 flavor), phone normalization, rate queue, notification reducer, ids/dates/time, storage adapters |
| Integration/service | Vitest + MSW (node) | engine + API façades | long-poll loop (timeout, ack ordering, backoff, abort, 401), sendMessage optimistic reconciliation, settings bootstrap |
| Component | Vitest + Testing Library (jsdom) | key UI units | ConnectForm, ChatRow, MessageBubble(+ticks), Composer (send/typing/newline), NewChatModal |
| E2E (few, critical) | Playwright (Chromium; in CI) in mock mode | 6–8 scenarios | connect→new chat→send→receive→unread→status ticks; reply arrives while on another chat → badge + toast; reload persistence; disconnect handling; mobile viewport; a11y axe pass |
| Coverage | Vitest v8 coverage | ≥85% for `shared/**` and domain code of `entities/**`, `features/**` | enforced in CI (thresholds fail build) |

CI (GitHub Actions): lint → typecheck → unit+component (coverage) → build → e2e (mock) — must be green before merge to `main`.

## 7. Tooling & quality gates

- pnpm, Node 22 (`.nvmrc`, `engines`), Vite 8, React 19, TS `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- **Biome 2** (single linter+formatter — replaces ESLint + Prettier; no comment-on-code conflicts, `biome.json` covers base tsconfig-aware rules; type-level checking stays with `tsc --noEmit`). Biome has no FSD-boundary plugin: a small `pnpm check:arch` script enforces import direction (app → widgets → features → entities → shared) in CI + pre-commit. EditorConfig kept for non-Biome files.
- Git: conventional commits (commitlint), lefthook pre-commit (`biome check --write` staged + `check:arch`) and pre-push (typecheck + tests) — **all of this lands in the T9 hardening pass, deliberately not on Day 1** (schedule protection: T0 stays product-focused). Single `main` (task scale) — feature branches merge squash.
- Dedicated quality iterations inside the schedule (see §8): refactor/no-comment rule (project rule: no comments in code), dead-code sweep (knip), a11y (axe in e2e, focus management), performance (virtualized message list from day 1 via @tanstack/react-virtual, lazy emoji modal, bundle budget gzip < 300KB initial).
- README continuously updated (requirement). CHANGELOG.md kept.

## 8. Schedule — 5 working days (tasks: docs/TASKS.md)

| Day | Tasks | Outcome |
|---|---|---|
| D1 | T0 scaffold+gates, T1 API client+rate queue, T2 connect screen+bootstrap | Running shell with quality gates; connect works against live instance |
| D2 | T3 notification engine, T4 stores/history merge | Live receive works end-to-end in console/dev |
| D3 | T5 chat list UI, T6 conversation UI, T7 composer send flow | Demo flow #1–#4 works (send text, see reply) |
| D4 | T8 MVP-2 (ticks, unread, reconnect UX, mobile), T9 pyramid hardening + e2e | Robust; coverage ≥85%; e2e green |
| D5 | T10 deploy Railway + README/deploy instructions, T11 final QA + submission package | Live URL, screenshots/video, README freeze, submission checks |

## 9. Deployment (Railway.com)

- Dockerfile multi-stage: pnpm fetch+build → nginx alpine; `nginx.conf`: gzip, `Cache-Control` for hashed assets, index no-cache, SPA fallback, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `/healthz` 200.
- Env at build: none required for runtime (credentials are user-entered); optional `VITE_GREENAPI_*` prefill for dev only. `robots.txt` disallow.
- README: one-click GitHub-flow instructions + `railway up` alternative; production URL documented.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Telegram bridge schema drift (already observed) | Tolerant mappers + fixtures captured live in `docs/resources/` |
| Phone→chat resolution: `checkWhatsapp` absent for Telegram | `getContactInfo` with `phone@c.us` (verified live); manual chatId entry fallback |
| Unread counters not provided by Telegram `getChats` | Client-side counters; limitation documented |
| History requires webhook settings ON, apply takes ~5 min, and pre-enable messages need logout+re-auth to appear in the journal | Idempotent `SetSettings` bootstrap on connect; app treats empty history as normal (live notifications keep flowing); "settings applying" state on first connect; limitation documented in README |
| Free "Developer" plan limits (3 chats, 100 availability checks) | UI surfaces API limit errors cleanly; demo keeps ≤3 chats; not a code concern |
| `followup.txt` (contains the real token) and personal data must never reach the public repo | Private files gitignored **before** T0 `git init` (T0 AC asserts it); docs contain redacted identifiers only (D8) |
| Two parallel sessions editing `docs/PROGRESS.md` | Board tasks run strictly sequentially until D4-day pair T5/T6 — and even then one branch merges first; PROGRESS is append-only by rule |
| 5-day budget | Tiered scope (§3), feature-freeze discipline, e2e scope minimal by design |
| Token exposure in demo screens | Masked input, never logged/committed; mock mode for public demo |
| Mantine 9 fresh (9.8, needs React 19.2+) | Pinned versions at scaffold time; core components only |

## 11. Definition of done (submission)

1. GitHub repo: FSD app, tests (pyramid, thresholds enforced), CI green, README with local-run instructions (link #2–#3 of the submission format).
2. Deployed to Railway, public URL (link #4).
3. Screenshots/video (link #5) following expected result: credentials → phone → new chat → send → reply appears.
4. Email to hr@green-api.com: «Тестовое задание на должность - Фронтенд разработчик React» + CV pdf + links.
5. Demo script runs against the real Telegram instance: connect → enter phone → chat → send "Привет!" → reply received live → badge cleared → ticks progress.
