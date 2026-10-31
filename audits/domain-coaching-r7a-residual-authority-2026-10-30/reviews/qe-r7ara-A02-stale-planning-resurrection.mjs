// A02 (QE reviewer-owned, R7ARA engineering recheck; root cause A, QE-R7ADA-01; properties A and B; recheck request §7, §8). Stale planning
// resurrection: planned 24 kg, factual corrected 20 kg. After the correction, other handlers run, executions arrive, adoptions happen, and later a
// return reads the state: HistoricalState must never silently come back to KNOWN 24 without new valid factual evidence, and no row still ahead may
// prescribe the retracted load. Control: the same chain with the correction delivered with week 1's closing review (EARLY); LATE delivers it with
// the first event of week 2. Every report is built once (from EARLY) and sent identically. Checkpoints after every step of the chain:
//   rowsAhead (db-rdl rows not yet executed), history (HistoricalState of db-rdl: reader and the state a return reads), asked (load questions).
// Shapes: DOWN (24 -> 20, both logs) and REMOVE (db-rdl removed from both logs: FROM_LOG, established by effort again).
// Logged at week 2's Saturday: 20 (at the factual row), 22 (one increment: adopted), 24 (the retracted value: asked, D44), 24 + the athlete's
// confirmation of 24 kg per hand (db-rdl's convention) with the closing review (a statement about a new execution; the adoption rule judges it),
// and NONE (session not logged for db-rdl: no new execution).
// Weeks 3-4: an ordinary week, then a SHORT (3-day) or MODERATE (17-day) pause from week 4's Monday, reported the day after it ends.
import * as L from './qe-r7ada-lib.mjs';
const ID = 'db-rdl', out = {probe: 'qe-r7ara-A02-stale-planning-resurrection', tree: L.TREE, cases: []};
const has = s => L.live(s) && s.sport === 'STRENGTH' && s.prescription.exercises.some(e => e.id === ID);
const kgOf = v => (id, e) => id === ID ? v : (e.load.mode === 'KNOWN' ? e.load.value : 20);
const withLoad = to => xs => xs.map(e => e.id !== ID ? e : {...e, sets: e.sets.map(x => ({...x, load: {...x.load, value: to}}))}), without = xs => xs.filter(e => e.id !== ID);
const ev = (p, W, day, hour, obs, kind, extra = {}) => ({...L.at(p, W, day, hour, {kind, observations: obs}), ...extra});
const K = {
  WEEKLY_REVIEW: (p, W, d, h, o) => ev(p, W, d, h, o, 'WEEKLY_REVIEW'),
  SCHEDULE_NEXT_WEEK: (p, W, d, h, o) => ev(p, W, d, h, o, 'SCHEDULE_CHANGE', {changes: {runMinutes: 55}}),
  SCHEDULE_NOOP: (p, W, d, h, o) => ev(p, W, d, h, o, 'SCHEDULE_CHANGE', {changes: {runMinutes: p.canonical.schedule.runMinutes}}),
  GOAL_NEXT_WEEK: (p, W, d, h, o) => ev(p, W, d, h, o, 'GOAL_CHANGE', {changes: {goals: {strength: 'HYPERTROPHY'}}}),
  GOAL_NOOP: (p, W, d, h, o) => ev(p, W, d, h, o, 'GOAL_CHANGE', {changes: {goals: {strength: p.canonical.goals.strength.kind}}}),
  EVENT_SET: (p, W, d, h, o) => ev(p, W, d, h, o, 'GOAL_CHANGE', {changes: {event: {kind: '10K', date: L.addDays(p.startDate, 7 * 13 + 6)}}}),
  UNAVAILABLE_THU: (p, W, d, h, o) => ev(p, W, d, h, o, 'UNAVAILABLE_DAY', {changes: {unavailableDates: [L.addDays(p.weeks[W].startDate, 3)]}}),
  UNAVAILABLE_SUN: (p, W, d, h, o) => ev(p, W, d, h, o, 'UNAVAILABLE_DAY', {changes: {unavailableDates: [L.addDays(p.weeks[W].startDate, 6)]}}),
  LOCAL_FATIGUE_LOWER: (p, W, d, h, o) => ev(p, W, d, h, o, 'LOCAL_FATIGUE', {signals: {region: 'LOWER'}}),
  SYSTEMIC_FATIGUE: (p, W, d, h, o) => ev(p, W, d, h, o, 'SYSTEMIC_FATIGUE'),
  PARTIAL_SESSION: (p, W, d, h, o) => ev(p, W, d, h, o, 'PARTIAL_SESSION'),
  RECOVERED: (p, W, d, h, o) => ev(p, W, d, h, o, 'RECOVERED'),
  TURN_TO_AM: (p, W, d, h, o) => ev(p, W, d, h, o, 'DOUBLE_CONFLICT', {changes: {strengthTurn: 'AM'}}),
  EQUIP_WINDOW: (p, W, d, h, o) => { const d0 = L.addDays(p.weeks[W].startDate, d); return ev(p, W, d, h, o, 'EQUIPMENT_CHANGE', {changes: {equipment: ['DUMBBELLS', 'BENCH'], from: d0, to: L.addDays(d0, 6)}}); },
  EQUIP_NO_BARBELL: (p, W, d, h, o) => ev(p, W, d, h, o, 'EQUIPMENT_CHANGE', {changes: {equipment: ['DUMBBELLS', 'BENCH']}}),
  MISSED_TUE: (p, W, d, h, o) => ev(p, W, d, h, o, 'MISSED_SESSION', {targetSessionId: p.weeks[W].sessions.find(s => L.live(s) && s.sport === 'RUN' && s.day === 1).id}),
};
// A chain: the carrier of the late fact on Monday 07:00 of week 2 (K0), a Wednesday 07:00 handler (K1), a Saturday 07:00 handler (K2), a Monday
// 07:00 handler of week 3 (K3). MISSED_TUE as K1 is reported on Tuesday 21:00 and Tuesday's run is not reported.
const CHAINS = {
  A: ['SCHEDULE_NEXT_WEEK', 'GOAL_NEXT_WEEK', 'UNAVAILABLE_SUN', 'EQUIP_NO_BARBELL'],
  B: ['UNAVAILABLE_THU', 'LOCAL_FATIGUE_LOWER', 'TURN_TO_AM', 'GOAL_NOOP'],
  C: ['EQUIP_WINDOW', 'MISSED_TUE', 'SYSTEMIC_FATIGUE', 'SCHEDULE_NOOP'],
  D: ['WEEKLY_REVIEW', 'EVENT_SET', 'PARTIAL_SESSION', 'RECOVERED'],
};
const SHAPES = {DOWN: {first: 24, edit: withLoad(20)}, REMOVE: {first: 20, edit: without}};
const LOGS = {L20: {kg: 20}, L22: {kg: 22}, L24: {kg: 24}, L24_CONFIRMED: {kg: 24, confirm: true}, NONE: {kg: null}};
function snapshot(t, W, label, r) {
  const ahead = t.p.weeks.slice(W).flatMap(w => w.sessions.filter(s => has(s) && !t.ledger.some(o => o.sessionId === s.id)).map(s => `${s.date} ${s.prescription.exercises.filter(e => e.id === ID).map(e => `${e.load.mode}${e.load.value ?? ''}`).join('')}`)).slice(0, 3);
  const H = L.historyAt(t, r?.asOfOverride ?? t.lastAsOf), h = L.hState(H, ID);
  return {label, action: r ? `${r.status}/${r.action}` : null, ahead, history: h, asked: (r?.loadQuestions ?? []).filter(q => q.exerciseId === ID).map(q => `${q.reason}:${q.logged}/${q.planned}`)};
}
function chainCell(shape, chainName, logName, pause, cellName, shared) {
  const S = SHAPES[shape], C = CHAINS[chainName], LG = LOGS[logName];
  L.resetIds(); const t = L.gen({id: 'qe-a02'}), cps = [];
  const go = (review, label) => { const r = L.step(t, review, {allow: true}); t.lastAsOf = review.asOf; cps.push(snapshot(t, 2, label, r)); return r; };
  // Weeks 0-1: db-rdl logged at S.first; the corrections edit both logs.
  L.weekly(t, 0, () => true, s => has(s) ? {kg: kgOf(S.first)} : {});
  const w1 = t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, has(s) ? {kg: kgOf(S.first)} : {}), eventId: `a02-w1-${i}`}));
  const hasO = o => t.p.weeks.some(w => w.sessions.some(s => s.id === o.sessionId && s.prescription?.exercises?.some(e => e.id === ID)));
  const fix = [...t.ledger.filter(o => o.logs?.[ID] && !o.superseded), ...w1.filter(hasO)].map(o => L.correctionOf(o, {...structuredClone(o.actual), exercises: S.edit(o.actual.exercises ?? [])}, `${L.addDays(t.p.weeks[1].startDate, 6)}T20:30:00Z`));
  go(L.at(t.p, 1, 6, '21:00:00', {observations: cellName === 'EARLY' ? [...w1, ...fix] : w1}), 'w1 close');
  // Week 2: the chain, with the day reports in between (built once).
  const rep = (s, kg) => ({...L.obs(t.p, s, has(s) && kg !== null ? {kg: kgOf(kg), sets: (id, e) => id === ID ? 3 : e.sets, set: (id, x) => id === ID ? {...x, reps: 5, rir: 3} : x} : has(s) ? {drop: [ID]} : {}), eventId: `a02-w${s.weekIndex}-${s.id}`});
  const day = (W, d, kg = 20, skip = null) => { const k = `${W}-${d}`; shared[k] ??= t.p.weeks[W].sessions.filter(s => L.live(s) && s.day === d && s.id !== skip).map(s => rep(s, kg)); const o = shared[k].filter(x => t.p.weeks[W].sessions.some(s => s.id === x.sessionId && L.live(s))); return o; };
  go(K[C[0]](t.p, 2, 0, '07:00:00', cellName === 'LATE' ? structuredClone(fix) : []), `w2 Mon ${C[0]}${cellName === 'LATE' ? ' +fact' : ''}`);
  const missed = C[1] === 'MISSED_TUE' ? t.p.weeks[2].sessions.find(s => L.live(s) && s.sport === 'RUN' && s.day === 1).id : null;
  if (missed) go(K.MISSED_TUE(t.p, 2, 1, '21:00:00', []), 'w2 Tue MISSED');
  else { const o = day(2, 1); if (o.length) go(L.at(t.p, 2, 1, '21:00:00', {observations: structuredClone(o)}), 'w2 Tue report'); }
  if (!missed) go(K[C[1]](t.p, 2, 2, '07:00:00', []), `w2 Wed ${C[1]}`);
  for (const d of [2, 3, 4]) { const o = day(2, d); if (o.length) go(L.at(t.p, 2, d, '21:00:00', {observations: structuredClone(o)}), `w2 d${d} report`); }
  go(K[C[2]](t.p, 2, 5, '07:00:00', []), `w2 Sat ${C[2]}`);
  { const o = day(2, 5, LG.kg); if (o.length) go(L.at(t.p, 2, 5, '21:00:00', {observations: structuredClone(o)}), `w2 Sat log ${logName}`); }
  { const o = day(2, 6); go({...L.at(t.p, 2, 6, '21:00:00', {observations: structuredClone(o)}), ...(LG.confirm ? {loadConfirmations: [{exerciseId: ID, value: 24, unit: 'KG', convention: 'PER_HAND'}]} : {})}, 'w2 close'); }
  // Week 3: K3 on Monday, then an ordinary week, db-rdl logged at the row (as prescribed).
  go(K[C[3]](t.p, 3, 0, '07:00:00', []), `w3 Mon ${C[3]}`);
  for (const d of [1, 2, 3, 4, 5]) { const o = t.p.weeks[3].sessions.filter(s => L.live(s) && s.day === d).map(s => ({...L.obs(t.p, s), eventId: `a02-w3-${s.id}`})); shared[`3-${d}`] ??= o; const oo = shared[`3-${d}`].filter(x => t.p.weeks[3].sessions.some(s => s.id === x.sessionId && L.live(s))); if (oo.length) go(L.at(t.p, 3, d, '21:00:00', {observations: structuredClone(oo)}), `w3 d${d} report`); }
  { const o = t.p.weeks[3].sessions.filter(s => L.live(s) && s.day === 6).map(s => ({...L.obs(t.p, s), eventId: `a02-w3-${s.id}`})); shared['3-6'] ??= o; go(L.at(t.p, 3, 6, '21:00:00', {observations: structuredClone(shared['3-6'].filter(x => t.p.weeks[3].sessions.some(s => s.id === x.sessionId && L.live(s))))}), 'w3 close'); }
  // Week 4 Monday: the pause, reported the day after it ends.
  const days = pause === 'SHORT' ? 3 : 17, start = t.p.weeks[4].startDate, end = L.addDays(start, days - 1), report = L.addDays(end, 1), RW = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  const rr = L.step(t, L.at(t.p, RW, Math.round((Date.parse(report) - Date.parse(t.p.weeks[RW].startDate)) / 864e5), '06:00:00', L.brk(start, end)), {allow: true});
  t.lastAsOf = `${report}T06:00:00Z`;
  const entry = t.p.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[ID] ?? null;
  const retRows = t.p.weeks.slice(RW).flatMap(w => w.sessions.filter(s => has(s) && s.date >= report).map(s => `${s.date} ${s.prescription.exercises.filter(e => e.id === ID).map(e => `${e.load.mode}${e.load.value ?? ''} ${e.sets}x${e.reps}${e.load.rule ? ' rule' : ''}`).join('')}`)).slice(0, 2);
  cps.push({label: `return ${pause}`, action: `${rr.status}/${rr.action}`, ahead: retRows, history: L.hState(L.historyAt(t, `${report}T06:00:00Z`), ID), entry: entry && {mode: entry.mode, load: entry.load ?? null, ceiling: entry.ceiling ?? null, returnStep: entry.returnStep ?? null}, asked: []});
  return {cps, facts: L.facts(t)};
}
for (const shape of Object.keys(SHAPES)) for (const chainName of Object.keys(CHAINS)) for (const logName of Object.keys(LOGS)) for (const pause of ['SHORT', 'MODERATE']) {
  if (shape === 'REMOVE' && !['L24', 'NONE'].includes(logName)) continue;
  const shared = {};
  let E, La; try { E = chainCell(shape, chainName, logName, pause, 'EARLY', shared); La = chainCell(shape, chainName, logName, pause, 'LATE', shared); } catch (e) { out.cases.push({shape, chain: chainName, log: logName, pause, error: String(e.stack).slice(0, 400)}); continue; }
  // Compared from the first checkpoint after the late fact arrived in LATE (checkpoint 0, week 1's close, differs by construction).
  const diverge = E.cps.map((c, i) => ({label: c.label, ahead: L.eq(c.ahead, La.cps[i]?.ahead), history: L.eq(c.history, La.cps[i]?.history), asked: L.eq(c.asked, La.cps[i]?.asked), entry: L.eq(c.entry ?? null, La.cps[i]?.entry ?? null)})).slice(1).filter(x => !(x.ahead && x.history && x.asked && x.entry));
  // Resurrection (absolute, besides EARLY = LATE): in week 2 after the late fact arrived and before the close, a row ahead or HistoricalState
  // carries the retracted 24 kg or more (DOWN), or a KNOWN row/state for the removed exercise (REMOVE); at week 2's close, HistoricalState at 24
  // or more without the athlete's confirmation. Later weeks may progress legitimately from an adopted 22, so they are judged by EARLY = LATE only.
  const weekTwo = c => /^w2 (Mon|Tue|Wed|d\d|Sat)/.test(c.label), atClose = c => c.label === 'w2 close';
  const resurrect = cps => cps.filter((c, i) => i >= 1).filter(c => {
    const st = c.history?.state;
    if (shape === 'DOWN') return weekTwo(c) && (st?.mode === 'KNOWN' && st.load >= 24 || c.ahead.some(r => /KNOWN(2[4-9]|[3-9]\d)/.test(r))) || atClose(c) && logName !== 'L24_CONFIRMED' && st?.mode === 'KNOWN' && st.load >= 24;
    return weekTwo(c) && !/Sat log/.test(c.label) && (st?.mode === 'KNOWN' || c.ahead.some(r => /KNOWN/.test(r)));
  }).map(c => `${c.label}: hist ${c.history?.state?.mode}${c.history?.state?.load ?? ''} ahead ${c.ahead.join(';')}`);
  out.cases.push({shape, chain: chainName, log: logName, pause, sameFacts: E.facts === La.facts, divergence: diverge, resurrectionLATE: resurrect(La.cps), resurrectionEARLY: resurrect(E.cps), EARLY: E.cps, LATE: La.cps});
}
const ok = out.cases.filter(c => !c.error);
out.summary = {cases: out.cases.length, errors: out.cases.filter(c => c.error).map(c => `${c.shape} ${c.chain} ${c.log} ${c.pause}: ${c.error.slice(0, 200)}`), notSameFacts: ok.filter(c => !c.sameFacts).map(c => `${c.shape} ${c.chain} ${c.log} ${c.pause}`),
  divergent: ok.filter(c => c.sameFacts && c.divergence.length).map(c => `${c.shape} ${c.chain} ${c.log} ${c.pause}: ${c.divergence.map(d => d.label + '[' + Object.entries(d).filter(([k, v]) => k !== 'label' && !v).map(([k]) => k).join('+') + ']').join(', ')}`),
  resurrection: ok.filter(c => c.resurrectionLATE.length || c.resurrectionEARLY.length).map(c => `${c.shape} ${c.chain} ${c.log} ${c.pause}: LATE ${c.resurrectionLATE.join(' | ')} EARLY ${c.resurrectionEARLY.join(' | ')}`)};
console.log(JSON.stringify(out, null, 1));
