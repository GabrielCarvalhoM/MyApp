import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { chooseExecutor } from '../lib/routing.mjs';
import { parseCmdShim, resolveExecutable } from '../lib/proc.mjs';
import { detectCodex } from '../lib/executors.mjs';
import { fakeEnv, ROUTE } from './helpers.mjs';

const then = { id: 'U4', executor: 'claude', goal: 'judge', route: { ...ROUTE } };
const codexUnit = (job = {}) => ({ id: 'U3', executor: 'codex', goal: 'g', job: { brief: 'b', allowed_paths: ['x/'], acceptance: [['node', 'x/t.mjs']], ...job }, then });

test('declared tiers are kept; Codex is used only when it is available', () => {
  assert.equal(chooseExecutor({ executor: 'claude' }, { ok: true }).executor, 'claude');
  assert.equal(chooseExecutor(codexUnit(), { ok: true }).executor, 'codex');
});

test('Codex unavailable: the work returns to the Claude unit that follows the job', () => {
  const toClaude = chooseExecutor(codexUnit(), { ok: false, reason: 'codex CLI not installed' });
  assert.equal(toClaude.executor, 'claude');
  assert.match(toClaude.reason, /codex unavailable: codex CLI not installed; the next Claude unit does the necessary work/);
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
