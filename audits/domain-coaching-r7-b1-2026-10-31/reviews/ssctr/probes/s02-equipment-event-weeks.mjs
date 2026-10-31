// SSCTR R7-B.1 review probe s02 (read-only): the inherited R6-SUBSTITUTION path (EQUIPMENT_CHANGE, not a reason-based substitution) in the event
// weeks. Question 2 of the request: classify it. For each athlete and each equipment report (permanent at the start of TAPER, at the start of RACE_WEEK;
// a dated window over the race window, as for travel to the race), apply the decision and the weekly reviews, then list every configuration never
// performed in this program that is prescribed on an event-phase day (dayPhaseOf) in the plan in force when its week starts, with its dose.
// The r2 comparator in r06 sent `equipment`/`equipmentChange` fields; this probe sends `changes: {equipment, from, to}` (the field the runtime reads)
// and, as a control, the r06 form too.
// Usage: SSCTR_ROOT=<tree root> node s02-equipment-event-weeks.mjs [label]
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL, addDays} = H;
const auth = AU.r6Authority(opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'];
const performed = t => { const byId = new Map(t.p.weeks.flatMap(w => w.sessions.map(s => [s.id, s]))); return new Set(t.ledger.filter(o => !o.superseded && o.actual?.completed).flatMap(o => (o.actual.exercises ?? byId.get(o.sessionId)?.prescription?.exercises ?? []).map(e => e.id))); };
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}};
const athletes = [
  ['A-10K-general-dbkb', {...EV, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'}],
  ['B-10K-strength-full-3d', {...EV, goals: {run: 'RACE', strength: 'STRENGTH'}, equipment: FULL, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}, rotation: 'COACH_DECIDES'}],
  ['C-half-hypertrophy-bands', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, goals: {run: 'RACE', strength: 'HYPERTROPHY'}, equipment: ['DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR'], schedule: {runDays: [1, 2, 4, 6], strengthDays: [0, 3], longRunMinutes: 120}, rotation: 'EVERY_2_WEEKS'}],
];
const out = {label: process.argv[2] ?? 'run', cases: []};
for (const [name, o0] of athletes) {
  const o = {...o0, id: 's02-' + name}, base = reviewed(o, 0), ph = base.p.phases.phases, tw = ph.indexOf('TAPER'), rw = ph.indexOf('RACE_WEEK'), pw = ph.indexOf('POST_EVENT');
  const reports = [
    ['permanent-kettlebell@TAPER', tw, () => ({changes: {equipment: ['KETTLEBELL']}})],
    ['permanent-bodyweight@TAPER', tw, () => ({changes: {equipment: []}})],
    ['permanent-bands@RACE_WEEK', rw, () => ({changes: {equipment: ['BANDS']}})],
    ['window-bodyweight-race-travel', rw, t => ({changes: {equipment: [], from: t.p.weeks[rw].startDate, to: addDays(t.p.weeks[rw].startDate, 6)}})],
    ['window-bodyweight-taper+race', tw, t => ({changes: {equipment: [], from: t.p.weeks[tw].startDate, to: addDays(t.p.weeks[rw].startDate, 6)}})],
    ['r06-form-control', tw, () => ({equipment: ['KETTLEBELL'], equipmentChange: {equipment: ['KETTLEBELL']}})],
  ];
  for (const [rname, wk, make] of reports) {
    const t = reviewed(o, 0); for (let w = 0; w < wk; w++) weekly(t, w);
    const r = evaluateProgram(t.p, {...review(t.p, wk, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', ...make(t)}), actualLedger: t.ledger}, opts);
    const c = {athlete: name, report: rname, week: wk, status: r.status, action: r.action, swaps: (r.substitutions ?? []).map(z => `${z.exerciseId}->${z.selected}${z.requiresEstablishment ? ' (establish)' : ''}${z.stimulusChange ? ' [stimulus change disclosed]' : ''}`), omitted: r.proposal?.omitted ?? null, neverPerformedOnEventDays: []};
    if (r.proposal) {
      const x = structuredClone(t); x.ledger = r.actualLedger ?? x.ledger; x.p = r.proposal;
      for (let w = wk; w <= pw && w < x.p.weeks.length; w++) {
        const perf = performed(x), sk = P.skeletonOf(x.p, auth);
        for (const s of x.p.weeks[w].sessions.filter(s => live(s) && s.sport === 'STRENGTH')) {
          const phase = P.dayPhaseOf(sk.at(w) ?? sk, w, s.day); if (!EVENT.includes(phase)) continue;
          for (const e of s.prescription.exercises) if (!perf.has(e.id)) c.neverPerformedOnEventDays.push(`w${w} ${phase} ${s.date} ${e.id} ${e.sets}x${e.reps}@RIR${e.rir} ${e.load?.mode}${e.exposure?.kind ? ' ' + e.exposure.kind : ''}`);
        }
        if (w < x.p.weeks.length - 1) weekly(x, w);
      }
    }
    out.cases.push(c);
    console.log(`${name} ${rname} (week ${wk}): ${r.status} ${r.action ?? ''} | swaps ${c.swaps.join('; ') || '-'} | never performed on event days: ${c.neverPerformedOnEventDays.length}\n   ${c.neverPerformedOnEventDays.join('\n   ')}`);
  }
}
console.log('\nSUMMARY ' + JSON.stringify({label: out.label, cases: out.cases.length, withNeverPerformed: out.cases.filter(c => c.neverPerformedOnEventDays.length).length, rows: out.cases.reduce((n, c) => n + c.neverPerformedOnEventDays.length, 0), maxSets: Math.max(0, ...out.cases.flatMap(c => c.neverPerformedOnEventDays.map(x => Number(/ (\d+)x/.exec(x)?.[1] ?? 0)))), minRir: Math.min(9, ...out.cases.flatMap(c => c.neverPerformedOnEventDays.map(x => Number(/RIR(\d+)/.exec(x)?.[1] ?? 9))))}));
