// SSCTR R7AF-SSCTR-r1 delta probe (own instrument): the sporting outputs of items F-A to F-F on the paths the R7-A final delta changes.
// Read-only runtime use, synthetic data, DEV_TEST_ONLY authority; prints only. The runtime root is SSCTR_CC (default: the live CoachingCore
// tree, i.e. R7A-FINAL-FREEZE); with SSCTR_CC set to the byte-exact R7A2-FREEZE-1 copy (freeze1-source/CoachingCore) it prints the same
// scenarios on the accepted freeze, for comparison. Scenario scaffolding follows CoachingCore/test/r7af-episode-identity.test.mjs (the
// author's fixtures), re-typed here; the checks and recorded outputs are mine. Usage: node ssctr-r7af-probe.mjs > out.json
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,cls='KNOWN',schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')]:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssctr-af-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{day=s.date,hour=null,reportedAt=null}={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`ssctr-af-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${day}T${hour??(s.turn==='PM'?'19:00:00':'08:00:00')}Z`,...(reportedAt?{reportedAt}:{}),actual,response:{...OK}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const report=(t,w,day,hour,keep,kind='WEEKLY_REVIEW')=>step(t,at(t.p,w,day,hour,{kind,observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const returns=P=>P.decisions.filter(d=>d.action==='REESTABLISH');
const lastReturn=P=>returns(P).at(-1);
const strengthRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const preBreakDose=(P,w,from)=>strengthRows(P,w,from).filter(({e})=>e.load.mode==='KNOWN'&&e.sets>=3).length;
const longs=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>live(s)&&s.role==='LONG'&&(!from||s.date>=from)).map(s=>s.prescription.durationMinutes);
const runMinutes=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&(!from||s.date>=from)).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const rowText=({date,e})=>`${date} ${e.id} ${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${Number.isFinite(e.load.value)?e.load.value:''}${e.exposure?.kind?'/'+e.exposure.kind:''}`;
const entryOf=d=>d?.interruption?.entry??null;
const exSummary=ent=>ent?Object.fromEntries(Object.entries(ent.strength.exercises).sort().map(([id,x])=>[id,{returnStep:x.returnStep??null,setCeiling:x.setCeiling??null,sets:x.sets??null,lastExecutedSets:x.lastExecutedSets??null,lastPerformed:x.lastPerformed??null}])):null;
const runSummary=ent=>ent?{mode:ent.run.mode,returnStep:ent.run.returnStep??null,easy:ent.run.easy??null,long:ent.run.long??null,returnFrom:ent.run.returnFrom??null,restart:ent.run.restart??null}:null;
const irq=d=>d?{eventId:d.eventId,relation:d.interruption.relation,basis:d.interruption.basis??null,episode:d.interruption.episode,supersedes:d.interruption.supersedes,class:d.interruption.class,days:d.interruption.days,stateAt:d.interruption.stateAt?{kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,eventId:d.interruption.stateAt.eventId,reportedAfterStart:d.interruption.stateAt.reportedAfterStart??false,sameDay:!!d.interruption.stateAt.sameDay}:null}:null;
/** After a return reported on `from` in week rw: every prescribed session executed, weekly reviews, through week rw+4. Per week, each exercise's
 * largest prescribed count, and the checks: O = rows above the return entry's ceiling while the exercise is in its return steps; J = a count
 * more than one set above the largest of the weeks before (after the return); P = rows at the pre-break KNOWN dose (3+ sets) in the re-entry week. */
function follow(t,rw,from,ret){
 const ceil=Object.fromEntries(Object.entries(ret?.interruption?.entry?.strength?.exercises??{}).map(([id,x])=>[id,x.setCeiling??null]));
 const traj={},longRuns={},checks={O:[],J:[]};const largest={};
 for(let w=rw;w<Math.min(rw+5,15);w++){
  const st=t.p.stateTrace[w]?.strength?.exercises??{};
  for(const {date,e} of strengthRows(t.p,w,w===rw?from:null)){
   (traj[e.id]??={})[w]=Math.max(traj[e.id]?.[w]??0,e.sets);
   if(Number.isInteger(st[e.id]?.returnStep)&&Number.isInteger(ceil[e.id])&&e.sets>ceil[e.id])checks.O.push({week:w,date,exercise:e.id,sets:e.sets,ceiling:ceil[e.id]});
   if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)checks.J.push({week:w,date,exercise:e.id,sets:e.sets,largestBefore:largest[e.id]});
  }
  longRuns[w]=longs(t.p,w,w===rw?from:null);
  weekly(t,w,s=>s.date>=from);
  for(const {e} of strengthRows(t.p,w,w===rw?from:null))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
 }
 return {trajectory:traj,longRuns,O:checks.O.length,J:checks.J.length,examples:{O:checks.O.slice(0,4),J:checks.J.slice(0,4)}};
}
function afterFirstReturn(id){
 const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);
 const d0=t.p.weeks[5].startDate;const r=step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 return {t,d0,A:lastReturn(t.p),r};
}
function firstLoaded(id,cls='FAMILIAR'){
 const g=generateProgram(intake({id,cls,schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}}),opts),t={p:g.program,ledger:[]};
 const F=t.p.weeks.findIndex(x=>strengthRows(t.p,x.index).some(({e})=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE'));
 for(let w=0;w<F;w++)weekly(t,w);
 return {t,F,d:t.p.weeks[F].startDate};
}
const monday=(P,F)=>P.weeks[F].sessions.filter(s=>live(s)&&s.day===0);
const res=r=>({status:r.status,action:r.action,missingInputs:r.missingInputs??[]});
const out={probe:'R7AF-SSCTR-r1-DELTA',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (R7A-FINAL-FREEZE; check the digest)'};

// ---------- F-A: a separate break after A's re-entry, with a later report of A (QE-R7A2-01 path) ----------
out.FA=[];
for(const [label,fix] of [['duplicate',(d0,A)=>brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long work trip'})],['named',(d0,A)=>brk(addDays(d0,-17),addDays(d0,-1),{episodeId:A.interruption.episode})]])
 for(const fixAt of [[5,2,'22:00:00'],[6,0,'06:00:00']]){
  const {t,d0,A}=afterFirstReturn(`ssctr-af-fa-${label}-${fixAt[0]}`);report(t,5,3,'05:00:00',s=>s.day<3);
  const rA2=step(t,at(t.p,...fixAt,fix(d0,A))),A2=lastReturn(t.p);
  const r=step(t,at(t.p,6,0,'07:00:00',brk(addDays(d0,3),addDays(d0,6)))),B=lastReturn(t.p);
  const from=t.p.weeks[6].startDate;
  out.FA.push({case:`${label} report of A at week ${fixAt[0]} day ${fixAt[1]} ${fixAt[2]}`,lateReportOfA:{...res(rA2),...irq(A2)},B:{...res(r),...irq(B)},
   entryA:exSummary(entryOf(A)),entryB:exSummary(entryOf(B)),runA:runSummary(entryOf(A)),runB:runSummary(entryOf(B)),
   ceilingsEqualA:entryOf(B)&&Object.entries(entryOf(B).strength.exercises).every(([id,x])=>!entryOf(A).strength.exercises[id]||x.setCeiling===entryOf(A).strength.exercises[id].setCeiling),
   week6Rows:strengthRows(t.p,6,from).map(rowText),week6Runs:runMinutes(t.p,6,from),preBreakDoseRows:{w6:preBreakDose(t.p,6,from),w7:preBreakDose(t.p,7)},
   follow:follow(t,6,from,B)});
 }

// ---------- F-B: the same separate break on either side of the week boundary (P5), and after a reviewed re-entry week (S-F) ----------
{
 const {t,d0,A}=afterFirstReturn('ssctr-af-fb');report(t,5,2,'21:00:00',s=>s.day<3);
 const same=copy(t);const rs=step(same,at(same.p,5,5,'06:00:00',brk(addDays(d0,3),addDays(d0,4))));const S=lastReturn(same.p);
 const cross=copy(t);const rx=step(cross,at(cross.p,6,2,'06:00:00',brk(addDays(d0,7),addDays(d0,8))));const X=lastReturn(cross.p);
 const reviewed=copy(t);weekly(reviewed,5,()=>false);const rr=step(reviewed,at(reviewed.p,6,2,'06:00:00',brk(addDays(d0,7),addDays(d0,8))));const R=lastReturn(reviewed.p);
 const wk=(P,w,from)=>({rows:strengthRows(P,w,from).map(rowText),runs:runMinutes(P,w,from),preBreakDoseRows:preBreakDose(P,w,from)});
 out.FB={entryA:exSummary(entryOf(A)),runA:runSummary(entryOf(A)),
  sameWeek:{...res(rs),...irq(S),entry:exSummary(entryOf(S)),run:runSummary(entryOf(S)),week6:wk(same.p,6,null)},
  crossWeek:{...res(rx),...irq(X),entry:exSummary(entryOf(X)),run:runSummary(entryOf(X)),week6:wk(cross.p,6,addDays(d0,9)),week7:wk(cross.p,7,null)},
  reviewedThenCross:{...res(rr),...irq(R),entry:exSummary(entryOf(R)),run:runSummary(entryOf(R)),week6:wk(reviewed.p,6,addDays(d0,9)),week7:wk(reviewed.p,7,null)},
  sameEqualsCross:JSON.stringify(entryOf(S))===JSON.stringify(entryOf(X))};
 out.FB.followCross=follow(cross,6,addDays(d0,9),X);
}

// ---------- F-D: a pre-break session synced after the return (confirmation-first), what a pending question pre-empts, and the never-confirmed path ----------
{
 const brkWF=d=>brk(addDays(d,2),addDays(d,4));
 const a=firstLoaded('ssctr-af-fd-a');step(a.t,at(a.t.p,a.F,4,'21:00:00',{kind:'PARTIAL_SESSION',observations:monday(a.t.p,a.F).map(s=>obs(a.t.p,s,{reportedAt:`${addDays(a.d,4)}T21:00:00Z`}))}));
 step(a.t,at(a.t.p,a.F,5,'06:00:00',brkWF(a.d)));const RA=lastReturn(a.t.p);
 const b=firstLoaded('ssctr-af-fd-b');step(b.t,at(b.t.p,b.F,5,'06:00:00',brkWF(b.d)));const RB=lastReturn(b.t.p);
 const sync=step(b.t,at(b.t.p,b.F,5,'07:00:00',{kind:'PARTIAL_SESSION',observations:monday(b.t.p,b.F).map(s=>obs(b.t.p,s,{reportedAt:`${addDays(b.d,5)}T07:00:00Z`}))}));
 const fw=RB.fromWeek;
 // While the question is pending: a systemic and a local fatigue report on Tuesday of the re-entry week, and the re-entry week's review.
 const pend=copy(b.t);
 const sys=evaluate(pend,at(pend.p,fw,1,'12:00:00',{kind:'SYSTEMIC_FATIGUE'})),loc=evaluate(pend,at(pend.p,fw,1,'12:00:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}));
 // Never confirmed, re-entry week missed entirely: the review of the re-entry week, then the next week's rows.
 const never=copy(b.t);const wr=weekly(never,fw,()=>false);
 const confirmed=copy(b.t);const rc=step(confirmed,at(confirmed.p,b.F,5,'08:00:00',brkWF(b.d)));const RC=lastReturn(confirmed.p);const wc=weekly(confirmed,fw,()=>false);
 const wk=(P,w)=>({rows:strengthRows(P,w).map(rowText),runs:runMinutes(P,w)});
 out.FD={inTime:{...irq(RA),entry:exSummary(entryOf(RA))},returnBeforeSync:{...irq(RB),fromWeek:fw,entry:exSummary(entryOf(RB))},syncAfterReturn:{...res(sync),question:sync.question??null},
  pendingSystemicFatigue:{...res(sys),reason:sys.reason},pendingLocalFatigue:{...res(loc),reason:loc.reason},
  confirmed:{...res(rc),...irq(RC),entry:exSummary(entryOf(RC)),entryEqualsInTime:JSON.stringify(entryOf(RC)?.strength)===JSON.stringify(entryOf(RA)?.strength)},
  reentryWeekMissed:{neverConfirmed:{review:res(wr),reentryWeek:wk(never.p,fw),nextWeek:wk(never.p,fw+1),nextStart:exSummary({strength:never.p.stateTrace[fw+1].strength}),nextRun:runSummary({run:never.p.stateTrace[fw+1].run})},
   confirmed:{review:res(wc),reentryWeek:wk(confirmed.p,fw),nextWeek:wk(confirmed.p,fw+1),nextStart:exSummary({strength:confirmed.p.stateTrace[fw+1].strength}),nextRun:runSummary({run:confirmed.p.stateTrace[fw+1].run})}}};
 // The same fatigue reports without a pending question (Monday logged in time): what they do on the same week.
 const pa=copy(a.t);const fwA=RA.fromWeek;
 const changedBy=(r,P,w)=>{if(!r.proposal)return [];const before=P.weeks[w].sessions,after=r.proposal.weeks[w].sessions;return after.map((s,i)=>[before[i],s]).filter(([b,s])=>JSON.stringify(b.prescription??null)!==JSON.stringify(s.prescription??null)||b.status!==s.status).map(([b,s])=>`${b.date} ${b.sport}:${b.role??b.templateType??''} ${b.prescription?.durationMinutes??''} -> ${s.status==='SKIPPED'?'SKIPPED':(s.role??'')+' '+(s.prescription?.durationMinutes??'')}`);};
 const ns=evaluate(pa,at(pa.p,fwA,1,'12:00:00',{kind:'SYSTEMIC_FATIGUE'})),nl=evaluate(pa,at(pa.p,fwA,1,'12:00:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}));
 out.FD.noPendingSystemicFatigue={...res(ns),changes:changedBy(ns,pa.p,fwA)};out.FD.noPendingLocalFatigue={...res(nl),changes:changedBy(nl,pa.p,fwA)};
 out.FD.pendingWeekPlan={runs:runMinutes(pend.p,fw),rows:strengthRows(pend.p,fw).map(rowText)};
}

// ---------- F-D on a moderate return: a 16-day break from Wednesday of the first loaded week, Monday's lifting synced after the return;
// the re-entry week executed or missed, its review with the question pending (never confirmed) or after the confirmation ----------
{
 const wk=(P,w)=>({rows:strengthRows(P,w).map(rowText),runs:runMinutes(P,w),start:exSummary({strength:P.stateTrace[w].strength}),run:runSummary({run:P.stateTrace[w].run})});
 out.FD2=[];
 for(const executed of [false,true]){
  const b=firstLoaded('ssctr-af-fd2-'+executed,'FAMILIAR'),bs=addDays(b.d,2),be=addDays(b.d,17),rd=addDays(be,1),rw=Math.floor((Date.parse(rd)-Date.parse(b.t.p.startDate))/(7*864e5));
  weekly(b.t,b.F,()=>false);for(let w=b.F+1;w<rw;w++)weekly(b.t,w,()=>false);
  const day=(Date.parse(rd)-Date.parse(b.t.p.weeks[rw].startDate))/864e5;
  const rRet=step(b.t,at(b.t.p,rw,day,'06:00:00',brk(bs,be)));const RB=lastReturn(b.t.p),fw=RB.fromWeek;
  const sync=step(b.t,at(b.t.p,rw,day,'07:00:00',{kind:'PARTIAL_SESSION',observations:monday(b.t.p,b.F).map(s=>obs(b.t.p,s,{reportedAt:`${rd}T07:00:00Z`}))}));
  const never=copy(b.t),conf=copy(b.t);
  const wr=weekly(never,fw,executed?()=>true:()=>false);
  const rc=step(conf,at(conf.p,rw,day,'08:00:00',brk(bs,be)));const RC=lastReturn(conf.p);const wc=weekly(conf,fw,executed?()=>true:()=>false);
  out.FD2.push({reentryWeekExecuted:executed,ret:{...res(rRet),...irq(RB),fromWeek:fw},sync:res(sync),
   neverConfirmed:{review:res(wr),reentry:wk(never.p,fw),next:wk(never.p,fw+1)},
   confirmed:{report:{...res(rc),...irq(RC)},review:res(wc),reentry:wk(conf.p,fw),next:wk(conf.p,fw+1)}});
 }
}

// ---------- F-C: a first-day session whose order changes only a last performed date (not asked): the reading kept against the other one ----------
{
 const mk=(id,startedAt)=>{const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate,s=addDays(d0,-16);
  const r=step(t,at(t.p,5,0,'06:00:00',brk(s,addDays(d0,-1),startedAt?{startedAt:`${s}T${startedAt}Z`}:{})));return {r,D:lastReturn(t.p),s,day:t.p.weeks[2].sessions.filter(x=>live(x)&&x.date===s).map(x=>`${x.sport}:${x.turn}`)};};
 const datesOnly=mk('ssctr-af-fc-dates',null),afterSession=mk('ssctr-af-fc-after','21:00:00'),beforeSession=mk('ssctr-af-fc-before','06:00:00');
 const strip=e=>e?Object.fromEntries(Object.entries(e.strength.exercises).map(([id,{lastPerformed,...x}])=>[id,x])):null;
 const lp=e=>e?Object.fromEntries(Object.entries(e.strength.exercises).map(([id,x])=>[id,x.lastPerformed])):null;
 out.FC={firstDay:datesOnly.s,sessionsThatDay:datesOnly.day,
  datesOnly:{...res(datesOnly.r),...irq(datesOnly.D),lastPerformed:lp(entryOf(datesOnly.D))},
  startedAfterTheSession:{...res(afterSession.r),...irq(afterSession.D),lastPerformed:lp(entryOf(afterSession.D))},
  startedBeforeTheSession:{...res(beforeSession.r),...irq(beforeSession.D),lastPerformed:lp(entryOf(beforeSession.D))},
  datesOnlyEqualsStartedBeforeExceptNothing:JSON.stringify(entryOf(datesOnly.D)?.strength)===JSON.stringify(entryOf(beforeSession.D)?.strength),
  datesOnlyEqualsStartedAfterExceptLastPerformed:JSON.stringify(strip(entryOf(datesOnly.D)))===JSON.stringify(strip(entryOf(afterSession.D))),
  runEntryEqual:JSON.stringify(entryOf(datesOnly.D)?.run)===JSON.stringify(entryOf(afterSession.D)?.run)};
}

// ---------- F-E: an earlier break first reported after a later one began (QE-R7A2-03 / P21) ----------
out.FE=[];
for(const trained of [true,false]){
 const g=start({id:'ssctr-af-fe-'+trained},3),w=3,e0=g.p.weeks[w].startDate;
 if(trained)report(g,w,2,'21:00:00',s=>s.day===2);
 const r1=step(g,at(g.p,w,5,'06:00:00',brk(e0,addDays(e0,1))));const first=lastReturn(g.p);
 const r=step(g,at(g.p,w,6,'06:00:00',brk(addDays(e0,3),addDays(e0,4))));const B=lastReturn(g.p);
 const nextBefore={rows:strengthRows(g.p,w+1).map(rowText),runs:runMinutes(g.p,w+1),preBreakDoseRows:preBreakDose(g.p,w+1)};
 // The week's review that evening (nothing else executed): an identity question does not hold it back.
 const wr=weekly(g,w,()=>false);
 out.FE.push({trainedWednesday:trained,first:{...res(r1),...irq(first),entry:exSummary(entryOf(first))},second:{...res(r),...(r.proposal?irq(B):{}),entry:r.proposal?exSummary(entryOf(B)):null},
  nextWeek:nextBefore,afterReview:{review:res(wr),rows:strengthRows(g.p,w+1).map(rowText),runs:runMinutes(g.p,w+1),preBreakDoseRows:preBreakDose(g.p,w+1)}});
}

// ---------- F-F: a date-shifted correction without the break's name, in both directions, and the named one ----------
out.FF=[];
// Weeks 0-2 trained and reviewed, weeks 3-4 untrained and reviewed; both reports on Monday of week 5 (06:00, then 07:00), the break ending Sunday.
for(const [from,to] of [[14,5],[5,14],[14,14]])for(const named of [false,true]){
 const t=start({id:`ssctr-af-ff-${from}-${to}-${named}`},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const w=5,d0=t.p.weeks[w].startDate;
 const mk=(days,h,extra={})=>at(t.p,w,0,h,brk(addDays(d0,-days),addDays(d0,-1),extra));
 const r1=step(t,mk(from,'06:00:00'));const A=lastReturn(t.p);
 const r2=step(t,mk(to,'07:00:00',named?{episodeId:A.interruption.episode}:{}));const C=lastReturn(t.p);
 // A clinical reason on the unnamed correction: screened before identity, never shadowed by the identity question.
 const clin=evaluate(t,mk(to,'07:30:00',{reason:'Knee pain',reasonCategory:'INJURY'}));
 out.FF.push({case:`${from} days, then ${to} days ${named?'named':'unnamed'}`,first:{...res(r1),...irq(A)},second:{...res(r2),...(r2.proposal?irq(C):{})},
  inForce:{eventId:C.eventId,class:C.interruption.class,days:C.interruption.days,entry:exSummary(entryOf(C)),run:runSummary(entryOf(C))},
  reentryWeek:{rows:strengthRows(t.p,w).map(rowText),runs:runMinutes(t.p,w),preBreakDoseRows:preBreakDose(t.p,w)},clinicalReasonOnTheCorrection:res(clin)});
}
console.log(JSON.stringify(out,null,1));
