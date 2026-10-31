// SSCTR R7-B.1 recheck probe s09 (read-only): what the event-week rule now does to rows no substitution placed (C3 binds every row).
// (a) planned taper after missed strength sessions: every day-4 strength session skipped from week 0 (its template's own exercises never performed),
//     and every strength session skipped; (b) short-horizon intakes (the event 2-4 weeks after the start); (c) rebuilds at the start of the taper: a
//     schedule change adding a strength day, and a strength goal change. Each event-phase strength day is printed in the plan in force when its week
//     starts: rows (sets x reps @ RIR, mode, exposure kind, performed or not), stand-ins, slots left out, rest by design.
// Usage: SSCTR_ROOT=<tree root> node s09-guard-every-row.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, gen, addDays} = H;
const auth = AU.r6Authority(opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'];
const performed = t => { const byId = new Map(t.p.weeks.flatMap(w => w.sessions.map(s => [s.id, s]))); return new Set(t.ledger.filter(o => !o.superseded && o.actual?.completed).flatMap(o => (o.actual.exercises ?? byId.get(o.sessionId)?.prescription?.exercises ?? []).map(e => e.id))); };
const isStandIn = e => [e.note, ...(e.instructions ?? [])].some(x => /stands in for/.test(x ?? ''));
const tot = {neverPerformedRows: 0, standIns: 0, slotsLeftOut: 0, restByDesign: 0};
const show = (t, w, from = '') => { const perf = performed(t), sk = P.skeletonOf(t.p, auth); return t.p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH' && s.date >= from).map(s => { const phase = P.dayPhaseOf(sk.at(w) ?? sk, w, s.day); if (!EVENT.includes(phase)) return null; if (!live(s)) { if (s.eventStandIns) tot.restByDesign++; return `   w${w} ${phase} ${s.date}: REST ${s.eventStandIns ? '(event rule) ' + JSON.stringify(s.eventStandIns.map(g => g.selected + '->' + (g.inEventWeeks ?? 'out'))) : '(' + (s.explanation ?? s.role ?? '') + ')'}`; } const left = (s.eventStandIns ?? []).filter(g => !g.inEventWeeks); tot.slotsLeftOut += left.length; return `   w${w} ${phase} ${s.date}: ` + s.prescription.exercises.map(e => { if (!perf.has(e.id)) tot.neverPerformedRows++; if (isStandIn(e)) tot.standIns++; return `${e.id}${perf.has(e.id) ? '' : ' [NEVER PERFORMED]'}${isStandIn(e) ? ' [stand-in]' : ''} ${e.sets}x${e.reps}@${e.rir} ${e.load?.mode}${e.exposure?.kind ? '/' + e.exposure.kind : ''}`; }).join(', ') + (left.length ? ` | left out: ${left.map(g => g.selected).join(', ')}` : ''); }).filter(Boolean).join('\n'); };
const walk = (t, wk, pw, keep = () => true) => { const out = []; for (let w = wk; w <= pw && w < t.p.weeks.length; w++) { out.push(show(t, w)); if (w < t.p.weeks.length - 1) weekly(t, w, {keep}); } return out.filter(Boolean).join('\n'); };
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'};
// (a) missed strength sessions
for (const [label, keep] of [['day-4 strength sessions all missed', s => !(s.sport === 'STRENGTH' && s.day === 4)], ['every strength session missed', s => s.sport !== 'STRENGTH']]) {
  const t = reviewed({...EV, id: 's09-miss-' + label.length}, 0), ph = t.p.phases.phases, tw = ph.indexOf('TAPER'), pw = ph.indexOf('POST_EVENT');
  let st = 'ok'; try { for (let w = 0; w < tw; w++) weekly(t, w, {keep}); } catch (e) { st = 'review failed: ' + String(e.message).slice(0, 120); }
  console.log(`\n## (a) ${label}: ${st}\n${st === 'ok' ? walk(t, tw, pw, keep) : ''}`);
}
// (b) short-horizon intakes
for (const days of [12, 19, 26]) {
  const date = addDays('2026-11-02', days), g = gen({...EV, id: 's09-short-' + days, event: {kind: '10K', date}, weeks: 4});
  if (!g.program) { console.log(`\n## (b) intake with the race ${days} days after the start: ${g.status} ${String(g.reason).slice(0, 140)}`); continue; }
  const t = {p: g.program, ledger: []}, ph = t.p.phases.phases, first = ph.findIndex(p => EVENT.includes(p)), pw = ph.indexOf('POST_EVENT');
  console.log(`\n## (b) intake with the race ${days} days after the start (${date}): phases ${ph.join(',')}\n` + walk(t, 0, pw < 0 ? ph.length - 1 : pw));
}
// (c) rebuilds at the start of the taper
for (const [label, x] of [['schedule change 2 -> 3 strength days', {kind: 'SCHEDULE_CHANGE', changes: {strengthDays: [0, 2, 4]}}], ['strength goal GENERAL -> HYPERTROPHY', {kind: 'GOAL_CHANGE', changes: {goals: {strength: 'HYPERTROPHY'}}}]]) {
  const t = reviewed({...EV, id: 's09-rebuild-' + label.length}, 0), ph = t.p.phases.phases, tw = ph.indexOf('TAPER'), pw = ph.indexOf('POST_EVENT');
  for (let w = 0; w < tw; w++) weekly(t, w);
  const r = evaluateProgram(t.p, {...review(t.p, tw, {day: 0, hour: '06:00:00', ...x}), actualLedger: t.ledger}, opts);
  const disc = (r.disclosures ?? []).filter(d => d.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS').map(d => d.detail);
  console.log(`\n## (c) ${label} at the start of the taper: ${r.status} ${r.action ?? ''} | event disclosure: ${disc.join(' / ') || 'none'}`);
  if (r.proposal) { t.ledger = r.actualLedger ?? t.ledger; t.p = r.proposal; console.log(walk(t, tw, pw)); }
}
console.log('\nTOTALS ' + JSON.stringify(tot));
