// SSCTR R7ADA-SSCTR-r1 RETURN-mode walk days (own; prints only). A bounded control for the MODERATE cells of my continuous-boundary probe: does a
// moderate return (RETURN mode) turn the walk days of an easy-run week into runs for an athlete who is not coming off the walk/jog ladder? One
// athlete only (no catalogue): a NOVICE (EASY_LOW) runner, 50 min a week on 2 days, longest run 20 min, who chose 5 run days (Mon, Tue, Wed, Fri,
// Sat; long run Saturday), so the plan holds walk days (operational.run: easy runs below minimumSessionMinutes become walks). Weeks 0-2 executed
// and reviewed; a 14-day break from Monday of week 3, reported Monday 07:00 of week 5. Readings: per week the running sessions, walks and running
// minutes, executed (weeks 0-2) and prescribed (the return weeks); the R6-NONCLINICAL-RETURN MODERATE recipe is "at most moderateStepsToPrior
// conditional steps to the prior executed dose". Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import * as L from './ssctr-r7ada-lib.mjs';

const input = L.intake({id: 'ssctr-r7ada-easy-walks', weeks: 12, goal: 'GENERAL', run: 'REGULAR', recent: {runDaysPerWeek: 2, runMinutesPerWeek: 50, longestRunMinutes: 20},
  athlete: {runExperience: 'NOVICE', strengthExperience: 'NOVICE'}, schedule: {runDays: [0, 1, 2, 4, 5], strengthDays: [3], runMinutes: 40, strengthMinutes: 30, longRunDay: 5, longRunMinutes: 60}});
const t = L.genFrom(input);
const week = (w, pred = () => true) => { const rs = t.p.weeks[w].sessions.filter(s => L.isRun(s) && pred(s)); const runs = rs.filter(s => s.role !== 'WALK');
  return {week: w, phase: t.p.weeks[w].phase, runningSessions: runs.length, walks: rs.length - runs.length, runningMinutes: runs.reduce((a, s) => a + L.jogMinutes(s), 0), sessions: rs.map(s => `${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}`)}; };
const out = {probe: 'R7ADA-SSCTR-r1-RETURN-WALKS', runtime: L.TREE, runClass: t.p.capability?.run?.class ?? null, executed: [], returnWeeks: []};
for (let w = 0; w <= 2; w++) { out.executed.push(week(w)); L.weekly(t, w); }
const start = t.p.weeks[3].startDate, end = L.addDays(start, 13);
const r = L.step(t, L.at(t.p, 5, 0, '07:00:00', L.brk(start, end)));
out.return = {pause: `${start}..${end}`, result: `${r.status}/${r.action}`, entry: L.entryRun(r)};
for (let w = 5; w <= 7; w++) out.returnWeeks.push(week(w));
const maxExec = {runningSessions: Math.max(...out.executed.map(x => x.runningSessions)), runningMinutes: Math.max(...out.executed.map(x => x.runningMinutes))};
out.largestExecutedWeek = maxExec;
out.flags = out.returnWeeks.filter(x => x.runningSessions > maxExec.runningSessions || x.runningMinutes > maxExec.runningMinutes).map(x => `w${x.week} ${x.runningSessions} runs / ${x.runningMinutes} min against the largest executed week ${maxExec.runningSessions} / ${maxExec.runningMinutes}`);
console.log(JSON.stringify(out, null, 1));
