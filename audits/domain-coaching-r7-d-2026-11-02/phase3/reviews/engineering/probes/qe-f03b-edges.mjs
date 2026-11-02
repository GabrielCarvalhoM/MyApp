// QE engineering check R7-D Phase 3 (independent judge): F03-B paths the directed tests leave unpinned (mutants QM10, QM16, QM21, QM23/24
// survive the directed file): the ceiling cap of a confirmed heavier machine value, the fallback dose of a step logged at R with the step's
// repetitions (P4), and I-1's equal-only agreement for duplicates and establishment. Read-only on the runtime it is given.
//   node qe-f03b-edges.mjs <root holding CoachingCore>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]);
const H=await import(pathToFileURL(path.join(root,'CoachingCore','r7/b/fixtures/helpers.mjs')).href);
const {opts,K,program,review,live,evaluateProgram}=H;
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const MK=[K('leg-press',3,10,140,'MACHINE_STACK'),K('machine-chest-press',3,10,50,'MACHINE_STACK'),K('lat-pulldown',3,10,55,'MACHINE_STACK'),K('seated-cable-row',3,12,50,'MACHINE_STACK')];
const M={id:'qe-edges',weeks:12,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS','BENCH'],recent:{strengthDaysPerWeek:3},knownExercises:MK,schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}};
const log=(p,s,f=()=>null,id='e')=>({eventId:`${id}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,response:OK,actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.filter(e=>f(e)!=='SKIP').map(e=>{
 if(e.load.mode==='BODYWEIGHT')return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir}))};
 const x=f(e)??{value:e.load.mode==='KNOWN'?e.load.value:e.load.nextSetting?e.load.nextSetting.aboveKg:30,reps:e.load.nextSetting?e.load.nextSetting.fallbackReps:e.reps};
 return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:x.reps??e.reps,rir:e.rir,load:{value:x.value,unit:'KG',convention:e.load.convention}}))};})}});
const step=(t,w,o={})=>{const r=evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>log(t.p,s,o.f,'w'+w)),...(o.extra??{})}),...(t.ledger.length?{actualLedger:t.ledger}:{})},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const rowsOf=(p,w,id)=>p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===id).map(e=>({mode:e.load.mode,value:e.load.value??null,next:e.load.nextSetting??null,reps:e.reps})));
const out={};
// 1. QM10: a heavier machine value above a re-establishment ceiling, confirmed by the athlete: capped at the ceiling, never 170.
{
 const t={p:program(M),ledger:[]};step(t,0);
 for(const w of [1,2,3,4,5])step(t,w,{f:e=>e.id==='leg-press'?'SKIP':null});
 const re=rowsOf(t.p,6,'leg-press');
 const r=step(t,6,{f:e=>e.id==='leg-press'?{value:170,reps:e.reps}:null,extra:{loadConfirmations:[{exerciseId:'leg-press',value:170,unit:'KG',convention:'MACHINE_STACK'}]}});
 out.capConfirmedAboveCeiling={reEstablishRows:re,questions:(r.loadQuestions??[]).filter(q=>q.exerciseId==='leg-press').map(q=>q.reason),later:[7,8].flatMap(w=>rowsOf(t.p,w,'leg-press'))};
}
// 2. QM16/23/24: the cable-row step (8 reps, fallback 12) logged at R = 50 kg but with the step's 8 repetitions: P4 holds 12, never restarts.
{
 const t={p:program(M),ledger:[]};step(t,0);
 const stepRows=rowsOf(t.p,1,'seated-cable-row');
 step(t,1,{f:e=>e.id==='seated-cable-row'?{value:50,reps:8}:null});
 out.stepLoggedAtRWithStepReps={stepRows,next:rowsOf(t.p,2,'seated-cable-row'),week3:rowsOf(t.p,3,'seated-cable-row')};
}
// 3. QM21: I-1 equal-only agreement. (a) Two reports of one strength session, 140 vs 141 kg on the leg press (phone and watch): agree or conflict?
{
 const t={p:program(M),ledger:[]};const s=t.p.weeks[0].sessions.find(x=>live(x)&&x.sport==='STRENGTH'&&x.prescription.exercises.some(e=>e.id==='leg-press'));
 const a=log(t.p,s,undefined,'phone'),b={...log(t.p,s,e=>e.id==='leg-press'?{value:141,reps:e.reps}:null,'watch'),source:{provider:'WATCH',activityId:'w-1'}};
 const others=t.p.weeks[0].sessions.filter(x=>live(x)&&x.sport==='STRENGTH'&&x!==s).map(x=>log(t.p,x,undefined,'o'));
 const r=evaluateProgram(t.p,{...review(t.p,0,{observations:[...others,a,b]})},opts);
 const c=evaluateProgram(t.p,{...review(t.p,0,{observations:[...others,a,{...log(t.p,s,undefined,'watch2'),source:{provider:'WATCH',activityId:'w-2'}}]})},opts);
 out.duplicateTolerance={kg140vs141:{duplicates:(r.provenance?.duplicates??[]).map(d=>d.reason),conflicts:(r.provenance?.conflicts??[]).map(d=>d.reason)},kg140vs140:{duplicates:(c.provenance?.duplicates??[]).map(d=>d.reason),conflicts:(c.provenance?.conflicts??[]).map(d=>d.reason)}};
}
// 3b. Establishment agreement on a machine with no known load: logs 30 then 31 at two exposures of one week, and 30 then 30.
{
 const N={...M,id:'qe-edges-est',knownExercises:[]};
 for(const [label,vals] of [['30then31',[30,31]],['30then30',[30,30]]]){
  const t={p:program(N),ledger:[]};let k=0;
  // The machine exercise this program establishes at two exposures of week 0 (whichever the planner chose).
  const count=new Map();for(const s of t.p.weeks[0].sessions.filter(live))for(const e of s.prescription.exercises??[])if(e.load?.convention==='MACHINE_STACK'&&e.load.mode==='ESTABLISH')count.set(e.id,(count.get(e.id)??0)+1);
  const id=[...count].find(([,n])=>n>=2)?.[0]??[...count.keys()][0];out.establishExercise=id??null;
  const r=step(t,0,{f:e=>e.id===id?{value:vals[Math.min(k++,1)],reps:e.reps}:null});
  out['establish_'+label]={rowsW0:rowsOf(program(N),0,id).length,questions:(r.loadQuestions??[]).filter(q=>q.exerciseId===id).map(q=>q.reason),next:rowsOf(t.p,1,id)};
 }
}
// 4. QM10/QM19: a verified step (50 → 55, previous 50), a 14-day nonclinical return, a heavier confirmed value during the re-entry (capped at
// the return's reference), then two adverse weeks after the return: REGRESS lowers repetitions (no previous setting survives a return).
{
 const t={p:program(M),ledger:[]},id='seated-cable-row';step(t,0);
 step(t,1,{f:e=>e.id===id&&e.load.nextSetting?{value:55,reps:e.reps}:null,extra:{loadConfirmations:[{exerciseId:id,value:55,unit:'KG',convention:'MACHINE_STACK'}]}});
 const before=rowsOf(t.p,2,id);
 const H2=await import(pathToFileURL(path.join(root,'CoachingCore','r7/b/fixtures/helpers.mjs')).href),{addDays}=H2;
 const brk={startDate:t.p.weeks[2].startDate,endDate:addDays(t.p.weeks[3].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
 const rr=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:brk}),actualLedger:t.ledger},opts);t.ledger=rr.actualLedger??t.ledger;if(rr.proposal)t.p=rr.proposal;
 const entry=rowsOf(t.p,4,id);
 const r4=step(t,4,{f:e=>e.id===id?{value:60,reps:e.reps}:null,extra:{loadConfirmations:[{exerciseId:id,value:60,unit:'KG',convention:'MACHINE_STACK'}]}});
 const afterEntry=[5,6].flatMap(w=>rowsOf(t.p,w,id));
 for(const w of [5,6])step(t,w);
 const bad={...OK,recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
 for(const w of [7,8]){const r=evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>({...log(t.p,s,undefined,'bad'+w),response:bad}))}),actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
 out.returnThenRegress={return:rr.action,beforeReturn:before,entry,entryQuestions:(r4.loadQuestions??[]).filter(q=>q.exerciseId===id).map(q=>q.reason),afterEntry,afterRegress:[9,10].flatMap(w=>rowsOf(t.p,w,id))};
}
console.log(JSON.stringify(out,null,1));
