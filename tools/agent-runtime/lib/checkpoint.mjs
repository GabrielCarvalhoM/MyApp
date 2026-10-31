import { commandPolicyError } from './commands.mjs';

export const CHECKPOINT_SCHEMA = 'agent-runtime/checkpoint@1';
export const FINAL_STATES = Object.freeze(['COMPLETE', 'CLOSED_READY', 'CLOSED_NOT_READY', 'CANCELLED']);
export const HALT_STATES = Object.freeze(['BLOCKED', 'FOUNDER_REQUIRED']);
export const MISSION_STATES = Object.freeze(['RUNNING', ...HALT_STATES, ...FINAL_STATES]);
export const BOUNDARIES = Object.freeze([
  'planning_complete',
  'implementation_unit_complete',
  'freeze_created',
  'review_complete',
  'correction_cycle_complete',
  'delegation',
  'mission_closure',
  'blocker',
  'other',
]);
export const EXECUTORS = Object.freeze(['claude', 'codex', 'local']);
export const EFFORTS = Object.freeze(['low', 'medium', 'high', 'xhigh', 'max']);
export const WORK_KINDS = Object.freeze(['mechanical', 'material_ui_ux', 'material_other', 'ui_ux_judge']);
export const EVIDENCE_KINDS = Object.freeze(['test', 'probe', 'mutation', 'review', 'verification', 'freeze', 'other']);
export const MAX_CHECKPOINT_BYTES = 64 * 1024;
export const RUNTIME_REF_PREFIX = 'runtime:';

// Founder hard floor of the global model routing policy (agent-system MODEL_ROUTING_POLICY 1.5.0).
const UI_FLOOR = Object.freeze({ model: 'claude-opus-5-5', effort: 'max' });
const UI_WORK_KINDS = ['material_ui_ux', 'ui_ux_judge'];
const COMMIT_ID = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const RESERVED_PREFIXES = ['.git/', '.agent-runtime/'];

export const isFinal = (state) => FINAL_STATES.includes(state);
export const isHalt = (state) => HALT_STATES.includes(state);
export const stripAnchor = (ref) => ref.split('#')[0];
// A "dir/" entry covers every path below it; any other entry covers exactly one path.
export const covers = (entry, file) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry);

class Checker {
  errors = [];

  fail(where, message) {
    this.errors.push(`${where}: ${message}`);
    return false;
  }

  object(value, where, nullable = false) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) return true;
    return this.fail(where, nullable ? 'must be null or an object' : 'must be an object');
  }

  text(value, where) {
    return (typeof value === 'string' && value.trim() !== '') || this.fail(where, 'must be a non-empty string');
  }

  bool(value, where) {
    return typeof value === 'boolean' || this.fail(where, 'must be true or false');
  }

  int(value, where, min, nullable = false) {
    if (Number.isInteger(value) && value >= min) return true;
    return this.fail(where, `must be ${nullable ? 'null or ' : ''}an integer >= ${min}`);
  }

  oneOf(value, allowed, where) {
    return allowed.includes(value) || this.fail(where, `must be one of ${allowed.join(', ')}`);
  }

  pattern(value, regex, where, what) {
    return (typeof value === 'string' && regex.test(value)) || this.fail(where, `must be ${what}`);
  }

  list(value, where, each) {
    if (!Array.isArray(value)) return this.fail(where, 'must be an array');
    value.forEach((item, index) => each(item, `${where}[${index}]`));
    return true;
  }

  textList(value, where) {
    return this.list(value, where, (item, at) => this.text(item, at));
  }

  repoPath(value, where) {
    if (!this.text(value, where)) return false;
    const target = stripAnchor(value);
    const segments = target.split('/');
    const bad =
      target === '' ||
      target.includes('\\') ||
      target.startsWith('/') ||
      /^[a-zA-Z]:/.test(target) ||
      segments.some((segment) => segment === '..' || segment === '.');
    return !bad || this.fail(where, 'must be a normalized repository-relative path (forward slashes, no "." or "..")');
  }

  pathList(value, where) {
    return this.list(value, where, (item, at) => this.repoPath(item, at));
  }

  evidenceRef(value, where) {
    const isRuntime = typeof value === 'string' && value.startsWith(RUNTIME_REF_PREFIX);
    return this.repoPath(isRuntime ? value.slice(RUNTIME_REF_PREFIX.length) : value, where);
  }

  command(value, where) {
    const problem = commandPolicyError(value);
    return problem === null || this.fail(where, problem);
  }
}

// Shape and internal-consistency rules; repository and continuity checks live in coherence.mjs.
export function validateStructure(cp) {
  const c = new Checker();
  if (!c.object(cp, 'checkpoint')) return c.errors;
  if (cp.schema !== CHECKPOINT_SCHEMA) c.fail('schema', `must be "${CHECKPOINT_SCHEMA}"`);
  c.text(cp.mission_id, 'mission_id');
  c.int(cp.checkpoint_seq, 'checkpoint_seq', 1);
  if (cp.previous_checkpoint !== null) c.int(cp.previous_checkpoint, 'previous_checkpoint', 1, true);
  if (c.text(cp.created_at, 'created_at') && Number.isNaN(Date.parse(cp.created_at))) {
    c.fail('created_at', 'must be an ISO-8601 timestamp');
  }
  if (c.object(cp.produced_by, 'produced_by')) {
    c.int(cp.produced_by.run_seq, 'produced_by.run_seq', 1);
    c.oneOf(cp.produced_by.executor, ['claude'], 'produced_by.executor');
  }
  c.text(cp.mission_goal, 'mission_goal');
  c.oneOf(cp.mission_state, MISSION_STATES, 'mission_state');
  c.text(cp.current_phase, 'current_phase');
  c.oneOf(cp.boundary, BOUNDARIES, 'boundary');
  if (c.object(cp.baseline, 'baseline')) {
    c.pattern(cp.baseline.commit, COMMIT_ID, 'baseline.commit', 'a full 40-character commit id');
  }
  if (c.object(cp.git, 'git')) {
    c.text(cp.git.branch, 'git.branch');
    c.pattern(cp.git.head_commit, COMMIT_ID, 'git.head_commit', 'a full 40-character commit id');
    c.bool(cp.git.pushed, 'git.pushed');
  }
  if (cp.freeze !== null && c.object(cp.freeze, 'freeze', true)) {
    c.text(cp.freeze.id, 'freeze.id');
    c.text(cp.freeze.digest, 'freeze.digest');
    c.repoPath(cp.freeze.record, 'freeze.record');
  }
  c.textList(cp.canonical_invariants, 'canonical_invariants');
  c.pathList(cp.authorities_used, 'authorities_used');
  c.list(cp.decisions_made, 'decisions_made', (decision, at) => {
    if (!c.object(decision, at)) return;
    c.text(decision.id, `${at}.id`);
    c.text(decision.decision, `${at}.decision`);
    c.text(decision.rationale, `${at}.rationale`);
  });
  c.textList(cp.implemented_since_previous, 'implemented_since_previous');
  c.pathList(cp.files_changed, 'files_changed');
  c.list(cp.evidence, 'evidence', (item, at) => checkEvidence(c, item, at));
  checkFindings(c, cp.findings);
  c.textList(cp.do_not_reopen, 'do_not_reopen');
  c.text(cp.next_exact_action, 'next_exact_action');
  c.pathList(cp.required_next_context, 'required_next_context');
  c.pathList(cp.authorities_required_next, 'authorities_required_next');
  c.list(cp.handoffs, 'handoffs', (handoff, at) => {
    if (!c.object(handoff, at)) return;
    c.text(handoff.from, `${at}.from`);
    c.text(handoff.to, `${at}.to`);
    c.evidenceRef(handoff.ref, `${at}.ref`);
  });
  const founder = cp.founder_action_required;
  if (founder !== null && c.object(founder, 'founder_action_required', true)) {
    c.text(founder.reason, 'founder_action_required.reason');
    c.text(founder.decision_needed, 'founder_action_required.decision_needed');
    c.textList(founder.options, 'founder_action_required.options');
  }
  checkStateRules(c, cp);
  return c.errors;
}

function checkEvidence(c, item, at) {
  if (!c.object(item, at)) return;
  c.oneOf(item.kind, EVIDENCE_KINDS, `${at}.kind`);
  c.evidenceRef(item.ref, `${at}.ref`);
  c.text(item.result, `${at}.result`);
  c.text(item.summary, `${at}.summary`);
  if (item.sha256 !== undefined && item.sha256 !== null) {
    c.pattern(item.sha256, SHA256, `${at}.sha256`, 'a 64-character lowercase hex digest');
  }
  if (item.command !== undefined && item.command !== null) c.text(item.command, `${at}.command`);
}

function checkFindings(c, findings) {
  if (!c.object(findings, 'findings')) return;
  c.list(findings.open, 'findings.open', (finding, at) => {
    if (!c.object(finding, at)) return;
    c.text(finding.id, `${at}.id`);
    c.text(finding.severity, `${at}.severity`);
    c.text(finding.summary, `${at}.summary`);
    c.text(finding.owner, `${at}.owner`);
    c.bool(finding.blocking, `${at}.blocking`);
  });
  c.list(findings.closed, 'findings.closed', (finding, at) => {
    if (!c.object(finding, at)) return;
    c.text(finding.id, `${at}.id`);
    c.text(finding.resolution, `${at}.resolution`);
    if (finding.evidence_ref !== undefined && finding.evidence_ref !== null) {
      c.evidenceRef(finding.evidence_ref, `${at}.evidence_ref`);
    }
  });
  if (!Array.isArray(findings.open) || !Array.isArray(findings.closed)) return;
  const ids = [...findings.open, ...findings.closed].map((finding) => finding?.id);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) c.fail('findings', `ids must be unique across open and closed: ${duplicates.join(', ')}`);
}

function checkStateRules(c, cp) {
  const state = cp.mission_state;
  if (!MISSION_STATES.includes(state)) return;
  const open = Array.isArray(cp.findings?.open) ? cp.findings.open : [];
  const blockers = open.filter((finding) => finding?.blocking === true).map((finding) => finding.id);
  const founder = cp.founder_action_required;
  if (isFinal(state)) {
    if (cp.next_unit !== null) c.fail('next_unit', `must be null when mission_state is ${state}`);
    if (cp.boundary !== 'mission_closure') c.fail('boundary', `must be mission_closure when mission_state is ${state}`);
  } else if (cp.next_unit === null || cp.next_unit === undefined) {
    c.fail('next_unit', `is required when mission_state is ${state} (for BLOCKED or FOUNDER_REQUIRED: the unit to run once resolved)`);
  } else {
    checkUnit(c, cp.next_unit, 'next_unit', false);
  }
  if (state === 'FOUNDER_REQUIRED' && !founder) {
    c.fail('founder_action_required', 'is required when mission_state is FOUNDER_REQUIRED');
  }
  if ((state === 'RUNNING' || isFinal(state)) && founder) {
    c.fail('founder_action_required', `must be null when mission_state is ${state}`);
  }
  if (state === 'BLOCKED' && !founder && blockers.length === 0) {
    c.fail('mission_state', 'BLOCKED needs a blocking open finding or founder_action_required');
  }
  if (state === 'CLOSED_NOT_READY' && blockers.length === 0) {
    c.fail('mission_state', 'CLOSED_NOT_READY must name at least one blocking open finding');
  }
  if ((state === 'CLOSED_READY' || state === 'COMPLETE') && blockers.length) {
    c.fail('mission_state', `${state} is not allowed while blocking findings are open: ${blockers.join(', ')}`);
  }
}

function checkUnit(c, unit, where, claudeOnly) {
  if (!c.object(unit, where)) return;
  c.text(unit.id, `${where}.id`);
  c.text(unit.goal, `${where}.goal`);
  if (!c.oneOf(unit.executor, claudeOnly ? ['claude'] : EXECUTORS, `${where}.executor`)) return;
  if (unit.executor === 'claude') {
    checkRoute(c, unit.route, `${where}.route`);
    return;
  }
  if (c.object(unit.job, `${where}.job`)) {
    if (unit.executor === 'local') c.command(unit.job.command, `${where}.job.command`);
    else checkCodexJob(c, unit.job, `${where}.job`);
  }
  if (unit.then === undefined || unit.then === null) {
    c.fail(`${where}.then`, `a claude unit must follow a ${unit.executor} job`);
  } else {
    checkUnit(c, unit.then, `${where}.then`, true);
  }
}

function checkRoute(c, route, where) {
  if (!c.object(route, where)) return;
  c.text(route.model, `${where}.model`);
  c.oneOf(route.effort, EFFORTS, `${where}.effort`);
  c.oneOf(route.work_kind, WORK_KINDS, `${where}.work_kind`);
  c.text(route.reason, `${where}.reason`);
  if (UI_WORK_KINDS.includes(route.work_kind) && (route.model !== UI_FLOOR.model || route.effort !== UI_FLOOR.effort)) {
    c.fail(where, `${route.work_kind} requires model ${UI_FLOOR.model} with effort ${UI_FLOOR.effort} (Founder hard floor)`);
  }
}

function checkCodexJob(c, job, where) {
  c.text(job.brief, `${where}.brief`);
  if (c.pathList(job.allowed_paths, `${where}.allowed_paths`)) {
    if (job.allowed_paths.length === 0) c.fail(`${where}.allowed_paths`, 'must name at least one path or "dir/" prefix');
    const reserved = job.allowed_paths.filter((entry) => {
      const asDir = String(entry).endsWith('/') ? String(entry) : `${entry}/`;
      return RESERVED_PREFIXES.some((prefix) => asDir.startsWith(prefix));
    });
    if (reserved.length) c.fail(`${where}.allowed_paths`, `must not include ${reserved.join(', ')}`);
  }
  const listed = c.list(job.acceptance, `${where}.acceptance`, (command, at) => c.command(command, at));
  if (listed && job.acceptance.length === 0) {
    c.fail(`${where}.acceptance`, 'needs at least one command: delegated work must be verifiable');
  }
  if (job.copy_ignored !== undefined) c.pathList(job.copy_ignored, `${where}.copy_ignored`);
  if (job.fallback_command !== undefined && job.fallback_command !== null) {
    c.command(job.fallback_command, `${where}.fallback_command`);
  }
  if (job.model !== undefined && job.model !== null) c.text(job.model, `${where}.model`);
}
