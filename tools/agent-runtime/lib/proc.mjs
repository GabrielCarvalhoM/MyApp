import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { ensureDir } from './files.mjs';

const IS_WINDOWS = process.platform === 'win32';

// Environment objects copied from process.env lose Windows' case-insensitive lookup.
export function envValue(env, name) {
  const key = Object.keys(env).find((candidate) => candidate.toUpperCase() === name.toUpperCase());
  return key === undefined ? undefined : env[key];
}

// npm-style .cmd wrappers end by running node on a JavaScript entry point. Calling that entry
// point directly avoids cmd.exe and its argument quoting rules. The last match is the entry point.
export function parseCmdShim(text, shimDir) {
  const matches = [...text.matchAll(/%~?dp0%?\\(node_modules\\[^"%\r\n]*?\.js)/gi)];
  return matches.length ? path.join(shimDir, matches[matches.length - 1][1]) : null;
}

function isExecutableFile(file) {
  try {
    fs.accessSync(file, fs.constants.X_OK);
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function parseOverride(name, value) {
  let argv;
  try {
    argv = JSON.parse(value);
  } catch (error) {
    throw new Error(`AGENT_RUNTIME_${name.toUpperCase()}_CMD must be a JSON array of strings (${error.message})`);
  }
  if (!Array.isArray(argv) || argv.length === 0 || argv.some((part) => typeof part !== 'string' || part === '')) {
    throw new Error(`AGENT_RUNTIME_${name.toUpperCase()}_CMD must be a non-empty JSON array of strings`);
  }
  return argv;
}

// The argv prefix that runs `name` without a shell, or null when it is not installed.
// AGENT_RUNTIME_<NAME>_CMD (a JSON array) overrides discovery; the tests use it for fake executors.
export function resolveExecutable(name, env = process.env) {
  const override = envValue(env, `AGENT_RUNTIME_${name.toUpperCase()}_CMD`);
  if (override) return parseOverride(name, override);
  if (name === 'node') return [process.execPath];
  const dirs = (envValue(env, 'PATH') ?? '').split(path.delimiter).filter(Boolean);
  for (const dir of dirs) {
    if (!IS_WINDOWS) {
      const file = path.join(dir, name);
      if (isExecutableFile(file)) return [file];
      continue;
    }
    const exe = path.join(dir, `${name}.exe`);
    if (fs.existsSync(exe)) return [exe];
    const cmd = path.join(dir, `${name}.cmd`);
    if (fs.existsSync(cmd)) {
      const entry = parseCmdShim(fs.readFileSync(cmd, 'utf8'), dir);
      if (entry && fs.existsSync(entry)) return [process.execPath, entry];
    }
  }
  return null;
}

export function runSync(argv, { cwd, input, env, timeoutMs } = {}) {
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd,
    env,
    input,
    encoding: 'utf8',
    timeout: timeoutMs,
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ?? null,
  };
}

// Runs argv to completion with stdout and stderr streamed to files, never buffered in memory.
// `input` is written to stdin, which is how prompts reach claude -p and codex exec.
export function runToFiles(argv, { cwd, env, input = '', stdoutFile, stderrFile = stdoutFile, onSpawn } = {}) {
  ensureDir(path.dirname(stdoutFile));
  ensureDir(path.dirname(stderrFile));
  const out = fs.openSync(stdoutFile, 'w');
  const err = stderrFile === stdoutFile ? out : fs.openSync(stderrFile, 'w');
  const started = Date.now();
  return new Promise((resolve) => {
    let settled = false;
    let child = null;
    const finish = (outcome) => {
      if (settled) return;
      settled = true;
      fs.closeSync(out);
      if (err !== out) fs.closeSync(err);
      resolve({ status: null, signal: null, error: null, ...outcome, durationMs: Date.now() - started, pid: child?.pid ?? null });
    };
    try {
      child = spawn(argv[0], argv.slice(1), { cwd, env, stdio: ['pipe', out, err], windowsHide: true });
    } catch (error) {
      finish({ error });
      return;
    }
    child.on('error', (error) => finish({ error }));
    child.on('close', (status, signal) => finish({ status, signal }));
    if (child.pid) onSpawn?.(child.pid);
    // A child that exits before reading stdin raises EPIPE here; its exit status already reports the failure.
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
