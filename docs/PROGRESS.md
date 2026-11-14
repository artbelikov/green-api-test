# PROGRESS — living tracker between AI sessions

Single source of truth for cross-session state. **Every AI session: read this file (plus `AGENTS.md`) before starting work and update it before ending.** Condensed 2026-11-14 (user request) from a 122 KB log into one terse page; the verbose per-session history ends here by design. New sessions keep the page short: one line per decision/log event. D-numbers stay stable as stable anchors for the decisions below.

Statuses: `todo` / `in-progress` / `blocked:reason` / `done`.

## Task board

| Task | Status | One-line summary |
|---|---|---|
| T0 scaffold + gates | done | Vite 8.3.8 · React 19.3.1 · TS 5.9.3 strict · Mantine 9.8.0 · Biome 2.6.7 · Vitest 5.1.0 · MSW 3.0.5, FSD tree, no GitHub Actions (D18), lefthook (D19) |
| T1 API client + rate queue + mappers | done | 12 facades, RateQueue (per-method spacing + jitter + coalescing), chat/message/phone mappers |
| T2 session + connect + bootstrap | done | session store factory, idempotent SetSettings bootstrap, `?mock=1` demo mode, connect page |
| T3 notification engine | done | long-poll singleton, drain-before-repoll, ack-after-apply, backoff, 401/403 invalidate, visibility throttle |
| T4 chats/messages stores | done | zustand slices, engine→store binding, unread counters, 200/chat cap + throttled persistence |
| T5 chat list + new chat modal | done | nav rail, chat-list pane, avatars, NewChatModal (phone/nickname), getChats hydration |
| T6 conversation pane + bubbles | done | doodle wallpaper, bubbles/ticks/date dividers, @tanstack/react-virtual list, autoscroll, substates |
| T7 composer + send flow | done | pill composer, 4000-code-point validation, per-bubble failed retry |
| T8 MVP-2 (ticks/reconnect/mobile) | done | reconnecting chip + banner, background toasts, mobile single-pane, Playwright + axe e2e layer |
| T9 test pyramid hardening | done | mocks chunk + lazy messenger → 156.5 KB gzip, `check:arch`, knip, hook re-tune, 16 e2e scenarios |
| T10 Railway deploy + README | done | Dockerfile + nginx SPA runtime, deployed and live-verified; `railway.toml` dropped (D53) |
| T10.5 UX hardening | done | user-found defects fixed (D54); poll window 10 s (D57); media triage (D58) |
| T11 | — | superseded by T15 |
| T12 Tabler icons | done | all inline SVG → tree-shaken Tabler glyphs; ticks + wallpaper stay custom |
| T13 `interface` → `type` | done | 75 interfaces converted, style lint-locked with 3 ambient exemptions (D65) |
| T14 Contacts removal | done | contacts surface removed (useless on Telegram instances), getContacts facade kept (D62) |
| T14b Session-restore gate | done | `sessionResolved` flag — no connect-screen flash on refresh (D63) |
| T16 code-review fixes | done | all 15 findings fixed with behavior tests (D66) |
| T15 final QA + submission | done | full battery green, real-instance demo 9/10, README verified, `demo.webm`, v1.0.0 tagged (D68/D69) |
| Review fixes (2026-11-14) | done | D74: RateQueue drain hardening, preview-attempt state into the chats store, docs repair |

## Current handoff (update this block at session end)

- **Last completed:** review fixes of `27000c7..cef936a` (2026-11-14, uncommitted on `main`): RateQueue `#pump` wrapped in try/catch/finally so a scheduler failure fast-fails queued entries instead of wedging the slot (`D74#1`); preview-attempt bookkeeping moved from module singletons into chats-store `claimPreviewAttempt`/`discardPreviewAttempt` (identity-keyed session, `clear()` wipe — structural test isolation; cef936a's cloning reverted) (`D74#3`); D73's paste-corrupted tail trimmed; priority starvation documented as accepted (`D74#2`); `docs/PROGRESS.md` condensed to this page (verbose history retired by user request).
- **Submission package:** candidate-private, outside the repository (PLAN §11). `CHANGELOG.md` + tag **v1.0.0** on `origin/main`; the review fixes commit on top (`main`, not yet pushed at recording time); Railway redeploys on push.
- **Gates on the review-fix tree:** lint / typecheck / **355 tests** (96.44% ≥ 85 gate) / build / check:arch / check:knip / check:bundle (157.3 KB gzip initial) green; the 17 e2e were not re-run (surface untouched).
- **User follow-ups after deploy:** previews fill at 1 rps as rows render; D72 empty-space/double-bubble fixes must hold. If the double ever recurs, capture `localStorage['green-api-messenger:messages:v1']` for the affected chat — the id pair proves which sources raced.
- **Blockers / open questions:** none.
- **Live instance:** Telegram instance authorized, webhook flags ON, demo transcripts + two `sendMessage` probes present; no PII anywhere in the repo.

## Session log (condensed)

| Date | Sessions | Outcome |
|---|---|---|
| 2026-11-12 | plan ×3 (main) | API research (v2+v3 pages, live probes), PLAN/TASKS/RESOURCES complete, git repo live |
| 2026-11-12 | t0-scaffold ×2, t0-follow-up | strict scaffold merged after CI removal (D18); lefthook pre-commit added (D19) |
| 2026-11-12 | t1-api-client (main) | facades + RateQueue + mappers; contract digest from 21 saved pages |
| 2026-11-12 | t2-session-connect | stores + connect page + idempotent bootstrap + mock runtime |
| 2026-11-12 | t3-notification-engine | polling engine + binding + FIFO mock rig |
| 2026-11-12 | t4-chat-stores | chats/messages slices + open/send features + sync binding |
| 2026-11-12 | t5-chat-list | rail + pane + NewChatModal + messenger shell |
| 2026-11-12 | t6-conversation-pane | wallpaper + bubbles + virtualized day-grouped list + autoscroll |
| 2026-11-13 | t7-composer | composer + validation + per-bubble retry affordance |
| 2026-11-13 | t8-mvp2 | reconnect states/toasts/mobile + Playwright/axe harness |
| 2026-11-13 | t9-pyramid-hardening | code-splitting (D42), arch/knip/bundle gates, 16 e2e, hook retune (D44) |
| 2026-11-13 | t10 deploy ×3 | Docker/nginx; deployed + verified; toml removed (D53) |
| 2026-11-13 | t10.5 + 6 follow-ups | user-found UX fixes (D54); polls → 10 s (D57); media triage (D58); preview sweep + rail layout |
| 2026-11-13 | composer stabilization ×2 | autosize baseline clamp (D60), root cause + mic removal (D61) |
| 2026-11-13 | t12 / t14 (+t14b) / t13 | Tabler icons (D59); contacts removed (D62); `sessionResolved` (D63); type aliases (D65) |
| 2026-11-13 | bot-nickname-probe + submit-typing | live bot counterpart verified, mapper fixes (D64); `SubmitEvent` retypes |
| 2026-11-13 | t16-review-fixes | 15 findings fixed with tests (D66) |
| 2026-11-13 | t15-final-qa-submission | full battery + real-instance demo 9/10; v1.0.0 tag; `demo.webm`; D68/D69 |
| 2026-11-14 | chat-list-virtualization · scrollarea · bugfix-open-chat · preview-hydration | pane virtualization (D70), Mantine ScrollArea both panes (D71), cross-channel dedupe + queue priority (D72), visibility-driven previews (D73); deployed, bundle parity verified |
| 2026-11-14 | review-fixes | D74 fixes + docs repair; PROGRESS condensed to one page (archive retired); gates green (355 tests / 96.44% / 157.3 KB); committed on user request |

## Decisions & gotchas (condensed)

### Live API facts (binding)

- **D1** chat ids are opaque strings (bare numeric / `-100…`); the only synthesized id is `phone@c.us`, passed only to `getContactInfo`.
- **D2** `checkWhatsapp` answers 404 on this instance — phone resolution goes through `getContactInfo`.
- **D4** rate limits are hard (history/contacts 1 rps): every call rides the per-method RateQueue, never raw fetch.
- **D5** `getChatHistory` is empty until bootstrap flips `incomingWebhook`/`outgoingMessageWebhook` (idempotent, ~5 min to apply — tolerate empty history, D9).
- **D20** method-shape facts: `deleteNotification` is DELETE with receiptId after the token; `getContactInfo`/`getAvatar`/`readChat` are POST bodies; both `getChats` shapes accepted; journal timestamps are seconds → stored as ms; unknown outgoing statuses → `failed`; non-text/`isDeleted` → null (text-only scope).
- **D57** live gateway kills idle long-polls at ~15 s though the docs advertise up to 25 s — engine polls with a 10 s window (constant is exported).
- **D58** `getAvatar` answers `QUOTE_EXCEEDED` on the free plan — gradient-initials fallback is the designed degradation (upgrade tariff fixes avatars with zero code changes).
- **D64** bot counterparts: `chatType:"bot"` maps to `private`; usernames resolve to a distinct canonical chatId and may or may not carry `@` (mapper strips); `phoneNumber`/`lastSeen` are `string | number` (0/empty → null).
- **D68** `getContactInfo` 400 on a valid phone means "not found" (live-verified 2026-11-13) — verbatim/phone path treats it as unknown-recipient fallback chat named by the phone; name-like drafts keep the distinct-resolution guard.
- **D69** the notification queue is single-consumer per instance: a second app session on the same instance will steal `receiveNotification` deliveries (single long-poll consumer by design).
- **D70** `getChats` cannot paginate (only an activity-sorted `count` cap) — list performance is handled client-side (virtualization), and server-side caps would break the client-side search.
- **D72** the Telegram bridge stamps `idMessage` per channel — journal id ≠ webhook id for the same message, but `timestamp` matches (±2 s, seconds); outgoing webhook ids equal the `sendMessage` response (probed end-to-end). Message dedupe keys on `(direction, text, timestamp ± 2 s)` with exact-id primary and status escalation; accepted trade-off: identical same-direction texts within 2 s collapse.

### Process, tooling, hygiene rules (binding)

- **D3, D8** CORS is fully open (pure SPA forever); PII/credentials never committed — real identifier files are gitignored, fixtures are synthetic only.
- **D7, D17** no code comments anywhere; UI strings only via `shared/config/i18n.ts`; PLAN §2 live facts are authoritative over shipped docs; Biome must never format `docs/**` (`files.includes: !docs` — never remove).
- **D11** sessions run strictly sequentially; the active session owns this file until it finishes.
- **D12, D18** Biome 2 replaces ESLint+Prettier; there is **no GitHub Actions** (also blocked by billing) — Railway auto-deploys `main`; the merge gate = local `lint`/`typecheck`/`test`(coverage)/`build`.
- **D16** theme tokens flow through `theme.other.max` (`declare module` augmentation) + custom `brand` palette (base `#1D7DF2`, `primaryShade: 5`).
- **D13** visual identity from real MAX screenshots: three-column layout, light-blue doodle wallpaper, white incoming / translucent-mint outgoing, ~`#1D7DF2` accents, floating pill composer.
- **D31, D46** `noNoninteractiveTabindex` stays off in `biome.json` (no scoping mechanism) — single legit use is the keyboard-scroll region; re-check on Biome majors.
- **D43** knip policy: consumed value exports only; exported types are the documented API surface (type warnings are FSD false alarms).
- **D44** hooks: pre-commit = staged Biome + `check:arch`; commit-msg = commitlint; pre-push = typecheck + tests + knip (supersedes D19).
- **D48, D49** Docker build runs `pnpm install --frozen-lockfile --ignore-scripts` (gitless stage); nginx per-location `add_header` suppresses inheritance (repeat the security headers explicitly).
- **D50** README screenshots are captures from the built container in mock mode (Playwright, DPR 2); recapture only when the UI changes.
- **D51** no env-var credential prefill — credentials are UI input living in `localStorage`; only `VITE_API_MODE` is read from the environment.
- **D53, D67** deploy settings live in the Railway dashboard: healthcheck `/healthz` + 100 s timeout, `PORT=80` variable; `railway.toml` is deleted (Config-as-Code cutoff 2026-12-01; Dockerfile auto-detection covers building).
- **D52** Railway is GitHub-connected: push to `main` ships in ~1 minute; verify deploys by bundle-hash byte parity with a local build.
- **D54** every shipped change gets a manual real-UI walkthrough as an acceptance step (four defects reached the user through automated gates alone).

### Architecture & behavior contracts (binding)

- **D6, D22–D25, D37** engine/binding contract: `receiveNotification` returns `{receiptId, body}`; drain-before-repoll; ack after subscriber apply; unknown typeWebhook acked + skipped; hidden tabs throttle to 1 flush/s with `visibilitychange` instant flush; `stop()` drops queued notifications (server redelivers — reducers are idempotent); `pollFailed`→`reconnecting` (blips do NOT disconnect), `pollRecovered`→false, only 401/403 (`sessionInvalidated`) disconnects.
- **D26** `entities/messages` is the data truth; `entities/chats` is display state; both are written only by `app/providers/chat-stores.ts` (engine events) and the feature orchestrations (`send-message`, `open-chat`) — never entity-to-entity.
- **D28, D29, D30, D32** component/store hygiene: Mantine styles imported once in `main.tsx`; entity stores are DI factories (`gateway`/`storage`/`now` swaps); `ChatAvatarWithUrl` lives in `entities/chat/ui` with `credentials` as a prop (initials fallback on error/`available:false`); jsdom virtualization is unmeasurable — mock the react-virtual module and drive logic with `applyScrollShim`.
- **D35, D61** retry is per-bubble (`retryChatText` → `dropMessage` → fresh pending reads the same slot); the char cap counts code points (4000); the composer has no mic — only the on-demand send button.
- **D41** `App` gates `MessengerPage` on `status === 'connected'` and renders `ConnectPage` for every other status (the form must stay mounted through `connecting`).
- **D42** bundle budget (<300 KB initial gzip, ~157 achieved) rests on the lazy mocks chunk + `React.lazy` MessengerPage; `pnpm check:bundle` enforces it from `dist/index.html` assets.
- **D38, D45, D47** e2e seams: `window.mockGateway` (worker augmentation) + `mockGateway.autoReplyEnabled/chats/messages`, `pollOutage`/`invalidate` fault knobs checked inside the receive wait loop; e2e helpers may read them; local Playwright runs non-CI.
- **D55, D56** New-chat target field = "Phone number or nickname": phone-shaped drafts (`/^[+\d][\d\s\-()]*$/`) take the normalize+region+resolve flow; nickname drafts must resolve to a DISTINCT chatId (echo → `resolveFailed`); group chats arrive only with `-100…` ids (never derived).
- **D59** Tabler icons tree-shape from the root barrel (`sideEffects:false`); sizes pinned per context (14–22 px, stroke 2).
- **D60** the composer autosize clamps to the empty-state baseline (no shrink below the empty row in any engine).
- **D62** unrelated uncommitted WIP found in the tree is adopted as its own prior commit, not swallowed silently (mic-removal precedent).
- **D63** `sessionResolved` false at mount, true on every `resume()` exit and `disconnect()` — no connect flash during the restore round-trip.
- **D65** `interface`→`type` is lint-locked (`useConsistentTypeDefinitions`); the three ambient declaration-merging contracts (`vite-env.d.ts`, `worker.ts` Window, `theme.ts` module augmentation) keep `interface` via a scoped `biome.json` override.
- **D66** persistence = 500 ms trailing throttle in both stores (flush on `beforeunload`; `clear()` cancels + removes, never flushes), rate-queue coalesce keys carry the credentials fingerprint, credentials are re-checked identically after every await (disconnect-null and switch cases), day dividers recompute reactively, history failures `console.warn`, toasts use a post-apply chatId snapshot, avatar query keys include credentials.
- **D71** ScrollArea↔virtualizer contract (Mantine 9.8): `viewportRef` → `getScrollElement`; `viewportProps={{ tabIndex: 0, onScroll }}`; `styles={{ content: { display: 'block' } }}` for virtual windows (default `display: table` breaks absolute cells); centering moves into the content styles; bottom cushions live on the window's `padding-bottom`; helpers hop via `ScrollArea.classes.viewport` / `[data-scrollarea-viewport]`.
- **D73** preview hydration is visibility-driven: the pane passes the virtual window's chat ids to `useChatPreviewHydration` (virtualItems are memoized — effects re-fire only on window changes); one `getChatHistory {count:1}` per chat per credentials session through the queue; failures retry on re-visibility, empty histories never repeat, `markUnread` untouched.
- **D74** RateQueue drain wrapped try/catch/finally (scheduler failure fast-fails queued entries, no unhandled rejection; slot re-usable); priority is a flat two-tier pick with NO aging (starvation accepted-by-design; the extension seam is `#pickNext`); preview-attempt state is store-owned (see handoff).

### Test-technique gotchas (apply when writing tests)

- **D21, D24** microtask `settle()` helpers race async chains — assert with `vi.waitFor` on observable state; jsdom never fires `submit` on a button click (`fireEvent.submit(form)`); component tests must `waitFor` because side effects land after `act`.
- **D21, D29** Mantine portals content to `document.body` (query there), `MantineProvider` (+theme) must wrap component tests, RegExp named-capture groups do not surface as MSW handler `params` (parse `request.url`), the 1-rps RateQueue means list tests need ≥3 s `findBy*` timeouts.
- **D28, D34** `exactOptionalPropertyTypes`: never assign explicit `undefined` to optional fields (build objects conditionally); TS narrowing does not survive inside closures — capture narrowed values into consts; CSS-module members are `string | undefined` (bind to consts for helper args).
- **D34, D32** assert `data-*={true}` as `'true'`, `getByRole` skips `aria-hidden`, `useMediaQuery` stubs false (desktop renders unless overridden), date fixtures use local `new Date(y, m, d)` — never `Date.UTC` hour-0 on UTC+ boxes, `container.textContent` can be poisoned by injected Mantine styles.
- **D36, D45** engine tests `waitFor` the guaranteed re-poll before `stop()`; jsdom `fireEvent.change` does not truncate on `maxLength` (the composer >4000 path is real); knobs (`pollOutage`, `invalidate`, `autoReplyEnabled`) reset between tests; date-label suites MUST pin `vi.setSystemTime` — wall-clock-relative seeds silently expire (the 2026-11-13 one-day time-bomb).
- **D38** Playwright: webServer probe must be `http://localhost:5173` (Vite ignores `127.0.0.1`); vitest runs `dir: 'src'` so e2e specs stay out of the unit runner; typecheck covers e2e via includes.
- **D47** tick-escalation e2e drives statuses via `deliverNotification` and asserts per-bubble `[data-status]`; the virtualizer e2e batches deliveries in one `evaluate` and counts `[data-index]` rows.
