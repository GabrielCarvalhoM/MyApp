# Agent execution runtime

A small supervisor that runs a long mission as a sequence of **fresh headless sessions** joined by **validated structured checkpoints**. The Founder starts a mission once; the supervisor starts each session, validates its checkpoint, starts the next session with a small bootstrap, delegates bounded jobs to Codex when a session asks for it, and stops at a terminal state. It controls the execution cycle only: it never decides science, readiness or gates — sessions do, under the project's existing authorities — and it **never runs a command an agent selects**: it runs `claude`, `codex` (in its workspace-write sandbox) and hardened `git`, nothing else.

Node 24, no dependencies. State is local and never tracked:

- **control state**, owned by the supervisor, in `<git common dir>/agent-runtime/<slug>/` (outside every worktree a session works in): mission record, state, append-only event log, lock, accepted checkpoints;
- **session workspace**, `.agent-runtime/` in the mission worktree (gitignored): the request copy, the checkpoint draft, read-only copies of accepted checkpoints, session prompts and results, Codex job artifacts, captured logs.

## Start a mission (one command)

From a normal terminal (PowerShell), in any checkout that contains this tool:

```sh
node tools/agent-runtime/runtime.mjs run DOMAIN_COACHING_R7-B.2 --request C:\path\to\founder-request.md
```

This creates the branch `claude/domain-coaching-r7-b2` and its worktree `.claude/worktrees/domain-coaching-r7-b2` from `--base` (default: the current HEAD, which must contain `tools/agent-runtime/`), pins the `origin` URL, copies the request and starts session 1 (intake and plan). The **same command without `--request` resumes** the mission after any stop. Options: `--once` (one unit, then stop), `--dry-run` (show the next launch and its bootstrap, change nothing), `--model`/`--effort` (route of the first unit; default `claude-opus-5-5`/`xhigh`), `--max-budget-usd` (per-session cap), `AGENT_RUNTIME_CODEX=off` (keep Codex out of a run).

```sh
node tools/agent-runtime/runtime.mjs status [MISSION_ID]       # state, last checkpoint, next unit, metrics
node tools/agent-runtime/runtime.mjs run MISSION_ID --resolve "<decision or note>"   # after BLOCKED / FOUNDER_REQUIRED
node tools/agent-runtime/runtime.mjs doctor                    # installed CLIs and capabilities, no model call
```

## Lifecycle

```text
CREATED → RUNNING → CHECKPOINTING ──valid──→ READY_FOR_FRESH_SESSION → RUNNING (fresh session or Codex job) → …
                      │    ↑ rejected: the same session gets the errors (--resume) and corrects, at most 2 times
                      └─ no valid checkpoint → retry in a fresh session → PAUSED after 2 consecutive failures
… → COMPLETED (COMPLETE · CLOSED_READY · CLOSED_NOT_READY · CANCELLED): nothing runs any more, never reopened
BLOCKED · FOUNDER_REQUIRED: declared by a checkpoint, or set by a safety check; waits for --resolve
```

Each session is `claude -p` with a supervisor-chosen session id, the bootstrap on stdin, explicit `--model`/`--effort` from the unit's route (chosen per unit by the previous session under the global model routing policy), `--permission-mode auto` and `--permission-prompts none`: anything that would need a person is denied, never waited for; permission checks are never bypassed.

## What a supervised session does

The bootstrap (a few KB) gives the mission, the unit, the verified Git state, the last checkpoint, the authorities and context it names, the settled scope and the open findings — never a transcript or old outputs. **Rehydration policy: DO NOT READ EVERYTHING BY DEFAULT.** A session loads the checkpoint, the named authorities, `git status`/`git log`, and fetches anything else only for a concrete question, by targeted search. It re-verifies claims against the repository, not against memory.

Deterministic work runs inside the session: existing scripts and tests, with `node tools/agent-runtime/runtime.mjs capture -- <command>` keeping the full log in a file and printing a compact summary (exit code, tail, flagged lines, digest). A command longer than ten minutes runs in the background and is waited for, or is split.

The session works on its unit only, stops at a semantic boundary (planning complete, implementation unit complete, freeze created, review complete, correction cycle complete, mission closure — never inside an atomic operation), and then:

1. commits all work (clean tree);
2. `node tools/agent-runtime/runtime.mjs checkpoint template` writes `.agent-runtime/checkpoint.next.json` with the Git facts and the carried-over findings, invariants and settled scope (run again after a new commit);
3. fills the fields below;
4. `node tools/agent-runtime/runtime.mjs checkpoint validate` until OK;
5. ends its turn, with no background work left running.

## Checkpoint fields

Schema `agent-runtime/checkpoint@1`, one JSON file, at most 64 KB (reference artifacts, do not inline them).

| Field | Content and rules |
| --- | --- |
| `mission_id`, `checkpoint_seq`, `previous_checkpoint`, `created_at` | identity and version chain: the next number after the last accepted checkpoint |
| `produced_by` | `{ run_seq, executor: "claude" }`: the run being validated (a stale file is never accepted) |
| `mission_goal` | one sentence; immutable after the first checkpoint (a change of scope is a Founder decision) |
| `mission_state` | `RUNNING`, `BLOCKED`, `FOUNDER_REQUIRED`, `COMPLETE`, `CLOSED_READY`, `CLOSED_NOT_READY`, `CANCELLED` |
| `current_phase`, `boundary` | phase text; boundary `planning_complete`, `implementation_unit_complete`, `freeze_created`, `review_complete`, `correction_cycle_complete`, `delegation`, `mission_closure`, `blocker`, `other` |
| `baseline.commit` | the mission base commit |
| `git` | `{ branch, head_commit, pushed }`: the worktree's branch and HEAD on a clean tree, descending from the baseline and the last checkpoint; `pushed: true` is checked on the remote |
| `freeze` | `null` or `{ id, digest, record }` (record tracked); once set it can be replaced, not dropped |
| `canonical_invariants`, `do_not_reopen` | strings; never dropped between checkpoints |
| `authorities_used`, `authorities_required_next`, `required_next_context` | tracked paths, optional `#anchor`; the last two are what the next bootstrap points to |
| `decisions_made` | `[{ id, decision, rationale }]` |
| `implemented_since_previous` | strings |
| `files_changed` | paths or `dir/` prefixes covering exactly the changes since the last checkpoint |
| `evidence` | `[{ kind, ref, result, summary, sha256?, command? }]`; kind `test`, `probe`, `mutation`, `review`, `verification`, `freeze`, `other`; `ref` a tracked file or `runtime:<path in .agent-runtime>`; a given `sha256` is recomputed |
| `findings` | `open: [{ id, severity, summary, owner, blocking }]`, `closed: [{ id, resolution, evidence_ref? }]`; an open finding never disappears, an open blocker is never downgraded, a blocker closes only with an `evidence_ref`, a closed finding stays closed (reopen = a new finding) |
| `next_exact_action` | the next concrete step |
| `next_unit` | a unit (below); `null` only in a final state; for `BLOCKED`/`FOUNDER_REQUIRED` the unit to run once resolved |
| `handoffs` | `[{ from, to, ref }]` |
| `founder_action_required` | `null` or `{ reason, decision_needed, options }`; required for `FOUNDER_REQUIRED`, forbidden while `RUNNING` or final |

State rules: `CLOSED_NOT_READY` names at least one open blocking finding; `COMPLETE`/`CLOSED_READY` have none; final states close at `mission_closure` with a verified push.

Units — the tier is the session's decision (deterministic tooling inside sessions, Codex for bounded verifiable engineering, Claude for judgment):

```json
{ "id": "U4", "executor": "claude", "goal": "…", "route": { "model": "claude-opus-5-5", "effort": "xhigh", "work_kind": "material_other", "reason": "…" } }
{ "id": "U5", "executor": "codex", "goal": "…",
  "job": { "brief": "…", "allowed_paths": ["CoachingCore/test/"], "acceptance": [["npm", "test", "--prefix", "CoachingCore"]],
           "copy_ignored": ["CoachingCore/node_modules"] },
  "then": { "id": "U6", "executor": "claude", "goal": "judge U5, integrate it, run its acceptance", "route": { "…": "…" } } }
```

`work_kind` `material_ui_ux` or `ui_ux_judge` requires `claude-opus-5-5` with effort `max` (Founder floor). Model ids follow a strict alias/id pattern.

## Codex (optional)

Codex is an accelerator, never a dependency. For a `codex` unit the supervisor checks availability (`codex --version`, `codex login status`), creates a job worktree `.claude/worktrees/<slug>--codex-r<N>` on branch `codex/<slug>-<unit>-r<N>` from the mission HEAD, copies the ignored material listed in `copy_ignored` (links are not copied), and runs `codex exec -C <job worktree> -s workspace-write --output-schema schemas/codex-result.schema.json`. It then verifies the result without running any of it: changed paths within `allowed_paths` and off the reserved paths (`.git`, `.agent-runtime`, `.claude`, `.codex`, `.agents`, `.github`, `.mcp.json`, Git attribute and ignore files), no change to ignored material (compared by content), an untouched `.git` file, a valid structured handoff, and a commit it makes directly on the mission HEAD, reading the job through its pinned git dir. The next Claude unit receives `RESULT.json`, `CODEX_HANDOFF.md` and `EVIDENCE.json` under `.agent-runtime/jobs/<run>-<unit>/`, judges the work, integrates it (for example `git merge --ff-only <job branch>`) and runs the job's acceptance commands in the mission worktree. If Codex is unavailable or the job fails for any reason, the same Claude unit does the remaining work itself; Codex is not retried within the same supervisor run. Job worktrees and branches are never deleted automatically.

## Safety and recovery

One executor works at a time; Codex never touches the mission worktree. Sessions can write the repository's config, hooks and workspace, so the supervisor trusts none of it:

- its control state is outside the worktree and the mission record is re-validated on every load (permission mode, model ids, branch, remote URL, limits); a state that contradicts the append-only event log cannot reopen a terminal mission; an accepted checkpoint that changed afterwards blocks the mission;
- no Git value a session can set is ever passed as an argument: the remote is read with `git ls-remote --end-of-options <URL pinned at mission start>` from outside any repository, and every supervisor Git command switches off fsmonitor and hooks;
- a unit that commits agent configuration later sessions would load (`.claude/settings.json`, `.claude/settings.local.json`, `.mcp.json`, `.codex/config.toml`) stops the mission at `FOUNDER_REQUIRED`.

The supervisor's own Git writes are limited to creating worktrees and committing Codex output on a job branch. It never merges, pushes, resets, rewrites history, deletes branches or touches credentials; pushing the mission branch is the sessions' normal Git work.

| Situation | Behaviour |
| --- | --- |
| a session ends without a valid checkpoint (crash, usage limit) | the last valid checkpoint stays; one retry in a fresh session that is told what happened; `PAUSED` after 2 consecutive failures; the same command resumes |
| checkpoint invalid | the same session gets the errors (`--resume`), at most 2 corrections, then a failed run; every rejected version is kept |
| the supervisor dies or is stopped (Ctrl+C) | state is on disk; the next run validates whatever checkpoint the session left, or counts the run as failed; an interrupted Codex job hands over to its Claude unit; an acceptance cut short is completed without overwriting anything |
| uncommitted changes of unknown origin | `BLOCKED` with the paths; nothing is deleted; `--resolve` acknowledges them and the next session classifies them |
| wrong branch, rewritten history, remote ahead | `BLOCKED` (`BRANCH_MISMATCH`, `GIT_DIVERGENCE`, `REMOTE_DIVERGED`); nothing is changed |
| a recorded run pid still alive | refuses to start; `--assume-dead` once checked |
| runaway mission | `BLOCKED` after 40 runs (`MAX_RUNS`); `--resolve` opens a new window |

## Audit and metrics

The event log records each transition compactly (time, mission, run, executor, from → to, checkpoint, commit, reason), session starts and ends, checkpoint verdicts, jobs, fallbacks and resolutions — no transcripts. `status` derives the metrics: sessions started, corrections, checkpoints accepted and rejected, failed runs, Codex jobs, fallbacks, bootstrap bytes and listed paths, and the token and cost figures **as reported by the Claude CLI** (`null` when not reported; never estimated).

## Limits and accepted conditions

- The supervisor is meant for a terminal. Started inside a Claude Code session it works (`claude -p` allows it) but lives only as long as that process.
- Checkpoints happen at semantic boundaries. The installed CLI gives an external process no reliable live context-size signal; an over-long unit is covered by Claude Code's own auto-compaction.
- A hung session is never killed automatically (that could cut an atomic operation); stop the supervisor and run again.
- The JSON shape of `claude -p --output-format json` and Codex's `--output-schema` handling were verified from the installed CLIs' help and zero-cost probes only, not by a paid call: correctness depends on the checkpoint file, Git and exit codes, and the metrics read the CLI output defensively.
- One supervisor per mission, started by the Founder: two supervisors racing for the same stale lock could both start (review SEC-8, accepted condition; revisit before supervisors are ever started automatically).
- Session results, Codex logs and captured logs can contain whatever a worker printed, secrets included, and every child process gets the Founder's environment. They stay local and gitignored and are never pushed; nothing cleans them up (review SEC-10, accepted condition).
- Git config the session writes still affects the session's own Git commands (credential helpers, URL rewrites); that is within the session's own permission controls, not the supervisor's.
- Removing the mission worktree removes the session workspace; the control state and the audit log stay in the Git common directory.

## Tests

```sh
node --test "tools/agent-runtime/tests/*.test.mjs"
```

Fake `claude` and `codex` executables (`tests/fakes/`) play scripted sessions against temporary repositories with a local bare remote: checkpoint validation, terminal stop, recovery, Codex delegation and fallback, dirty-worktree protection, bootstrap content, a simulated three-phase mission with a Codex handoff, and `security.test.mjs`, where each attack from the security review is first shown to work against an unprotected Git command and then shown not to work through the runtime. No model is called.
