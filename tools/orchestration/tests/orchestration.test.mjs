import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, evaluate, parseNameStatus, roleForBranch, summarize } from '../lib/ownership.mjs';
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

test('integration: shared contracts, governance and CoachingCore need approval; historical audits are insert-only', () => {
  const existed = new Set(['audits/v1-hr5-runna-parity-2026-11-25/R.md']);
  const ch = [{ status: 'M', path: 'ios/Packages/CoachingPresentation/X.swift' }, { status: 'M', path: 'CoachingCore/src/a.mjs' },
    { status: 'A', path: 'ios/App/Composition/Root.swift' }, { status: 'A', path: 'audits/v1-ios-integration-2026-12-01/R.md' },
    { status: 'M', path: 'audits/v1-hr5-runna-parity-2026-11-25/R.md' }, { status: 'A', path: 'ios/Packages/CoachingHost/X.swift' }];
  const opts = { existedAtBase: (p) => existed.has(p) };
  assert.deepEqual(evaluate(ch, 'INT', opts).results.map((x) => x.verdict), ['APPROVAL', 'APPROVAL', 'OK', 'OK', 'FORBIDDEN', 'OK']);
  assert.deepEqual(evaluate(ch, 'INT', { ...opts, approved: true }).results.map((x) => x.verdict), ['OK', 'OK', 'OK', 'OK', 'FORBIDDEN', 'OK']);
});

test('a rename is checked at both ends', () => {
  const ch = parseNameStatus('R100\tios/Packages/CoachingPresentation/A.swift\tios/Packages/RepMileUI/A.swift\nM\tios/Packages/RepMileUI/B.swift\n');
  assert.equal(ch[0].oldPath, 'ios/Packages/CoachingPresentation/A.swift');
  assert.deepEqual(evaluate(ch, 'C').results.map((x) => x.verdict), ['FORBIDDEN', 'OK', 'OK']);
});

test('a branch without a role is checked only for CoachingCore and historical audits', () => {
  const r = evaluate([{ status: 'M', path: 'CoachingCore/x' }, { status: 'M', path: 'README.md' }, { status: 'D', path: 'audits/old/x.md' }],
    null, { existedAtBase: () => true });
  assert.deepEqual(r.results.map((x) => x.verdict), ['APPROVAL', 'OK', 'FORBIDDEN']);
});

test('states: blocked wins, an open PR means in review, no label means backlog', () => {
  assert.equal(issueState(['status:blocked', 'status:in-progress'], true), 'BLOCKED');
  assert.equal(issueState(['status:in-progress'], true), 'IN_REVIEW');
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
