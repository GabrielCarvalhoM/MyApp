// SSCTR R7ADA-SSCTR-r1 probe helpers (own). Loads the runtime that SSCTR_CC selects (default: the live tree, R7A-DECISION-AUTHORITY-FREEZE-1)
// through its public entry points only (generateProgram, evaluateProgram, historicalStateOf), and builds synthetic athletes, reports and reviews
// the way my earlier probes did (R7ASC lib), plus run-side readers for the walk/jog ladder and the walk/jog exit. Read-only runtime use; synthetic
// data; DEV_TEST_ONLY authority.
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const CC = process.env.SSCTR_CC ? path.resolve(process.env.SSCTR_CC) : path.resolve(import.meta.dirname, '../../../CoachingCore');
export const TREE = process.env.SSCTR_CC ? (/trees\/cand\//.test(CC) ? 'candidate R7A-DECISION-AUTHORITY-FREEZE-1 (scratch rebuild)' : /trees\/pred\//.test(CC) ? 'predecessor STATE-MODEL-CONSUMER-FREEZE-1 (scratch rebuild)' : CC) : 'CoachingCore (live)';
const load = rel => import(pathToFileURL(path.join(CC, rel)).href);
const IDX = await load('src/r6-index.mjs'), ADAPT = await load('src/r6-adaptation.mjs'), DEV = await load('r6/fixtures/dev-authority.mjs');
export const {generateProgram, evaluateProgram} = IDX;
export const historicalStateOf = ADAPT.historicalStateOf ?? null;
export const opts = {authority: DEV.devAuthority()};
export const policy = opts.authority.policy, OP = policy.operational, DOSES = OP.strength.goalDoses, LADDER = OP.establishment.walkJogLadder;
export const loadProfiles = async () => load('r6/fixtures/profiles.mjs');

export const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const elig = d => ({status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false});
export const OK = {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'};
export const K = (id, sets, reps, kg, convention = 'TOTAL') => ({id, sets, reps, load: {value: kg, unit: 'KG', convention}, rir: 2, current: true, familiar: true, tolerated: true, observedAt: '2026-10-29'});
/** An R6 intake (the shape of my earlier probes); `athlete` and `schedule` fields override the defaults. */
export const intake = ({id, weeks = 16, goal = 'STRENGTH', run = 'PERFORMANCE', known = [], recent = {}, schedule = {}, athlete = {}}) => ({
  version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: '2026-11-01', startDate: '2026-11-02', weeks, learningConsent: true,
  athlete: {id, ageEligible: true, eligibility: elig('2026-11-01'), goals: {run, strength: goal}, runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
    recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 70, strengthDaysPerWeek: 2, ...recent}, equipment: ['DUMBBELLS', 'BENCH', 'BARBELL', 'RACK'],
    knownExercises: known, exerciseRotationPreference: 'FIXED', ...athlete},
  schedule: {runDays: [1, 3, 6], strengthDays: [2, 5], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 60, longRunDay: 6, longRunMinutes: 100, ...schedule}});

let N = 0;
export const at = (p, w, day, hour, x = {}) => { const d = addDays(p.weeks[w].startDate, day); return {version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${d}T${hour}Z`, weekIndex: w, event: {id: `ssctr-r7ada-${w}-${x.kind ?? 'WEEKLY_REVIEW'}-${N++}`, kind: x.kind ?? 'WEEKLY_REVIEW'}, eligibility: elig(d), observations: [], ...x}; };
/** A report of session s as prescribed; kg(id,e) picks a logged load, set(id,x,e) edits each set; observedAt overrides the execution clock. */
export function obs(p, s, {kg = null, set = null, observedAt = null, extra = {}, actual = {}} = {}) {
  const pr = s.prescription, a = {completed: true, minutes: pr.durationMinutes, ...actual};
  if (pr.modality === 'STRENGTH') a.exercises = pr.exercises.map(e => ({id: e.id, sets: Array.from({length: e.sets}, () => {
    const x = {load: e.load.mode === 'BODYWEIGHT' ? {value: 0, unit: 'BODYWEIGHT', convention: 'BODYWEIGHT'} : {value: kg?.(e.id, e) ?? (e.load.mode === 'KNOWN' ? e.load.value : e.load.ceiling?.value ?? 20), unit: 'KG', convention: e.load.convention}, reps: e.reps, rir: e.rir};
    return set ? set(e.id, x, e) : x; })}));
  return {eventId: `ssctr-r7ada-o-${N++}`, athleteId: p.athleteId, sessionId: s.id, observedAt: observedAt ?? `${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`, actual: a, response: {...OK}, ...extra};
}
export const live = s => s && s.prescription && s.status !== 'SKIPPED';
/** One decision; the record and the proposal carry over (a refused decision leaves the program as it was and is reported). */
export const step = (t, review) => { const r = evaluateProgram(t.p, {...review, actualLedger: t.ledger}, opts); t.ledger = r.actualLedger ?? t.ledger; if (r.proposal) t.p = r.proposal; t.last = r; (t.log ??= []).push(`${review.event.kind}@${review.asOf} ${r.status}/${r.action}`); return r; };
/** Week w's sessions kept by `keep` reported and the week reviewed on Sunday at `hour`. */
export const weekly = (t, w, keep = () => true, o = {}, hour = '21:00:00') => step(t, at(t.p, w, 6, hour, {observations: t.p.weeks[w].sessions.filter(s => live(s) && keep(s)).map(s => obs(t.p, s, typeof o === 'function' ? o(s) : o))}));
/** Each kept session reported on its own evening (Sunday's on Monday 06:00 of the next week): the week itself is never reviewed. */
export const perDay = (t, w, keep = () => true, o = {}) => {
  for (const s of t.p.weeks[w].sessions.filter(s => live(s) && keep(s) && s.day < 6)) step(t, at(t.p, w, s.day, '21:00:00', {observations: [obs(t.p, s, typeof o === 'function' ? o(s) : o)]}));
  if (w + 1 < t.p.weeks.length) step(t, at(t.p, w + 1, 0, '06:00:00', {observations: t.p.weeks[w].sessions.filter(s => live(s) && keep(s) && s.day === 6).map(s => obs(t.p, s, typeof o === 'function' ? o(s) : o))}));
};
export const gen = o => { const g = generateProgram(intake(o), opts); if (!g.program) throw Error(`${o.id}: ${g.status} ${g.reason}`); return {p: g.program, ledger: []}; };
export const genFrom = input => { const g = generateProgram(input, opts); if (!g.program) throw Error(`${input.athlete?.id}: ${g.status} ${g.reason}`); return {p: g.program, ledger: []}; };
export const copy = t => ({p: structuredClone(t.p), ledger: structuredClone(t.ledger), log: [...(t.log ?? [])]});
export const brk = (startDate, endDate, extra = {}) => ({kind: 'RETURN_AFTER_PAUSE', interruption: {days: Math.round((Date.parse(endDate) - Date.parse(startDate)) / 864e5) + 1, startDate, endDate, reasonCategory: 'TRAVEL', reason: 'Work travel', ...extra}});
export const history = (t, w, day = 0, hour = '06:00:00') => historicalStateOf ? historicalStateOf(t.p, {asOf: `${addDays(t.p.weeks[w].startDate, day)}T${hour}Z`, actualLedger: t.ledger}, opts) : null;
export const gateOf = (r, id) => r?.gates?.[id] ?? r?.decision?.gates?.[id] ?? null;
/** The entry run a return decision recorded. */
export const entryRun = r => { const e = r?.proposal?.decisions?.at(-1)?.interruption?.entry?.run ?? null; return e && {mode: e.mode, walkStep: e.walkStep ?? null, easy: e.easy ?? null, restart: e.restart ?? null, returnStep: e.returnStep ?? null, returnFromEasy: e.returnFrom?.easy ?? null}; };

// ---------- run-side readers ----------
export const isRun = s => live(s) && s.sport === 'RUN';
export const WJ = s => isRun(s) && s.role === 'WALK_JOG';
/** The longest continuous jog a session asks for, in minutes: a walk/jog step's jog segment, or the whole run for a continuous run. */
export const continuousMinutes = s => {
  const pr = s.prescription;
  if (s.role === 'WALK_JOG') { const x = LADDER[s.progression?.value]; return x ? x.jogSeconds / 60 : null; }
  if (s.role === 'WALK') return 0;
  return pr.durationMinutes;
};
/** The jogging a session asks for in total, in minutes (walk/jog: repetitions × jog; a continuous run: its duration; a walk: 0). */
export const jogMinutes = s => {
  if (s.role === 'WALK_JOG') { const x = LADDER[s.progression?.value]; return x ? x.repetitions * x.jogSeconds / 60 : null; }
  if (s.role === 'WALK') return 0;
  return s.prescription.durationMinutes;
};
export const runOf = (t, w) => (t.p.weeks[w]?.sessions ?? []).filter(isRun).map(s => ({id: s.id, date: s.date, day: s.day, role: s.role, min: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, val: s.progression?.value ?? null, cont: continuousMinutes(s), jog: jogMinutes(s)}));
export const runText = r => `${r.date.slice(5)} ${r.role}:${r.min}${r.dim ? ' ' + r.dim + '=' + r.val : ''}`;
export const reported = (t, id) => t.ledger.some(o => (o.sessionId ?? o.context?.sessionId) === id && !o.superseded && o.actual?.completed !== false);
/** The run sessions the record holds as executed, in date order. */
export const runsExecuted = t => t.p.weeks.flatMap(w => w.sessions.filter(s => isRun(s) && reported(t, s.id))).map(s => ({date: s.date, role: s.role, val: s.progression?.value ?? null, cont: continuousMinutes(s), jog: jogMinutes(s), min: s.prescription.durationMinutes})).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
export const walkStepsExecuted = t => runsExecuted(t).filter(x => x.role === 'WALK_JOG');
export const histRun = (t, w, day = 0, hour = '00:30:00') => { try { const H = history(t, w, day, hour); if (!H) return null; const r = H.state.run; return {mode: r.mode, walkStep: r.walkStep ?? null, easy: r.easy ?? null, long: r.long ?? null, returnStep: r.returnStep ?? null, restart: r.restart ?? null, longestContinuous: H.run?.longestContinuous ?? null}; } catch (e) { return {error: String(e.message ?? e).slice(0, 160)}; } };
