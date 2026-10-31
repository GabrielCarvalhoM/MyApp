// SSCTR R7ARA-SSCTR-r1 walk/jog exit variants (own; prints only). Two bounded F4-X variants beyond my R7ADA continuous probe, on its two athletes
// (TOP5: non-novice from step 5, exit in a CONSOLIDATION week; FULL: the fixture novice, exit in a DEVELOPMENT week); weeks 0..L executed and
// reviewed (L = X-1 runs step 8, 1 x 20 min jog), then in the exit week X:
//  MON_MISSED   Monday's first continuous run not reported; the pause starts Wednesday (SHORT to Friday reported Saturday 07:00; MODERATE 14
//               days; LONG 33 days);
//  MON_PARTIAL  Monday's first continuous run reported complete=true but 20 of 25 minutes (below 90%: a partial execution); the pause starts
//               Tuesday.
// Expected (R6-NONCLINICAL-RETURN, contract E1.3, SSCTR R46): the exit was never run completely, so the return is the walk/jog recipe: SHORT step 8,
// MODERATE step 7, LONG step 0, and no continuous run in the re-entry week. SSCTR_CC selects the runtime (required).
import * as L from './ssctr-r7ada-lib.mjs';
if (!process.env.SSCTR_CC) throw Error('SSCTR_CC is required');
const {PROFILES, EDGE_PROFILES} = await L.loadProfiles();
const BASE = {...PROFILES, ...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS;
const ATHLETES = {
  TOP5: () => { const p = structuredClone(BASE); p.weeks = 12; p.athlete.id = 'ssctr-r7ada-wj-top5'; p.athlete.runExperience = 'INTERMEDIATE'; p.athlete.recent = {...p.athlete.recent, runDaysPerWeek: 3, runMinutesPerWeek: 40, longestRunMinutes: 12}; return p; },
  FULL: () => { const p = structuredClone(BASE); p.weeks = 16; p.athlete.id = 'ssctr-r7ada-wj-full'; return p; },
};
const CONT = ['EASY', 'LONG', 'QUALITY'];
const rowTxt = s => `${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ' ' + s.progression.dimension + '=' + s.progression.value : ''}`;
const sessAt = s => `${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`;
const out = {probe: 'R7ARA-SSCTR-r1-EXIT-VARIANTS', runtime: process.env.SSCTR_CC, cells: {}, totals: {cells: 0, continuousInReentry: 0, stepAboveRecipe: 0}};
for (const [name, mk] of Object.entries(ATHLETES)) {
  const ref = L.genFrom(mk()); let X = null;
  for (let w = 0; w < ref.p.weeks.length - 1 && X === null; w++) { L.weekly(ref, w); if (ref.p.weeks[w + 1].sessions.some(s => L.isRun(s) && CONT.includes(s.role))) X = w + 1; }
  for (const variant of ['MON_MISSED', 'MON_PARTIAL']) for (const [pName, allowed] of [['SHORT', 8], ['MODERATE', 7], ['LONG', 0]]) {
    const t = L.genFrom(mk()); for (let w = 0; w < X; w++) L.weekly(t, w);
    const mon = t.p.weeks[X].sessions.find(s => L.isRun(s) && s.day === 0), d0 = variant === 'MON_MISSED' ? 2 : 1;
    if (variant === 'MON_PARTIAL') L.step(t, L.at(t.p, X, 0, '21:00:00', {observations: [L.obs(t.p, mon, {actual: {minutes: 20}})]}));
    const start = L.addDays(t.p.weeks[X].startDate, d0), P = {SHORT: {end: 4, report: [X, 5]}, MODERATE: {end: d0 + 13, report: [X + 2, d0]}, LONG: {end: d0 + 32, report: [X + 4, Math.min(6, d0 + 5)]}}[pName];
    if (P.report[0] + 1 >= t.p.weeks.length) { out.cells[`${name}/${variant}/${pName}`] = 'skipped: beyond the program'; continue; }
    const before = t.p.decisions.length, r = L.step(t, L.at(t.p, P.report[0], P.report[1], '07:00:00', L.brk(start, L.addDays(t.p.weeks[X].startDate, P.end))));
    const d = t.p.decisions.slice(before).filter(x => x.interruption).at(-1), reportAt = `${L.addDays(t.p.weeks[P.report[0]].startDate, P.report[1])}T07:00:00Z`;
    const fromWeek = d?.fromWeek ?? P.report[0], rows0 = (t.p.weeks[fromWeek]?.sessions ?? []).filter(s => L.isRun(s) && sessAt(s) > reportAt);
    const rows = rows0.length ? rows0 : (t.p.weeks[fromWeek + 1]?.sessions ?? []).filter(L.isRun);
    const cont = rows.filter(s => CONT.includes(s.role)).map(rowTxt), above = rows.filter(s => s.role === 'WALK_JOG' && s.progression.value > allowed).map(rowTxt);
    out.totals.cells++; if (cont.length) out.totals.continuousInReentry++; if (above.length) out.totals.stepAboveRecipe++;
    out.cells[`${name}/${variant}/${pName}`] = {exitWeek: X, monday: rowTxt(mon), status: `${r.status}/${r.action}`, cls: d?.interruption?.class ?? null,
      entry: d && {mode: d.interruption.entry.run.mode, walkStep: d.interruption.entry.run.walkStep ?? null, easy: d.interruption.entry.run.easy ?? null}, recipe: allowed, reentry: rows.map(rowTxt), continuousInReentry: cont, stepsAboveRecipe: above};
  }
}
console.log(JSON.stringify(out, null, 1));
