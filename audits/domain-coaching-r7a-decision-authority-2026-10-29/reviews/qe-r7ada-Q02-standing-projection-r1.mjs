// Q02 (QE reviewer-owned; class D, declared boundary R1). After a week k with nothing executed and no review, no decision re-plans, so week
// k+1 keeps the rows projected assuming week k was executed (R1). Question (brief §8): is that projection only planning, or is it consumed as
// earned/factual capability? Cells, per athlete profile and week k:
//   U  : weeks 0..k-1 trained and reviewed; week k nothing executed, never reviewed; week k+1: every stored row executed as prescribed and
//        reported session by session, closed by its Sunday review.
//   R  : the same, except week k is closed by an empty review (HOLD, week k+1 re-planned from evidence) before week k+1 is executed.
//   U0 : like U, but week k+1 is also left unexecuted and unreviewed (two open weeks), then week k+2's rows are read (still standing?).
// Read: earned state at week k (history, identical in U and R), week k+1's rows, HistoricalState at week k+2, the PLAN-side rows of week k+2,
// and whether U's week k+2 is ahead of R's (a counter, step, target, mode or unlock the athlete did not earn from the earned state).
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q02-standing-projection-r1', tree: L.TREE, profiles: {}};
const RANK = {WALK_JOG: 0, RESTART: 1, RETURN: 1, EASY: 2}, NUM = ['walkStep', 'restart', 'returnStep', 'long', 'easy', 'easyExtra', 'qualityStep', 'specificStep', 'thresholdDone', 'devCount', 'easyWeeksDone', 'qualityDone', 'stridesDone'];
const ahead = (a, b) => { if (!a || !b) return []; if (a.mode !== b.mode) return RANK[a.mode] > RANK[b.mode] ? ['mode'] : []; const f = NUM.filter(k => Number.isFinite(a[k]) && (!Number.isFinite(b[k]) || a[k] > b[k])); if (Number.isFinite(a.walks) && Number.isFinite(b.walks) && a.walks < b.walks) f.push('walks'); if (a.stridesEligible && !b.stridesEligible) f.push('stridesEligible'); return f; };
const full = st => { if (!st) return null; const {planned, longByWeek, modeHistory, achieved, longestContinuous, ...rest} = st; return rest; };
// Steps of the rows a week prescribes, by role (the stimulus the athlete is asked to execute).
const rowSteps = (t, w) => t.p.weeks[w]?.sessions.filter(s => L.live(s) && s.sport === 'RUN').map(s => `${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ':' + s.progression.dimension + '=' + s.progression.value : ''}${s.prescription.strides?.repetitions ? ':strides' + s.prescription.strides.repetitions : ''}`).join(' ') ?? null;
const PROFILES = {EASY: {}, WALK_JOG: L.WJ};
function cell(pname, o, k, kind) {
  L.resetIds(); const t = L.gen({id: 'qe-q02-' + pname, ...o});
  for (let w = 0; w < k; w++) L.weekly(t, w);
  const earned = full(L.history(t, k, 0, '06:00:00').state.run);
  if (kind === 'R') L.weekly(t, k, () => false);
  const rowsK1 = rowSteps(t, k + 1), planK1 = full(t.p.stateTrace[k + 1]?.run);
  if (kind === 'U0') { const h = full(L.history(t, k + 2, 0, '06:00:00').state.run); return {earned, rowsK1, planK1, rowsK2: rowSteps(t, k + 2), planK2: full(t.p.stateTrace[k + 2]?.run), historyK2: h}; }
  // Week k+1: every stored run row executed as prescribed, day by day at 21:00 (Sunday's with the closing review).
  const sessions = t.p.weeks[k + 1].sessions.filter(L.live);
  for (const d of [0, 1, 2, 3, 4, 5]) { const o2 = sessions.filter(s => s.day === d).map(s => L.obs(t.p, s)); if (o2.length) L.step(t, L.at(t.p, k + 1, d, '21:00:00', {observations: o2})); }
  const close = L.step(t, L.at(t.p, k + 1, 6, '21:00:00', {observations: sessions.filter(s => s.day === 6).map(s => L.obs(t.p, s))}));
  return {earned, rowsK1, planK1, closeAction: close.action, gates: close.gates, historyK2: full(L.history(t, k + 2, 0, '06:00:00').state.run), achievedK2: L.history(t, k + 2, 0, '06:00:00').state.run.achieved, planK2: full(t.p.stateTrace[k + 2]?.run), rowsK2: rowSteps(t, k + 2)};
}
for (const [pname, o] of Object.entries(PROFILES)) {
  const res = [];
  for (let k = 1; k <= 11; k++) {
    let U, R, U0; try { U = cell(pname, o, k, 'U'); R = cell(pname, o, k, 'R'); U0 = cell(pname, o, k, 'U0'); } catch (e) { res.push({k, error: String(e.message).slice(0, 200)}); continue; }
    res.push({k, earnedEqual: L.eq(U.earned, R.earned), earned: U.earned,
      R1_rowsAheadOfReplanned: U.rowsK1 !== R.rowsK1, rowsK1: {U: U.rowsK1, R: R.rowsK1},
      consumed: {historyAhead: ahead(U.historyK2, R.historyK2), planAhead: ahead(U.planK2, R.planK2), uPlanAheadOfOwnHistory: ahead(U.planK2, U.historyK2)},
      historyK2: {U: U.historyK2, R: R.historyK2}, planK2: {U: U.planK2, R: R.planK2}, rowsK2: {U: U.rowsK2, R: R.rowsK2}, achievedK2: {U: U.achievedK2, R: R.achievedK2},
      twoOpenWeeks: {rowsK2: U0.rowsK2, planK2AheadOfHistoryK2: ahead(U0.planK2, U0.historyK2), historyK2: U0.historyK2, planK2: U0.planK2}});
  }
  out.profiles[pname] = {cases: res.length, R1RowsAheadCases: res.filter(r => r.R1_rowsAheadOfReplanned).length, historyConsumedCases: res.filter(r => r.consumed?.historyAhead.length).map(r => `k=${r.k}: ${r.consumed.historyAhead.join(',')}`), planConsumedCases: res.filter(r => r.consumed?.planAhead.length).map(r => `k=${r.k}: ${r.consumed.planAhead.join(',')}`), uPlanAheadOfOwnHistory: res.filter(r => r.consumed?.uPlanAheadOfOwnHistory.length).map(r => `k=${r.k}: ${r.consumed.uPlanAheadOfOwnHistory.join(',')}`), cases_: res};
}
console.log(JSON.stringify(out, null, 1));
