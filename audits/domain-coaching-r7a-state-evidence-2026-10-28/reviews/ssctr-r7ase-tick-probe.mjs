// SSCTR R7ASE-SSCTR-r1 projected-tick probe (own; prints only). SE-D: when the athlete lifts exactly a projected load whose stored start already
// counts a load tick the projection assumed, does history take that tick, and does the load then step sooner than the progression rule after a
// return? Each unreviewed cell (U: weeks 2-4 unreviewed) against the control with the same facts and only week 4 reviewed on Sunday (R), through
// a SHORT and a MODERATE return, with the db-rdl rows of the three weeks after it (executed and reviewed). Harness: lines 8-51 of
// ssctr-r7ase-probe.mjs (byte copy). SSCTR_CC selects the runtime. Read-only use; synthetic data; DEV_TEST_ONLY authority.
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
const intake=({id})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ssctr-se-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{kg=null,set=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x,e):x;})}));
 return {eventId:`ssctr-se-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:a,response:{...OK}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5;
const weekly=(t,w,keep=()=>true,o={})=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))step(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 step(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const start=(id,weeks)=>{const g=generateProgram(intake({id}),opts);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel'}});
const B=(t,k,{from=1,to=2}={})=>{const d=t.p.weeks[k].startDate,w=Math.floor((Date.parse(addDays(d,to+1))-Date.parse(t.p.startDate))/(7*864e5));const r=step(t,at(t.p,w,(to+1)%7,'06:00:00',brk(addDays(d,from),addDays(d,to))));
 return {status:r.status,action:r.action??null,missingInputs:r.missingInputs??[],d:r.action==='REESTABLISH'?t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1):null,returnDay:addDays(d,to+1),w};};
const pick=(e,keys=['mode','load','reps','loadTick','returnStep','setCeiling','lastExecutedSets','ceiling','lastPerformed'])=>e?Object.fromEntries(keys.filter(k=>e[k]!==undefined).map(k=>[k,e[k]])):null;
const rowsOf=(P,from,id,n=2)=>P.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>`${s.date} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`)).slice(0,n);
const lifted=(t,id)=>t.ledger.filter(o=>o.logs?.[id]&&Number.isFinite(o.logs[id].load)).map(o=>({load:o.logs[id].load,reps:o.logs[id].reps??null}));
// Follow-up after a return: every prescribed session from the return day executed and reviewed for n weeks; O = rows above the entry's set
// ceiling while in return steps, J = a count more than one set above the largest earlier one, L = a known load above the heaviest load lifted
// before the break plus one increment (2 kg) while in return steps.
function follow(t,b,heaviest,n=3){const ceil=Object.fromEntries(Object.entries(b.d?.interruption?.entry?.strength?.exercises??{}).map(([id,x])=>[id,x.setCeiling??null]));const O=[],J=[],L=[],largest={};
 for(let w=b.w;w<Math.min(b.w+n,15);w++){const st=t.p.stateTrace[w]?.strength?.exercises??{};
  for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=b.returnDay))for(const e of s.prescription.exercises){
   if(Number.isInteger(st[e.id]?.returnStep)&&Number.isInteger(ceil[e.id])&&e.sets>ceil[e.id])O.push(`${s.date} ${e.id} ${e.sets}>${ceil[e.id]}`);
   if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1)J.push(`${s.date} ${e.id} ${e.sets}`);
   if(Number.isInteger(st[e.id]?.returnStep)&&e.load.mode==='KNOWN'&&Number.isFinite(heaviest[e.id])&&e.load.value>heaviest[e.id]+2+1e-9)L.push(`${s.date} ${e.id} ${e.load.value}>${heaviest[e.id]}`);}
  weekly(t,w,s=>s.date>=b.returnDay);
  for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=b.returnDay))for(const e of s.prescription.exercises)largest[e.id]=Math.max(largest[e.id]??0,e.sets);}
 return {O,J,L};}
const out={probe:'R7ASE-SSCTR-r1-PROJECTED-TICK',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (STATE-EVIDENCE-FREEZE-1; check the digest)'};
const st=(t,k)=>pick(t.p.stateTrace[k].strength.exercises['db-rdl']);
const rowText=(s,e)=>`${s.date} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`;
const rowsAfter=(t,from,n=6)=>t.p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='db-rdl').map(e=>rowText(s,e))).slice(0,n);
const satRow=(t,w)=>{const s=t.p.weeks[w].sessions.find(SAT),e=s?.prescription?.exercises?.find(e=>e.id==='db-rdl');return e?rowText(s,e):null;};
// Week 3's Saturday db-rdl: missed, lighter by 1 kg, at the row's load with repetitions unlogged, or exactly as prescribed; every other row as prescribed.
const W3={missed:{keep:s=>!SAT(s),o:{}},lighter:{keep:()=>true,o:s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?e.load.value-1:e.load.mode==='KNOWN'?e.load.value:20}:{}},repsUnlogged:{keep:()=>true,o:s=>SAT(s)?{set:(id,{reps,...x})=>id==='db-rdl'?x:{reps,...x}}:{}},exact:{keep:()=>true,o:{}}};
// Week 4's Saturday db-rdl at the row's load, target met or missed by two repetitions.
const W4={met:()=>({}),missed:s=>SAT(s)?{set:(id,x)=>id==='db-rdl'?{...x,reps:Math.max(1,x.reps-2)}:x}:{}};
out.cells={};const ahead=[];
for(const [l3,v3] of Object.entries(W3))for(const [l4,o4] of Object.entries(W4)){
 const lbl=l3+'/'+l4,base=start('ssctr-se-tick-'+l3+'-'+l4,2);perDay(base,2,s=>!SAT(s));perDay(base,3,v3.keep,v3.o);
 const U=copy(base),Rv=copy(base);perDay(U,4,()=>true,o4);weekly(Rv,4,()=>true,o4);
 const cell={week3SaturdayRow:satRow(base,3),week4SaturdayRow:satRow(base,4),planningWeek4:st(base,4),lifted:lifted(U,'db-rdl'),liftedR:lifted(Rv,'db-rdl')};
 for(const [kind,o] of [['SHORT',{from:1,to:2}],['MODERATE',{from:1,to:14}]]){
  const u=copy(U),r=copy(Rv),bu=B(u,5,o),br=B(r,5,o);
  const fu=(t0,b)=>{const t=copy(t0);for(let w=b.w;w<Math.min(b.w+3,15);w++)weekly(t,w,s=>s.date>=b.returnDay);return rowsAfter(t,b.returnDay);};
  const a=pick(bu.d?.interruption?.entry?.strength?.exercises?.['db-rdl']),e=pick(br.d?.interruption?.entry?.strength?.exercises?.['db-rdl']);
  const isAhead=!!a&&!!e&&(a.load>e.load+1e-9||Math.abs(a.load-e.load)<1e-9&&(a.loadTick??0)>(e.loadTick??0));if(isAhead)ahead.push(lbl+' '+kind);
  cell[kind]={U:{dbRdl:a,basis:bu.d?.interruption?.stateAt?.values?.STRENGTH?.['db-rdl']??null,rowsAfterReviewed:fu(u,bu)},R:{dbRdl:e,basis:br.d?.interruption?.stateAt?.values?.STRENGTH?.['db-rdl']??null,rowsAfterReviewed:fu(r,br)},UaheadOfR:isAhead};
 }
 out.cells[lbl]=cell;
}
out.UaheadOfR=ahead;
// Back squat (Wednesday): week 2's row lifted lighter (the intake's 80 kg instead of the row's load) and never reviewed, so week 3's stored start
// may count a tick at the row's load that only the projection assumed; week 3's row lifted exactly at its load, target met or missed by two
// repetitions; U leaves week 3 unreviewed, R reviews it on Sunday with the same facts; a SHORT and a MODERATE break in week 4.
const WED=s=>s.sport==='STRENGTH'&&s.day===2;
const sq=(t,k)=>pick(t.p.stateTrace[k].strength.exercises['back-squat']);
const sqRows=(t,from,n=6)=>t.p.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>rowText(s,e))).slice(0,n);
const wedRow=(t,w)=>{const s=t.p.weeks[w].sessions.find(WED),e=s?.prescription?.exercises?.find(e=>e.id==='back-squat');return e?rowText(s,e):null;};
out.squat={};const aheadSq=[];
for(const [l3,o3] of Object.entries({met:()=>({}),missed:s=>WED(s)?{set:(id,x)=>id==='back-squat'?{...x,reps:Math.max(1,x.reps-2)}:x}:{}})){
 const base=start('ssctr-se-tick-sq-'+l3,2);perDay(base,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?80:e.load.mode==='KNOWN'?e.load.value:20}:{});
 const U=copy(base),Rv=copy(base);perDay(U,3,()=>true,o3);weekly(Rv,3,()=>true,o3);
 const cell={week2WednesdayRow:wedRow(base,2),week3WednesdayRow:wedRow(base,3),planning:{week2:sq(base,2),week3:sq(base,3)},lifted:lifted(U,'back-squat')};
 for(const [kind,o] of [['SHORT',{from:1,to:2}],['MODERATE',{from:1,to:14}]]){
  const u=copy(U),r=copy(Rv),bu=B(u,4,o),br=B(r,4,o);
  const fu=(t0,b)=>{const t=copy(t0);for(let w=b.w;w<Math.min(b.w+3,15);w++)weekly(t,w,s=>s.date>=b.returnDay);return sqRows(t,b.returnDay);};
  const a=pick(bu.d?.interruption?.entry?.strength?.exercises?.['back-squat']),e=pick(br.d?.interruption?.entry?.strength?.exercises?.['back-squat']);
  const isAhead=!!a&&!!e&&(a.load>e.load+1e-9||Math.abs(a.load-e.load)<1e-9&&(a.loadTick??0)>(e.loadTick??0));if(isAhead)aheadSq.push(l3+' '+kind);
  cell[kind]={U:{squat:a,basis:bu.d?.interruption?.stateAt?.values?.STRENGTH?.['back-squat']??null,rowsAfterReviewed:fu(u,bu)},R:{squat:e,basis:br.d?.interruption?.stateAt?.values?.STRENGTH?.['back-squat']??null,rowsAfterReviewed:fu(r,br)},UaheadOfR:isAhead};
 }
 out.squat[l3]=cell;
}
out.squatUaheadOfR=aheadSq;
// The fully reviewed reference (F): weeks 2 and 3 both reviewed on Sunday with the same athlete behaviour (week 2's Wednesday back squat lifted
// at 80 kg; week 3's Wednesday back squat lifted at whatever load its row then prescribes, target met or missed). Its prescriptions may differ
// from U's (a review adopts the lighter load), so it is a reference for the progression rule, not a same-facts control.
out.squatFullyReviewed={};
for(const [l3,o3] of Object.entries({met:()=>({}),missed:s=>WED(s)?{set:(id,x)=>id==='back-squat'?{...x,reps:Math.max(1,x.reps-2)}:x}:{}})){
 const t=start('ssctr-se-tick-sqF-'+l3,2);weekly(t,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?80:e.load.mode==='KNOWN'?e.load.value:20}:{});
 const row3=wedRow(t,3);weekly(t,3,()=>true,o3);
 const c={week3WednesdayRow:row3,lifted:lifted(t,'back-squat'),stateWeek4:sq(t,4)};
 for(const [kind,o] of [['SHORT',{from:1,to:2}],['MODERATE',{from:1,to:14}]]){const f=copy(t),bf=B(f,4,o);const fu=(t0,b)=>{const x=copy(t0);for(let w=b.w;w<Math.min(b.w+3,15);w++)weekly(x,w,s=>s.date>=b.returnDay);return sqRows(x,b.returnDay);};
  c[kind]={squat:pick(bf.d?.interruption?.entry?.strength?.exercises?.['back-squat']),rowsAfterReviewed:fu(f,bf)};}
 out.squatFullyReviewed[l3]=c;
}
// The no-break planner path for the same squat history (weeks 4-6 executed as prescribed, unreviewed or reviewed), for comparison: the planner and
// the weekly review read the planning view (E1), unchanged by this mission.
out.squatNoBreak={};
for(const [l3,o3] of Object.entries({met:()=>({}),missed:s=>WED(s)?{set:(id,x)=>id==='back-squat'?{...x,reps:Math.max(1,x.reps-2)}:x}:{}})){
 const t=start('ssctr-se-tick-sqN-'+l3,2);perDay(t,2,()=>true,s=>WED(s)?{kg:(id,e)=>id==='back-squat'?80:e.load.mode==='KNOWN'?e.load.value:20}:{});perDay(t,3,()=>true,o3);
 const u=copy(t),r=copy(t);for(let w=4;w<7;w++){perDay(u,w,()=>true);weekly(r,w);}
 const rowsW=(x,w)=>x.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>rowText(s,e)));
 out.squatNoBreak[l3]={planningWeeks2to4:[2,3,4].map(k=>sq(t,k)),unreviewedRowsWeeks4to6:[4,5,6].flatMap(w=>rowsW(u,w)),reviewedRowsWeeks4to6:[4,5,6].flatMap(w=>rowsW(r,w))};
}
console.log(JSON.stringify(out,null,1));
