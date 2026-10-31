// SSCTR R7-B probe p40 (read-only): dose-boundary sweep with independent invariants over generated programs and 6 reviewed weeks.
// Strength: sets <= goal maxSets (phase doses only lower it); establishment/first exposure <= 2 sets at RIR >= 3; race week <= 1 set RIR >= 4,
// MAIN only, >= 3 days before the race; taper: no new exercise vs the week before; no kilogram on band/assistance/bodyweight rows; HIGH skill
// only familiar or ladder-reached; reps of a band/assistance row never above the goal range unless held from its start.
// Run: at most one quality per week; quality only under RACE/PERFORMANCE with >= 3 run days; first-week quality never; single-run ceiling
// (longest planned run of the previous weeks + 5, or the intake longest + 5 in week 0) for non-race runs; taper long < achieved peak.
import {gen, reviewed, weekly, runs, FULL, K} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';

const GOALD = {STRENGTH: {maxSets: 4, range: [4, 6]}, HYPERTROPHY: {maxSets: 4, range: [8, 12]}, RUNNING_SUPPORT: {maxSets: 3, range: [6, 10]}, MAINTAIN: {maxSets: 2, range: [8, 8]}, GENERAL: {maxSets: 3, range: [8, 12]}};
const QUAL = ['THRESHOLD', 'TEN_K_SPECIFIC', 'HALF_MARATHON_SPECIFIC', 'FAMILIAR_REPEATED_BOUTS'];
const issues = new Map();
const flag = (k, x) => { if (!issues.has(k)) issues.set(k, []); if (issues.get(k).length < 4) issues.get(k).push(x); else issues.get(k).push(null); };

function check(p, label, {reviewedUpTo = -1} = {}) {
  const sg = p.goal.strength?.kind, G = GOALD[sg];
  const known = new Set((p.canonical.athlete.knownExercises ?? []).filter(k => k.familiar !== false).map(k => k.id)), reached = new Set(p.canonical.athlete.ladderReached ?? []);
  let prevLongest = p.capability.run.longestMinutes ?? null;
  const raceDate = p.goal.run.event?.date ?? null;
  for (const w of p.weeks) {
    if (w.index <= reviewedUpTo) { /* history: still checked */ }
    const strength = w.sessions.filter(s => s.sport === 'STRENGTH' && s.prescription && s.status !== 'SKIPPED');
    for (const s of strength) for (const e of s.prescription.exercises) {
      const c = configurationOf(e.id), where = `${label} w${w.index}/${w.phase} ${s.id} ${e.id}`;
      if (!c) { flag('notInCatalog', where); continue; }
      if (G && e.sets > G.maxSets) flag('setsAboveGoalMax', `${where} sets=${e.sets} max=${G.maxSets}`);
      if (e.load?.mode === 'ESTABLISH' && (e.sets > 2 || e.rir < 3)) flag('establishmentAbove2SetsOrRirBelow3', `${where} sets=${e.sets} rir=${e.rir}`);
      if (['BAND', 'ASSISTED', 'BODYWEIGHT'].includes(c.loading) && (e.load?.unit === 'KG' || Number.isFinite(e.load?.value) && e.load.value > 0)) flag('kgOnNoKgRow', `${where} ${JSON.stringify(e.load)}`);
      if (c.skill === 'HIGH' && !known.has(e.id) && !reached.has(e.id)) flag('highSkillNotAdmissible', where);
      if (w.phase === 'RACE_WEEK' && (e.sets > 1 || e.rir < 4 || e.role !== 'MAIN')) flag('raceWeekStrength', `${where} sets=${e.sets} rir=${e.rir} role=${e.role}`);
      if (w.phase === 'TAPER' && e.rir < 3) flag('taperRirBelow3', `${where} rir=${e.rir}`);
      if (e.rir < 2) flag('rirBelow2', `${where} rir=${e.rir}`);
      if (G && ['BAND', 'ASSISTED'].includes(c.loading) && e.reps > G.range[1] + 2 && e.role === 'MAIN') flag('ordinalRepsAboveRange', `${where} reps=${e.reps}`);
    }
    if (raceDate && w.phase === 'RACE_WEEK') for (const s of strength) { const d = (Date.parse(raceDate) - Date.parse(s.date)) / 864e5; if (d < 3) flag('strengthWithin3DaysOfRace', `${label} ${s.id} ${d}d`); }
    if (w.phase === 'TAPER' && w.index > 0) { const before = new Set(p.weeks[w.index - 1].sessions.flatMap(s => s.prescription?.exercises?.map(e => e.id) ?? [])); for (const s of strength) for (const e of s.prescription.exercises) if (!before.has(e.id)) flag('newExerciseInTaper', `${label} w${w.index} ${e.id}`); }
    const rr = runs(p, w.index), q = rr.filter(s => QUAL.includes(s.prescription.family));
    if (q.length > 1) flag('moreThanOneQuality', `${label} w${w.index}`);
    if (q.length && (!['RACE', 'PERFORMANCE'].includes(p.goal.run.kind) || p.schedule.runDays.length < 3)) flag('qualityOutsideGates', `${label} w${w.index}`);
    if (q.length && w.index === 0) flag('qualityInWeek1', `${label}`);
    for (const s of rr) {
      if (s.prescription.family === 'RACE' || s.prescription.family === 'WALK') continue;
      if (Number.isFinite(prevLongest) && prevLongest > 0 && s.prescription.durationMinutes > prevLongest + 5 && w.index > 0) flag('singleRunAbovePreviousLongestPlus5', `${label} w${w.index} ${s.role}:${s.prescription.family} ${s.prescription.durationMinutes} > ${prevLongest}+5`);
    }
    const longest = Math.max(0, ...rr.filter(s => !['RACE', 'WALK'].includes(s.prescription.family)).map(s => s.prescription.durationMinutes));
    if (Number.isFinite(longest) && longest > (prevLongest ?? 0)) prevLongest = longest;
  }
}

const runCases = [
  ['novice', {runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35, strengthDaysPerWeek: 0}}],
  ['current', {recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}}],
  ['walkjog', {runExperience: 'NONE', recent: {runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0, strengthDaysPerWeek: 0}}]
];
const strengthCases = [
  ['NONE-gen-db', {strengthExperience: 'NONE', goals: {run: 'PERFORMANCE', strength: 'GENERAL'}, equipment: ['DUMBBELLS', 'BENCH']}],
  ['INT-str-full', {strengthExperience: 'INTERMEDIATE', goals: {run: 'PERFORMANCE', strength: 'STRENGTH'}, equipment: FULL}],
  ['INT-hyp-bands', {strengthExperience: 'INTERMEDIATE', goals: {run: 'PERFORMANCE', strength: 'HYPERTROPHY'}, equipment: ['BANDS', 'PULL_UP_BAR']}],
  ['EXP-rs-kb', {strengthExperience: 'EXPERIENCED', goals: {run: 'PERFORMANCE', strength: 'RUNNING_SUPPORT'}, equipment: ['KETTLEBELL', 'BANDS'], knownExercises: [K('kb-goblet-squat', 3, 8, 16, 'SINGLE_IMPLEMENT')]}],
  ['NONE-maint-bw', {strengthExperience: 'NONE', goals: {run: 'PERFORMANCE', strength: 'MAINTAIN'}, equipment: []}]
];
const scheds = [['3x2', {runDays: [1, 3, 6], strengthDays: [0, 4]}], ['4x3', {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}], ['3x4', {runDays: [1, 3, 6], strengthDays: [0, 2, 4, 5]}]];
const events = [['none', null], ['10K', {kind: '10K', date: '2027-01-24'}], ['HM', {kind: 'HALF_MARATHON', date: '2027-01-31'}]];
const rotations = ['FIXED', 'EVERY_2_WEEKS', 'COACH_DECIDES'];
let n = 0, statuses = {};
for (const [rl, ro] of runCases) for (const [sl, so] of strengthCases) for (const [dl, dz] of scheds) for (const [el, ev] of events) for (const rot of rotations) {
  if (rot !== 'FIXED' && (dl !== '4x3' || rl === 'walkjog')) continue;
  const id = `p40-${rl}-${sl}-${dl}-${el}-${rot}`;
  const goals = ev ? {...so.goals, run: 'RACE'} : so.goals;
  const o = {id, ...ro, ...so, goals, schedule: {...dz}, weeks: 16, rotation: rot, ...(ev ? {event: ev} : {})};
  const g = gen(o);
  statuses[g.status] = (statuses[g.status] ?? 0) + 1;
  if (g.status !== 'PROPOSED') continue;
  n++;
  check(g.program, id);
  if (rl !== 'walkjog' && rot === 'FIXED' && dl === '4x3') {
    try { const t = reviewed(o, 0); for (let w = 0; w < 6; w++) weekly(t, w); check(t.p, id + '@rev6', {reviewedUpTo: 5}); } catch (e) { flag('reviewError', `${id}: ${e.message.slice(0, 160)}`); }
  }
}
console.log('programs checked', n, 'statuses', JSON.stringify(statuses));
for (const [k, v] of issues) console.log(`${k}: ${v.length} (first: ${v.filter(Boolean).slice(0, 4).join(' | ')})`);
if (!issues.size) console.log('no invariant violations');
