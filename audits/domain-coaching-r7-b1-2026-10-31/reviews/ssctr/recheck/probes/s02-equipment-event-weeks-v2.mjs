// SSCTR R7-B.1 recheck probe s02 v2 (read-only): the equipment-change path in the event weeks (R7B1-SSCTR-F11), with what replaces the rows the rule
// keeps out. Same athletes and reports as s02 (r1). For each report: the decision, then the weekly reviews through the post-event week (every live
// session executed). Each event-phase strength day is judged in the plan in force when its week starts (sessions on or after the decision day in the
// decision's week): rows never performed in this program; stand-in rows (instruction "stands in for") with their dose against their own last executed
// exposure; slots left out (eventStandIns without a stand-in); event-week strength sessions that are rest by design where the no-change counterfactual
// (same reviews, no equipment report) holds a strength session; and the decision's disclosures.
// Usage: SSCTR_ROOT=<tree root> node s02-equipment-event-weeks-v2.mjs [label]
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL, addDays} = H;
const auth = AU.r6Authority(opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'], MINRIR = {TAPER: 3, RACE_WEEK: 4, POST_EVENT: 4};
const lastExec = t => { const byId = new Map(t.p.weeks.flatMap(w => w.sessions.map(s => [s.id, s]))); const m = new Map(); for (const o of t.ledger.filter(o => !o.superseded && o.actual?.completed)) for (const e of (o.actual.exercises ?? byId.get(o.sessionId)?.prescription?.exercises ?? [])) { const prev = m.get(e.id); if (!prev || o.observedAt > prev.at) m.set(e.id, {at: o.observedAt.slice(0, 10), sets: (e.sets ?? []).length, reps: e.sets?.[0]?.reps, kg: Math.max(0, ...(e.sets ?? []).map(s => s?.load?.value ?? 0))}); } return m; };
const gap = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const isStandIn = e => [e.note, ...(e.instructions ?? [])].some(x => /stands in for/.test(x ?? ''));
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}};
const athletes = [
  ['A-10K-general-dbkb', {...EV, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'}],
  ['B-10K-strength-full-3d', {...EV, goals: {run: 'RACE', strength: 'STRENGTH'}, equipment: FULL, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}, rotation: 'COACH_DECIDES'}],
  ['C-half-hypertrophy-bands', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, goals: {run: 'RACE', strength: 'HYPERTROPHY'}, equipment: ['DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR'], schedule: {runDays: [1, 2, 4, 6], strengthDays: [0, 3], longRunMinutes: 120}, rotation: 'EVERY_2_WEEKS'}],
];
const S = {label: process.argv[2] ?? 'run', reports: 0, neverPerformed: 0, standIns: 0, standInAboveOwnLast: [], rirBelow: 0, omittedSlots: 0, restByDesignVsCounterfactual: [], decisionsWithEventDisclosure: 0, weeklyReviewDisclosures: 0, keptSessions: 0};
for (const [name, o0] of athletes) {
  const o = {...o0, id: 's02v2-' + name}, base = reviewed(o, 0), ph = base.p.phases.phases, tw = ph.indexOf('TAPER'), rw = ph.indexOf('RACE_WEEK'), pw = ph.indexOf('POST_EVENT');
  const cf = reviewed(o, 0), cfAt = {}; for (let w = 0; w <= pw; w++) { cfAt[w] = structuredClone(cf.p.weeks[w]); weekly(cf, w); }
  const reports = [
    ['permanent-kettlebell@TAPER', tw, () => ({changes: {equipment: ['KETTLEBELL']}})],
    ['permanent-bodyweight@TAPER', tw, () => ({changes: {equipment: []}})],
    ['permanent-bands@RACE_WEEK', rw, () => ({changes: {equipment: ['BANDS']}})],
    ['window-bodyweight-race-travel', rw, t => ({changes: {equipment: [], from: t.p.weeks[rw].startDate, to: addDays(t.p.weeks[rw].startDate, 6)}})],
    ['window-bodyweight-taper+race', tw, t => ({changes: {equipment: [], from: t.p.weeks[tw].startDate, to: addDays(t.p.weeks[rw].startDate, 6)}})],
  ];
  for (const [rname, wk, make] of reports) {
    S.reports++;
    const t = reviewed(o, 0); for (let w = 0; w < wk; w++) weekly(t, w);
    const r = evaluateProgram(t.p, {...review(t.p, wk, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', ...make(t)}), actualLedger: t.ledger}, opts);
    const disc = (r.disclosures ?? []).filter(d => d.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS');
    if (disc.length) S.decisionsWithEventDisclosure++;
    const lines = [`${name} ${rname} (week ${wk}): ${r.status} ${r.action ?? ''} | swaps ${(r.substitutions ?? []).map(z => `${z.exerciseId}->${z.selected}`).join('; ') || '-'} | event disclosure: ${disc.map(d => d.detail).join(' / ') || 'none'}`];
    if (!r.proposal) { console.log(lines.join('\n')); continue; }
    const x = structuredClone(t); x.ledger = r.actualLedger ?? x.ledger; x.p = r.proposal;
    for (let w = wk; w <= pw && w < x.p.weeks.length; w++) {
      const le = lastExec(x), sk = P.skeletonOf(x.p, auth), from = w === wk ? x.p.weeks[wk].startDate : '';
      for (const s of x.p.weeks[w].sessions.filter(z => z.sport === 'STRENGTH' && z.date >= from)) {
        const phase = P.dayPhaseOf(sk.at(w) ?? sk, w, s.day); if (!EVENT.includes(phase)) continue;
        const cs = cfAt[w]?.sessions.find(z => z.id === s.id), cfLive = !!cs && live(cs) && cs.prescription?.modality === 'STRENGTH';
        if (!live(s)) { if (cfLive) { S.restByDesignVsCounterfactual.push(`${name} ${rname} w${w} ${phase} ${s.date}: ${s.explanation ?? s.reason ?? 'rest'} (counterfactual: ${cs.prescription.exercises.map(e => e.id + ':' + e.sets).join(', ')})`); lines.push(`   w${w} ${phase} ${s.date} REST BY DESIGN${s.eventStandIns ? ' eventStandIns ' + JSON.stringify(s.eventStandIns) : ''}`); } continue; }
        S.keptSessions++;
        for (const g of s.eventStandIns ?? []) if (!g.inEventWeeks) S.omittedSlots++;
        for (const e of s.prescription.exercises) {
          const last = le.get(e.id);
          if (!last) { S.neverPerformed++; lines.push(`   NEVER PERFORMED w${w} ${phase} ${s.date} ${e.id} ${e.sets}x${e.reps}@RIR${e.rir} ${e.load?.mode}`); }
          if (e.rir < MINRIR[phase]) S.rirBelow++;
          if (isStandIn(e)) {
            S.standIns++;
            const l = `   stand-in w${w} ${phase} ${s.date} ${e.id} (${e.role}) ${e.sets}x${e.reps}@RIR${e.rir} ${e.load?.mode}${e.load?.value != null ? ' ' + e.load.value + 'kg' : ''} ${e.exposure?.kind ?? ''} | own last ${last ? `${last.at} (${gap(last.at, s.date)} d) ${last.sets}x${last.reps} ${last.kg}kg` : 'none'} | ${(e.instructions ?? []).find(i => /stands in for/.test(i))}`;
            lines.push(l);
            if (last && (e.sets > last.sets || (e.load?.value != null && e.load.value > last.kg + 1e-9))) S.standInAboveOwnLast.push(l);
          }
        }
        if (s.eventStandIns?.some(g => !g.inEventWeeks)) lines.push(`   w${w} ${phase} ${s.date} slots left out: ${s.eventStandIns.filter(g => !g.inEventWeeks).map(g => g.selected).join(', ')} | session keeps ${s.prescription.exercises.map(e => e.id + ':' + e.sets).join(', ')}`);
      }
      if (w < x.p.weeks.length - 1) { const rv = weekly(x, w); if ((rv.disclosures ?? []).some(d => d.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS')) S.weeklyReviewDisclosures++; }
    }
    console.log(lines.join('\n'));
  }
}
console.log('\nSUMMARY ' + JSON.stringify(S, null, 1));
