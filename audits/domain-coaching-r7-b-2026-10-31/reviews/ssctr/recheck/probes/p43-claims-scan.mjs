// SSCTR R7-B recheck (FREEZE-2) copy of probe p43 (read-only): scan every athlete-facing string of generated and reviewed programs for claims the B0 records forbid:
// injury prevention / rehabilitation / pain relief, VO2max / LT2 / critical speed / race pace labels, recovery or readiness claims for reductions.
import {gen, reviewed, weekly, FULL} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const PAT = [/injur(y|ies) prevent/i, /prevent(s|ing)? (injur|pain)/i, /rehab/i, /pain relief|relieve pain|heal/i, /\bVO2 ?max\b/i, /\bLT2\b|lactate threshold pace|critical speed/i, /race pace/i, /readiness score/i, /protects? (you|your) (from|against)/i, /reduces? (the )?risk of injur/i];
const texts = (o, path = '', out = []) => { if (typeof o === 'string') out.push([path, o]); else if (Array.isArray(o)) o.forEach((x, i) => texts(x, path + '[' + i + ']', out)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!['hash', 'id', 'canonical', 'sourceInputHash', 'intakeHash', 'policyHash', 'plannedPrescriptionHash'].includes(k)) texts(v, path + '.' + k, out); return out; };
const hits = new Map();
const scan = (label, obj) => { for (const [p, s] of texts(obj)) for (const re of PAT) if (re.test(s) && !/not (an? )?(injury|recovery)|never .*(injur|VO2)|no (injury|VO2)|not VO2|isn.t VO2|not a recovery or injury|not.*prevention|without .*claim/i.test(s)) { const k = re.source; if (!hits.has(k)) hits.set(k, []); if (hits.get(k).length < 5) hits.get(k).push(`${label} ${p}: ${s.slice(0, 160)}`); } };
const cases = [
  {id: 'p43-rs', goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, equipment: FULL, weeks: 16, schedule: {strengthDays: [0, 2, 4, 5]}},
  {id: 'p43-bouts', goals: {run: 'PERFORMANCE', strength: 'GENERAL'}, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70, strengthDaysPerWeek: 2}, knownRuns: [TASK], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, weeks: 12},
  {id: 'p43-novice', strengthExperience: 'NONE', runExperience: 'NOVICE', goals: {run: 'PERFORMANCE', strength: 'HYPERTROPHY'}, equipment: ['BANDS', 'PULL_UP_BAR'], recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35, strengthDaysPerWeek: 0}, schedule: {strengthDays: [0, 2, 4, 5], runMinutes: 45}, weeks: 16},
  {id: 'p43-p04', goals: {run: 'RACE', strength: 'STRENGTH'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: FULL, knownExercises: [{id: 'bulgarian-split-squat-db', familiar: true}], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 3}, schedule: {runDays: [1, 3, 6], strengthDays: [0, 2, 5], longRunDay: 6}}
];
for (const o of cases) {
  const g = gen(o); scan(o.id + ':plan', {program: g.program, negotiation: g.negotiation});
  const t = reviewed(o, 0);
  for (let w = 0; w < 8; w++) { const r = weekly(t, w); scan(`${o.id}:review${w}`, {reason: r.reason, disclosures: r.disclosures, offers: r.offers, weeks: t.p.weeks.slice(w + 1, w + 3)}); }
}
console.log(hits.size ? 'possible forbidden claims:' : 'no forbidden claim pattern found');
for (const [k, v] of hits) { console.log('pattern ' + k); v.forEach(x => console.log('  ' + x)); }
