// R2 / B3: the new pair reading, end to end. An earlier reference ends a pair only when the record of changes shows it came into force at HIGH.
// WT=<tree> selects the tree (the worktree by default; the R1 candidate copy for comparison).
import { client, racePlan, result, plain } from './lib.mjs';
const out = {};
const cases = {
  officialA_officialB: { A: result('10K', 3000, '2027-01-01'), B: result('10K', 2940, '2027-02-14', { id: 'B' }) },
  gpsA_officialB: { A: result('10K', 3000, '2027-01-01', { measurement: 'GPS' }), B: result('10K', 2940, '2027-02-14', { id: 'B' }) },
  officialA_slowerB4pct: { A: result('10K', 3000, '2027-01-01'), B: result('10K', 3120, '2027-02-14', { id: 'B' }) },
  gpsA_slowerB4pct: { A: result('10K', 3000, '2027-01-01', { measurement: 'GPS' }), B: result('10K', 3120, '2027-02-14', { id: 'B' }) },
  effortUnknownA: { A: result('10K', 3000, '2027-01-01', { rpe: null }), B: result('10K', 2940, '2027-02-14', { id: 'B' }) },
};
for (const [name, c] of Object.entries(cases)) {
  const t = client(racePlan({ goalMinutes: 48, id: 'b3-' + name, anchors: [c.A] }), { prefix: 'b3' + name });
  for (let w = 0; w < 6; w++) t.week(w, s => plain(t, s), w === 5 ? { runEvidence: [c.B] } : {});
  const r = t.look(6, 0), f = r.runForecast;
  const ch = (r.runCalibration.projection?.comparisons ?? []).filter(x => x.to).map(x => [x.week, x.to.evidenceId, x.to.confidence ?? null, x.reason]);
  out[name] = { status: f.status, source: f.response?.source, Rc: f.response?.R_c, notes: f.response?.notes, flags: f.flags, pair: f.response?.pair ? { used: f.response.pair.used, days: f.response.pair.days } : null, of: f.observedForecast?.forecastSeconds ?? f.observedForecast?.reason ?? null, changes: ch, estimateTier: r.runCalibration.estimates?.['10K']?.confidence };
}
console.log(JSON.stringify(out, null, 1));
