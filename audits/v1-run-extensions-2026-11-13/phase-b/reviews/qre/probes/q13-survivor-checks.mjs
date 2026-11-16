// Q13: behaviour behind surviving mutants, checked on the candidate by the judge (correct behaviour, untested by the author's suite).
import { oracle, candidateInput, SPECS, est, wk } from './oracle.mjs';
const WT = process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions';
const RF = await import('file:///' + WT + '/CoachingCore/src/v1-race-forecast.mjs');
const FV = RF.RACE_FORECAST.forecast;
const out = {};
out.R16_goalAtLow = RF.goalRelationOf(2820, { lowSeconds: 2820, highSeconds: 3075 });
out.R16_goalAtHigh = RF.goalRelationOf(3075, { lowSeconds: 2820, highSeconds: 3075 });
const d2 = RF.forecastOf(candidateInput(SPECS.d2), FV);
out.R18_raceWeekAfterG0 = RF.raceWeekOf({ asOfDay: '2027-04-19', raceDate: '2027-04-25', raceWeekStart: wk(16), lastWeekStart: wk(15), last: d2, now: { referenceId: 'r', tier: 'HIGH' }, then: { referenceId: 'r', tier: 'HIGH' } }, FV).reason;
// R22: a pair whose observed response is far above 1 (a big improvement): R_c must be clipped to 1
const big = { ...SPECS.c, A: { km: 5, sec: 2100, date: '2027-01-02', margin: 0.035 } };
const cb = RF.forecastOf(candidateInput(big), FV), ob = oracle(big);
out.R22_clip = { candidateRc: cb.common.R_c, oracleRc: ob.Rc, Robs: cb.common.pair?.Robs };
// R21: a pair 20 days apart is not used
const close = { ...SPECS.d, A: { km: 10, sec: 3000, date: '2027-01-25', margin: 0.025 } };
const cc = RF.forecastOf(candidateInput(close), FV);
out.R21_pairUnder28Days = { used: cc.common.pair?.used, days: cc.common.pair?.days, Rc: cc.common.R_c };
// R20: R-11 boundary: a marathon central that rounds to exactly 6:00:00 is shown, 6:01:00 withheld
const m = c => ({ ...SPECS.e1, est: { lower: c * 0.93, central: c, upper: c * 1.08 } });
out.R20 = { at21600: RF.forecastOf(candidateInput(m(21600)), FV).status, at21629: RF.forecastOf(candidateInput(m(21629)), FV).status, at21631: RF.forecastOf(candidateInput(m(21631)), FV).status };
console.log(JSON.stringify(out, null, 1));
