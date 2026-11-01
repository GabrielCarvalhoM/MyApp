#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import * as git from './lib/git.mjs';
import { Supervisor } from './lib/supervisor.mjs';
import {
  createMission, planMission, findMission, listMissions, openMission, initialState, checkpointPath, samePath, DEFAULT_FIRST_ROUTE, STATE_DIR,
} from './lib/mission.mjs';
import { readJson, readJsonIfExists, readJsonl, writeJsonAtomic, sha256File, nowIso } from './lib/files.mjs';
import { validateCheckpointFile } from './lib/coherence.mjs';
import { buildTemplate, refreshTemplate } from './lib/template.mjs';
import { renderBootstrap } from './lib/bootstrap.mjs';
import { metrics } from './lib/report.mjs';
import { claudeArgs, detectCodex, summarizeLog } from './lib/executors.mjs';
import { envValue, resolveExecutable, runSync, runToFiles } from './lib/proc.mjs';

const USAGE = `agent runtime: supervised long missions (tools/agent-runtime/README.md)

  run <MISSION_ID> --request <file> [--base <rev>] [--branch <name>] [--worktree <path>]
      [--model <id>] [--effort <level>] [--permission-mode <mode>] [--max-budget-usd <n>] [--goal <text>]
                                  start a mission; the same command without --request resumes it
  run <MISSION_ID> [--once] [--dry-run] [--resolve "<note>"] [--assume-dead]
  status [<MISSION_ID>] [--json]  state, last checkpoint, next unit and metrics
  checkpoint template|validate    inside a supervised session: write or check the checkpoint
  capture [--out <file>] [--tail <n>] -- <command...>
                                  run a command; the full log goes to a file, a compact summary to stdout
  doctor                          detect the installed CLIs and their capabilities (no model call)

AGENT_RUNTIME_CODEX=off keeps Codex out of a run.`;

const START_OPTIONS = ['base', 'branch', 'worktree', 'model', 'effort', 'permission-mode', 'max-budget-usd', 'goal'];
const CLAUDE_FLAGS = ['--print', '--session-id', '--resume', '--output-format', '--permission-mode', '--permission-prompts', '--model', '--effort'];
const CODEX_FLAGS = ['--output-schema', '--output-last-message', '--cd', '--sandbox', '--json'];

function startOptions(values) {
  const route = { ...DEFAULT_FIRST_ROUTE };
  if (values.model) route.model = values.model;
  if (values.effort) route.effort = values.effort;
  if (values.model || values.effort) route.reason = `${DEFAULT_FIRST_ROUTE.reason} (route chosen at mission start)`;
  const budget = values['max-budget-usd'];
  return {
    base: values.base ?? 'HEAD',
    branch: values.branch ?? null,
    worktree: values.worktree ?? null,
    route,
    permissionMode: values['permission-mode'] ?? 'auto',
    maxBudgetUsd: budget === undefined ? null : Number(budget),
    goal: values.goal ?? null,
  };
}

async function cmdRun(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      request: { type: 'string' }, base: { type: 'string' }, branch: { type: 'string' }, worktree: { type: 'string' },
      model: { type: 'string' }, effort: { type: 'string' }, 'permission-mode': { type: 'string' },
      'max-budget-usd': { type: 'string' }, goal: { type: 'string' }, once: { type: 'boolean' },
      'dry-run': { type: 'boolean' }, resolve: { type: 'string' }, 'assume-dead': { type: 'boolean' },
    },
  });
  if (positionals.length !== 1) throw new Error(`run needs exactly one MISSION_ID\n\n${USAGE}`);
  const [missionId] = positionals;
  const cwd = process.cwd();
  let found = findMission(cwd, missionId);
  if (found) {
    const given = START_OPTIONS.filter((name) => values[name] !== undefined);
    if (given.length) throw new Error(`mission ${missionId} already exists; ${given.map((name) => `--${name}`).join(', ')} only apply when a mission starts`);
    if (values.request && sha256File(values.request) !== found.mission.request.sha256) {
      throw new Error(`mission ${missionId} started from another request; a different request is a new mission`);
    }
  } else if (!values.request) {
    throw new Error(`mission ${missionId} was not found in this repository's worktrees; start it with --request <file>`);
  }
  const options = { cwd, missionId, requestFile: values.request, ...startOptions(values) };
  if (values['dry-run']) return dryRun(found, options);
  if (!found) {
    found = createMission(options);
    console.log(`created mission ${missionId}: branch ${found.mission.repo.branch} from ${found.mission.repo.base_commit.slice(0, 12)}, worktree ${found.worktree}`);
  }
  if (envValue(process.env, 'CLAUDECODE')) {
    console.warn('note: started from inside a Claude Code session; the supervisor lives only as long as that process. A normal terminal is the intended home.');
  }
  const supervisor = new Supervisor({ control: found.paths.control, env: process.env, log: (line) => console.log(line) });
  const interrupted = () => {
    supervisor.event({ type: 'supervisor_interrupted', run_seq: supervisor.state.run_seq });
    process.exit(130);
  };
  process.once('SIGINT', interrupted);
  const summary = await supervisor.run({ once: values.once, resolve: values.resolve ?? null, assumeDead: values['assume-dead'] });
  process.removeListener('SIGINT', interrupted);
  console.log(JSON.stringify(summary, null, 2));
  return summary.status === 'COMPLETED' || (values.once && summary.status === 'READY_FOR_FRESH_SESSION') ? 0 : 2;
}

// Shows what the next launch would do, changing nothing: no worktree, no state, no executor call.
function dryRun(found, options) {
  const mission = found ? found.mission : planMission(options);
  const state = found ? readJson(found.paths.state) : initialState(mission);
  const previous = found && state.last_checkpoint_seq ? readJson(checkpointPath(found.paths, state.last_checkpoint_seq)) : null;
  const unit = state.next_unit;
  const head = found ? git.head(found.repo) : mission.repo.base_commit;
  const report = {
    mission_id: mission.mission_id,
    would_create: !found,
    worktree: mission.repo.worktree,
    branch: mission.repo.branch,
    base_commit: mission.repo.base_commit,
    status: state.status,
    next_unit: unit,
    codex: unit?.executor === 'codex' ? detectCodex(process.env) : null,
    claude_command:
      unit?.executor === 'claude'
        ? [...(resolveExecutable('claude', process.env) ?? ['claude (not found)']), ...claudeArgs({ route: unit.route, permissionMode: mission.claude.permission_mode, sessionId: '<new uuid>', resume: false, maxBudgetUsd: mission.claude.max_budget_usd })]
        : null,
  };
  console.log(JSON.stringify(report, null, 2));
  if (unit?.executor === 'claude') {
    console.log('\n--- bootstrap, sent on stdin ---\n');
    console.log(renderBootstrap({ mission, state, unit, previous, runSeq: state.run_seq + 1, head, worktree: mission.repo.worktree }));
  }
  return 0;
}

function cmdStatus(args) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { json: { type: 'boolean' } } });
  const cwd = process.cwd();
  const entries = positionals.length ? [findMission(cwd, positionals[0])].filter(Boolean) : listMissions(cwd);
  if (positionals.length && !entries.length) throw new Error(`mission ${positionals[0]} not found`);
  const reports = entries.map(({ mission, paths, worktree }) => {
    const state = readJson(paths.state);
    return {
      mission_id: mission.mission_id,
      status: state.status,
      terminal_state: state.terminal_state,
      reason: state.reason,
      worktree,
      branch: mission.repo.branch,
      last_checkpoint: state.last_checkpoint_seq,
      last_checkpoint_commit: state.last_checkpoint_head,
      next_unit: state.next_unit ? { id: state.next_unit.id, executor: state.next_unit.executor, goal: state.next_unit.goal } : null,
      current_run: state.current ? { run_seq: state.current.run_seq, executor: state.current.executor, pid: state.current.pid, started_at: state.current.started_at } : null,
      updated_at: state.updated_at,
      metrics: metrics(readJsonl(paths.events)),
    };
  });
  if (values.json || reports.length) console.log(JSON.stringify(reports, null, 2));
  else console.log('no supervised mission in this repository');
  return 0;
}

// Inside a supervised session the supervisor sets AGENT_RUNTIME_CONTROL_DIR; elsewhere the mission whose
// worktree is the current checkout is used.
function sessionContext() {
  const control = envValue(process.env, 'AGENT_RUNTIME_CONTROL_DIR');
  let found;
  if (control) {
    found = openMission(path.resolve(control));
  } else {
    const top = path.resolve(git.toplevel(process.cwd()));
    found = listMissions(process.cwd()).find((entry) => samePath(entry.worktree, top));
    if (!found) throw new Error(`no supervised mission runs in ${top}`);
  }
  const { mission, paths, worktree, repo } = found;
  const state = readJson(paths.state);
  if (state.current?.executor !== 'claude') throw new Error(`no supervised Claude run is in progress (status ${state.status})`);
  const previous = state.last_checkpoint_seq ? readJson(checkpointPath(paths, state.last_checkpoint_seq)) : null;
  return { mission, state, previous, repo, worktree, paths, runSeq: state.current.run_seq, stateDir: paths.dir };
}

function cmdCheckpoint(args) {
  const [sub, ...rest] = args;
  const { values } = parseArgs({ args: rest, options: { file: { type: 'string' } } });
  const context = sessionContext();
  const file = values.file ? path.resolve(values.file) : context.paths.checkpointOut;
  if (sub === 'template') {
    const existing = readJsonIfExists(file);
    writeJsonAtomic(file, existing ? refreshTemplate(existing, context) : buildTemplate(context));
    console.log(`${existing ? 'refreshed the Git facts in' : 'wrote'} ${file}`);
    console.log('Fill: mission_goal (first checkpoint), current_phase, boundary, decisions_made, implemented_since_previous, evidence, findings, next_exact_action, next_unit (null once final), required_next_context, authorities_required_next. Then run "checkpoint validate".');
    return 0;
  }
  if (sub === 'validate') {
    const verdict = validateCheckpointFile(file, context);
    if (verdict.ok) {
      console.log(`OK: checkpoint ${verdict.checkpoint.checkpoint_seq} is valid (${verdict.checkpoint.mission_state}). End your turn.`);
      return 0;
    }
    console.log(`INVALID: ${verdict.errors.length} error(s)`);
    for (const error of verdict.errors) console.log(`- ${error}`);
    return 1;
  }
  throw new Error('checkpoint needs "template" or "validate"');
}

function captureFile(program) {
  let dir = path.join(os.tmpdir(), 'agent-runtime-captures');
  const top = git.git(process.cwd(), ['rev-parse', '--show-toplevel'], { allowFail: true });
  const workspace = top.ok ? path.join(path.resolve(top.stdout.trim()), STATE_DIR) : null;
  if (workspace && fs.existsSync(workspace)) dir = path.join(workspace, 'captures');
  return path.join(dir, `${nowIso().replace(/[:.]/g, '-')}-${path.basename(program).replace(/[^\w.-]/g, '_')}.log`);
}

async function cmdCapture(args) {
  const split = args.indexOf('--');
  if (split === -1 || split === args.length - 1) throw new Error('usage: capture [--out <file>] [--tail <n>] -- <command...>');
  const { values } = parseArgs({ args: args.slice(0, split), options: { out: { type: 'string' }, tail: { type: 'string' } } });
  const command = args.slice(split + 1);
  const argv = resolveExecutable(command[0], process.env);
  if (!argv) throw new Error(`${command[0]} not found on PATH`);
  const logFile = path.resolve(values.out ?? captureFile(command[0]));
  const run = await runToFiles([...argv, ...command.slice(1)], { cwd: process.cwd(), env: process.env, stdoutFile: logFile });
  const summary = summarizeLog(logFile, Number(values.tail ?? 15));
  console.log(JSON.stringify({ command: command.join(' '), exit_code: run.status, error: run.error?.message ?? null, duration_ms: run.durationMs, log: logFile, ...summary }, null, 2));
  return run.status ?? 1;
}

function probeClaude(env) {
  const argv = resolveExecutable('claude', env);
  if (!argv) return { ok: false, reason: 'claude CLI not found' };
  const help = runSync([...argv, '--help'], { env, timeoutMs: 30_000 }).stdout;
  const flags = Object.fromEntries(CLAUDE_FLAGS.map((flag) => [flag, help.includes(flag)]));
  let auth = null;
  try {
    const status = JSON.parse(runSync([...argv, 'auth', 'status'], { env, timeoutMs: 30_000 }).stdout);
    auth = { loggedIn: status.loggedIn === true, authMethod: status.authMethod ?? null, subscriptionType: status.subscriptionType ?? null };
  } catch (error) {
    auth = { loggedIn: false, error: `could not read claude auth status: ${error.message}` };
  }
  const version = runSync([...argv, '--version'], { env, timeoutMs: 30_000 }).stdout.trim();
  return { ok: Object.values(flags).every(Boolean) && auth.loggedIn, argv, version, flags, auth };
}

function probeCodex(env) {
  const detected = detectCodex(env);
  if (!detected.ok) return detected;
  const help = runSync([...detected.argv, 'exec', '--help'], { env, timeoutMs: 30_000 }).stdout;
  const flags = Object.fromEntries(CODEX_FLAGS.map((flag) => [flag, help.includes(flag)]));
  return { ...detected, ok: Object.values(flags).every(Boolean), flags };
}

function cmdDoctor() {
  const env = process.env;
  const report = {
    node: { version: process.version, ok: Number(process.versions.node.split('.')[0]) >= 22 },
    git: runSync(['git', '--version'], { env, timeoutMs: 30_000 }).stdout.trim() || null,
    claude: probeClaude(env),
    codex: probeCodex(env),
    inside_claude_code_session: Boolean(envValue(env, 'CLAUDECODE')),
  };
  console.log(JSON.stringify(report, null, 2));
  return report.node.ok && report.claude.ok ? 0 : 1;
}

async function main(argv) {
  const [command, ...rest] = argv;
  switch (command) {
    case 'run': return cmdRun(rest);
    case 'status': return cmdStatus(rest);
    case 'checkpoint': return cmdCheckpoint(rest);
    case 'capture': return cmdCapture(rest);
    case 'doctor': return cmdDoctor();
    case undefined: case 'help': case '--help': case '-h':
      console.log(USAGE);
      return 0;
    default:
      throw new Error(`unknown command "${command}"\n\n${USAGE}`);
  }
}

main(process.argv.slice(2)).then(
  (code) => { process.exitCode = code; },
  (error) => {
    console.error(`agent-runtime: ${error.message}`);
    process.exitCode = 1;
  },
);
