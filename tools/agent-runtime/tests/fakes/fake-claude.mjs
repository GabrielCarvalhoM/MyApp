#!/usr/bin/env node
// Test double for `claude -p`. Each invocation plays the next step of a script instead of calling a
// model: it edits files, commits, pushes and writes its checkpoint through the real runtime CLI, as a
// supervised session would. Every invocation (arguments and the prompt it received) is recorded.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const valueOf = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1];
};
const scriptFile = process.env.FAKE_CLAUDE_SCRIPT;
const steps = JSON.parse(fs.readFileSync(scriptFile, 'utf8'));
const cursorFile = `${scriptFile}.cursor`;
const index = fs.existsSync(cursorFile) ? Number(fs.readFileSync(cursorFile, 'utf8')) : 0;
fs.writeFileSync(cursorFile, String(index + 1));
const prompt = fs.readFileSync(0, 'utf8');
const sessionId = valueOf('--session-id') ?? valueOf('--resume');
fs.appendFileSync(`${scriptFile}.calls.jsonl`, `${JSON.stringify({ index, args, session_id: sessionId, resume: args.includes('--resume'), prompt })}\n`);
const step = steps[index] ?? { exit: 3, result: 'fake claude: no scripted step left' };

const git = (...gitArgs) => execFileSync('git', gitArgs, { cwd: process.cwd(), encoding: 'utf8' }).trim();
const runtime = (...runtimeArgs) =>
  spawnSync(process.execPath, [process.env.FAKE_RUNTIME, ...runtimeArgs], { cwd: process.cwd(), env: process.env, encoding: 'utf8' });
const checkpointFile = path.join(process.env.AGENT_RUNTIME_STATE_DIR, 'checkpoint.next.json');
const readCheckpoint = () => JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
const writeCheckpoint = (value) => fs.writeFileSync(checkpointFile, JSON.stringify(value, null, 2));

function merge(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    const nested = value && typeof value === 'object' && !Array.isArray(value);
    if (nested && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) merge(target[key], value);
    else target[key] = value;
  }
  return target;
}

function template() {
  const result = runtime('checkpoint', 'template');
  if (result.status !== 0) throw new Error(`checkpoint template failed: ${result.stderr}${result.stdout}`);
}

for (const action of step.actions ?? []) {
  if (action.write) {
    const file = path.join(process.cwd(), action.write.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, action.write.content ?? `${action.write.path}\n`);
  }
  if (action.commit) {
    git('add', '-A');
    git('commit', '--quiet', '-m', action.commit);
  }
  if (action.push) git('push', '--quiet', '-u', 'origin', 'HEAD');
  if (action.mergeJobBranch) {
    const match = prompt.match(/Job branch: `([^`]+)`/);
    if (!match) throw new Error('the bootstrap names no job branch');
    git('merge', '--quiet', '--ff-only', match[1]);
  }
  if (action.checkpoint) {
    template();
    writeCheckpoint(merge(readCheckpoint(), action.checkpoint));
  }
  if (action.patchCheckpoint) writeCheckpoint(merge(readCheckpoint(), action.patchCheckpoint));
  if (action.refresh) template();
  if (action.validate) fs.appendFileSync(`${scriptFile}.validations.log`, `${runtime('checkpoint', 'validate').stdout}\n`);
}

const exit = step.exit ?? 0;
console.log(JSON.stringify({
  type: 'result',
  subtype: exit ? 'error_during_execution' : 'success',
  is_error: exit !== 0,
  session_id: sessionId,
  num_turns: 4,
  duration_ms: 1200,
  total_cost_usd: 0.02,
  usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 300, cache_creation_input_tokens: 50 },
  result: step.result ?? `fake session ${index} finished`,
}));
process.exit(exit);
