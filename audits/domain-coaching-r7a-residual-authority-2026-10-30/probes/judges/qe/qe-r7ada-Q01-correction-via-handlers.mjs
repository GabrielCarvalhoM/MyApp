// Q01 (QE reviewer-owned; classes A and B: factual authority, correction consistency). Contract A3 says a review under way whose evidence about an
// earlier week moves this week's PlanningView re-plans the sessions still ahead, so a row planned from a retracted fact is never the reference a
// later log is judged against (EARLY = LATE). The re-plan (viewMovedBy -> REPLAN_FROM_EVIDENCE) is wired in weeklyReview's mid-week branch.
// Attack: deliver the SAME correction on Monday of week 2 through each other review kind the runtime accepts observations with, before any
// week-2 exposure of the corrected exercise, and compare with the correction delivered with week 1's closing review (EARLY). Each pair holds
// the same Monday event (with or without the corrections), so the sessions are structurally the same; every report is built once and sent
// identically. Two histories after the correction:
//   KNOWN_LOWER : db-rdl established at 24 kg (weeks 0-1), the corrections lower both logs to 20 -> history holds KNOWN 20 (heldKnownLoad true)
//   FROM_LOG    : db-rdl established at 20 kg, the corrections remove it (P01's shape) -> history holds FROM_LOG (A1 must protect)
// Week 2 Saturday: db-rdl logged at X kg (3x5 @ RIR 3, target met). Read: the row it was judged against, the closing review's load questions,
// HistoricalState at week 3 Monday (public reader and the state a return reads), and week 3's db-rdl rows.
import * as L from './qe-r7ada-lib.mjs';
const ID = 'db-rdl', out = {probe: 'qe-r7ada-Q01-correction-via-handlers', tree: L.TREE, cases: []};
const kgOf = v => (id, e) => id === ID ? v : (e.load.mode === 'KNOWN' ? e.load.value : 20);
const lower = to => xs => xs.map(e => e.id !== ID ? e : {...e, sets: e.sets.map(x => ({...x, load: {...x.load, value: to}}))}), remove = xs => xs.filter(e => e.id !== ID);
// The Monday event of week 2 for each handler; `obs` is the list of observations it carries.
const HANDLERS = {
  WEEKLY_REVIEW: (p, obs) => L.at(p, 2, 0, '07:00:00', {observations: obs}),
  RECOVERED: (p, obs) => L.at(p, 2, 0, '07:00:00', {kind: 'RECOVERED', observations: obs}),
  SCHEDULE_NOOP: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'SCHEDULE_CHANGE', observations: obs}), changes: {runMinutes: p.canonical.schedule.runMinutes}}),
  GOAL_NOOP: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'GOAL_CHANGE', observations: obs}), changes: {goals: {strength: 'STRENGTH'}}}),
  EQUIP_NOOP: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'EQUIPMENT_CHANGE', observations: obs}), changes: {equipment: [...p.canonical.athlete.equipment]}}),
  EQUIP_ADD: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'EQUIPMENT_CHANGE', observations: obs}), changes: {equipment: [...p.canonical.athlete.equipment, 'BANDS']}}),
  SCHEDULE_NEXT_WEEK: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'SCHEDULE_CHANGE', observations: obs}), changes: {runMinutes: 55}}),
  GOAL_NEXT_WEEK: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'GOAL_CHANGE', observations: obs}), changes: {goals: {strength: 'HYPERTROPHY'}}}),
  UNAVAILABLE_THU: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'UNAVAILABLE_DAY', observations: obs}), changes: {unavailableDates: [L.addDays(p.weeks[2].startDate, 3)]}}),
  LOCAL_FATIGUE_UPPER: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'LOCAL_FATIGUE', observations: obs}), signals: {region: 'UPPER'}}),
  LOCAL_FATIGUE_LOWER: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'LOCAL_FATIGUE', observations: obs}), signals: {region: 'LOWER'}}),
  MISSED_TUE_RUN: (p, obs) => { const s = p.weeks[2].sessions.find(x => L.live(x) && x.sport === 'RUN' && x.day === 1); return {...L.at(p, 2, 1, '21:00:00', {kind: 'MISSED_SESSION', observations: obs}), targetSessionId: s.id}; },
  DOUBLE_CONFLICT_TURN: (p, obs) => ({...L.at(p, 2, 0, '07:00:00', {kind: 'DOUBLE_CONFLICT', observations: obs}), changes: {strengthTurn: 'PM'}}),
};
function reference(shape, X) {
  const first = shape === 'KNOWN_LOWER' ? 24 : 20;
  L.resetIds(); const t = L.gen({id: 'qe-q01'});
  L.weekly(t, 0, () => true, s => L.SAT(s) ? {kg: kgOf(first)} : {});
  const w1 = t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgOf(first)} : {}), eventId: `q01-w1-${i}`}));
  L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: w1}));
  return {first, w1, w2: null, X};
}
function run(shape, X, handler, cell, ref) {
  const first = ref.first; L.resetIds(); const t = L.gen({id: 'qe-q01'});
  L.weekly(t, 0, () => true, s => L.SAT(s) ? {kg: kgOf(first)} : {});
  const has = o => t.p.weeks.some(w => w.sessions.some(s => s.id === o.sessionId && s.prescription?.exercises?.some(e => e.id === ID)));
  const originals = [...t.ledger.filter(o => o.logs?.[ID] && !o.superseded), ...ref.w1.filter(has)], correctedAt = `${L.addDays(t.p.weeks[1].startDate, 6)}T20:30:00Z`;
  const fix = shape === 'KNOWN_LOWER' ? lower(20) : remove;
  const corrections = originals.map(o => L.correctionOf(o, {...structuredClone(o.actual), exercises: fix(o.actual.exercises ?? [])}, correctedAt));
  L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...ref.w1, ...corrections] : ref.w1}));
  const rowPlanned = L.rowsOf(t, 2, L.SAT, [ID]);
  const ev = HANDLERS[handler](t.p, cell === 'LATE' ? corrections : []);
  const d = L.step(t, ev, {allow: true});
  const rowAfterHandler = L.rowsOf(t, 2, L.SAT, [ID]);
  // Week 2 reports, built once per (shape, handler) from the EARLY cell's program so both cells send the same facts.
  if (!ref.w2by?.[handler]) {
    ref.w2by ??= {};
    ref.w2by[handler] = t.p.weeks[2].sessions.filter(s => L.live(s) && s.date > L.addDays(t.p.weeks[2].startDate, 0)).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgOf(X), sets: (id, e) => id === ID ? 3 : e.sets, set: (id, x) => id === ID ? {...x, reps: 5, rir: 3} : x} : {}), eventId: `q01-w2-${s.id}`}));
  }
  const missed = ev.targetSessionId ?? null;
  const reports = ref.w2by[handler].filter(o => o.sessionId !== missed && t.p.weeks[2].sessions.some(s => s.id === o.sessionId && L.live(s)));
  // Day by day at 21:00; Sunday's run with the closing review at 21:00.
  const byDay = new Map(); for (const o of reports) { const s = t.p.weeks[2].sessions.find(x => x.id === o.sessionId); if (!byDay.has(s.day)) byDay.set(s.day, []); byDay.get(s.day).push(structuredClone(o)); }
  for (const day of [1, 2, 3, 4, 5]) if (byDay.has(day)) L.step(t, L.at(t.p, 2, day, '21:00:00', {observations: byDay.get(day)}));
  const close = L.step(t, L.at(t.p, 2, 6, '21:00:00', {observations: byDay.get(6) ?? []}));
  const H3 = L.history(t, 3, 0, '06:00:00');
  return {handlerAction: d.action, handlerStatus: d.status, rowPlannedAtWeek1Close: rowPlanned, rowAfterHandler, rowExecuted: L.rowsOf(t, 2, L.SAT, [ID]), facts: L.facts(t),
    closing: {action: close.action, gate: close.gates?.[ID] ?? null, questions: (close.loadQuestions ?? []).filter(q => q.exerciseId === ID).map(q => `${q.reason}:${q.logged}/${q.planned}`)},
    history: L.hState(H3, ID), week3Rows: L.rowsOf(t, 3, () => true, [ID])};
}
for (const shape of ['KNOWN_LOWER', 'FROM_LOG']) for (const X of shape === 'KNOWN_LOWER' ? [22, 24, 26, 28] : [20, 24]) {
  const ref = reference(shape, X);
  for (const handler of Object.keys(HANDLERS)) {
    let E, La; try { E = run(shape, X, handler, 'EARLY', ref); La = run(shape, X, handler, 'LATE', ref); } catch (e) { out.cases.push({shape, X, handler, error: String(e.message).slice(0, 300)}); continue; }
    const sameFacts = E.facts === La.facts, sameHistory = L.eq(E.history, La.history), sameRows3 = L.eq(E.week3Rows, La.week3Rows);
    out.cases.push({shape, X, handler, sameFacts, sameHistory, sameWeek3Rows: sameRows3, violation: sameFacts && (!sameHistory || !sameRows3), EARLY: E, LATE: La});
  }
}
out.summary = {cases: out.cases.length, errors: out.cases.filter(c => c.error).length, violations: out.cases.filter(c => c.violation).map(c => `${c.shape} X=${c.X} ${c.handler}: EARLY ${JSON.stringify(c.EARLY.history.state)} LATE ${JSON.stringify(c.LATE.history.state)}`), nonIdenticalFacts: out.cases.filter(c => !c.error && !c.sameFacts).map(c => `${c.shape} X=${c.X} ${c.handler}`)};
console.log(JSON.stringify(out, null, 1));
