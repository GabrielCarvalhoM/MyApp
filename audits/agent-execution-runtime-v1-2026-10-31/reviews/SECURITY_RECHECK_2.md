VERDICT: NOT_READY

# AGENT_EXECUTION_RUNTIME_V1: security recheck 2 (NEW-1 to NEW-3, and the class around them)

- Reviewed: HEAD `82d31043534fb20ece2f09bec18b14eb5f96e85d`. The fixes are in `0c8f1fe` (`git diff 16a932f..0c8f1fe -- tools/agent-runtime`); `82d3104` only adds SECURITY_RECHECK.md.
- Reviewer: the same independent security instance. Read-only: this file is the only one written. No paid call. Probes ran in temporary directories.
- Tests at HEAD: `node --test "tools/agent-runtime/tests/*.test.mjs"` → 73/73.
- Mutation run: `scratchpad\mutants5\results.json` was **absent** when I finished (the run is still in progress), so no mutation evidence for this round.

## Recheck findings

- **NEW-1 CLOSED.**
  - Hooks now point at a never-created path inside a `mkdtemp` directory private to the process (`git.mjs:23-36`), and that applies to every local git call and to `lsRemote`.
  - The Supervisor refuses to start when its own code sits in the mission worktree or in a `<slug>--codex-*` job worktree (`mission.mjs` `untrustedRuntimeReason`; `supervisor.mjs` constructor).
  - The README now says to run from the main checkout.
  - Residual: a process that can write outside its working directory could find the private directory under `%TEMP%`, so the bound is the session's permission system.
- **NEW-2 CLOSED.** `lsRemote` runs from the private directory, with `GIT_CEILING_DIRECTORIES` set to its parent (`git.mjs:33`). A `.git` planted in `%TEMP%` itself is no longer on the discovery path, and the hardening test covers it with a positive control.
- **NEW-3 BOUNDED.**
  - Before every launch, the on-disk digests of the four protected files are compared with `state.protected_snapshot` (`protected.mjs`, `preflight.mjs`). This covers failed runs and ignored or untracked copies.
  - The remaining gap is NEW-5.
- **SEC-1 BOUNDED.** The control state is outside the worktree and re-validated on load. `repo.git_dir` is now pinned and validated. `assertConsistent` also runs `unitErrors` on `next_unit` and `current.unit`.
- **SEC-2 CLOSED for the reported vectors.** The same config-driven class has one more member: see NEW-4.
- **SEC-3 to SEC-7 and SEC-9 stay CLOSED.** No supervisor path runs a command an agent selects, and the Codex job checks are unchanged.
  - `--attr-source=<empty tree>` and `core.autocrlf=false` remove filter and EOL programs. The repository's `.gitattributes` is `* -text`, so commit bytes do not change.
- **SEC-8 and SEC-10 BOUNDED.** Accepted conditions, documented in the README.
- **SEC-11 BOUNDED.** The preflight digest gate covers the files sessions load; the gap is NEW-5.

## New findings

| id | severity | file:line | failure scenario | suggested fix |
|---|---|---|---|---|
| NEW-4 | MAJOR | `lib/git.mjs:49-60,115-118` (`signingPrograms`, `commitAll`) | Same class as SEC-2. Only `gpg.program`, `gpg.ssh.program` and `gpg.x509.program` are pinned. A session can run plain `git config commit.gpgsign true`, `gpg.format ssh` and `gpg.ssh.defaultKeyCommand "<cmd>"` in its worktree. That config is shared with every job worktree through the common `.git/config`. The supervisor's own job commit then runs `<cmd>` with the Founder's privileges. **Probe** (`scratchpad\secprobe\probe-signing.mjs`): `git.commitAll` from the runtime on a temporary repository with that config → marker `PWNED` (git: "gpg.ssh.defaultKeyCommand failed"). | The job commit is the supervisor's own bookkeeping commit, so do not sign it: add `-c commit.gpgsign=false` (or `--no-gpg-sign`) to `commitAll`. Alternatively, pin `gpg.format` and `gpg.ssh.defaultKeyCommand` (and `user.signingKey`) from `--global` as well. Add a guard test with this probe as the positive control. |
| NEW-5 | MINOR | `lib/supervisor.mjs` `applyResolution` (`s.protected_snapshot = protectedSnapshot(...)`); `lib/preflight.mjs` (the protected-config check runs after the dirty check) | Every `--resolve` silently re-takes the protected snapshot, without showing what drifted. A session can write `.claude/settings.local.json`, hidden by an ignore rule, and then end with an innocuous `FOUNDER_REQUIRED`/`BLOCKED` checkpoint. A `DIRTY_WORKTREE` block on some other file has the same effect. The Founder resolves the stated question, and with that the unseen config change is adopted for every later session. The gate exists only so that the Founder sees such changes. | In `applyResolution`, compute `protectedDrift` before re-snapshotting. If anything drifted, put it in the resolution output and the event log, and adopt it only with an explicit `--accept-config` flag; otherwise stay at `FOUNDER_REQUIRED`. Add a test for it. |
| NEW-6 | OBSERVATION | `lib/mission.mjs` `untrustedRuntimeReason` | It checks only this mission's worktree and its own Codex job worktrees. Running mission A from mission B's worktree, or a runtime path reached through a junction (`import.meta.url` is resolved through links, `repo.worktree` is not), is not refused. The README instruction covers this. | Optionally, refuse any runtime path under `<main_root>/.claude/worktrees/`, comparing real paths. |

## Gate

NOT_READY on NEW-4. It is a confirmed command execution by the supervisor from session-written repository config, in the class the round meant to close. The fix is one flag plus a test. NEW-5 should be fixed with it, or carried as a condition, owned by engineering and resolved before the first real mission. With NEW-4 fixed and NEW-5 fixed or conditioned, I expect READY_WITH_CONDITIONS (SEC-8, SEC-10, plus NEW-5 if not fixed). The mutation results for 0c8f1fe should also be recorded once they exist.
