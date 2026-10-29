// SSCTR R7ASE-SSCTR-r1 state-evidence probe (own instrument): the sporting outputs of SE-C and SE-D (a known load lifted is the load; a projected
// dose lifted is history) on the P40 history, each unreviewed cell (U) against its reviewed control (R, the same facts, the week reviewed on
// Sunday), through a SHORT (2-day) and a MODERATE (14-day) return, with the dose of the first row after the return and the O/J follow-up checks.
// Also the P40 cell itself (SE-B). Read-only runtime use, synthetic data, DEV_TEST_ONLY authority; prints only. The runtime root is SSCTR_CC
// (default: the live CoachingCore tree, STATE-EVIDENCE-FREEZE-1); with SSCTR_CC set to the byte-exact R7A-BOUNDARY-FINAL-FREEZE copy it prints
// the same scenarios on the freeze I accepted. Scaffolding re-typed from CoachingCore/test/r7ase-state-evidence.test.mjs (the author's
// fixtures); the cells, checks and recorded outputs are mine. Usage: node ssctr-r7ase-probe.mjs > out.json
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
const out={probe:'R7ASE-SSCTR-r1-STATE-EVIDENCE',runtime:process.env.SSCTR_CC?'SSCTR_CC (see RUNS.json)':'live tree (STATE-EVIDENCE-FREEZE-1; check the digest)'};
// The P40 history: weeks 0-1 trained and reviewed; week 2 executed but for Saturday's lift, never reviewed; so week 3 projects db-rdl 22 kg.
const base=start('ssctr-se',2);perDay(base,2,s=>!SAT(s));
const target=base.p.stateTrace[3].strength.exercises['db-rdl'],satRow=base.p.weeks[3].sessions.find(SAT).prescription.exercises.find(e=>e.id==='db-rdl');
out.setup={week3Start:pick(target),week3SaturdayRow:`${satRow.sets}x${satRow.reps}@${satRow.rir} ${satRow.load.mode} ${satRow.load.value}`,liftedBefore:lifted(base,'db-rdl')};
const T=target.load,R0=satRow.reps;
// Week 3 variants of the Saturday db-rdl row (every other row executed as prescribed).
const variants={
 P40_missed:{keep:s=>!SAT(s),o:{}},
 lighter21:{keep:()=>true,o:s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?T-1:e.load.mode==='KNOWN'?e.load.value:20}:{}},
 exact22:{keep:()=>true,o:{}},
 exact22RepsUnlogged:{keep:()=>true,o:s=>SAT(s)?{set:(id,{reps,...x})=>id==='db-rdl'?x:{reps,...x}}:{}},
 heavier24TargetMet:{keep:()=>true,o:s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?T+2:e.load.mode==='KNOWN'?e.load.value:20}:{}},
 heavier24TargetMissed:{keep:()=>true,o:s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?T+2:e.load.mode==='KNOWN'?e.load.value:20,set:(id,x)=>id==='db-rdl'?{...x,reps:Math.max(1,x.reps-2)}:x}:{}},
 heavier26TargetMet:{keep:()=>true,o:s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?T+4:e.load.mode==='KNOWN'?e.load.value:20}:{}},
 heavier40:{keep:()=>true,o:s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?T+18:e.load.mode==='KNOWN'?e.load.value:20}:{}}
};
out.cells={};const checks=[];
for(const [label,v] of Object.entries(variants)){
 const U=copy(base),R=copy(base);perDay(U,3,v.keep,v.o);weekly(R,3,v.keep,v.o);
 const heaviestU=Object.fromEntries(['db-rdl','db-split-squat','back-squat','db-calf-raise','db-bench-press','db-row'].map(id=>[id,Math.max(0,...lifted(U,id).map(x=>x.load))]));
 const cell={lifted:lifted(U,'db-rdl'),planningWeek4:{U:pick(U.p.stateTrace[4].strength.exercises['db-rdl']),R:pick(R.p.stateTrace[4].strength.exercises['db-rdl'])}};
 for(const [kind,o] of [['SHORT',{from:1,to:2}],['MODERATE',{from:1,to:14}]]){
  const u=copy(U),r=copy(R),bu=B(u,4,o),br=B(r,4,o),eu=bu.d?.interruption?.entry?.strength?.exercises??{},er=br.d?.interruption?.entry?.strength?.exercises??{};
  const c={U:{result:`${bu.status}/${bu.action}`,dbRdl:pick(eu['db-rdl']),valueBasis:bu.d?.interruption?.stateAt?.values?.STRENGTH?.['db-rdl']??null,firstRows:rowsOf(u.p,bu.returnDay,'db-rdl')},
   R:{result:`${br.status}/${br.action}`,dbRdl:pick(er['db-rdl']),firstRows:rowsOf(r.p,br.returnDay,'db-rdl')}};
  // U ahead of R in the entry STATE on any exercise: a heavier load, the same load with more ticks, or a larger executed count. A higher state
  // repetition target at the same load is listed separately (stateRepsAbove) with both sides' block count, since a reviewed side that added a
  // block set resets its repetition target (it is then ahead in sets, not behind in reps).
  const ahead=[],stateRepsAbove=[];for(const [id,e] of Object.entries(er)){const a=eu[id];if(!a)continue;if(a.load>e.load+1e-9)ahead.push(`${id} load ${a.load}>${e.load}`);else if(Math.abs((a.load??0)-(e.load??0))<1e-9){if((a.loadTick??0)>(e.loadTick??0))ahead.push(`${id} tick ${a.loadTick}>${e.loadTick}`);if((a.reps??0)>(e.reps??0)&&a.mode===e.mode)stateRepsAbove.push(`${id} reps U ${a.reps} (blocks ${a.blocksDone??0}) > R ${e.reps} (blocks ${e.blocksDone??0})`);}if((a.lastExecutedSets??0)>(e.lastExecutedSets??0))ahead.push(`${id} lastExecutedSets ${a.lastExecutedSets}>${e.lastExecutedSets}`);}
  // U ahead of R in the PRESCRIPTION: the rows of the two weeks after the return, matched by date and exercise: a heavier known load, or the
  // same load with more sets, or the same load and sets with more repetitions, or the same dose at a lower RIR.
  const rowMap=P=>Object.fromEntries(P.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=bu.returnDay&&s.date<addDays(bu.returnDay,14)).flatMap(s=>s.prescription.exercises.map(e=>[s.date+' '+e.id,e])));
  const mu=rowMap(u.p),mr=rowMap(r.p),rowsAhead=[];for(const [k,a] of Object.entries(mu)){const e=mr[k];if(!e)continue;const ka=a.load.mode==='KNOWN'?a.load.value:null,ke=e.load.mode==='KNOWN'?e.load.value:null;
   if(ka!==null&&ke!==null&&ka>ke+1e-9)rowsAhead.push(`${k} load ${ka}>${ke}`);else if(ka===ke||ka!==null&&ke!==null&&Math.abs(ka-ke)<1e-9){if(a.sets>e.sets)rowsAhead.push(`${k} sets ${a.sets}>${e.sets}`);else if(a.sets===e.sets&&a.reps>e.reps)rowsAhead.push(`${k} reps ${a.reps}>${e.reps}`);else if(a.sets===e.sets&&a.reps===e.reps&&a.rir<e.rir)rowsAhead.push(`${k} rir ${a.rir}<${e.rir}`);}}
  c.UrowsAheadOfR=rowsAhead;c.stateRepsAbove=stateRepsAbove;
  // Every load in U's entry is one the athlete lifted before the break or a known earlier one (never a load only the plan prescribed).
  const neverLifted=Object.entries(eu).filter(([id,e])=>Number.isFinite(e.load)&&e.mode==='KNOWN'&&!lifted(U,id).some(x=>Math.abs(x.load-e.load)<1e-9)&&!(id==='back-squat'&&e.load===80)&&!(id==='db-bench-press'&&e.load===18)).map(([id,e])=>`${id} ${e.load}`);
  c.UaheadOfR=ahead;c.UloadsNeverLifted=neverLifted;
  c.followU=follow(u,bu,heaviestU);c.followR=follow(r,br,Object.fromEntries(Object.keys(heaviestU).map(id=>[id,Math.max(0,...lifted(R,id).map(x=>x.load))])));
  cell[kind]=c;checks.push({cell:label,kind,UaheadOfR:ahead.length,UrowsAheadOfR:rowsAhead.length,stateRepsAbove:stateRepsAbove.length,UloadsNeverLifted:neverLifted.length,O:c.followU.O.length+c.followR.O.length,J:c.followU.J.length+c.followR.J.length,L:c.followU.L.length+c.followR.L.length});
 }
 out.cells[label]=cell;
}
out.checks=checks;out.totals={UaheadOfR:checks.reduce((s,c)=>s+c.UaheadOfR,0),UrowsAheadOfR:checks.reduce((s,c)=>s+c.UrowsAheadOfR,0),stateRepsAbove:checks.reduce((s,c)=>s+c.stateRepsAbove,0),UloadsNeverLifted:checks.reduce((s,c)=>s+c.UloadsNeverLifted,0),O:checks.reduce((s,c)=>s+c.O,0),J:checks.reduce((s,c)=>s+c.J,0),L:checks.reduce((s,c)=>s+c.L,0)};
console.log(JSON.stringify(out,null,1));
