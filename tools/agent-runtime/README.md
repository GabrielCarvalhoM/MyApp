# Agent execution runtime

A small supervisor that runs a long mission as a sequence of **fresh headless sessions** joined by **validated structured checkpoints**. The Founder starts a mission once; the supervisor starts each session, validates its checkpoint, starts the next session with a small bootstrap, runs local tooling or Codex when a session asks for it, and stops at a terminal state. It controls the execution cycle only: it never decides science, readiness or gates — sessions do, under the project's existing authorities.

Node 24, no dependencies. Mission state is local and gitignored (`.agent-runtime/` in the mission worktree).

## Start a mission (one command)

From a normal terminal (PowerShell), in any checkout that contains this tool:

```sh
node tools/agent-runtime/runtime.mjs run DOMAIN_COACHING_R7-B.2 --request C:\path\to\founder-request.md
```

This creates the branch `claude/domain-coaching-r7-b2` and its worktree `.claude/worktrees/domain-coaching-r7-b2` from `--base` (default: the current HEAD, which must contain `tools/agent-runtime/`), copies the request into the mission state and starts session 1 (intake and plan). The **same command without `--request` resumes** the mission after any stop. Useful options: `--once` (one unit, then stop), `--dry-run` (show the next launch and its bootstrap, change nothing), `--model`/`--effort` (route of the first unit; default `claude-opus-5-5`/`xhigh`), `--max-budget-usd` (per-session cap), `AGENT_RUNTIME_CODEX=off` (keep Codex out of a run).

```sh
node tools/agent-runtime/runtime.mjs status [MISSION_ID]       # state, last checkpoint, next unit, metrics
node tools/agent-runtime/runtime.mjs run MISSION_ID --resolve "<decision or note>"   # after BLOCKED / FOUNDER_REQUIRED
node tools/agent-runtime/runtime.mjs doctor                    # installed CLIs and capabilities, no model call
```

## Lifecycle

```text
CREATED → RUNNING → CHECKPOINTING ──valid──→ READY_FOR_FRESH_SESSION → RUNNING (fresh session, Codex or local job) → …
                      │    ↑ rejected: the same session gets the errors (--resume) and corrects, at most 2 times
                      └─ no valid checkpoint → retry in a fresh session → PAUSED after 2 consecutive failures
… → COMPLETED (COMPLETE · CLOSED_READY · CLOSED_NOT_READY · CANCELLED): nothing runs any more, never reopened
BLOCKED · FOUNDER_REQUIRED: declared by a checkpoint, or set by a Git safety check; waits for --resolve
```

Each session is `claude -p` with a supervisor-chosen session id, the bootstrap on stdin, explicit `--model`/`--effort` from the unit's route (chosen per unit by the previous session under the global model routing policy), `--permission-mode auto` and `--permission-prompts none`: anything that would need a person is denied, never waited for, and permission checks are never bypassed.

## What a supervised session does

The bootstrap (a few KB) gives the mission, the unit, the verified Git state, the last checkpoint, the authorities and context it names, the settled scope and the open findings — never a transcript or old outputs. **Rehydration policy: DO NOT READ EVERYTHING BY DEFAULT.** A session loads the checkpoint, the named authorities, `git status`/`git log`, and fetches anything else only for a concrete question, by targeted search. It re-verifies claims against the repository, not against memory.

It works on its unit only, stops at a semantic boundary (planning complete, implementation unit complete, freeze created, review complete, correction cycle complete, mission closure — never inside an atomic operation), and then:

1. commits all work (clean tree);
2. `node tools/agent-runtime/runtime.mjs checkpoint template` writes `.agent-runtime/checkpoint.next.json` with the Git facts and the carried-over findings, invariants and settled scope (run again after a new commit);
3. fills the fields below;
4. `node tools/agent-runtime/runtime.mjs checkpoint validate` until OK;
5. ends its turn, with no background work left running.

For long output: `node tools/agent-runtime/runtime.mjs capture -- <command>` keeps the full log in a file and prints a compact summary (exit code, tail, flagged lines, digest).

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
| `git` | `{ branch, head_commit, pushed }`: must be the worktree's branch and HEAD on a clean tree, descending from the baseline and the last checkpoint; `pushed: true` is checked on the remote |
| `freeze` | `null` or `{ id, digest, record }` (record tracked); once set it can be replaced, not dropped |
| `canonical_invariants`, `do_not_reopen` | strings; never dropped between checkpoints |
| `authorities_used`, `authorities_required_next`, `required_next_context` | tracked paths, optional `#anchor`; the last two are what the next bootstrap points to |
| `decisions_made` | `[{ id, decision, rationale }]` |
| `implemented_since_previous` | strings |
| `files_changed` | paths or `dir/` prefixes covering exactly the changes since the last checkpoint |
| `evidence` | `[{ kind, ref, result, summary, sha256?, command? }]`; kind `test`, `probe`, `mutation`, `review`, `verification`, `freeze`, `other`; `ref` a tracked file or `runtime:<path in .agent-runtime>`; a given `sha256` is recomputed |
| `findings` | `open: [{ id, severity, summary, owner, blocking }]`, `closed: [{ id, resolution, evidence_ref? }]`; an open finding never disappears, an open blocker is never downgraded, a closed finding stays closed (reopen = a new finding) |
| `next_exact_action` | the next concrete step |
| `next_unit` | a unit (below); `null` only in a final state; for `BLOCKED`/`FOUNDER_REQUIRED` the unit to run once resolved |
| `handoffs` | `[{ from, to, ref }]` |
| `founder_action_required` | `null` or `{ reason, decision_needed, options }`; required for `FOUNDER_REQUIRED`, forbidden while `RUNNING` or final |

State rules: `CLOSED_NOT_READY` names at least one open blocking finding; `COMPLETE`/`CLOSED_READY` have none; final states close at `mission_closure` with a verified push.

Units — the executor tier is the session's decision (local tooling first, Codex for bounded verifiable engineering, Claude for judgment):

```json
{ "id": "U4", "executor": "claude", "goal": "…", "route": { "model": "claude-opus-5-5", "effort": "xhigh", "work_kind": "material_other", "reason": "…" } }
{ "id": "U5", "executor": "codex", "goal": "…",
  "job": { "brief": "…", "allowed_paths": ["CoachingCore/test/"], "acceptance": [["npm", "test", "--prefix", "CoachingCore"]],
           "copy_ignored": ["CoachingCore/node_modules"], "fallback_command": null },
  "then": { "id": "U6", "executor": "claude", "goal": "judge and integrate U5", "route": { "…": "…" } } }
{ "id": "U7", "executor": "local", "goal": "…", "job": { "command": ["node", "CoachingCore/scripts/verify-r7b1.mjs", "--tests"] }, "then": { "…": "…" } }
```

`work_kind` `material_ui_ux` or `ui_ux_judge` requires `claude-opus-5-5` with effort `max` (Founder floor). Supervised commands (local jobs, acceptance checks, fallback commands) are argv for `node` or `npm test|run|ci` on repository paths: no shell, no inline code.

## Codex (optional)

Codex is an accelerator, never a dependency. For a `codex` unit the supervisor checks availability (`codex --version`, `codex login status`), creates a job worktree `.claude/worktrees/<slug>--codex-r<N>` on branch `codex/<slug>-<unit>-r<N>` from the mission HEAD, copies the ignored material listed in `copy_ignored`, and runs `codex exec -C <job worktree> -s workspace-write --output-schema schemas/codex-result.schema.json`. It then verifies independently of Codex's report: changed paths within `allowed_paths`, a commit made by the supervisor directly on the mission HEAD, and the acceptance commands. The next Claude unit receives `RESULT.json`, `CODEX_HANDOFF.md` and `EVIDENCE.json` under `.agent-runtime/jobs/<run>-<unit>/`, judges the work and integrates it (for example `git merge --ff-only <job branch>`). If Codex is unavailable or the job fails for any reason, the job's `fallback_command` runs when it has one; otherwise the next Claude unit does the remaining work itself. Codex is not retried within the same supervisor run. Job worktrees and branches are never deleted automatically.

## Safety and recovery

One executor works at a time; Codex never touches the mission worktree. The supervisor's own Git writes are limited to creating worktrees, committing Codex output on a job branch and fetching the mission branch's upstream (which updates only the remote-tracking ref). It never merges, pushes, force-pushes, resets, rewrites history, deletes branches or touches credentials; pushing the mission branch is the sessions' normal Git work.

| Situation | Behaviour |
| --- | --- |
| a session ends without a valid checkpoint (crash, usage limit) | the last valid checkpoint stays; one retry in a fresh session that is told what happened; `PAUSED` after 2 consecutive failures; the same command resumes |
| checkpoint invalid | the same session gets the errors (`--resume`), at most 2 corrections, then a failed run; every rejected version is kept |
| the supervisor dies or is stopped (Ctrl+C) | state is on disk; the next run validates whatever checkpoint the session left, or counts the run as failed; an interrupted job hands over to its Claude unit |
| uncommitted changes of unknown origin | `BLOCKED` with the paths; nothing is deleted; `--resolve` acknowledges them and the next session classifies them |
| wrong branch, rewritten history, remote ahead | `BLOCKED` (`BRANCH_MISMATCH`, `GIT_DIVERGENCE`, `REMOTE_DIVERGED`); nothing is changed |
| a recorded run pid still alive | refuses to start; `--assume-dead` once checked |
| runaway mission | `BLOCKED` after 40 runs (`MAX_RUNS`); `--resolve` opens a new window |

## Audit and metrics

`.agent-runtime/events.jsonl` records each transition compactly (time, mission, run, executor, from → to, checkpoint, commit, reason), session starts and ends, checkpoint verdicts, jobs, fallbacks and resolutions — no transcripts. `status` derives the metrics: sessions started, corrections, checkpoints accepted and rejected, failed runs, Codex and local jobs, fallbacks, bootstrap bytes and listed paths, and the token and cost figures **as reported by the Claude CLI** (`null` when not reported; never estimated). Per-session prompts and CLI results are in `.agent-runtime/sessions/`.

## Limits

- The supervisor is meant for a terminal. Started inside a Claude Code session it works (`claude -p` allows it) but lives only as long as that process.
- Checkpoints happen at semantic boundaries. The installed CLI gives an external process no reliable live context-size signal; an over-long unit is covered by Claude Code's own auto-compaction.
- A hung session is never killed automatically (that could cut an atomic operation); stop the supervisor and run again.
- The JSON shape of `claude -p --output-format json` and Codex's `--output-schema` handling were verified only from the installed CLIs' help and zero-cost probes, not by a paid call: correctness depends on the checkpoint file, Git and exit codes, and the metrics read the CLI output defensively.
- Supervised local commands run outside Claude Code's per-command permission checks; the node/npm allowlist bounds mistakes but is not a sandbox.
- State is local to the mission worktree: removing the worktree removes its audit log. The durable record stays the mission's committed artifacts.

## Tests

```sh
node --test "tools/agent-runtime/tests/*.test.mjs"
```

Fake `claude` and `codex` executables (`tests/fakes/`) play scripted sessions against temporary repositories with a local bare remote: checkpoint validation, terminal stop, recovery, routing and Codex fallback, dirty-worktree protection, bootstrap content, and a simulated three-phase mission with a Codex handoff. No model is called.
