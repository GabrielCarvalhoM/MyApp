import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as git from './git.mjs';
import { covers, isReserved } from './checkpoint.mjs';
import { STATE_DIR } from './mission.mjs';
import { ensureDir, sha256, writeJsonAtomic, writeText } from './files.mjs';
import { runCodex } from './executors.mjs';

export const CODEX_SCHEMA = fileURLToPath(new URL('../schemas/codex-result.schema.json', import.meta.url));
const JOB_RESULT_SCHEMA = 'agent-runtime/job-result@1';
const CODEX_STATUSES = ['DONE', 'PARTIAL', 'FAILED'];
const OUTPUT = `${STATE_DIR}/codex-output.json`;
const TEXT_LIMIT = 2000;

const safeId = (id) => id.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'unit';
const relative = (from, file) => path.relative(from, file).split(path.sep).join('/');
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

// Ignored local material (dependencies) is copied without links: a link could lead outside the worktree.
function copyIgnored(source, target) {
  const links = [];
  fs.cpSync(source, target, {
    recursive: true,
    filter: (entry) => {
      if (!fs.lstatSync(entry).isSymbolicLink()) return true;
      links.push(entry);
      return false;
    },
  });
  return links;
}

// Ignored files never appear in a Git diff, so they are compared by content before and after the job.
function ignoredState(worktree, options) {
  const state = new Map();
  for (const file of git.ignoredFiles(worktree, options)) {
    if (file === OUTPUT) continue;
    const full = path.join(worktree, file);
    const stat = fs.lstatSync(full, { throwIfNoEntry: false });
    state.set(file, stat?.isFile() ? sha256(fs.readFileSync(full)) : 'not-a-file');
  }
  return state;
}

function changedIgnored(before, after) {
  const changed = [...after].filter(([file, digest]) => before.get(file) !== digest).map(([file]) => file);
  return [...changed, ...[...before.keys()].filter((file) => !after.has(file))];
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
    `- Change files only under: ${unit.job.allowed_paths.map((entry) => `\`${entry}\``).join(', ')}. Do not change dependencies or any other ignored file.`,
    '- Do not create commits, switch branches, merge, rebase, reset, push or touch remotes: the supervisor commits your changes after checking them.',
    '- Do not read or change credentials. Do not install dependencies unless the task asks for it.',
    '- Keep the change small and verifiable.',
    '',
    '## Acceptance (the reviewing unit runs these on your result; run them yourself before you finish)',
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
    '## Acceptance, to be run by the judging unit in the mission worktree after integrating',
    ...list(result.acceptance_pending.map((command) => `\`${command}\``)),
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

// Runs a Codex job in a new worktree on a job branch cut from the mission HEAD and verifies the result
// independently of Codex's report: changed paths, ignored material, the commit. It runs none of the
// code Codex wrote: the acceptance commands are handed to the Claude unit that judges the job.
export async function runCodexJob({ mission, paths, worktree, unit, runSeq, env, codexArgv, onSpawn }) {
  const job = jobDir(paths, unit, runSeq);
  const started = Date.now();
  const base = git.head(worktree);
  const { branch: jobBranch, worktree: jobWorktree } = codexJobNames(mission, unit, runSeq);
  const reasons = [];
  git.addWorktree(worktree, jobWorktree, jobBranch, base);
  // Pinned now: a `.git` file rewritten during the job cannot redirect the supervisor's later commands.
  const pinned = { gitDir: git.gitDirOf(jobWorktree) };
  const dotGit = fs.readFileSync(path.join(jobWorktree, '.git'), 'utf8');
  if (!git.isIgnored(jobWorktree, OUTPUT)) reasons.push(`${STATE_DIR}/ is not ignored in the job worktree`);
  const skippedLinks = [];
  for (const entry of unit.job.copy_ignored ?? []) {
    const source = path.join(worktree, entry);
    // Checked where the material exists; a trailing slash lets directory-only ignore rules match.
    const probe = fs.existsSync(source) && fs.statSync(source).isDirectory() ? `${entry.replace(/\/+$/, '')}/` : entry;
    if (isReserved(entry)) reasons.push(`copy_ignored ${entry} is a reserved path`);
    else if (!fs.existsSync(source)) reasons.push(`copy_ignored ${entry} does not exist in the mission worktree`);
    else if (!git.isIgnored(worktree, probe)) reasons.push(`copy_ignored ${entry} is tracked material; only ignored local material is copied`);
    else skippedLinks.push(...copyIgnored(source, path.join(jobWorktree, entry)).map((link) => relative(worktree, link)));
  }
  const outputFile = path.join(jobWorktree, OUTPUT);
  ensureDir(path.dirname(outputFile));
  const ignoredBefore = ignoredState(jobWorktree, pinned);
  const brief = renderCodexBrief({ mission, unit, runSeq });
  writeText(path.join(job.dir, 'brief.md'), brief);
  let run = { status: null, error: null };
  if (!reasons.length) {
    run = await runCodex({ argv: codexArgv, env, worktree: jobWorktree, brief, schemaFile: CODEX_SCHEMA, outputFile, model: unit.job.model ?? null, logFile: path.join(job.dir, 'codex.log'), onSpawn });
    if (run.status !== 0) reasons.push(`codex exited with ${run.status ?? run.error?.message ?? 'no status'}`);
  }
  const output = readOutput(outputFile);
  if (!reasons.length && output.problems.length) reasons.push(`structured handoff invalid: ${output.problems.join('; ')}`);
  if (!output.problems.length) {
    writeJsonAtomic(path.join(job.dir, 'EVIDENCE.json'), output.value);
    if (!reasons.length && output.value.status !== 'DONE') reasons.push(`codex reported ${output.value.status}`);
  }
  if (fs.readFileSync(path.join(jobWorktree, '.git'), 'utf8') !== dotGit) reasons.push("the job worktree's .git file was changed");
  const changed = git.dirtyPaths(jobWorktree, pinned);
  const outside = changed.filter((file) => isReserved(file) || !unit.job.allowed_paths.some((entry) => covers(entry, file)));
  if (outside.length) reasons.push(`changes outside allowed_paths or on reserved paths, left uncommitted in the job worktree: ${outside.slice(0, 10).join(', ')}`);
  const tampered = changedIgnored(ignoredBefore, ignoredState(jobWorktree, pinned));
  if (tampered.length) reasons.push(`ignored material changed, which no Git diff shows: ${tampered.slice(0, 10).join(', ')}`);
  let commit = null;
  if (!reasons.length && changed.length) {
    commit = git.commitAll(jobWorktree, `agent-runtime: codex job ${unit.id} for ${mission.mission_id}\n\nAgent-Runtime-Job: ${mission.mission_id}/${job.id}`, pinned);
    if (git.parentOf(jobWorktree, commit, pinned) !== base) reasons.push('the job commit does not sit directly on the mission HEAD');
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
    skipped_links: skippedLinks,
    acceptance_pending: unit.job.acceptance.map((command) => command.join(' ')),
    job_dir: relative(worktree, job.dir),
    brief: unit.job.brief,
  };
  writeJsonAtomic(path.join(job.dir, 'RESULT.json'), result);
  writeText(path.join(job.dir, 'CODEX_HANDOFF.md'), renderHandoff(result, output.value));
  return result;
}
