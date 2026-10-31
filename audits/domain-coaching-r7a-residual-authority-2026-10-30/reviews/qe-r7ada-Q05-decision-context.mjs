// Q05 (QE reviewer-owned; class C: coherent decision resolution). Property: the same facts under the same active context give the same
// resolved prescription, whatever unrelated decision acts afterwards or in whatever order (B1-B3). Beyond P07 (goal change on Monday only):
//  CX1 a strength-goal change (every ordered pair from STRENGTH/HYPERTROPHY/MAINTAIN/RUNNING_SUPPORT) stated on each weekday of week 4 for
//      next week (Mon..Sun 20:00, i.e. before the closing review, and Sun 22:00 after it); week 4 executed and closed (Sunday 21:00).
//  CX2 a schedule change stated on each weekday of week 4 (from next week).
//  CX3 a run-goal change (PERFORMANCE -> REGULAR) and an event set mid-program (10K) stated on Wednesday of week 4.
// In each case, on Monday 06:00 of week 5, cell PLAN does nothing; the other cells run no-op decisions in every order of three
// (EQUIP: an extra equipment item that changes no exercise; SCHED: the current schedule restated; EMPTY: an empty mid-week review).
// Compared: every strength and run row of weeks 5-6 (the resolved prescription) after the no-ops vs PLAN.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q05-decision-context', tree: L.TREE, cases: []};
const NOOP = {
  EQUIP: (p) => ({...L.at(p, 5, 0, '06:00:00', {kind: 'EQUIPMENT_CHANGE'}), changes: {equipment: [...p.canonical.athlete.equipment, 'BANDS']}}),
  SCHED: (p) => ({...L.at(p, 5, 0, '06:05:00', {kind: 'SCHEDULE_CHANGE'}), changes: {runMinutes: p.canonical.schedule.runMinutes}}),
  EMPTY: (p) => L.at(p, 5, 0, '06:10:00', {observations: []}),
};
const ORDERS = [[], ['EQUIP'], ['SCHED'], ['EMPTY'], ['EQUIP', 'SCHED', 'EMPTY'], ['EMPTY', 'EQUIP', 'SCHED'], ['SCHED', 'EMPTY', 'EQUIP'], ['EQUIP', 'EMPTY'], ['EMPTY', 'EQUIP']];
// Same instant ordering: give each no-op its own minute in the order applied.
const rows = t => ({s5: L.rowsOf(t, 5), s6: L.rowsOf(t, 6), r5: L.runRows(t, 5), r6: L.runRows(t, 6)});
function scenario(name, {athlete = {}, change}) {
  const results = {};
  for (const order of ORDERS) {
    L.resetIds(); const t = L.gen({id: 'qe-q05-' + name, athlete});
    for (let w = 0; w < 4; w++) L.weekly(t, w);
    const ch = change(t); // {day, hour, review} or null; applied in week 4
    if (ch && ch.before !== false) L.step(t, ch.review(t.p), {allow: true});
    L.weekly(t, 4);
    if (ch && ch.before === false) L.step(t, ch.review(t.p), {allow: true});
    const actions = [];
    for (const [i, k] of order.entries()) { const r = L.step(t, {...NOOP[k](t.p), asOf: `${t.p.weeks[5].startDate}T06:${String(10 * i).padStart(2, '0')}:00Z`}, {allow: true}); actions.push(`${k}:${r.action}${r.instantiationOnly ? '(inst)' : ''}`); }
    results[order.join('>') || 'PLAN'] = {actions, facts: L.facts(t), rows: rows(t)};
  }
  const plan = results.PLAN, diffs = Object.entries(results).filter(([k, v]) => k !== 'PLAN' && (!L.eq(v.rows, plan.rows))).map(([k, v]) => {
    const d = {}; for (const f of ['s5', 's6', 'r5', 'r6']) { const a = new Set(plan.rows[f]), b = new Set(v.rows[f]); const onlyPlan = [...a].filter(x => !b.has(x)), onlyThis = [...b].filter(x => !a.has(x)); if (onlyPlan.length || onlyThis.length) d[f] = {plan: onlyPlan, after: onlyThis}; } return {order: k, actions: v.actions, diff: d}; });
  out.cases.push({name, sameFacts: Object.values(results).every(v => v.facts === plan.facts), divergingOrders: diffs.length, diffs});
}
const GOALS = ['STRENGTH', 'HYPERTROPHY', 'MAINTAIN', 'RUNNING_SUPPORT'];
const DAYS = [[0, '20:00:00'], [1, '20:00:00'], [2, '20:00:00'], [3, '20:00:00'], [4, '20:00:00'], [5, '20:00:00'], [6, '20:00:00'], [6, '22:00:00']];
for (const g1 of GOALS) for (const g2 of GOALS) if (g1 !== g2) for (const [day, hour] of (process.env.QE_FULL ? DAYS : [[2, '20:00:00'], [4, '20:00:00'], [6, '20:00:00'], [6, '22:00:00']]))
  scenario(`CX1 ${g1}->${g2} day${day} ${hour}`, {athlete: {goals: {run: 'PERFORMANCE', strength: g1}}, change: () => ({before: !(day === 6 && hour === '22:00:00'), review: p => ({...L.at(p, 4, day, hour, {kind: 'GOAL_CHANGE'}), changes: {goals: {strength: g2}}})})});
for (const [day, hour] of DAYS) scenario(`CX2 schedule runMinutes 50 day${day} ${hour}`, {change: () => ({before: !(day === 6 && hour === '22:00:00'), review: p => ({...L.at(p, 4, day, hour, {kind: 'SCHEDULE_CHANGE'}), changes: {runMinutes: 50, strengthMinutes: 45}})})});
scenario('CX3 run goal PERFORMANCE->REGULAR Wed', {change: () => ({review: p => ({...L.at(p, 4, 2, '20:00:00', {kind: 'GOAL_CHANGE'}), changes: {goals: {run: 'REGULAR'}}})})});
scenario('CX3 event 10K set Wed', {change: () => ({review: p => ({...L.at(p, 4, 2, '20:00:00', {kind: 'GOAL_CHANGE'}), changes: {event: {kind: '10K', date: L.addDays(p.weeks[11].startDate, 6)}}})})});
out.summary = {cases: out.cases.length, notSameFacts: out.cases.filter(c => !c.sameFacts).map(c => c.name), diverging: out.cases.filter(c => c.divergingOrders).map(c => `${c.name}: ${c.divergingOrders} orders, e.g. ${JSON.stringify(c.diffs[0]).slice(0, 400)}`)};
console.log(JSON.stringify(out, null, 1));
