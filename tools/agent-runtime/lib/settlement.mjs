import fs from 'node:fs';
import path from 'node:path';
import { ensureDir, writeText, sha256File } from './files.mjs';
import { checkpointPath, checkpointCopyPath } from './mission.mjs';
import { validateCheckpointFile } from './coherence.mjs';
import { isFinal } from './checkpoint.mjs';
import { renderCorrection } from './bootstrap.mjs';
import { claudeMetrics, resultExcerpt } from './executors.mjs';
import { unexpectedDirty } from './preflight.mjs';

// How a Claude run ends: its checkpoint is validated, corrected in the same session, accepted, or the
// run fails and the mission retries, pauses or blocks. Functions of the supervisor whose run it is.
const pad = (seq) => String(seq).padStart(4, '0');

// checkpoint rejected → the same session receives the errors (--resume) → it corrects → validate again.
export async function settleCheckpoint(supervisor, firstRun) {
  const current = supervisor.state.current;
  const max = supervisor.mission.limits.max_checkpoint_corrections;
  let run = firstRun;
  for (;;) {
    supervisor.transition('CHECKPOINTING', `validating the checkpoint of run ${current.run_seq}`);
    const tampered = supervisor.checkpointTampering();
    if (tampered) {
      supervisor.state.current = null;
      supervisor.block(`${tampered} (found while validating run ${current.run_seq})`);
      return;
    }
    if (!fs.existsSync(supervisor.paths.checkpointOut)) return failRun(supervisor, `no checkpoint written (exit ${run.status ?? 'unknown'})`, run);
    const verdict = validateCheckpointFile(supervisor.paths.checkpointOut, {
      mission: supervisor.mission,
      state: supervisor.state,
      previous: supervisor.lastCheckpoint(),
      repo: supervisor.repo,
      worktree: supervisor.worktree,
      runSeq: current.run_seq,
      stateDir: supervisor.paths.dir,
    });
    if (verdict.ok) return acceptCheckpoint(supervisor, verdict.checkpoint);
    const snapshot = `rejected-r${current.run_seq}-${current.corrections}.json`;
    fs.copyFileSync(supervisor.paths.checkpointOut, path.join(ensureDir(supervisor.paths.checkpoints), snapshot));
    supervisor.event({ type: 'checkpoint_rejected', run_seq: current.run_seq, attempt: current.corrections, errors: verdict.errors.slice(0, 20), snapshot });
    supervisor.log(`✗ checkpoint of run ${current.run_seq} rejected (${verdict.errors.length} errors)`);
    if (current.corrections >= max) return failRun(supervisor, `checkpoint still invalid after ${max} corrections`, run);
    current.corrections += 1;
    supervisor.save();
    const files = supervisor.sessionFiles(current.run_seq, current.corrections);
    const prompt = renderCorrection({ errors: verdict.errors, attempt: current.corrections, max });
    writeText(files.prompt, prompt);
    supervisor.event({ type: 'correction_start', run_seq: current.run_seq, attempt: current.corrections });
    run = await supervisor.claude(prompt, true, files);
    supervisor.event({ type: 'correction_end', run_seq: current.run_seq, attempt: current.corrections, exit_code: run.status, duration_ms: run.durationMs, metrics: claudeMetrics(run.result) });
  }
}

// Crash-safe order: the authoritative copy first, then the state, then the session's copy; an existing
// file under the same number (an acceptance a crash interrupted) is moved aside, never overwritten.
export function acceptCheckpoint(supervisor, cp) {
  const s = supervisor.state;
  const { run_seq: runSeq, executor } = s.current;
  ensureDir(supervisor.paths.checkpoints);
  const accepted = checkpointPath(supervisor.paths, cp.checkpoint_seq);
  if (fs.existsSync(accepted) && sha256File(accepted) !== sha256File(supervisor.paths.checkpointOut)) {
    const moved = supervisor.setAside(accepted, `orphan-${pad(cp.checkpoint_seq)}-before-r${runSeq}.json`);
    supervisor.event({ type: 'warning', message: `a checkpoint ${cp.checkpoint_seq} that no state recorded was moved to ${moved}` });
  }
  fs.copyFileSync(supervisor.paths.checkpointOut, accepted);
  supervisor.event({
    type: 'checkpoint_accepted',
    run_seq: runSeq,
    executor,
    checkpoint: cp.checkpoint_seq,
    mission_state: cp.mission_state,
    boundary: cp.boundary,
    commit: cp.git.head_commit,
    next_unit: cp.next_unit?.id ?? null,
    next_executor: cp.next_unit?.executor ?? null,
  });
  Object.assign(s, {
    last_checkpoint_seq: cp.checkpoint_seq,
    last_checkpoint_head: cp.git.head_commit,
    last_checkpoint_sha256: sha256File(accepted),
    next_unit: cp.next_unit,
    current: null,
    consecutive_failures: 0,
    pending: { notices: [], job_result: null },
    blocked_dirty: [],
    acknowledged_dirty: [],
  });
  supervisor.log(`✓ checkpoint ${cp.checkpoint_seq} accepted: ${cp.mission_state} at ${cp.boundary}`);
  if (isFinal(cp.mission_state)) {
    s.terminal_state = cp.mission_state;
    supervisor.transition('COMPLETED', `checkpoint ${cp.checkpoint_seq}: ${cp.mission_state}`);
    supervisor.event({ type: 'mission_terminal', terminal_state: cp.mission_state, checkpoint: cp.checkpoint_seq, commit: cp.git.head_commit });
  } else if (cp.mission_state === 'FOUNDER_REQUIRED') {
    supervisor.transition('FOUNDER_REQUIRED', `${cp.founder_action_required.decision_needed} (${cp.founder_action_required.reason})`);
  } else if (cp.mission_state === 'BLOCKED') {
    const blockers = cp.findings.open.filter((finding) => finding.blocking).map((finding) => finding.id);
    supervisor.transition('BLOCKED', `the mission declared BLOCKED: ${cp.founder_action_required?.decision_needed ?? `blocking findings ${blockers.join(', ')}`}`);
  } else {
    supervisor.transition('READY_FOR_FRESH_SESSION', `checkpoint ${cp.checkpoint_seq} accepted (${cp.boundary}); next unit ${cp.next_unit.id} (${cp.next_unit.executor})`);
  }
  ensureDir(supervisor.paths.checkpointCopies);
  fs.copyFileSync(accepted, checkpointCopyPath(supervisor.paths, cp.checkpoint_seq));
  fs.rmSync(supervisor.paths.checkpointOut, { force: true }); // its bytes are now the accepted checkpoint
}

export function failRun(supervisor, reason, run) {
  const s = supervisor.state;
  const current = s.current;
  if (fs.existsSync(supervisor.paths.checkpointOut)) supervisor.setAside(supervisor.paths.checkpointOut, `rejected-r${current.run_seq}-final.json`);
  s.current = null;
  s.consecutive_failures += 1;
  const excerpt = resultExcerpt(run?.result);
  supervisor.event({ type: 'run_failed', run_seq: current.run_seq, executor: current.executor, unit_id: current.unit.id, reason, excerpt });
  supervisor.log(`✗ run ${current.run_seq} failed: ${reason}`);
  const dirty = unexpectedDirty(supervisor.repo, supervisor.state);
  if (dirty.length) {
    s.blocked_dirty = dirty;
    supervisor.block(`DIRTY_WORKTREE after failed run ${current.run_seq} (${reason}): ${dirty.slice(0, 10).join(', ')}; probable origin: that session. Nothing was deleted; inspect them, then run again with --resolve "<note>"`);
    return;
  }
  const said = excerpt ? ` Its last message began: "${excerpt.slice(0, 160)}"` : '';
  supervisor.notice(`Run ${current.run_seq} (unit ${current.unit.id}) ended without a valid checkpoint: ${reason}.${said}`);
  if (s.consecutive_failures >= supervisor.mission.limits.max_consecutive_failures) {
    supervisor.transition('PAUSED', `${s.consecutive_failures} consecutive runs ended without a valid checkpoint; last: ${reason}.${said} Run the same command again to resume (for example after a usage-limit reset).`);
    return;
  }
  supervisor.transition('READY_FOR_FRESH_SESSION', `retrying unit ${current.unit.id} in a fresh session`);
}
