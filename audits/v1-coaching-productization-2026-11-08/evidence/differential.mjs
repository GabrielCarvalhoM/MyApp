// Read-only differential: the spent R7-D holdout corpus (final2/: H1 39 cases, H2 300 intakes) through two CoachingCore roots, comparing
// per-step decisions (status, action, proposal hash, missing inputs, question kind) and, for H2, the generated program status and hash.
// QRE-V1CP-12: it also hashes every field of every result (fullIdentical counts), so a change outside the summary is visible too.
// It never writes under the repository. Usage: node differential.mjs <baseRoot> <candidateRoot> <outJson>
import path from 'node:path';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const [baseRoot, candRoot, out] = process.argv.slice(2);
if (!baseRoot || !candRoot || !out) { console.error('usage'); process.exit(2); }
const audit = r => path.join(r, 'audits/domain-coaching-r7-d-2026-11-02');
const client = await import(pathToFileURL(path.join(audit(candRoot), 'harness/lib/client-9.mjs')).href);
const A = await client.loadRuntime(path.join(baseRoot, 'CoachingCore'));
const B = await client.loadRuntime(path.join(candRoot, 'CoachingCore'));
const sha = v => createHash('sha256').update(JSON.stringify(v ?? null)).digest('hex').slice(0, 16);
const H1 = JSON.parse(fs.readFileSync(path.join(audit(candRoot), 'final2/R7D_FINAL_HOLDOUT_2.json'), 'utf8'));
const summary = r => ({status: r?.status, action: r?.action, proposal: r?.proposal ? sha(r.proposal.hash ?? r.proposal) : null, missing: (r?.missingInputs ?? []).join('|'), question: r?.question?.kind ?? null, errors: (r?.errors ?? []).filter(e => String(e).startsWith('malformed')).join('|')});
const report = {h1: {cases: 0, steps: 0, differingSteps: 0, fullIdentical: 0, fullDiffering: [], diffs: []}, h2: {intakes: 0, differing: 0, fullIdentical: 0, diffs: []}, generations: {total: 0, fullIdentical: 0}};
for (const kase of H1.cases) {
  const ta = client.runCase(A, kase), tb = client.runCase(B, kase);
  report.h1.cases++;
  const n = Math.max(ta.steps.length, tb.steps.length);
  for (let i = 0; i < n; i++) {
    const a = summary(ta.steps[i]?.result), b = summary(tb.steps[i]?.result);
    report.h1.steps++;
    if (sha(ta.steps[i]?.result) === sha(tb.steps[i]?.result)) report.h1.fullIdentical++; else report.h1.fullDiffering.push(kase.caseId + '#' + (ta.steps[i]?.stepId ?? tb.steps[i]?.stepId));
    if (JSON.stringify(a) !== JSON.stringify(b)) { report.h1.differingSteps++; report.h1.diffs.push({caseId: kase.caseId, step: ta.steps[i]?.stepId ?? tb.steps[i]?.stepId, base: a, candidate: b, baseReason: String(ta.steps[i]?.result?.reason ?? '').slice(0, 220), candidateReason: String(tb.steps[i]?.result?.reason ?? '').slice(0, 220)}); }
  }
  report.generations.total++; if (sha(ta.generation) === sha(tb.generation)) report.generations.fullIdentical++;
  if (sha(ta.generation?.program?.hash) !== sha(tb.generation?.program?.hash)) report.h1.diffs.push({caseId: kase.caseId, step: 'GENERATE', base: ta.generation?.status, candidate: tb.generation?.status});
}
const genPath = path.join(audit(candRoot), 'final2/generated/R7D_GENERATED_FINAL.json');
if (fs.existsSync(genPath)) {
  const H2 = JSON.parse(fs.readFileSync(genPath, 'utf8'));
  const intakes = H2.intakes ?? H2.cases ?? [];
  for (const x of intakes) {
    const input = x.intake ?? x.input ?? x;
    const ga = A.generateProgram(structuredClone(input)), gb = B.generateProgram(structuredClone(input));
    report.h2.intakes++; if (sha(ga) === sha(gb)) report.h2.fullIdentical++;
    const a = {status: ga.status, hash: ga.program?.hash ?? null, unc: (ga.uncertainty ?? []).map(u => u.field).join('|')}, b = {status: gb.status, hash: gb.program?.hash ?? null, unc: (gb.uncertainty ?? []).map(u => u.field).join('|')};
    if (JSON.stringify(a) !== JSON.stringify(b)) { report.h2.differing++; if (report.h2.diffs.length < 40) report.h2.diffs.push({id: x.id ?? x.caseId ?? input?.athlete?.id, base: a, candidate: b}); }
  }
}
fs.writeFileSync(out, JSON.stringify(report, null, 1));
console.log(JSON.stringify({h1: {cases: report.h1.cases, steps: report.h1.steps, differingSteps: report.h1.differingSteps, fullIdentical: report.h1.fullIdentical}, generations: report.generations, h2: {intakes: report.h2.intakes, differing: report.h2.differing, fullIdentical: report.h2.fullIdentical}}));
