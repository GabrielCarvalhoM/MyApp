import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createMission, saveState } from '../lib/mission.mjs';
import { validateCheckpointFile } from '../lib/coherence.mjs';
import { buildTemplate } from '../lib/template.mjs';
import { writeJsonAtomic } from '../lib/files.mjs';
import {
  makeRepo, cleanup, startMission, script, fakeEnv, supervise, calls, events, state, sh, write, running, closing, ROUTE,
} from './helpers.mjs';

const request = (repo) => write(repo.root, 'guard-request.md', '# request\n');
const missionOptions = (repo, extra = {}) => ({ cwd: repo.main, missionId: 'GUARD', requestFile: request(repo), route: { ...ROUTE }, ...extra });

test('a mission never starts with bypassed permissions, a base without the runtime, or tracked runtime state', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  assert.throws(() => createMission(missionOptions(repo, { permissionMode: 'bypassPermissions' })), /permission mode "bypassPermissions" is not allowed/);
  assert.throws(() => createMission(missionOptions(repo, { missionId: '../escape' })), /invalid mission id/);
  assert.throws(() => createMission(missionOptions(repo, { requestFile: write(repo.root, 'empty.md', '') })), /the request file is empty/);
  sh(repo.main, 'checkout', '--quiet', '-b', 'no-runtime');
  fs.rmSync(path.join(repo.main, 'tools'), { recursive: true });
  sh(repo.main, 'commit', '--quiet', '-am', 'drop the runtime');
  assert.throws(() => createMission(missionOptions(repo)), /does not contain tools\/agent-runtime\/runtime\.mjs/);
  sh(repo.main, 'checkout', '--quiet', 'main');
  sh(repo.main, 'checkout', '--quiet', '-b', 'tracked-state');
  write(repo.main, '.gitignore', 'node_modules/\n.claude/worktrees/\n');
  sh(repo.main, 'commit', '--quiet', '-am', 'stop ignoring the runtime state');
  assert.throws(() => createMission(missionOptions(repo)), /\.agent-runtime\/ is not ignored/);
  assert.ok(!sh(repo.main, 'worktree', 'list').includes('guard'), 'a refused mission leaves no worktree behind');
  const trackedState = sh(repo.main, 'rev-parse', 'HEAD');
  sh(repo.main, 'checkout', '--quiet', 'main');
  assert.throws(() => createMission(missionOptions(repo, { base: trackedState })), /\.agent-runtime\/ is not ignored in/);
});

test('every session is launched headless with an explicit route and no permission prompts', async (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const claude = script(repo, [{ actions: [{ push: true }, { checkpoint: closing() }] }]);
  await supervise(found, fakeEnv({ claudeScript: claude }));
  const [{ args }] = calls(claude);
  const after = (flag) => args[args.indexOf(flag) + 1];
  assert.ok(args.includes('-p'));
  assert.deepEqual(
    [after('--output-format'), after('--model'), after('--effort'), after('--permission-mode'), after('--permission-prompts')],
    ['json', ROUTE.model, ROUTE.effort, 'auto', 'none'],
  );
  assert.match(after('--session-id'), /^[0-9a-f-]{36}$/);
  assert.ok(!args.some((arg) => /dangerously|bypass/i.test(arg)), 'permission checks are never bypassed');
});

test('a worktree moved to another branch, or rewritten history, blocks before any launch', async (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const claude = script(repo, [{ actions: [{ push: true }, { checkpoint: closing() }] }]);
  const env = fakeEnv({ claudeScript: claude });
  sh(found.worktree, 'checkout', '--quiet', '-b', 'somewhere-else');
  const moved = await supervise(found, env);
  assert.equal(moved.summary.status, 'BLOCKED');
  assert.match(moved.summary.reason, /BRANCH_MISMATCH: the worktree is on somewhere-else/);
  sh(found.worktree, 'checkout', '--quiet', found.mission.repo.branch);
  write(repo.main, 'other.md', 'a commit the mission branch lacks\n');
  sh(repo.main, 'add', '-A');
  sh(repo.main, 'commit', '--quiet', '-m', 'unrelated');
  const rewritten = { ...state(found), status: 'READY_FOR_FRESH_SESSION', last_checkpoint_head: sh(repo.main, 'rev-parse', 'HEAD') };
  saveState(found.paths, rewritten);
  const diverged = await supervise(found, env);
  assert.equal(diverged.summary.status, 'BLOCKED');
  assert.match(diverged.summary.reason, /GIT_DIVERGENCE/);
  assert.equal(calls(claude).length, 0);
});

test('a checkpoint that names another branch is rejected even when the worktree agrees', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  sh(found.worktree, 'checkout', '--quiet', '-b', 'side');
  const sessionState = { ...found.state, status: 'RUNNING', run_seq: 1, current: { run_seq: 1, executor: 'claude', unit: found.mission.first_unit } };
  const ctx = { mission: found.mission, state: sessionState, previous: null, worktree: found.worktree, runSeq: 1, stateDir: found.paths.dir };
  const cp = { ...buildTemplate(ctx), ...running() };
  const file = path.join(found.paths.dir, 'checkpoint.next.json');
  writeJsonAtomic(file, cp);
  const verdict = validateCheckpointFile(file, ctx);
  assert.ok(verdict.errors.some((error) => error.includes(`git.branch: expected the mission branch ${found.mission.repo.branch}`)), verdict.errors.join('\n'));
});

test('an accepted checkpoint edited between runs blocks until the Founder accepts it as it is', async (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const claude = script(repo, [{ actions: [{ checkpoint: running({ do_not_reopen: ['settled A'] }) }] }, { actions: [{ push: true }, { checkpoint: closing() }] }]);
  const env = fakeEnv({ claudeScript: claude });
  assert.equal((await supervise(found, env, { once: true })).summary.status, 'READY_FOR_FRESH_SESSION');
  const file = path.join(found.paths.checkpoints, '0001.json');
  writeJsonAtomic(file, { ...JSON.parse(fs.readFileSync(file, 'utf8')), do_not_reopen: [] });
  const blocked = await supervise(found, env);
  assert.equal(blocked.summary.status, 'BLOCKED');
  assert.match(blocked.summary.reason, /CHECKPOINT_TAMPERED: checkpoint 1 is no longer the accepted version/);
  assert.equal(calls(claude).length, 1, 'nothing runs on a tampered anchor');
  const resumed = await supervise(found, env, { resolve: 'the edit is mine; continue from it' });
  assert.equal(resumed.summary.status, 'COMPLETED');
  assert.match(calls(claude)[1].prompt, /The Founder accepted checkpoint 1 as it now is/);
  assert.ok(events(found).some((event) => event.type === 'checkpoint_reanchored' && event.checkpoint === 1));
});

test('a session that rewrites the accepted checkpoint is stopped before its own checkpoint counts', async (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const tamper = { write: { path: '.agent-runtime/checkpoints/0001.json', content: '{"rewritten": true}\n' } };
  const claude = script(repo, [{ actions: [{ checkpoint: running({ do_not_reopen: ['settled A'] }) }] }, { actions: [tamper, { push: true }, { checkpoint: closing() }] }]);
  const { summary } = await supervise(found, fakeEnv({ claudeScript: claude }));
  assert.equal(summary.status, 'BLOCKED');
  assert.match(summary.reason, /CHECKPOINT_TAMPERED.*found while validating run 2/);
  assert.equal(state(found).last_checkpoint_seq, 1);
  assert.notEqual(state(found).terminal_state, 'COMPLETE');
});

// Phase 1 asks for a Codex job; phase 2 (the Claude unit after it) closes the mission.
function codexMission(t, codexMode) {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const job = { brief: 'Create generated/probe.mjs.', allowed_paths: ['generated/'], acceptance: [['node', 'generated/probe.mjs']] };
  const unit = { id: 'U2', executor: 'codex', goal: 'the probe', job, then: { id: 'U3', executor: 'claude', goal: 'judge the probe', route: { ...ROUTE } } };
  const claude = script(repo, [{ actions: [{ checkpoint: running({ next_unit: unit }) }] }, { actions: [{ push: true }, { checkpoint: closing() }] }]);
  return { found, claude, env: fakeEnv({ claudeScript: claude, codexMode }) };
}

test('a Codex job whose acceptance check fails is not handed over as done', async (t) => {
  const { found, claude, env } = codexMission(t, 'failing-check');
  assert.equal((await supervise(found, env)).summary.status, 'COMPLETED');
  const job = JSON.parse(fs.readFileSync(path.join(found.paths.jobs, '2-u2', 'RESULT.json'), 'utf8'));
  assert.equal(job.status, 'FAILED');
  assert.match(job.reasons.join(' '), /acceptance failed: node generated\/probe\.mjs \(exit 3\)/);
  assert.match(calls(claude)[1].prompt, /FALLBACK_TO_CLAUDE \(acceptance failed/);
  assert.ok(events(found).some((event) => event.type === 'fallback' && event.unit_id === 'U2'));
});

test('a Codex job without a valid structured handoff is not handed over as done', async (t) => {
  const { found, claude, env } = codexMission(t, 'bad-output');
  assert.equal((await supervise(found, env)).summary.status, 'COMPLETED');
  const job = JSON.parse(fs.readFileSync(path.join(found.paths.jobs, '2-u2', 'RESULT.json'), 'utf8'));
  assert.deepEqual([job.status, job.commit], ['FAILED', null]);
  assert.match(job.reasons.join(' '), /structured handoff invalid: the final message is not JSON/);
  assert.match(calls(claude)[1].prompt, /FALLBACK_TO_CLAUDE/);
});
