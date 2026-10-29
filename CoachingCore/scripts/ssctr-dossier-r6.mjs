import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
import {generateProgram} from '../src/r6-program.mjs';
import {evaluateProgram} from '../src/r6-adaptation.mjs';
import {loadR6Policy} from '../src/r6-authority.mjs';
import {evaluateHoldoutCase} from './evaluate-holdout-r6.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

/**
 * Development dossier for the independent SSCTR binding review. Outputs use a DEV_TEST_ONLY authority that enables
 * every candidate boundary so the reviewer can see what each boundary would make the runtime do. Not approval,
 * not quality evidence, not holdout evidence.
 */
const root=path.resolve(import.meta.dirname,'../..'),out=path.join(root,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-dossier');
fs.mkdirSync(out,{recursive:true});
const opts={authority:devAuthority()},policy=loadR6Policy();
const compactSession=s=>({id:s.id,day:s.day,role:s.role,sport:s.sport,optional:!!s.optional,explanation:s.explanation??null,prescription:s.prescription?{family:s.prescription.family,durationMinutes:s.prescription.durationMinutes,effortDomain:s.prescription.effortDomain??null,work:s.prescription.work??null,strides:s.prescription.strides??null,exercises:s.prescription.exercises?.map(e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,load:e.load}))??null,calibration:s.prescription.calibration??null}:null});
const programs=Object.fromEntries(Object.entries({...PROFILES,...EDGE_PROFILES}).map(([name,input])=>{
 const r=generateProgram(input,opts);
 return [name,{status:r.status,reason:r.reason,missingInputs:r.missingInputs,question:r.question??null,capability:r.program?{run:r.program.capability.run.class,strength:r.program.capability.strength.class}:null,priorityByPhase:r.program?.goal.priorityByPhase??null,phases:r.program?.phases.phases??null,negotiation:r.program?.negotiation.map(n=>({id:n.id,detail:n.detail}))??[],uncertainty:r.uncertainty,arrangement:r.trace?.arrangement?Object.fromEntries(Object.entries(r.trace.arrangement).map(([k,v])=>[k,{lead:v.lead,basis:v.basis,reason:v.reason,selectedId:v.selectedId,counterfactuals:v.counterfactuals.map(c=>({id:c.id,selected:c.selected,costs:c.costs.map(x=>x.axis+':'+x.severity+':'+x.cause)}))}])):null,weeks:r.program?.weeks.map(w=>({index:w.index,phase:w.phase,plannedRunMinutes:w.plannedRunMinutes,plannedStrengthSets:w.plannedStrengthSets,sessions:w.sessions.map(compactSession)}))??null}];
}));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json'),'utf8'));
const regression=corpus.cases.map(c=>{const o=evaluateHoldoutCase(c,opts);return {caseId:c.caseId,scenario:c.scenario,generation:{status:o.generation.status,reason:o.generation.reason,basis:o.generation.ranking?.basis??null,selected:o.generation.program?.selectedScheduleId??null,eventTransition:o.generation.program?.eventTransition??null,excludedAlternatives:o.generation.excludedAlternatives??[]},steps:o.steps.map(s=>({kind:s.review.event.kind,status:s.result.status,action:s.result.action,reason:s.result.reason,excluded:s.result.excludedObservations??[],prescriptions:s.result.prescriptions??null,substitutions:s.result.substitutions??null}))};});
const doc={revision:'R6-SSCTR-DOSSIER-1',generatedAt:new Date().toISOString(),authority:'DEV_TEST_ONLY — enables every candidate boundary for inspection; not approval',policyRevision:policy.revision,policyHash:hash(policy),policySha256:createHash('sha256').update(fs.readFileSync(path.join(root,'CoachingCore/r6/PROGRAM_POLICY_R6.json'))).digest('hex'),programs,r5RegressionDevelopmentReplay:regression};
fs.writeFileSync(path.join(out,'DEV_OUTPUTS.json'),JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify({programs:Object.keys(programs).length,regression:regression.length,policyHash:doc.policyHash}));
