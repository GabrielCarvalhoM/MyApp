// R7A1-QE-r1 P06: C1 says `aheadOf` is the one test of "still ahead" for every handler (same-day eligibility, QE-R7A-02 class). The
// adaptation handlers (systemic fatigue, unavailable day, event-week conflict) select sessions with `s.date > asOfLocal && ahead(s)`, so a
// same-day session that `aheadOf` calls ahead (a PM session in the morning, an AM session before it starts) is never adapted. At the same
// morning clock a return re-plans that session (it uses aheadOf). Oracles: after "today is unavailable" at 06:00 no session that day is
// still prescribed; after a systemic fatigue report at 06:00 no hard run is left that day and the PM strength session has fewer sets.
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,addDays,print} from './qe-a1-lib.mjs';
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const out={probe:'R7A1-QE-P06',cases:{}};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT);
 // Monday has a PM strength session (strength on day 0) and, in the second program, an AM quality run on Monday.
 const progs={pmStrengthMonday:{ia:{schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6}},w:3},amQualityMonday:{ia:{schedule:{runDays:[0,3,6],strengthDays:[1,4],longRunDay:6}},w:3},raceWeekConflict:{ia:{athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},w:12}};
 for(const [name,{ia,w}] of Object.entries(progs)){
  const t=H.start({...ia,id:'qa1-p06-'+name},w),d0=t.p.weeks[w].startDate,monday=t.p.weeks[w].sessions.filter(s=>s.day===0&&s.prescription).map(s=>s.id);
  const res={mondaySessions:line(t.p,w).filter(r=>r.startsWith('d0'))};
  for(const [k,x] of Object.entries({UNAVAILABLE_TODAY:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[d0]}},SYSTEMIC_FATIGUE:{kind:'SYSTEMIC_FATIGUE'},EVENT_CONFLICT_TODAY:{kind:'EVENT_WEEK_CONFLICT',changes:{unavailableDates:[d0]}},RETURN_MODERATE:{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-16),endDate:addDays(d0,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}})){
   const T=H.copy(t),l=H.ev(T,at(T.p,w,0,'06:00',x));res[k]={log:l,reason:T.last.reason,monday:line(T.p,w).filter(r=>r.startsWith('d0')),mondayChanged:line(T.p,w).filter(r=>r.startsWith('d0')).join()!==res.mondaySessions.join()};
  }
  out.cases[`${tag}:${name}`]=res;
 }
}
print(out);
