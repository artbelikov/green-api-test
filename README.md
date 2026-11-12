# Green API Messenger (Telegram)

A messenger web client built as a **test task for the “Фронтенд разработчик React” position at GREEN-API** ([vacancy](https://astana.hh.kz/vacancy/139289090), task text in `taskdesc.txt`). The task targets the MAX messenger via GREEN-API with Telegram explicitly allowed as an alternative — this project implements **Telegram** (the instance was registered and verified); because GREEN-API uses one unified gateway (`/waInstance{id}/{method}/{token}`) across WhatsApp, Telegram, and MAX, the same client can be pointed at a MAX instance by changing only credentials (see `docs/PLAN.md` §2).

Scope kept deliberately minimal per the task: **text-only messaging** — connect with GREEN-API credentials, create a chat by entering the recipient's phone number, send a message via `sendMessage`, receive replies live via the notification HTTP API long-poll, with a two-pane UI prototyped after [web.max.ru](https://web.max.ru/).

> Stack: Vite · React · TypeScript · Mantine UI · TanStack Query · Zustand · Feature Sliced Design · Vitest + Testing Library + MSW + Playwright (test pyramid) · deployed to Railway.com

**Status: planning complete — implementation in progress** (see `docs/PLAN.md`, `docs/TASKS.md`).

## Requirements

- Node.js 22 LTS, pnpm 9+
- A GREEN-API instance (Telegram type) — [free "Developer" plan](https://green-api.com/telegram): register, pass Telegram authorization in their console, get `apiUrl`, `idInstance`, `apiTokenInstance`.

## Getting started

```bash
pnpm install
cp .env.example .env   # optional: pre-fill credentials for local dev (gitignored)
pnpm dev
```

Without credentials the app opens a **connect screen** — enter the three values from the GREEN-API console; they are stored only in your browser's `localStorage`.

Mock/demo mode (no instance required): `VITE_API_MODE=mock` serves a scripted fake API via MSW.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm lint` / `pnpm lint:fix` | Biome (check / check --write); `pnpm check:arch` verifies FSD import direction |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (unit + component + integration, coverage) |
| `pnpm test:e2e` | Playwright suite (mock mode) |

## Documentation

- `AGENTS.md` — binding conventions for AI coding sessions in this repo
- `docs/PROGRESS.md` — living task board + handoff between sessions (the development status lives here)
- `docs/PLAN.md` — architecture, verified API facts, UI spec, testing strategy, risks
- `docs/TASKS.md` — build roadmap decomposed into ordered tasks
- `docs/RESOURCES.md` — research index; `docs/resources/green-api/` — saved official API contract pages

## Security notes

- GREEN-API credentials grant full account access; never commit them, never share screenshots showing the token.
- Private task files (`followup.txt` with the real token, `taskdesc.txt`, `redirect.pdf`) are gitignored — they stay local forever.
- Rate limits apply per method (see `docs/resources/green-api/ratelimiter.md`); the client respects them.

## Deployment

Production is served as a static SPA on Railway (Docker + nginx with SPA fallback). Deployment guide lands here on day 5 (task T10).

## Submission package

Per the task instructions the final delivery is sent to hr@green-api.com: CV pdf / GitHub repo link / local-run instructions / deployed service link / screenshots. The checklist lives in `docs/PLAN.md` §11.

---

Built for the GREEN-API test task. The product homepage: [green-api.com/max](https://green-api.com/max) · [green-api.com/telegram](https://green-api.com/telegram).
