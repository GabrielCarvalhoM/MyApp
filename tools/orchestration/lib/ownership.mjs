// RepMile V1 file ownership, as data. Source of authority: PARALLEL_IMPLEMENTATION_CONTRACT.md §10 (rev. 2)
// (audits/v1-parallel-foundation-2026-11-24/) and OWNERSHIP_MATRIX.md (audits/v1-abc-foundation-consolidation-2026-11-26/).
// This module only READS that contract into rules; it does not change it. If the contract changes (§11), this file follows it.

// Path areas. Order matters: the first matching area wins.
export const AREAS = [
  { id: 'A', label: 'A · CoachingHost', prefixes: ['ios/Packages/CoachingHost/', 'ios/Labs/CoachingHostLab/', 'audits/v1-ios-coachinghost-2026-11-24/'] },
  { id: 'B', label: 'B · HealthKit', prefixes: ['ios/Packages/HealthKitIngest/', 'ios/Labs/HealthKitLab/', 'audits/v1-ios-healthkit-2026-11-24/'] },
  { id: 'C', label: 'C · SwiftUI', prefixes: ['ios/Packages/RepMileUI/', 'ios/Packages/RunRecorder/', 'ios/App/RepMile.xcodeproj/', 'ios/App/RepMile/', 'audits/v1-ios-swiftui-2026-11-26/'] },
  { id: 'INT', label: 'Integração (composição)', prefixes: ['ios/App/Composition/'], patterns: [/^ios\/[^/]+\.xcworkspace\//] },
  { id: 'CORE', label: 'CoachingCore (congelado; só emenda versionada)', prefixes: ['CoachingCore/'] },
  {
    id: 'SHARED', label: 'Contratos compartilhados (§11)',
    prefixes: ['ios/Packages/IntegrationContracts/', 'ios/Packages/CoachingPresentation/', 'tools/device-lock/',
      'audits/v1-parallel-foundation-2026-11-24/', 'audits/v1-abc-foundation-consolidation-2026-11-26/'],
  },
  {
    id: 'GOV', label: 'Governança',
    // Agent instructions and agent infrastructure are governance too: editing them steers later agent sessions.
    prefixes: ['canon/', 'product/', 'governance/', '.claude/', '.agents/', '.codex/', 'tools/agent-runtime/'],
    exact: ['MISSION_LEDGER.md', 'CURRENT_MISSION.md', 'CLAUDE.md', 'AGENTS.md', '.gitignore'],
  },
  { id: 'ORCH', label: 'Orquestração (workflow, CI, docs de engenharia)', prefixes: ['.github/', 'docs/engineering/', 'tools/orchestration/', 'audits/v1-engineering-orchestration-2026-11-26/'] },
  { id: 'DESIGN', label: 'Figma (registro do alinhamento)', prefixes: ['audits/v1-figma-final-alignment-2026-11-26/'] },
];

// Branch roles. A role owns its long-lived branch and its increment branches `<branch>-<anything>`.
export const ROLES = [
  { id: 'A', branch: 'claude/v1-ios-coachinghost', lockSession: 'coachinghost', label: 'A · CoachingHost', area: 'area:coachinghost' },
  { id: 'B', branch: 'claude/v1-ios-healthkit', lockSession: 'healthkit', label: 'B · HealthKit', area: 'area:healthkit' },
  { id: 'C', branch: 'claude/v1-ios-swiftui', lockSession: 'swiftui', label: 'C · SwiftUI', area: 'area:swiftui' },
  { id: 'DESIGN', branch: 'claude/v1-figma-final-alignment', lockSession: null, label: 'Figma', area: 'area:design' },
  { id: 'INT', branch: 'claude/v1-ios-integration', lockSession: 'integration', label: 'Integração', area: 'area:integration' },
  { id: 'ORCH', branch: 'claude/v1-engineering-orchestration', lockSession: null, label: 'Orquestração', area: 'area:integration' },
];

// What each role may write. FORBIDDEN fails always; APPROVAL fails unless the change is approved (PR label
// `governance:approved`, set by the Founder/integration owner after the contract §11 or amendment process).
const WRITES = {
  A: { own: ['A'] },
  B: { own: ['B'] },
  C: { own: ['C'] },
  DESIGN: { own: ['DESIGN'] },
  ORCH: { own: ['ORCH'] },
  // Integration merges the fronts (their paths arrive by merge) and owns composition, shared contracts and governance.
  INT: { own: ['A', 'B', 'C', 'DESIGN', 'INT', 'ORCH', 'OTHER_NEW'], approval: ['SHARED', 'GOV', 'CORE'] },
};

export const BASE_TAG_GLOB = 'v1-abc-*';
// Base tags the guard accepts (contract §11: the integration mission publishes each new base). A tag that is not listed here is
// ignored, so pushing a new `v1-abc-*` tag cannot move the diff base. In CI this list is read from the PR's *base* commit.
export const BASE_TAGS = ['v1-abc-ready-2026-11-26'];
// Areas the contract assigns to someone: a branch without a role (or a fork PR) needs approval to touch any of them.
const MATRIX_AREAS = ['A', 'B', 'C', 'INT', 'CORE', 'SHARED', 'GOV', 'ORCH', 'DESIGN'];

export function classify(path) {
  for (const a of AREAS) {
    if (a.exact?.includes(path)) return a.id;
    if (a.prefixes?.some((p) => path.startsWith(p))) return a.id;
    if (a.patterns?.some((re) => re.test(path))) return a.id;
  }
  if (path.startsWith('audits/')) return 'AUDIT';
  return 'OTHER';
}

export function roleForBranch(branch) {
  if (!branch) return null;
  const b = branch.replace(/^refs\/heads\//, '').replace(/^origin\//, '');
  return ROLES.find((r) => b === r.branch || b.startsWith(`${r.branch}-`)) ?? null;
}

// changes: [{ status: 'A'|'M'|'D'|'R'|'C'|'T', path, oldPath? }]
// auditDirExisted(path) -> true when the path's top-level audits/ entry (a directory, or a file directly under audits/) already
// existed at the base: existing audit history is insert-only, new records go to a new directory.
// Returns { role, results: [{ path, status, area, verdict: 'OK'|'APPROVAL'|'FORBIDDEN', reason }] }
export function evaluate(changes, roleId, { auditDirExisted = () => false, approved = false } = {}) {
  const rules = roleId ? WRITES[roleId] : null;
  const results = [];
  for (const ch of changes) {
    const paths = ch.oldPath && ch.oldPath !== ch.path ? [ch.oldPath, ch.path] : [ch.path];
    for (const p of paths) {
      const area = classify(p);
      let verdict = 'OK';
      let reason = '';
      // Existing audit directories are read-only for everyone (contract §10: "leitura"), including new files inside them;
      // a new record is a new directory.
      if (area === 'AUDIT' && auditDirExisted(p)) {
        verdict = 'FORBIDDEN'; reason = 'diretório de audit existente é só leitura (contrato §10); registre num diretório novo';
      } else if (!rules) {
        // Fail closed: no role (unknown branch name, or a fork PR) means nothing the contract assigns may change unapproved.
        // Outside the matrix a role-less branch may only add new files; changing or removing existing ones needs approval.
        const assigned = MATRIX_AREAS.includes(area) || ch.status !== 'A' || p === ch.oldPath;
        verdict = assigned ? (approved ? 'OK' : 'APPROVAL') : 'OK';
        reason = verdict === 'OK' ? '' : `branch sem papel na matriz (ou PR de fork): ${AREAS.find((a) => a.id === area)?.label ?? 'arquivo existente fora da matriz'} exige aprovação`;
      } else {
        const effective = area === 'AUDIT' || area === 'OTHER' ? 'OTHER_NEW' : area;
        if (rules.own.includes(effective)) verdict = 'OK';
        else if (rules.approval?.includes(effective)) {
          verdict = approved ? 'OK' : 'APPROVAL';
          reason = area === 'CORE'
            ? 'CoachingCore: só por emenda versionada (HISTORICAL_TEST_POLICY §4) com revisão independente'
            : 'contrato compartilhado/governança: só pelo processo do contrato §11';
        } else {
          verdict = 'FORBIDDEN';
          reason = `${roleId} não escreve em ${AREAS.find((a) => a.id === area)?.label ?? 'caminhos fora da matriz'} (contrato §10)`;
        }
      }
      results.push({ path: p, status: ch.status, area, verdict, reason });
    }
  }
  return { role: roleId, results };
}

export function summarize({ results }) {
  const count = (v) => results.filter((r) => r.verdict === v).length;
  return { files: results.length, ok: count('OK'), approval: count('APPROVAL'), forbidden: count('FORBIDDEN') };
}

// Parses `git -c core.quotePath=false diff -z --name-status -M` output (NUL-separated; paths are never quoted or escaped).
export function parseNameStatusZ(text) {
  const t = text.split('\0');
  const out = [];
  for (let i = 0; i < t.length && t[i]; ) {
    const code = t[i][0];
    if (code === 'R' || code === 'C') { out.push({ status: code, oldPath: t[i + 1], path: t[i + 2] }); i += 3; }
    else { out.push({ status: code, path: t[i + 1] }); i += 2; }
  }
  return out;
}

// The top-level entry under audits/ that a path belongs to: `audits/<dir>` for nested paths, the file itself for `audits/<file>`.
export const auditDirOf = (p) => (p.startsWith('audits/') ? p.split('/').slice(0, 2).join('/') : null);

// Tab-separated form, kept for tests and humans.
export function parseNameStatus(text) {
  return text.split('\n').filter(Boolean).map((line) => {
    const parts = line.split('\t');
    const code = parts[0][0];
    if ((code === 'R' || code === 'C') && parts.length >= 3) return { status: code, oldPath: parts[1], path: parts[2] };
    return { status: code, path: parts[1] };
  });
}
