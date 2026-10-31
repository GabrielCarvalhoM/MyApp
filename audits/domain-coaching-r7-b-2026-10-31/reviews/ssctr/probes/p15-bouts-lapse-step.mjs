// SSCTR R7-B probe p15 (read-only): after the familiar bouts lapse or are withdrawn, which threshold step comes first?
// B0-C02 c3: fall back to the threshold ladder as a new family: step 0 at the effort cue, a calibration.
import {reviewed, weekly, review, evaluateProgram, opts, runs, addDays} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report of the last three track sessions'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const BOUTS = {id: 'p15', ...RUN_ONLY, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70}, knownRuns: [TASK], schedule: {strengthDays: [], runDays: [1, 3, 5, 6]}, weeks: 12};
const q = (p, w) => { const s = runs(p, w).find(x => ['QUALITY'].includes(x.role)); return s ? `${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work ? '(' + s.prescription.work.repetitions + 'x' + s.prescription.work.workMinutes + ')' : ''} step=${s.progression?.value} first=${s.prescription.calibration?.firstExposure}` : '-'; };
const st = (p, w) => { const r = p.stateTrace[w]?.run; return r ? `mode=${r.mode} qStep=${r.qualityStep} thrDone=${r.thresholdDone} qDone=${r.qualityDone} lapsed=${!!r.familiarBoutsLapsed}` : '-'; };

for (const breakDays of [4, 18]) {
  console.log(`\n=== every week reviewed through w4 (bouts executed w2-w4), then a ${breakDays}-day nonclinical break from w5 ===`);
  const t = reviewed({...BOUTS, id: 'p15-' + breakDays}, 5);
  for (let w = 0; w < 6; w++) console.log(`w${w} ${t.p.weeks[w].phase} ${st(t.p, w)} | ${q(t.p, w)}`);
  const start = t.p.weeks[5].startDate, end = addDays(start, breakDays - 1);
  let w = 5;
  while (addDays(t.p.weeks[w].startDate, 6) <= end) { weekly(t, w, {keep: () => false}); w++; }
  const day = (Date.parse(addDays(end, 1)) - Date.parse(t.p.weeks[w].startDate)) / 864e5;
  const r = evaluateProgram(t.p, {...review(t.p, w, {day, kind: 'RETURN_AFTER_PAUSE', interruption: {startDate: start, endDate: end, reasonCategory: 'TRAVEL', nonclinical: true}}), actualLedger: t.ledger}, opts);
  console.log(`return reviewed w${w} day ${day}: ${r.action}`);
  for (let k = w; k < 12; k++) console.log(`w${k} ${r.proposal.weeks[k].phase} ${st(r.proposal, k)} | ${q(r.proposal, k)}`);
}
