import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as git from './git.mjs';
import { covers } from './checkpoint.mjs';
import { STATE_DIR } from './mission.mjs';
import { ensureDir, writeJsonAtomic, writeText } from './files.mjs';
import { runCodex, runLocal } from './executors.mjs';

export const CODEX_SCHEMA = fileURLToPath(new URL('../schemas/codex-result.schema.json', import.meta.url));
const JOB_RESULT_SCHEMA = 'agent-runtime/job-result@1';
const CODEX_STATUSES = ['DONE', 'PARTIAL', 'FAILED'];
const TEXT_LIMIT = 2000;

const safeId = (id) => id.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'unit';
const relative = (worktree, file) => path.relative(worktree, file).split(path.sep).join('/');
const clip = (value) => (typeof value === 'string' && value.length > TEXT_LIMIT ? `${value.slice(0, TEXT_LIMIT)} …` : value);

function jobDir(paths, unit, runSeq) {
  const id = `${runSeq}-${safeId(unit.id)}`;
  return { id, dir: path.join(paths.jobs, id) };
}

// Known before the job starts, so that a supervisor restarted mid-job can point at them.
export function codexJobNames(mission, unit, runSeq) {
  return {
    branch: `codex/${mission.slug}-${safeId(unit.id)}-r${runSeq}`,
    worktree: path.join(mission.repo.main_root, '.claude', 'worktrees', `${mission.slug}--codex-r${runSeq}`),
  };
}

export function codexOutputErrors(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['not a JSON object'];
  const errors = [];
  if (!CODEX_STATUSES.includes(value.status)) errors.push(`status must be one of ${CODEX_STATUSES.join(', ')}`);
  if (typeof value.summary !== 'string') errors.push('summary must be a string');
  for (const key of ['files_changed', 'open_issues']) {
    if (!Array.isArray(value[key]) || value[key].some((item) => typeof item !== 'string')) errors.push(`${key} must be an array of strings`);
  }
  if (!Array.isArray(value.commands_run)) errors.push('commands_run must be an array');
  if (typeof value.notes_for_reviewer !== 'string') errors.push('notes_for_reviewer must be a string');
  return errors;
}

function readOutput(file) {
  if (!fs.existsSync(file)) return { value: null, problems: ['codex wrote no final message'] };
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { value, problems: codexOutputErrors(value) };
  } catch (error) {
    return { value: null, problems: [`the final message is not JSON (${error.message})`] };
  }
}

export function renderCodexBrief({ mission, unit, runSeq }) {
  return [
    `# Codex job ${unit.id} · mission ${mission.mission_id} (run ${runSeq})`,
    '',
    `You are a bounded engineering worker in a Git worktree created for this job only. This brief is the whole of your authorization within mission ${mission.mission_id}.`,
    '',
    '## Task',
    unit.job.brief,
    '',
    '## Boundaries',
    `- Change files only under: ${unit.job.allowed_paths.map((entry) => `\`${entry}\``).join(', ')}.`,
    '- Do not create commits, switch branches, merge, rebase, reset, push or touch remotes: the supervisor commits your changes after checking them.',
    '- Do not read or change credentials. Do not install dependencies unless the task asks for it.',
    '- Keep the change small and verifiable.',
    '',
    '## Acceptance (the supervisor runs these after you finish)',
    ...unit.job.acceptance.map((command) => `- \`${command.join(' ')}\``),
    '',
    '## Final message',
    'Reply with JSON that matches the provided output schema: status (DONE, PARTIAL or FAILED), summary, files_changed, commands_run, open_issues, notes_for_reviewer.',
    '',
  ].join('\n');
}

function renderHandoff(result, output) {
  const list = (items) => (items?.length ? items.map((item) => `- ${item}`) : ['- none']);
  return [
    `# Codex handoff · job ${result.unit_id} · run ${result.run_seq}`,
    '',
    `Status verified by the supervisor: **${result.status}**${result.reasons.length ? ` (${result.reasons.join('; ')})` : ''}`,
    `Branch \`${result.job_branch}\` · commit \`${result.commit ?? 'none'}\` · base \`${result.base_commit}\` · worktree \`${result.job_worktree}\``,
    '',
    `## Changed files (${result.changed_files.length})`,
    ...list(result.changed_files),
    '',
    '## Acceptance',
    ...list(result.acceptance.map((check) => `\`${check.command}\` → exit ${check.exit_code}`)),
    '',
    "## Codex's own report (claims, not verified)",
    `Status: ${output?.status ?? 'none'}`,
    `Summary: ${clip(output?.summary) ?? 'none'}`,
    'Open issues:',
    ...list(output?.open_issues?.map(clip)),
    `Notes for the reviewer: ${clip(output?.notes_for_reviewer) || 'none'}`,
    `Files Codex says it changed: ${output?.files_changed?.join(', ') || 'none'}`,
    '',
  ].join('\n');
}

// Runs a Codex job in a new worktree on a job branch cut from the mission HEAD, then verifies the
// result independently of Codex's own report: changed paths, the commit, the acceptance commands.
export async function runCodexJob({ mission, paths, worktree, unit, runSeq, env, codexArgv, onSpawn }) {
  const job = jobDir(paths, unit, runSeq);
  const started = Date.now();
  const base = git.head(worktree);
  const { branch: jobBranch, worktree: jobWorktree } = codexJobNames(mission, unit, runSeq);
  const reasons = [];
  git.addWorktree(worktree, jobWorktree, jobBranch, base);
  const outputFile = path.join(jobWorktree, STATE_DIR, 'codex-output.json');
  if (!git.isIgnored(jobWorktree, `${STATE_DIR}/codex-output.json`)) reasons.push(`${STATE_DIR}/ is not ignored in the job worktree`);
  for (const entry of unit.job.copy_ignored ?? []) {
    const source = path.join(worktree, entry);
    if (!fs.existsSync(source)) reasons.push(`copy_ignored ${entry} does not exist in the mission worktree`);
    else if (!git.isIgnored(jobWorktree, entry)) reasons.push(`copy_ignored ${entry} is tracked material; only ignored local material is copied`);
    else fs.cpSync(source, path.join(jobWorktree, entry), { recursive: true });
  }
  ensureDir(path.dirname(outputFile));
  const brief = renderCodexBrief({ mission, unit, runSeq });
  writeText(path.join(job.dir, 'brief.md'), brief);
  let run = { status: null, error: null };
  if (!reasons.length) {
    run = await runCodex({
      argv: codexArgv,
      env,
      worktree: jobWorktree,
      brief,
      schemaFile: CODEX_SCHEMA,
      outputFile,
      model: unit.job.model ?? null,
      logFile: path.join(job.dir, 'codex.log'),
      onSpawn,
    });
    if (run.status !== 0) reasons.push(`codex exited with ${run.status ?? run.error?.message ?? 'no status'}`);
  }
  const output = readOutput(outputFile);
  if (!reasons.length && output.problems.length) reasons.push(`structured handoff invalid: ${output.problems.join('; ')}`);
  if (!output.problems.length) {
    writeJsonAtomic(path.join(job.dir, 'EVIDENCE.json'), output.value);
    if (!reasons.length && output.value.status !== 'DONE') reasons.push(`codex reported ${output.value.status}`);
  }
  const changed = git.dirtyPaths(jobWorktree);
  const outside = changed.filter((file) => !unit.job.allowed_paths.some((entry) => covers(entry, file)));
  if (outside.length) reasons.push(`changes outside allowed_paths, left uncommitted in the job worktree: ${outside.slice(0, 10).join(', ')}`);
  let commit = null;
  if (!reasons.length && changed.length) {
    commit = git.commitAll(jobWorktree, `agent-runtime: codex job ${unit.id} for ${mission.mission_id}\n\nAgent-Runtime-Job: ${mission.mission_id}/${job.id}`);
    if (git.parentOf(jobWorktree, commit) !== base) reasons.push('the job commit does not sit directly on the mission HEAD');
  }
  const acceptance = [];
  if (!reasons.length) {
    for (const [index, command] of unit.job.acceptance.entries()) {
      const logFile = path.join(job.dir, `acceptance-${index + 1}.log`);
      const check = await runLocal({ command, cwd: jobWorktree, env, logFile });
      acceptance.push({ command: command.join(' '), exit_code: check.status, log: path.basename(logFile), tail: check.tail.slice(-5) });
      if (check.status !== 0) reasons.push(`acceptance failed: ${command.join(' ')} (exit ${check.status ?? check.error?.message})`);
    }
  }
  const claimed = Array.isArray(output.value?.files_changed) ? output.value.files_changed : null;
  const result = {
    schema: JOB_RESULT_SCHEMA,
    executor: 'codex',
    unit_id: unit.id,
    run_seq: runSeq,
    status: reasons.length ? 'FAILED' : 'DONE',
    reasons,
    duration_ms: Date.now() - started,
    codex_exit: run.status,
    base_commit: base,
    job_branch: jobBranch,
    job_worktree: jobWorktree,
    commit,
    changed_files: changed,
    claimed_files: claimed,
    unclaimed_changes: claimed ? changed.filter((file) => !claimed.includes(file)) : null,
    acceptance,
    job_dir: relative(worktree, job.dir),
    brief: unit.job.brief,
  };
  writeJsonAtomic(path.join(job.dir, 'RESULT.json'), result);
  writeText(path.join(job.dir, 'CODEX_HANDOFF.md'), renderHandoff(result, output.value));
  return result;
}

// A deterministic command in the mission worktree; the full output stays in output.log.
export async function runLocalJob({ paths, worktree, unit, command, runSeq, env, onSpawn }) {
  const job = jobDir(paths, unit, runSeq);
  const run = await runLocal({ command, cwd: worktree, env, logFile: path.join(job.dir, 'output.log'), onSpawn });
  const result = {
    schema: JOB_RESULT_SCHEMA,
    executor: 'local',
    unit_id: unit.id,
    run_seq: runSeq,
    status: run.status === 0 ? 'DONE' : 'FAILED',
    reasons: run.status === 0 ? [] : [run.error?.message ?? `exit ${run.status}`],
    command: command.join(' '),
    exit_code: run.status,
    duration_ms: run.durationMs,
    log: 'output.log',
    lines: run.lines,
    sha256: run.sha256,
    tail: run.tail,
    flagged: run.flagged,
    dirty_paths: git.dirtyPaths(worktree),
    job_dir: relative(worktree, job.dir),
  };
  writeJsonAtomic(path.join(job.dir, 'RESULT.json'), result);
  return result;
}
