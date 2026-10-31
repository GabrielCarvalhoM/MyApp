import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { chooseExecutor, fallbackFor } from '../lib/routing.mjs';
import { commandPolicyError } from '../lib/commands.mjs';
import { parseCmdShim, resolveExecutable } from '../lib/proc.mjs';
import { detectCodex } from '../lib/executors.mjs';
import { fakeEnv, ROUTE } from './helpers.mjs';

const then = { id: 'U4', executor: 'claude', goal: 'judge', route: { ...ROUTE } };
const codexUnit = (job = {}) => ({ id: 'U3', executor: 'codex', goal: 'g', job: { brief: 'b', allowed_paths: ['x/'], acceptance: [['node', 'x/t.mjs']], ...job }, then });

test('declared tiers are kept; Codex is used only when it is available', () => {
  assert.equal(chooseExecutor({ executor: 'claude' }, { ok: true }).executor, 'claude');
  assert.equal(chooseExecutor({ executor: 'local' }, { ok: false }).executor, 'local');
  assert.equal(chooseExecutor(codexUnit(), { ok: true }).executor, 'codex');
});

test('Codex unavailable: deterministic work runs its local command, anything else returns to Claude', () => {
  const toClaude = chooseExecutor(codexUnit(), { ok: false, reason: 'codex CLI not installed' });
  assert.equal(toClaude.executor, 'claude');
  assert.match(toClaude.reason, /codex unavailable: codex CLI not installed; the next Claude unit does the necessary work/);
  const toLocal = chooseExecutor(codexUnit({ fallback_command: ['node', 'scripts/gen.mjs'] }), { ok: false, reason: 'quota' });
  assert.deepEqual([toLocal.executor, toLocal.command], ['local', ['node', 'scripts/gen.mjs']]);
  assert.equal(fallbackFor(codexUnit(), 'codex job failed: exit 1').executor, 'claude');
});

test('the command policy admits repository scripts and tests, nothing else', () => {
  for (const ok of [['node', 'scripts/verify.mjs', '--tests'], ['node', '--test'], ['npm', 'test'], ['npm', 'run', 'verify'], ['npm', 'ci', '--prefix', 'CoachingCore']]) {
    assert.equal(commandPolicyError(ok), null, ok.join(' '));
  }
  for (const [bad, why] of [
    [['git', 'reset', '--hard'], /not allowed/],
    [['powershell', '-c', 'x'], /not allowed/],
    [['node', '--eval=1'], /inline or remote code/],
    [['node', '--print', '1'], /inline or remote code/],
    [['node', '--import', 'https://example.invalid/x.mjs'], /inline or remote code/],
    [['node', 'C:\\Windows\\x.mjs'], /outside the repository/],
    [['npm', 'exec', 'x'], /npm subcommand "exec"/],
    [[], /non-empty array/],
  ]) {
    assert.match(commandPolicyError(bad), why, bad.join(' '));
  }
});

test('Windows .cmd shims resolve to their JavaScript entry point (codex and npm formats)', () => {
  const codexShim = '@ECHO off\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\@openai\\codex\\bin\\codex.js" %*\r\n';
  assert.equal(parseCmdShim(codexShim, 'C:\\npm'), path.join('C:\\npm', 'node_modules\\@openai\\codex\\bin\\codex.js'));
  const npmShim = [
    'SET "NPM_PREFIX_JS=%~dp0\\node_modules\\npm\\bin\\npm-prefix.js"',
    'SET "NPM_CLI_JS=%~dp0\\node_modules\\npm\\bin\\npm-cli.js"',
    '"%NODE_EXE%" "%NPM_CLI_JS%" %*',
  ].join('\r\n');
  assert.equal(parseCmdShim(npmShim, 'C:\\node'), path.join('C:\\node', 'node_modules\\npm\\bin\\npm-cli.js'));
  assert.equal(parseCmdShim('@echo off\r\nfoo.exe %*\r\n', 'C:\\x'), null);
});

test('executable overrides are validated JSON argv; node is the running interpreter', () => {
  assert.deepEqual(resolveExecutable('claude', { AGENT_RUNTIME_CLAUDE_CMD: '["node","fake.mjs"]' }), ['node', 'fake.mjs']);
  assert.throws(() => resolveExecutable('claude', { AGENT_RUNTIME_CLAUDE_CMD: 'claude --x' }), /must be a JSON array/);
  assert.throws(() => resolveExecutable('claude', { AGENT_RUNTIME_CLAUDE_CMD: '[]' }), /non-empty JSON array/);
  assert.deepEqual(resolveExecutable('node', {}), [process.execPath]);
  assert.equal(resolveExecutable('definitely-not-installed-xyz', { PATH: '' }), null);
});

test('Codex detection: available, logged out, missing, or switched off', () => {
  assert.equal(detectCodex(fakeEnv({ codexMode: 'ok' })).ok, true);
  const loggedOut = detectCodex(fakeEnv({ codexMode: 'logged-out' }));
  assert.deepEqual([loggedOut.ok, /not authenticated/.test(loggedOut.reason)], [false, true]);
  const missing = detectCodex(fakeEnv({ codexMode: 'missing' }));
  assert.deepEqual([missing.ok, /--version failed/.test(missing.reason)], [false, true]);
  const off = detectCodex(fakeEnv({ codexMode: 'ok', extra: { AGENT_RUNTIME_CODEX: 'off' } }));
  assert.deepEqual([off.ok, /disabled/.test(off.reason)], [false, true]);
  const absent = detectCodex({ PATH: '' });
  assert.deepEqual([absent.ok, absent.reason], [false, 'codex CLI not installed']);
});
