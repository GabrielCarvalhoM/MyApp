// Q03 (QE reviewer-owned; class D, brief §13): R6-H35 on the tree QE_ROOT, step by step, with the run rows and the run states the decisions
// read, to judge whether QUALITY (not) being released in week index 5 follows from "unreported/unexecuted must not automatically earn
// progression". Also a control: the same intake with weeks 0-3 reported as executed (session by session, no review), then the H35 steps.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
const ROOT = process.env.QE_ROOT ? path.resolve(process.env.QE_ROOT) : path.resolve(import.meta.dirname, '../../../CoachingCore');
const imp = p => import(pathToFileURL(path.join(ROOT, p)).href);
const R = await imp('src/r6-index.mjs'), A = await imp('src/r6-adaptation.mjs'), {devAuthority} = await imp('r6/fixtures/dev-authority.mjs');
// The holdout runner and corpus are not bound by the freeze; they are read from the live CoachingCore (identical files on both trees' callers).
const LIVE = path.resolve(import.meta.dirname, '../../../CoachingCore');
const H = await import(pathToFileURL(path.join(LIVE, 'scripts/evaluate-holdout-r6.mjs')).href);
const opts = {authority: devAuthority()};
const corpus = JSON.parse(fs.readFileSync(path.join(LIVE, 'r6/holdout/R6_INDEPENDENT_HOLDOUT.json'), 'utf8'));
const item = (corpus.cases ?? corpus).find(c => c.caseId === 'R6-H35');
const runRows = (p, w) => p.weeks[w]?.sessions.filter(s => s.prescription && s.status !== 'SKIPPED' && s.sport === 'RUN').map(s => `${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ':' + s.progression.dimension + '=' + s.progression.value : ''}`).join(' ');
const pick = st => st && {mode: st.mode, easy: st.easy, long: st.long, qualityStep: st.qualityStep, easyWeeksDone: st.easyWeeksDone, qualityNeeds: st.qualityNeeds, qualityDone: st.qualityDone};
function trace(prefill) {
  const g = R.generateProgram(item.intake, opts); let p = g.program, ledger = [], model = null; const out = {rowsAtStart: [0, 1, 2, 3, 4, 5, 6].map(w => `w${w} ${runRows(p, w)}`), steps: []};
  if (prefill) { // weeks 0-3 reported as executed, one report per day of sessions at 21:00 local (-03:00), no review closes them
    for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) { const ss = p.weeks[w].sessions.filter(s => s.prescription && s.day === d); if (!ss.length) continue;
      const day = new Date(Date.parse(p.weeks[w].startDate + 'T00:00:00Z') + d * 864e5).toISOString().slice(0, 10);
      const obs = ss.map(s => H.nativeObservation(p, s, {completed: true, actualStimulus: 'AS_PRESCRIBED', response: {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'}}, 'qe-h35pre'));
      const r = R.evaluateProgram(p, {version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${day}T21:00:00-03:00`, weekIndex: w, event: {id: `qe-h35pre-${w}-${d}`, kind: 'WEEKLY_REVIEW'}, eligibility: {...item.steps[0].review.eligibility, assessedAt: day}, observations: obs, actualLedger: ledger, athleteModel: model}, opts);
      ledger = r.actualLedger ?? ledger; model = r.updatedModel ?? model; if (r.proposal) p = r.proposal; }
  }
  for (const [i, step] of item.steps.entries()) {
    const review = structuredClone(step.review), observations = [];
    let err = null;
    try { for (const f of step.observationFacts ?? []) { const {session} = H.resolveSession(p, f, 'Observation fact'); observations.push(H.nativeObservation(p, session, f, item.caseId)); } } catch (e) { err = e.message; }
    if (err) { out.steps.push({step: i, weekIndex: review.weekIndex, error: err, rows: runRows(p, review.weekIndex)}); break; }
    const H0 = A.historicalStateOf(p, {asOf: review.asOf, actualLedger: ledger}, opts);
    const r = R.evaluateProgram(p, {...review, observations, actualLedger: ledger, athleteModel: model}, opts);
    out.steps.push({step: i, weekIndex: review.weekIndex, rowsBefore: runRows(p, review.weekIndex), historyRunBefore: pick(H0?.state?.run), status: r.status, action: r.action, gates: r.gates && Object.fromEntries(Object.entries(r.gates).filter(([k]) => ['EASY', 'LONG', 'QUALITY'].includes(k))), nextRows: r.proposal ? runRows(r.proposal, review.weekIndex + 1) : runRows(p, review.weekIndex + 1), nextPlanRun: pick((r.proposal ?? p).stateTrace[review.weekIndex + 1]?.run)});
    ledger = r.actualLedger ?? ledger; model = r.updatedModel ?? model; if (r.proposal) p = r.proposal;
  }
  return out;
}
console.log(JSON.stringify({probe: 'qe-r7ada-Q03-r6h35', root: path.relative(path.resolve(import.meta.dirname, '../../..'), ROOT), asInCorpus: trace(false), weeks0to3Reported: trace(true)}, null, 1));
