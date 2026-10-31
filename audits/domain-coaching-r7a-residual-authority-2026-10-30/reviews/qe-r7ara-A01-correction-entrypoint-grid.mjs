// A01 (QE reviewer-owned, R7ARA engineering recheck; root cause A, QE-R7ADA-01; properties A and B). Attack grid for contract A5: the same
// canonical factual evidence delivered through a different decision entrypoint must give the same factual truth before the decision.
// One cell = (timing, shape, logged load X, entrypoint kind). EARLY delivers the late fact with the closing review of week W-1; LATE delivers the
// same fact (same ids, same correctedAt) with the entrypoint's event in week W. Every week-W report is built once (from the EARLY program) and sent
// identically in both cells, so the canonical facts are equal (checked: sameFacts). Read per cell:
//   ahead    the corrected exercise's rows in week W right after the event (the D44 reference of the next log),
//   asked    the closing review's load questions for the exercise (D44/D45 semantics),
//   history  HistoricalState of the exercise at the start of week W+1 (reader and the state a return reads),
//   next     week W+1's rows of the exercise.
// violation = sameFacts && (ahead, asked, history or next differ). Timings (QE_TIMING):
//   MON            event Monday 07:00 of week W (the exercise's session is a later date)
//   SAMEDAY        event 07:00 on the day of the exercise's PM session (later today), every earlier session of W reported
//   LASTDAY        strength on Wed and Sun: event Sunday 07:00, before Sunday's PM session (the week's last day; A3 missed this)
//   AM_BEFORE      strength AM: event 11:00 on the session's day, session executed 11:30 (ahead by C1: unreported, before noon)
//   AM_AFTER_A4    strength AM: event 13:00, session executed 08:00 (before the fact arrived: contract A4, judged against the row in force)
//   AM_AFTER_LATE  strength AM: event 13:00, session executed 14:00 (after the fact arrived; C1 already reads an AM session past noon as past)
// The last two are classification cells (A4 and the C1 convention); they are reported apart from the violations of the other four timings.
import * as L from './qe-r7ada-lib.mjs';
const TIMING = process.env.QE_TIMING ?? 'MON', ID = 'db-rdl';
const SCHED = {MON: {}, SAMEDAY: {}, LASTDAY: {strengthDays: [2, 6]}, AM_BEFORE: {strengthTurn: 'AM'}, AM_AFTER_A4: {strengthTurn: 'AM'}, AM_AFTER_LATE: {strengthTurn: 'AM'}}[TIMING];
if (!SCHED) throw Error('QE_TIMING ' + TIMING);
const out = {probe: 'qe-r7ara-A01-correction-entrypoint-grid', tree: L.TREE, timing: TIMING, cases: []};
const has = s => L.live(s) && s.sport === 'STRENGTH' && s.prescription.exercises.some(e => e.id === ID);
const exSession = (p, w) => p.weeks[w].sessions.find(has);
const kgOf = v => (id, e) => id === ID ? v : (e.load.mode === 'KNOWN' ? e.load.value : 20);
const withLoad = to => xs => xs.map(e => e.id !== ID ? e : {...e, sets: e.sets.map(x => ({...x, load: {...x.load, value: to}}))}), without = xs => xs.filter(e => e.id !== ID);
const EVENT_AT = {MON: [null, '07:00:00'], SAMEDAY: ['ex', '07:00:00'], LASTDAY: ['ex', '07:00:00'], AM_BEFORE: ['ex', '11:00:00'], AM_AFTER_A4: ['ex', '13:00:00'], AM_AFTER_LATE: ['ex', '13:00:00']}[TIMING];
const EXEC_AT = {AM_BEFORE: '11:30:00', AM_AFTER_A4: '08:00:00', AM_AFTER_LATE: '14:00:00'}[TIMING] ?? null;
// ---------- shapes: the weeks before W and the late fact ----------
const correctedAt = p => `${L.addDays(p.weeks[1].startDate, 6)}T20:30:00Z`;
const establish = (t, w0, w1kg) => { L.weekly(t, 0, () => true, s => has(s) ? {kg: kgOf(w0)} : {}); return t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, has(s) ? {kg: kgOf(w1kg)} : {}), eventId: `a01-w1-${i}`})); };
const hasObs = (t, o) => t.p.weeks.some(w => w.sessions.some(s => s.id === o.sessionId && s.prescription?.exercises?.some(e => e.id === ID)));
const correctAll = (first, edit) => (t, cell) => {
  const w1 = establish(t, first, first), originals = [...t.ledger.filter(o => o.logs?.[ID] && !o.superseded), ...w1.filter(o => hasObs(t, o))];
  const fix = originals.map(o => L.correctionOf(o, {...structuredClone(o.actual), exercises: edit(o.actual.exercises ?? [])}, correctedAt(t.p)));
  L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w1, ...fix] : w1})); return fix;
};
const SHAPES = {
  // 24 -> 20 (downward): history KNOWN 20; a log one increment above it (22) is adopted, two increments (24, the retracted value) asked (D44).
  DOWN: {W: 2, loads: [22, 24], setup: correctAll(24, withLoad(20))},
  // 20 -> 24 (upward): history KNOWN 24; 26 is one increment above the corrected load, 28 two.
  UP: {W: 2, loads: [26, 28], setup: correctAll(20, withLoad(24))},
  // Retraction of the exercise from both logs: history FROM_LOG, established by effort again (P2).
  REMOVE: {W: 2, loads: [24], setup: correctAll(20, without)},
  // Retraction of the latest log only: one exposure left at 24 (an establishment that waits for confirmation, D45).
  REMOVE_LAST: {W: 2, loads: [24, 26], setup: (t, cell) => {
    const w1 = establish(t, 24, 24), o = w1.find(x => hasObs(t, x)), fix = [L.correctionOf(o, {...structuredClone(o.actual), exercises: without(o.actual.exercises)}, correctedAt(t.p))];
    L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w1, ...fix] : w1})); return fix; }},
  // A late wearable record of week 2's session (half the duration) quarantines the 22 kg adoption: history back to KNOWN 20 (Q01b ii-b's shape).
  CONFLICT: {W: 3, loads: [24], setup: (t, cell) => {
    for (const w of [0, 1]) L.weekly(t, w, () => true, s => has(s) ? {kg: kgOf(20)} : {});
    const w2 = t.p.weeks[2].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, has(s) ? {kg: kgOf(22), set: (id, x) => id === ID ? {...x, rir: 3} : x} : {}), eventId: `a01-w2-${i}`}));
    const ex = exSession(t.p, 2), man = w2.find(o => o.sessionId === ex.id);
    const wear = [{eventId: 'a01-w2-wear', athleteId: t.p.athleteId, sessionId: ex.id, observedAt: man.observedAt, source: {provider: 'HEALTHKIT', activityId: 'hk-a01', quality: 'WEARABLE_FULL'}, actual: {completed: true, minutes: Math.round(man.actual.minutes * 0.5)}, response: {...L.OK}}];
    L.step(t, L.at(t.p, 2, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w2, ...wear] : w2})); return wear; }},
};
// ---------- entrypoints: every review kind the runtime dispatches, with ordinary payloads ----------
// plan(p,W,evDay) names sessions that are not reported (a missed one, the sessions inside a pause); build(...) returns the review.
const ev = (p, W, day, hour, obs, x = {}) => ({...L.at(p, W, day, hour, {kind: x.kind ?? 'WEEKLY_REVIEW', observations: obs}), ...x.extra});
const earlier = (p, W, evDay, pred) => p.weeks[W].sessions.filter(s => L.live(s) && s.day < evDay && pred(s)).at(-1) ?? null;
const later = (p, W, evDay) => { const d = p.weeks[W].sessions.filter(s => L.live(s) && s.day > evDay && !has(s)).map(s => s.date)[0]; return d ?? L.addDays(p.weeks[W].startDate, 8); };
const perf = kind => ({build: (p, W, day, hour, obs) => { const s = earlier(p, W, day, x => x.sport === 'STRENGTH') ?? p.weeks[W - 1].sessions.find(has); return ev(p, W, day, hour, obs, {kind, extra: {targetSessionId: s.id}}); }});
const KINDS = {
  WEEKLY_REVIEW: {build: (p, W, d, h, o) => ev(p, W, d, h, o)},
  RECOVERED: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'RECOVERED'})},
  PARTIAL_SESSION: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'PARTIAL_SESSION'})},
  UNDERPERFORMANCE: perf('UNDERPERFORMANCE'), OVERPERFORMANCE: perf('OVERPERFORMANCE'), PROGRESSION_NOT_TOLERATED: perf('PROGRESSION_NOT_TOLERATED'), PROGRESSION_TOO_EASY: perf('PROGRESSION_TOO_EASY'),
  LOCAL_FATIGUE_LOWER: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'LOCAL_FATIGUE', extra: {signals: {region: 'LOWER'}}})},
  LOCAL_FATIGUE_UPPER: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'LOCAL_FATIGUE', extra: {signals: {region: 'UPPER'}}})},
  SYSTEMIC_FATIGUE: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'SYSTEMIC_FATIGUE'})},
  SCHEDULE_NOOP: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'SCHEDULE_CHANGE', extra: {changes: {runMinutes: p.canonical.schedule.runMinutes}}})},
  SCHEDULE_NEXT_WEEK: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'SCHEDULE_CHANGE', extra: {changes: {runMinutes: 55}}})},
  GOAL_NOOP: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'GOAL_CHANGE', extra: {changes: {goals: {strength: 'STRENGTH'}}}})},
  GOAL_NEXT_WEEK: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'GOAL_CHANGE', extra: {changes: {goals: {strength: 'HYPERTROPHY'}}}})},
  EVENT_SET: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'GOAL_CHANGE', extra: {changes: {event: {kind: '10K', date: L.addDays(p.startDate, 7 * 13 + 6)}}}})},
  EVENT_DATE_ASK: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'EVENT_DATE_CHANGE', extra: {changes: {}}})},
  EVENT_WEEK_CONFLICT: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'EVENT_WEEK_CONFLICT', extra: {changes: {unavailableDates: [later(p, W, d)]}}})},
  UNAVAILABLE_LATER: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'UNAVAILABLE_DAY', extra: {changes: {unavailableDates: [later(p, W, d)]}}})},
  UNAVAILABLE_EXDAY: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'UNAVAILABLE_DAY', extra: {changes: {unavailableDates: [exSession(p, W).date]}}})},
  TURN_TO_PM: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'DOUBLE_CONFLICT', extra: {changes: {strengthTurn: 'PM'}}})},
  TURN_TO_AM: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'DOUBLE_CONFLICT', extra: {changes: {strengthTurn: 'AM'}}})},
  EQUIP_NOOP: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'EQUIPMENT_CHANGE', extra: {changes: {equipment: [...p.canonical.athlete.equipment]}}})},
  EQUIP_ADD: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'EQUIPMENT_CHANGE', extra: {changes: {equipment: [...p.canonical.athlete.equipment, 'BANDS']}}})},
  EQUIP_NO_BARBELL: {build: (p, W, d, h, o) => ev(p, W, d, h, o, {kind: 'EQUIPMENT_CHANGE', extra: {changes: {equipment: ['DUMBBELLS', 'BENCH']}}})},
  EQUIP_WINDOW: {build: (p, W, d, h, o) => { const day0 = L.addDays(p.weeks[W].startDate, d); return ev(p, W, d, h, o, {kind: 'EQUIPMENT_CHANGE', extra: {changes: {equipment: ['DUMBBELLS', 'BENCH'], from: day0, to: L.addDays(day0, 6)}}}); }},
  // A missed earlier session of week W (not reported); on Monday, the Tuesday run reported missed on Tuesday evening (Q01's shape).
  MISSED: {plan: (p, W, d) => ({missed: (d > 0 ? earlier(p, W, d, s => s.sport === 'RUN') : p.weeks[W].sessions.find(s => L.live(s) && s.sport === 'RUN' && s.day === 1))?.id}),
    at: (p, W, d) => d > 0 ? null : {day: 1, hour: '21:00:00'}, build: (p, W, d, h, o, plan) => ev(p, W, d, h, o, {kind: 'MISSED_SESSION', extra: {targetSessionId: plan.missed}})},
  // A short return report: the three days before the event day are the pause (their sessions not reported). Not on Monday (week W-1 executed).
  RETURN_SHORT: {skip: () => TIMING === 'MON', plan: (p, W, d) => ({pause: [L.addDays(p.weeks[W].startDate, d - 3), L.addDays(p.weeks[W].startDate, d - 1)]}),
    build: (p, W, d, h, o, plan) => ({...L.at(p, W, d, h, {observations: o}), event: {id: L.uid(`a01-${W}-RETURN`), kind: 'RETURN_AFTER_PAUSE'}, interruption: {days: 3, startDate: plan.pause[0], endDate: plan.pause[1], reasonCategory: 'TRAVEL', reason: 'Work travel'}})},
};
const excluded = (s, plan) => s.id === plan.missed || (plan.pause && s.date >= plan.pause[0] && s.date <= plan.pause[1]);
function cell(shape, X, kindName, cellName, shared) {
  const S = SHAPES[shape], K = KINDS[kindName], W = S.W;
  L.resetIds(); const t = L.gen({id: 'qe-a01', schedule: SCHED});
  const fact = S.setup(t, cellName), ex0 = exSession(t.p, W);
  let evDay = EVENT_AT[0] === 'ex' ? ex0.day : 0, evHour = EVENT_AT[1];
  const plan = K.plan?.(t.p, W, evDay) ?? {}, moved = K.at?.(t.p, W, evDay); if (moved) { evDay = moved.day; evHour = moved.hour; }
  const reportOf = s => { const o = L.obs(t.p, s, has(s) ? {kg: kgOf(X), sets: (id, e) => id === ID ? 3 : e.sets, set: (id, x) => id === ID ? {...x, reps: 5, rir: 3} : x} : {}); return {...o, eventId: `a01-w${W}-${s.id}`, ...(has(s) && EXEC_AT ? {observedAt: `${s.date}T${EXEC_AT}Z`} : {})}; };
  // Sessions of W before the event day, reported each evening (identical in both cells: built once).
  shared.pre ??= t.p.weeks[W].sessions.filter(s => L.live(s) && s.day < evDay && !excluded(s, plan)).map(reportOf);
  // AM_AFTER_A4: the AM session itself was executed (08:00) before the fact arrived (13:00); it is reported that evening with the rest.
  for (let day = 0; day < evDay; day++) { const o = shared.pre.filter(x => t.p.weeks[W].sessions.find(s => s.id === x.sessionId)?.day === day); if (o.length) L.step(t, L.at(t.p, W, day, '21:00:00', {observations: structuredClone(o)})); }
  const r = K.build(t.p, W, evDay, evHour, cellName === 'LATE' ? structuredClone(fact) : [], plan), d = L.step(t, r, {allow: true});
  const ahead = L.rowsOf(t, W, s => s.date >= L.addDays(t.p.weeks[W].startDate, evDay), [ID]);
  shared.post ??= t.p.weeks[W].sessions.filter(s => L.live(s) && s.day >= evDay && !excluded(s, plan) && !shared.pre.some(o => o.sessionId === s.id)).map(reportOf);
  const post = shared.post.filter(o => t.p.weeks[W].sessions.some(s => s.id === o.sessionId && L.live(s)));
  const dayOf = o => t.p.weeks[W].sessions.find(s => s.id === o.sessionId).day;
  for (let day = evDay; day < 6; day++) { const o = post.filter(x => dayOf(x) === day); if (o.length) L.step(t, L.at(t.p, W, day, '21:00:00', {observations: structuredClone(o)})); }
  const close = L.step(t, L.at(t.p, W, 6, '21:00:00', {observations: structuredClone(post.filter(x => dayOf(x) === 6))}));
  return {event: {action: d.action, status: d.status, decisions: (d.proposal?.decisions ?? []).filter(x => x.eventId === r.event.id).map(x => x.action)}, ahead, facts: L.facts(t),
    asked: (close.loadQuestions ?? []).filter(q => q.exerciseId === ID).map(q => `${q.reason}:${q.logged}/${q.planned}`), history: L.hState(L.history(t, W + 1), ID), next: L.rowsOf(t, W + 1, () => true, [ID]), unreported: post.length !== shared.post.length};
}
for (const [shape, S] of Object.entries(SHAPES)) for (const X of S.loads) for (const kindName of Object.keys(KINDS)) {
  if (KINDS[kindName].skip?.()) continue;
  const shared = {};
  let E, La; try { E = cell(shape, X, kindName, 'EARLY', shared); La = cell(shape, X, kindName, 'LATE', shared); } catch (e) { out.cases.push({shape, X, kind: kindName, error: String(e.message).slice(0, 300)}); continue; }
  const sameFacts = E.facts === La.facts, same = {ahead: L.eq(E.ahead, La.ahead), asked: L.eq(E.asked, La.asked), history: L.eq(E.history, La.history), next: L.eq(E.next, La.next)};
  out.cases.push({shape, X, kind: kindName, sameFacts, same, violation: sameFacts && !Object.values(same).every(Boolean), EARLY: E, LATE: La});
}
const ok = out.cases.filter(c => !c.error);
out.summary = {timing: TIMING, classification: ['AM_AFTER_A4', 'AM_AFTER_LATE'].includes(TIMING), cases: out.cases.length, errors: out.cases.filter(c => c.error).map(c => `${c.shape} X=${c.X} ${c.kind}: ${c.error}`), notSameFacts: ok.filter(c => !c.sameFacts).map(c => `${c.shape} X=${c.X} ${c.kind}`),
  violations: ok.filter(c => c.violation).map(c => `${c.shape} X=${c.X} ${c.kind}: ${Object.entries(c.same).filter(([, v]) => !v).map(([k]) => k).join('+')} | EARLY ahead=${c.EARLY.ahead.join(';')} asked=${c.EARLY.asked} hist=${c.EARLY.history.state?.mode}${c.EARLY.history.state?.load ?? ''} | LATE ahead=${c.LATE.ahead.join(';')} asked=${c.LATE.asked} hist=${c.LATE.history.state?.mode}${c.LATE.history.state?.load ?? ''}`),
  lateEventStatuses: Object.entries(ok.reduce((m, c) => { const k = `${c.LATE.event.status}/${c.LATE.event.action}`; m[k] = (m[k] ?? 0) + 1; return m; }, {})).map(([k, v]) => `${k}:${v}`)};
console.log(JSON.stringify(out, null, 1));
