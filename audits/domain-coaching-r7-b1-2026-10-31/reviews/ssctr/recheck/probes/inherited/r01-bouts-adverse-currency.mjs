import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck probe r01 (read-only, FREEZE-2): does an executed bouts session with an adverse (or HOLD-gated) response keep the familiar
// task current (B0-C02 c1: current = performed within 28 days), and which explanation does the replacing threshold session carry (F5)?
// A: one adverse bouts session (gate HOLD: "a single adverse response repeats the step"), then normal weeks.
// B: two adverse bouts sessions (gate REGRESS: withdrawal), as in p13 C.
// C: a bouts task observed the day before the intake (currency horizon far away): the same two adverse responses.
const {reviewed, weekly, runs} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report of the last three track sessions'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const BOUTS = {...RUN_ONLY, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70}, knownRuns: [TASK], schedule: {strengthDays: [], runDays: [1, 3, 5, 6]}, weeks: 12};
const bad = {response: {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'}};
const q = (p, w) => { const s = runs(p, w).find(x => x.role === 'QUALITY'); return s ? `${s.date} ${s.prescription.family}:${s.prescription.durationMinutes}${s.replaces ? ' replaces=' + s.replaces : ''}${s.explanation ? ' "' + s.explanation.slice(0, 95) + '"' : ''}` : '-'; };
const st = (p, w) => { const r = p.stateTrace[w]?.run; return r ? `currentThrough=${r.familiarCurrentThrough} (day ${r.familiarCurrentThrough} = ${new Date(Date.parse(p.startDate) + r.familiarCurrentThrough * 864e5).toISOString().slice(0, 10)}) lapsed=${!!r.familiarBoutsLapsed} withdrawn=${!!r.familiarBoutsWithdrawn}` : '-'; };
for (const [label, observedAt, adverseWeeks] of [['A: one adverse bouts session (w2)', '2026-10-28', [2]], ['B: two adverse bouts sessions (w2, w3)', '2026-10-28', [2, 3]], ['C: observed 2026-10-31, two adverse (w2, w3)', '2026-10-31', [2, 3]], ['D: control, no adverse', '2026-10-28', []]]) {
  console.log(`\n=== ${label} ===`);
  const t = reviewed({...BOUTS, id: 'r01-' + label.slice(0, 1), knownRuns: [{...TASK, observedAt}]}, 0);
  for (let w = 0; w < 7; w++) {
    console.log(`w${w} start ${st(t.p, w)} | quality ${q(t.p, w)}`);
    const r = weekly(t, w, {o: s => s.role === 'QUALITY' && adverseWeeks.includes(w) ? bad : {}});
    if (r.gates?.QUALITY) console.log(`   review w${w}: QUALITY gate ${r.gates.QUALITY}`);
  }
}
