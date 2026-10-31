import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { writeJsonAtomic } from '../lib/files.mjs';
import { saveState } from '../lib/mission.mjs';
import {
  makeRepo, cleanup, startMission, script, fakeEnv, sessionEnv, supervise, calls, events, state, sh, write,
  running, closing, ROUTE, RUNTIME,
} from './helpers.mjs';

const commitStep = (file, extra = []) => [{ write: { path: file } }, { commit: `add ${file}` }, ...extra];
const closeStep = (missionState = 'COMPLETE', overrides = {}) => ({ actions: [{ push: true }, { checkpoint: closing(missionState, overrides) }] });
const blocker = { id: 'QE-1', severity: 'MAJOR', summary: 'kept open by design', owner: 'engineering', blocking: true };

function setup(t, steps, envOptions = {}, missionOptions = {}) {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo, missionOptions);
  const claude = script(repo, steps);
  return { repo, found, claude, env: fakeEnv({ claudeScript: claude, ...envOptions }) };
}

test('a terminal mission runs nothing more and is never resolved back open', async (t) => {
  const { found, claude, env } = setup(t, [{ actions: [...commitStep('docs/close.md'), { push: true }, { checkpoint: closing('CLOSED_NOT_READY', { findings: { open: [blocker], closed: [] } }) }] }]);
  const first = await supervise(found, env);
  assert.deepEqual([first.summary.status, first.summary.terminal_state], ['COMPLETED', 'CLOSED_NOT_READY']);
  const again = await supervise(found, env);
  assert.equal(again.summary.status, 'COMPLETED');
  await assert.rejects(supervise(found, env, { resolve: 'please continue' }), /a terminal mission is never reopened/);
  assert.equal(calls(claude).length, 1, 'no session after the terminal state');
  const log = events(found);
  const terminalAt = log.findIndex((event) => event.type === 'mission_terminal');
  assert.ok(terminalAt > 0);
  assert.ok(!log.slice(terminalAt).some((event) => ['session_start', 'job_start'].includes(event.type)), 'no work after the terminal state');
});

test('a crashed session is retried in a fresh session that is told what happened', async (t) => {
  const { found, claude, env } = setup(t, [
    { actions: commitStep('docs/half.md'), exit: 1, result: 'Claude AI usage limit reached; resets at 5pm' },
    closeStep(),
  ]);
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  const [first, second] = calls(claude);
  assert.notEqual(first.session_id, second.session_id);
  assert.deepEqual([first.resume, second.resume], [false, false]);
  assert.match(second.prompt, /Run 1 \(unit U1\) ended without a valid checkpoint: no checkpoint written \(exit 1\)/);
  assert.match(second.prompt, /usage limit reached/);
  assert.match(second.prompt, /is ahead of the last checkpoint commit/);
});

test('consecutive failures pause the mission and the same command resumes it', async (t) => {
  const { found, claude, env } = setup(t, [{ exit: 1 }, { exit: 1 }, closeStep()]);
  const paused = await supervise(found, env);
  assert.equal(paused.summary.status, 'PAUSED');
  assert.match(paused.summary.reason, /2 consecutive runs ended without a valid checkpoint/);
  assert.equal(calls(claude).length, 2);
  const resumed = await supervise(found, env);
  assert.equal(resumed.summary.status, 'COMPLETED');
  assert.equal(calls(claude).length, 3);
});

test('a rejected checkpoint goes back to the same session with the errors, then is accepted', async (t) => {
  const { found, claude, env } = setup(t, [
    { actions: [...commitStep('docs/a.md'), { checkpoint: running({ next_exact_action: '' }) }] },
    { actions: [{ patchCheckpoint: { next_exact_action: 'continue with U2' } }] },
    closeStep(),
  ]);
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  const [first, correction, fresh] = calls(claude);
  assert.deepEqual([correction.resume, correction.session_id], [true, first.session_id]);
  assert.match(correction.prompt, /next_exact_action: must be a non-empty string/);
  assert.deepEqual([fresh.resume, fresh.session_id === first.session_id], [false, false]);
  assert.ok(fs.existsSync(path.join(found.paths.checkpoints, 'rejected-r1-0.json')), 'the rejected version is kept');
  assert.ok(fs.existsSync(path.join(found.paths.checkpoints, '0001.json')));
});

test('a checkpoint still invalid after the correction limit is never accepted', async (t) => {
  const invalid = { checkpoint: running({ next_exact_action: '' }) };
  const { found, claude, env } = setup(t, [{ actions: [...commitStep('docs/a.md'), invalid] }, { actions: [] }, closeStep()], {}, { limits: { max_checkpoint_corrections: 1 } });
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  const log = events(found);
  assert.equal(log.filter((event) => event.type === 'checkpoint_rejected').length, 2);
  assert.match(log.find((event) => event.type === 'run_failed').reason, /still invalid after 1 corrections/);
  assert.ok(fs.existsSync(path.join(found.paths.checkpoints, 'rejected-r1-final.json')));
  assert.equal(state(found).last_checkpoint_seq, 1, 'only the later valid checkpoint counts');
  assert.equal(calls(claude)[2].resume, false);
});

test('changes left by a failed session block the mission; nothing is deleted; a resolution continues', async (t) => {
  const { found, claude, env } = setup(t, [
    { actions: [{ write: { path: 'notes/wip.md', content: 'partial work\n' } }], exit: 1 },
    { actions: [{ commit: 'keep the partial work' }, { push: true }, { checkpoint: closing() }] },
  ]);
  const blocked = await supervise(found, env);
  assert.equal(blocked.summary.status, 'BLOCKED');
  assert.match(blocked.summary.reason, /DIRTY_WORKTREE after failed run 1.*notes\/wip\.md/);
  assert.equal(fs.readFileSync(path.join(found.worktree, 'notes/wip.md'), 'utf8'), 'partial work\n');
  assert.equal((await supervise(found, env)).summary.status, 'BLOCKED', 'a blocked mission waits for a resolution');
  assert.equal(calls(claude).length, 1);
  const resumed = await supervise(found, env, { resolve: 'notes/wip.md is the interrupted session’s work; keep it' });
  assert.equal(resumed.summary.status, 'COMPLETED');
  const second = calls(claude)[1];
  assert.match(second.prompt, /FOUNDER RESOLUTION .*keep it/);
  assert.match(second.prompt, /Founder-acknowledged uncommitted paths: notes\/wip\.md/);
});

test('an unexpected change in the worktree blocks before any session starts', async (t) => {
  const { found, claude, env } = setup(t, [closeStep()]);
  write(found.worktree, 'stray.txt', 'unknown origin\n');
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'BLOCKED');
  assert.match(summary.reason, /DIRTY_WORKTREE: uncommitted changes of unknown origin: stray\.txt/);
  assert.equal(calls(claude).length, 0);
  assert.ok(fs.existsSync(path.join(found.worktree, 'stray.txt')));
});

// The state a supervisor leaves behind when it dies while session 1 is running.
function interruptedRun(found, pid) {
  const current = state(found);
  Object.assign(current, { status: 'RUNNING', run_seq: 1, current: { run_seq: 1, executor: 'claude', unit: found.mission.first_unit, session_id: randomUUID(), pid, started_at: new Date().toISOString(), corrections: 0 } });
  saveState(found.paths, current);
}

const deadPid = () => spawnSync(process.execPath, ['-e', '0']).pid;

test('after a supervisor crash, the interrupted session’s valid checkpoint is accepted on restart', async (t) => {
  const { found, claude, env } = setup(t, [closeStep()]);
  interruptedRun(found, deadPid());
  write(found.worktree, 'docs/plan.md', '# plan\n');
  sh(found.worktree, 'add', '-A');
  sh(found.worktree, 'commit', '--quiet', '-m', 'the interrupted session committed its unit');
  assert.equal(spawnSync(process.execPath, [RUNTIME, 'checkpoint', 'template'], { cwd: found.worktree, env: sessionEnv(env, found) }).status, 0);
  const cpFile = found.paths.checkpointOut;
  writeJsonAtomic(cpFile, { ...JSON.parse(fs.readFileSync(cpFile, 'utf8')), ...running() });
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  const log = events(found);
  assert.ok(log.some((event) => event.type === 'recovered_interrupted_run' && event.run_seq === 1));
  assert.ok(log.some((event) => event.type === 'checkpoint_accepted' && event.run_seq === 1 && event.checkpoint === 1));
  assert.equal(calls(claude).length, 1, 'only the next unit needed a session');
});

test('a live supervisor or a live recorded run is never overridden silently', async (t) => {
  const { found, claude, env } = setup(t, [closeStep()]);
  fs.writeFileSync(found.paths.lock, JSON.stringify({ pid: process.pid, started_at: 'now' }));
  await assert.rejects(supervise(found, env), /another supervisor \(pid \d+/);
  fs.writeFileSync(found.paths.lock, JSON.stringify({ pid: deadPid(), started_at: 'earlier' }));
  interruptedRun(found, process.pid);
  await assert.rejects(supervise(found, env), /may still be running/);
  const { summary } = await supervise(found, env, { assumeDead: true });
  assert.equal(summary.status, 'COMPLETED');
  assert.equal(calls(claude).length, 1);
});

test('remote commits the mission branch lacks block the next launch', async (t) => {
  const { repo, found, claude, env } = setup(t, [{ actions: [...commitStep('docs/a.md', [{ push: true }]), { checkpoint: running() }] }, closeStep()]);
  assert.equal((await supervise(found, env, { once: true })).summary.status, 'READY_FOR_FRESH_SESSION');
  const other = path.join(repo.root, 'other-clone');
  sh(repo.root, 'clone', '--quiet', '--branch', found.mission.repo.branch, repo.origin, other);
  for (const [key, value] of [['user.name', 'Someone Else'], ['user.email', 'else@example.invalid'], ['core.autocrlf', 'false']]) sh(other, 'config', key, value);
  write(other, 'docs/remote.md', 'pushed from elsewhere\n');
  sh(other, 'add', '-A');
  sh(other, 'commit', '--quiet', '-m', 'remote-only commit');
  sh(other, 'push', '--quiet');
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'BLOCKED');
  assert.match(summary.reason, /REMOTE_DIVERGED/);
  assert.equal(calls(claude).length, 1);
});

test('FOUNDER_REQUIRED stops the mission; the resolution reaches the next session', async (t) => {
  const decision = running({
    mission_state: 'FOUNDER_REQUIRED',
    boundary: 'blocker',
    founder_action_required: { reason: 'a product trade-off', decision_needed: 'choose A or B', options: ['A', 'B'] },
    next_unit: { id: 'U2', executor: 'claude', goal: 'apply the Founder decision', route: { ...ROUTE } },
  });
  const { found, claude, env } = setup(t, [{ actions: [{ checkpoint: decision }] }, closeStep()]);
  const waiting = await supervise(found, env);
  assert.deepEqual([waiting.summary.status, /choose A or B/.test(waiting.summary.reason)], ['FOUNDER_REQUIRED', true]);
  assert.equal((await supervise(found, env)).summary.status, 'FOUNDER_REQUIRED');
  assert.equal(calls(claude).length, 1);
  const { summary } = await supervise(found, env, { resolve: 'Choose A.' });
  assert.equal(summary.status, 'COMPLETED');
  assert.match(calls(claude)[1].prompt, /FOUNDER RESOLUTION .*Choose A\./);
  assert.match(calls(claude)[1].prompt, /## Your unit: U2\napply the Founder decision/);
});

test('the run limit stops a runaway mission', async (t) => {
  const loop = { actions: [{ checkpoint: running() }] };
  const { found, claude, env } = setup(t, [loop, loop, loop], {}, { limits: { max_runs: 2 } });
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'BLOCKED');
  assert.match(summary.reason, /MAX_RUNS: 2 runs/);
  assert.equal(calls(claude).length, 2);
});
