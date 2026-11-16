// QRE independent oracle for SSCTR-RFC-DECISION-r2 (written by the judge from the decision JSON and the handoff formulas).
// It imports nothing from the candidate's tests or source. Mechanism differs from the candidate on purpose:
// weeks are numbered 1-based by calendar, H is accumulated per week number, g is computed directly as Gamma(RW) - Gamma(ref).
import fs from 'node:fs';
const WT = process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions';
const D = JSON.parse(fs.readFileSync(WT + '/audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION_R2.json', 'utf8'));
const RCV = JSON.parse(fs.readFileSync(WT + '/CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json', 'utf8'));
export const V = D.values.forecast, PV = D.values.paceInsights, DEC = D, RC = RCV;
export const R1 = JSON.parse(fs.readFileSync(WT + '/audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION.json', 'utf8'));
const DAY = 864e5;
export const add = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
export const gap = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / DAY);
export const START = '2027-01-04';
export const wk = n => add(START, 7 * (n - 1)); // 1-based week start
export const KM = { '5K': 5, '10K': 10, HALF_MARATHON: 21.0975, MARATHON: 42.195 };
export const UNIT = RCV.estimates.roundOutwardSeconds;
const pl = (d1, t1, d2, k) => t1 * (d2 / d1) ** k;
export function est(km, sec, margin, event) {
  const K = event === 'MARATHON' ? RCV.model.marathon : RCV.model.standard;
  const tgt = KM[event];
  if (Math.abs(tgt / km - 1) <= 0.01) return { lower: sec * (1 - margin), central: sec, upper: sec * (1 + margin) };
  const ts = [K.kLow, K.kCentral, K.kHigh].map(k => pl(km, sec, tgt, k));
  return { lower: Math.min(...ts) * (1 - margin), central: pl(km, sec, tgt, K.kCentral), upper: Math.max(...ts) * (1 + margin) };
}
export const t10 = (km, sec) => pl(km, sec, 10, 1.07);
export const f = a => a < 0.5 ? 0 : a >= 0.9 ? 1 : (a - 0.5) / 0.4;
const G = { NOVICE: 0.08, INTERMEDIATE: 0.05, EXPERIENCED: 0.03 };
// spec: {event, exp, est{lower,central,upper}, tier, counted (number of counted weeks 1..counted), rw (RACE_WEEK number 1-based),
//        now (week in force 1-based), adh {weekNo: a} for weeks < now, ref {date, km, sec, margin}, A {date,km,sec,margin}|null, prev|null, q8Down}
export function oracle(s) {
  const Gx = G[s.exp] ?? G.EXPERIENCED, gam = H => Gx * (1 - Math.exp(-H / 10)), u = UNIT[s.event], E = V.events[s.event];
  const done = []; for (let n = 1; n < s.now; n++) if (n <= s.counted && n < s.rw && s.adh[n] != null) done.push(n);
  const Hd = d => done.filter(n => wk(n) <= d).reduce((t, n) => t + f(s.adh[n]), 0); // atReferenceDate
  const Hnow = done.reduce((t, n) => t + f(s.adh[n]), 0); // atWeekStart: weeks whose last day < t_now = all done
  let fut = 0; for (let n = s.now; n < s.rw; n++) if (n <= s.counted) fut++;
  const Href = Hd(s.ref.date);
  const T10B = t10(s.ref.km, s.ref.sec), sB = s.ref.margin / 1.2816;
  let Rc = 0.5, sd = 0.3, slow = false;
  const prev = s.prev ?? s.A;
  if (prev) { const r = T10B / t10(prev.km, prev.sec) - 1; slow = r >= 0.03 - 1e-12; }
  if (s.A && !slow) {
    const HA = Hd(s.A.date), dG = gam(Href) - gam(HA), days = gap(s.A.date, s.ref.date);
    if (days >= 28 && dG >= 0.005 - 1e-12) {
      const Robs = Math.log(t10(s.A.km, s.A.sec) / T10B) / dG, v = ((s.A.margin / 1.2816) ** 2 + sB ** 2) / dG ** 2;
      const w0 = 1 / 0.09, w1 = 1 / v; Rc = (0.5 * w0 + Robs * w1) / (w0 + w1); sd = (w0 + w1) ** -0.5; Rc = Math.max(0, Math.min(1, Rc));
    }
  }
  const Rhi = Math.min(1, Rc + 1.2816 * sd);
  const flags = []; if (!E.trainingGain) flags.push(E.flag); if (slow) flags.push('NO_GAIN_LATEST_RESULT_SLOWER'); if (s.q8Down) flags.push('NO_GAIN_RECENT_SESSIONS_SLOWER');
  const zero = flags.length > 0;
  const rng = ff => {
    const Hrw = Hnow + fut * ff, g = zero ? 0 : gam(Hrw) - gam(Href);
    const U = zero ? 0 : gam(Hnow) - gam(Href), F = zero ? 0 : gam(Hrw) - gam(Hnow);
    const lo = Math.floor(s.est.lower * Math.exp(-Rhi * g) / u + 1e-10) * u, ce = Math.round(s.est.central * Math.exp(-Rc * g) / u) * u, hi = Math.ceil(s.est.upper / u - 1e-10) * u;
    const width = hi / lo - 1; return { fs: [lo, ce, hi], g, U, F, width, status: width <= E.wMax + 1e-12 ? 'SHOWN' : 'TOO_UNCERTAIN_TO_SHOW' };
  };
  const ps = rng(1);
  const last = done.slice(-4), mean = last.length ? last.reduce((t, n) => t + s.adh[n], 0) / last.length : null;
  const of = done.length >= 2 ? { ...rng(f(mean)), mean } : { status: 'UNAVAILABLE', reason: 'NOT_ENOUGH_HISTORY' };
  const same = of.status !== 'UNAVAILABLE' && (f(mean) === 1 || of.fs.every((x, i) => x === ps.fs[i]));
  const display = !E.trainingGain ? 'CURRENT_MARATHON_ESTIMATE_ONLY_NEVER_LABELLED_FORECAST' : of.status === 'UNAVAILABLE' ? 'PLAN_SCENARIO_ONLY' : same ? 'ONE_RANGE_OBSERVED_FORECAST_COINCIDES_WITH_PLAN_SCENARIO' : 'BOTH_RANGES';
  let status;
  if (!E.trainingGain) status = Math.round(s.est.central / u) * u > E.centralMaxSeconds ? 'WITHHELD_R11_CENTRAL_ABOVE_6H' : ps.status;
  else status = (of.status === 'SHOWN' || (!same && ps.status === 'SHOWN')) ? 'SHOWN' : 'TOO_UNCERTAIN_TO_SHOW';
  return { ps, of, display, flags, Rc, sd, Rhi, Href, Hnow, fut, status, confidence: (ps.g > 0 || (of.g ?? 0) > 0) ? 'LOW' : 'TIER_CAPPED' };
}
export const goalRel = (g, lo, hi) => g < lo ? 'FASTER_THAN_RANGE' : g > hi ? 'SLOWER_THAN_RANGE' : 'INSIDE_RANGE';
const rep = (n, a, from = 1) => Object.fromEntries(Array.from({ length: n }, (_, i) => [from + i, a]));
const r = (km, sec, date, margin) => ({ km, sec, date, margin });
const TEN = (adh, now, x = {}) => ({ event: '10K', exp: 'INTERMEDIATE', est: est(10, 3000, 0.025, '10K'), tier: 'HIGH', counted: 14, rw: 16, now, adh, ref: r(10, 3000, '2027-01-01', 0.025), A: null, prev: null, q8Down: false, ...x });
const NOV = (dA) => ({ event: '10K', exp: 'NOVICE', est: est(5, 1740, 0.035, '10K'), tier: 'HIGH', counted: 12, rw: 14, now: 7, adh: rep(6, 0.9), ref: r(5, 1740, '2027-02-14', 0.035), A: r(5, 1800, dA, 0.035), prev: null, q8Down: false });
const HALF = (secB, dB) => ({ event: 'HALF_MARATHON', exp: 'INTERMEDIATE', est: est(10, secB, 0.025, 'HALF_MARATHON'), tier: 'HIGH', counted: 14, rw: 16, now: 7, adh: rep(6, 0.95), ref: r(10, secB, dB, 0.025), A: r(10, 3000, '2027-01-01', 0.025), prev: null, q8Down: false });
const MAR = (sec, m) => ({ event: 'MARATHON', exp: 'INTERMEDIATE', est: est(21.0975, sec, m, 'MARATHON'), tier: 'HIGH', counted: 13, rw: 16, now: 5, adh: rep(4, 0.95), ref: r(21.0975, sec, '2026-12-20', m), A: null, prev: null, q8Down: false });
const FIVE = (adh, now) => ({ event: '5K', exp: 'INTERMEDIATE', est: est(5, 1500, 0.025, '5K'), tier: 'HIGH', counted: 8, rw: 10, now, adh, ref: r(5, 1500, '2026-12-25', 0.025), A: null, prev: null, q8Down: false });
export const SPECS = {
  a: TEN(rep(4, 0.95), 5), b: TEN(rep(4, 0.6), 5), c: NOV('2027-01-02'), d: HALF(3060, '2027-02-14'), d2: HALF(3120, '2027-02-14'),
  e1: MAR(6600, 0.025), e2: MAR(9900, 0.035), f: FIVE({}, 1),
  g: TEN(rep(4, 1), 5, { exp: 'EXPERIENCED', est: est(10, 2700, 0.04, '10K'), tier: 'MODERATE', ref: r(10, 2700, '2027-01-01', 0.04) }),
  h: TEN(rep(4, 0.95), 5, { est: est(5, 1320, 0.025, '10K'), ref: r(5, 1320, '2027-01-01', 0.025) }),
  'A1-1': HALF(3060, '2027-02-10'), 'A1-2': NOV('2027-01-06'), 'A2-1': FIVE({ 1: 0.7 }, 2), 'A2-2': FIVE({ 1: 0.7, 2: 0.7 }, 3),
  'A2-3': TEN({ 1: 0.95, 2: 0.95, 3: 0.4, 4: 0.45 }, 5), 'A4-1': TEN(rep(14, 0.95), 15),
  'A4-3-at15': TEN(rep(14, 0.95), 15, { est: est(5, 1320, 0.025, '10K'), ref: r(5, 1320, '2027-01-01', 0.025) }),
};
// The candidate's pure-function input for a spec (0-based weeks), built by the judge.
export function candidateInput(s) {
  const total = s.rw; const weeks = [];
  for (let n = 1; n <= total; n++) weeks.push({ index: n - 1, startDate: wk(n), phase: n <= s.counted ? 'BUILD' : n < s.rw ? 'TAPER' : 'RACE_WEEK', zeroCredit: false, planned: true, a: n < s.now ? (s.adh[n] ?? null) : null });
  const rr = x => x ? { date: x.date, t10: t10(x.km, x.sec), sigma: x.margin / 1.2816 } : null;
  return { event: s.event, experience: s.exp, unitSeconds: UNIT[s.event], estimate: { ...s.est, tier: s.tier }, weeks, completedWeeks: s.now - 1, raceWeekIndex: s.rw - 1, reference: rr(s.ref), pairA: rr(s.A), previous: rr(s.prev), q8Down: !!s.q8Down };
}
