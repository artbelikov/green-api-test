# Session prompt — start or continue development

Paste the block below into any new AI session working in this repo. It is task-agnostic: the session discovers what to do from `docs/PROGRESS.md`, so it works for T0 (fresh start) and every task after it. Keep this file updated if the protocol changes.

---

```text
You are continuing development of the Green API Messenger test task (GREEN-API, React).
A previous session may have finished work — trust the tracker files, not your assumptions.

PROTOCOL (mandatory, in order)
1. Read AGENTS.md — binding rules for this repo (stack, FSD, no comments, secrets, workflow).
2. Read docs/PROGRESS.md — task board + "Current handoff" block. Your task is the one named
   in the handoff, or the first `todo` task on the board. If the board says everything is
   done, stop and report instead of inventing work.
3. Read docs/PLAN.md (architecture, verified API facts in §2 — they override external docs
   on conflict; UI spec in §5) and your task's section in docs/TASKS.md.
4. If your task touches external APIs, check docs/RESOURCES.md for the saved contract pages.
   If it is a UI task, the styling contract is docs/resources/max-web-ui/visual-spec.md.

SCOPE DISCIPLINE
- Implement ONLY your assigned task from docs/TASKS.md. If scope grows, STOP, record the
  finding in docs/PROGRESS.md (Decisions), and finish the assigned task as specified.
- If blocked, set the task status to `blocked:reason` on the board, explain it in the
  handoff block, and end the session — do not silently switch to another task.

DEFINITION OF DONE (all green before you report completion)
- pnpm lint · pnpm typecheck · pnpm test (coverage thresholds enforced) · pnpm build
- README updated if setup/scripts/architecture/deployment claims changed.
- Work committed per AGENTS.md workflow (task branch, conventional commits, CI green).

BEFORE ENDING (mandatory — AGENTS.md contract)
- docs/PROGRESS.md: flip your task's status, rewrite the "Current handoff" block so the
  next session knows exactly where to resume (next task, live-system state, blockers),
  append a Session log row, append any new Decisions & gotchas (append-only — never
  rewrite past entries).
- Push your branch / merge per the workflow; the tracker edit is part of the task.

HARD CONSTRAINTS (repeated for safety — full list in AGENTS.md)
- pnpm only, Node 22. No code comments anywhere. UI copy centralized in shared/config/i18n.ts.
- No raw fetch outside shared/api/greenapi/http-client.ts; all GREEN-API calls through the
  per-method rate queue (see PROGRESS D4).
- Never commit real credentials or private files (followup.txt, taskdesc.txt, redirect.pdf).
- Fresh clone with no src/? The board says so — start from T0 exactly as written there.
```

---

Notes:
- The prompt is deliberately self-locating: nothing in it names the current task, so it never goes stale.
- For a *brand-new* repo the only prerequisite is that `AGENTS.md` / `docs/` exist (they do, committed) — the prompt routes a fresh clone to T0 automatically.
- If a session must be re-run after a failed one, add one line before the protocol: `The previous session attempted task T<N> but did not finish — check PROGRESS.md handoff for its state and continue or redo it.`
