import { nowIso } from './files.mjs';
import { fallbackFor } from './routing.mjs';
import { runCodexJob, runLocalJob, codexJobNames } from './jobs.mjs';

// Delegated units of a mission (Codex jobs and local commands), run by the supervisor between two
// sessions. One executor works at a time, so a job never shares a working tree with a session.

function startRun(supervisor, executor, unit, extra = {}) {
  const state = supervisor.state;
  state.run_seq += 1;
  state.current = { run_seq: state.run_seq, executor, unit, pid: null, started_at: nowIso(), ...extra };
  supervisor.transition('RUNNING', `${executor} job for unit ${unit.id}`);
  return state.run_seq;
}

const recordPid = (supervisor) => (pid) => {
  supervisor.state.current.pid = pid;
  supervisor.save();
};

export async function runCodexUnit(supervisor, unit) {
  const names = codexJobNames(supervisor.mission, unit, supervisor.state.run_seq + 1);
  const runSeq = startRun(supervisor, 'codex', unit, { job_branch: names.branch, job_worktree: names.worktree });
  supervisor.event({ type: 'job_start', run_seq: runSeq, executor: 'codex', unit_id: unit.id, job_branch: names.branch });
  supervisor.log(`▶ run ${runSeq}: codex job ${unit.id} in ${names.worktree}`);
  let result;
  try {
    result = await runCodexJob({
      mission: supervisor.mission,
      paths: supervisor.paths,
      worktree: supervisor.worktree,
      unit,
      runSeq,
      env: supervisor.env,
      codexArgv: supervisor.codex.argv,
      onSpawn: recordPid(supervisor),
    });
  } catch (error) {
    result = {
      executor: 'codex',
      unit_id: unit.id,
      run_seq: runSeq,
      status: 'FAILED',
      reasons: [`supervisor error while running the job: ${error.message}`],
      job_branch: names.branch,
      job_worktree: names.worktree,
    };
  }
  supervisor.event({
    type: 'job_end',
    run_seq: runSeq,
    executor: 'codex',
    unit_id: unit.id,
    status: result.status,
    reasons: result.reasons.slice(0, 5),
    duration_ms: result.duration_ms ?? null,
    commit: result.commit ?? null,
  });
  supervisor.state.current = null;
  if (result.status === 'DONE') return supervisor.continueWith(unit.then, result);
  // Quota, authentication or a broken job: do not try Codex again in this supervisor run.
  supervisor.codex = { ok: false, reason: `a codex job failed earlier in this supervisor run (${result.reasons[0]})` };
  const fallback = fallbackFor(unit, `codex job failed: ${result.reasons.join('; ')}`);
  supervisor.event({ type: 'fallback', unit_id: unit.id, from: 'codex', to: fallback.executor, reason: fallback.reason });
  supervisor.log(`codex job ${unit.id} failed; falling back to ${fallback.executor}`);
  if (fallback.executor === 'local') return runLocalUnit(supervisor, unit, fallback.command, result);
  return supervisor.continueWith(unit.then, { ...result, status: 'FALLBACK_TO_CLAUDE', brief: unit.job.brief });
}

export async function runLocalUnit(supervisor, unit, command, fallbackFrom = null) {
  const runSeq = startRun(supervisor, 'local', unit);
  supervisor.event({ type: 'job_start', run_seq: runSeq, executor: 'local', unit_id: unit.id, command: command.join(' ') });
  supervisor.log(`▶ run ${runSeq}: local job ${unit.id}: ${command.join(' ')}`);
  let result;
  try {
    result = await runLocalJob({
      paths: supervisor.paths,
      worktree: supervisor.worktree,
      unit,
      command,
      runSeq,
      env: supervisor.env,
      onSpawn: recordPid(supervisor),
    });
  } catch (error) {
    result = {
      executor: 'local',
      unit_id: unit.id,
      run_seq: runSeq,
      status: 'FAILED',
      reasons: [`supervisor error while running the job: ${error.message}`],
      command: command.join(' '),
      exit_code: null,
      dirty_paths: [],
    };
  }
  supervisor.event({
    type: 'job_end',
    run_seq: runSeq,
    executor: 'local',
    unit_id: unit.id,
    status: result.status,
    reasons: result.reasons,
    duration_ms: result.duration_ms ?? null,
    exit_code: result.exit_code,
  });
  const state = supervisor.state;
  state.current = null;
  const fresh = result.dirty_paths.filter((file) => !state.acknowledged_dirty.includes(file));
  if (fresh.length) {
    state.acknowledged_dirty.push(...fresh);
    supervisor.notice(`Local job ${unit.id} left uncommitted changes (origin known: that job): ${fresh.slice(0, 10).join(', ')}. Commit what belongs to the mission; restore by-products deliberately.`);
  }
  const handed = fallbackFrom
    ? { ...result, fallback_from: { executor: fallbackFrom.executor, status: fallbackFrom.status, reasons: fallbackFrom.reasons } }
    : result;
  return supervisor.continueWith(unit.then, handed);
}
