#!/usr/bin/env node
// Ownership guard: does this branch change only the paths its front owns? (contract §10, rev. 2)
//
//   node tools/orchestration/guard.mjs [--branch <name>] [--head <ref>] [--base <ref>] [--approved] [--fork] [--json]
//
// Defaults: --head HEAD, --branch = current branch (or $GUARD_BRANCH), --base = newest *allowlisted* base tag (BASE_TAGS in
// lib/ownership.mjs) merged into head. The diff is `base...head`. --fork (or GUARD_FORK=1): the change comes from a fork, so the
// branch name is not trusted and no role applies (fail closed). In CI the guard code itself is taken from the PR's base commit.
// Exit 0: clean. Exit 1: forbidden path or unapproved contract/core/governance change. Exit 2: usage or missing dependency.
import { parseArgs } from 'node:util';
import { auditDirOf, evaluate, parseNameStatusZ, roleForBranch, summarize, BASE_TAGS } from './lib/ownership.mjs';
import { git, refExists, repoRoot, MissingDependency } from './lib/sh.mjs';

export function allowlistedBase(head, cwd) {
  const merged = new Set(git(['tag', '--merged', head], { cwd }).out.split('\n'));
  // BASE_TAGS is in publication order; the newest one the head contains wins.
  return [...BASE_TAGS].reverse().find((t) => merged.has(t)) ?? null;
}

function main() {
  const { values } = parseArgs({
    options: {
      branch: { type: 'string' }, head: { type: 'string', default: 'HEAD' }, base: { type: 'string' },
      approved: { type: 'boolean', default: false }, fork: { type: 'boolean', default: false }, json: { type: 'boolean', default: false },
    },
  });
  const cwd = repoRoot();
  const head = values.head;
  if (!refExists(head, cwd)) return fail(`ref inexistente: ${head}`);
  const branch = values.branch || process.env.GUARD_BRANCH
    || git(['rev-parse', '--abbrev-ref', head], { cwd, allowFail: true }).out;
  const base = values.base || allowlistedBase(head, cwd);
  if (!base) return fail(`nenhuma tag de base aceita (${BASE_TAGS.join(', ')}) é ancestral de ${head}; em CI: checkout com fetch-depth 0`);
  if (!refExists(base, cwd)) return fail(`base inexistente: ${base}`);
  const approved = values.approved || process.env.GUARD_APPROVED === '1';
  const fork = values.fork || process.env.GUARD_FORK === '1';

  const role = fork ? null : roleForBranch(branch);
  const changes = parseNameStatusZ(git(['-c', 'core.quotePath=false', 'diff', '-z', '--name-status', '-M', `${base}...${head}`], { cwd }).out);
  const auditDirs = new Set(git(['ls-tree', '--name-only', base, 'audits/'], { cwd }).out.split('\n').filter(Boolean));
  const evaluation = evaluate(changes, role?.id ?? null, { auditDirExisted: (p) => auditDirs.has(auditDirOf(p)), approved });
  const sum = summarize(evaluation);
  const failed = evaluation.results.filter((r) => r.verdict !== 'OK');

  if (values.json) {
    console.log(JSON.stringify({ branch, fork, role: role?.id ?? null, base, head, approved, summary: sum, violations: failed }, null, 2));
  } else {
    console.log(`guard: branch=${branch}${fork ? ' (fork: nome não confiável)' : ''} papel=${role?.label ?? '(nenhum)'} base=${base} head=${head}${approved ? ' (aprovado)' : ''}`);
    console.log(`guard: ${sum.files} caminhos alterados · ${sum.ok} OK · ${sum.approval} exigem aprovação · ${sum.forbidden} proibidos`);
    for (const r of failed) console.log(`  ${r.verdict.padEnd(9)} ${r.status} ${r.path} — ${r.reason}`);
    if (failed.some((r) => r.verdict === 'APPROVAL')) {
      console.log('guard: só entra com a decisão registrada (contrato §11 / emenda) e o rótulo `governance:approved` aplicado depois do último commit do PR.');
    }
  }
  process.exitCode = failed.length ? 1 : 0;
}

function fail(msg) {
  console.error(`guard: ${msg}`);
  process.exitCode = 2;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('guard.mjs')) {
  try { main(); } catch (e) {
    console.error(`guard: ${e instanceof MissingDependency ? e.message : e.stack || e}`);
    process.exitCode = 2;
  }
}
