import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import * as git from './git.mjs';
import { readJson, readJsonl, writeText, ensureDir, nowIso, sha256File } from './files.mjs';
import { openMission, checkpointPath, saveState, appendEvent, acquireLock, pidAlive } from './mission.mjs';
import { renderBootstrap, bootstrapListedPaths } from './bootstrap.mjs';
import { chooseExecutor } from './routing.mjs';
import { preflight } from './preflight.mjs';
import { runClaude, claudeMetrics, detectCodex } from './executors.mjs';
import { runCodexUnit } from './delegation.mjs';
import { settleCheckpoint } from './settlement.mjs';

const STATES = ['CREATED', 'RUNNING', 'CHECKPOINTING', 'READY_FOR_FRESH_SESSION', 'PAUSED', 'BLOCKED', 'FOUNDER_REQUIRED', 'COMPLETED'];
const STOP_STATES = ['COMPLETED', 'BLOCKED', 'FOUNDER_REQUIRED', 'PAUSED'];
const MAX_NOTICES = 6;
const pad = (seq) => String(seq).padStart(4, '0');
const minutes = (ms) => `${Math.round((ms ?? 0) / 60_000)} min`;

// The audit log is append-only: a mission it records as terminal stays terminal, whatever state.json says.
function assertConsistent(state, events) {
  if (!STATES.includes(state.status)) throw new Error(`state.json has an unknown status ${JSON.stringify(state.status)}`);
  const terminal = events.find((event) => event.type === 'mission_terminal');
  if (terminal && (state.status !== 'COMPLETED' || state.terminal_state !== terminal.terminal_state)) {
    throw new Error(`state.json contradicts the audit log: the mission ended ${terminal.terminal_state} at checkpoint ${terminal.checkpoint}, and a terminal mission is never reopened`);
  }
}

// Deterministic execution lifecycle of one mission. It never judges the work: sessions decide what
// to do next, the checkpoint validator decides whether a hand-over is acceptable. Its control state
// (`control`, inside the Git common directory) is outside every worktree a session works in.
export class Supervisor {
  constructor({ control, env = process.env, log = () => {} }) {
    const { mission, worktree, paths } = openMission(control);
    Object.assign(this, { mission, worktree, paths, env, log });
    this.state = readJson(paths.state);
    assertConsistent(this.state, readJsonl(paths.events));
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

  // The last accepted checkpoint anchors every continuity check, so it must still be the accepted bytes.
  checkpointTampering() {
    const { last_checkpoint_seq: seq, last_checkpoint_sha256: expected } = this.state;
    if (!seq || !expected) return null;
    const file = checkpointPath(this.paths, seq);
    const actual = fs.existsSync(file) ? sha256File(file) : null;
    if (actual === expected) return null;
    return `CHECKPOINT_TAMPERED: checkpoint ${seq} is ${actual ? 'no longer the accepted version' : 'missing'}; nothing was run. Inspect ${path.basename(file)}, then run again with --resolve "<note>" to continue from it as it now is`;
  }

  async run({ once = false, resolve = null, assumeDead = false } = {}) {
    const release = acquireLock(this.paths);
    try {
      if (this.state.status === 'PAUSED') this.transition('READY_FOR_FRESH_SESSION', 'resumed by a new supervisor run');
      await this.recoverInterrupted(assumeDead);
      if (resolve !== null) this.applyResolution(resolve);
      for (;;) {
        if (STOP_STATES.includes(this.state.status)) return this.summary();
        if (!this.state.next_unit) {
          this.block('NO_NEXT_UNIT: the state names no unit to run; inspect the last checkpoint');
          return this.summary();
        }
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
      await settleCheckpoint(this, { status: null, result: null });
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
    if (this.checkpointTampering()) {
      const file = checkpointPath(this.paths, s.last_checkpoint_seq);
      if (!fs.existsSync(file)) throw new Error(`checkpoint ${s.last_checkpoint_seq} is missing; restore it before resolving`);
      readJson(file);
      s.last_checkpoint_sha256 = sha256File(file);
      this.notice(`The Founder accepted checkpoint ${s.last_checkpoint_seq} as it now is; it had changed after it was accepted.`);
      this.event({ type: 'checkpoint_reanchored', checkpoint: s.last_checkpoint_seq, sha256: s.last_checkpoint_sha256 });
    }
    if (s.blocked_dirty.length) {
      s.acknowledged_dirty = [...new Set([...s.acknowledged_dirty, ...s.blocked_dirty])];
      this.notice(`Founder-acknowledged uncommitted paths: ${s.blocked_dirty.slice(0, 10).join(', ')}. Classify each one (commit what belongs to the mission, report the rest); never delete one.`);
    }
    this.event({ type: 'founder_resolution', previous_status: s.status, note: note.trim().slice(0, 500) });
    Object.assign(s, { blocked_dirty: [], consecutive_failures: 0, run_window_start: s.run_seq });
    this.transition('READY_FOR_FRESH_SESSION', 'resolved by the Founder');
  }

  preflight() {
    const tampered = this.checkpointTampering();
    if (tampered) return this.block(tampered);
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
    this.codex ??= detectCodex(this.env);
    const choice = chooseExecutor(unit, this.codex);
    if (choice.executor === 'codex') return runCodexUnit(this, unit);
    this.event({ type: 'fallback', unit_id: unit.id, from: 'codex', to: 'claude', reason: choice.reason });
    this.log(`codex fallback for ${unit.id}: ${choice.reason}`);
    return this.continueWith(unit.then, {
      executor: 'codex',
      unit_id: unit.id,
      status: 'FALLBACK_TO_CLAUDE',
      reasons: [choice.reason],
      brief: unit.job.brief,
      acceptance_pending: unit.job.acceptance.map((command) => command.join(' ')),
    });
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
        AGENT_RUNTIME_CONTROL_DIR: this.paths.control,
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
    await settleCheckpoint(this, run);
  }
}
