// SSCTR R7AB-SSCTR-r1 boundary probe (own instrument): the sporting outputs of items S-A to S-F on the paths the R7-A boundary delta changes,
// plus the S-F checks across them. Read-only runtime use, synthetic data, DEV_TEST_ONLY authority; prints only. The runtime root is SSCTR_CC
// (default: the live CoachingCore tree, i.e. R7A-BOUNDARY-FINAL-FREEZE); with SSCTR_CC set to the byte-exact R7A-FINAL-FREEZE copy
// (final-freeze-source/CoachingCore) it prints the same scenarios on the freeze I accepted, for comparison. Scenario scaffolding follows
// CoachingCore/test/r7ab-week-start-authority.test.mjs and test/r6-adaptation.test.mjs (the author's fixtures), re-typed here; the checks and the
// recorded outputs are mine. Usage: node ssctr-r7ab-probe.mjs > out.json
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=process.env.SSCTR_CC??path.resolve(import.meta.dirname,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),{PROFILES}=await load('r6/fixtures/profiles.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssctr-ab-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{kg=null,actual=null,response=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:kg?.(e.id)??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`ssctr-ab-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK,...(response??{})}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)))step(t,at(t.p,w,s.day,s.day===6?'05:00:00':'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));};
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const lastReturn=P=>P.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
const strengthRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const rowText=({date,e})=>`${date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`;
const runRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&(!from||s.date>=from)).map(s=>`${s.date} ${s.role} ${s.prescription.family??''} ${s.prescription.durationMinutes}`);
const atKnown=t=>({kg:id=>t.p.stateTrace[5].strength.exercises[id]?.load??20});
const res=r=>({status:r.status,action:r.action??null,missingInputs:r.missingInputs??[]});
/** The state an interruption starts from, compactly: run mode/step and return fields; per exercise every field except dates. */
const runState=st=>st?Object.fromEntries(Object.entries(st.run).filter(([k])=>!['planned','modeHistory','peaks'].includes(k)).sort()):null;
const exState=st=>st?Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([id,{lastPerformed,...e}])=>[id,e])):null;
const irq=d=>d?{eventId:d.eventId,relation:d.interruption.relation,class:d.interruption.class,days:d.interruption.days,stateAt:{kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,authority:d.interruption.stateAt.authority??null,executed:d.interruption.stateAt.executed}}:null;
const entryOut=d=>d?{irq:irq(d),run:runState(d.interruption.entry),strength:exState(d.interruption.entry)}:null;
/** S-F checks on an entry against a reference return (A): every exercise's set ceiling at most A's (or its executed count), no run step above
 * the one executed, and, in the given weeks, no row above its ceiling while in return steps, no KNOWN row at 3+ sets (the pre-break dose). */
function sf(P,d,{A=null,executedRunStep=0,weeks=[],from=null}={}){
 const e=d?.interruption?.entry;if(!e)return null;const out={runStepAbove:0,ceilingAboveA:[],rowsAboveCeiling:[],preBreakRows:[]};
 if(Number.isInteger(e.run.returnStep)&&e.run.returnStep>executedRunStep)out.runStepAbove=e.run.returnStep;
 const a=A?.interruption?.entry?.strength?.exercises??{};
 for(const [id,x] of Object.entries(e.strength.exercises))if(Number.isInteger(x.setCeiling)&&Number.isInteger(a[id]?.setCeiling)&&x.setCeiling>a[id].setCeiling)out.ceilingAboveA.push({id,ceiling:x.setCeiling,A:a[id].setCeiling});
 for(const w of weeks){const st=P.stateTrace[w]?.strength?.exercises??{};
  for(const r of strengthRows(P,w,w===weeks[0]?from:null)){const x=st[r.e.id];if(Number.isInteger(x?.returnStep)&&Number.isInteger(x?.setCeiling)&&r.e.sets>x.setCeiling)out.rowsAboveCeiling.push(rowText(r));if(r.e.load.mode==='KNOWN'&&r.e.sets>=3)out.preBreakRows.push(rowText(r));}}
 return out;
}
/** After a return: every prescribed session from `from` executed and reviewed for `n` weeks. O = rows above the return entry's ceiling while in
 * return steps; J = a count more than one set above the largest of the weeks before; long runs per week. */
function follow(t,rw,from,ret,n=4){
 const ceil=Object.fromEntries(Object.entries(ret?.interruption?.entry?.strength?.exercises??{}).map(([id,x])=>[id,x.setCeiling??null]));
 const longRuns={},O=[],J=[],largest={};
 for(let w=rw;w<Math.min(rw+n,15);w++){
  const st=t.p.stateTrace[w]?.strength?.exercises??{};
  for(const {date,e} of strengthRows(t.p,w,w===rw?from:null)){
   if(Number.isInteger(st[e.id]?.returnStep)&&Number.isInteger(ceil[e.id])&&e.sets>ceil[e.id])O.push({week:w,date,exercise:e.id,sets:e.sets,ceiling:ceil[e.id]});
   if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)J.push({week:w,date,exercise:e.id,sets:e.sets,largestBefore:largest[e.id]});
  }
  longRuns[w]=t.p.weeks[w].sessions.filter(s=>live(s)&&s.role==='LONG'&&(w!==rw||s.date>=from)).map(s=>s.prescription.durationMinutes);
  weekly(t,w,s=>w!==rw||s.date>=from);
  for(const {e} of strengthRows(t.p,w,w===rw?from:null))largest[e.id]=Math.max(largest[e.id]??0,e.sets);
 }
 return {longRuns,O:O.length,J:J.length,examples:{O:O.slice(0,3),J:J.slice(0,3)}};
}
/** Weeks 0-2 trained and reviewed, 3-4 untrained (the first break), then A: a 16-day return on Monday 06:00 of week 5 (re-entry that week). */
function afterReturn(id){const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));return {t,d0,A:lastReturn(t.p)};}
/** B: a separate trip of days [from,to] after d0, reported on day `said` at 06:00. */
const tripB=(t,d0,{from=8,to=9,said=10}={})=>{const w=Math.floor((Date.parse(addDays(d0,said))-Date.parse(t.p.startDate))/(7*864e5)),r=step(t,at(t.p,w,(said%7+7)%7,'06:00:00',brk(addDays(d0,from),addDays(d0,to))));return {r:res(r),B:r.action==='REESTABLISH'?lastReturn(t.p):null};};
const sundayOnMonday=(t,o={})=>step(t,at(t.p,6,0,'06:00:00',{observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s,o))}));
const weekRows=(P,weeks,from)=>Object.fromEntries(weeks.map((w,i)=>[w,{run:runRows(P,w,i===0?from:null),strength:strengthRows(P,w,i===0?from:null).map(rowText)}]));
const out={probe:'R7AB-SSCTR-r1-BOUNDARY',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (R7A-BOUNDARY-FINAL-FREEZE; check the digest)'};
const sfAll=[];

// ---------- S-A: QE-R7AF-01. Re-entry week 5 unfinished and unreviewed (Tue run, Wed lift executed), a decision on Monday of week 6, then B ----------
out.SA={};
{
 const {t,d0,A}=afterReturn('ssctr-ab-sa');perDay(t,5,s=>s.day<3);
 out.SA.A=entryOut(A);out.SA.week6StartAuthority=t.p.weeks[6].startAuthority??null;
 const triggers={control:null,equipmentWindow:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}},equipmentFullKit:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}},
  systemicFatigue:{kind:'SYSTEMIC_FATIGUE'},localFatigue:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},scheduleNextWeek:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}},goalNextWeek:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}};
 for(const [label,x] of Object.entries(triggers)){
  const u=copy(t);let tr=null;if(x)tr=res(step(u,at(u.p,6,0,'06:00:00',x)));
  const {r,B}=tripB(u,d0);const c={trigger:tr,B:r,entry:entryOut(B),rows:weekRows(u.p,[6,7],addDays(d0,10)),sf:sf(u.p,B,{A,executedRunStep:0,weeks:[6,7],from:addDays(d0,10)})};
  if(label==='control'||label==='equipmentFullKit'||label==='systemicFatigue')c.follow=follow(u,6,addDays(d0,10),B);
  out.SA[label]=c;sfAll.push(['SA.'+label,c.sf]);
 }
 // The Sunday cells: on Sunday of week 5 the week is complete. A review, or a handler applying the review's rule, consolidates it (WEEK_EVIDENCE).
 for(const [label,fn] of Object.entries({sundayReview:u=>weekly(u,5,()=>false),sundaySchedule:u=>step(u,at(u.p,5,6,'21:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}})),sundayEquipment06:u=>step(u,at(u.p,5,6,'06:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}))})){
  const u=copy(t);fn(u);const {r,B}=tripB(u,d0);const c={B:r,week6StartAuthority:u.p.weeks[6].startAuthority??null,entry:entryOut(B),rows:weekRows(u.p,[6,7],addDays(d0,10)),sf:sf(u.p,B,{A,executedRunStep:0,weeks:[6,7],from:addDays(d0,10)})};
  out.SA[label]=c;sfAll.push(['SA.'+label,c.sf]);
 }
}

// ---------- S-B: a re-entry week executed with lighter loads than the ceiling, or exactly at the loads the projection kept ----------
out.SB={};
for(const [label,how] of Object.entries({lighter20kg:u=>({kg:()=>20}),atProjectedLoads:u=>atKnown(u)})){
 const {t,d0,A}=afterReturn('ssctr-ab-sb-'+label);const o=how(t);perDay(t,5,s=>s.day<6,o);sundayOnMonday(t,o);
 const {r,B}=tripB(t,d0);const c={B:r,entry:entryOut(B),rows:weekRows(t.p,[6,7],addDays(d0,10)),sf:sf(t.p,B,{A,executedRunStep:1,weeks:[6,7],from:addDays(d0,10)})};
 out.SB[label]=c;sfAll.push(['SB.'+label,c.sf]);
}
{
 // S-B with the review on Sunday: the same lighter week, then the weekly review (WEEK_EVIDENCE adopts 20 kg) before B.
 const {t,d0,A}=afterReturn('ssctr-ab-sb-rev');perDay(t,5,s=>s.day<6,{kg:()=>20});
 const sun=t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6);step(t,at(t.p,5,6,'21:00:00',{observations:sun.map(s=>obs(t.p,s,{kg:()=>20}))}));
 const {r,B}=tripB(t,d0);const c={B:r,entry:entryOut(B),rows:weekRows(t.p,[6,7],addDays(d0,10)),sf:sf(t.p,B,{A,executedRunStep:1,weeks:[6,7],from:addDays(d0,10)})};
 out.SB.lighter20kgReviewed=c;sfAll.push(['SB.lighter20kgReviewed',c.sf]);
}

// ---------- S-C: a first interruption after unconsolidated weeks ----------
out.SC={};
{
 // (1) test/r6-adaptation.test.mjs: profile A, never logged, an 18-day break reported at the end of week 5 (days only).
 const p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,opts).program,w=5,lastDay=(P,k)=>P.weeks[k].sessions.at(-1).date;
 const rev=(P,k,kind,extra={})=>{const d=lastDay(P,k);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:k,event:{id:`ssctr-ab-sc-${k}-${kind}-${N++}`,kind},eligibility:elig(d),...extra};};
 const pause={interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true}};
 const m=evaluateProgram(p,rev(p,w,'RETURN_AFTER_PAUSE',pause),opts),d=m.proposal?.decisions.at(-1);
 out.SC.neverLogged18d={result:res(m),stateAt:d?.interruption?.stateAt?{kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,authority:d.interruption.stateAt.authority??null,executed:d.interruption.stateAt.executed}:null,
  run:runState(d?.interruption?.entry),strength:exState(d?.interruption?.entry),entryWeek:{run:runRows(m.proposal,w+1),strength:strengthRows(m.proposal,w+1).map(rowText)},stepWeek:{run:runRows(m.proposal,w+2),strength:strengthRows(m.proposal,w+2).map(rowText)},
  week0:{run:runRows(p,0),strength:strengthRows(p,0).map(rowText)},planWeek5:{strength:strengthRows(p,5).map(rowText),run:runRows(p,5)},intakeRun:{longestRunMinutes:PROFILES.A_RUN_FIRST_HALF_MARATHON.athlete?.recent?.longestRunMinutes??null,knownExercises:(PROFILES.A_RUN_FIRST_HALF_MARATHON.athlete?.knownExercises??[]).map(k=>k.id)}};
 // (2) The same program after three executed and reviewed weeks (logged loads as in the test: known as planned, chosen at 20 kg).
 const logsFor=s=>s.sport==='STRENGTH'?{exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.value??20,unit:'KG',convention:e.load.convention},rir:e.rir}))}))}:{};
 const all=(P,k)=>P.weeks[k].sessions.filter(s=>s.prescription).map(s=>({eventId:'e-'+s.id,athleteId:P.athleteId,sessionId:s.id,observedAt:s.date+'T09:00:00Z',actual:{completed:true,minutes:s.prescription.durationMinutes,...logsFor(s)},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'},source:{provider:'MANUAL'}}));
 let q=p,ledger=[];for(let i=0;i<3;i++){const r=evaluateProgram(q,rev(q,i,'WEEKLY_REVIEW',{observations:all(q,i),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)q=r.proposal;}
 const lg=evaluateProgram(q,rev(q,w,'RETURN_AFTER_PAUSE',{...pause,actualLedger:ledger}),opts),ld=lg.proposal?.decisions.at(-1);
 out.SC.threeWeeksReviewed18d={result:res(lg),stateAt:ld?.interruption?.stateAt?{kind:ld.interruption.stateAt.kind,week:ld.interruption.stateAt.week,authority:ld.interruption.stateAt.authority??null}:null,run:runState(ld?.interruption?.entry),entryWeek:{run:runRows(lg.proposal,w+1),strength:strengthRows(lg.proposal,w+1).map(rowText)}};
 // (3) The r7ab intake (back-squat known 3x5 at 80 kg), never logged, a 14-day break from Monday of week 3 reported Monday of week 5.
 const g=generateProgram(intake({id:'ssctr-ab-sc3'}),opts).program,t3={p:g,ledger:[]},d3=g.weeks[3].startDate;
 const r3=step(t3,at(t3.p,5,0,'06:00:00',brk(d3,addDays(d3,13))));const R3=lastReturn(t3.p);
 out.SC.knownNeverLogged14d={result:res(r3),entry:entryOut(R3),plan:{week3:strengthRows(g,3).map(rowText)},entryWeek:weekRows(t3.p,[5],null)[5],sf:sf(t3.p,R3,{weeks:[5]})};sfAll.push(['SC.knownNeverLogged14d',out.SC.knownNeverLogged14d.sf]);
 // (4) Family G: weeks 0-2 reviewed; week 3 half executed (Mon-Wed) and never reviewed; a 2-day trip on Wed-Thu of week 4. Control: week 3 reviewed.
 for(const [label,fn] of Object.entries({halfWeekUnreviewed:u=>perDay(u,3,s=>s.day<3),fullWeekReviewed:u=>weekly(u,3),fullWeekLoggedUnreviewed:u=>perDay(u,3,()=>true)})){
  const u=start({id:'ssctr-ab-g-'+label},3);fn(u);const d4=u.p.weeks[4].startDate,rr=step(u,at(u.p,4,2,'06:00:00',brk(addDays(d4,1),addDays(d4,2))));const B=lastReturn(u.p);
  out.SC['G_'+label]={result:res(rr),entry:entryOut(B),rows:weekRows(u.p,[4,5],addDays(d4,3)),sf:sf(u.p,B,{weeks:[4,5],from:addDays(d4,3)})};sfAll.push(['SC.G_'+label,out.SC['G_'+label].sf]);
 }
 // (5) Weeks 0-3 every session executed and logged on its day, never consolidated by a week-end review; an 18-day break from Monday of week 4.
 for(const [label,fn] of Object.entries({loggedUnreviewed:u=>{for(let k=0;k<4;k++)perDay(u,k,()=>true);},reviewed:u=>{for(let k=0;k<4;k++)weekly(u,k);}})){
  const g5=generateProgram(intake({id:'ssctr-ab-c5-'+label}),opts).program,u={p:g5,ledger:[]};fn(u);const d4=u.p.weeks[4].startDate;
  const rr=step(u,at(u.p,6,4,'06:00:00',brk(d4,addDays(d4,17))));const B=lastReturn(u.p);
  out.SC['C5_'+label]={result:res(rr),weekAuthorities:u.p.weeks.slice(0,5).map(x=>x.startAuthority?{authority:x.startAuthority.authority,RUN:x.startAuthority.RUN?.provenance,STRENGTH:x.startAuthority.STRENGTH?.provenance}:null),entry:entryOut(B),rows:weekRows(u.p,[6,7],addDays(d4,18)),sf:sf(u.p,B,{weeks:[6,7],from:addDays(d4,18)})};
  sfAll.push(['SC.C5_'+label,out.SC['C5_'+label].sf]);
 }
}

// ---------- S-D: inside a return, a value a review held from a projected start ----------
out.SD={};
{
 const {t,d0,A}=afterReturn('ssctr-ab-sd');perDay(t,5,s=>s.day<5);sundayOnMonday(t);
 const rows5=strengthRows(t.p,5),satOnly=[...new Set(rows5.filter(({date})=>date===addDays(d0,5)).map(({e})=>e.id))].filter(id=>!rows5.some(({date,e})=>date!==addDays(d0,5)&&e.id===id));
 out.SD.satOnly=satOnly;
 for(const [label,fn] of Object.entries({held:u=>weekly(u,6,s=>s.day!==5),full:u=>weekly(u,6)})){
  const u=copy(t);fn(u);const {r,B}=tripB(u,d0,{from:15,to:16,said:17});
  out.SD[label]={B:r,entry:entryOut(B),satOnlySteps:Object.fromEntries(satOnly.map(id=>[id,B?.interruption?.entry?.strength?.exercises?.[id]?.returnStep??null])),rows:weekRows(u.p,[7,8],addDays(d0,17)),sf:sf(u.p,B,{A,executedRunStep:2,weeks:[7,8],from:addDays(d0,17)})};
  out.SD[label].executedBeforeB={week5:{run:runRows(t.p,5).filter(x=>true),strengthMissed:strengthRows(t.p,5).filter(({date})=>date===addDays(d0,5)).map(rowText)},week6:{run:runRows(u.p,6)}};
  out.SD[label].follow=follow(u,7,addDays(d0,17),B);
  sfAll.push(['SD.'+label,out.SD[label].sf]);
 }
 // Isolation: the same history, but week 5 consolidated by its own review on Sunday (Sunday's run reported on Sunday). Week 6 again misses its
 // Saturday lift and is reviewed; then the same 2-day trip.
 {
  const {t:u,d0:e0}=afterReturn('ssctr-ab-sd-w5rev');perDay(u,5,s=>s.day<5);step(u,at(u.p,5,6,'21:00:00',{observations:u.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(u.p,s))}));
  weekly(u,6,s=>s.day!==5);const {r,B}=tripB(u,e0,{from:15,to:16,said:17});
  out.SD.heldWeek5Reviewed={B:r,entry:entryOut(B),rows:weekRows(u.p,[7,8],addDays(e0,17)),follow:follow(u,7,addDays(e0,17),B)};
 }
}

// ---------- S-E: a named correction that contradicts its own executed re-entry (Founder §11) ----------
out.SE={};
{
 const {t,d0,A}=afterReturn('ssctr-ab-se');perDay(t,5,s=>s.day<3);
 const fix=(u,from,to,said,id=A.interruption.episode)=>{const r=step(u,at(u.p,5,said,'06:00:00',brk(addDays(d0,from),addDays(d0,to),{episodeId:id})));return r;};
 for(const [label,args] of Object.entries({movedAfterReentry:[3,4,5],byReportId:[3,4,5,A.eventId],endingOverTuesdayRun:[-16,1,5],consistent:[-20,-5,5]})){
  const u=copy(t),r=fix(u,...args),d=r.action==='REESTABLISH'?lastReturn(u.p):null;
  out.SE[label]={result:res(r),relation:d?.interruption?.relation??null,entry:entryOut(d),rows:weekRows(u.p,[5,6],addDays(d0,5)),sf:d?sf(u.p,d,{A,weeks:[5,6],from:addDays(d0,5)}):null};
  if(d)sfAll.push(['SE.'+label,out.SE[label].sf]);
 }
}

// ---------- S-F: the checks across every scenario above ----------
out.SF={cases:sfAll.length,withRunStepAbove:sfAll.filter(([,x])=>x&&x.runStepAbove).map(([k,x])=>[k,x.runStepAbove]),withCeilingAboveA:sfAll.filter(([,x])=>x&&x.ceilingAboveA.length).map(([k,x])=>[k,x.ceilingAboveA]),
 withRowsAboveCeiling:sfAll.filter(([,x])=>x&&x.rowsAboveCeiling.length).map(([k,x])=>[k,x.rowsAboveCeiling]),withPreBreakRows:sfAll.filter(([,x])=>x&&x.preBreakRows.length).map(([k,x])=>[k,x.preBreakRows])};
console.log(JSON.stringify(out,null,1));
