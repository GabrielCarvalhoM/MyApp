# AGENT_EXECUTION_RUNTIME_V1 — task contract

Contract **AER1-CONTRACT-r1** · 2026-10-31 America/Sao_Paulo · branch `chore/agent-execution-runtime-v1`, created in its own worktree (`.claude/worktrees/agent-execution-runtime-v1`) from the R7-B.1 closure `2c6cb931ccc6ad42964db89c33235ab4b0bfa52c` (equal to `origin/claude/domain-coaching-r7-b1` after a fetch). Founder authority: the direct [request](FOUNDER_REQUEST.md).

## 1. Objective and boundary

Build the smallest verifiable runtime that runs a long mission as a sequence of fresh headless sessions joined by validated structured checkpoints: an external supervisor, a deterministic checkpoint validator, a small bootstrap, local-tool-first execution, optional Codex delegation with automatic fallback, terminal stop and recovery.

**IMPLEMENTATION_AUTHORIZED = REPOSITORY_TOOLING**: `tools/agent-runtime/`, one `.gitignore` entry, short pointers in `CLAUDE.md` and `AGENTS.md`, this audit folder and insert-only mission records. Not authorized: any change under `CoachingCore/`, `canon/`, `product/` or `governance/`; freezes, catalog, policy or SSCTR authorities; QE-R7B1-04; R7-B.2; R7-C; merge; history rewrite.

## 2. Preserved state

R7-B.1 stays CLOSED NOT_READY with the single blocker QE-R7B1-04. R7B1-FREEZE-2 (`146ebb8`) and the evidence of every closed mission are unchanged. Proof at closure: `git diff --stat <base>..HEAD` touches only the paths authorized in §1.

## 3. Routing and proportionality

T2 / R2: one engineering domain and several new files, but the runtime will launch autonomous sessions, run declared commands and perform Git operations, which is a trust boundary. Discovery L0; implementation L1 with deterministic tests (test-first where behaviour is non-trivial); one independent review (reliability and security lens, fresh instance, worker ≠ judge) before READY, so the closing gate is L2. No Founder decision is expected.

## 4. Acceptance

Request §25 A–J, proven by `node --test` over `tools/agent-runtime/test/` (fake executors, temporary repositories, a simulated three-phase mission) and a zero-cost smoke test (`doctor`, `--dry-run`, empty-input CLI probes). No paid Claude or Codex call is needed to prove the state machine.

## 5. Stop

STOP_WHEN A–J are proven, the review is reconciled, the branch is pushed and the remote HEAD verified. ESCALATE_IF a reserved decision, a missing credential or a needed change outside §1 appears.
