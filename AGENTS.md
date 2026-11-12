# AGENTS.md — working conventions for AI sessions in this repo

This is a test task for a job application (GREEN-API, React frontend). **Code quality is the primary grading criterion** — leave every file better than conventions require, never take shortcuts.

## Read before starting (mandatory)

1. `AGENTS.md` (this file)
2. `docs/PROGRESS.md` — current task statuses, handoff block, decisions D1–D7
3. `docs/PLAN.md` — architecture, UI spec, verified API facts (§2 is authoritative over external docs when they conflict)
4. The current task spec in `docs/TASKS.md` (T0–T11)

## Update before ending (mandatory)

- `docs/PROGRESS.md`: flip task status, rewrite the **Current handoff** block, append the **Session log** row, append any new **Decisions & gotchas**.
- `README.md` if setup/scripts/architecture/deployment claims changed.
- Keep append-only log sections intact; never rewrite past entries.

## Hard rules (apply during all coding)

- pnpm only (`pnpm-lock.yaml` is the lockfile). Node 22 LTS.
- Feature Sliced Design import direction only (app → widgets → features → entities → shared); public APIs via `index.ts` barrels.
- **No comments in code** — not even “temporary” ones. Self-documenting names instead.
- UI strings centralized in `shared/config/i18n.ts` — no string literals left in components.
- No `dangerouslySetInnerHTML`; no `any` (except narrow test fixtures with lint exception); no raw `fetch` outside `shared/api/greenapi/http-client.ts`.
- All GREEN-API calls go through the per-method rate queue (see D4 in PROGRESS).
- Never commit real credentials (idInstance/apiTokenInstance). Fixtures only from `docs/resources/`.

## Workflow

- One task per session, from `docs/TASKS.md`; one feature branch `feat/tN-slug`; end each task with a squash-style commit set on CI green.
- Definition of done per task: `pnpm lint` · `pnpm typecheck` · `pnpm test` (coverage ≥85% for shared/domain code) · `pnpm build` all green, README/PROGRESS updated.
- If scope grows beyond the current task, stop, record the finding in PROGRESS (Decisions), and continue with the next planned step — scope discipline is part of the grade (PLAN §3 tiers).

## Useful pointers

- API contracts: `docs/resources/green-api/` (v2/Telegram) and `docs/resources/green-api/v3/` (MAX), live-verified behaviors summarized in PLAN §2.
- UI prototype reference: `docs/resources/max-web-ui/` (+ web.max.ru manually for visual checks).
- Test pyramid expectations: PLAN §6; Playwright runs in mock mode (`VITE_API_MODE=mock`) via MSW.
