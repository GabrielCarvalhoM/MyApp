import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {generateProgram,evaluateProgram,stimulusOf,sessionContext} from '../src/r6-index.mjs';
import {clone,hash} from '../src/value.mjs';
export function factObservation(program,source,fact,caseId,reviewAsOf){
 const p=source.prescription,full=fact.actualStimulus==='AS_PRESCRIBED';
 const explicit=full?stimulusOf(p):clone(fact.actualStimulus??null);
 const exercises=explicit?.exercises;
 const totals=Array.isArray(exercises)?{sets:exercises.reduce((n,e)=>n+e.sets,0),reps:exercises.reduce((n,e)=>n+e.sets*e.reps,0)}:{};
 // Omitted occurrence time is never replaced with a fabricated clock (R5 used 22:00 after a 20:00 review).
 // Day precision: the latest causal instant of the session's day that is not after the review clock.
 const dayEnd=source.date+'T23:59:59Z',latest=reviewAsOf&&Date.parse(dayEnd)>Date.parse(reviewAsOf)?new Date(Date.parse(reviewAsOf)).toISOString():dayEnd;
 return {eventId:fact.eventId??`${caseId}-${source.id}`,athleteId:program.athleteId,sessionId:source.id,observedAt:fact.observedAt??latest,availableAt:reviewAsOf,occurrenceDate:source.date,timePrecision:fact.observedAt?'EXPLICIT':'DAY',timeBasis:fact.observedAt?'SUPPLIED_TIMESTAMP':'LATEST_CAUSAL_INSTANT_OF_SESSION_DAY',origin:'ACTUAL_EXECUTION',sourceHash:hash({caseId,sourceId:source.id,fact}),plannedPrescriptionHash:hash(p),actual:{completed:fact.completed,minutes:fact.actualMinutes??(full?p.durationMinutes:null),...totals,...(fact.actual??{}),stimulus:explicit},response:{performance:fact.performance??'UNKNOWN',recovery:fact.recovery??'UNKNOWN',effort:fact.effort??'UNKNOWN'},context:source.origin==='HISTORICAL_ACTUAL_TASK'?{family:p.family,modality:p.modality,phase:source.phase,arrangement:source.arrangement,doseKey:hash(p),equipment:clone(p.equipment),priority:source.priority}:sessionContext(program,source),comparable:fact.comparable,confounded:fact.confounded,...(fact.source?{source:fact.source}:{}),...(fact.canonicalActivityId?{canonicalActivityId:fact.canonicalActivityId}:{}),...(fact.correctionOf?{correctionOf:fact.correctionOf}:{})};
}
// R6-native corpus: steps name sessions by week, sport, role and day because the program creates the ids.
const matches=(s,ref,role)=>s.sport===ref.sport&&(role==null||s.role===role)&&(ref.day==null||s.day===ref.day)&&(Boolean(s.prescription)||s.role===role);
/** Earliest matching session of the week. A role list is a preference order; ambiguity is recorded; no match is a corpus error. */
export function resolveSession(program,ref,label='Reference'){
 const sessions=program.weeks[ref.weekIndex]?.sessions??[],roles=Array.isArray(ref.role)?ref.role:[ref.role];
 for(const role of roles){
  const found=sessions.filter(s=>matches(s,ref,role)).sort((a,b)=>a.day-b.day||String(a.id).localeCompare(String(b.id)));
  if(found.length)return {session:found[0],resolution:{ref:clone(ref),role:found[0].role,sessionId:found[0].id,ambiguous:found.length>1,candidates:found.map(s=>s.id)}};
 }
 throw Error(label+' matches no session: '+JSON.stringify(ref));
}
/** R6-REVIEW-1 observation from a corpus fact. AS_PRESCRIBED copies planned minutes or sets, reps and reserve; an unstated load stays unknown. */
export function nativeObservation(program,s,fact,caseId){
 const p=s.prescription,full=fact.actualStimulus==='AS_PRESCRIBED';
 if(full&&!p)throw Error('AS_PRESCRIBED fact references a session without a prescription');
 const actual={completed:fact.completed},minutes=fact.actualMinutes??(full?p.durationMinutes:null);
 if(Number.isFinite(minutes))actual.minutes=minutes;
 if(fact.exercises)actual.exercises=clone(fact.exercises);
 else if(full&&p.modality==='STRENGTH')actual.exercises=p.exercises.map(e=>{
  const stated=fact.loadsByExercise?.[e.id]??fact.loadsByPattern?.[e.pattern];
  const load=e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:e.load.mode==='KNOWN'?{value:e.load.value,unit:e.load.unit,convention:e.load.convention}:Number.isFinite(stated)?{value:stated,unit:'KG',convention:e.load.convention}:null;
  return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(load?{load}:{}),rir:e.rir}))};
 });
 const o={eventId:fact.eventId??`${caseId}-${s.id}`,athleteId:program.athleteId,sessionId:s.id,actual,response:clone(fact.response??{})};
 if(fact.observedAt)o.observedAt=fact.observedAt;else o.occurrenceDate=fact.occurrenceDate??s.date;
 for(const k of ['reportedAt','correctionOf','correctedAt','source','comparable','confounded'])if(fact[k]!==undefined)o[k]=clone(fact[k]);
 return o;
}
export function evaluateHoldoutCase(item,options={}){
 const generation=generateProgram(item.programInput??item.intake,options);
 if(item.operation==='GENERATE'||!generation.program)return {generation,steps:[]};
 let program=generation.program,model=null,actualLedger=[],referenceState=null;
 const steps=[],native=program.version==='R6-PROGRAM-1';
 for(const step of item.operation==='SEQUENCE'?item.steps:[item]){
  const review=clone(step.review),historicalSessions=clone(review.historicalSessions??[]),resolutions=[];
  if(native){
   const observations=[...(review.observations??[])];
   for(const f of step.observationFacts??[]){const {session,resolution}=resolveSession(program,f,'Observation fact');resolutions.push({kind:'OBSERVATION',...resolution});observations.push(nativeObservation(program,session,f,item.caseId));}
   if(step.targetRef){const {session,resolution}=resolveSession(program,step.targetRef,'Target');resolutions.push({kind:'TARGET',...resolution});review.targetSessionId=session.id;}
   review.observations=observations;
  }else{
  const historicalFacts=step.historicalFacts??[];
  for(const f of historicalFacts){const prescription=f.prescription??program.anchors?.find(a=>a.id===f.anchorId)?.prescription;historicalSessions.push({id:f.id,athleteId:program.athleteId,origin:'HISTORICAL_ACTUAL_TASK',date:f.date,phase:f.phase,arrangement:f.arrangement,priority:f.priority??program.goal?.priority??'DYNAMIC_GOALS',prescription:clone(prescription)});}
  const observations=[...(review.observations??[])];
  for(const f of step.observationFacts??[]){
   const sessions=program.weeks[f.weekIndex]?.sessions??[];
   const source=sessions.find(s=>f.sessionId?s.id===f.sessionId:f.anchorId?s.anchorId===f.anchorId:s.prescription.modality===f.modality)??(Number.isInteger(f.sessionIndex)?sessions[f.sessionIndex]:null);
   if(!source)throw Error('Observation references absent supplied task');
   observations.push(factObservation(program,source,f,item.caseId,review.asOf));
  }
  for(const f of historicalFacts)observations.push(factObservation(program,historicalSessions.find(s=>s.id===f.id),f,item.caseId,review.asOf));
  if(step.target){const t=step.target,sessions=program.weeks[t.weekIndex]?.sessions??[];review.targetSessionId=(sessions.find(s=>t.anchorId?s.anchorId===t.anchorId:t.sessionId?s.id===t.sessionId:s.prescription.modality===t.modality)??sessions[t.sessionIndex??-1])?.id??null;}
  review.observations=observations;
  if(historicalSessions.length)review.historicalSessions=historicalSessions;
  }
  if(model)review.athleteModel=model;
  if(actualLedger.length)review.actualLedger=actualLedger;
  if(referenceState)review.referenceState=referenceState;
  const before=hash(program),result=evaluateProgram(program,review,options);assert.equal(hash(program),before,'Input mutated');
  assert.deepEqual(result.officialPlanState,result.appliedState,'Official effect');assert.equal(result.applied,false);
  steps.push({review,sourceProgramHash:program.hash,...(native?{resolutions}:{}),result});model=result.updatedModel??model;actualLedger=result.actualLedger??actualLedger;referenceState=result.referenceState??referenceState;
  if(result.proposal&&step.adoptProposal===true)program=result.proposal;
 }
 return {generation,steps,finalProgramHash:program.hash};
}
const main=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename);
if(main){
 const root=path.resolve(import.meta.dirname,'../..'),folder=path.join(root,'CoachingCore/r6/holdout');
 const raw=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 const freeze=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/RUNTIME_FREEZE_R6.json'),'utf8'));
 for(const e of freeze.entries)assert.equal(raw(path.join(root,e.path)),e.sha256,'Frozen input changed: '+e.path);
 const manifest=JSON.parse(fs.readFileSync(path.join(folder,'INDEPENDENCE_MANIFEST.json'),'utf8'));
 const corpusPath=path.join(folder,'R6_INDEPENDENT_HOLDOUT.json');assert.equal(raw(corpusPath),manifest.corpusSha256);
 assert.equal(manifest.runtimeInspectedBeforeSeal,false);assert.equal(manifest.engineImplementationByAuthor,false);assert.equal(manifest.outputsInspectedBeforeSeal,false);
 assert.ok(Date.parse(manifest.authorStartedAt)>Date.parse(freeze.frozenAt));
 const out=path.join(folder,'FIRST_EVALUATION.json');assert.equal(fs.existsSync(out),false,'First raw is immutable');
 const corpus=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
 const rows=corpus.cases.map(c=>{try{return {caseId:c.caseId,output:evaluateHoldoutCase(c),error:null};}catch(e){return {caseId:c.caseId,output:null,error:{name:e.name,message:e.message}};}});
 fs.writeFileSync(out,JSON.stringify({revision:'R6-HOLDOUT-FIRST-1',evaluatedAt:new Date().toISOString(),sourceDigest:freeze.sourceDigest,corpusSha256:manifest.corpusSha256,firstEvaluation:true,rows},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({cases:rows.length,errors:rows.filter(r=>r.error).length,sourceDigest:freeze.sourceDigest}));
}
