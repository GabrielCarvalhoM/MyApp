#!/usr/bin/env node
// Test double for the Codex CLI: the version and login probes, and `exec` jobs in scripted modes
// (ok, logged-out, missing, quota, outside, bad-output, touch-ignored).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const mode = process.env.FAKE_CODEX_MODE || 'ok';
if (process.env.FAKE_CODEX_LOG) fs.appendFileSync(process.env.FAKE_CODEX_LOG, `${JSON.stringify(args)}\n`);
const valueOf = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1];
};

if (args[0] === '--version') {
  if (mode === 'missing') process.exit(127);
  console.log('codex-cli 0.0.0-fake');
  process.exit(0);
}
if (args[0] === 'login' && args[1] === 'status') {
  if (mode === 'logged-out') {
    console.log('Not logged in');
    process.exit(1);
  }
  console.log('Logged in using ChatGPT');
  process.exit(0);
}
if (args[0] === 'exec') {
  const workdir = valueOf('-C');
  const output = valueOf('-o');
  const brief = fs.readFileSync(0, 'utf8');
  if (!brief.includes('## Task') || !args.includes('workspace-write')) {
    console.error('fake codex: unexpected invocation');
    process.exit(2);
  }
  if (mode === 'quota') {
    console.error('ERROR: usage limit reached for this plan');
    process.exit(1);
  }
  const target = mode === 'outside' ? 'outside/notes.txt' : 'generated/probe.mjs';
  fs.mkdirSync(path.join(workdir, path.dirname(target)), { recursive: true });
  fs.writeFileSync(path.join(workdir, target), 'export const probe = 1;\n');
  if (mode === 'touch-ignored') fs.appendFileSync(path.join(workdir, 'node_modules', 'dep', 'index.js'), 'globalThis.injected = true;\n');
  if (mode === 'rewrite-dotgit') {
    // Git for Windows hides `.git`, and a hidden file cannot be recreated: open it in place instead.
    const fd = fs.openSync(path.join(workdir, '.git'), 'r+');
    fs.ftruncateSync(fd, 0);
    fs.writeSync(fd, 'gitdir: ../somewhere-else\n');
    fs.closeSync(fd);
  }
  const report = { status: 'DONE', summary: 'fake codex job', files_changed: [target], commands_run: [], open_issues: [], notes_for_reviewer: 'none' };
  fs.writeFileSync(output, mode === 'bad-output' ? '{"status":' : JSON.stringify(report));
  console.log(JSON.stringify({ type: 'turn.completed' }));
  process.exit(0);
}
console.error(`fake codex: unsupported arguments ${args.join(' ')}`);
process.exit(2);
