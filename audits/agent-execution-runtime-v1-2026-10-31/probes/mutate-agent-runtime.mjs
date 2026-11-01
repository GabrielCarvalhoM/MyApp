// Mutation probe for tools/agent-runtime after the security rework: each mutant is a copy of the
// runtime with one safety rule disabled; a mutant must make at least one test fail ("KILLED").
// The real tree is never touched. Usage: node mutate2.mjs <runtime dir> <scratch dir>
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const [SRC, OUT] = process.argv.slice(2);
const ALL = ['checkpoint', 'coherence', 'routing', 'bootstrap', 'supervisor', 'simulation', 'guards', 'security', 'hardening'];
const M = (id, file, find, replace, tests) => ({ id, file, find, replace, tests });
const mutations = [
  M('M01-dirty-tree', 'lib/coherence.mjs', 'if (dirty.length) errors.push(`working tree is not clean', 'if (false) errors.push(`working tree is not clean', ['coherence']),
  M('M02-head-match', 'lib/coherence.mjs', 'if (cp.git.head_commit !== head) {', 'if (false) {', ['coherence']),
  M('M03-blocker-downgrade', 'lib/coherence.mjs', '} else if (current && finding.blocking && !current.blocking) {', '} else if (false) {', ['coherence']),
  M('M04-closed-finding-kept', 'lib/coherence.mjs', 'for (const finding of previous.findings.closed) {\n    if (!closedNow.has(finding.id)) {', 'for (const finding of previous.findings.closed) {\n    if (false) {', ['coherence']),
  M('M05-do-not-reopen', 'lib/coherence.mjs', 'if (droppedScope.length) errors.push(', 'if (false) errors.push(', ['coherence']),
  M('M06-push-verified', 'lib/coherence.mjs', 'if (remote.sha !== head) return [', 'if (false) return [', ['coherence']),
  M('M07-run-binding', 'lib/coherence.mjs', 'if (cp.produced_by.run_seq !== runSeq) errors.push(', 'if (false) errors.push(', ['coherence']),
  M('M08-coverage-missing', 'lib/coherence.mjs', 'if (missing.length) errors.push(', 'if (false) errors.push(', ['coherence']),
  M('M09-digest', 'lib/coherence.mjs', 'if (actual !== digest) errors.push(', 'if (false) errors.push(', ['coherence']),
  M('M10-tracked-refs', 'lib/coherence.mjs', 'if (git.trackedAtHead(repo, rel)) return true;', 'return true;', ['coherence']),
  M('M11-branch-identity', 'lib/coherence.mjs', 'if (cp.git.branch !== mission.repo.branch) errors.push(', 'if (false) errors.push(', ['coherence', 'guards']),
  M('M12-not-ready-blocker', 'lib/checkpoint.mjs', "if (state === 'CLOSED_NOT_READY' && blockers.length === 0) {", 'if (false) {', ['checkpoint']),
  M('M13-ready-no-blocker', 'lib/checkpoint.mjs', "if ((state === 'CLOSED_READY' || state === 'COMPLETE') && blockers.length) {", 'if (false) {', ['checkpoint']),
  M('M14-final-no-next', 'lib/checkpoint.mjs', "if (cp.next_unit !== null) c.fail('next_unit', `must be null when mission_state is ${state}`);", '', ['checkpoint']),
  M('M15-ui-floor', 'lib/checkpoint.mjs', 'if (UI_WORK_KINDS.includes(route.work_kind) && (route.model !== UI_FLOOR.model || route.effort !== UI_FLOOR.effort)) {', 'if (false) {', ['checkpoint']),
  M('M16-codex-verifiable', 'lib/checkpoint.mjs', 'if (listed && job.acceptance.length === 0) {', 'if (false) {', ['checkpoint']),
  M('M17-no-local-executor', 'lib/checkpoint.mjs', "export const EXECUTORS = Object.freeze(['claude', 'codex']);", "export const EXECUTORS = Object.freeze(['claude', 'codex', 'local']);", ['checkpoint']),
  M('M18-no-supervisor-command', 'lib/checkpoint.mjs', "for (const removed of ['fallback_command', 'command']) {", 'for (const removed of []) {', ['checkpoint']),
  M('M19-terminal-stop', 'lib/supervisor.mjs', "const STOP_STATES = ['COMPLETED', 'BLOCKED', 'FOUNDER_REQUIRED', 'PAUSED'];", "const STOP_STATES = ['BLOCKED', 'FOUNDER_REQUIRED', 'PAUSED'];", ['supervisor']),
  M('M20-correction-resume', 'lib/settlement.mjs', 'run = await supervisor.claude(prompt, true, files);', 'run = await supervisor.claude(prompt, false, files);', ['supervisor']),
  M('M21-failed-run-dirty', 'lib/settlement.mjs', 'const dirty = unexpectedDirty(supervisor.repo, supervisor.state);\n  if (dirty.length) {', 'const dirty = unexpectedDirty(supervisor.repo, supervisor.state);\n  if (false) {', ['supervisor']),
  M('M22-handover-once', 'lib/settlement.mjs', 'pending: { notices: [], job_result: null },', 'pending: s.pending,', ['simulation']),
  M('M23-live-run', 'lib/supervisor.mjs', 'if (current.pid && pidAlive(current.pid) && !assumeDead) {', 'if (false) {', ['supervisor']),
  M('M24-max-runs', 'lib/supervisor.mjs', 'if (this.state.run_seq - this.state.run_window_start >= limits.max_runs) {', 'if (false) {', ['supervisor']),
  M('M25-pause', 'lib/settlement.mjs', 'if (s.consecutive_failures >= supervisor.mission.limits.max_consecutive_failures) {', 'if (false) {', ['supervisor']),
  M('M26-terminal-not-reopened', 'lib/supervisor.mjs', "if (s.status !== 'BLOCKED' && s.status !== 'FOUNDER_REQUIRED') {", 'if (false) {', ['supervisor']),
  M('M27-preflight-dirty', 'lib/preflight.mjs', 'if (dirty.length) {\n    return {\n      block: `DIRTY_WORKTREE:', 'if (false) {\n    return {\n      block: `DIRTY_WORKTREE:', ['supervisor']),
  M('M28-remote-divergence', 'lib/preflight.mjs', 'if (git.resolveCommit(repo, remote.sha) && git.isAncestor(repo, remote.sha, head)) return null;', 'return null;', ['supervisor']),
  M('M29-preflight-branch', 'lib/preflight.mjs', 'if (branch !== mission.repo.branch) {', 'if (false) {', ['guards']),
  M('M30-preflight-history', 'lib/preflight.mjs', 'if (!git.isAncestor(repo, last, head)) {', 'if (false) {', ['guards']),
  M('M31-codex-availability', 'lib/routing.mjs', "if (codexAvailability.ok) return { executor: 'codex'", "if (true) return { executor: 'codex'", ['routing', 'simulation']),
  M('M32-allowed-paths', 'lib/jobs.mjs', 'if (outside.length) reasons.push(', 'if (false) reasons.push(', ['simulation']),
  M('M33-handoff-schema', 'lib/jobs.mjs', 'if (!reasons.length && output.problems.length) reasons.push(', 'if (false) reasons.push(', ['guards']),
  M('M34-codex-fallback', 'lib/delegation.mjs', "if (result.status === 'DONE') return supervisor.continueWith(unit.then, result);", 'return supervisor.continueWith(unit.then, result);', ['simulation']),
  M('M35-lock', 'lib/mission.mjs', 'if (held && pidAlive(held.pid)) {', 'if (false) {', ['supervisor']),
  M('M36-state-ignored', 'lib/mission.mjs', 'if (!git.isIgnored(worktreePath, `${STATE_DIR}/state.json`)) {', 'if (false) {', ['guards']),
  M('M37-runtime-in-base', 'lib/mission.mjs', 'if (!git.existsAt(cwd, baseCommit, RUNTIME_ENTRY)) {', 'if (false) {', ['guards']),
  M('M38-permission-modes', 'lib/mission.mjs', 'if (!PERMISSION_MODES.includes(permissionMode)) {', 'if (false) {', ['guards']),
  M('M39-no-permission-prompts', 'lib/executors.mjs', "'--permission-prompts', 'none',", '', ['guards']),
  M('M40-explicit-model', 'lib/executors.mjs', "'--model', route.model,", '', ['guards']),
  M('M41-preflight-tamper', 'lib/supervisor.mjs', 'const tampered = this.checkpointTampering();\n    if (tampered) return this.block(tampered);', '', ['guards']),
  M('M42-accept-digest', 'lib/settlement.mjs', 'last_checkpoint_sha256: sha256File(accepted),', 'last_checkpoint_sha256: null,', ['guards']),
  M('M43-early-ignore', 'lib/mission.mjs', 'if (git.head(top) === baseCommit && !git.isIgnored(top, `${STATE_DIR}/state.json`)) {', 'if (false) {', ['guards']),
  M('M44-reanchor', 'lib/supervisor.mjs', 'if (this.checkpointTampering()) {', 'if (false) {', ['guards']),
  M('M45-record-permission', 'lib/mission.mjs', "problems.push('claude.permission_mode');", '{}', ['security']),
  M('M46-record-remote', 'lib/mission.mjs', "problems.push('repo.remote_url');", '{}', ['security']),
  M('M47-terminal-consistency', 'lib/supervisor.mjs', "if (terminal && (state.status !== 'COMPLETED' || state.terminal_state !== terminal.terminal_state)) {", 'if (false) {', ['security']),
  M('M48-no-fsmonitor', 'lib/git.mjs', "  '-c', 'core.fsmonitor=false',\n", '', ['security']),
  M('M49-no-hooks', 'lib/git.mjs', "'-c', 'core.fsmonitor=false',\n  ...hooksFlag(),", "'-c', 'core.fsmonitor=false',", ['security']),
  M('M51-orphan', 'lib/settlement.mjs', 'if (fs.existsSync(accepted) && sha256File(accepted) !== sha256File(supervisor.paths.checkpointOut)) {', 'if (false) {', ['security']),
  M('M52-ignored-material', 'lib/jobs.mjs', 'if (tampered.length) reasons.push(', 'if (false) reasons.push(', ['guards']),
  M('M53-copy-links', 'lib/jobs.mjs', 'if (!fs.lstatSync(entry).isSymbolicLink()) return true;', 'return true;', ['guards']),
  M('M54-dotgit', 'lib/jobs.mjs', "if (fs.readFileSync(path.join(jobWorktree, '.git'), 'utf8') !== dotGit) reasons.push(", 'if (false) reasons.push(', ['guards']),
  M('M55-closed-blocker-evidence', 'lib/coherence.mjs', '} else if (closed && finding.blocking && !closed.evidence_ref) {', '} else if (false) {', ['coherence']),
  M('M56-model-pattern', 'lib/checkpoint.mjs', 'return this.pattern(value, MODEL_ID, where,', 'return this.pattern(value, /./, where,', ['checkpoint']),
  M('M57-copy-reserved', 'lib/checkpoint.mjs', 'noReserved(job.copy_ignored, `${where}.copy_ignored`);', '', ['checkpoint']),
  M('M58-attr-source', 'lib/git.mjs', '  `--attr-source=${EMPTY_TREE}`,\n', '', ['hardening']),
  M('M59-signing-policy', 'lib/git.mjs', "git(target, ['commit', '--quiet', '-m', message], { extra: signingPolicy() });", "git(target, ['commit', '--quiet', '-m', message]);", ['hardening']),
  M('M60-private-hooks-dir', 'lib/git.mjs', "export const hooksDirectory = () => path.join(privateDir(), 'no-hooks');", "export const hooksDirectory = () => path.join(process.cwd(), '.no-hooks');", ['hardening']),
  M('M61-neutral-dir', 'lib/git.mjs', 'const outsideAnyRepository = () => ({ cwd: privateDir(), env: { ...BASE_ENV, GIT_CEILING_DIRECTORIES: path.dirname(privateDir()) } });', 'const outsideAnyRepository = () => ({ cwd: os.tmpdir(), env: { ...BASE_ENV } });', ['hardening']),
  M('M62-pinned-git-dir', 'lib/git.mjs', 'const location = gitDir ? [`--git-dir=${gitDir}`, `--work-tree=${cwd}`] : [];', 'const location = [];', ['hardening', 'guards']),
  M('M63-untrusted-runtime', 'lib/supervisor.mjs', 'if (untrusted) throw new Error(untrusted);', '', ['hardening']),
  M('M64-preflight-protected', 'lib/preflight.mjs', 'if (drift.length) {\n    return { founder:', 'if (false) {\n    return { founder:', ['hardening']),
  M('M65-resolve-resnapshot', 'lib/supervisor.mjs', 's.protected_snapshot = protectedSnapshot(this.worktree);', '', ['security']),
  M('M66-state-units', 'lib/supervisor.mjs', 'if (errors.length) throw new Error(`state.json ${where} is invalid', 'if (false) throw new Error(`state.json ${where} is invalid', ['hardening']),
  M('M67-record-git-dir', 'lib/mission.mjs', "problems.push('repo.git_dir');", '{}', ['security']),
  M('M68-founder-signing', 'lib/git.mjs', 'signing = [\'-c\', `commit.gpgsign=${signs}`];', 'signing = [];', ['hardening']),
  M('M69-accept-config-required', 'lib/supervisor.mjs', 'if (drift.length && acceptConfig) {', 'if (drift.length) {', ['hardening', 'security']),
  M('M70-accept-flag-alone', 'lib/supervisor.mjs', "if (acceptConfig && resolve === null) throw new Error('--accept-config goes with --resolve');", '', ['hardening']),
  M('M71-any-mission', 'lib/trust.mjs', '    if (reason) return reason;\n', '', ['hardening']),
  M('M72-real-paths', 'lib/trust.mjs', 'return fs.realpathSync.native(file);', 'return path.resolve(file);', ['hardening']),
];

function run(dir, tests) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--test', ...tests], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { out += chunk; });
    child.on('close', (code) => resolve({ code, out }));
  });
}

async function mutant(m) {
  const dir = path.join(OUT, m.id);
  fs.rmSync(dir, { recursive: true, force: true });
  const root = path.join(dir, 'tools', 'agent-runtime');
  fs.cpSync(SRC, root, { recursive: true });
  const tests = m.tests.map((name) => path.join(root, 'tests', `${name}.test.mjs`));
  if (m.file) {
    const file = path.join(root, m.file);
    const text = fs.readFileSync(file, 'utf8');
    const count = text.split(m.find).length - 1;
    if (count !== 1) return { id: m.id, status: 'INVALID', detail: `the pattern matched ${count} times` };
    fs.writeFileSync(file, text.replace(m.find, m.replace));
  }
  const { code } = await run(dir, tests);
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  const status = m.file ? (code === 0 ? 'SURVIVED' : 'KILLED') : (code === 0 ? 'BASELINE_PASS' : 'BASELINE_FAIL');
  return { id: m.id, file: m.file ?? null, tests: m.tests, status };
}

const queue = [{ id: 'M00-baseline', tests: ALL }, ...mutations];
const results = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) results.push(await mutant(queue.shift()));
}));
results.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
for (const r of results) console.log(`${r.status.padEnd(13)} ${r.id}${r.detail ? `  ${r.detail}` : ''}`);
console.log(JSON.stringify(results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})));
