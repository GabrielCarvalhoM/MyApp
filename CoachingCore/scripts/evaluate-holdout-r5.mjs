import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram,stimulusOf,sessionContext} from '../src/r5-index.mjs';
import {clone,hash} from '../src/value.mjs';

function factObservation(program,source,fact,caseId){
 const asPrescribed=fact.actualStimulus==='AS_PRESCRIBED',p=source.prescription;
 return {eventId:fact.eventId??`${caseId}-${source.id}`,athleteId:program.athleteId,sessionId:source.id,observedAt:fact.observedAt??source.date+'T22:00:00Z',origin:'ACTUAL_EXECUTION',sourceHash:hash({caseId,sourceId:source.id,fact}),plannedPrescriptionHash:hash(p),actual:{completed:fact.completed,minutes:fact.actualMinutes??(asPrescribed?p.durationMinutes:null),...(p.modality==='STRENGTH'&&asPrescribed?{sets:p.exercises.reduce((n,e)=>n+e.sets,0),reps:p.exercises.reduce((n,e)=>n+e.sets*e.reps,0)}:{}),...(fact.actual??{}),stimulus:asPrescribed?stimulusOf(p):clone(fact.actualStimulus??null)},response:{performance:fact.performance??'UNKNOWN',recovery:fact.recovery??'UNKNOWN',effort:fact.effort??'UNKNOWN'},context:source.origin==='HISTORICAL_ACTUAL_TASK'?{family:p.family,modality:p.modality,phase:source.phase,arrangement:source.arrangement,doseKey:hash(p),equipment:clone(p.equipment),priority:source.priority}:sessionContext(program,source),comparable:fact.comparable,confounded:fact.confounded};
}
export function evaluateHoldoutCase(item){
 const generation=generateProgram(item.programInput);
 if(item.operation==='GENERATE'||!generation.program)return {generation,steps:[]};
 let program=generation.program,model=null,actualLedger=[],referenceState=null;const steps=[];
 for(const step of item.operation==='SEQUENCE'?item.steps:[item]){
  const review=clone(step.review),historicalSessions=clone(review.historicalSessions??[]);
  const historicalFacts=step.historicalFacts??[],allSessions=program.weeks.flatMap(w=>w.sessions);
  for(const f of historicalFacts){
   const prescription=f.prescription??program.anchors.find(a=>a.id===f.anchorId)?.prescription;
   historicalSessions.push({id:f.id,athleteId:program.athleteId,origin:'HISTORICAL_ACTUAL_TASK',date:f.date,phase:f.phase,arrangement:f.arrangement,priority:f.priority??program.goal.priority,prescription:clone(prescription)});
  }
  const facts=step.observationFacts??[],observations=[...(review.observations??[])];
  for(const f of facts){const source=program.weeks[f.weekIndex]?.sessions.find(s=>s.anchorId===f.anchorId);if(!source)throw new Error('Holdout observation references absent supplied task');observations.push(factObservation(program,source,f,item.caseId));}
  for(const f of historicalFacts){const source=historicalSessions.find(s=>s.id===f.id);observations.push(factObservation(program,source,f,item.caseId));}
  const target=step.target;
  if(target){const source=program.weeks[target.weekIndex]?.sessions.find(s=>s.anchorId===target.anchorId);review.targetSessionId=source?.id??null;}
  review.observations=observations;if(historicalSessions.length)review.historicalSessions=historicalSessions;
  if(model)review.athleteModel=model;if(actualLedger.length)review.actualLedger=actualLedger;if(referenceState)review.referenceState=referenceState;
  const beforeHash=hash(program),result=evaluateProgram(program,review);assert.equal(hash(program),beforeHash);steps.push({review,sourceProgramHash:program.hash,result});
  model=result.updatedModel??model;actualLedger=result.actualLedger??actualLedger;referenceState=result.referenceState??referenceState;
  if(result.proposal&&step.adoptProposal===true)program=result.proposal;
 }
 return {generation,steps,finalProgramHash:program.hash};
}
const isMain=process.argv[1]&&new URL('file:///'+process.argv[1].replaceAll('\\','/')).href===import.meta.url;
if(isMain){
 const root=new URL('../../',import.meta.url),folder=new URL('../r5/holdout/',import.meta.url),read=n=>JSON.parse(fs.readFileSync(new URL(n,folder),'utf8'));
 const freeze=JSON.parse(fs.readFileSync(new URL('../r5/RUNTIME_FREEZE_R5.json',import.meta.url),'utf8'));
 for(const e of freeze.entries)assert.equal(createHash('sha256').update(fs.readFileSync(new URL(e.path,root))).digest('hex'),e.sha256,e.path);
 const manifest=read('INDEPENDENCE_MANIFEST.json'),corpusBytes=fs.readFileSync(new URL('R5_INDEPENDENT_HOLDOUT.json',folder));
 assert.equal(createHash('sha256').update(corpusBytes).digest('hex'),manifest.corpusSha256);
 assert.equal(manifest.runtimeInspectedBeforeSeal,false);assert.equal(manifest.engineImplementationByAuthor,false);
 const corpus=JSON.parse(corpusBytes),first=new URL('FIRST_EVALUATION.json',folder);assert.equal(fs.existsSync(first),false,'First evaluation is immutable; use verification replay rather than overwrite');
 const rows=corpus.cases.map(c=>{try{return {caseId:c.caseId,output:evaluateHoldoutCase(c),error:null};}catch(e){return {caseId:c.caseId,output:null,error:{name:e.name,message:e.message}};}});
 fs.writeFileSync(first,JSON.stringify({revision:'R5-HOLDOUT-FIRST-1',evaluatedAt:new Date().toISOString(),sourceDigest:freeze.sourceDigest,corpusSha256:manifest.corpusSha256,firstEvaluation:true,rows},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({cases:rows.length,errors:rows.filter(r=>r.error).length,firstEvaluationPreserved:true}));
}
