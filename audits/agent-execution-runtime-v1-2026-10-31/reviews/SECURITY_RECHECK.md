VERDICT: NOT_READY

# AGENT_EXECUTION_RUNTIME_V1: narrow security recheck of the SECURITY_REVIEW.md findings

- Reviewed: HEAD `16a932f92f52c2e4ee5e485cc60a0b35cbd8dda1`. The fixes are `git diff 49dfea7..fc77578 -- tools/agent-runtime`; `16a932f` only changes the README.
- Reviewer: the same independent security instance as the first review. Read-only: the only file written is this one. No paid call. Probes ran in the scratchpad or in temporary repositories.
- Tests: `node --test "tools/agent-runtime/tests/*.test.mjs"` gives 66/66 at HEAD. The mutation results in `probes/` were noted but not re-run.

## Disposition of the previous findings

- **SEC-1 BOUNDED.**
  - What is fixed: the control state is now under `<git common dir>/agent-runtime/<slug>/` (`mission.mjs:39-61`). `validateMissionRecord` re-checks the mission record on every load (`mission.mjs:72-94`), and `assertConsistent` checks state.json against the event log (`supervisor.mjs:21-27`).
  - Result: a plain edit inside the session's working directory can no longer change control state. Even an edited record cannot pick `bypassPermissions`.
  - Residual: a process that can write outside its working directory can still edit `state.json`/`events.jsonl`, and `state.next_unit` is not re-validated on load. Writing there already requires passing Claude Code's permission check, so this is acceptable.
- **SEC-2 CLOSED for the reported vectors, but see NEW-1 and NEW-2.**
  - `fetch` is gone and the remote URL is pinned at creation (`mission.mjs:183`).
  - `lsRemote` now passes `--end-of-options` and checks both `SAFE_BRANCH` and the returned sha (`git.mjs:138-149`).
  - The hardening `-c` flags are on every git call (`git.mjs:11`), and branch names are checked with `--` (`git.mjs:122-128`).
  - The security tests reproduce the original probes with positive controls.
- **SEC-3 CLOSED.**
  - Local jobs, `fallback_command` and `commands.mjs` are removed. A checkpoint naming either is rejected (`checkpoint.mjs:298-300`).
  - The supervisor now spawns only `claude`, `codex` and hardened `git`; acceptance commands go to the judging session, where the classifier applies.
  - Codex jobs fail on any changed ignored file (content is compared, and new files count: `jobs.mjs:70-84,180-181`), on a rewritten `.git` file (`jobs.mjs:176`), and on reserved paths (`checkpoint.mjs:32-36`).
- **SEC-4 CLOSED (moot).** The command policy no longer gates any execution; acceptance argv is only shape-checked (`checkpoint.mjs:110-114`).
- **SEC-5 CLOSED.** A previously blocking finding now closes only with an `evidence_ref` (`coherence.mjs:167-168`), and `referenceErrors` checks that the ref exists.
- **SEC-6 CLOSED.** Reserved paths are refused, both structurally and at run time (`checkpoint.mjs:290-292`, `jobs.mjs:155`). Links are filtered by `lstat` and listed as skipped in RESULT.json (`jobs.mjs:56-67`).
- **SEC-7 CLOSED.**
  - New order: copy to the authoritative file, then save the state, then write the session copy and remove the draft (`settlement.mjs:63-116`).
  - A crash before the state save re-validates the same draft and copies the identical bytes again.
  - A different file under the same number is moved aside as `orphan-*`, never overwritten.
- **SEC-8 BOUNDED (accepted condition).** Recorded in the README "Limits and accepted conditions", with a trigger to revisit. Owner: Founder.
- **SEC-9 CLOSED.** `MODEL_ID` is enforced for checkpoint routes, `job.model` and the mission's first route (`checkpoint.mjs:30,116-118`; `mission.mjs:84,163`).
- **SEC-10 BOUNDED (accepted condition).** Documented in the README Limits; the logs stay local and gitignored.
- **SEC-11 BOUNDED, partially.** Protected configuration in commits covered by an accepted checkpoint stops the mission at FOUNDER_REQUIRED (`settlement.mjs:16-19,101-104`). The gaps are in NEW-3.

## New findings

| id | severity | file:line | failure scenario | suggested fix |
|---|---|---|---|---|
| NEW-1 | MAJOR | `lib/git.mjs:10-11`; README "From a normal terminal, in any checkout that contains this tool" | **Introduced by the fix.** `core.hooksPath` points at `<runtime source dir>/.no-hooks`, and that path can exist inside a checkout the session writes. When the Founder runs the runtime from the mission worktree (the README allows it), the session can commit `tools/agent-runtime/.no-hooks/post-checkout`; `pre-commit` and `commit-msg` work the same way. The supervisor's own `git worktree add` (Codex job) or job `git commit` then runs that hook with the Founder's privileges. If the directory is merged to main, every later mission is affected too. **Probe** (`scratchpad/secprobe/probe-nohooks.mjs`): a copy of the runtime in a temporary checkout with a committed `.no-hooks/post-checkout`; `git.addWorktree` → marker `PWNED`. More broadly: running from the mission worktree means the next supervisor start executes runtime code the session has edited. | Point `core.hooksPath` at a fresh empty `fs.mkdtempSync` directory created at process start, outside any checkout. Refuse to run when the runtime's own files lie inside `mission.repo.worktree` or a job worktree. Change the README to "run from a checkout sessions do not write (the main checkout)". Add a guard test that reproduces the probe. |
| NEW-2 | MINOR | `lib/git.mjs:144-150` | `lsRemote`'s "neutral" directory is `os.tmpdir()` itself, with the ceiling set at its parent. A `.git` planted directly in `%TEMP%` is therefore discovered, and its config (`url.*.insteadOf`, `core.sshCommand`, `credential.helper`) applies. **Probe** (`scratchpad/secprobe/probe-neutral-dir.mjs`, with TEMP pointed at a scratch dir holding a planted repo, never the real `%TEMP%`): an `insteadOf` rewrite of the pinned GitHub URL to `ssh://` plus `core.sshCommand` → marker `PWNED`. Planting needs a write outside the session's working directory (permission-checked), hence MINOR. | Run `ls-remote` from a fresh `mkdtemp` directory, with `GIT_CEILING_DIRECTORIES` set to that directory's parent. |
| NEW-3 | MINOR | `lib/settlement.mjs:16-19,101-104`; `lib/settlement.mjs:118-140`; `lib/preflight.mjs:45-47` | Ways around the PROTECTED_CONFIG gate. (a) It runs only in `acceptCheckpoint`. A session that commits `.claude/settings.json` (hooks, allow rules) and then fails its checkpoint triggers `failRun` → retry. Preflight only notes "HEAD is ahead", so the retry session loads the new settings. (b) It looks only at committed diffs. A committed `.gitignore` change (not protected) can hide a written `.claude/settings.local.json`, which is never seen. (c) The FOUNDER_REQUIRED stop is skipped when the same checkpoint is final; that is harmless only while no session follows. Whether Claude Code itself refuses these settings edits under `--permission-prompts none` is still unverified. | Run the protected-config check in preflight, over `last_checkpoint_head..HEAD` and over the on-disk content of the protected files (digest compared against the last accepted state), so it covers ignored or untracked copies too. |

## Checked and sound in the new code

- **The neutral directory itself.** Hardening covers every supervisor git call; `GIT_DIR`/`GIT_WORK_TREE` are removed from the environment (`git.mjs:14-16`).
- **Codex job worktrees.** They are read through a `--git-dir` pinned before Codex runs (`jobs.mjs:147`).
- **Origin URL.** It is never re-read after creation.
- **Data flow.** `AGENT_RUNTIME_CONTROL_DIR` given to the session is a location, not a secret. `sessionContext` reads through `openMission`, so it gets the same validation.
- **Terminal states.** A terminal mission stays terminal through `assertConsistent` together with `applyResolution`.
- **Codex invocation.** Codex still runs only with `-s workspace-write`.

## Gate

NOT_READY on NEW-1 alone. It is a confirmed command execution by the supervisor from a file the agent commits, the same class as SEC-2. The fix is small; the minimum is:
1. Fix NEW-1 with a guard test that reproduces `probe-nohooks.mjs`, and correct the README run instruction.
2. Fix NEW-2 (one line), or accept it with a named owner.
3. Close NEW-3(a) by running the protected-config check in preflight. NEW-3(b) can ship as a condition, owned by engineering and resolved before the first real mission.

Once these are done, the expected verdict is READY_WITH_CONDITIONS (SEC-8 and SEC-10 accepted).
