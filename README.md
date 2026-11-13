# Green API Messenger (Telegram)

A messenger web client built as a **test task for the “Фронтенд разработчик React” position at GREEN-API** ([vacancy](https://astana.hh.kz/vacancy/139289090), task text in `taskdesc.txt`). The task targets the MAX messenger via GREEN-API with Telegram explicitly allowed as an alternative — this project implements **Telegram** (the instance was registered and verified); because GREEN-API uses one unified gateway (`/waInstance{id}/{method}/{token}`) across WhatsApp, Telegram, and MAX, the same client can be pointed at a MAX instance by changing only credentials (see `docs/PLAN.md` §2).

Scope kept deliberately minimal per the task: **text-only messaging** — connect with GREEN-API credentials, create a chat by entering the recipient's phone number, send a message via `sendMessage`, receive replies live via the notification HTTP API long-poll, with a two-pane UI prototyped after [web.max.ru](https://web.max.ru/).

> Stack: Vite 8 · React 19 · TypeScript (strict) · Mantine 9 · TanStack Query 5 · Zustand 5 · Feature Sliced Design · Biome 2 · Vitest + Testing Library + MSW (test pyramid) · deployed to Railway.com

**Status: MVP-2 complete (T1–T8 on `main`), T9 hardening done — API client, session/connect/bootstrap, notification engine long-poll, chats/messages stores with history hydrate, unread counters, optimistic send, the MAX-Web chat list (nav rail, list pane, search, new-chat modal), the conversation pane (doodle wallpaper, floating header, day-grouped white/mint bubbles, status ticks, virtualized message list with scroll anchoring and jump-to-latest), the composer (floating pill with mic→send swap, Enter/Shift+Enter, 4000-char guard, offline disable, failed-bubble retry), MVP-2 credibility (background-chat unread toasts, connection chip with a reconnecting state + auto-reconnect banner, failed-bubble tooltip, mobile single-pane layout), and the QA layer: Playwright e2e + axe, the full e2e scenario list, code-splitting with a <300 KB gzip initial budget, knip/commitlint/FSD-arch automation, and lefthook staging+push gates** (see `docs/PROGRESS.md` for the live board).

## Requirements

- Node.js 22 LTS, pnpm 10+ (`packageManager` pins the exact version; Node 22 enforced via `engines` and `.nvmrc`)
- A GREEN-API instance (Telegram type) — [free "Developer" plan](https://green-api.com/telegram): register, pass Telegram authorization in their console, get `apiUrl`, `idInstance`, `apiTokenInstance`.

## Getting started

```bash
pnpm install
cp .env.example .env   # optional: pre-fill credentials for local dev (gitignored)
pnpm dev
```

`pnpm dev` opens the **connect screen**: enter your GREEN-API `idInstance` and `apiTokenInstance` (apiUrl is editable under _Advanced settings_) and press _Connect_. The app validates the credentials via `getStateInstance`, persists the session in `localStorage` (survives reloads), and bootstraps the webhook settings (`incomingWebhook`, `outgoingMessageWebhook`, `outgoingWebhook`, `stateWebhook`) once via `SetSettings` — idempotent, `webhookUrl` stays empty. Since the instance applies settings server-side for up to ~5 minutes, a "settling in" notice is shown until then, and empty `getChatHistory` results are normal during that window. _Disconnect_ clears the stored session.

Mock/demo mode (no instance required): boot with `VITE_API_MODE=mock`, or open any page with **`?mock=1`** (runtime activation for reviewers — credentials are prefilled, any values connect). The scripted MSW fake gateway answers `getStateInstance`, `getSettings`/`setSettings`, `getContactInfo`, `getChats`, `getContacts`, `getAvatar` (no photo — initials fallback), `sendMessage` (echoes a delivery webhook and schedules a scripted incoming auto-reply ~1.2 s later so the receive flow can be demoed end-to-end), `getChatHistory` (newest-first journal of the mock message log), `readChat`, and the notification receive/ack pair. The demo contact `79991234567` resolves to a named profile; any other phone creates a chat named by the phone (mirroring live unknown-recipient behavior). Chat data (summaries and up to 200 messages per chat) persists in `localStorage` across reloads and is cleared on _Disconnect_. The mock layer ships in a deferred async chunk (loaded only when mock mode activates) and exposes fault-injection controls on `window.mockGateway` (`pollOutage` 500s to exercise reconnect recovery, `invalidate` to force a session-invalidating 401) that the e2e suite drives.

## Scripts

| Script                        | Purpose                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm dev`                    | Vite dev server                                                                           |
| `pnpm build`                  | Type-check then production build to `dist/`                                               |
| `pnpm preview`                | Preview the production build                                                              |
| `pnpm lint` / `pnpm lint:fix` | Biome (check / check --write)                                                             |
| `pnpm typecheck`              | `tsc -b` over both TS projects                                                            |
| `pnpm test`                   | Vitest run with v8 coverage (thresholds enforced)                                         |
| `pnpm test:watch`             | Vitest in watch mode                                                                      |
| `pnpm test:e2e`               | Playwright e2e (mock mode; auto-starts the dev server)                                    |
| `pnpm check:arch`             | FSD import-direction check (downward layers, barrel-only cross-slice imports)             |
| `pnpm check:knip`             | knip dead-file / dead-dependency / dead-export sweep                                      |
| `pnpm check:bundle`           | Enforces the <300 KB gzip initial-payload budget against `dist/` (run after `pnpm build`) |
| `pnpm msw:init`               | Regenerate `public/mockServiceWorker.js` after MSW updates                                |

E2e runs against a Vite dev server launched in mock mode by Playwright (`webServer` in `playwright.config.ts`) — install the browser once with `pnpm exec playwright install chromium`, then `pnpm test:e2e`. Retries stay off locally so flake is caught honestly (`retries: 2` applies only under `CI`).

Every git operation is guarded by [lefthook](https://github.com/evilmartians/lefthook) hooks (installed automatically by `pnpm install` via the `prepare` script): `pre-commit` lints+formats only the staged files (`biome check --write --staged`) and runs `pnpm check:arch`; `commit-msg` enforces conventional commits via commitlint; `pre-push` runs `pnpm typecheck`, the full unit suite with coverage, and `pnpm check:knip`. `git commit --no-verify` / `git push --no-verify` skip them in emergencies. `BUILD_STATS=1 pnpm build` additionally emits a rollup-plugin-visualizer treemap (`bundle-stats.html`, gitignored) for bundle composition analysis.

## Environment variables

| Variable                | Meaning                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `VITE_API_MODE`         | `live` (default, real GREEN-API calls) or `mock` (MSW fake gateway)       |
| `VITE_GREENAPI_API_URL` | Optional prefill of the gateway URL (default `https://api.green-api.com`) |
| `VITE_GREENAPI_ID`      | Optional prefill of `idInstance`                                          |
| `VITE_GREENAPI_TOKEN`   | Optional prefill of `apiTokenInstance` — never commit real values         |

Credentials entered in the UI are stored only in the browser's `localStorage`; the repo never contains real instance data (`followup.txt`, `taskdesc.txt`, `redirect.pdf` stay gitignored).

## Project structure (Feature Sliced Design)

```text
src/
  app/        bootstrap, providers, mock worker wiring
  pages/      routed screens (connect, messenger shell)
  widgets/    layout blocks (nav rail, chat list pane, conversation, …)
  features/   user flows (connect session, open chat, pick chat, send message)
  entities/   live-sync stores (session, chats, messages) + chat UI (avatar, row) + message UI (bubble, date divider, status ticks)
  shared/     api client + rate queue, config (i18n, theme), ui, mocks, lib
```

Import direction is strictly downwards (app → widgets → features → entities → shared) and enforced by `pnpm check:arch` (same-layer cross-slice imports go through the slice's public API barrel; `shared` deep imports are allowed; `.module.css` cross-slice imports are the one pragmatic exception). Every slice exposes its public API via `index.ts`. UI copy lives in `src/shared/config/i18n.ts`.

## Testing

Pyramid per `docs/PLAN.md` §6: Vitest unit (mappers, phone normalization, rate queue), Vitest+MSW integration (notification engine, mock gateway contract), Testing Library component tests, and the Playwright e2e suite in mock mode (`pnpm test:e2e`): connect (valid/invalid credentials + inline validation), new chat by phone (known contact resolves by name, unknown keeps the phone), send/receive happy path, status ticks (sent→delivered→read escalation via `outgoingMessageStatus`), poll-outage/ reconnect recovery and session-invalidation flows, unknown-webhook resilience, reload persistence (session + chats + messages), the mobile single-pane layout with back navigation, the real-browser virtualizer/autoscroll check, background-chat unread toasts, and an axe pass with zero critical violations. Coverage thresholds (85% for `shared/**`, `entities/**`, `features/**`) are enforced on every `pnpm test` and the coverage artifacts (text, HTML, JSON summary) land in `coverage/`; initial payload is budget-checked by `pnpm check:bundle` (<300 KB gzip, currently ~157 KB with the mock layer and messenger page deferred).

There is no GitHub Actions pipeline by design: Railway builds and deploys `main` (task T10), and the task gate is `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` all green before every merge.

## Documentation

- `AGENTS.md` — binding conventions for AI coding sessions in this repo
- `docs/PROGRESS.md` — living task board + handoff between sessions (the development status lives here)
- `docs/PLAN.md` — architecture, verified API facts, UI spec, testing strategy, risks
- `docs/TASKS.md` — build roadmap decomposed into ordered tasks
- `docs/RESOURCES.md` — research index; `docs/resources/green-api/` — saved official API contract pages

## Security notes

- GREEN-API credentials grant full account access; never commit them, never share screenshots showing the token.
- Private task files (`followup.txt` with the real token, `taskdesc.txt`, `redirect.pdf`) are gitignored — they stay local forever.
- Rate limits apply per method (see `docs/resources/green-api/ratelimiter.md`); the client will respect them via the per-method rate queue (T1).

## Deployment

Production is served as a static SPA on Railway, which builds and deploys on push to `main` — Railway is the delivery pipeline (no GitHub Actions). Platform config (build, SPA fallback, headers, `/healthz`) lands on day 5 (task T10).

## Submission package

Per the task instructions the final delivery is sent to hr@green-api.com: CV pdf / GitHub repo link / local-run instructions / deployed service link / screenshots. The checklist lives in `docs/PLAN.md` §11.

---

Built for the GREEN-API test task. The product homepage: [green-api.com/max](https://green-api.com/max) · [green-api.com/telegram](https://green-api.com/telegram).
