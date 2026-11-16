// Q1: worked examples, three-way: decision JSON (expected) x judge oracle x candidate pure functions.
import { oracle, SPECS, candidateInput, DEC, V, goalRel, wk } from './oracle.mjs';
const WT = process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions';
const RF = await import('file:///' + WT + '/CoachingCore/src/v1-race-forecast.mjs');
const FV = RF.RACE_FORECAST.forecast;
const ex = DEC.workedExamples.forecast;
const rows = []; let bad = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const x of ex) {
  const s = SPECS[x.id]; if (!s) continue;
  const o = oracle(s), c = RF.forecastOf(candidateInput(s), FV), e = x.output;
  const exp = { ps: e.planScenario.forecastSeconds, psS: e.planScenario.status, of: e.observedForecast.forecastSeconds ?? null, ofS: e.observedForecast.status, display: e.display, flags: e.common.flags, status: e.status ?? null };
  const orc = { ps: o.ps.fs, psS: o.ps.status, of: o.of.fs ?? null, ofS: o.of.status, display: o.display, flags: o.flags, status: o.status };
  const can = { ps: c.planScenario?.forecastSeconds, psS: c.planScenario?.status, of: c.observedForecast?.forecastSeconds ?? null, ofS: c.observedForecast?.status, display: c.display, flags: c.flags, status: c.status };
  const okO = ['ps', 'psS', 'of', 'ofS', 'display', 'flags'].every(k => eq(exp[k], orc[k])) && (exp.status === null || exp.status === orc.status);
  const okC = ['ps', 'psS', 'of', 'ofS', 'display', 'flags'].every(k => eq(exp[k], can[k])) && (exp.status === null || exp.status === can.status);
  const okCO = eq(orc, can) || ['ps', 'psS', 'of', 'ofS', 'display', 'flags', 'status'].every(k => eq(orc[k], can[k]));
  // intermediate checks: R_c, R_hi, g, U+F
  const gOK = !c.planScenario || Math.abs(c.planScenario.g_applied - (c.common.U_unobserved + c.planScenario.F_future)) < 1e-12;
  const rcOK = Math.abs(c.common.R_c - e.common.R_c) < 6e-6 && Math.abs(c.common.R_hi - e.common.R_hi) < 6e-6;
  const gExp = Math.abs(c.planScenario.g_applied - e.planScenario.g_applied) < 6e-6;
  const conf = e.confidence === 'LOW' ? c.confidence === 'LOW' : c.confidence !== 'LOW';
  if (!(okO && okC && okCO && gOK && rcOK && gExp && conf)) bad++;
  rows.push({ id: x.id, expected: exp, oracleMatches: okO, candidateMatches: okC, oracleEqCandidate: okCO, gEqUplusF: gOK, RcRhiMatch: rcOK, gMatch: gExp, confidence: [e.confidence, c.confidence, conf], ...(okC ? {} : { candidate: can }), ...(okO ? {} : { oracle: orc }) });
}
// A4-1 race week frozen, through the candidate's raceWeekOf with the week-15 forecast
const a41 = RF.forecastOf(candidateInput(SPECS['A4-1']), FV);
const rw = RF.raceWeekOf({ asOfDay: '2027-04-19', raceDate: '2027-04-25', raceWeekStart: wk(16), lastWeekStart: wk(15), last: a41, marathon: false, completion: false, withdrawal: null, now: { referenceId: 'r', tier: 'HIGH', q8Down: false }, then: { referenceId: 'r', tier: 'HIGH', q8Down: false }, changedSince: null }, FV);
const a41e = ex.find(x => x.id === 'A4-1').raceWeekDisplay;
const rwOK = rw.status === a41e.status && rw.frozenRange.lowSeconds === a41e.frozenRange.lowSeconds && rw.frozenRange.highSeconds === a41e.frozenRange.highSeconds && rw.label === a41e.label && rw.through === a41e.through && rw.goalRelation === a41e.goalRelation;
const rwSat = RF.raceWeekOf({ asOfDay: '2027-04-24', raceDate: '2027-04-25', raceWeekStart: wk(16), lastWeekStart: wk(15), last: a41, now: { referenceId: 'r', tier: 'HIGH' }, then: { referenceId: 'r', tier: 'HIGH' } }, FV).status;
const rwDay = RF.raceWeekOf({ asOfDay: '2027-04-25', raceDate: '2027-04-25', raceWeekStart: wk(16), lastWeekStart: wk(15), last: a41, now: { referenceId: 'r', tier: 'HIGH' }, then: { referenceId: 'r', tier: 'HIGH' } }, FV).status;
const a42 = RF.raceWeekOf({ asOfDay: '2027-04-19', raceDate: '2027-04-25', raceWeekStart: wk(16), lastWeekStart: wk(15), last: a41, now: { referenceId: 'new', tier: 'HIGH' }, then: { referenceId: 'r', tier: 'HIGH' } }, FV);
const h15 = RF.forecastOf(candidateInput(SPECS['A4-3-at15']), FV);
const a43 = RF.raceWeekOf({ asOfDay: '2027-04-19', raceDate: '2027-04-25', raceWeekStart: wk(16), lastWeekStart: wk(15), last: h15, now: { referenceId: 'r', tier: 'HIGH' }, then: { referenceId: 'r', tier: 'HIGH' } }, FV);
// i: window
const weeks26 = Array.from({ length: 26 }, (_, i) => ({ startDate: wk(i + 1) }));
const win = RF.windowOf(wk(1), '2027-06-27', weeks26, FV);
const win10 = RF.windowOf(wk(10), '2027-06-27', weeks26, FV), win9 = RF.windowOf(wk(9), '2027-06-27', weeks26, FV);
// goal relations
const gr = DEC.workedExamples.goalRelation.filter(g => g.goalSeconds).map(g => {
  const sp = SPECS[g.example], c = RF.forecastOf(candidateInput(sp), FV);
  const res = g.relation ? [[g.relation, RF.goalRelationOf(g.goalSeconds, c.observedForecast), goalRel(g.goalSeconds, c.observedForecast.lowSeconds, c.observedForecast.highSeconds)]]
    : [[g.observedForecast.relation, RF.goalRelationOf(g.goalSeconds, c.observedForecast), goalRel(g.goalSeconds, c.observedForecast.lowSeconds, c.observedForecast.highSeconds)], [g.planScenario.relation, RF.goalRelationOf(g.goalSeconds, c.planScenario), goalRel(g.goalSeconds, c.planScenario.lowSeconds, c.planScenario.highSeconds)]];
  return { id: g.id, res, ok: res.every(([a, b, o]) => a === b && b === o) };
});
const out = { forecastExamples: rows.length, forecastMismatches: bad, rows,
  A4_1: { ok: rwOK, status: rw.status, low: rw.frozenRange?.lowSeconds, high: rw.frozenRange?.highSeconds, label: rw.label, saturday: rwSat, raceDay: rwDay },
  A4_2: { status: a42.status, reason: a42.reason, ok: a42.reason === 'REFERENCE_CHANGED_SINCE_FROZEN' },
  A4_3: { week15: h15.status, status: a43.status, reason: a43.reason, ok: a43.reason === 'LAST_FORECAST_NOT_SHOWN' },
  i: { win, ok: win?.status === 'NOT_YET_IN_WINDOW' && win.availableFrom === '2027-03-08' && win.reason.startsWith('174 days'), week10InWindow: win10 === null, week9: win9 },
  goalRelations: gr, goalOK: gr.every(x => x.ok) };
console.log(JSON.stringify(out, null, 1));
