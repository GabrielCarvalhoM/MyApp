VERDICT: READY_WITH_CONDITIONS

# AGENT_EXECUTION_RUNTIME_V1: security recheck 3 (NEW-4 to NEW-6)

- Reviewed: HEAD `7cee7452af5e61a55d63a99cdb6800eb2479fec3`. The fixes are in `0565d13` (`git diff 82d3104..0565d13 -- tools/agent-runtime`); `7cee745` only adds SECURITY_RECHECK_2.md.
- Reviewer: the same independent security instance. Read-only: this file is the only one written. No paid call. Probes ran in temporary directories.
- Tests at HEAD: `node --test "tools/agent-runtime/tests/*.test.mjs"` → 75/75.
- Mutation run: `scratchpad\mutants6\results.json` was **absent** when I finished (the run is still in progress). No mutation evidence covers this round yet.
- Re-ran the earlier probes against HEAD (all in `scratchpad\secprobe\`): none fired.
  - `probe-signing.mjs`: the commit succeeds unsigned, no marker.
  - `probe-nohooks.mjs`: no marker.
  - `probe-neutral-dir.mjs`, with a fake TEMP holding a planted `.git`: no marker.

## Per-item status

- **NEW-4 CLOSED.**
  - `commitAll` passes `-c commit.gpgsign=<the Founder's global value>` (`git.mjs` `signingPolicy`). With the Founder's current config that is `false`, so no signing program or key command runs, whatever the repository's config says (probe above).
  - When the Founder does sign, the format, all three programs, `gpg.ssh.defaultKeyCommand` and `user.signingKey` are pinned to global values or Git's defaults. An empty default fails closed (the job fails); signing is never silently dropped.
  - This respects the rule against bypassing signing. I found no other program that commit-time config can start once hooks, attributes and fsmonitor are neutralised and `-m` is used (so no editor).
- **NEW-5 CLOSED.**
  - Without `--accept-config`, `applyResolution` leaves the snapshot unchanged and records `protected_config_pending`. The next preflight stops again at FOUNDER_REQUIRED, naming the files and the flag (`supervisor.mjs` `applyResolution`, `preflight.mjs`).
  - `--accept-config` without `--resolve` is an error.
  - The hardening test covers the hidden-behind-a-dirty-stop sequence.
- **NEW-6 CLOSED.** `trust.mjs` compares real paths (`realpathSync.native`), and the constructor checks against every mission record under the control root. Covered by a test with mission A against mission B's worktree and a junction to it.
  - A corrupt record makes `readJson` throw, so the supervisor refuses to start (fails closed).
  - The records here are read without validation, but they only feed this refusal check. Changing them needs a write outside the session's working directory, as in SEC-1.
- **NEW-1, NEW-2 CLOSED** (unchanged since recheck 2; probes re-run). **NEW-3 CLOSED**: its remaining gap was NEW-5.
- **SEC-1 BOUNDED.** The control state is outside the worktree and validated on load; the residual is a write outside the session's working directory.
- **SEC-2 to SEC-7 and SEC-9 CLOSED.** **SEC-11 CLOSED**: the preflight digest gate plus the `--accept-config` adoption flag.
- **SEC-8, SEC-10 BOUNDED (accepted conditions, below).**

## New findings

None at MINOR or above.
- OBSERVATION: the signing policy reads only `--global`. A Founder who sets `commit.gpgsign` in the system config would get unsigned job commits. That is not the case today, and the README states the policy.
- Residual, applies throughout: a session that passes the permission system to write outside its working directory can still tamper with the control state or the private `%TEMP%` directory. That is inside Claude Code's permission boundary, not the supervisor's.

## Conditions (READY_WITH_CONDITIONS)

1. **SEC-8, lock-takeover race.** Owner: Founder.
   - Hold to: one supervisor per mission, started by hand.
   - Trigger: any automatic or scheduled start of the supervisor.
   - Resolution evidence: an atomic rename-based takeover with a test.
2. **SEC-10, local logs may hold secrets.** Owner: Founder.
   - Hold to: never attach `.agent-runtime/` wholesale to a PR or evidence.
   - Trigger: before sharing any session or Codex log.
   - Resolution evidence: a redaction or cleanup step, or a documented manual check.
3. **Mutation evidence for this revision.** Owner: engineering.
   - Record `mutants6/results.json` (71 mutants, M68–M72 included) on `7cee745` before the first real mission.
   - If any of M68–M72 survives, this verdict falls back to pending for that rule.
