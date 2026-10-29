// QE reviewer-owned probe scaffolding (R7A-DECISION-AUTHORITY-FREEZE-1). Read-only use of a CoachingCore tree through its public entry points.
// QE_ROOT selects the tree (default: the live CoachingCore). Same synthetic intake and review shapes as the predecessor QE judge's
// qe-r7asc-lib.mjs, so cells stay comparable. History is read on the record as evaluateProgram returns it. Writes nothing.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const NEAR = path.resolve(import.meta.dirname, '../../../CoachingCore');
export const ROOT = process.env.QE_ROOT ? path.resolve(process.env.QE_ROOT) : NEAR;
export const TREE = path.relative(path.resolve(import.meta.dirname, '../../..'), ROOT).split(path.sep).join('/');
const imp = p => import(pathToFileURL(path.join(ROOT, p)).href);
export const R = await imp('src/r6-index.mjs'), A = await imp('src/r6-adaptation.mjs'), PG = await imp('src/r6-program.mjs'), V = await imp('src/value.mjs');
const {devAuthority} = await imp('r6/fixtures/dev-authority.mjs');
export const opts = {authority: devAuthority()};
export const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const elig = d => ({status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false});
export const OK = {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'};
export const K = (id, sets, reps, kg, convention = 'TOTAL') => ({id, sets, reps, load: {value: kg, unit: 'KG', convention}, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-10-29'});
export const WJ = {athlete: {goals: {run: 'REGULAR', strength: 'GENERAL'}, runExperience: 'NONE', strengthExperience: 'NOVICE', recent: {runDaysPerWeek: 0, runMinutesPerWeek: 0, strengthDaysPerWeek: 0}, knownExercises: []}, schedule: {runDays: [1, 3, 6], strengthDays: [2, 5], runMinutes: 30, strengthMinutes: 30, longRunDay: 6, longRunMinutes: 30}};
export const intake = ({id, schedule = {}, athlete = {}, weeks = 16}) => ({version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: '2026-11-01', startDate: '2026-11-02', weeks, learningConsent: true,
  athlete: {id, ageEligible: true, eligibility: elig('2026-11-01'), goals: {run: 'PERFORMANCE', strength: 'STRENGTH'}, runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2}, equipment: ['DUMBBELLS', 'BENCH', 'BARBELL', 'RACK'], knownExercises: [K('back-squat', 3, 5, 80), K('db-bench-press', 3, 8, 18, 'PER_HAND')], exerciseRotationPreference: 'FIXED', ...athlete},
  schedule: {runDays: [1, 3, 6], strengthDays: [2, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 100, ...schedule}});
let N = 0; export const uid = p => `${p}-${N++}`; export const resetIds = () => { N = 0; };
export const at = (p, w, day, hour, x = {}) => { const d = addDays(p.weeks[w].startDate, day); return {version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${d}T${hour}Z`, weekIndex: w, event: {id: uid(`qe7da-${w}-${x.kind ?? 'WEEKLY_REVIEW'}`), kind: x.kind ?? 'WEEKLY_REVIEW'}, eligibility: elig(d), observations: [], ...x}; };
/** A report of session s as prescribed. kg(id,e) picks a logged load; set(id,x,e) edits each set; noDetails drops exercises; drop removes ids; sets(id,e) forces a count; reps(id,e) forces reps. */
export function obs(p, s, {kg = null, set = null, actual = null, noDetails = false, only = null, drop = null, sets = null, reps = null, response = null, minutes = null} = {}) {
  const pr = s.prescription, a = {completed: true, minutes: minutes ?? pr.durationMinutes};
  if (pr.modality === 'STRENGTH' && !noDetails) a.exercises = pr.exercises.filter(e => (!only || only.includes(e.id)) && (!drop || !drop.includes(e.id))).map(e => ({id: e.id, sets: Array.from({length: sets?.(e.id, e) ?? e.sets}, () => { const x = {load: e.load.mode === 'BODYWEIGHT' ? {value: 0, unit: 'BODYWEIGHT', convention: 'BODYWEIGHT'} : {value: kg?.(e.id, e) ?? (e.load.mode === 'KNOWN' ? e.load.value : 20), unit: 'KG', convention: e.load.convention}, reps: reps?.(e.id, e) ?? e.reps, rir: e.rir}; return set ? set(e.id, x, e) : x; })}));
  return {eventId: uid('qe7da-o'), athleteId: p.athleteId, sessionId: s.id, observedAt: `${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`, actual: actual ?? a, response: response ?? {...OK}};
}
export const evaluate = (t, review) => R.evaluateProgram(t.p, {...review, actualLedger: t.ledger}, opts);
export const step = (t, review, {allow = false} = {}) => { const r = evaluate(t, review); if (!allow && ['UNSUPPORTED', 'HOLD'].includes(r.status)) throw Error(`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors ?? '')}`); t.ledger = r.actualLedger ?? t.ledger; if (r.proposal) t.p = r.proposal; t.last = r; return r; };
export const live = s => s.prescription && s.status !== 'SKIPPED';
export const SAT = s => s.sport === 'STRENGTH' && s.day === 5, WED = s => s.sport === 'STRENGTH' && s.day === 2, RUN = s => s.sport === 'RUN', STR = s => s.sport === 'STRENGTH';
export const weekly = (t, w, keep = () => true, o = {}, hour = '21:00:00') => step(t, at(t.p, w, 6, hour, {observations: t.p.weeks[w].sessions.filter(s => live(s) && keep(s)).map(s => obs(t.p, s, typeof o === 'function' ? o(s) : o))}));
export const gen = o => { const g = R.generateProgram(intake(o), opts); if (!g.program) throw Error(`${o.id}: ${g.status} ${g.reason}`); return {p: g.program, ledger: []}; };
export const start = (id, weeks, o = {}) => { const t = gen({id, ...o}); for (let w = 0; w < weeks; w++) weekly(t, w); return t; };
export const copy = t => ({p: structuredClone(t.p), ledger: structuredClone(t.ledger)});
export const brk = (startDate, endDate, extra = {}) => ({kind: 'RETURN_AFTER_PAUSE', interruption: {days: Math.round((Date.parse(endDate) - Date.parse(startDate)) / 864e5) + 1, startDate, endDate, reasonCategory: 'TRAVEL', reason: 'Work travel', ...extra}});
export const history = (t, w, day = 0, hour = '06:00:00') => A.historicalStateOf(t.p, {asOf: `${addDays(t.p.weeks[w].startDate, day)}T${hour}Z`, actualLedger: t.ledger}, opts);
export const historyAt = (t, asOf) => A.historicalStateOf(t.p, {asOf, actualLedger: t.ledger}, opts);
export const hex = (H, id) => H?.strength?.exercises?.[id] ?? null;
/** Comparable view of an exercise in HistoricalState: the public reader and the state a return reads. */
export const hState = (H, id) => { const h = hex(H, id), st = H?.state?.strength?.exercises?.[id] ?? null; return {reader: h && {mode: h.mode, last: h.lastExecutedLoad, lifted: h.liftedLoad, reps: h.lastExecutedReps, tick: h.earnedProgress.loadTick, stepEarned: h.earnedProgress.stepEarned}, state: st && {mode: st.mode, load: st.load ?? null, reps: st.reps ?? null, pending: st.pendingLoad ?? null, unlogged: !!st.unlogged, source: st.source ?? null, tick: st.loadTick ?? null}}; };
export const rowsOf = (t, w, pred = () => true, ids = null) => t.p.weeks[w].sessions.filter(s => live(s) && s.sport === 'STRENGTH' && pred(s)).flatMap(s => s.prescription.exercises.filter(e => !ids || ids.includes(e.id)).map(e => `${s.date} ${e.id} ${e.load.mode}${e.load.value ?? ''} ${e.sets}x${e.reps}@${e.rir}`));
export const runRows = (t, w) => t.p.weeks[w].sessions.filter(s => live(s) && s.sport === 'RUN').map(s => `${s.date} ${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ':' + s.progression.dimension + '=' + s.progression.value : ''}${s.prescription.strides?.repetitions ? ':strides' + s.prescription.strides.repetitions : ''}`);
export const record = t => V.hash(t.ledger.map(o => ({eventId: o.eventId, sessionId: o.sessionId, observedAt: o.observedAt, actual: o.actual, response: o.response ?? null, source: o.source ?? null, correctionOf: o.correctionOf ?? null, correctedAt: o.correctedAt ?? null, superseded: !!o.superseded, conflicted: !!o.conflicted})).sort((a, b) => a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0));
/** Facts-only comparison of two records: the canonical rows (session, payload, response, correction chain), independent of event ids. */
export const facts = t => V.hash(t.ledger.filter(o => !o.superseded).map(o => ({s: o.sessionId, a: o.actual, r: o.response ?? null, t: o.observedAt, c: !!o.conflicted})).sort((a, b) => (a.s + a.t) < (b.s + b.t) ? -1 : 1));
export const runOf = st => st ? {mode: st.mode, walkStep: st.walkStep ?? null, restart: st.restart ?? null, returnStep: st.returnStep ?? null, easy: st.easy ?? null, easyExtra: st.easyExtra ?? null, long: st.long ?? null, walks: st.walks ?? null, qualityStep: st.qualityStep ?? null, specificStep: st.specificStep ?? null, thresholdDone: st.thresholdDone ?? null, easyWeeksDone: st.easyWeeksDone ?? null, qualityDone: st.qualityDone ?? null, stridesDone: st.stridesDone ?? null, devCount: st.devCount ?? null, stridesEligible: st.stridesEligible ?? null, longestContinuous: st.longestContinuous ?? null, achieved: st.achieved ?? null} : null;
export const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const correctionOf = (o, actual, correctedAt) => ({eventId: o.eventId + '-fix', athleteId: o.athleteId, sessionId: o.sessionId, observedAt: o.observedAt, correctionOf: o.eventId, correctedAt, actual, response: {...o.response}});
