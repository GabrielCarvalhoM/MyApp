import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import * as git from './git.mjs';
import { readJson, writeText, ensureDir, nowIso } from './files.mjs';
import { layout, checkpointPath, saveState, appendEvent, acquireLock, pidAlive } from './mission.mjs';
import { validateCheckpointFile } from './coherence.mjs';
import { isFinal } from './checkpoint.mjs';
import { renderBootstrap, renderCorrection, bootstrapListedPaths } from './bootstrap.mjs';
import { chooseExecutor } from './routing.mjs';
import { preflight, unexpectedDirty } from './preflight.mjs';
import { runClaude, claudeMetrics, resultExcerpt, detectCodex } from './executors.mjs';
import { runCodexUnit, runLocalUnit } from './delegation.mjs';

const STOP_STATES = ['COMPLETED', 'BLOCKED', 'FOUNDER_REQUIRED', 'PAUSED'];
const MAX_NOTICES = 6;
const pad = (seq) => String(seq).padStart(4, '0');
const minutes = (ms) => `${Math.round((ms ?? 0) / 60_000)} min`;

// Deterministic execution lifecycle of one mission. It never judges the work: sessions decide what
// to do next, the checkpoint validator decides whether a hand-over is acceptable.
export class Supervisor {
  constructor({ worktree, env = process.env, log = () => {} }) {
    this.worktree = worktree;
    this.paths = layout(worktree);
    this.env = env;
    this.log = log;
    this.mission = readJson(this.paths.mission);
    this.state = readJson(this.paths.state);
    this.codex = null; // availability, detected once per supervisor run
  }

  save() {
    saveState(this.paths, this.state);
  }

  event(event) {
    appendEvent(this.paths, this.mission, event);
  }

  headForLog() {
    try {
      return git.head(this.worktree);
    } catch {
      return null; // the audit line is still written; a broken repository surfaces in the preflight
    }
  }

  transition(status, reason) {
    const from = this.state.status;
    Object.assign(this.state, { status, reason: reason ?? null });
    this.save();
    this.event({
      type: 'transition',
      from,
      to: status,
      reason: reason ?? null,
      run_seq: this.state.run_seq,
      executor: this.state.current?.executor ?? null,
      checkpoint: this.state.last_checkpoint_seq,
      commit: this.headForLog(),
    });
  }

  block(reason) {
    this.transition('BLOCKED', reason);
    return false;
  }

  notice(text) {
    const { notices } = this.state.pending;
    if (!notices.includes(text)) notices.push(text);
    if (notices.length > MAX_NOTICES) notices.splice(0, notices.length - MAX_NOTICES);
  }

  summary() {
    const { status, terminal_state, reason, run_seq, last_checkpoint_seq, next_unit } = this.state;
    return {
      mission_id: this.mission.mission_id,
      status,
      terminal_state,
      reason,
      run_seq,
      last_checkpoint: last_checkpoint_seq,
      next_unit: next_unit ? `${next_unit.id} (${next_unit.executor})` : null,
      worktree: this.worktree,
    };
  }

  lastCheckpoint() {
    const seq = this.state.last_checkpoint_seq;
    return seq ? readJson(checkpointPath(this.paths, seq)) : null;
  }

  async run({ once = false, resolve = null, assumeDead = false } = {}) {
    const release = acquireLock(this.paths);
    try {
      if (this.state.status === 'PAUSED') this.transition('READY_FOR_FRESH_SESSION', 'resumed by a new supervisor run');
      await this.recoverInterrupted(assumeDead);
      if (resolve !== null) this.applyResolution(resolve);
      for (;;) {
        if (STOP_STATES.includes(this.state.status)) return this.summary();
        const { limits } = this.mission;
        if (this.state.run_seq - this.state.run_window_start >= limits.max_runs) {
          this.block(`MAX_RUNS: ${limits.max_runs} runs since the start or the last resolution; run again with --resolve to continue`);
          return this.summary();
        }
        if (!this.preflight()) return this.summary();
        await this.runUnit(this.state.next_unit);
        if (once) return this.summary();
      }
    } finally {
      release();
    }
  }

  // A previous supervisor stopped while a run was in flight.
  async recoverInterrupted(assumeDead) {
    const current = this.state.current;
    if (!current) return;
    if (current.pid && pidAlive(current.pid) && !assumeDead) {
      throw new Error(`run ${current.run_seq} (${current.executor}, pid ${current.pid}) may still be running; wait for it to end, or pass --assume-dead once you have checked that pid ${current.pid} is not it`);
    }
    this.event({ type: 'recovered_interrupted_run', run_seq: current.run_seq, executor: current.executor, pid: current.pid ?? null });
    this.log(`recovering run ${current.run_seq} (${current.executor}), interrupted together with its supervisor`);
    if (current.executor === 'claude') {
      await this.settleCheckpoint({ status: null, result: null });
      return;
    }
    this.state.current = null;
    this.continueWith(current.unit.then, {
      executor: current.executor,
      unit_id: current.unit.id,
      run_seq: current.run_seq,
      status: 'INTERRUPTED',
      reasons: ['the supervisor stopped while the job ran; partial work may exist'],
      job_branch: current.job_branch ?? null,
      job_worktree: current.job_worktree ?? null,
      brief: current.unit.job?.brief ?? null,
    });
  }

  applyResolution(note) {
    const s = this.state;
    if (typeof note !== 'string' || note.trim() === '') throw new Error('--resolve needs a note');
    if (s.status !== 'BLOCKED' && s.status !== 'FOUNDER_REQUIRED') {
      const terminal = s.status === 'COMPLETED' ? ` (${s.terminal_state}): a terminal mission is never reopened; start a new mission` : '';
      throw new Error(`--resolve applies to a BLOCKED or FOUNDER_REQUIRED mission; this one is ${s.status}${terminal}`);
    }
    this.notice(`FOUNDER RESOLUTION (${nowIso()}), authoritative at this point: ${note.trim()}`);
    if (s.blocked_dirty.length) {
      s.acknowledged_dirty = [...new Set([...s.acknowledged_dirty, ...s.blocked_dirty])];
      this.notice(`Founder-acknowledged uncommitted paths: ${s.blocked_dirty.slice(0, 10).join(', ')}. Classify each one (commit what belongs to the mission, report the rest); never delete one.`);
    }
    this.event({ type: 'founder_resolution', previous_status: s.status, note: note.trim().slice(0, 500) });
    Object.assign(s, { blocked_dirty: [], consecutive_failures: 0, run_window_start: s.run_seq });
    this.transition('READY_FOR_FRESH_SESSION', 'resolved by the Founder');
  }

  preflight() {
    const result = preflight({
      worktree: this.worktree,
      mission: this.mission,
      state: this.state,
      onWarning: (message) => this.event({ type: 'warning', message }),
    });
    if (result.block) {
      if (result.dirty) this.state.blocked_dirty = result.dirty;
      return this.block(result.block);
    }
    result.notices.forEach((text) => this.notice(text));
    return true;
  }

  async runUnit(unit) {
    if (unit.executor === 'claude') return this.runClaudeUnit(unit);
    if (unit.executor === 'local') return runLocalUnit(this, unit, unit.job.command);
    this.codex ??= detectCodex(this.env);
    const choice = chooseExecutor(unit, this.codex);
    if (choice.executor === 'codex') return runCodexUnit(this, unit);
    this.event({ type: 'fallback', unit_id: unit.id, from: 'codex', to: choice.executor, reason: choice.reason });
    this.log(`codex fallback for ${unit.id}: ${choice.reason}`);
    const skipped = { executor: 'codex', unit_id: unit.id, status: 'NOT_RUN', reasons: [choice.reason], brief: unit.job.brief };
    if (choice.executor === 'local') return runLocalUnit(this, unit, choice.command, skipped);
    return this.continueWith(unit.then, { ...skipped, status: 'FALLBACK_TO_CLAUDE' });
  }

  continueWith(nextUnit, jobResult) {
    this.state.next_unit = nextUnit;
    this.state.pending.job_result = jobResult;
    this.transition('READY_FOR_FRESH_SESSION', `${jobResult.executor} job ${jobResult.unit_id}: ${jobResult.status}; next unit ${nextUnit.id}`);
  }

  sessionFiles(runSeq, attempt) {
    const stem = path.join(this.paths.sessions, attempt ? `${pad(runSeq)}.c${attempt}` : pad(runSeq));
    return { prompt: `${stem}.prompt.md`, stdout: `${stem}.result.json`, stderr: `${stem}.stderr.log` };
  }

  claude(prompt, resume, files) {
    const current = this.state.current;
    return runClaude({
      env: {
        ...this.env,
        AGENT_RUNTIME_MISSION: this.mission.mission_id,
        AGENT_RUNTIME_STATE_DIR: this.paths.dir,
        AGENT_RUNTIME_RUN_SEQ: String(current.run_seq),
      },
      cwd: this.worktree,
      prompt,
      sessionId: current.session_id,
      resume,
      route: current.unit.route,
      permissionMode: this.mission.claude.permission_mode,
      maxBudgetUsd: this.mission.claude.max_budget_usd,
      stdoutFile: files.stdout,
      stderrFile: files.stderr,
      onSpawn: (pid) => {
        current.pid = pid;
        this.save();
      },
    });
  }

  // Never deletes: a stray file is moved aside with a name that says where it came from.
  setAside(file, name) {
    ensureDir(this.paths.checkpoints);
    const target = path.join(this.paths.checkpoints, name);
    fs.renameSync(file, target);
    return path.basename(target);
  }

  async runClaudeUnit(unit) {
    const s = this.state;
    const runSeq = s.run_seq + 1;
    if (fs.existsSync(this.paths.checkpointOut)) {
      const moved = this.setAside(this.paths.checkpointOut, `leftover-before-r${runSeq}.json`);
      this.event({ type: 'warning', message: `an unvalidated checkpoint was left from an earlier run; moved to ${moved}` });
    }
    const previous = this.lastCheckpoint();
    const head = git.head(this.worktree);
    const prompt = renderBootstrap({ mission: this.mission, state: s, unit, previous, runSeq, head, worktree: this.worktree });
    const files = this.sessionFiles(runSeq, 0);
    writeText(files.prompt, prompt);
    s.run_seq = runSeq;
    s.current = { run_seq: runSeq, executor: 'claude', unit, session_id: randomUUID(), pid: null, started_at: nowIso(), corrections: 0 };
    this.transition('RUNNING', `fresh session ${runSeq} for unit ${unit.id}`);
    this.event({
      type: 'session_start',
      run_seq: runSeq,
      unit_id: unit.id,
      session_id: s.current.session_id,
      model: unit.route.model,
      effort: unit.route.effort,
      bootstrap_bytes: Buffer.byteLength(prompt),
      bootstrap_paths: bootstrapListedPaths(previous),
    });
    this.log(`▶ run ${runSeq}: fresh Claude session ${s.current.session_id} for unit ${unit.id} (${unit.route.model}, ${unit.route.effort})`);
    const run = await this.claude(prompt, false, files);
    this.event({ type: 'session_end', run_seq: runSeq, exit_code: run.status, duration_ms: run.durationMs, error: run.error?.message ?? null, metrics: claudeMetrics(run.result) });
    this.log(`■ run ${runSeq} ended (exit ${run.status ?? run.error?.message}, ${minutes(run.durationMs)})`);
    await this.settleCheckpoint(run);
  }

  // checkpoint rejected → the same session receives the errors (--resume) → it corrects → validate again.
  async settleCheckpoint(firstRun) {
    const current = this.state.current;
    const max = this.mission.limits.max_checkpoint_corrections;
    let run = firstRun;
    for (;;) {
      this.transition('CHECKPOINTING', `validating the checkpoint of run ${current.run_seq}`);
      if (!fs.existsSync(this.paths.checkpointOut)) return this.runFailed(`no checkpoint written (exit ${run.status ?? 'unknown'})`, run);
      const verdict = validateCheckpointFile(this.paths.checkpointOut, {
        mission: this.mission,
        state: this.state,
        previous: this.lastCheckpoint(),
        worktree: this.worktree,
        runSeq: current.run_seq,
        stateDir: this.paths.dir,
      });
      if (verdict.ok) return this.accept(verdict.checkpoint);
      const snapshot = `rejected-r${current.run_seq}-${current.corrections}.json`;
      fs.copyFileSync(this.paths.checkpointOut, path.join(ensureDir(this.paths.checkpoints), snapshot));
      this.event({ type: 'checkpoint_rejected', run_seq: current.run_seq, attempt: current.corrections, errors: verdict.errors.slice(0, 20), snapshot });
      this.log(`✗ checkpoint of run ${current.run_seq} rejected (${verdict.errors.length} errors)`);
      if (current.corrections >= max) return this.runFailed(`checkpoint still invalid after ${max} corrections`, run);
      current.corrections += 1;
      this.save();
      const files = this.sessionFiles(current.run_seq, current.corrections);
      const prompt = renderCorrection({ errors: verdict.errors, attempt: current.corrections, max });
      writeText(files.prompt, prompt);
      this.event({ type: 'correction_start', run_seq: current.run_seq, attempt: current.corrections });
      run = await this.claude(prompt, true, files);
      this.event({ type: 'correction_end', run_seq: current.run_seq, attempt: current.corrections, exit_code: run.status, duration_ms: run.durationMs, metrics: claudeMetrics(run.result) });
    }
  }

  accept(cp) {
    const s = this.state;
    const { run_seq: runSeq, executor } = s.current;
    ensureDir(this.paths.checkpoints);
    fs.renameSync(this.paths.checkpointOut, checkpointPath(this.paths, cp.checkpoint_seq));
    this.event({
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
      next_unit: cp.next_unit,
      current: null,
      consecutive_failures: 0,
      pending: { notices: [], job_result: null },
      blocked_dirty: [],
      acknowledged_dirty: [],
    });
    this.log(`✓ checkpoint ${cp.checkpoint_seq} accepted: ${cp.mission_state} at ${cp.boundary}`);
    if (isFinal(cp.mission_state)) {
      s.terminal_state = cp.mission_state;
      this.transition('COMPLETED', `checkpoint ${cp.checkpoint_seq}: ${cp.mission_state}`);
      this.event({ type: 'mission_terminal', terminal_state: cp.mission_state, checkpoint: cp.checkpoint_seq, commit: cp.git.head_commit });
    } else if (cp.mission_state === 'FOUNDER_REQUIRED') {
      this.transition('FOUNDER_REQUIRED', `${cp.founder_action_required.decision_needed} (${cp.founder_action_required.reason})`);
    } else if (cp.mission_state === 'BLOCKED') {
      const blockers = cp.findings.open.filter((finding) => finding.blocking).map((finding) => finding.id);
      this.transition('BLOCKED', `the mission declared BLOCKED: ${cp.founder_action_required?.decision_needed ?? `blocking findings ${blockers.join(', ')}`}`);
    } else {
      this.transition('READY_FOR_FRESH_SESSION', `checkpoint ${cp.checkpoint_seq} accepted (${cp.boundary}); next unit ${cp.next_unit.id} (${cp.next_unit.executor})`);
    }
  }

  runFailed(reason, run) {
    const s = this.state;
    const current = s.current;
    if (fs.existsSync(this.paths.checkpointOut)) this.setAside(this.paths.checkpointOut, `rejected-r${current.run_seq}-final.json`);
    s.current = null;
    s.consecutive_failures += 1;
    const excerpt = resultExcerpt(run?.result);
    this.event({ type: 'run_failed', run_seq: current.run_seq, executor: current.executor, unit_id: current.unit.id, reason, excerpt });
    this.log(`✗ run ${current.run_seq} failed: ${reason}`);
    const dirty = unexpectedDirty(this.worktree, this.state);
    if (dirty.length) {
      s.blocked_dirty = dirty;
      this.block(`DIRTY_WORKTREE after failed run ${current.run_seq} (${reason}): ${dirty.slice(0, 10).join(', ')}; probable origin: that session. Nothing was deleted; inspect them, then run again with --resolve "<note>"`);
      return;
    }
    const said = excerpt ? ` Its last message began: "${excerpt.slice(0, 160)}"` : '';
    this.notice(`Run ${current.run_seq} (unit ${current.unit.id}) ended without a valid checkpoint: ${reason}.${said}`);
    if (s.consecutive_failures >= this.mission.limits.max_consecutive_failures) {
      this.transition('PAUSED', `${s.consecutive_failures} consecutive runs ended without a valid checkpoint; last: ${reason}.${said} Run the same command again to resume (for example after a usage-limit reset).`);
      return;
    }
    this.transition('READY_FOR_FRESH_SESSION', `retrying unit ${current.unit.id} in a fresh session`);
  }
}
