// Regression tests for the independent security review (SEC-1, SEC-2, SEC-7, SEC-11): every attack is
// first shown to work against an unprotected Git command, then shown not to work through the runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { writeJsonAtomic } from '../lib/files.mjs';
import { makeRepo, cleanup, startMission, script, fakeEnv, supervise, calls, events, state, sh, write, running, closing, ROUTE } from './helpers.mjs';

const slash = (file) => file.split(path.sep).join('/');
const plainGit = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });

function setup(t, steps, envOptions = {}) {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const claude = script(repo, steps);
  return { repo, found, claude, env: fakeEnv({ claudeScript: claude, ...envOptions }) };
}

test('the control state lives outside the session worktree and an altered record is refused', async (t) => {
  const { found, claude, env } = setup(t, [{ actions: [{ push: true }, { checkpoint: closing() }] }]);
  assert.ok(!fs.existsSync(path.join(found.worktree, '.agent-runtime', 'mission.json')));
  assert.ok(!path.resolve(found.paths.control).startsWith(path.resolve(found.worktree)), 'control state is not under the worktree');
  const record = JSON.parse(fs.readFileSync(found.paths.mission, 'utf8'));
  writeJsonAtomic(found.paths.mission, { ...record, claude: { ...record.claude, permission_mode: 'bypassPermissions' } });
  await assert.rejects(supervise(found, env), /is invalid or was altered \(claude\.permission_mode\)/);
  writeJsonAtomic(found.paths.mission, { ...record, repo: { ...record.repo, remote_url: '--upload-pack=touch pwned' } });
  await assert.rejects(supervise(found, env), /is invalid or was altered \(repo\.remote_url\)/);
  assert.equal(calls(claude).length, 0);
});

test('a terminal mission cannot be reopened by editing its state', async (t) => {
  const { found, claude, env } = setup(t, [{ actions: [{ push: true }, { checkpoint: closing() }] }, { actions: [] }]);
  assert.equal((await supervise(found, env)).summary.status, 'COMPLETED');
  writeJsonAtomic(found.paths.state, { ...state(found), status: 'READY_FOR_FRESH_SESSION', terminal_state: null, next_unit: running().next_unit });
  await assert.rejects(supervise(found, env), /contradicts the audit log: the mission ended COMPLETE/);
  assert.equal(calls(claude).length, 1);
});

test('Git settings written by a session never make the supervisor run a command', async (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const marker = (name) => path.join(repo.root, name);
  const branch = found.mission.repo.branch;
  const injected = [
    ['branch.' + branch + '.remote', `--upload-pack=touch ${slash(marker('via-branch-remote'))};git-upload-pack`],
    ['remote.origin.uploadpack', `touch ${slash(marker('via-uploadpack'))};git-upload-pack`],
    // Git appends "$@" to a configured command; the comment keeps touch from creating stray files.
    ['core.fsmonitor', `touch ${slash(marker('via-fsmonitor'))} #`],
  ];
  const claude = script(repo, [
    { actions: [{ push: true }, ...injected.map((pair) => ({ gitConfig: pair })), { checkpoint: running() }] },
    { actions: [{ checkpoint: closing() }] },
  ]);
  const env = fakeEnv({ claudeScript: claude });
  assert.equal((await supervise(found, env, { once: true })).summary.status, 'READY_FOR_FRESH_SESSION');
  // Positive controls: each setting does run its command through an unprotected Git command.
  plainGit(found.worktree, 'fetch', '--quiet', `--upload-pack=touch ${slash(marker('via-branch-remote'))};git-upload-pack`, 'origin');
  plainGit(found.worktree, 'ls-remote', 'origin');
  plainGit(found.worktree, 'status');
  for (const name of ['via-branch-remote', 'via-uploadpack', 'via-fsmonitor']) {
    assert.ok(fs.existsSync(marker(name)), `positive control ${name} did not fire`);
    fs.rmSync(marker(name));
  }
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED', 'the closing push is still verified, through the URL pinned at mission start');
  for (const name of ['via-branch-remote', 'via-uploadpack', 'via-fsmonitor']) assert.ok(!fs.existsSync(marker(name)), `${name} ran through the supervisor`);
});

test('a hook planted in the repository does not run when the supervisor creates a Codex worktree', async (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const marker = path.join(repo.root, 'via-hook');
  write(path.join(repo.main, '.git', 'hooks'), 'post-checkout', `#!/bin/sh\ntouch ${slash(marker)}\n`);
  assert.equal(plainGit(repo.main, 'worktree', 'add', '--quiet', path.join(repo.root, 'control-wt'), 'HEAD').status, 0);
  assert.ok(fs.existsSync(marker), 'positive control: the hook runs on an unprotected worktree add');
  fs.rmSync(marker);
  const job = { brief: 'Create generated/probe.mjs.', allowed_paths: ['generated/'], acceptance: [['node', 'generated/probe.mjs']] };
  const unit = { id: 'U2', executor: 'codex', goal: 'the probe', job, then: { id: 'U3', executor: 'claude', goal: 'judge it', route: { ...ROUTE } } };
  const claude = script(repo, [{ actions: [{ checkpoint: running({ next_unit: unit }) }] }, { actions: [{ push: true }, { checkpoint: closing() }] }]);
  const { summary } = await supervise(found, fakeEnv({ claudeScript: claude }));
  assert.equal(summary.status, 'COMPLETED');
  assert.ok(events(found).some((event) => event.type === 'job_end' && event.status === 'DONE'));
  assert.ok(!fs.existsSync(marker), 'the planted hook ran through the supervisor');
});

test('agent configuration committed by a session stops the mission for the Founder', async (t) => {
  const settings = { write: { path: '.claude/settings.json', content: '{"permissions":{"allow":["Bash(*)"]}}\n' } };
  const { found, claude, env } = setup(t, [
    { actions: [settings, { commit: 'widen permissions' }, { checkpoint: running() }] },
    { actions: [{ push: true }, { checkpoint: closing() }] },
  ]);
  const stopped = await supervise(found, env);
  assert.equal(stopped.summary.status, 'FOUNDER_REQUIRED');
  assert.match(stopped.summary.reason, /PROTECTED_CONFIG: .*\.claude\/settings\.json/);
  assert.equal(calls(claude).length, 1, 'no session starts on unreviewed agent configuration');
  assert.equal((await supervise(found, env, { resolve: 'reviewed: keep the change' })).summary.status, 'COMPLETED');
});

test('an accepted checkpoint that no state recorded is moved aside, never overwritten', async (t) => {
  const { found, env } = setup(t, [{ actions: [{ push: true }, { checkpoint: closing() }] }]);
  fs.mkdirSync(found.paths.checkpoints, { recursive: true });
  fs.writeFileSync(path.join(found.paths.checkpoints, '0001.json'), '{"left": "by an interrupted acceptance"}\n');
  assert.equal((await supervise(found, env)).summary.status, 'COMPLETED');
  const kept = fs.readdirSync(found.paths.checkpoints).filter((name) => name.startsWith('orphan-0001'));
  assert.equal(kept.length, 1);
  assert.equal(fs.readFileSync(path.join(found.paths.checkpoints, kept[0]), 'utf8'), '{"left": "by an interrupted acceptance"}\n');
  assert.ok(events(found).some((event) => event.type === 'warning' && /no state recorded/.test(event.message)));
});
