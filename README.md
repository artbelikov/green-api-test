# Green API Messenger (Telegram)

A messenger web client built as a **test task for the “Фронтенд разработчик React” position at GREEN-API** ([vacancy](https://astana.hh.kz/vacancy/139289090), task text in `taskdesc.txt`). The task targets the MAX messenger via GREEN-API with Telegram explicitly allowed as an alternative — this project implements **Telegram** (the instance was registered and verified); because GREEN-API uses one unified gateway (`/waInstance{id}/{method}/{token}`) across WhatsApp, Telegram, and MAX, the same client can be pointed at a MAX instance by changing only credentials (see `docs/PLAN.md` §2).

Scope kept deliberately minimal per the task: **text-only messaging** — connect with GREEN-API credentials, create a chat by entering the recipient's phone number, send a message via `sendMessage`, receive replies live via the notification HTTP API long-poll, with a two-pane UI prototyped after [web.max.ru](https://web.max.ru/).

> Stack: Vite 8 · React 19 · TypeScript (strict) · Mantine 9 · TanStack Query 5 · Zustand 5 · Feature Sliced Design · Biome 2 · Vitest + Testing Library + MSW (test pyramid) · deployed to Railway.com

**Status: live-receive milestone (T3) merged — T1 (API client) + T2 (session/connect/bootstrap) + T3 (notification engine long-poll) on `main`; chat UI tasks T4+ in flight** (see `docs/PROGRESS.md` for the live board).

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

Mock/demo mode (no instance required): boot with `VITE_API_MODE=mock`, or open any page with **`?mock=1`** (runtime activation for reviewers — credentials are prefilled, any values connect). A scripted MSW fake gateway answers `getStateInstance`, `getSettings`/`setSettings`, and `getContactInfo`, including 401 error paths for an `invalid-token` value.

## Scripts

| Script                        | Purpose                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                    | Vite dev server                                            |
| `pnpm build`                  | Type-check then production build to `dist/`                |
| `pnpm preview`                | Preview the production build                               |
| `pnpm lint` / `pnpm lint:fix` | Biome (check / check --write)                              |
| `pnpm typecheck`              | `tsc -b` over both TS projects                             |
| `pnpm test`                   | Vitest run with v8 coverage (thresholds enforced)          |
| `pnpm test:watch`             | Vitest in watch mode                                       |
| `pnpm msw:init`               | Regenerate `public/mockServiceWorker.js` after MSW updates |

Planned, wired by later tasks: `pnpm test:e2e` (Playwright, T8) and `pnpm check:arch` (FSD import-direction script, T9) — see `docs/TASKS.md`.

Every `git commit` runs [lefthook](https://github.com/evilmartians/lefthook) pre-commit hooks (`pnpm lint` + full `pnpm test` with coverage; installed automatically by `pnpm install` via the `prepare` script). `git commit --no-verify` skips them in emergencies.

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
  pages/      routed screens (connect, placeholder shell)
  widgets/    layout blocks (chat list pane, conversation, …)
  features/   user flows (connect, new chat, send message)
  entities/   live-sync stores (session, chats, messages)
  shared/     api client + rate queue, config (i18n, theme), ui, mocks, lib
```

Import direction is strictly downwards (app → widgets → features → entities → shared); every slice exposes its public API via `index.ts`. UI copy lives in `src/shared/config/i18n.ts`.

## Testing

Pyramid per `docs/PLAN.md` §6: Vitest unit (mappers, phone normalization, rate queue), Vitest+MSW integration (notification engine), Testing Library component tests, Playwright e2e in mock mode (from T8). Coverage thresholds (85% for `shared/**`, `entities/**`, `features/**`) are enforced on every `pnpm test`.

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
