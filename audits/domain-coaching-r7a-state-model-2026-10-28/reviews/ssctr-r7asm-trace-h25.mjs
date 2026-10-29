// SSCTR R7ASM-SSCTR-r1 trace of R6-H25 (own; prints only): the goal change (hypertrophy to 10K race with strength maintenance) and what the
// bench press and lat pulldown are prescribed afterwards, on both runtimes (the byte-exact STATE-EVIDENCE-FREEZE-1 copy assembled in the OS temp
// dir and removed; the live tree), in the corpus variant and in my full-record variant (weeks before the first step executed as prescribed and
// reviewed, as in ssctr-r7asm-holdout-detail.mjs). Per step: the strength goal kind and its dose (goalDoses), the two exercises' stored start
// (stateTrace) and HistoricalState atoms at the step's week (live only), and their rows with load mode, load, ceiling and instructions for the
// weeks after the change. Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r7asm-h25-'));const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const out={probe:'R7ASM-SSCTR-r1-TRACE-H25',at:new Date().toISOString()},clone=x=>structuredClone(x);
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'])if(!manifest.files[p]&&fs.existsSync(path.join(root,p)))put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['predecessor',tmp],['stateModel',root]]){const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),A=await load(base,'CoachingCore/src/r6-adaptation.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs');
  rt[name]={resolveSession:ev.resolveSession,nativeObservation:ev.nativeObservation,gen:idx.generateProgram,evaluateProgram:idx.evaluateProgram,historicalStateOf:A.historicalStateOf??null,authority:dev.devAuthority()};}
 const item=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases.find(c=>c.caseId==='R6-H25');
 out.scenario=item.scenario;out.steps=item.steps.map(s=>({week:s.review.weekIndex,kind:s.review.event.kind,asOf:s.review.asOf,changes:s.review.changes??null,adopt:s.adoptProposal}));
 const live=s=>s&&s.prescription&&s.status!=='SKIPPED',addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
 const offset=m=>{const s=m<0?'-':'+',a=Math.abs(m);return s+String(Math.floor(a/60)).padStart(2,'0')+':'+String(a%60).padStart(2,'0');};
 const IDS=['bench-press','lat-pulldown'],ST=x=>x?Object.fromEntries(['mode','load','reps','sets','loadTick','pendingLoad','ceiling','unlogged','source','lastPerformed'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])):null;
 for(const [name,r] of Object.entries(rt))for(const record of [false,true]){
  const o=out[name+(record?'.fullRecord':'.holdout')]=[];
  const g=r.gen(clone(item.intake),{authority:r.authority});let program=g.program,model=null,ledger=[],ref=null;
  const known=Object.fromEntries((item.intake.athlete.knownExercises??[]).map(k=>[k.id,k.load?.value]));
  const prep=rv=>{if(model)rv.athleteModel=model;if(ledger.length)rv.actualLedger=ledger;if(ref)rv.referenceState=ref;return rv;},carry=res=>{model=res.updatedModel??model;ledger=res.actualLedger??ledger;ref=res.referenceState??ref;};
  const firstWeek=Math.min(...item.steps.map(s=>s.review.weekIndex)),elig=item.steps[0].review.eligibility;
  if(record)for(let w=0;w<firstWeek;w++){const week=program.weeks[w],last=addDays(week.startDate,6);
   const obs=week.sessions.filter(live).map(s=>r.nativeObservation(program,s,{completed:true,actualStimulus:'AS_PRESCRIBED',response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},loadsByExercise:s.prescription.modality==='STRENGTH'?Object.fromEntries(s.prescription.exercises.filter(e=>e.load.mode!=='KNOWN'&&e.load.mode!=='BODYWEIGHT').map(e=>[e.id,e.load.ceiling?.value??known[e.id]??20])):undefined},'R6-H25-rec'));
   const res=r.evaluateProgram(program,prep({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${last}T20:00:00${offset(program.timezoneOffsetMinutes??0)}`,weekIndex:w,event:{id:'R6-H25-rec-'+w,kind:'WEEKLY_REVIEW'},eligibility:{...clone(elig),assessedAt:last},observations:obs}),{authority:r.authority});carry(res);if(res.proposal)program=res.proposal;}
  for(const step of item.steps){
   const review=clone(step.review),obs=[...(review.observations??[])];
   for(const f of step.observationFacts??[]){const {session}=r.resolveSession(program,f,'fact');obs.push(r.nativeObservation(program,session,f,item.caseId));}
   if(step.targetRef){const {session}=r.resolveSession(program,step.targetRef,'Target');review.targetSessionId=session.id;}
   review.observations=obs;prep(review);const res=r.evaluateProgram(program,review,{authority:r.authority});carry(res);
   const P=res.proposal??program,w=review.weekIndex,hs=r.historicalStateOf?r.historicalStateOf(program,{asOf:review.asOf,actualLedger:ledger},{authority:r.authority}):null;
   o.push({week:w,kind:review.event.kind,result:`${res.status}/${res.action}`,goal:P.goal?.strength?.kind??null,goalDose:r.authority.policy.operational.strength.goalDoses[P.goal?.strength?.kind]??null,
    storedStartThisWeek:Object.fromEntries(IDS.map(id=>[id,ST(program.stateTrace[w]?.strength?.exercises?.[id])])),
    historyAtStep:hs?Object.fromEntries(IDS.map(id=>[id,hs.strength.exercises[id]??null])):'not exported',
    rows:P.weeks.slice(w,Math.min(P.weeks.length,w+4)).flatMap(wk=>wk.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`w${wk.index} ${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''} | ${(e.instructions??[]).slice(0,2).join(' / ')}`)))});
   if(res.proposal&&step.adoptProposal===true)program=res.proposal;
  }
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify(out,null,1));
