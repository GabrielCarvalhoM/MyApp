// Q2: AD-1 (S1-S6 and the week), PI-1 (r1), PR-1..PR-3, against the candidate's pure functions and a judge oracle.
import { DEC, R1, RC, f as fJ } from './oracle.mjs';
const WT = process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions';
const RF = await import('file:///' + WT + '/CoachingCore/src/v1-race-forecast.mjs');
const PI = await import('file:///' + WT + '/CoachingCore/src/v1-pace-insights.mjs');
const VAL = RF.RACE_FORECAST, FV = VAL.forecast, PV = VAL.paceInsights;
// --- judge oracle of IC-1 (first rule wins)
function cJ(s) {
  if (!s.reported) return 0;
  if (s.completed) return 1;
  const ws = (s.steps || []).filter(x => x.kind === 'WORK' || x.kind === 'STEADY');
  if (ws.length) { let n = 0, d = 0; for (const x of ws) { const m = x.targetMet ? 1 : x.repOfRepeatedBlock ? 0 : (x.measured != null && x.target ? Math.min(1, x.measured / x.target) : 0); n += x.w * m; d += x.w; } return n / d; }
  if (s.targetKm && s.actualKm != null) return Math.min(1, s.actualKm / s.targetKm);
  return s.actualMin != null ? Math.min(s.actualMin, s.planned) / s.planned : 0;
}
const AD = DEC.workedExamples.adherence;
const credit = AD.sessions.map(s => { const c = RF.sessionCredit(s); return { id: s.id, expected: s.credit, candidate: c, oracle: cJ(s), ok: Math.abs(c.c - s.credit.c) < 6e-6 && c.rule === s.credit.rule && Math.abs(cJ(s) - s.credit.c) < 6e-6 }; });
const wkS = AD.week.sessions.map(id => AD.sessions.find(s => s.id === id));
const wa = RF.weekAdherence(wkS);
const week = { expected: AD.week, candidate: { a: wa.a, f: RF.fOf(wa.a, FV), planned: wa.plannedMinutes, credited: wa.creditedMinutes }, ok: Math.abs(wa.a - AD.week.a) < 6e-5 && Math.abs(RF.fOf(wa.a, FV) - AD.week.f) < 6e-5 && wa.plannedMinutes === 186 && Math.abs(wa.creditedMinutes - 152) < 1e-9 };
// unknown: both readings
const unk = [{ planned: 40, reported: true, completed: false, unknown: true, actualMin: 40 }, { planned: 60, reported: true, completed: true }];
const unkZ = RF.weekAdherence(unk, { unknown: 'ZERO' }).a, unkE = RF.weekAdherence(unk, { unknown: 'EXCLUDED' }).a;
// fOf boundaries
const fB = [0.4999999, 0.5, 0.7, 0.8999999, 0.9, 1].map(a => [a, RF.fOf(a, FV), fJ(a)]);
// --- PI-1 (r1): threshold, Q8 +1.5% room left, band 310-330 every week
const pi1 = R1.workedExamples.paceInsights[0];
const ex1 = pi1.executions.map((e, i) => ({ eventId: 'pi' + i, sessionId: 's' + i, date: e.date, recordedOn: e.date, secondsPerKm: e.pace, rpe: e.rpe, admitted: true, completed: true, comparable: true, compatible: true, longBouts: true, measurement: 'TRACK', gpsGood: false, totalWorkMinutes: 24 }));
const band310 = { fastSecondsPerKm: 310, slowSecondsPerKm: 330 };
const ins1 = PI.insightOf('THRESHOLD_CONTROLLED', ex1, { weekStart: '2027-03-01', cutoff: '2027-03-01', bandAt: () => band310 }, PV, RC);
const act1 = PI.actionOf(ins1, { q8: { applies: true, fraction: 0.015 }, p3Offered: false, revisionOffered: false }, PV, RC);
const piOK = ins1.state === 'IMPROVING' && Math.abs(ins1.median - pi1.median) < 6e-5 && Math.abs(ins1.MAD - pi1.MAD) < 6e-5 && ins1.sessions.every(s => !s.exceptional) && act1.action === 'EXPLAIN_ONLY'
  && ins1.sessions.every((s, i) => s.class === pi1.executions[i].class && Math.abs(s.logDeviationFromBandMidpoint - pi1.executions[i].logDeviationFromBandMidpoint) < 6e-5);
// --- PR-1 through paceRevisionOf
const PR1 = DEC.workedExamples.paceRevision[0];
const mkE = (e, i, p) => ({ eventId: p + i, sessionId: p + 's' + i, date: e.date, recordedOn: e.date, secondsPerKm: e.pace, rpe: e.rpe, admitted: true, completed: true, comparable: true, compatible: true, longBouts: true, measurement: e.measurement, gpsGood: e.gpsQuality === 'GOOD', totalWorkMinutes: e.totalWorkMinutes, effortHarder: false });
const execs = [...PR1.round1.executions.map((e, i) => mkE(e, i, 'r1-')), ...PR1.round2.executions.map((e, i) => mkE(e, i, 'r2-'))];
const add = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const wk = n => add('2027-01-04', 7 * (n - 1));
const phaseOf = n => n <= 19 ? 'BUILD' : n === 20 ? 'TAPER' : 'RACE_WEEK';
const mkWeeks = upto => Array.from({ length: upto }, (_, i) => { const n = i + 1; return { index: i, startDate: wk(n), phase: phaseOf(n), mode: 'EASY', band: n >= 6 ? { fastSecondsPerKm: 300, slowSecondsPerKm: 320, derived: true } : { fastSecondsPerKm: 310, slowSecondsPerKm: 330, derived: true }, factor: n >= 6 ? 0.045 : 0.03, withdrawn: false, referenceId: 'ref-10k', withdrawal: null }; });
const run = (upto, responses, extraExecs = []) => PI.paceRevisionOf({ now: upto - 1, weeks: mkWeeks(upto), executions: [...execs, ...extraExecs], adverse: [], breaks: [], responses, raceDate: '2027-05-30', experience: 'INTERMEDIATE', asOfDay: wk(upto), screenRequired: false, p3Offered: false, scope: 'plan-pr1' }, PV, RC);
const w9 = run(9, []);
const offer1 = w9.offer;
const w10 = run(10, [{ offerId: offer1?.offerId, response: 'ACCEPT', date: '2027-03-02' }]);
const resp1 = [{ offerId: offer1?.offerId, response: 'ACCEPT', date: '2027-03-02' }];
const w14 = run(14, resp1);
const offer2 = w14.offer;
const resp2 = [...resp1, { offerId: offer2?.offerId, response: 'ACCEPT', date: '2027-04-06' }];
const w15 = run(15, resp2);
const endE = { eventId: 'end', sessionId: 'end-s', date: '2027-04-21', recordedOn: '2027-04-21', secondsPerKm: 281, rpe: 8, admitted: true, completed: true, comparable: true, compatible: true, longBouts: true, measurement: 'TRACK', gpsGood: false, totalWorkMinutes: 24 };
const w17 = run(17, resp2, [endE]);
const bandW10 = w10.bandAt({ date: '2027-03-10', week: 9 }), bandW15 = w15.bandAt({ date: '2027-04-14', week: 14 }), bandW17 = w17.bandAt({ date: '2027-04-26', week: 16 });
const ebDirect1 = PI.effectiveBandOf({ fastSecondsPerKm: 300, slowSecondsPerKm: 320 }, 0.02, RC), ebDirect3 = PI.effectiveBandOf({ fastSecondsPerKm: 300, slowSecondsPerKm: 320 }, 0.03, RC);
// judge: paceEdge-like: round to 0.1 then up to multiple of 5
const edgeJ = (sec, R) => { const p = Math.round(sec / (1 + R) * 10) / 10; return Math.ceil(p / 5 - 1e-9) * 5; };
const pr1 = {
  w9: { status: w9.status, step: offer1?.stepFraction, sessions: offer1?.sessions?.length, effectiveFrom: offer1?.effectiveFrom, expectedStep: PR1.round1.step },
  w10: { status: w10.status, fraction: w10.active?.fraction, effectiveFrom: w10.active?.effectiveFrom, bandW10 },
  w14: { status: w14.status, offerStep: offer2?.stepFraction, expectedStep: PR1.round2.step, sessions: offer2?.sessions },
  w15: { status: w15.status, fraction: w15.active?.fraction, bandW15, expectedBand: PR1.round2.effectiveBand },
  w17: { status: w17.status, ended: w17.ended, bandW17 },
  effectiveBandOf: { at2: ebDirect1, at3: ebDirect3, judgeFast2: edgeJ(300, 0.02), judgeSlow2: edgeJ(320, 0.02), judgeFast3: edgeJ(300, 0.03), judgeSlow3: edgeJ(320, 0.03) },
};
pr1.ok = w9.status === 'OFFERED' && Math.abs(offer1.stepFraction - 0.02) < 1e-9 && offer1.effectiveFrom === '2027-03-08' && w10.status === 'ACTIVE' && bandW10.fastSecondsPerKm === 295 && bandW10.slowSecondsPerKm === 315
  && w14.status === 'OFFERED' && Math.abs(offer2.stepFraction - 0.01) < 1e-9 && w15.status === 'ACTIVE' && Math.abs(w15.active.fraction - 0.03) < 1e-9 && bandW15.fastSecondsPerKm === 295 && bandW15.slowSecondsPerKm === 315
  && w17.status === 'ENDED' && w17.ended?.reason === 'HARDER_THAN_CUE_EXECUTION' && w17.ended?.date === '2027-04-21' && bandW17.fastSecondsPerKm === 300 && bandW17.slowSecondsPerKm === 320;
// any further offer after the end in this plan? weeks 17..21
const after = [18, 19, 20, 21].map(n => { const r = run(n, resp2, [endE]); return { week: n, status: r.status, offer: !!r.offer }; });
// PR-2: TEN_K reps of 4 min do not vote; PR-3: HALF IMPROVING never offers revision
const add4 = i => ({ eventId: 'tk' + i, sessionId: 'tks' + i, date: add('2027-02-01', 7 * i), recordedOn: add('2027-02-01', 7 * i), secondsPerKm: 260, rpe: 8, admitted: true, completed: true, comparable: true, compatible: true, longBouts: false, measurement: 'TRACK', totalWorkMinutes: 20 });
const tk = PI.insightOf('TEN_K_EFFORT', [0, 1, 2, 3].map(add4), { weekStart: '2027-03-01', cutoff: '2027-03-01', bandAt: () => ({ fastSecondsPerKm: 270, slowSecondsPerKm: 280 }) }, PV, RC);
const tkA = PI.actionOf(tk, { q8: { applies: false }, p3Offered: false, revisionOffered: true }, PV, RC);
const tk5 = PI.insightOf('TEN_K_EFFORT', [0, 1, 2, 3].map(i => ({ ...add4(i), longBouts: true })), { weekStart: '2027-03-01', cutoff: '2027-03-01', bandAt: () => ({ fastSecondsPerKm: 270, slowSecondsPerKm: 280 }) }, PV, RC);
const tk5A = PI.actionOf(tk5, { q8: { applies: false }, p3Offered: false, revisionOffered: true }, PV, RC), tk5P = PI.actionOf(tk5, { q8: { applies: false }, p3Offered: true, revisionOffered: true }, PV, RC);
const hm = { ...tk5, domain: 'HALF_MARATHON_EFFORT', state: 'IMPROVING' };
const hmA = PI.actionOf(hm, { q8: { applies: true, fraction: 0.045 }, p3Offered: false, revisionOffered: true }, PV, RC);
const pr23 = { PR2: { state: tk.state, action: tkA.action, longState: tk5.state, longAction: tk5A.action, longP3: tk5P }, PR3: hmA, ok: tk.state === 'INSUFFICIENT_DATA' && tkA.action === 'INFORMATIVE_ONLY' && tk5A.action === 'SUGGEST_REPORTING_A_RACE' && tk5P.action === 'OFFER_V1RC_FIELD_TEST' && !tk5P.alternative && hmA.action === 'SUGGEST_REPORTING_A_RACE' };
console.log(JSON.stringify({ credit, creditOK: credit.every(x => x.ok), week, unknown: { ZERO: unkZ, EXCLUDED: unkE }, fBoundaries: fB, PI1: { state: ins1.state, median: ins1.median, MAD: ins1.MAD, action: act1.action, ok: piOK }, PR1: pr1, afterEnd: after, PR23: pr23 }, null, 1));
