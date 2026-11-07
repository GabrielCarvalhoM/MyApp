// SSCTR R7-D Phase 3.4, second fresh recheck (CFR-02 of SSCTR-R7D-P34-RECHECK-r1), written by the second fresh recheck instance. Synthetic
// development fixtures (CoachingCore/r7/b/fixtures/helpers.mjs, through the SSCTR Phase 3.3 helpers): engineering evidence for a domain recheck
// only, never gate, quality or generalization evidence. Read-only: run on a scratch root holding CoachingCore (and the five SSCTR authority records
// the bound repertoire reads), never on the repository. Copy it to the same relative path under the scratch root first.
//   node p34-recheck2.mjs <root holding CoachingCore> --label <name>
// Standard fixture: strength Mon (day 0, PM) and Fri (4, PM), runs Tue (1) and Thu (3), the long run Sun (6). Day n counts from Mon of week 2.
//  SY*  The systemic rule (BR-Q3.2(1), BR-Q6) on the path the cycle opened (SSCTR-P34R-F03): the race week of p34-recheck.mjs RW (STRENGTH Mon,
//       RACE_TOUCH Thu, optional SHAKEOUT Sat, RACE Sun; no gated run), A = weeks 5-6 kept Mon wk7, D = Mon-Thu wk8, bulk.
//       SY0 the strength session with recovery ADVERSE (one sport, one session: not systemic; control);
//       SY1 the strength session and the optional shakeout with recovery ADVERSE (converging across sports: systemic);
//       SY1g the same two adverse responses in a race week that holds a gated easy run (EASY Tue, RACE_TOUCH Thu, SHAKEOUT Sat, RACE Sun): the
//       comparator where a gate exists for the systemic rule to hold; SY0g that week with the strength session adverse only (not systemic).
//       SY1x and SY1gx: the two weeks executed in full (controls).
//  SA*  The answer to the question the cycle added (SSCTR-P34R-F04): SD1 of p34-recheck.mjs (V1 shape, the Monday wk2 lift on A's first day, no
//       start time) asked; then A reported again by name with its start time, after the lift (SA1, comparator SD2) or before it (SA2), then a
//       plain review.
//  LC*  QRE-P34-01 from the domain side: the Founder's case (V1), then a named correction of the trip giving only its length (5 days), sent on Mon
//       wk7 10:00 (LC1: read as ending the day before that review, by the existing readBreak rule), against the same correction with those dates
//       stated (LC1d) and a fresh report of the trip with those dates (LC1f; the Mon-Tue wk6 sessions it uncovers left unreported).
//  CU*  Days a correction uncovers, left unreported (see the block below); CU1d/CU1fd and CU3a/CU3fa report them done.
//  UK*  QRE-P34-05 and its mirror (a sport whose every session of the weeks between is marked unavailable, SKIPPED): late form, weeks 2-3 not
//       done, holiday A (weeks 2-3) and trip D (Wed-Sat wk6) reported on Sun wk6, plain review. The days between are weeks 4-5 and Mon-Tue wk6.
//       UK1 the strength days between marked unavailable (UNAVAILABLE_DAY at the start of each week), every run done; UK1n the same with strength
//       reported not done (comparator). UK2 the run days between marked unavailable, strength done; UK2n the same with the runs reported not done.
import {setup} from '../../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup();
const {L,step,base,copy,day,brk,trip,obs,notDone,weekObs,view,live,returns,out}=P;
const {K,FULL,program}=L;
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const role=(...r)=>s=>s.sport==='RUN'&&r.includes(s.role);
const v1=(p,s)=>friStrength(s)?notDone(p,s):obs(p,s);
const sb=t=>(returns(t.p).at(-1)?.interruption?.separateBreaks??[]).map(b=>({episode:b.episode,stop:b.stop,...(b.ownReturn?{ownReturn:b.ownReturn}:{}),...(b.ownReturnOf?{ownReturnOf:b.ownReturnOf,stopInOwnReturn:b.stopInOwnReturn}:{})}));
const q=r=>r.question?{...r.question,...(r.question.unreported?{unreported:r.question.unreported.sessionIds.length}:{})}:null;
function bulk(t,id,{A,aw,weeks,dw,report,dDays=4,aObs=[]}){
 step(t,aw,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'},observations:aObs});
 const o=weeks.flatMap(w=>weekObs(t.p,w,report)),d0=dw*7-14,d=trip(d0,d0+dDays-1);
 step(t,dw,{day:dDays,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
 const r=step(t,dw,{day:dDays,hour:'08:00:00'});
 return {...view(r,t,dw,6),missingInputs:r.missingInputs??[],q:q(r),records:r.action==='REESTABLISH'?sb(t):null};
}
const planned=(p,w)=>p.weeks[w].sessions.filter(live).map(s=>`${s.date} ${s.sport==='RUN'?s.role+':'+s.prescription.durationMinutes:'STRENGTH'}${s.optional?'(optional)':''}`);
// ---------- SY: the systemic rule on a race week with no gated run ----------
const GEV={id:'ssctr-p34r2-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
function raceBase(o){const t={p:program(o),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});return t;}
const ADV={response:{recovery:'ADVERSE'}};
{const ev=raceBase({...GEV,id:'ssctr-p34r2-sy',schedule:{runDays:[3,5,6],longRunDay:6}});
 out.cases.SY_racWeekPlanned=planned(ev.p,7);
 out.cases.SY0_strengthAdverseOnly_control=bulk(copy(ev),'sy0',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>s.sport==='STRENGTH'?obs(p,s,ADV):obs(p,s)});
 out.cases.SY1_strengthAndShakeoutAdverse_systemic=bulk(copy(ev),'sy1',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>s.sport==='STRENGTH'||role('SHAKEOUT')(s)?obs(p,s,ADV):obs(p,s)});
 out.cases.SY1x_raceWeekInFull_control=bulk(copy(ev),'sy1x',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>obs(p,s)});}
{const ev=raceBase({...GEV,id:'ssctr-p34r2-syg',schedule:{runDays:[1,3,5,6],longRunDay:6}});
 out.cases.SY1g_racWeekPlanned=planned(ev.p,7);
 out.cases.SY0g_gatedRaceWeekStrengthAdverseOnly_control=bulk(copy(ev),'sy0g',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>s.sport==='STRENGTH'?obs(p,s,ADV):obs(p,s)});
 out.cases.SY1g_gatedRaceWeekStrengthAndShakeoutAdverse_systemic=bulk(copy(ev),'sy1g',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>s.sport==='STRENGTH'||role('SHAKEOUT')(s)?obs(p,s,ADV):obs(p,s)});
 out.cases.SY1gx_gatedRaceWeekInFull_control=bulk(copy(ev),'sy1gx',{A:brk(21,34),aw:7,weeks:[7],dw:8,report:(p,s)=>obs(p,s)});}
// ---------- SA: answering the first-day question ----------
{const lift=t=>[obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)))];
 for(const [id,at] of [['SA1_answerStartAfterTheLift',`${day(0)}T20:00:00Z`],['SA2_answerStartBeforeTheLift',`${day(0)}T07:00:00Z`]]){
  const t=base(),k=id.slice(0,3).toLowerCase(),asked=bulk(t,k,{A:brk(0,13),aw:4,weeks:[4,5],dw:6,report:v1,aObs:lift(t)});
  const a=step(t,6,{day:4,hour:'09:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...brk(0,13,{startedAt:at}),episodeId:k+'-A'},event:{id:k+'-A2',kind:'SYSTEMIC_FATIGUE'}});
  const r=step(t,6,{day:4,hour:'10:00:00'});
  out.cases[id]={asked:{action:asked.action,missingInputs:asked.missingInputs,q:asked.q},answer:{status:a.status,action:a.action,missingInputs:a.missingInputs??[],reason:(a.reason??'').slice(0,200)},
   then:{...view(r,t,6,6),missingInputs:r.missingInputs??[],q:q(r),records:r.action==='REESTABLISH'?sb(t):null}};
 }}
// ---------- LC: a correction that gives only its length, sent later ----------
{const founders=id=>{const t=base();step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,v1))});
  const r=step(t,6,{day:4,hour:'08:00:00'});return {t,first:view(r,t,6,6)};};
 for(const [id,i] of [['LC1_lengthOnlySentMonWk7',{days:5,reasonCategory:'WORK',reason:'Work trip',nonclinical:true}],['LC1d_sameWithItsDatesStated',trip(30,34)]]){
  const {t,first}=founders(id.slice(0,4).toLowerCase());
  const r=step(t,7,{day:0,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...i,episodeId:id.slice(0,4).toLowerCase()+'-D'},event:{id:id+'-D2',kind:'RETURN_AFTER_PAUSE'}});
  out.cases[id]={first:first.ret,corrected:{...view(r,t,7,6),missingInputs:r.missingInputs??[],q:q(r),records:r.action==='REESTABLISH'?sb(t):null}};
 }
 // LC1f: the fresh comparator of LC1/LC1d (A, weeks 4-5 reported as V1, the trip reported as Wed-Sun wk6 on Mon wk7 10:00; Mon-Tue wk6 unreported).
 {const f=base();step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'lc1f-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,7,{day:0,hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,34),episodeId:'lc1f-D'},event:{id:'lc1f-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(f.p,w,v1))});
  const r=step(f,7,{day:0,hour:'10:00:00'});
  out.cases.LC1f_freshReportOfTheCorrectedTrip={...view(r,f,7,6),missingInputs:r.missingInputs??[],q:q(r),records:r.action==='REESTABLISH'?sb(f):null};}}
// ---------- CU: days a correction uncovers, left unreported (CF-P34-02 against a fresh report) ----------
// CU1: C5 of p34-recheck.mjs (the trip corrected from Mon-Thu wk6 to Tue-Fri wk6 on Sat 10:00) without a report of the Monday wk6 lift, now
// between the breaks; CU1f the fresh comparator (the trip reported as Tue-Fri wk6 from the start, the Monday lift unreported).
// CU2: T21's week-moved-in shape (A; week 4 reported; trip Mon-Thu wk5 applied Fri wk5; corrected on Fri wk6 10:00 to Mon-Thu wk6); CU2f the
// fresh comparator (trip reported as Mon-Thu wk6 on Fri wk6 07:00 with week 4 reported, plain review 10:00). The sessions each asks about.
{const qs=(t,r)=>r.question?.unreported?{from:r.question.unreported.from,through:r.question.unreported.through,sessions:r.question.unreported.sessionIds.map(id=>{const s=t.p.weeks.flatMap(w=>w.sessions).find(x=>x.id===id);return s?`${s.date} ${s.sport}`:id;})}:null;
 {const t=base();
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu1-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'cu1-D'},event:{id:'cu1-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,v1))});
  const first=view(step(t,6,{day:4,hour:'08:00:00'}),t,6,6);
  const rc=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(29,32),episodeId:'cu1-D'},event:{id:'cu1-D2',kind:'RETURN_AFTER_PAUSE'}});
  out.cases.CU1_correctionUncoversMondayUnreported={first:first.ret,corrected:{...view(rc,t,6,6),missingInputs:rc.missingInputs??[],asked:qs(t,rc),records:rc.action==='REESTABLISH'?sb(t):null}};}
 {const f=base();
  step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu1f-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(29,32),episodeId:'cu1f-D'},event:{id:'cu1f-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(f.p,w,v1))});
  const rf=step(f,6,{day:5,hour:'10:00:00'});
  out.cases.CU1f_freshReportMondayUnreported={...view(rf,f,6,6),missingInputs:rf.missingInputs??[],asked:qs(f,rf),records:rf.action==='REESTABLISH'?sb(f):null};}
 // CU1d: the same correction with the Monday wk6 lift reported done (what the athlete would answer if it was done); CU1fd the fresh comparator.
 {const mon6=t=>t.p.weeks[6].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(28));
  const t=base();
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu1d-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'cu1d-D'},event:{id:'cu1d-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,v1))});
  step(t,6,{day:4,hour:'08:00:00'});
  const m=mon6(t),rc=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(29,32),episodeId:'cu1d-D'},event:{id:'cu1d-D2',kind:'RETURN_AFTER_PAUSE'},observations:m?[obs(t.p,m)]:[]});
  out.cases.CU1d_correctionMondayReportedDone={...view(rc,t,6,6),missingInputs:rc.missingInputs??[],records:rc.action==='REESTABLISH'?sb(t):null};
  const f=base();
  step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu1fd-A',kind:'SYSTEMIC_FATIGUE'}});
  const mf=mon6(f);
  step(f,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(29,32),episodeId:'cu1fd-D'},event:{id:'cu1fd-D',kind:'LOCAL_FATIGUE'},observations:[...[4,5].flatMap(w=>weekObs(f.p,w,v1)),...(mf?[obs(f.p,mf)]:[])]});
  const rf=step(f,6,{day:5,hour:'10:00:00'});
  out.cases.CU1fd_freshMondayReportedDone={...view(rf,f,6,6),missingInputs:rf.missingInputs??[],records:rf.action==='REESTABLISH'?sb(f):null};}
 // CU3: a correction that uncovers the last session of a week, where that week is the only possible re-entry: A; week 4 both sports short (the
 // Tuesday run and the Friday lift not done); week 5 every run done and the Friday lift not done, its Sunday long run inside the first report of
 // the trip (Sun wk5 - Thu wk6, declared Fri wk6 07:00; plain review 08:00); the trip then corrected by name to Mon-Thu wk6 on Sat wk6 10:00 with
 // the Sunday wk5 long run left unreported. CU3f: the fresh comparator (the trip reported as Mon-Thu wk6 from the start, the Sunday unreported);
 // CU3fa: the fresh comparator with that long run reported done; CU3a: the correction sent with that long run reported done.
 {const tue=s=>s.sport==='RUN'&&dow(s)===2,sun5=s=>s.date===day(27);
  const w4=(p,s)=>tue(s)||friStrength(s)?notDone(p,s):obs(p,s),w5=(p,s)=>friStrength(s)?notDone(p,s):obs(p,s);
  const facts=(t,withSun)=>[...weekObs(t.p,4,w4),...t.p.weeks[5].sessions.filter(s=>live(s)&&(withSun||!sun5(s))).map(s=>w5(t.p,s))];
  for(const [id,withSun] of [['CU3_correctionUncoversSundayUnreported',false],['CU3a_correctionWithSundayReportedDone',true]]){
   const t=base(),k=id.slice(0,4).toLowerCase();
   step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:k+'-A',kind:'SYSTEMIC_FATIGUE'}});
   step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(27,31),episodeId:k+'-D'},event:{id:k+'-D',kind:'LOCAL_FATIGUE'},observations:facts(t,false)});
   const first=view(step(t,6,{day:4,hour:'08:00:00'}),t,6,6);
   const sun=t.p.weeks[5].sessions.find(s=>live(s)&&sun5(s));
   const rc=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:k+'-D'},event:{id:k+'-D2',kind:'RETURN_AFTER_PAUSE'},observations:withSun&&sun?[obs(t.p,sun)]:[]});
   out.cases[id]={first:{ret:first.ret,separateBreaks:first.separateBreaks},corrected:{...view(rc,t,6,6),missingInputs:rc.missingInputs??[],asked:qs(t,rc),records:rc.action==='REESTABLISH'?sb(t):null}};
  }
  for(const [id,withSun] of [['CU3f_freshSundayUnreported',false],['CU3fa_freshSundayReportedDone',true]]){
   const f=base(),k=id.slice(0,5).toLowerCase();
   step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:k+'-A',kind:'SYSTEMIC_FATIGUE'}});
   step(f,6,{day:5,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:k+'-D'},event:{id:k+'-D',kind:'LOCAL_FATIGUE'},observations:facts(f,withSun)});
   const rf=step(f,6,{day:5,hour:'10:00:00'});
   out.cases[id]={...view(rf,f,6,6),missingInputs:rf.missingInputs??[],asked:qs(f,rf),records:rf.action==='REESTABLISH'?sb(f):null};
  }}
 {const w=base();
  step(w,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu2-A',kind:'SYSTEMIC_FATIGUE'}});
  step(w,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'cu2-D'},event:{id:'cu2-D',kind:'LOCAL_FATIGUE'},observations:weekObs(w.p,4,v1)});
  const first=step(w,5,{day:4,hour:'08:00:00'});
  const rw=step(w,6,{day:4,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'cu2-D'},event:{id:'cu2-D2',kind:'RETURN_AFTER_PAUSE'}});
  out.cases.CU2_correctionMovesAWeekIn={first:first.action,corrected:{action:rw.action,question:rw.question?.kind??null,missingInputs:rw.missingInputs??[],asked:qs(w,rw)}};}
 {const f=base();
  step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu2f-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'cu2f-D'},event:{id:'cu2f-D',kind:'LOCAL_FATIGUE'},observations:weekObs(f.p,4,v1)});
  const rf=step(f,6,{day:4,hour:'10:00:00'});
  out.cases.CU2f_freshReportWeekBetweenUnreported={action:rf.action,question:rf.question?.kind??null,missingInputs:rf.missingInputs??[],asked:qs(f,rf)};}
 // CU2a/CU2b: CU2 answered (SSCTR-P34R-F01 closure: "T21's week-moved-in case, once its unreported week is answered, never reads continuity because
 // of the corrected break's own earlier report"): the correction sent again with reports of the sessions asked (CU2a), or of every session of week 5
 // (CU2b), all done; the V1 pattern (Fri strength missed) and every session done (all) in turn. CU2fb: the fresh comparator with week 5 reported.
 for(const [tag,pat] of [['V1',v1],['all',(p,s)=>obs(p,s)]]){
  const mk=()=>{const w=base();
   step(w,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu2'+tag+'-A',kind:'SYSTEMIC_FATIGUE'}});
   step(w,5,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:'cu2'+tag+'-D'},event:{id:'cu2'+tag+'-D',kind:'LOCAL_FATIGUE'},observations:weekObs(w.p,4,v1)});
   step(w,5,{day:4,hour:'08:00:00'});
   const rw=step(copy(w),6,{day:4,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'cu2'+tag+'-D'},event:{id:'cu2'+tag+'-D2',kind:'RETURN_AFTER_PAUSE'}});
   return {w,ids:rw.question?.unreported?.sessionIds??[]};};
  for(const [id,which] of [['CU2a_answeredAskedOnly_'+tag,'asked'],['CU2b_answeredWholeWeek5_'+tag,'week']]){
   const {w,ids}=mk(),sess=w.p.weeks[5].sessions.filter(s=>s.prescription&&(which==='week'?s.date>=day(21):ids.includes(s.id)));
   const r=step(w,6,{day:4,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'cu2'+tag+'-D'},event:{id:id+'-D2',kind:'RETURN_AFTER_PAUSE'},observations:sess.map(s=>pat(w.p,s))});
   out.cases[id]={reported:sess.map(s=>`${s.date} ${s.sport}${s.status==='SKIPPED'?' SKIPPED':''}`),...view(r,w,6,6),missingInputs:r.missingInputs??[],asked:qs(w,r),records:r.action==='REESTABLISH'?sb(w):null};
  }
  const f=base();
  step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'cu2fb'+tag+'-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'cu2fb'+tag+'-D'},event:{id:'cu2fb'+tag+'-D',kind:'LOCAL_FATIGUE'},observations:[...weekObs(f.p,4,v1),...weekObs(f.p,5,pat)]});
  const rf=step(f,6,{day:4,hour:'10:00:00'});
  out.cases['CU2fb_freshWeek5Reported_'+tag]={...view(rf,f,6,6),missingInputs:rf.missingInputs??[],asked:qs(f,rf),records:rf.action==='REESTABLISH'?sb(f):null};
 }}
// ---------- UK: a sport marked unavailable for the weeks between ----------
{// The weeks between: 4, 5 and week 6 before the trip (Mon, Tue); the trip is Wed-Sat wk6 (days 30-33), both breaks reported on Sun wk6.
 const between=s=>s.date<day(30);
 const mk=(id,unavail,report)=>{const t=base();for(const w of [2,3])step(t,w,{observations:weekObs(t.p,w,notDone)});
  for(const w of [4,5,6]){const dates=t.p.weeks[w].sessions.filter(s=>live(s)&&between(s)&&unavail(s)).map(s=>s.date);
   if(dates.length)step(t,w,{day:0,hour:'05:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:dates}});}
  const status=[4,5,6].flatMap(w=>t.p.weeks[w].sessions.filter(s=>s.prescription&&between(s)).map(s=>`${s.date} ${s.sport}${s.sport==='RUN'?':'+s.role:''} ${s.status??'PLANNED'}${s.movedTo?' movedTo '+s.movedTo:''}`));
  const o=[4,5,6].flatMap(w=>t.p.weeks[w].sessions.filter(s=>live(s)&&between(s)).map(s=>report(t.p,s)));
  step(t,6,{day:6,hour:'06:00:00',kind:'SYSTEMIC_FATIGUE',interruption:{...brk(0,13),episodeId:id+'-A'},event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,6,{day:6,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(30,33),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:o});
  const r=step(t,6,{day:6,hour:'08:00:00'});
  return {weeks4and5:status,result:{...view(r,t,6,6),missingInputs:r.missingInputs??[],q:q(r),records:r.action==='REESTABLISH'?sb(t):null}};};
 const str=s=>s.sport==='STRENGTH',run=s=>s.sport==='RUN';
 out.cases.UK1_strengthMarkedUnavailableRunsDone=mk('uk1',str,(p,s)=>obs(p,s));
 out.cases.UK1n_strengthNotDoneRunsDone=mk('uk1n',()=>false,(p,s)=>str(s)?notDone(p,s):obs(p,s));
 out.cases.UK2_runsMarkedUnavailableStrengthDone=mk('uk2',run,(p,s)=>obs(p,s));
 out.cases.UK2n_runsNotDoneStrengthDone=mk('uk2n',()=>false,(p,s)=>run(s)?notDone(p,s):obs(p,s));}
console.log(JSON.stringify(out,null,1));
