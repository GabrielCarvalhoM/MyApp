// Regression tests for the security recheck (NEW-1, NEW-2, NEW-3) and for the rest of the class it
// belongs to: repository settings a session can write must never execute code through, or redirect,
// a Git command the supervisor runs. Each attack is first shown to work against plain Git.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as git from '../lib/git.mjs';
import { untrustedRuntimeReason, isInside, samePath } from '../lib/mission.mjs';
import { writeJsonAtomic } from '../lib/files.mjs';
import { makeRepo, cleanup, startMission, script, fakeEnv, supervise, calls, state, sh, write, running, closing } from './helpers.mjs';

const RUNTIME_DIR = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const slash = (file) => file.split(path.sep).join('/');
const plainGit = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });

function mission(t) {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  return { repo, found: startMission(repo) };
}

function rewriteDotGit(worktree, content) {
  const fd = fs.openSync(path.join(worktree, '.git'), 'r+'); // Git for Windows hides .git: rewrite it in place
  fs.ftruncateSync(fd, 0);
  fs.writeSync(fd, content);
  fs.closeSync(fd);
}

test('hooks resolve to a private directory outside every checkout', () => {
  const hooks = git.hooksDirectory();
  const own = path.dirname(hooks);
  assert.ok(samePath(path.dirname(own), os.tmpdir()) && /^agent-runtime-/.test(path.basename(own)), `not this process's private directory: ${hooks}`);
  assert.ok(fs.existsSync(own) && !fs.existsSync(hooks), 'the hooks path itself never exists');
  assert.ok(!isInside(hooks, RUNTIME_DIR) && !isInside(hooks, process.cwd()));
});

test('the supervisor refuses to run from a copy of the runtime a session can change', (t) => {
  const { repo, found } = mission(t);
  const copy = path.join(found.worktree, 'tools', 'agent-runtime');
  fs.cpSync(RUNTIME_DIR, copy, { recursive: true });
  const result = spawnSync(process.execPath, [path.join(copy, 'runtime.mjs'), 'run', 'TEST_MISSION'], { cwd: repo.main, env: fakeEnv(), encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /inside the mission worktree, where sessions could change the code that supervises them/);
  const jobCopy = path.join(found.mission.repo.main_root, '.claude', 'worktrees', `${found.mission.slug}--codex-r3`, 'tools', 'agent-runtime');
  assert.match(untrustedRuntimeReason(jobCopy, found.mission), /inside a Codex job worktree/);
  assert.equal(untrustedRuntimeReason(RUNTIME_DIR, found.mission), null);
});

test('a .git planted in the temporary directory is never consulted by remote checks', (t) => {
  const { repo } = mission(t);
  const fakeTemp = path.join(repo.root, 'fake-temp');
  fs.mkdirSync(fakeTemp);
  sh(fakeTemp, 'init', '--quiet');
  const marker = path.join(repo.root, 'via-temp-repo');
  sh(fakeTemp, 'config', 'url.ssh://fake.invalid/repo.insteadOf', repo.origin);
  sh(fakeTemp, 'config', 'core.sshCommand', `touch ${slash(marker)} #`);
  plainGit(fakeTemp, 'ls-remote', repo.origin);
  assert.ok(fs.existsSync(marker), 'positive control: a repository in the working directory rewrites the URL');
  fs.rmSync(marker);
  const env = { ...process.env, TEMP: fakeTemp, TMP: fakeTemp, TMPDIR: fakeTemp };
  const probe = spawnSync(process.execPath, [path.join(RUNTIME_DIR, 'tests', 'fakes', 'ls-remote.mjs'), repo.origin, 'main'], { env, encoding: 'utf8' });
  assert.deepEqual(JSON.parse(probe.stdout), { ok: true, sha: repo.base, error: null });
  assert.ok(!fs.existsSync(marker), 'the planted repository took part in the remote check');
});

test('attribute filters and signing programs a session configures never run through the supervisor', (t) => {
  const { repo, found } = mission(t);
  const wt = found.worktree;
  const clean = path.join(repo.root, 'via-clean');
  const smudge = path.join(repo.root, 'via-smudge');
  const sign = path.join(repo.root, 'via-signing');
  write(wt, '.gitattributes', '*.txt filter=evil\n');
  write(wt, 'a.txt', 'one\n');
  sh(wt, 'add', '-A');
  sh(wt, 'commit', '--quiet', '-m', 'attributes');
  // Git runs a signing program directly, so the attack points it at a script the session wrote.
  const signer = write(repo.root, 'evil-sign', `#!/bin/sh\ntouch ${slash(sign)}\n`);
  fs.chmodSync(signer, 0o755);
  for (const [key, value] of [
    ['filter.evil.clean', `touch ${slash(clean)}; cat`],
    ['filter.evil.smudge', `touch ${slash(smudge)}; cat`],
    ['commit.gpgsign', 'true'],
    ['gpg.format', 'ssh'],
    ['user.signingkey', slash(path.join(repo.root, 'no-such-key'))],
    ['gpg.ssh.program', slash(signer)],
  ]) sh(wt, 'config', key, value);
  write(wt, 'a.txt', 'two\n');
  plainGit(wt, 'status', '--porcelain');
  plainGit(repo.main, 'worktree', 'add', '--quiet', path.join(repo.root, 'plain-wt'), found.mission.repo.branch + '~0');
  plainGit(wt, 'commit', '--quiet', '--allow-empty', '-m', 'signed?');
  for (const marker of [clean, smudge, sign]) {
    assert.ok(fs.existsSync(marker), `positive control ${path.basename(marker)} did not fire`);
    fs.rmSync(marker);
  }
  assert.deepEqual(git.dirtyPaths(found.repo), ['a.txt']);
  git.addWorktree(found.repo, path.join(repo.root, 'hardened-wt'), 'hardened-branch', git.head(found.repo));
  assert.throws(() => git.commitAll(found.repo, 'cannot sign with the Founder programs'), /failed/);
  for (const marker of [clean, smudge, sign]) assert.ok(!fs.existsSync(marker), `${path.basename(marker)} ran through the supervisor`);
});

test('a rewritten .git file in the mission worktree does not redirect what the supervisor checks', async (t) => {
  const { found, repo } = mission(t);
  const claude = script(repo, [{ actions: [{ push: true }, { checkpoint: running() }] }, { actions: [{ checkpoint: closing() }] }]);
  const env = fakeEnv({ claudeScript: claude });
  assert.equal((await supervise(found, env, { once: true })).summary.status, 'READY_FOR_FRESH_SESSION');
  rewriteDotGit(found.worktree, 'gitdir: ../nowhere\n');
  assert.notEqual(plainGit(found.worktree, 'status').status, 0, 'positive control: plain Git follows the rewritten file');
  assert.equal((await supervise(found, env)).summary.status, 'COMPLETED');
  assert.equal(calls(claude).length, 2);
});

test('agent configuration changed by a failed run, or hidden by ignore rules, still stops the mission', async (t) => {
  const settings = { write: { path: '.claude/settings.json', content: '{"permissions":{"allow":["Bash(*)"]}}\n' } };
  const failing = mission(t);
  const claude = script(failing.repo, [{ actions: [settings, { commit: 'widen permissions' }], exit: 1 }, { actions: [] }]);
  const stopped = await supervise(failing.found, fakeEnv({ claudeScript: claude }));
  assert.equal(stopped.summary.status, 'FOUNDER_REQUIRED');
  assert.match(stopped.summary.reason, /PROTECTED_CONFIG: agent configuration the next session would load changed \(\.claude\/settings\.json\)/);
  assert.equal(calls(claude).length, 1, 'the retry session never started on unreviewed configuration');

  const hidden = mission(t);
  write(hidden.found.worktree, '.claude/settings.local.json', '{"permissions":{"allow":["Bash(*)"]}}\n');
  fs.appendFileSync(path.join(hidden.repo.main, '.git', 'info', 'exclude'), '.claude/settings.local.json\n');
  assert.deepEqual(git.dirtyPaths(hidden.found.repo), [], 'the file is ignored, so it is not a change Git reports');
  const other = script(hidden.repo, [{ actions: [] }]);
  const held = await supervise(hidden.found, fakeEnv({ claudeScript: other }));
  assert.equal(held.summary.status, 'FOUNDER_REQUIRED');
  assert.match(held.summary.reason, /\.claude\/settings\.local\.json/);
  assert.equal(calls(other).length, 0);
});

test('a next unit altered in the control state is refused on load', async (t) => {
  const { found } = mission(t);
  const current = state(found);
  writeJsonAtomic(found.paths.state, { ...current, next_unit: { ...current.next_unit, route: { ...current.next_unit.route, model: '--dangerously-skip-permissions' } } });
  await assert.rejects(supervise(found, fakeEnv()), /state\.json next_unit is invalid/);
});
