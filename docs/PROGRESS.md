# PROGRESS — living tracker between AI sessions

Single source of truth for cross-session state. **Every AI session: read this file (plus `AGENTS.md`) before starting work and update it before ending.** Append-only sections (Session log, Decisions) — never rewrite history entries.

Statuses: `todo` / `in-progress` / `blocked:reason` / `done`.

## Task board

| Task | Day | Status | Branch / PR | Notes |
|---|---|---|---|---|
| T0 scaffold + gates | D1 | todo | — | |
| T1 API client + rate queue + mappers | D1 | todo | — | |
| T2 session + connect + bootstrap | D1 | todo | — | |
| T3 notification engine | D2 | todo | — | |
| T4 chats/messages stores | D2 | todo | — | |
| T5 chat list + new chat modal | D3 | todo | — | |
| T6 conversation pane + bubbles | D3 | todo | — | |
| T7 composer + send flow | D3 | todo | — | |
| T8 MVP-2: ticks, reconnect, mobile | D4 | todo | — | |
| T9 test pyramid hardening | D4 | todo | — | |
| T10 Railway deploy + README | D5 | todo | — | |
| T11 final QA + submission | D5 | todo | — | |

## Current handoff (update this block at session end)

- **Last completed:** planning (docs only; no app code yet)
- **Next up:** T0 (scaffold + quality gates) — start exactly here
- **Blockers / open questions:** none
- **Live instance state:** Telegram instance authorized, webhook flags currently OFF (bootstrap in T2 must flip them)

## Session log (append-only)

| Date | Session (branch) | Worked on | Outcome |
|---|---|---|---|
| 2026-11-12 | plan (main) | Docs research: 41 v2 + 16 v3 API pages saved, live API probes (CORS, chatId formats, getContactInfo phone resolution), MAX Web UI guides | `docs/PLAN.md`, `docs/TASKS.md`, `docs/RESOURCES.md` complete; scope = taskdesc.txt, 5-day plan; app not started |
| 2026-11-12 | plan (main) | Reiterations: taskdesc read (scope re-cut to 5-day text-only), Biome 2 decision, MAX visual contract from real screenshots (`visual-spec.md`), expected-result trace validation | Plan obeys all 8 requirements + 5 expected-result bullets (Telegram substitution); T4/T5 AC refined: unknown-phone resolution returns empty profile (create chat named by phone, verified live), unknown-chatId upsert on incoming |

## Decisions & gotchas (append-only, numbered)

- **D1** — Chat ids are opaque strings returned by the API (bare numeric / `-100…`); never synthesize `@c.us` for ids *except* the phone→`phone@c.us` form passed only to `getContactInfo` for resolution (verified live).
- **D2** — `checkWhatsapp` returns 404 on this Telegram instance; phone resolution goes through `getContactInfo`.
- **D3** — CORS is fully open (`*`): pure SPA, no backend, ever.
- **D4** — Rate limits per method are hard (history/contacts 1 rps) — all API calls go through the per-method rate queue, never raw fetch.
- **D5** — `getChatHistory` returns empty unless `incomingWebhook`/`outgoingMessageWebhook` flags are ON — T2 bootstrap flips them idempotently.
- **D6** — receiveNotification timeout up to 60s; engine uses 25s; ack after store apply; backoff on errors; abort on disconnect.
- **D7** — No code comments anywhere (project rule); UI copy centralized in `shared/config/i18n.ts`; treat PLAN §2 live-verified facts as authoritative over docs text.
- **D8** (post-plan reiteration) — PII hygiene: PLAN §2 identifiers redacted; `followup.txt` (real token), `taskdesc.txt`, `redirect.pdf` are gitignored **before** T0 `git init`; fixtures must use redacted/synthetic ids only.
- **D9** (post-plan reiteration) — Webhook-settings apply takes up to ~5 min; history of messages received before enabling requires logout+re-auth to appear in the journal. First-connect UX must tolerate empty `getChatHistory` (live notifications keep flowing); document as limitation.
- **D10** (post-plan reiteration) — Free Developer plan: 3-chat limit, 100 availability checks — demo stays ≤3 chats; surface API limit errors as toasts.
- **D11** (post-plan reiteration) — Sessions run strictly sequentially; the active session owns `docs/PROGRESS.md` until its merge (parallel T5/T6 must coordinate explicitly).
- **D12** (user decision) — Lint/format tooling: **Biome 2** instead of ESLint+Prettier (single tool, `biome check --write` in hooks/CI). Biome has no FSD-boundary plugin → T0 adds a small `pnpm check:arch` script enforcing import direction. Type-level checks remain `tsc --noEmit`, separate from Biome.
- **D13** (visual identity verified) — Real MAX Web screenshots downloaded & read (`docs/resources/max-web-ui/screenshots/` + `visual-spec.md`): layout is **three-column** (labeled icon rail / chat list / conversation), conversation sits on a **light-blue doodle wallpaper**, incoming bubbles solid white, outgoing **translucent mint**, accents are **blue** (~#1D7DF2) — the earlier `#6641FF` purple-accent assumption was wrong and is corrected everywhere; composer = floating pill with mic→send swap; read ticks turn blue. T5/T6/T7 scope & AC updated to the visual contract.
- **D14** (tech-lead self-review) — Schedule protection: T0 slimmed to product-critical gates (knip, lefthook, commitlint, `check:arch` deferred to T9); delivery ticks: pending→sent + failed mandatory, delivered/read best-effort (Telegram bridge may skip them); mock mode also activatable via `?mock=1` URL param (reviewer path); README must carry reviewer guidance + full limitation list (incl. `readChat` marks the linked real account's chats read).
