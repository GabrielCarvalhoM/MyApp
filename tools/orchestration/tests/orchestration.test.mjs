import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDirOf, classify, evaluate, parseNameStatus, parseNameStatusZ, roleForBranch, summarize, BASE_TAGS } from '../lib/ownership.mjs';
import { issueState, parseDependencies, parseLinkedIssues, priorityOf } from '../lib/states.mjs';

test('classify follows contract §10', () => {
  assert.equal(classify('ios/Packages/CoachingHost/Sources/X.swift'), 'A');
  assert.equal(classify('ios/Labs/HealthKitLab/App.swift'), 'B');
  assert.equal(classify('ios/Packages/RunRecorder/Package.swift'), 'C');
  assert.equal(classify('ios/App/RepMile.xcodeproj/project.pbxproj'), 'C');
  assert.equal(classify('ios/App/Composition/Root.swift'), 'INT');
  assert.equal(classify('ios/RepMile.xcworkspace/contents.xcworkspacedata'), 'INT');
  assert.equal(classify('ios/Packages/CoachingPresentation/Facade/app-projections.mjs'), 'SHARED');
  assert.equal(classify('tools/device-lock/with-device.sh'), 'SHARED');
  assert.equal(classify('CoachingCore/src/x.mjs'), 'CORE');
  assert.equal(classify('CLAUDE.md'), 'GOV');
  assert.equal(classify('.github/workflows/v1-ci.yml'), 'ORCH');
  assert.equal(classify('specs/v1/INDEX.md'), 'ORCH');
  assert.equal(classify('audits/v1-figma-final-alignment-2026-11-26/X.md'), 'DESIGN');
  assert.equal(classify('audits/v1-hr5-runna-parity-2026-11-25/X.md'), 'AUDIT');
  assert.equal(classify('README.md'), 'OTHER');
});

test('roles: long-lived branch and increment branches, never a lookalike', () => {
  assert.equal(roleForBranch('claude/v1-ios-swiftui').id, 'C');
  assert.equal(roleForBranch('claude/v1-ios-swiftui-i12-app-shell').id, 'C');
  assert.equal(roleForBranch('refs/heads/claude/v1-ios-healthkit').id, 'B');
  assert.equal(roleForBranch('origin/claude/v1-ios-integration').id, 'INT');
  assert.equal(roleForBranch('claude/v1-ios-swiftuiX'), null);
  assert.equal(roleForBranch('claude/v1-hr5-runna-parity'), null);
});

test('a front may write only its own column', () => {
  const ch = [{ status: 'A', path: 'ios/Packages/RepMileUI/A.swift' }, { status: 'M', path: 'ios/Packages/CoachingHost/B.swift' },
    { status: 'M', path: 'ios/Packages/IntegrationContracts/C.swift' }, { status: 'M', path: 'CoachingCore/src/d.mjs' }, { status: 'A', path: 'NOTES.md' }];
  const r = evaluate(ch, 'C');
  assert.deepEqual(r.results.map((x) => x.verdict), ['OK', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN']);
  assert.deepEqual(summarize(r), { files: 5, ok: 1, approval: 0, forbidden: 4 });
});

test('integration: shared contracts, governance and CoachingCore need approval; existing audit directories are read-only', () => {
  const existed = new Set(['audits/v1-hr5-runna-parity-2026-11-25']);
  const ch = [{ status: 'M', path: 'ios/Packages/CoachingPresentation/X.swift' }, { status: 'M', path: 'CoachingCore/src/a.mjs' },
    { status: 'A', path: 'ios/App/Composition/Root.swift' }, { status: 'A', path: 'audits/v1-ios-integration-2026-12-01/R.md' },
    { status: 'M', path: 'audits/v1-hr5-runna-parity-2026-11-25/R.md' }, { status: 'A', path: 'ios/Packages/CoachingHost/X.swift' }];
  const opts = { auditDirExisted: (p) => existed.has(auditDirOf(p)) };
  assert.deepEqual(evaluate(ch, 'INT', opts).results.map((x) => x.verdict), ['APPROVAL', 'APPROVAL', 'OK', 'OK', 'FORBIDDEN', 'OK']);
  assert.deepEqual(evaluate(ch, 'INT', { ...opts, approved: true }).results.map((x) => x.verdict), ['OK', 'OK', 'OK', 'OK', 'FORBIDDEN', 'OK']);
});

test('a rename is checked at both ends', () => {
  const ch = parseNameStatus('R100\tios/Packages/CoachingPresentation/A.swift\tios/Packages/RepMileUI/A.swift\nM\tios/Packages/RepMileUI/B.swift\n');
  assert.equal(ch[0].oldPath, 'ios/Packages/CoachingPresentation/A.swift');
  assert.deepEqual(evaluate(ch, 'C').results.map((x) => x.verdict), ['FORBIDDEN', 'OK', 'OK']);
});

test('fail closed: a branch without a role (or a fork) needs approval for anything the contract assigns (review R1 #1)', () => {
  const ch = [{ status: 'M', path: 'CLAUDE.md' }, { status: 'M', path: 'canon/CANONICAL_INDEX.md' }, { status: 'M', path: 'ios/Packages/IntegrationContracts/X.swift' },
    { status: 'A', path: '.github/workflows/evil.yml' }, { status: 'M', path: 'CoachingCore/x' }, { status: 'A', path: 'ios/Packages/RepMileUI/X.swift' },
    { status: 'A', path: 'README.md' }, { status: 'D', path: 'audits/old/x.md' }];
  const r = evaluate(ch, null, { auditDirExisted: (p) => auditDirOf(p) === 'audits/old' });
  assert.deepEqual(r.results.map((x) => x.verdict), ['APPROVAL', 'APPROVAL', 'APPROVAL', 'APPROVAL', 'APPROVAL', 'APPROVAL', 'OK', 'FORBIDDEN']);
});

test('new files inside an existing audit directory are refused (review R1 #6)', () => {
  const r = evaluate([{ status: 'A', path: 'audits/v1-aif-p0-jsc-2026-11-17/INJECTED.md' }, { status: 'A', path: 'audits/v1-ios-integration-2026-12-01/R.md' }],
    'INT', { auditDirExisted: (p) => auditDirOf(p) === 'audits/v1-aif-p0-jsc-2026-11-17' });
  assert.deepEqual(r.results.map((x) => x.verdict), ['FORBIDDEN', 'OK']);
});

test('existing files directly under audits/ stay read-only (review R2 NEW-1)', () => {
  assert.equal(auditDirOf('audits/CLAUDE_CANON_UPDATE_2026-10-10.md'), 'audits/CLAUDE_CANON_UPDATE_2026-10-10.md');
  const existed = new Set(['audits/CLAUDE_CANON_UPDATE_2026-10-10.md']);
  const r = evaluate([{ status: 'M', path: 'audits/CLAUDE_CANON_UPDATE_2026-10-10.md' }], 'INT', { auditDirExisted: (p) => existed.has(auditDirOf(p)) });
  assert.equal(r.results[0].verdict, 'FORBIDDEN');
});

test('role-less branches: agent instructions are governance; existing files outside the matrix need approval (review R2 NEW-2)', () => {
  assert.equal(classify('.claude/agents/x.md'), 'GOV');
  assert.equal(classify('tools/agent-runtime/README.md'), 'GOV');
  const r = evaluate([{ status: 'M', path: '.claude/agents/x.md' }, { status: 'M', path: 'README.md' }, { status: 'A', path: 'notes/new.md' }], null);
  assert.deepEqual(r.results.map((x) => x.verdict), ['APPROVAL', 'APPROVAL', 'OK']);
});

test('NUL-separated diff keeps non-ASCII paths classifiable (review R1 #4)', () => {
  const ch = parseNameStatusZ('A\0CoachingCore/é.mjs\0R087\0ios/Packages/CoachingPresentation/á.swift\0ios/Packages/RepMileUI/á.swift\0');
  assert.deepEqual(ch, [{ status: 'A', path: 'CoachingCore/é.mjs' }, { status: 'R', oldPath: 'ios/Packages/CoachingPresentation/á.swift', path: 'ios/Packages/RepMileUI/á.swift' }]);
  assert.equal(evaluate(ch, 'INT').results[0].verdict, 'APPROVAL');
  assert.equal(evaluate(ch, 'C').results[1].verdict, 'FORBIDDEN');
});

test('only allowlisted base tags count (review R1 #3)', () => {
  assert.ok(BASE_TAGS.includes('v1-abc-ready-2026-11-26'));
  assert.ok(!BASE_TAGS.some((t) => t.includes('*')));
});

test('states: blocked wins, an open PR means in review, no label means backlog', () => {
  assert.equal(issueState(['status:blocked', 'status:in-progress'], true), 'BLOCKED');
  assert.equal(issueState(['status:in-progress'], true), 'IN_REVIEW');
  assert.equal(issueState(['status:founder-decision', 'status:in-progress'], true), 'FOUNDER_DECISION');
  assert.equal(issueState(['status:ready-to-integrate'], true), 'READY_TO_INTEGRATE');
  assert.equal(issueState(['status:ready']), 'READY');
  assert.equal(issueState(['type:feature']), 'BACKLOG');
  assert.equal(priorityOf(['priority:p1', 'type:bug']), 1);
  assert.equal(priorityOf([]), 9);
});

test('PR body links: template line and closing keywords', () => {
  assert.deepEqual(parseLinkedIssues('Issue: #12\n\nRefs #3. fixes #40'), [3, 12, 40]);
  assert.deepEqual(parseLinkedIssues('- **Issue:** #7, #8'), [7, 8]);
  assert.deepEqual(parseLinkedIssues('Issue: #\nnothing'), []);
});

test('dependencies come only from the Dependências section', () => {
  const body = '### Objetivo\n\nsee #99\n\n### Dependências\n\n#4, #5 e decisão DR-121\n\n### Testes\n\n#77';
  assert.deepEqual(parseDependencies(body), [4, 5]);
  assert.deepEqual(parseDependencies('### Dependencias\n\nnenhuma'), []);
  assert.deepEqual(parseDependencies('no section #3'), []);
});
