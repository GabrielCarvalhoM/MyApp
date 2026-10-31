import fs from 'node:fs';
import { envValue, resolveExecutable, runSync, runToFiles } from './proc.mjs';
import { sha256 } from './files.mjs';

const FLAGGED = /\b(fail(ed|ure|s)?|error|not ok|assertionerror)\b/i;
const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

// Headless Claude Code: the prompt goes through stdin, the session id is chosen by the supervisor
// (so a rejected checkpoint can be corrected with --resume in the same session), permission prompts
// are answered "deny" instead of waiting for a person, and model and effort are always explicit.
export function claudeArgs({ route, permissionMode, sessionId, resume, maxBudgetUsd }) {
  const args = [
    '-p',
    '--output-format', 'json',
    '--model', route.model,
    '--effort', route.effort,
    '--permission-mode', permissionMode,
    '--permission-prompts', 'none',
    resume ? '--resume' : '--session-id', sessionId,
  ];
  if (maxBudgetUsd) args.push('--max-budget-usd', String(maxBudgetUsd));
  return args;
}

export async function runClaude({ env, cwd, prompt, sessionId, resume, route, permissionMode, maxBudgetUsd, stdoutFile, stderrFile, onSpawn }) {
  const argv = resolveExecutable('claude', env);
  if (!argv) return { status: null, error: new Error('claude CLI not found on PATH'), durationMs: 0, result: null };
  const args = claudeArgs({ route, permissionMode, sessionId, resume, maxBudgetUsd });
  const run = await runToFiles([...argv, ...args], { cwd, env, input: prompt, stdoutFile, stderrFile, onSpawn });
  return { ...run, result: parseJsonOutput(stdoutFile) };
}

function parseJsonOutput(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null; // the CLI prints plain text when it fails before a session starts; the caller records that
  }
}

// Only what the CLI actually reported; a missing field stays null rather than being estimated.
export function claudeMetrics(result) {
  if (!result || typeof result !== 'object') return null;
  const usage = result.usage && typeof result.usage === 'object' ? result.usage : {};
  return {
    is_error: typeof result.is_error === 'boolean' ? result.is_error : null,
    subtype: typeof result.subtype === 'string' ? result.subtype : null,
    num_turns: num(result.num_turns),
    duration_ms: num(result.duration_ms),
    total_cost_usd: num(result.total_cost_usd),
    input_tokens: num(usage.input_tokens),
    output_tokens: num(usage.output_tokens),
    cache_read_input_tokens: num(usage.cache_read_input_tokens),
    cache_creation_input_tokens: num(usage.cache_creation_input_tokens),
  };
}

export function resultExcerpt(result, limit = 300) {
  const text = typeof result?.result === 'string' ? result.result.trim() : '';
  return text ? text.slice(0, limit) : null;
}

const CODEX_OFF = /^(off|0|false|no)$/i;

export function detectCodex(env) {
  if (CODEX_OFF.test(envValue(env, 'AGENT_RUNTIME_CODEX') ?? '')) {
    return { ok: false, reason: 'disabled for this run (AGENT_RUNTIME_CODEX=off)' };
  }
  const argv = resolveExecutable('codex', env);
  if (!argv) return { ok: false, reason: 'codex CLI not installed' };
  const version = runSync([...argv, '--version'], { env, timeoutMs: 30_000 });
  if (version.status !== 0) return { ok: false, reason: `codex --version failed (${version.status ?? version.error?.code})` };
  const login = runSync([...argv, 'login', 'status'], { env, timeoutMs: 30_000 });
  const text = `${login.stdout}${login.stderr}`.trim();
  if (login.status !== 0 || /not logged in/i.test(text) || !/logged in/i.test(text)) {
    return { ok: false, reason: `codex is not authenticated (${text.slice(0, 120) || `exit ${login.status}`})` };
  }
  return { ok: true, reason: null, argv, version: version.stdout.trim() };
}

// codex exec in its own worktree: workspace-write sandbox (never full access), prompt on stdin, the
// final message constrained by the handoff schema and written by the CLI to outputFile.
export function runCodex({ argv, env, worktree, brief, schemaFile, outputFile, model, logFile, onSpawn }) {
  const args = ['exec', '-C', worktree, '-s', 'workspace-write', '--output-schema', schemaFile, '-o', outputFile, '--color', 'never', '--json'];
  if (model) args.push('-m', model);
  args.push('-');
  return runToFiles([...argv, ...args], { cwd: worktree, env, input: brief, stdoutFile: logFile, onSpawn });
}

// The compact view a session reads (`runtime.mjs capture`) instead of the full output, which stays in the log file.
export function summarizeLog(file, tailLines = 15) {
  const data = fs.readFileSync(file);
  const lines = data.toString('utf8').split(/\r?\n/);
  if (lines.at(-1) === '') lines.pop();
  return {
    bytes: data.length,
    lines: lines.length,
    sha256: sha256(data),
    tail: lines.slice(-tailLines),
    flagged: lines.filter((line) => FLAGGED.test(line)).slice(0, 20),
  };
}
