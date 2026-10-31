// Q01b (QE reviewer-owned; classes A/B): robustness of Q01 (a correction delivered with a review that does not re-plan this week leaves the
// row planned from the retracted fact as the D44 reference of an exercise history holds as KNOWN at a lower load).
//  (i)   back-squat (TOTAL convention, Wednesday session, intake-known at 80): week 1 logged at 85 (two increments above the row? no: one
//        increment above an 82.5 row is not reachable in week 1), so weeks 0-1 log 80 and week 1's log is corrected out entirely (removed):
//        history keeps KNOWN 80 with one exposure; the stale week-2 row was planned from two exposures at 80.
//  (ii)  CONFLICT: db-rdl established at 24 (weeks 0-1); a wearable record of week 1's Saturday with a different duration quarantines it, so
//        history falls back to week 0's pending 24 (FROM_LOG) -> A1 should protect; and the same with weeks 0-1 at 20 and week 2 Saturday
//        adopted at 22 (row 20 + one increment, target met), the conflict quarantining week 2's Saturday in week 3 (KNOWN 20 in history).
//  (iii) MIRROR: the correction raises the load (20 -> 24): the stale row is LOWER than the fresh one (conservative direction).
// Each pair: EARLY (fact delivered with the previous closing review) vs LATE (same fact delivered Monday 07:00 with handler H), identical reports.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q01b-correction-via-handlers-robustness', tree: L.TREE, cases: []};
const H = {
  WEEKLY_REVIEW: (p, w, obs) => L.at(p, w, 0, '07:00:00', {observations: obs}),
  SCHEDULE_NEXT_WEEK: (p, w, obs) => ({...L.at(p, w, 0, '07:00:00', {kind: 'SCHEDULE_CHANGE', observations: obs}), changes: {runMinutes: 55}}),
  GOAL_NEXT_WEEK: (p, w, obs) => ({...L.at(p, w, 0, '07:00:00', {kind: 'GOAL_CHANGE', observations: obs}), changes: {goals: {strength: 'HYPERTROPHY'}}}),
  UNAVAILABLE_THU: (p, w, obs) => ({...L.at(p, w, 0, '07:00:00', {kind: 'UNAVAILABLE_DAY', observations: obs}), changes: {unavailableDates: [L.addDays(p.weeks[w].startDate, 3)]}}),
  SCHEDULE_NOOP: (p, w, obs) => ({...L.at(p, w, 0, '07:00:00', {kind: 'SCHEDULE_CHANGE', observations: obs}), changes: {runMinutes: p.canonical.schedule.runMinutes}}),
};
const kgFor = (id0, v) => (id, e) => id === id0 ? v : (e.load.mode === 'KNOWN' ? e.load.value : 20);
/** Generic pair: weeks before W built by `setup(t)` which returns {late}: the fact to deliver; EARLY sends it with the closing review of W-1. */
function pair(name, {id, W, setup, weekReports, read}) {
  for (const hk of Object.keys(H)) {
    const cells = {}, shared = {};
    for (const cell of ['EARLY', 'LATE']) {
      L.resetIds(); const t = L.gen({id: 'qe-q01b'});
      const fact = setup(t, cell); // performs weeks 0..W-1 (EARLY includes the fact in W-1's closing review); returns the LATE fact
      const d = L.step(t, H[hk](t.p, W, cell === 'LATE' ? fact : []), {allow: true});
      const row = L.rowsOf(t, W, () => true, [id]);
      shared.reports ??= weekReports(t);
      const reports = shared.reports.filter(o => t.p.weeks[W].sessions.some(s => s.id === o.sessionId && L.live(s)));
      const byDay = new Map(); for (const o of reports) { const s = t.p.weeks[W].sessions.find(x => x.id === o.sessionId); if (!byDay.has(s.day)) byDay.set(s.day, []); byDay.get(s.day).push(structuredClone(o)); }
      for (const day of [1, 2, 3, 4, 5]) if (byDay.has(day)) L.step(t, L.at(t.p, W, day, '21:00:00', {observations: byDay.get(day)}));
      const close = L.step(t, L.at(t.p, W, 6, '21:00:00', {observations: byDay.get(6) ?? []}));
      cells[cell] = {action: d.action, rowAfterHandler: row, facts: L.facts(t), questions: (close.loadQuestions ?? []).filter(q => q.exerciseId === id).map(q => `${q.reason}:${q.logged}/${q.planned}`), history: L.hState(L.history(t, W + 1, 0, '06:00:00'), id), nextRows: L.rowsOf(t, W + 1, () => true, [id])};
    }
    const E = cells.EARLY, La = cells.LATE;
    out.cases.push({name, handler: hk, sameFacts: E.facts === La.facts, sameHistory: L.eq(E.history, La.history), violation: E.facts === La.facts && !L.eq(E.history, La.history), EARLY: E, LATE: La});
  }
}
// (i) back-squat, TOTAL, Wednesday. Weeks 0-1 at 80; week 1's back-squat removed by correction; week 2 Wednesday logged at X (3x5 @ RIR 3).
for (const X of [82.5, 85, 87.5]) pair(`i back-squat X=${X}`, {id: 'back-squat', W: 2,
  setup: (t, cell) => { L.weekly(t, 0); const w1 = t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s), eventId: `b-w1-${i}`}));
    const o = w1.find(x => t.p.weeks[1].sessions.find(s => s.id === x.sessionId)?.prescription?.exercises?.some(e => e.id === 'back-squat'));
    const fix = [L.correctionOf(o, {...structuredClone(o.actual), exercises: o.actual.exercises.filter(e => e.id !== 'back-squat')}, `${L.addDays(t.p.weeks[1].startDate, 6)}T20:30:00Z`)];
    L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w1, ...fix] : w1})); return fix; },
  weekReports: t => t.p.weeks[2].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.WED(s) ? {kg: kgFor('back-squat', X), set: (id, x) => id === 'back-squat' ? {...x, reps: 5, rir: 3} : x} : {}), eventId: `b-w2-${i}`}))});
// (ii-a) CONFLICT: weeks 0-1 db-rdl at 24 (KNOWN 24 by week 1's review), wearable record of week 1's Saturday quarantines it -> FROM_LOG pending.
for (const X of [24, 26]) pair(`ii-a conflict-to-FROM_LOG X=${X}`, {id: 'db-rdl', W: 2,
  setup: (t, cell) => { L.weekly(t, 0, () => true, s => L.SAT(s) ? {kg: kgFor('db-rdl', 24)} : {}); const w1 = t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgFor('db-rdl', 24)} : {}), eventId: `c-w1-${i}`}));
    const sat = t.p.weeks[1].sessions.find(L.SAT), man = w1.find(o => o.sessionId === sat.id);
    const wear = [{eventId: 'c-w1-wear', athleteId: t.p.athleteId, sessionId: sat.id, observedAt: man.observedAt, source: {provider: 'HEALTHKIT', activityId: 'hk-77', quality: 'WEARABLE_FULL'}, actual: {completed: true, minutes: Math.round(man.actual.minutes * 0.5)}, response: {...L.OK}}];
    L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w1, ...wear] : w1})); return wear; },
  weekReports: t => t.p.weeks[2].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgFor('db-rdl', X), sets: (id, e) => id === 'db-rdl' ? 3 : e.sets, set: (id, x) => id === 'db-rdl' ? {...x, reps: 5, rir: 3} : x} : {}), eventId: `c-w2-${i}`}))});
// (ii-b) CONFLICT keeping a KNOWN fact: weeks 0-1 db-rdl at 20 (KNOWN 20), week 2 Saturday logged 22 (adopted), wearable record of week 2's
// Saturday quarantines it in week 3 -> history KNOWN 20; the stale week-3 row was planned from 22.
for (const X of [24, 26]) pair(`ii-b conflict-keeps-KNOWN X=${X}`, {id: 'db-rdl', W: 3,
  setup: (t, cell) => { for (const w of [0, 1]) L.weekly(t, w, () => true, s => L.SAT(s) ? {kg: kgFor('db-rdl', 20)} : {});
    const w2 = t.p.weeks[2].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgFor('db-rdl', 22), set: (id, x) => id === 'db-rdl' ? {...x, rir: 3} : x} : {}), eventId: `d-w2-${i}`}));
    const sat = t.p.weeks[2].sessions.find(L.SAT), man = w2.find(o => o.sessionId === sat.id);
    const wear = [{eventId: 'd-w2-wear', athleteId: t.p.athleteId, sessionId: sat.id, observedAt: man.observedAt, source: {provider: 'HEALTHKIT', activityId: 'hk-88', quality: 'WEARABLE_FULL'}, actual: {completed: true, minutes: Math.round(man.actual.minutes * 0.5)}, response: {...L.OK}}];
    L.step(t, L.at(t.p, 2, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w2, ...wear] : w2})); return wear; },
  weekReports: t => t.p.weeks[3].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgFor('db-rdl', X), sets: (id, e) => id === 'db-rdl' ? 3 : e.sets, set: (id, x) => id === 'db-rdl' ? {...x, reps: 5, rir: 3} : x} : {}), eventId: `d-w3-${i}`}))});
// (iii) MIRROR: weeks 0-1 db-rdl at 20, corrected UP to 24; week 2 Saturday logged at X.
for (const X of [24, 26]) pair(`iii mirror-correction-up X=${X}`, {id: 'db-rdl', W: 2,
  setup: (t, cell) => { L.weekly(t, 0, () => true, s => L.SAT(s) ? {kg: kgFor('db-rdl', 20)} : {}); const w1 = t.p.weeks[1].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgFor('db-rdl', 20)} : {}), eventId: `e-w1-${i}`}));
    const has = o => t.p.weeks.some(w => w.sessions.some(s => s.id === o.sessionId && s.prescription?.exercises?.some(e => e.id === 'db-rdl')));
    const originals = [...t.ledger.filter(o => o.logs?.['db-rdl'] && !o.superseded), ...w1.filter(has)];
    const fix = originals.map(o => L.correctionOf(o, {...structuredClone(o.actual), exercises: (o.actual.exercises ?? []).map(e => e.id !== 'db-rdl' ? e : {...e, sets: e.sets.map(x => ({...x, load: {...x.load, value: 24}}))})}, `${L.addDays(t.p.weeks[1].startDate, 6)}T20:30:00Z`));
    L.step(t, L.at(t.p, 1, 6, '21:00:00', {observations: cell === 'EARLY' ? [...w1, ...fix] : w1})); return fix; },
  weekReports: t => t.p.weeks[2].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, L.SAT(s) ? {kg: kgFor('db-rdl', X), sets: (id, e) => id === 'db-rdl' ? 3 : e.sets, set: (id, x) => id === 'db-rdl' ? {...x, reps: 5, rir: 3} : x} : {}), eventId: `e-w2-${i}`}))});
out.summary = {cases: out.cases.length, violations: out.cases.filter(c => c.violation).map(c => `${c.name} ${c.handler}: EARLY ${JSON.stringify(c.EARLY.history.state)} | LATE ${JSON.stringify(c.LATE.history.state)}`), notSameFacts: out.cases.filter(c => !c.sameFacts).map(c => `${c.name} ${c.handler}`)};
console.log(JSON.stringify(out, null, 1));
