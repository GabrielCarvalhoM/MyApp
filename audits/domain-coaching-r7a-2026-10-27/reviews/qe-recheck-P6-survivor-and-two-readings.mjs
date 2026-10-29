// QE re-check probe P6 (R7A-QE-r2, FREEZE-2).
// 6a (the author's documented mutation survivor, "Counts from the first executed exposure": uc=done.at(-1) -> uc=done[0]): reach it.
//    An exercise prescribed in two sessions of a week (db-row, db-bench-press in FULL_A and FULL_B) while a return step or a set/regain
//    cap is active; the day-0 session is executed, then SYSTEMIC_FATIGUE (day 1, 05:00) reduces the later session; the weekly review sees
//    both executed as prescribed. The next-week state is compared between FREEZE-2 and the mutant, for every week of a return timeline.
// 6b (QE-R7A-14 "projection and review read one count"): with a 30-minute budget (time fit) and a return, for every week the projected
//    next-week state (before the review) is compared with the reviewed next-week state for an as-prescribed execution, on the count fields.
// Synthetic data, DEV_TEST_ONLY authority; the mutant lives in the OS temp directory (qe-recheck-lib.mjs).
import {cur,opts,intake,review,obs,addDays,out} from './qe-lib.mjs';
import {mutant} from './qe-recheck-lib.mjs';
const M=await mutant('src/r6-program.mjs','uc=done.at(-1)??list.at(-1)','uc=done[0]??list.at(-1)');
const CAPS=['returnStep','setCap','regainCap','setCeiling','lastExecutedSets','sets','priorSets','blocksDone'];
const caps=e=>e?Object.fromEntries(CAPS.map(k=>[k,e[k]??null])):null;
const res={};
// ---------- 6a ----------
{
 const timelines={};
 for(const [name,ia] of Object.entries({default50:{},budget40:{schedule:{strengthMinutes:40}},hypertrophy:{athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}}}})){
  let p=cur.generateProgram(intake({id:'qe-rc-P6a-'+name,weeks:16,...ia,athlete:{exerciseRotationPreference:'FIXED',...(ia.athlete??{})}}),opts).program,ledger=[];
  const step=(R,P,w,extra={},list=null)=>R.evaluateProgram(P,review(P,w,{observations:list??P.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(P,s)),actualLedger:ledger,...extra}),opts);
  const adv=r=>{ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;};
  for(let w=0;w<4;w++)adv(step(cur,p,w));adv(step(cur,p,4,{},[]));adv(step(cur,p,5,{},[]));
  adv(step(cur,p,6,{day:0,hour:'06',kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[6].startDate,-16),endDate:addDays(p.weeks[6].startDate,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},[]));
  const found=[];
  for(let w=6;w<14;w++){
   // Branch: day-0 executed, fatigue on day 1, weekly review with everything executed as then prescribed; on both runtimes.
   const twice=[...new Set(p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>e.id)))].filter(id=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===id)).length>1);
   const active=twice.filter(id=>{const e=p.stateTrace[w].strength.exercises[id];return e&&(Number.isInteger(e.returnStep)||Number.isInteger(e.setCap)||Number.isInteger(e.regainCap));});
   const branch=R=>{const d0=p.weeks[w].sessions.filter(s=>s.prescription&&s.day===0).map(s=>obs(p,s));
    const f=R.evaluateProgram(p,{...review(p,w,{day:1,kind:'SYSTEMIC_FATIGUE',observations:d0,actualLedger:ledger}),asOf:addDays(p.weeks[w].startDate,1)+'T05:00:00Z'},opts),P=f.proposal??p;
    const rest=P.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.day>0).map(s=>obs(P,s));
    const r=R.evaluateProgram(P,review(P,w,{observations:rest,actualLedger:f.actualLedger??ledger}),opts),Q=r.proposal??P;
    return {fatigue:`${f.status}/${f.action}`,weekly:`${r.status}/${r.action}`,next:Object.fromEntries(twice.map(id=>[id,caps(Q.stateTrace[w+1].strength.exercises[id])])),rows:Object.fromEntries(twice.map(id=>[id,P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>`d${s.day} ${e.sets}x phased=${e.exposure?.phasedSets} base=${e.exposure?.baseSets} kind=${e.exposure?.kind}`))]))};};
   const a=branch(cur),b=branch(M);
   const diff=twice.filter(id=>JSON.stringify(a.next[id])!==JSON.stringify(b.next[id]));
   if(diff.length)found.push({week:w,activeCapAtStart:Object.fromEntries(active.map(id=>[id,caps(p.stateTrace[w].strength.exercises[id])])),rows:Object.fromEntries(diff.map(id=>[id,a.rows[id]])),freeze2:Object.fromEntries(diff.map(id=>[id,a.next[id]])),mutant:Object.fromEntries(diff.map(id=>[id,b.next[id]])),decisions:{freeze2:[a.fatigue,a.weekly],mutant:[b.fatigue,b.weekly]}});
   adv(step(cur,p,w));
  }
  timelines[name]={weeksWhereMutantDiffers:found.length,found:found.slice(0,3)};
 }
 res['6a_survivorReach']={mutation:'src/r6-program.mjs: uc=done.at(-1)??list.at(-1) -> uc=done[0]??list.at(-1)',mutantDir:M.tmp,timelines,reached:Object.values(timelines).some(t=>t.weeksWhereMutantDiffers>0)};
}
// ---------- 6b ----------
{
 const out6b={};
 for(const [name,ia] of Object.entries({budget30:{schedule:{strengthMinutes:30}},budget40:{schedule:{strengthMinutes:40}},budget30_hyp:{schedule:{strengthMinutes:30},athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}}}})){
  let p=cur.generateProgram(intake({id:'qe-rc-P6b-'+name,weeks:16,...ia,athlete:{exerciseRotationPreference:'FIXED',...(ia.athlete??{})}}),opts).program,ledger=[];
  const step=(w,extra={},list=null)=>{const r=cur.evaluateProgram(p,review(p,w,{observations:list??p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(p,s)),actualLedger:ledger,...extra}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;return r;};
  const diffs=[];let compared=0;
  const cmp=(w,r,before)=>{const after=p.stateTrace[w+1].strength.exercises;for(const [id,e] of Object.entries(after)){const b=before[id];if(!b)continue;compared++;const x=caps(b),y=caps(e);if(JSON.stringify(x)!==JSON.stringify(y))diffs.push({week:w,id,decision:`${r.status}/${r.action}`,projected:x,reviewed:y});}};
  for(let w=0;w<4;w++){const before=structuredClone(p.stateTrace[w+1].strength.exercises);const r=step(w);cmp(w,r,before);}
  step(4,{},[]);step(5,{},[]);
  step(6,{day:0,hour:'06',kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(p.weeks[6].startDate,-16),endDate:addDays(p.weeks[6].startDate,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},[]);
  for(let w=6;w<14;w++){const before=structuredClone(p.stateTrace[w+1].strength.exercises);const r=step(w);cmp(w,r,before);}
  out6b[name]={stateEntriesCompared:compared,differences:diffs.length,examples:diffs.slice(0,4)};
 }
 res['6b_projectionVsReview']=out6b;
}
out('P6',res);
