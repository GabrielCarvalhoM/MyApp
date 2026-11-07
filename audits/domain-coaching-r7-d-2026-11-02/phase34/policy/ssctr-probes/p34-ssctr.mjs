// SSCTR R7-D Phase 3.4 decision probes (SSCTR-R7D-P34-DECISION-r1). Synthetic development fixtures (r7/b/fixtures/helpers.mjs, through the
// SSCTR Phase 3.3 helpers): engineering evidence for a domain decision only, never gate, quality or generalization evidence. Read-only: run on a
// scratch root holding CoachingCore, never on the repository. The prototype's env switches (P34_*) exist only in the scratch prototype.
//   node p34-ssctr.mjs <root holding CoachingCore> --label <name>
// Standard fixture: strength Mon (day 0) and Fri (4), runs Tue (1) and Thu (3), long run Sun (6). Day n counts from Mon of week 2.
//  R1   run lapse, strength complete: A = weeks 2-3 kept Mon wk4; weeks 4-6 strength done, every run reported not done; D = Mon-Thu wk7 (bulk).
//  R1k  the episode rule for R1: A applied when stated (return report Mon wk4), weekly reviews of weeks 4-6 with the same pattern, D by a return.
//  R2   strength lapse, runs complete: weeks 4-5 every run done, every strength session not done; D = Mon-Thu wk6 (bulk).
//  R2k  the episode rule for R2.
//  L1   low-load re-entry week: weeks 2-4 trained in full; A = weeks 5-6 kept Mon wk7; week 7 (CONSOLIDATION) in full; D = Mon-Thu wk8 (bulk).
//  L1k  the episode rule for L1.
//  C1   the coordinator's addendum: F1 shape (A weeks 2-3 kept Mon wk4; the Tue wk4 easy run only; D Thu-Sun wk4 named, declared Mon wk5; a
//       plain review Tue wk5), then a named correction of D to 5 days (Thu wk4 - Mon wk5) by a return report on Tue wk5.
//  C2   the same correction after the V1 shape (A; weeks 4-5 every run done, Fri strength missed; D Mon-Thu wk6; plain review; D corrected to 5 days).
// Event fixture (10K on Sun of week 7; week 7 = RACE_WEEK: strength Mon, EASY Tue, RACE_TOUCH Thu, RACE Sun; week 8 POST_EVENT):
//  W*   weeks 0-4 trained in full; A = weeks 5-6 (14 days) kept Mon wk7; week 7 reported (variants); D = Mon-Thu wk8, declared Fri wk8; plain review.
import {setup} from '../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup();
const {L,step,base,copy,day,brk,trip,obs,notDone,weekObs,view,live,returns,out}=P;
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const by=(fRun,fStr)=>(p,s)=>s.sport==='RUN'?fRun(p,s):fStr(p,s);
const done=(p,s)=>obs(p,s);
// Bulk: A kept by a fatigue report on day `aDecl` (week aw); the weeks between reported with D; a plain review after D.
function bulk(t,id,{A,aw,weeks,dw,report,dDays=4}){
 step(t,aw,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weeks.flatMap(w=>weekObs(t.p,w,report)),d0=dw*7-14,d=trip(d0,d0+dDays-1);
 step(t,dw,{day:dDays,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 return view(step(t,dw,{day:dDays,hour:'08:00:00'}),t,dw,6);
}
// The episode rule: A applied by a return report when stated, the weeks reviewed as re-planned with the same report pattern, D by a return report.
function episode(t,{A,aw,weeks,dw,report,dDays=4}){
 const ra=step(t,aw,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:A});
 for(const w of weeks)step(t,w,{observations:weekObs(t.p,w,report)});
 const d0=dw*7-14,rd=step(t,dw,{day:dDays,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:trip(d0,d0+dDays-1)});
 return {aReturn:ra.action,result:view(rd,t,dw,6)};
}
const A14=brk(0,13);
out.cases.R1_runLapseStrengthComplete=bulk(base(),'r1',{A:A14,aw:4,weeks:[4,5,6],dw:7,report:by(notDone,done)});
out.cases.R1k_episodeRule=episode(base(),{A:A14,aw:4,weeks:[4,5,6],dw:7,report:by(notDone,done)});
out.cases.R1b_runLapseTwoWeeks=bulk(base(),'r1b',{A:A14,aw:4,weeks:[4,5],dw:6,report:by(notDone,done)});
out.cases.R2_strengthLapseRunsComplete=bulk(base(),'r2',{A:A14,aw:4,weeks:[4,5],dw:6,report:by(done,notDone)});
out.cases.R2k_episodeRule=episode(base(),{A:A14,aw:4,weeks:[4,5],dw:6,report:by(done,notDone)});
// L1: a consolidation week as the only week between.
{const t=base();for(const w of [2,3,4])step(t,w,{observations:weekObs(t.p,w)});
 const executedBefore=t.p.weeks.slice(2,5).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${x.phase[0]}${x.index}:${s.prescription.family}:${s.prescription.durationMinutes}`));
 const A=brk(21,34),k=copy(t);
 const week7=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${t.p.weeks[7].phase}:${s.prescription.family}:${s.prescription.durationMinutes}`);
 out.cases.L1_consolidationWeekReentry={executedBefore:executedBefore.join(' '),week7AsPlanned:week7.join(' '),result:bulk(t,'l1',{A,aw:7,weeks:[7],dw:8,report:done})};
 out.cases.L1k_episodeRule=episode(k,{A,aw:7,weeks:[7],dw:8,report:done});}
// C1, C2: a named correction of the latest break after a separate-breaks return.
function corrected(t,id,dw,dStart,dEnd,newEnd,{day:cd,hour}){
 const r=step(t,dw,{day:cd,hour,kind:'RETURN_AFTER_PAUSE',interruption:{...trip(dStart,newEnd),episodeId:id+'-D'}});
 return view(r,t,dw,cd+1);
}
{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A14,event:{id:'c1-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'c1-D'},event:{id:'c1-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 const first=view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2);
 out.cases.C1_F1ThenNamedCorrection={first,afterCorrection:corrected(t,'c1',5,17,20,21,{day:1,hour:'09:00:00'})};}
{const t=base(),first=bulk(t,'c2',{A:A14,aw:4,weeks:[4,5],dw:6,report:(p,s)=>friStrength(s)?notDone(p,s):obs(p,s)});
 out.cases.C2_V1ThenNamedCorrection={first,afterCorrection:corrected(t,'c2',6,28,31,32,{day:5,hour:'09:00:00'})};}
// C3: after C1's first return, a report naming the EARLIER break (c1-A) with corrected dates (one day shorter).
{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A14,event:{id:'c3-A',kind:'SYSTEMIC_FATIGUE'}});
 const gap=t.p.weeks[4].sessions.filter(s=>live(s)&&s.date>=day(14)&&s.date<=day(16));
 step(t,5,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(17,20),episodeId:'c3-D'},event:{id:'c3-D',kind:'LOCAL_FATIGUE'},observations:gap.map(s=>s.sport==='RUN'?obs(t.p,s):notDone(t.p,s))});
 const first=view(step(t,5,{day:1,hour:'07:00:00'}),t,5,2);
 const r=step(t,5,{day:1,hour:'09:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...brk(0,12),episodeId:'c3-A'}});
 out.cases.C3_namedCorrectionOfEarlierBreak={first,afterCorrection:view(r,t,5,2)};}
// S1/S2 (Q5, QE-R7D-P33-02): week 4 executed in full, its Sunday long run at 08:00Z; D from Sun wk4 18:00Z (startedAt) to Wed wk5, named, declared
// Fri wk5; plain review. S2: the same, the Sunday long run reported at 19:00Z (after the stated start).
for(const [id,late] of [['s1',false],['s2',true]]){const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A14,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 const o=weekObs(t.p,4).map(x=>late&&x.sessionId===t.p.weeks[4].sessions.find(s=>live(s)&&s.role==='LONG').id?{...x,observedAt:x.observedAt.slice(0,11)+'19:00:00Z'}:x);
 const Dq={...trip(20,23),startedAt:day(20)+'T18:00:00Z',episodeId:id+'-D'};
 step(t,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:Dq,event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 out.cases[id==='s1'?'S1_sameDayLongRunBeforeStart':'S2_sameDayLongRunAfterStart']=view(step(t,5,{day:4,hour:'08:00:00'}),t,5,6);}
// Event fixture.
const {K,FULL,program,addDays}=L;
const GEV={id:'ssctr-p34-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
const ev0={p:program(GEV),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(ev0,w,{observations:weekObs(ev0.p,w)});
const raceWeek=ev0.p.weeks[7].sessions.filter(live).map(s=>`${s.date} ${s.sport==='RUN'?s.role+':'+s.prescription.durationMinutes:'STRENGTH'}${s.optional?'(optional)':''}${s.key?'(key)':''}`);
out.cases.W0_raceWeekAsPlanned={phase:ev0.p.weeks[7].phase,sessions:raceWeek};
const role=(...r)=>s=>s.sport==='RUN'&&r.includes(s.role);
const W=(id,miss)=>bulk(copy(ev0),id,{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>miss(s)?notDone(p,s):obs(p,s)});
out.cases.W1_raceWeekInFull=W('w1',()=>false);
out.cases.W2_raceTouchMissed=W('w2',role('RACE_TOUCH'));
out.cases.W3_raceMissed=W('w3',role('RACE'));
out.cases.W4_onlyEasyAndStrength=W('w4',role('RACE','RACE_TOUCH'));
console.log(JSON.stringify(out,null,1));
