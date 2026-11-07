// SSCTR R7-D Phase 3.4 fresh recheck (CF-P34-08): what the registered R7D-HARNESS-6 readings say about the race-week shapes of p34-recheck.mjs.
// It imports only the harness's own exported readings (lib/properties.mjs: executedWeekBetween, the P18(a) necessary condition per sport, and
// nominalSportWeekBetween, the P18(c) sufficient reading) and applies them to the plan and record each shape gives just before its plain review.
// Synthetic development fixtures; engineering evidence for a domain recheck only, never gate evidence. Read-only; run on a scratch root holding
// CoachingCore, the five SSCTR authority records and audits/domain-coaching-r7-d-2026-11-02/harness/lib (git archive of the candidate commit).
//   node p34-recheck-detectors.mjs <root> --label <name>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {setup} from '../../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup(),root=path.resolve(process.argv[2]);
const H=await import(pathToFileURL(path.join(root,'audits/domain-coaching-r7-d-2026-11-02/harness/lib/properties.mjs')).href);
const {L,step,copy,brk,trip,obs,notDone,weekObs,live,returns,out}=P;
const {K,FULL,program}=L;
const role=(...r)=>s=>s.sport==='RUN'&&r.includes(s.role);
const half=(p,s)=>obs(p,s,{minutes:Math.max(1,Math.round(s.prescription.durationMinutes/2))});
const GEV={id:'ssctr-p34d-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
function raceBase(o){const t={p:program(o),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});return t;}
function shape(t0,id,report){
 const t=copy(t0),A=brk(21,34),D=trip(42,45);
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:weekObs(t.p,7,report)});
 const planBefore=t.p,r=step(t,8,{day:4,hour:'08:00:00'}),ledger=r.actualLedger??t.ledger,ret=returns(t.p).at(-1)?.interruption;
 return {stops:ret?.separateBreaks?.map(b=>b.stop)??null,ret:ret?`${ret.class} ${ret.days}d`:r.action,
  P18a_RUN:H.executedWeekBetween(planBefore,ledger,A.endDate,D.startDate,{sport:'RUN'}),P18a_STRENGTH:H.executedWeekBetween(planBefore,ledger,A.endDate,D.startDate,{sport:'STRENGTH'}),
  P18c_nominalSportWeek:H.nominalSportWeekBetween(planBefore,ledger,A.endDate,D.startDate),
  P18c_flags:!!ret?.separateBreaks?.some(b=>['TRAINING_NOT_REESTABLISHED','NO_TRAINING_BETWEEN'].includes(b.stop))&&H.nominalSportWeekBetween(planBefore,ledger,A.endDate,D.startDate)};
}
const hyb=raceBase(GEV),runOnly=raceBase({...GEV,id:'ssctr-p34d-evo',goals:{run:'10K',strength:'NONE'},knownExercises:[],schedule:{strengthDays:[]}});
const touchOnly=raceBase({...GEV,id:'ssctr-p34d-ev3',goals:{run:'10K',strength:'NONE'},knownExercises:[],schedule:{runDays:[3,5,6],longRunDay:6,strengthDays:[]}});
out.cases.RT1o_runOnlyTouchAtHalfMinutes=shape(runOnly,'d-rt1o',(p,s)=>role('RACE_TOUCH')(s)?half(p,s):obs(p,s));
out.cases.RT2o_runOnlyTouchMissed=shape(runOnly,'d-rt2o',(p,s)=>role('RACE_TOUCH')(s)?notDone(p,s):obs(p,s));
out.cases.RT1_hybridTouchAtHalfMinutes=shape(hyb,'d-rt1',(p,s)=>role('RACE_TOUCH')(s)?half(p,s):obs(p,s));
out.cases.RWo_runOnlyRaceWeekWithoutGatedRun=shape(touchOnly,'d-rwo',(p,s)=>obs(p,s));
console.log(JSON.stringify(out,null,1));
