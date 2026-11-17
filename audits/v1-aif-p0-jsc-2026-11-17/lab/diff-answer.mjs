// Field-level diff of a device reply (the "<journey>-step<N>-reply.json" attachments of EquivalenceTests, written for every step that is not
// IDENTICAL) against the oracle's full answer: stored for J5, regenerated natively for P16 by replaying the fixture.
// QRE-P0-05 acceptance rule for EXPLAINED_LIBM: every differing leaf is inside a runForecast block and is either one of its own hashes
// (hash, inputDigest) or a number within 1e-12 relative of the oracle's. Anything else is DIVERGED (exit 1). Even then it is a localization,
// not a proof of cause, and acceptance stays an explicit decision (P0_REPORT.md §4.2).
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/diff-answer.mjs <j5|p16> <step> <reply.json>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const FIX = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ios', 'Tests', 'P0HostTests', 'Fixtures');
const [journey, stepArg, file] = process.argv.slice(2), step = Number(stepArg);
let oracle;
if (journey === 'j5') oracle = JSON.parse(fs.readFileSync(path.join(FIX, 'j5-answers.json'), 'utf8'))[step];
else {
  const L = await import('../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs');
  const fx = JSON.parse(fs.readFileSync(path.join(FIX, `${journey}.json`), 'utf8')), c = L.createClient();
  for (let i = 0; i <= step; i++) { const s = fx.steps[i]; oracle = s.kind === 'ONBOARD' ? c.onboard(JSON.parse(s.intakeJSON)) : c.review(s.kind, s.asOf, JSON.parse(s.factsJSON), { eventId: s.eventId }); }
}
const device = JSON.parse(fs.readFileSync(file, 'utf8')).answer;
const out = [];
(function d(a, b, p) {
  if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) d(a[k], b[k], p + '/' + k); return; }
  if (a !== b) out.push({ path: p, oracle: a, device: b, relative: typeof a === 'number' && typeof b === 'number' && a !== 0 ? Math.abs(b - a) / Math.abs(a) : null });
})(oracle, device, '');
const explained = x => /\/runForecast\//.test(x.path) && (/\/(hash|inputDigest)$/.test(x.path) || (x.relative !== null && x.relative <= 1e-12));
const verdict = out.length === 0 ? 'IDENTICAL' : out.every(explained) ? 'EXPLAINED_LIBM' : 'DIVERGED';
console.log(JSON.stringify({ journey, step, verdict, differingLeaves: out.length, unexplained: out.filter(x => !explained(x)), leaves: out }, null, 1));
process.exit(verdict === 'DIVERGED' ? 1 : 0);
