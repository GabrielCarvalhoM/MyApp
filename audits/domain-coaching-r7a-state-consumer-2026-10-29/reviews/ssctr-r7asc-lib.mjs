// SSCTR R7ASC-SSCTR-r1 probe helpers (own). Loads the runtime that SSCTR_CC selects (default: the live tree, STATE-MODEL-CONSUMER-FREEZE-1)
// through its public entry points only (generateProgram, evaluateProgram, historicalStateOf when the tree exports it), and builds synthetic
// athletes, reports and reviews the same way my earlier probes did. Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const CC = process.env.SSCTR_CC ? path.resolve(process.env.SSCTR_CC) : path.resolve(import.meta.dirname, '../../../CoachingCore');
export const TREE = process.env.SSCTR_CC ? path.relative(path.resolve(import.meta.dirname, '../../..'), CC).replace(/\\/g, '/') : 'CoachingCore (live)';
const load = rel => import(pathToFileURL(path.join(CC, rel)).href);
const IDX = await load('src/r6-index.mjs'), ADAPT = await load('src/r6-adaptation.mjs'), DEV = await load('r6/fixtures/dev-authority.mjs');
export const {generateProgram, evaluateProgram} = IDX;
export const historicalStateOfOrNull = ADAPT.historicalStateOf ?? null;
export const opts = {authority: DEV.devAuthority()};
export const policy = opts.authority.policy, DOSES = policy.operational.strength.goalDoses;
export const loadProfiles = async () => load('r6/fixtures/profiles.mjs');

export const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const elig = d => ({status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false});
export const OK = {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'};
export const K = (id, sets, reps, kg, convention = 'TOTAL') => ({id, sets, reps, load: {value: kg, unit: 'KG', convention}, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-10-29'});
export const intake = ({id, goal = 'STRENGTH', known, recent = {}, schedule = {}, run = 'PERFORMANCE', runExperience = 'INTERMEDIATE', strengthExperience = 'INTERMEDIATE'}) => ({
  version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: '2026-11-01', startDate: '2026-11-02', weeks: 16, learningConsent: true,
  athlete: {id, ageEligible: true, eligibility: elig('2026-11-01'), goals: {run, strength: goal}, runExperience, strengthExperience,
    recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2, ...recent}, equipment: ['DUMBBELLS', 'BENCH', 'BARBELL', 'RACK'],
    knownExercises: known, exerciseRotationPreference: 'FIXED'},
  schedule: {runDays: [1, 3, 6], strengthDays: [2, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 100, ...schedule}});

let N = 0;
export const at = (p, w, day, hour, x = {}) => { const d = addDays(p.weeks[w].startDate, day); return {version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${d}T${hour}Z`, weekIndex: w, event: {id: `ssctr-r7asc-${w}-${x.kind ?? 'WEEKLY_REVIEW'}-${N++}`, kind: x.kind ?? 'WEEKLY_REVIEW'}, eligibility: elig(d), observations: [], ...x}; };
/** A report of session s as prescribed; kg(id,e) picks a logged load, set(id,x,e) edits each set; observedAt overrides the execution clock. */
export function obs(p, s, {kg = null, set = null, observedAt = null, extra = {}} = {}) {
  const pr = s.prescription, a = {completed: true, minutes: pr.durationMinutes};
  if (pr.modality === 'STRENGTH') a.exercises = pr.exercises.map(e => ({id: e.id, sets: Array.from({length: e.sets}, () => {
    const x = {load: e.load.mode === 'BODYWEIGHT' ? {value: 0, unit: 'BODYWEIGHT', convention: 'BODYWEIGHT'} : {value: kg?.(e.id, e) ?? (e.load.mode === 'KNOWN' ? e.load.value : e.load.ceiling?.value ?? 20), unit: 'KG', convention: e.load.convention}, reps: e.reps, rir: e.rir};
    return set ? set(e.id, x, e) : x; })}));
  return {eventId: `ssctr-r7asc-o-${N++}`, athleteId: p.athleteId, sessionId: s.id, observedAt: observedAt ?? `${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`, actual: a, response: {...OK}, ...extra};
}
export const live = s => s && s.prescription && s.status !== 'SKIPPED';
export const WED = s => s.sport === 'STRENGTH' && s.day === 2, SAT = s => s.sport === 'STRENGTH' && s.day === 5;
/** One decision; the record and the proposal carry over (a refused decision leaves the program as it was and is reported). */
export const step = (t, review) => { const r = evaluateProgram(t.p, {...review, actualLedger: t.ledger}, opts); t.ledger = r.actualLedger ?? t.ledger; if (r.proposal) t.p = r.proposal; t.last = r; (t.log ??= []).push(`${review.event.kind}@${review.asOf} ${r.status}/${r.action}`); return r; };
export const weekly = (t, w, keep = () => true, o = {}, hour = '21:00:00') => step(t, at(t.p, w, 6, hour, {observations: t.p.weeks[w].sessions.filter(s => live(s) && keep(s)).map(s => obs(t.p, s, typeof o === 'function' ? o(s) : o))}));
/** Each session reported on its own evening and Sunday's on Monday 06:00: the week itself is never reviewed. */
export const perDay = (t, w, keep = () => true, o = {}) => {
  for (const s of t.p.weeks[w].sessions.filter(s => live(s) && keep(s) && s.day < 6)) step(t, at(t.p, w, s.day, '21:00:00', {observations: [obs(t.p, s, typeof o === 'function' ? o(s) : o)]}));
  step(t, at(t.p, w + 1, 0, '06:00:00', {observations: t.p.weeks[w].sessions.filter(s => live(s) && keep(s) && s.day === 6).map(s => obs(t.p, s, typeof o === 'function' ? o(s) : o))}));
};
export const gen = o => { const g = generateProgram(intake(o), opts); if (!g.program) throw Error(`${o.id}: ${g.status} ${g.reason}`); return {p: g.program, ledger: []}; };
export const copy = t => ({p: structuredClone(t.p), ledger: structuredClone(t.ledger), log: [...(t.log ?? [])]});
export const brk = (startDate, endDate, extra = {}) => ({kind: 'RETURN_AFTER_PAUSE', interruption: {days: Math.round((Date.parse(endDate) - Date.parse(startDate)) / 864e5) + 1, startDate, endDate, reasonCategory: 'TRAVEL', reason: 'Work travel', ...extra}});
export const history = (t, w, day = 0, hour = '06:00:00') => historicalStateOfOrNull ? historicalStateOfOrNull(t.p, {asOf: `${addDays(t.p.weeks[w].startDate, day)}T${hour}Z`, actualLedger: t.ledger}, opts) : null;
/** History's resumable exercise (planner terms) and its reported facts, or a marker when the tree does not export the reader. */
export const histEx = (t, w, id, day = 0, hour = '06:00:00') => {
  const H = history(t, w, day, hour); if (!H) return 'historicalStateOf not exported by this tree';
  const s = H.state?.strength?.exercises?.[id] ?? null, f = H.strength?.exercises?.[id] ?? null;
  return s || f ? {mode: s?.mode ?? f?.mode ?? null, load: s?.load ?? null, reps: s?.reps ?? null, sets: s?.sets ?? null, loadTick: s?.loadTick ?? f?.earnedProgress?.loadTick ?? null, stepEarned: f?.earnedProgress?.stepEarned ?? null, lastExecutedLoad: f?.lastExecutedLoad ?? null, lastExecutedReps: f?.lastExecutedReps ?? null, returnStep: f?.returnStep ?? null} : null;
};
/** The stored start of week w (the plan's state: PlanningProjection for a projected week). */
export const projEx = (t, w, id) => { const s = t.p.stateTrace?.[w]?.strength?.exercises?.[id]; return s ? {mode: s.mode ?? null, load: s.load ?? null, reps: s.reps ?? null, sets: s.sets ?? null, loadTick: s.loadTick ?? null} : null; };
export const rowsOf = (t, w, ids = null, pred = () => true) => (t.p.weeks[w]?.sessions ?? []).filter(s => live(s) && s.sport === 'STRENGTH' && pred(s)).flatMap(s => s.prescription.exercises.filter(e => !ids || ids.includes(e.id)).map(e => ({
  week: w, date: s.date, id: e.id, sets: e.sets, reps: e.reps, rir: e.rir, mode: e.load.mode, value: Number.isFinite(e.load.value) ? e.load.value : null, ceiling: e.load.ceiling?.value ?? null, kind: e.exposure?.kind ?? null, phase: t.p.weeks[w].phase ?? null})));
export const rowText = r => `w${r.week} ${r.date} ${r.id} ${r.sets}x${r.reps}@${r.rir} ${r.mode}${r.value !== null ? ' ' + r.value : ''}${r.ceiling !== null ? ' ceil ' + r.ceiling : ''}${r.kind ? ' ' + r.kind : ''}${r.phase ? ' [' + r.phase + ']' : ''}`;
export const runRows = (t, w) => (t.p.weeks[w]?.sessions ?? []).filter(s => live(s) && s.sport === 'RUN').map(s => `${s.date} ${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ' ' + s.progression.dimension + '=' + s.progression.value : ''}`);
export const gateOf = (r, id) => r?.gates?.[id] ?? r?.decision?.gates?.[id] ?? null;
