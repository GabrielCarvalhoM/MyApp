// A03 (QE reviewer-owned, R7ARA engineering recheck): minimized reproduction of QE-R7ARA-OBS-1, the C1 noon boundary of A5's re-plan.
// Strength AM (Wednesday and Saturday). db-rdl logged 24 kg in weeks 0-1; both logs corrected to 20 kg (history KNOWN 20). Week 2: every session
// before Saturday reported. EARLY: the corrections come with week 1's closing review. LATE: the same corrections come Saturday 13:00 with a plain
// WEEKLY_REVIEW: Saturday's AM session is not ahead by C1 (an AM session is over at noon), so A5 does not re-plan its row. The athlete then runs
// it at EXEC (14:00, after the fact arrived; 08:00 is the A4 control: before it) at 24 kg, 3x5 @ RIR 3, and week 2 closes on Sunday.
import * as L from './qe-r7ada-lib.mjs';
const ID = 'db-rdl', has = s => L.live(s) && s.sport === 'STRENGTH' && s.prescription.exercises.some(e => e.id === ID);
const kgOf = v => (id, e) => id === ID ? v : (e.load.mode === 'KNOWN' ? e.load.value : 20), withLoad = to => xs => xs.map(e => e.id !== ID ? e : {...e, sets: e.sets.map(x => ({...x, load: {...x.load, value: to}}))});
const out = {probe: 'qe-r7ara-A03-am-after-noon-minimal', tree: L.TREE, cells: []};
for (const EXEC of ['14:00:00', '08:00:00']) {
  const shared = {}, res = {};
  for (const cell of ['EARLY', 'LATE']) {
    L.resetIds(); const t = L.gen({id: 'qe-a03', schedule: {strengthTurn: 'AM'}});
    L.weekly(t, 0, () => true, s => has(s) ? {kg: kgOf(24)} : {});
    const w1 = t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, has(s) ? {kg: kgOf(24)} : {}), eventId: `a03-w1-${i}`}));
    const hasO = o => t.p.weeks.some(w => w.sessions.some(s => s.id === o.sessionId && s.prescription?.exercises?.some(e => e.id === ID)));
    const fix = [...t.ledger.filter(o => o.logs?.[ID] && !o.superseded), ...w1.filter(hasO)].map(o => L.correctionOf(o, {...structuredClone(o.actual), exercises: withLoad(20)(o.actual.exercises ?? [])}, `${L.addDays(t.p.weeks[1].startDate, 6)}T20:30:00Z`));
    L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w1, ...fix] : w1}));
    const sat = t.p.weeks[2].sessions.find(has);
    shared.pre ??= t.p.weeks[2].sessions.filter(s => L.live(s) && s.day < sat.day).map(s => ({...L.obs(t.p, s), eventId: `a03-w2-${s.id}`}));
    for (const d of [0, 1, 2, 3, 4]) { const o = shared.pre.filter(x => t.p.weeks[2].sessions.find(s => s.id === x.sessionId).day === d); if (o.length) L.step(t, L.at(t.p, 2, d, '21:00:00', {observations: structuredClone(o)})); }
    const ev = L.step(t, L.at(t.p, 2, sat.day, '13:00:00', {observations: cell === 'LATE' ? structuredClone(fix) : []}), {allow: true});
    const rowInForce = L.rowsOf(t, 2, s => s.id === sat.id, [ID]);
    shared.sat ??= {...L.obs(t.p, t.p.weeks[2].sessions.find(s => s.id === sat.id), {kg: kgOf(24), sets: (id, e) => id === ID ? 3 : e.sets, set: (id, x) => id === ID ? {...x, reps: 5, rir: 3} : x}), eventId: 'a03-w2-sat', observedAt: `${sat.date}T${EXEC}Z`};
    L.step(t, L.at(t.p, 2, sat.day, '21:00:00', {observations: [structuredClone(shared.sat)]}));
    const close = L.step(t, L.at(t.p, 2, 6, '21:00:00', {observations: t.p.weeks[2].sessions.filter(s => L.live(s) && s.day === 6).map(s => ({...L.obs(t.p, s), eventId: `a03-w2-${s.id}`}))}));
    res[cell] = {event: `${ev.status}/${ev.action}`, rowInForce, asked: (close.loadQuestions ?? []).filter(q => q.exerciseId === ID).map(q => `${q.reason}:${q.logged}/${q.planned}`), history: L.hState(L.history(t, 3), ID).state, week3: L.rowsOf(t, 3, () => true, [ID]), facts: L.facts(t)};
  }
  out.cells.push({executedAt: EXEC, factArrivedAt: '13:00:00', sameFacts: res.EARLY.facts === res.LATE.facts, EARLY: res.EARLY, LATE: res.LATE, diverges: JSON.stringify(res.EARLY.history) !== JSON.stringify(res.LATE.history) || JSON.stringify(res.EARLY.asked) !== JSON.stringify(res.LATE.asked)});
}
console.log(JSON.stringify(out, null, 1));
