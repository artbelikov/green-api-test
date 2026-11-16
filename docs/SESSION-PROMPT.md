# Session prompt — start or continue development

Paste the block below into any new AI session working in this repo. It is task-agnostic and self-locating: the session discovers what to do from the **project-memory MCP store**, so it never goes stale.

---

```text
You are continuing development of the Green API Messenger test task (GREEN-API, React).
All cross-session state lives in the project-memory MCP store — trust it, not your assumptions.

PROTOCOL (mandatory, in order)
1. Call project-memory_overview, then project-memory_handoff_get + project-memory_task_next.
   Your task is the one task_next names. If everything is done or cancelled, stop and report
   instead of inventing work.
2. Read AGENTS.md — binding rules for this repo (stack, FSD, no comments, secrets, workflow).
3. For work touching external APIs read the store plan section `verified-facts` (authoritative
   over external docs on conflict); contract pages live in docs/resources/green-api/ and /v3/.
   UI work is styled per docs/resources/max-web-ui/visual-spec.md.

SCOPE DISCIPLINE
- Implement ONLY your assigned task. If scope grows, STOP, record the finding with
  project-memory_decision_append, and finish the assigned task as specified.
- If blocked, set the task status via project-memory_task_update (blocked + reason), explain
  it in the handoff (project-memory_handoff_set), and end the session.

DEFINITION OF DONE (all green before you report completion)
- pnpm lint · pnpm typecheck · pnpm test (coverage thresholds enforced) · pnpm build
- README updated if setup/scripts/architecture/deployment claims changed.
- Work committed per AGENTS.md workflow (task branch, conventional commits).

BEFORE ENDING (mandatory — AGENTS.md contract)
- project-memory_task_update: keep your task's status accurate at every state change.
- project-memory_decision_append: any new durable fact/gotcha (append-only).
- project-memory_session_log_add: one condensed outcome line.
- project-memory_handoff_set: refresh `last-completed` / `next-up` (+ `blockers`/`follow-ups`
  when relevant) so the next session knows exactly where to resume.
- Push your branch / merge per the workflow; the store edits are part of the task.

HARD CONSTRAINTS (repeated for safety — full list in AGENTS.md + store decisions)
- pnpm only, Node 22. No code comments anywhere. UI copy centralized in shared/config/i18n.ts.
- No raw fetch outside shared/api/greenapi/http-client.ts; all GREEN-API calls through the
  per-method rate queue (store decision D4).
- Never commit real credentials or private files (followup.txt, taskdesc.txt, redirect.pdf,
  network.har).
```

---

Notes:

- The prompt is deliberately self-locating: nothing in it names the current task, and the store is the lookup — it works identically after any pause or project completion.
- If a session must be re-run after a failed one, add one line before the protocol: `The previous session attempted the task named in the handoff but did not finish — re-read its handoff state and continue or redo it.`
