// SSCTR R7-B.1 review probe s03 (read-only): the dose of an event-week stand-in (QE-R7B-OBS-04 fix, "used at its own dose"). Rotation athletes
// (earlier blocks performed alternatives), a substitution at the start of the taper week for every exercise in use and both reasons. For every stand-in
// row on an event-phase day of the plan in force: its sets, reps, RIR, load and exposure kind; the stand-in's last executed exposure in this program
// (date, sets, reps, load) and the gap in days; the replaced exercise's row in the same session of the no-substitution counterfactual; and week totals
// of strength sets and of the stand-in pattern's sets against that counterfactual.
// Usage: SSCTR_ROOT=<tree root> node s03-stand-in-dose.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs'), R = await imp('CoachingCore/src/r7b-repertoire.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL} = H;
const auth = AU.r6Authority(opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'];
const lastExec = t => { const byId = new Map(t.p.weeks.flatMap(w => w.sessions.map(s => [s.id, s]))); const m = new Map(); for (const o of t.ledger.filter(o => !o.superseded && o.actual?.completed)) for (const e of (o.actual.exercises ?? byId.get(o.sessionId)?.prescription?.exercises ?? [])) { const prev = m.get(e.id); if (!prev || o.observedAt > prev.at) m.set(e.id, {at: o.observedAt.slice(0, 10), sets: (e.sets ?? []).length, reps: e.sets?.[0]?.reps, kg: Math.max(0, ...(e.sets ?? []).map(s => s?.load?.value ?? 0))}); } return m; };
const gap = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}};
const athletes = [
  ['rot2w-2d', {...EV, rotation: 'EVERY_2_WEEKS'}],
  ['rot2w-3d', {...EV, rotation: 'EVERY_2_WEEKS', schedule: {...EV.schedule, strengthDays: [0, 2, 4]}}],
  ['coach-full-3d-strength', {...EV, goals: {run: 'RACE', strength: 'STRENGTH'}, equipment: FULL, rotation: 'COACH_DECIDES', schedule: {...EV.schedule, strengthDays: [0, 2, 4]}}],
  ['rot2w-half-hypertrophy', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, goals: {run: 'RACE', strength: 'HYPERTROPHY'}, equipment: ['DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR', 'KETTLEBELL'], rotation: 'EVERY_2_WEEKS', schedule: {runDays: [1, 2, 4, 6], strengthDays: [0, 3], longRunMinutes: 120}}],
];
const summary = {standInRows: 0, overOwnLastSets: [], overOwnLastLoad: [], overReplacedRowSets: [], weekOverCounterfactual: [], patternOverCounterfactual: [], reestablish: 0, kinds: {}};
for (const [name, o0] of athletes) {
  const o = {...o0, id: 's03-' + name};
  const base = reviewed(o, 0), ph = base.p.phases.phases, tw = ph.indexOf('TAPER'), pw = ph.indexOf('POST_EVENT');
  const cf = reviewed(o, 0), cfAt = {}; for (let w = 0; w <= pw; w++) { cfAt[w] = structuredClone(cf.p.weeks[w]); weekly(cf, w); }
  const t = reviewed(o, 0); for (let w = 0; w < tw; w++) weekly(t, w);
  const ids = [...new Set(t.p.weeks[tw].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
  console.log(`\n## ${name}: taper ${tw}; in use ${ids.join(', ')}`);
  for (const id of ids) for (const reason of ['SKILL_MISMATCH', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']) {
    const r = evaluateProgram(t.p, {...review(t.p, tw, {day: 0, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'SKILL_MISMATCH' ? {} : {nonclinicalConfirmed: true})}}), actualLedger: t.ledger}, opts);
    if (r.status !== 'MODIFY') continue;
    const d = (r.disclosures ?? []).find(z => z.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS');
    if (!d?.standIns?.length) continue;
    const c = structuredClone(t); c.ledger = r.actualLedger ?? c.ledger; c.p = r.proposal;
    console.log(`${id} ${reason} -> ${r.substitutions[0].selected}; stand-ins ${d.standIns.join(', ')}; omitted sessions ${d.omittedSessions.length}`);
    for (let w = tw; w <= pw; w++) {
      const le = lastExec(c), sk = P.skeletonOf(c.p, auth);
      let weekSets = 0, cfWeekSets = 0; const pat = {}, cfPat = {};
      for (const s of c.p.weeks[w].sessions.filter(z => z.sport === 'STRENGTH')) {
        const phase = P.dayPhaseOf(sk.at(w) ?? sk, w, s.day); if (!EVENT.includes(phase)) continue;
        const cs = cfAt[w].sessions.find(z => z.id === s.id);
        for (const e of (live(s) ? s.prescription.exercises : [])) { weekSets += e.sets; pat[e.pattern] = (pat[e.pattern] ?? 0) + e.sets; }
        for (const e of (cs && live(cs) ? cs.prescription.exercises : [])) { cfWeekSets += e.sets; cfPat[e.pattern] = (cfPat[e.pattern] ?? 0) + e.sets; }
        for (const e of (live(s) ? s.prescription.exercises : []).filter(e => [e.note, ...(e.instructions ?? [])].some(x => /stands in for/.test(x ?? '')))) {
          summary.standInRows++; const k = e.exposure?.kind ?? e.load?.mode; summary.kinds[k] = (summary.kinds[k] ?? 0) + 1; if (k === 'REESTABLISH') summary.reestablish++;
          const last = le.get(e.id), xRow = cs?.prescription?.exercises?.find(z => z.id === id);
          const line = `  w${w} ${phase} ${s.date} ${e.id} (${e.role}) ${e.sets}x${e.reps}@RIR${e.rir} ${e.load?.mode}${e.load?.value != null ? ' ' + e.load.value + 'kg' : ''} kind ${k} | own last: ${last ? `${last.at} (${gap(last.at, s.date)} d) ${last.sets}x${last.reps} ${last.kg}kg` : 'none'} | replaced row in counterfactual: ${xRow ? `${xRow.id} ${xRow.sets}x${xRow.reps}@RIR${xRow.rir} ${xRow.load?.mode}${xRow.load?.value != null ? ' ' + xRow.load.value + 'kg' : ''}` : 'none'}`;
          console.log(line);
          if (last && e.sets > last.sets) summary.overOwnLastSets.push(line);
          if (last && e.load?.value != null && e.load.value > last.kg + 1e-9) summary.overOwnLastLoad.push(line);
          if (xRow && e.sets > xRow.sets) summary.overReplacedRowSets.push(line);
        }
      }
      if (weekSets > cfWeekSets) summary.weekOverCounterfactual.push(`${name} ${id} ${reason} w${w}: ${weekSets} > ${cfWeekSets}`);
      for (const p of Object.keys(pat)) if (pat[p] > (cfPat[p] ?? 0)) summary.patternOverCounterfactual.push(`${name} ${id} ${reason} w${w} ${p}: ${pat[p]} > ${cfPat[p] ?? 0}`);
      if (w < c.p.weeks.length - 1) weekly(c, w);
    }
  }
}
console.log('\nSUMMARY ' + JSON.stringify(summary, null, 1));
