// SSCTR R7-D Phase 3.4, second fresh recheck (CFR-02): what the registered R7D-HARNESS-6 r2 readings say about the two new shapes of
// p34-recheck2.mjs (SY1, the systemic rule on a race week with no gated run; CU3, a correction that uncovers an unreported session). It imports only
// the harness's own exported readings (lib/properties.mjs: executedWeekBetween, the P18(a) necessary condition per sport, and nominalSportWeekBetween,
// the P18(c) sufficient reading) and applies them to the plan and record each shape gives just before the decisive review. Synthetic development
// fixtures; engineering evidence for a domain recheck only, never gate evidence. Read-only; run on a scratch root holding CoachingCore, the five SSCTR
// authority records and audits/domain-coaching-r7-d-2026-11-02/harness/lib (git archive of the candidate commit).
//   node p34-recheck2-detectors.mjs <root> --label <name>
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {setup} from '../../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup(),root=path.resolve(process.argv[2]);
const H=await import(pathToFileURL(path.join(root,'audits/domain-coaching-r7-d-2026-11-02/harness/lib/properties.mjs')).href);
const {L,step,base,copy,day,brk,trip,obs,notDone,weekObs,live,returns,out}=P;
const {K,FULL,program}=L;
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const role=(...r)=>s=>s.sport==='RUN'&&r.includes(s.role);
const CONT=['TRAINING_NOT_REESTABLISHED','NO_TRAINING_BETWEEN'];
const read=(planBefore,ledger,after,before,r,t)=>{const ret=returns(t.p).at(-1)?.interruption,stops=r.action==='REESTABLISH'?ret?.separateBreaks?.map(b=>b.stop)??null:null;
 const nominal=H.nominalSportWeekBetween(planBefore,ledger,after,before);
 return {action:r.action,stops,ret:r.action==='REESTABLISH'?`${ret.class} ${ret.days}d`:null,P18a_RUN:H.executedWeekBetween(planBefore,ledger,after,before,{sport:'RUN'}),P18a_STRENGTH:H.executedWeekBetween(planBefore,ledger,after,before,{sport:'STRENGTH'}),
  P18c_nominalSportWeek:nominal,P18c_flags:!!stops?.some(s=>CONT.includes(s))&&nominal};};
// SY: the race week of RW (STRENGTH Mon, RACE_TOUCH Thu, optional SHAKEOUT Sat, RACE Sun), A = weeks 5-6 kept Mon wk7, D = Mon-Thu wk8.
const GEV={id:'ssctr-p34r2d-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'},schedule:{runDays:[3,5,6],longRunDay:6}};
const ev=(()=>{const t={p:program(GEV),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});return t;})();
const ADV={response:{recovery:'ADVERSE'}};
function sy(id,report){
 const t=copy(ev),A=brk(21,34),D=trip(42,45);
 step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:weekObs(t.p,7,report)});
 const planBefore=t.p,r=step(t,8,{day:4,hour:'08:00:00'});
 return read(planBefore,r.actualLedger??t.ledger,A.endDate,D.startDate,r,t);
}
out.cases.SY0_strengthAdverseOnly_control=sy('d-sy0',(p,s)=>s.sport==='STRENGTH'?obs(p,s,ADV):obs(p,s));
out.cases.SY1_strengthAndShakeoutAdverse_systemic=sy('d-sy1',(p,s)=>s.sport==='STRENGTH'||role('SHAKEOUT')(s)?obs(p,s,ADV):obs(p,s));
// CU3: A; week 4 both sports short; week 5 every run done, Fri lift not done, its Sunday long run inside the first trip report (Sun wk5 - Thu wk6);
// the trip corrected to Mon-Thu wk6 on Sat wk6 10:00 with that Sunday unreported (CU3), or reported done (CU3a, control).
function cu3(id,withSun){
 const t=base(),tue=s=>s.sport==='RUN'&&dow(s)===2,sun5=s=>s.date===day(27);
 const w4=(p,s)=>tue(s)||friStrength(s)?notDone(p,s):obs(p,s),w5=(p,s)=>friStrength(s)?notDone(p,s):obs(p,s);
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(27,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[...weekObs(t.p,4,w4),...t.p.weeks[5].sessions.filter(s=>live(s)&&!sun5(s)).map(s=>w5(t.p,s))]});
 step(t,6,{day:4,hour:'08:00:00'});
 const sun=t.p.weeks[5].sessions.find(s=>live(s)&&sun5(s)),planBefore=t.p,D=trip(28,31);
 const r=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...D,episodeId:id+'-D'},event:{id:id+'-D2',kind:'RETURN_AFTER_PAUSE'},observations:withSun&&sun?[obs(t.p,sun)]:[]});
 return read(planBefore,r.actualLedger??t.ledger,day(13),D.startDate,r,t);
}
out.cases.CU3_correctionUncoversSundayUnreported=cu3('d-cu3',false);
out.cases.CU3a_correctionWithSundayReportedDone_control=cu3('d-cu3a',true);
console.log(JSON.stringify(out,null,1));
