// SSCTR R7-B probe p16 (read-only): the short-break path of p15, followed by actual weekly reviews (not the projection):
// which threshold step and calibration flag does the first real threshold session after the lapsed bouts carry?
import {reviewed, weekly, review, evaluateProgram, opts, runs, addDays} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report of the last three track sessions'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const BOUTS = {id: 'p16', ...RUN_ONLY, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70}, knownRuns: [TASK], schedule: {strengthDays: [], runDays: [1, 3, 5, 6]}, weeks: 12};
const q = (p, w) => { const s = runs(p, w).find(x => x.role === 'QUALITY'); return s ? `${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work ? '(' + s.prescription.work.repetitions + 'x' + s.prescription.work.workMinutes + ')' : ''} step=${s.progression?.value} first=${s.prescription.calibration?.firstExposure}` : 'no quality: ' + runs(p, w).map(s => s.role + ':' + s.prescription.durationMinutes + (s.easedFor ? '(eased)' : '')).join(' '); };
const t = reviewed({...BOUTS}, 5);
const start = t.p.weeks[5].startDate, end = addDays(start, 3);
const r = evaluateProgram(t.p, {...review(t.p, 5, {day: 4, kind: 'RETURN_AFTER_PAUSE', interruption: {startDate: start, endDate: end, reasonCategory: 'TRAVEL', nonclinical: true}}), actualLedger: t.ledger}, opts);
t.p = r.proposal; t.ledger = r.actualLedger ?? t.ledger;
console.log('return', r.action, '| w5 rest of week:', q(t.p, 5));
weekly(t, 5, {keep: s => s.date > addDays(start, 4)});
for (let w = 6; w < 10; w++) { console.log(`w${w} ${t.p.weeks[w].phase} start qStep=${t.p.stateTrace[w].run.qualityStep} thrDone=${t.p.stateTrace[w].run.thresholdDone} | ${q(t.p, w)}`); weekly(t, w); }
