// QE engineering check R7-D Phase 3 (independent judge): finer attribution of the candidate-vs-R7C-FREEZE-4 differences. The author's
// differential calls a differing case "explained" when the case has any trigger; a case whose intake lists MACHINES has the F03 trigger
// whatever differs. Here each differing step is broken down: run doses, machine strength rows, non-machine strength rows, status/validity,
// gates, load questions, record. A difference outside what the case's corrections can touch is reported.
//   node qe-differential-attribution.mjs --f4 <R7C-FREEZE-4 root> --candidate <candidate root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../../../..');
const {loadRuntime,runCase}=await import(new URL('file:///'+path.join(AUD,'harness/lib/client.mjs').replace(/\\/g,'/')).href);
const F4=await loadRuntime(path.join(path.resolve(arg('--f4')),'CoachingCore')),C=await loadRuntime(path.join(path.resolve(arg('--candidate')),'CoachingCore'));
const corpora=[['DIAGNOSTIC','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['DEV2','harness/validation/DEV_CASES_R7D_2.json']];
const J=JSON.stringify;
const live=s=>s.prescription&&s.status!=='SKIPPED';
const machineIds=new Set(['leg-press','seated-calf-raise-machine','leg-curl-machine','leg-extension-machine','hip-abduction-machine','machine-chest-press','cable-triceps-pushdown','seated-cable-row','lat-pulldown','cable-face-pull']);
function planParts(p,from){
 const out={run:[],machine:[],otherStrength:[]};if(!p)return out;
 for(const w of p.weeks)for(const s of w.sessions.filter(x=>live(x)&&x.date>=from)){
  if(s.sport==='RUN')out.run.push(s.id+':'+J(s.prescription));
  else for(const e of s.prescription.exercises??[])(machineIds.has(e.id)||e.load?.convention==='MACHINE_STACK'?out.machine:out.otherStrength).push(s.id+':'+e.id+':'+J({sets:e.sets,reps:e.reps,rir:e.rir,load:e.load}));
 }
 return out;
}
function stepDiff(a,b){
 const kinds=[];
 const ra=a.result,rb=b.result;
 if(ra.status!==rb.status||ra.action!==rb.action)kinds.push('STATUS/ACTION');
 if(ra.planValidity?.status!==rb.planValidity?.status)kinds.push('VALIDITY');
 if(J(ra.question??null)!==J(rb.question??null))kinds.push('QUESTION');
 const ga=ra.gates??{},gb=rb.gates??{},gk=[...new Set([...Object.keys(ga),...Object.keys(gb)])].filter(k=>ga[k]!==gb[k]);
 if(gk.length)kinds.push('GATES['+gk.map(k=>(machineIds.has(k)?'M:':'')+k).join(',')+']');
 const lq=x=>(x.loadQuestions??[]).map(q=>q.exerciseId+':'+q.reason).sort();
 if(J(lq(ra))!==J(lq(rb)))kinds.push('LOADQ['+[...new Set([...lq(ra),...lq(rb)].filter(x=>!lq(ra).includes(x)||!lq(rb).includes(x)))].join(',')+']');
 const ids=x=>(x.actualLedger??[]).map(o=>o.eventId).sort();
 if(J(ids(ra))!==J(ids(rb)))kinds.push('RECORD_ROWS');
 const pa=planParts(a.planAfter,a.asOfLocal),pb=planParts(b.planAfter,b.asOfLocal);
 for(const k of ['run','machine','otherStrength'])if(J(pa[k])!==J(pb[k]))kinds.push('PLAN_'+k.toUpperCase());
 return kinds;
}
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  const a=runCase(F4,kase),b=runCase(C,kase);
  const g=planParts(a.generation?.program,'0000'),h=planParts(b.generation?.program,'0000'),gen=['run','machine','otherStrength'].filter(k=>J(g[k])!==J(h[k]));
  const steps=[];for(let i=0;i<Math.max(a.steps.length,b.steps.length);i++){const x=a.steps[i],y=b.steps[i];if(!x||!y){steps.push({i,id:(x??y).stepId,kinds:['STEP_COUNT']});continue;}const d=stepDiff(x,y);if(d.length)steps.push({i,id:x.stepId,kind:x.kind,kinds:d});}
  if(!gen.length&&!steps.length)continue;
  const tl=kase.timeline??[],facts=tl.flatMap(s=>[...(s.observations??[]),...(s.answer?.overrides??[]),...(s.answer?.report?[s.answer.report]:[])]);
  rows.push({corpus:label,caseId:kase.caseId,generation:gen,first:steps[0]??null,steps,stepsDiffering:steps.length,
   hasMachineIntake:(kase.intake?.athlete?.knownExercises??[]).some(k=>k?.load?.convention==='MACHINE_STACK'),
   breakOutsideReturn:tl.some(s=>{const i=s.event?.interruption??s.answer?.declareBreak;return i&&typeof i==='object'&&Object.keys(i).length&&(s.event?.kind??'WEEKLY_REVIEW')!=='RETURN_AFTER_PAUSE';}),
   confounded:facts.some(f=>f?.confounded===true),
   dx01OnF4:a.steps.some(s=>(s.result.provenance?.excluded??[]).some(e=>e.reason==='REPORT_BEFORE_OBSERVATION'))});
 }
}
fs.writeFileSync(arg('--out'),J({probe:'QE-R7D-P3-DIFFERENTIAL-ATTRIBUTION-1',rows},null,1)+'\n');
for(const r of rows)console.log(r.caseId,'| gen:',r.generation.join(',')||'-','| first:',r.first?.id,J(r.first?.kinds),'| n:',r.stepsDiffering,'| machineIntake:',r.hasMachineIntake,'break:',r.breakOutsideReturn,'conf:',r.confounded,'dx01:',r.dx01OnF4);
