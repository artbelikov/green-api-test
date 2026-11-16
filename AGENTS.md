# AGENTS.md — working conventions for AI sessions in this repo

This is a test task for a job application (GREEN-API, React frontend). **Code quality is the primary grading criterion** — leave every file better than conventions require, never take shortcuts.

## Cross-session state lives in the project-memory MCP store (mandatory)

Plan, task board, decisions (stable D-number anchors), the handoff block, and the session log live in the **project-memory MCP server** — not in repo files. `docs/PLAN.md`, `docs/TASKS.md`, `docs/PROGRESS.md` are a frozen 2026-11-16 snapshot of that state (kept for provenance); do not edit them. `docs/resources/` stays the API-contract and visual-spec home.

Read before starting (MCP tools):

1. `project-memory_overview` — dashboard (task counts, handoff, recent decisions / session log)
2. `project-memory_handoff_get` + `project-memory_task_next` — where to resume / what to work on; if everything is done or cancelled, stop and report instead of inventing work
3. Deeper lookups: `project-memory_plan_list` / `project-memory_plan_get` (the `verified-facts` section is authoritative over external docs), `project-memory_decision_get D<n>` for any D-number, `project-memory_search`

Update before ending (MCP tools):

- Flip task status at every state change (`project-memory_task_update`); record durable facts/gotchas as they are discovered (`project-memory_decision_append`).
- Append one condensed outcome line (`project-memory_session_log_add`); refresh the handoff sections you own (`project-memory_handoff_set`: `last-completed`, `next-up`, plus `blockers`/`follow-ups` when relevant).
- `README.md` if setup/scripts/architecture/deployment claims changed.

## Hard rules (apply during all coding)

- pnpm only (`pnpm-lock.yaml` is the lockfile). Node 22 LTS.
- Feature Sliced Design import direction only (app → widgets → features → entities → shared); public APIs via `index.ts` barrels.
- **No comments in code** — not even "temporary" ones. Self-documenting names instead.
- UI strings centralized in `shared/config/i18n.ts` — no string literals left in components.
- No `dangerouslySetInnerHTML`; no `any` (except narrow test fixtures with lint exception); no raw `fetch` outside `shared/api/greenapi/http-client.ts`.
- All GREEN-API calls go through the per-method rate queue (store decision **D4**; the migration's D-slot quirks are recorded in **D86**).
- Never commit real credentials (idInstance/apiTokenInstance). Fixtures only from `docs/resources/`.

## Workflow

- One task per session, from the store's task board (`project-memory_task_next`); one feature branch `feat/tN-slug`; end each task with a squash-style commit set on gates green.
- Definition of done per task: `pnpm lint` · `pnpm typecheck` · `pnpm test` (coverage ≥85% for shared/domain code) · `pnpm build` all green, README updated.
- Sessions run strictly sequentially (one writer of the store). If scope grows beyond the current task, stop, record the finding as a store decision, and continue with the next planned step — scope discipline is part of the grade (tiers in the store's `scope` plan section).

## Useful pointers

- API contracts: `docs/resources/green-api/` (v2/Telegram) and `docs/resources/green-api/v3/` (MAX); live-verified behaviors summarized in the store's `verified-facts` plan section (authoritative over external docs on conflict).
- UI prototype reference: `docs/resources/max-web-ui/` (+ web.max.ru manually for visual checks).
- Test pyramid expectations: the store's `testing-strategy` plan section; Playwright runs in mock mode (`VITE_API_MODE=mock`) via MSW.
