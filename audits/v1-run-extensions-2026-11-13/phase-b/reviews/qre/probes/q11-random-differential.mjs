// Q11: seeded random differential, candidate forecastOf vs the judge oracle, on generated specs near the boundaries that matter
// (rounding, width test, coincide, response update, slowdown threshold, reference week credit).
import { oracle, candidateInput, est, wk, add } from './oracle.mjs';
const WT = process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions';
const RF = await import('file:///' + WT + '/CoachingCore/src/v1-race-forecast.mjs');
const FV = RF.RACE_FORECAST.forecast;
let seed = 20261116; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = a => a[Math.floor(rnd() * a.length)];
const N = 6000, mism = [], counts = { SHOWN: 0, TOO: 0, slow: 0, pair: 0, both: 0, coincide: 0, nearWidth: 0 };
for (let k = 0; k < N; k++) {
  const event = pick(['5K', '10K', 'HALF_MARATHON', 'MARATHON']), exp = pick(['NOVICE', 'INTERMEDIATE', 'EXPERIENCED']);
  const total = pick([8, 12, 16]), counted = total - 2, rw = total, now = 1 + Math.floor(rnd() * (total - 1));
  const refKm = pick([5, 10, 21.0975]), refSec = refKm * (240 + rnd() * 240), margin = pick([0.025, 0.035, 0.04, 0.05]);
  const adh = {}; for (let n = 1; n < now; n++) adh[n] = Math.round(rnd() * 1000) / 1000 * (rnd() < 0.8 ? 1 : 0.5) + (rnd() < 0.3 ? 0.5 : 0) > 1 ? 1 : Math.round(rnd() * 1000) / 1000;
  // reference date: before the plan, a Sunday, or mid-week of a finished week
  const refWeek = now > 1 ? 1 + Math.floor(rnd() * (now - 1)) : 0;
  const refDate = refWeek === 0 || rnd() < 0.3 ? add('2027-01-04', -1 - Math.floor(rnd() * 20)) : add(wk(refWeek), Math.floor(rnd() * 7));
  let A = null, prev = null;
  if (rnd() < 0.5) { const aDate = add(refDate, -(20 + Math.floor(rnd() * 60))); const ratio = 1 + (rnd() * 0.08 - 0.04); A = { km: refKm, sec: refSec * ratio, date: aDate, margin: pick([0.025, 0.035]) }; if (aDate < add('2027-01-04', -28)) A = null; }
  const spec = { event, exp, est: est(refKm, refSec, margin, event), tier: pick(['HIGH', 'MODERATE', 'LOW']), counted, rw, now, adh, ref: { km: refKm, sec: refSec, date: refDate, margin }, A, prev, q8Down: rnd() < 0.1 };
  const o = oracle(spec), c = RF.forecastOf(candidateInput(spec), FV);
  if (c.status === 'UNAVAILABLE') { mism.push({ k, why: 'candidate unavailable', reason: c.reason }); continue; }
  const a = { ps: o.ps.fs, psS: o.ps.status, of: o.of.fs ?? null, ofS: o.of.status, display: o.display, flags: o.flags, status: o.status };
  const b = { ps: c.planScenario.forecastSeconds, psS: c.planScenario.status, of: c.observedForecast.forecastSeconds ?? null, ofS: c.observedForecast.status, display: c.display, flags: c.flags, status: c.status };
  if (JSON.stringify(a) !== JSON.stringify(b)) mism.push({ k, spec: { event, exp, now, refDate, A: !!A }, oracle: a, candidate: b });
  if (Math.abs(c.planScenario.g_applied - (c.common.U_unobserved + c.planScenario.F_future)) > 1e-12) mism.push({ k, why: 'g != U + F' });
  counts[b.status === 'SHOWN' ? 'SHOWN' : 'TOO']++; if (o.flags.includes('NO_GAIN_LATEST_RESULT_SLOWER')) counts.slow++; if (c.common.pair?.used) counts.pair++; if (b.display === 'BOTH_RANGES') counts.both++; if (b.display.startsWith('ONE_RANGE')) counts.coincide++;
  if (Math.abs(o.ps.width - FV.events[event].wMax) < 0.005 || (o.of.width && Math.abs(o.of.width - FV.events[event].wMax) < 0.005)) counts.nearWidth++;
}
console.log(JSON.stringify({ N, mismatches: mism.length, counts, first: mism.slice(0, 5) }, null, 1));
