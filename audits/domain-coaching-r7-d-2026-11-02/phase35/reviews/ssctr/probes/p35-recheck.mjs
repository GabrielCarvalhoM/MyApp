// SSCTR R7-D Phase 3.5 narrow recheck (REVIEW_REQUEST_PHASE35.md section 4), written by the fresh SSCTR instance of SSCTR-R7D-P35-RECHECK-r1.
// Synthetic development fixtures (CoachingCore/r7/b/fixtures/helpers.mjs, through the SSCTR Phase 3.3 helpers): engineering evidence for a domain
// recheck only, never gate, quality or generalization evidence. Read-only: run on a scratch root holding CoachingCore and the five SSCTR authority
// records, never on the repository. Copy it to the same relative path under a scratch root first; the runtime is the root given.
//   node p35-recheck.mjs <root holding CoachingCore> --label <name> [--harness <root holding the R7-D harness lib>]
// Standard fixture: strength Mon (day 0, PM) and Fri (4, PM), runs Tue (1) and Thu (3), the long run Sun (6). Day n counts from Mon of week 2.
//  AN*  F02 answered: CU3 (p34-recheck2.mjs) asked, then answered done by a plain review (ANr) or by the correction sent again with the long run
//       (ANc); ANf = CU3fa (the fresh report with the long run done). Full doses, two weeks ahead.
//  MV*  The T32 "moved a week later" shape (A; trip first Mon-Thu wk5 declared Mon wk6; corrected Fri wk6 to Mon-Thu wk6 with week 5 Mon-Thu
//       reported done) against its fresh report (MVf); MS* the same with no earlier break (a single-break correction, O-P35-01); runs with the
//       R27 eased slot marked, and every eased slot of the plan.
//  RS*  QRE2-P34-01, the R07 shape (T33 founders): late first-day lift, then (RS1) a restatement after the lift, then the trip confirmed; RS1c the
//       control with the start time stated from the outset; RS1k the lift reported with the holiday from the outset; RS2 a restatement before the
//       lift; RS3 the trip confirmed first; RS4 a report of the holiday that changes its reason to an injury (by a weekly review, RS4w, and a return
//       report, RS4r); RS5 one that changes its last day; RS6 never answered (reviews to week 8); RS7 a restatement then a newer report changing
//       its last day (the newest decides).
//  SYc* The P18(e) corner: SY1 of p34-recheck2.mjs with the adverse recovery reported with performance OVER (the runtime's classifier reads it
//       CONFLICTING, not ADVERSE), against SY1; the runtime's outcome and the R7D-HARNESS-7 reading adverseConvergence of the re-entered week.
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {setup} from '../../../../phase33/reviews/ssctr/probes/common.mjs';
const P=await setup(),root=path.resolve(process.argv[2]);
const hroot=process.argv.includes('--harness')?path.resolve(process.argv[process.argv.indexOf('--harness')+1]):root;
const {L,step,base,copy,day,brk,trip,obs,notDone,weekObs,live,returns,addDays,out}=P;
const {K,FULL,program}=L;
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5,tueRun=s=>s.sport==='RUN'&&dow(s)===2;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
const role=(...r)=>s=>s.sport==='RUN'&&r.includes(s.role);
const last=p=>returns(p).at(-1)?.interruption??null;
const tag=e=>String(e).split('-').at(-1);
/** The return in force, every run and strength dose of weeks w and w+1 from day d, and every R27 eased slot the plan holds. */
function full(t,w,d){
 const x=last(t.p),from=addDays(t.p.weeks[w].startDate,d),ws=t.p.weeks.slice(w,w+2);
 return {ret:x?`${x.class} ${x.days}d ${x.startDate}..${x.endDate} ${x.entry?.run?.mode??''}`:null,
  breaks:x?(x.separateBreaks??[]).map(b=>`${tag(b.episode)}:${b.stop}${b.reentryWeek?' reentry '+b.reentryWeek:''}${b.ownReturn?' reentered RUN '+b.ownReturn.reentered.RUN+' STRENGTH '+b.ownReturn.reentered.STRENGTH:''}`):null,
  runs:ws.flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.date} ${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.easedFor?' [eased for '+tag(s.easedFor)+']':''}`),
  strength:ws.flatMap(k=>k.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).map(s=>`${s.date} `+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`).join(' ')),
  easedSlots:t.p.weeks.flatMap(k=>k.sessions).filter(s=>s.easedFor).map(s=>`${s.date} ${s.role}:${s.prescription?.family}:${s.prescription?.durationMinutes} for ${tag(s.easedFor)}`),
  returnsApplied:returns(t.p).length};
}
const dec=r=>({action:r.action,status:r.status??null,missingInputs:r.missingInputs??[],question:r.question?{kind:r.question.kind??null,episodeId:r.question.episodeId?tag(r.question.episodeId):null,startDate:r.question.startDate??null}:null,reason:(r.reason??'').slice(0,260)});
const asked=(t,r)=>(r.question?.unreported?.sessionIds??[]).map(id=>{const s=t.p.weeks.flatMap(w=>w.sessions).find(x=>x.id===id);return s?`${s.date} ${s.sport}`:id;});

// ---------- AN: SSCTR-P34R2-F02 answered (CU3) ----------
{const sun5=s=>s.date===day(27),w4=miss(s=>tueRun(s)||friStrength(s)),w5=miss(friStrength);
 const facts=(t,withSun)=>[...weekObs(t.p,4,w4),...t.p.weeks[5].sessions.filter(s=>live(s)&&(withSun||!sun5(s))).map(s=>w5(t.p,s))];
 const sun=t=>t.p.weeks[5].sessions.find(s=>live(s)&&sun5(s));
 const cu3=k=>{const t=base();
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:k+'-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(27,31),episodeId:k+'-D'},event:{id:k+'-D',kind:'LOCAL_FATIGUE'},observations:facts(t,false)});
  step(t,6,{day:4,hour:'08:00:00'});
  const q=step(t,6,{day:5,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:k+'-D'},event:{id:k+'-D2',kind:'RETURN_AFTER_PAUSE'}});
  return {t,q};};
 {const {t,q}=cu3('anr'),a=step(t,6,{day:5,hour:'11:00:00',observations:[obs(t.p,sun(t))]});
  out.cases.ANr_CU3answeredByPlainReview={asked:{...dec(q),sessions:asked(t,q)},answer:dec(a),view:full(t,6,6)};}
 {const {t,q}=cu3('anc'),a=step(t,6,{day:5,hour:'11:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:'anc-D'},event:{id:'anc-D3',kind:'RETURN_AFTER_PAUSE'},observations:[obs(t.p,sun(t))]});
  out.cases.ANc_CU3answeredByTheCorrectionAgain={asked:{...dec(q),sessions:asked(t,q)},answer:dec(a),view:full(t,6,6)};}
 {const f=base();
  step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:'anf-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,6,{day:5,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:'anf-D'},event:{id:'anf-D',kind:'LOCAL_FATIGUE'},observations:facts(f,true)});
  out.cases.ANf_freshSundayDone_CU3fa={decision:dec(step(f,6,{day:5,hour:'10:00:00'})),view:full(f,6,6)};}}

// ---------- MV / MS: a correction that moves the trip a week later (T32) and O-P35-01 ----------
{const early=s=>s.date<=day(24),wk5=(t,pred)=>t.p.weeks[5].sessions.filter(s=>live(s)&&pred(s)).map(s=>obs(t.p,s));
 for(const [id,withA] of [['MV',true],['MS',false]]){
  const k=id.toLowerCase(),wk4=withA?miss(friStrength):(p,s)=>obs(p,s);
  const t=base();
  if(withA)step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:k+'-A',kind:'SYSTEMIC_FATIGUE'}});
  step(t,6,{day:0,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(21,24),episodeId:k+'-D'},event:{id:k+'-D',kind:'LOCAL_FATIGUE'},observations:[...weekObs(t.p,4,wk4),...wk5(t,s=>!early(s))]});
  const first=step(t,6,{day:0,hour:'08:00:00'}),fv=full(t,6,0);
  const rc=step(t,6,{day:4,hour:'10:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:k+'-D'},event:{id:k+'-D2',kind:'RETURN_AFTER_PAUSE'},observations:wk5(t,early)});
  const f=base();
  if(withA)step(f,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk(0,13),event:{id:k+'f-A',kind:'SYSTEMIC_FATIGUE'}});
  step(f,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:k+'f-D'},event:{id:k+'f-D',kind:'LOCAL_FATIGUE'},observations:[...weekObs(f.p,4,wk4),...weekObs(f.p,5)]});
  const rf=step(f,6,{day:4,hour:'08:00:00'});
  out.cases[id+'_firstReportMonThuWk5']={decision:dec(first),view:fv};
  out.cases[id+'_correctedToMonThuWk6']={decision:dec(rc),view:full(t,6,4)};
  out.cases[id+'f_freshReportMonThuWk6']={decision:dec(rf),view:full(f,6,4)};
 }}

// ---------- RS: QRE2-P34-01, the R07 shape ----------
{const v1=miss(friStrength),A=(x={})=>brk(0,13,x),after=`${day(0)}T20:00:00Z`,before=`${day(0)}T07:00:00Z`;
 const monLift=t=>t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0));
 function founders(id,{a=A(),lift=false}={}){
  const t=base();
  step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:a,event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'},observations:lift?[obs(t.p,monLift(t))]:[]});
  step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,v1))});
  return {t,r:step(t,6,{day:4,hour:'08:00:00'})};}
 const late=(x)=>step(x.t,6,{day:5,hour:'09:00:00',observations:[obs(x.t.p,monLift(x.t))]});
 const report=(t,id,i,channel,hour,n='')=>{const e={id:`${id}-A-${channel}-${hour}${n}`};
  return channel==='weekly review'?step(t,6,{day:5,hour,interruption:i,event:{...e,kind:'WEEKLY_REVIEW'}}):step(t,6,{day:5,hour,kind:'RETURN_AFTER_PAUSE',interruption:i,event:{...e,kind:'RETURN_AFTER_PAUSE'}});};
 const confirm=(t,id,hour)=>step(t,6,{day:5,hour,kind:'RETURN_AFTER_PAUSE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:`${id}-D2-${hour}`,kind:'RETURN_AFTER_PAUSE'}});
 const later=t=>[step(t,6,{day:6,hour:'21:00:00'}),step(t,7,{observations:weekObs(t.p,7)}),step(t,8,{observations:weekObs(t.p,8)})].map(r=>r.action+(r.missingInputs?.length?' '+r.missingInputs.join('|'):''));
 // RS1: the restatement after the lift (a return report), then the trip confirmed.
 {const x=founders('rs1'),before0=full(x.t,6,6),q=late(x),a=report(x.t,'rs1',{...A({startedAt:after}),episodeId:'rs1-A'},'return report','10:00:00'),c=confirm(x.t,'rs1','11:00:00');
  out.cases.RS1_restatedAfterTheLiftThenConfirmed={firstReturn:before0,late:dec(q),restatement:dec(a),confirmation:dec(c),view:full(x.t,6,6),later:later(x.t)};}
 {const x=founders('rs1c',{a:A({startedAt:after})});late(x);const c=confirm(x.t,'rs1c','11:00:00');
  out.cases.RS1c_startTimeStatedFromTheOutset={confirmation:dec(c),view:full(x.t,6,6)};}
 {const x=founders('rs1k',{a:A({startedAt:after}),lift:true});
  out.cases.RS1k_liftAndStartTimeKnownFromTheOutset={decision:dec(x.r),view:full(x.t,6,6)};}
 // RS2: a restatement before the lift.
 {const x=founders('rs2'),q=late(x),plan=full(x.t,6,6),a=report(x.t,'rs2',{...A({startedAt:before}),episodeId:'rs2-A'},'weekly review','10:00:00');
  out.cases.RS2_restatedBeforeTheLift={late:dec(q),restatement:dec(a),planUnchanged:JSON.stringify(full(x.t,6,6))===JSON.stringify(plan),view:full(x.t,6,6),later:later(x.t)};}
 // RS3: the trip confirmed first.
 {const x=founders('rs3'),q=late(x),c=confirm(x.t,'rs3','10:00:00'),a=report(x.t,'rs3',{...A({startedAt:after}),episodeId:'rs3-A'},'return report','11:00:00');
  out.cases.RS3_confirmedFirst={late:dec(q),confirmation:dec(c),restatement:dec(a),view:full(x.t,6,6),later:later(x.t)};}
 // RS4: a report naming the holiday that changes its reason to an injury (other facts and the start time as RS1).
 for(const channel of ['weekly review','return report']){const id='rs4'+channel[0],x=founders(id),q=late(x);
  const a=report(x.t,id,{...A({startedAt:after}),reasonCategory:'INJURY',reason:'Holiday, then an ankle injury',nonclinical:false,episodeId:id+'-A'},channel,'10:00:00');
  out.cases['RS4'+channel[0]+'_namedReportChangesReasonToInjury_'+channel.replace(' ','')]={late:dec(q),report:dec(a),returnsApplied:returns(x.t.p).length,next:dec(step(x.t,6,{day:5,hour:'12:00:00'}))};}
 // RS5: a report naming the holiday that changes its last day (one day shorter).
 {const x=founders('rs5'),q=late(x),a=report(x.t,'rs5',{...brk(0,12,{startedAt:after}),episodeId:'rs5-A'},'weekly review','10:00:00');
  out.cases.RS5_namedReportChangesLastDay={late:dec(q),report:dec(a),returnsApplied:returns(x.t.p).length,next:dec(step(x.t,6,{day:5,hour:'12:00:00'}))};}
 // RS5x: RS5, then the holiday restated (its first facts and the start time after the lift): the newest report decides; then the trip confirmed.
 {const x=founders('rs5x'),q=late(x),a=report(x.t,'rs5x',{...brk(0,12,{startedAt:after}),episodeId:'rs5x-A'},'weekly review','10:00:00');
  const b=report(x.t,'rs5x',{...A({startedAt:after}),episodeId:'rs5x-A'},'weekly review','11:00:00','b'),c=confirm(x.t,'rs5x','12:00:00');
  out.cases.RS5x_changedLastDayThenRestated={late:dec(q),report:dec(a),restatement:dec(b),confirmation:dec(c),returnsApplied:returns(x.t.p).length,later:later(x.t)};}
 // RS6: never answered.
 {const x=founders('rs6'),plan=full(x.t,6,6),q=late(x);
  out.cases.RS6_neverAnswered={late:dec(q),later:later(x.t),returnsApplied:returns(x.t.p).length,week6PlanAfterLateUnchanged:JSON.stringify(plan.runs)};}
 // RS7: a restatement, then a newer report of the holiday changing its last day (the newest decides), then the trip confirmed.
 {const x=founders('rs7'),q=late(x),a=report(x.t,'rs7',{...A({startedAt:after}),episodeId:'rs7-A'},'weekly review','10:00:00');
  const b=report(x.t,'rs7',{...brk(0,12,{startedAt:after}),episodeId:'rs7-A'},'weekly review','11:00:00','b'),c=confirm(x.t,'rs7','12:00:00');
  out.cases.RS7_restatedThenNewerReportChangesLastDay={late:dec(q),restatement:dec(a),newer:dec(b),confirmation:dec(c),returnsApplied:returns(x.t.p).length};}}

// ---------- SYc: the P18(e) corner (performance OVER with recovery ADVERSE) ----------
{let H=null;try{H=await import(pathToFileURL(path.join(hroot,'audits/domain-coaching-r7-d-2026-11-02/harness/lib/properties.mjs')).href);}catch{H=null;}
 const GEV={id:'ssctr-p35-ev',weeks:12,goals:{run:'10K',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)],event:{kind:'10K',date:'2026-12-27'}};
 const raceBase=()=>{const t={p:program({...GEV,schedule:{runDays:[3,5,6],longRunDay:6}}),ledger:[],ref:null};for(const w of [0,1,2,3,4])step(t,w,{observations:weekObs(t.p,w)});return t;};
 const ev=raceBase();
 for(const [id,resp] of [['SYc0_recoveryAdverse_SY1',{recovery:'ADVERSE'}],['SYc1_recoveryAdversePerformanceOver',{recovery:'ADVERSE',performance:'OVER'}],['SYc2_nextDayImpaired',{nextDayFunction:'IMPAIRED'}]]){
  const t=copy(ev),k=id.slice(0,4).toLowerCase(),A=brk(21,34),d=trip(42,45);
  step(t,7,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A,event:{id:k+'-A',kind:'SYSTEMIC_FATIGUE'}});
  const o=weekObs(t.p,7,(p,s)=>s.sport==='STRENGTH'||role('SHAKEOUT')(s)?obs(p,s,{response:resp}):obs(p,s));
  step(t,8,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...d,episodeId:k+'-D'},event:{id:k+'-D',kind:'LOCAL_FATIGUE'},observations:o});
  const r=step(t,8,{day:4,hour:'08:00:00'}),x=last(t.p),wk7=t.p.weeks[7],cut=`${day(42)}T00:00:00Z`;
  out.cases[id]={decision:dec(r),view:full(t,8,4),harness:H?.adverseConvergence?{harnessRoot:path.basename(path.dirname(hroot))+'/'+path.basename(hroot),P18e_adverseConvergenceOfWeek7:H.adverseConvergence(wk7,t.ledger,cut),runReenteredThroughWeek7:(x?.separateBreaks??[]).some(b=>b.stop==='TRAINING_AFTER'&&b.reentryWeek===wk7.startDate||b.stop==='OWN_RETURN'&&b.ownReturn?.reentered?.RUN===wk7.startDate)}:'adverseConvergence not exported by this harness'};
 }}
console.log(JSON.stringify(out,null,1));
