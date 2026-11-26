#!/usr/bin/env node
// Ownership guard: does this branch change only the paths its front owns? (contract §10, rev. 2)
//
//   node tools/orchestration/guard.mjs [--branch <name>] [--head <ref>] [--base <ref>] [--approved] [--json]
//
// Defaults: --head HEAD, --branch = current branch (or $GUARD_BRANCH), --base = newest v1-abc-* tag merged into head.
// The diff is `base...head` (from the merge base), so a front that merged a newer base tag is measured from it.
// Exit 0: clean. Exit 1: forbidden path or unapproved contract/core change. Exit 2: usage or missing dependency.
import { parseArgs } from 'node:util';
import { evaluate, parseNameStatus, roleForBranch, summarize, BASE_TAG_GLOB } from './lib/ownership.mjs';
import { git, baseTagFor, refExists, repoRoot, MissingDependency } from './lib/sh.mjs';

function main() {
  const { values } = parseArgs({
    options: {
      branch: { type: 'string' }, head: { type: 'string', default: 'HEAD' }, base: { type: 'string' },
      approved: { type: 'boolean', default: false }, json: { type: 'boolean', default: false },
    },
  });
  const cwd = repoRoot();
  const head = values.head;
  if (!refExists(head, cwd)) return fail(`ref inexistente: ${head}`);
  const branch = values.branch || process.env.GUARD_BRANCH
    || git(['rev-parse', '--abbrev-ref', head], { cwd, allowFail: true }).out;
  const base = values.base || baseTagFor(head, cwd, BASE_TAG_GLOB);
  if (!base) return fail(`nenhuma tag ${BASE_TAG_GLOB} é ancestral de ${head}; informe --base (em CI: checkout com fetch-depth 0 e tags)`);
  if (!refExists(base, cwd)) return fail(`base inexistente: ${base}`);
  const approved = values.approved || process.env.GUARD_APPROVED === '1';

  const role = roleForBranch(branch);
  const diff = git(['diff', '--name-status', '-M', `${base}...${head}`], { cwd }).out;
  const changes = parseNameStatus(diff);
  let auditsAtBase;
  const existedAtBase = (p) => {
    auditsAtBase ??= new Set(git(['ls-tree', '-r', '--name-only', base, '--', 'audits/'], { cwd }).out.split('\n'));
    return auditsAtBase.has(p);
  };
  const evaluation = evaluate(changes, role?.id ?? null, { existedAtBase, approved });
  const sum = summarize(evaluation);
  const failed = evaluation.results.filter((r) => r.verdict !== 'OK');

  if (values.json) {
    console.log(JSON.stringify({ branch, role: role?.id ?? null, base, head, approved, summary: sum, violations: failed }, null, 2));
  } else {
    console.log(`guard: branch=${branch} papel=${role?.label ?? '(nenhum)'} base=${base} head=${head}${approved ? ' (aprovado)' : ''}`);
    console.log(`guard: ${sum.files} caminhos alterados · ${sum.ok} OK · ${sum.approval} exigem aprovação · ${sum.forbidden} proibidos`);
    if (!role) console.log('guard: branch sem papel na matriz; só CoachingCore e audits históricos são verificados');
    for (const r of failed) console.log(`  ${r.verdict.padEnd(9)} ${r.status} ${r.path} — ${r.reason}`);
    if (failed.some((r) => r.verdict === 'APPROVAL')) {
      console.log('guard: mudança de contrato/governança/CoachingCore só entra com a decisão registrada e o rótulo `governance:approved` no PR.');
    }
  }
  process.exitCode = failed.length ? 1 : 0;
}

function fail(msg) {
  console.error(`guard: ${msg}`);
  process.exitCode = 2;
}

try { main(); } catch (e) {
  console.error(`guard: ${e instanceof MissingDependency ? e.message : e.stack || e}`);
  process.exitCode = 2;
}
