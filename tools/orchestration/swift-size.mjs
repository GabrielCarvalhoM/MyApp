#!/usr/bin/env node
// Hand-written Swift file size limit (specs/v1/quality/CODE_AND_ARCHITECTURE.md §5).
//
//   node tools/orchestration/swift-size.mjs [--ref <commit>] [--json]
//
// Default limit 350 lines, warning from 300. Files listed in swift-size-baseline.json are legacy violations inventoried on
// 2026-11-26: they are reported but never fail, so integrating a front is not blocked by debt recorded before the rule existed.
// They leave the list when they are split. A file may carry a justified exception in its first 10 lines:
//   // swift-size-exception: <reason>
// Generated sources (`*.generated.swift`, `Generated/`, `.build/`, `DerivedData/`) are not counted.
// Exit: 0 ok (warnings allowed) · 1 a non-baseline file above the limit · 2 usage.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { git, repoRoot } from './lib/sh.mjs';

export const LIMIT = 350;
export const WARN = 300;
const EXCLUDED = [/\.generated\.swift$/, /(^|\/)Generated\//, /(^|\/)\.build\//, /(^|\/)DerivedData\//];

export function lineCount(text) {
  if (!text) return 0;
  const n = text.split('\n').length;
  return text.endsWith('\n') ? n - 1 : n;
}

export function exceptionReason(text) {
  const head = text.split('\n').slice(0, 10).join('\n');
  const m = head.match(/^\s*\/\/\s*swift-size-exception:\s*(\S.*)$/m);
  return m ? m[1].trim() : null;
}

// files: [{ path, text }]; baseline: { path: linesWhenInventoried }
export function check(files, baseline = {}) {
  const rows = [];
  for (const { path, text } of files) {
    if (!path.endsWith('.swift') || EXCLUDED.some((re) => re.test(path))) continue;
    const lines = lineCount(text);
    if (lines <= WARN) continue;
    const exception = exceptionReason(text);
    let verdict;
    if (lines <= LIMIT) verdict = 'WARN';
    else if (exception) verdict = 'EXCEPTION';
    else if (path in baseline) verdict = 'LEGACY';
    else verdict = 'FAIL';
    rows.push({ path, lines, verdict, exception, baseline: baseline[path] ?? null });
  }
  rows.sort((a, b) => b.lines - a.lines);
  return { rows, failed: rows.some((r) => r.verdict === 'FAIL') };
}

function main(argv) {
  const ref = argv.includes('--ref') ? argv[argv.indexOf('--ref') + 1] : 'HEAD';
  if (!ref) { console.error('uso: swift-size.mjs [--ref <commit>] [--json]'); process.exit(2); }
  const root = repoRoot();
  const baseline = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'swift-size-baseline.json'), 'utf8')).files;
  const paths = git(['-c', 'core.quotePath=false', 'ls-tree', '-r', '-z', '--name-only', ref, '--', 'ios'], { cwd: root }).out
    .split('\0').filter((p) => p.endsWith('.swift'));
  // Untrimmed blob bytes (the shared helper trims output, which would drop leading/trailing blank lines from the count).
  const show = (path) => spawnSync('git', ['show', `${ref}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout;
  const files = paths.map((path) => ({ path, text: show(path) }));
  const { rows, failed } = check(files, baseline);
  if (argv.includes('--json')) { console.log(JSON.stringify({ ref, limit: LIMIT, warn: WARN, rows, failed }, null, 2)); process.exit(failed ? 1 : 0); }
  const label = { WARN: 'aviso (>300)', LEGACY: 'legado inventariado', EXCEPTION: 'exceção justificada', FAIL: 'ACIMA DO LIMITE' };
  for (const r of rows) console.log(`${String(r.lines).padStart(5)}  ${label[r.verdict].padEnd(20)} ${r.path}${r.exception ? `  (${r.exception})` : ''}`);
  console.log(`swift-size: ${paths.length} arquivos Swift em ${ref} · limite ${LIMIT} · ${rows.filter((r) => r.verdict === 'FAIL').length} acima do limite fora do baseline`);
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
