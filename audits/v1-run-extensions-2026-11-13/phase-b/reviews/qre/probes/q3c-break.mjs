// Q3c: the withdrawal "declared break of 14 days or more" (values.forecast.withdrawal) through the entry point.
import { client, racePlan, plain } from './lib.mjs';
const out = {};
const s = r => ({ engine: r.status, fc: r.runForecast.status, reason: r.runForecast.reason ?? null, of: r.runForecast.observedForecast?.forecastSeconds ?? null, ins: r.paceInsights.status, insReason: r.paceInsights.reason ?? null });
// (1) declared in advance, during week 3, for weeks 3-4; looks at each Monday
{
  const t = client(racePlan({ goalMinutes: 48 })); for (let w = 0; w < 3; w++) t.week(w, x => plain(t, x));
  const decl = t.step(3, 1, 'WEEKLY_REVIEW', { interruption: { startDate: t.day(3, 1), endDate: t.day(4, 7), days: 14, reasonCategory: 'TRAVEL' } }, '08:00');
  const looks = {}; for (const [w, d] of [[3, 3], [4, 0], [4, 3], [5, 0], [5, 3], [6, 0], [7, 0]]) looks[`w${w}d${d}`] = s(t.look(w, d));
  out.inAdvance = { declaration: s(decl), looks, modes: t.p.stateTrace?.slice(0, 9).map(x => x?.run?.mode) };
}
// (2) declared after the fact, on Monday of week 5, for weeks 3-4 (nothing reported in weeks 3-4)
{
  const t = client(racePlan({ goalMinutes: 48 })); for (let w = 0; w < 3; w++) t.week(w, x => plain(t, x));
  const decl = t.step(5, 0, 'WEEKLY_REVIEW', { interruption: { startDate: t.day(3, 0), endDate: t.day(4, 6), days: 14, reasonCategory: 'TRAVEL' } }, '07:00');
  const looks = {}; for (const [w, d] of [[5, 1], [6, 0], [7, 0]]) looks[`w${w}d${d}`] = s(t.look(w, d));
  out.afterTheFact = { declaration: s(decl), looks, modes: t.p.stateTrace?.slice(0, 9).map(x => x?.run?.mode) };
}
console.log(JSON.stringify(out, null, 1));
