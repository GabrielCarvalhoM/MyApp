import { nowIso } from './files.mjs';
import { runCodexJob, codexJobNames } from './jobs.mjs';

// A Codex job runs between two sessions. One executor works at a time, so a job never shares a
// working tree with a session; whatever Codex does not deliver returns to the Claude unit that follows.
export async function runCodexUnit(supervisor, unit) {
  const state = supervisor.state;
  const names = codexJobNames(supervisor.mission, unit, state.run_seq + 1);
  state.run_seq += 1;
  const runSeq = state.run_seq;
  state.current = { run_seq: runSeq, executor: 'codex', unit, pid: null, started_at: nowIso(), job_branch: names.branch, job_worktree: names.worktree };
  supervisor.transition('RUNNING', `codex job for unit ${unit.id}`);
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
      onSpawn: (pid) => {
        state.current.pid = pid;
        supervisor.save();
      },
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
      acceptance_pending: unit.job.acceptance.map((command) => command.join(' ')),
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
  state.current = null;
  if (result.status === 'DONE') return supervisor.continueWith(unit.then, result);
  // Quota, authentication or a broken job: Codex is not tried again in this supervisor run.
  supervisor.codex = { ok: false, reason: `a codex job failed earlier in this supervisor run (${result.reasons[0]})` };
  const reason = `codex job failed: ${result.reasons.join('; ')}; the next Claude unit does the necessary work`;
  supervisor.event({ type: 'fallback', unit_id: unit.id, from: 'codex', to: 'claude', reason });
  supervisor.log(`codex job ${unit.id} failed; the next Claude unit takes over`);
  return supervisor.continueWith(unit.then, { ...result, status: 'FALLBACK_TO_CLAUDE', brief: unit.job.brief });
}
