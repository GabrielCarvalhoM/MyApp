// SSCTR R7ASM-SSCTR-r1 holdout detail and full-record control probe (own; prints only). For the R6 holdout cases whose outputs changed, on both
// runtimes (the byte-exact STATE-EVIDENCE-FREEZE-1 copy, assembled in the OS temp dir and removed; and the live tree, HISTORICAL-PROJECTION-
// FREEZE-1), in two variants:
//  - holdout: the case exactly as the corpus states it (the weeks before its first step are never reported, as in the author's regression);
//  - fullRecord: the same intake and the same steps, but every week before the case's first step is executed as prescribed and reviewed on its
//    last day (20:00 local), so history holds the build the case's narrative implies (my control for "unreported weeks are not history", E5).
//    Rows with no known load log a stated load (the row's ceiling, else the intake's known load, else 20 kg), as the corpus format allows.
// Per step: status/action/reason, counterfactual ids, the run sessions and strength rows of the weeks around the decision (from the step's week to
// two weeks after, or to the race), the race-day prescription (calibration, effort domain), the event negotiation ids, and a return's entry.
// Plus a session-level dose tally between the runtimes per variant (same matching as ssctr-r7asm-regression-probe.mjs).
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority. Usage: node ssctr-r7asm-holdout-detail.mjs > out.json   (CASES=id,id to narrow)
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r7asm-hd-'));const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const DETAIL=['R6-H17','R6-H18','R6-H24','R6-H26','R6-H29','R6-H30'];
const CASES=process.env.CASES?process.env.CASES.split(','):['R6-H17','R6-H18','R6-H19','R6-H22','R6-H23','R6-H24','R6-H25','R6-H26','R6-H29','R6-H30','R6-H31','R6-H32','R6-H33','R6-H34','R6-H35'];
const out={probe:'R7ASM-SSCTR-r1-HOLDOUT-DETAIL',at:new Date().toISOString(),cases:{}};
const clone=x=>structuredClone(x);
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'])if(!manifest.files[p]&&fs.existsSync(path.join(root,p)))put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['predecessor',tmp],['stateModel',root]]){const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),idx=await load(base,'CoachingCore/src/r6-index.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs');
  rt[name]={resolveSession:ev.resolveSession,nativeObservation:ev.nativeObservation,gen:idx.generateProgram,evaluateProgram:idx.evaluateProgram,authority:dev.devAuthority()};}
 const corpus=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases.filter(c=>CASES.includes(c.caseId));
 const live=s=>s&&s.prescription&&s.status!=='SKIPPED';
 const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
 const offset=m=>{const s=m<0?'-':'+',a=Math.abs(m);return s+String(Math.floor(a/60)).padStart(2,'0')+':'+String(a%60).padStart(2,'0');};
 const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
 function evaluate(r,item,{record}){
  const gen=r.gen(clone(item.intake),{authority:r.authority});let program=gen.program,model=null,actualLedger=[],referenceState=null;const steps=[];
  if(!program)return {generation:gen,steps};
  const known=Object.fromEntries((item.intake.athlete.knownExercises??[]).map(k=>[k.id,k.load?.value]));
  const firstWeek=Math.min(...item.steps.map(s=>s.review.weekIndex)),elig=item.steps[0].review.eligibility;
  const carry=(review,result)=>{model=result.updatedModel??model;actualLedger=result.actualLedger??actualLedger;referenceState=result.referenceState??referenceState;};
  const prep=review=>{if(model)review.athleteModel=model;if(actualLedger.length)review.actualLedger=actualLedger;if(referenceState)review.referenceState=referenceState;return review;};
  if(record)for(let w=0;w<firstWeek;w++){
   const week=program.weeks[w],last=addDays(week.startDate,6),tz=program.timezoneOffsetMinutes??0;
   const observations=week.sessions.filter(live).map(s=>r.nativeObservation(program,s,{completed:true,actualStimulus:'AS_PRESCRIBED',response:{...OK},loadsByExercise:s.prescription.modality==='STRENGTH'?Object.fromEntries(s.prescription.exercises.filter(e=>e.load.mode!=='KNOWN'&&e.load.mode!=='BODYWEIGHT').map(e=>[e.id,e.load.ceiling?.value??known[e.id]??20])):undefined},item.caseId+'-rec'));
   const review=prep({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${last}T20:00:00${offset(tz)}`,weekIndex:w,event:{id:`${item.caseId}-rec-${w}`,kind:'WEEKLY_REVIEW'},eligibility:{...clone(elig),assessedAt:last},observations});
   const result=r.evaluateProgram(program,review,{authority:r.authority});carry(review,result);steps.push({synthetic:true,review,result});if(result.proposal)program=result.proposal;
  }
  for(const step of item.steps){
   const review=clone(step.review),observations=[...(review.observations??[])];
   for(const f of step.observationFacts??[]){const {session}=r.resolveSession(program,f,'Observation fact');observations.push(r.nativeObservation(program,session,f,item.caseId));}
   if(step.targetRef){const {session}=r.resolveSession(program,step.targetRef,'Target');review.targetSessionId=session.id;}
   review.observations=observations;prep(review);
   const result=r.evaluateProgram(program,review,{authority:r.authority});carry(review,result);steps.push({review,result});if(result.proposal&&step.adoptProposal===true)program=result.proposal;
  }
  return {generation:gen,steps};
 }
 const rowText=(s,e)=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`;
 const runText=s=>`${s.date} ${s.role} ${s.prescription.family??''} ${s.prescription.durationMinutes}${s.prescription.work?` (${s.prescription.work.repetitions}x${s.prescription.work.workMinutes}/${s.prescription.work.recoveryMinutes})`:''}${s.prescription.strides?' +strides':''}${s.prescription.calibration?.basis?' calib '+s.prescription.calibration.basis:''}${s.prescription.effortDomain?' '+s.prescription.effortDomain:''}`;
 const weekText=w=>({index:w.index,phase:w.phase,start:w.startDate,run:w.sessions.filter(s=>live(s)&&s.sport==='RUN').map(runText),strength:w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>rowText(s,e)))});
 const runKeys=['mode','long','easy','quality','qualityStep','qualityDone','stridesDone','easyWeeksDone','returnStep','achieved','longestContinuous'];
 const entry=e=>e?{run:Object.fromEntries(Object.entries(e.run).filter(([k])=>runKeys.includes(k))),strength:Object.fromEntries(Object.entries(e.strength.exercises).map(([id,x])=>[id,Object.fromEntries(['mode','load','reps','sets','loadTick','returnStep','setCeiling','setCap','regainCap','ceiling','lastExecutedSets','lastPerformed'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]]))]))}:null;
 const detail=res=>res.steps.map((s,i)=>{const p=s.result.proposal,ret=s.result.action==='REESTABLISH',itr=ret?p?.decisions?.filter(d=>d.action==='REESTABLISH').at(-1)?.interruption:null;
  const wk=s.review.weekIndex??0,raceWeek=p?p.weeks.findIndex(w=>w.sessions.some(x=>live(x)&&x.role==='RACE')):-1,to=p?Math.min(p.weeks.length-1,Math.max(wk+2,raceWeek>=0&&raceWeek>=wk?raceWeek:0)):null;
  const race=p?p.weeks.flatMap(w=>w.sessions).find(x=>live(x)&&x.role==='RACE'):null;
  return {step:i,synthetic:!!s.synthetic,week:wk,kind:s.review.event?.kind,asOf:s.review.asOf,result:`${s.result.status}/${s.result.action}`,reason:s.result.reason??null,
   counterfactuals:(s.result.counterfactuals??[]).map(c=>`${c.id}:${c.admissible?'adm':'inadm'}${c.selected?':SELECTED':''}`),
   ...(ret?{interruption:{startDate:itr?.startDate,endDate:itr?.endDate,class:itr?.class,stateAt:itr?.stateAt?{kind:itr.stateAt.kind,week:itr.stateAt.week,authority:itr.stateAt.authority}:null},entry:entry(itr?.entry)}:{}),
   ...(s.synthetic?{}:{weeks:p?p.weeks.slice(Math.max(0,wk),to+1).map(weekText):null,race:race?{date:race.date,calibration:race.prescription.calibration??null,effortDomain:race.prescription.effortDomain??null,instructions:race.prescription.instructions??null}:null,
    negotiation:p?(p.negotiation??[]).map(n=>({id:n.id,...(n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING'?{text:JSON.stringify(n).slice(0,900)}:{})})):null,
    runStarts:p?p.stateTrace.slice(Math.max(0,wk),to+1).map((x,k)=>({week:wk+k,...Object.fromEntries(Object.entries(x.run).filter(([kk])=>['mode','long','easy','qualityStep','returnStep','achieved','longestContinuous'].includes(kk)))})):null})};});
 const programsOf=r=>[['generation',r.generation?.program??null],...(r.steps??[]).map((s,i)=>['step'+i,s.result?.proposal??null])];
 const rowOf=e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load?.mode??null,value:Number.isFinite(e.load?.value)?e.load.value:null,kind:e.exposure?.kind??null});
 const runOf=p=>({family:p.family??null,minutes:p.durationMinutes??null,reps:p.work?.repetitions??null,work:p.work?.workMinutes??null,strides:p.strides?.repetitions??null,calibration:p.calibration?.basis??null});
 function tally(a,b){const t={rose:[],fell:0,kindChanged:[],identicalPrograms:0,programs:0};const A=new Map(programsOf(a)),B=new Map(programsOf(b));
  for(const [where,pa] of A){const pb=B.get(where);if(!pa||!pb)continue;t.programs++;
   const sa=new Map(pa.weeks.flatMap(w=>w.sessions.filter(live).map(s=>[s.id,{s,w:w.index}]))),sb=new Map(pb.weeks.flatMap(w=>w.sessions.filter(live).map(s=>[s.id,{s,w:w.index}])));let same=true;
   for(const [id,{s:x,w}] of sa){const y=sb.get(id)?.s;if(!y){same=false;continue;}const at=`${where} week ${w} ${x.date} ${x.sport}/${x.role}`;
    if(x.sport==='STRENGTH'){const eb=new Map((y.prescription.exercises??[]).map(e=>[e.id,rowOf(e)]));for(const e of x.prescription.exercises??[]){const ra=rowOf(e),rb=eb.get(e.id);if(!rb){same=false;continue;}
      if(ra.mode!==rb.mode||ra.kind!==rb.kind){same=false;t.kindChanged.push(`${at} ${e.id}: ${ra.mode}${ra.value??''}/${ra.kind} -> ${rb.mode}${rb.value??''}/${rb.kind}`);}
      for(const f of ['sets','reps','value']){if(!Number.isFinite(ra[f])||!Number.isFinite(rb[f])||ra[f]===rb[f])continue;same=false;if(rb[f]>ra[f])t.rose.push(`${at} ${e.id} ${f}: ${JSON.stringify(ra)} -> ${JSON.stringify(rb)}`);else t.fell++;}
      if(Number.isFinite(ra.rir)&&Number.isFinite(rb.rir)&&ra.rir!==rb.rir){same=false;if(rb.rir<ra.rir)t.rose.push(`${at} ${e.id} rir: ${ra.rir} -> ${rb.rir}`);else t.fell++;}}}
    else{const ra=runOf(x.prescription),rb=runOf(y.prescription);if(JSON.stringify(ra)!==JSON.stringify(rb))same=false;if(ra.family!==rb.family||ra.calibration!==rb.calibration)t.kindChanged.push(`${at}: ${ra.family}/${ra.calibration} -> ${rb.family}/${rb.calibration}`);
     for(const f of ['minutes','reps','work','strides']){if(!Number.isFinite(ra[f])||!Number.isFinite(rb[f])||ra[f]===rb[f])continue;if(rb[f]>ra[f])t.rose.push(`${at} ${f}: ${JSON.stringify(ra)} -> ${JSON.stringify(rb)}`);else t.fell++;}}}
   if(same&&sa.size===sb.size)t.identicalPrograms++;}
  return t;}
 const status=res=>res.steps.filter(s=>!s.synthetic).map(s=>`${s.result.status}/${s.result.action}`).join(' ');
 for(const c of corpus){const o=out.cases[c.caseId]={family:c.family};
  for(const variant of ['holdout','fullRecord']){const runs={};for(const [name,r] of Object.entries(rt)){try{runs[name]=evaluate(r,c,{record:variant==='fullRecord'});}catch(e){runs[name]={error:String(e?.stack??e).slice(0,600),steps:[]};}}
   const v=o[variant]={status:{predecessor:status(runs.predecessor),stateModel:status(runs.stateModel)}};
   if(runs.predecessor.error||runs.stateModel.error){v.error={predecessor:runs.predecessor.error??null,stateModel:runs.stateModel.error??null};continue;}
   v.syntheticReviews={predecessor:runs.predecessor.steps.filter(s=>s.synthetic).map(s=>`${s.result.status}/${s.result.action}`),stateModel:runs.stateModel.steps.filter(s=>s.synthetic).map(s=>`${s.result.status}/${s.result.action}`)};
   v.tally=tally(runs.predecessor,runs.stateModel);
   if(DETAIL.includes(c.caseId))v.detail={predecessor:detail(runs.predecessor),stateModel:detail(runs.stateModel)};
  }
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify(out,null,1));
