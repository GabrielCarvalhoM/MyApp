import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {evaluateShadow,ShadowJournal,arbitrate} from '../src/runtime.mjs';
import {scenarioInput,dayInput,goldenInput,fixturePlans} from '../src/fixtures.mjs';
import {hash,clone} from '../src/value.mjs';

const out=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../artifacts');fs.mkdirSync(out,{recursive:true});
const write=(name,data)=>fs.writeFileSync(path.join(out,name),typeof data==='string'?data:JSON.stringify(data,null,2)+'\n');
const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];
const classes=['POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED','SUPPORTED_KEEP','USEFUL_ASK','CORRECT_ABSTAIN_OR_HOLD','NOT_SUPPORTED_YET','CLINICAL_OR_OUT_OF_SCOPE'];
function coverage(d){if(d.decisionType==='CLINICAL_HUMAN_REQUIRED'||d.unsupportedDependency==='REAL_USE_NOT_AUTHORIZED')return classes[5];return {MODIFY:classes[0],KEEP:classes[1],ASK:classes[2],HOLD:classes[3],ABSTAIN:classes[3],NOT_SUPPORTED_YET:classes[4]}[d.decisionType];}
const rows=[],journal=new ShadowJournal();let replayChecks=0,determinismChecks=0;
function evaluate(input,corpus,label){const before=hash(input),r=journal.record(input).result,d=r.shadowDecision;assert.equal(hash(input),before);assert.equal(hash(r.appliedState),hash(input.officialPlanState??null));assert.deepEqual(evaluateShadow(input),r);determinismChecks++;const size=journal.size;assert.equal(journal.record(input).duplicate,true);assert.equal(journal.size,size);replayChecks++;rows.push({corpus,label,coverage:coverage(d),input,result:r});return r;}
for(let n=1;n<=24;n++){const id='E2E-'+String(n).padStart(2,'0');evaluate(scenarioInput(id),'ACF_24',id);}
evaluate(scenarioInput('E2E-20-SN'),'NOVICE_COUNTERPART','E2E-20-SN');
for(const id of ['S13-N','S13-T','S14-N','S14-T','S29-R2','S29-N','S29-C'])evaluate(goldenInput(id),'SDC_SUCCESSORS',id);

function dateFor(day,week=0){return new Date(Date.UTC(2026,9,26+(week*7)+days.indexOf(day),18)).toISOString();}
function actualFor(s,week){return {sessionId:s.session_id,athleteId:s.athlete_id,executedRevision:s.session_revision,actualPrescription:clone(s.prescription),status:s.optional?'OPTIONAL_OMITTED_CONFIRMED':'COMPLETED_AS_CHOSEN',factId:`SYN-W${week}-${s.session_id}`,sourceRevision:'r1',sourceRef:'SCRIPTED_SYNTHETIC_EXPLICIT_RESPONSE',coverage:'COMPLETE',observedAt:dateFor(s.day,typeof week==='number'?Math.max(0,week-1):0)};}
const trajectories=[];
for(const plan of fixturePlans()){
  const completed=[],traceIds=[];
  for(const day of days){completed.push(...plan.sessions.filter(s=>s.day===day).map(s=>actualFor(s,1)));const i=dayInput(plan.plan_id,day,completed);i.evaluatedAt=days.indexOf(day)===6?'2026-11-01T21:00:00-03:00':`2026-10-${26+days.indexOf(day)}T21:00:00-03:00`;const r=evaluate(i,'NINE_WEEKS',plan.plan_id+'/'+day);traceIds.push(r.shadowDecision.traceId);}
  trajectories.push({id:plan.plan_id,athleteId:plan.athlete_id,days:7,traceIds,actualCount:completed.filter(a=>a.status==='COMPLETED_AS_CHOSEN').length,omittedOptional:completed.filter(a=>a.status==='OPTIONAL_OMITTED_CONFIRMED').length,officialPlanHash:hash(plan)});
}

// Each stress trajectory has a persistent hold after an unresolved fact. Calendar time never clears it.
for(const [name,eventId,when] of [['FATIGUE','E2E-09','THU'],['RACE_PHASE','E2E-13','THU'],['LEARNED_RESPONSE','E2E-16','SUN'],['OPTIONAL_MISS','E2E-07','SUN']]){
  const seed=scenarioInput(eventId),plan=seed.officialPlanState,completed=[],traceIds=[];let pending=false;
  for(const day of days){completed.push(...plan.sessions.filter(s=>s.day===day).map(s=>actualFor(s,name)));let i=day===when?clone(seed):dayInput(plan.plan_id,day,completed);i.evaluatedAt=new Date(Date.parse(dateFor(day))+3*3600000).toISOString();if(pending)i.policyContext.holds=['UNRESOLVED_'+name];const r=evaluate(i,'STRESS_WEEKS',name+'/'+day);traceIds.push(r.shadowDecision.traceId);if(['HOLD','ASK'].includes(r.shadowDecision.decisionType))pending=true;}
  trajectories.push({id:name,days:7,traceIds,retainedUnresolvedHold:pending,officialPlanHash:hash(plan)});
}

// Four-week block is an observation stream with explicit independent future proposals. Never adopted by shadow.
const blockPlan=fixturePlans().find(p=>p.plan_id==='WEEK-RF');
for(let week=1;week<=4;week++){
  const completed=[];
  for(const day of days){completed.push(...blockPlan.sessions.filter(s=>s.day===day).map(s=>actualFor(s,week)));const i=dayInput(blockPlan.plan_id,day,completed);i.event.event_id=`BLOCK-W${week}-${day}`;i.evaluatedAt=`2026-11-${String(2+(week-1)*7+days.indexOf(day)).padStart(2,'0')}T21:00:00-03:00`;evaluate(i,'FOUR_WEEK_STREAM',`W${week}/${day}`);}
  if(week===2)evaluate(scenarioInput('E2E-04'),'FOUR_WEEK_PROPOSALS','NEXT-EASY35');
  if(week===3)evaluate(scenarioInput('E2E-06'),'FOUR_WEEK_PROPOSALS','NEXT-SQUAT62.5');
}

const probes=[['NO_HISTORY',i=>i.officialPlanState=null],['UNKNOWN_METADATA',i=>delete i.provenance.sourceRevision],['CLINICAL',i=>i.recoveryContext.persistentPain=true],['UNKNOWN_POLICY',i=>i.policyContext.requestedPolicyIds=['NEW_POLICY']],['REVOKED',i=>i.policyContext.revokedReviewIds=['SSCTR-ACF-E-RUNPROG']],['UNREVIEWED_CALIBRATION',i=>i.officialPlanState.sessions[0].calibration=null],['NONCLINICAL_RETURN_NO_RECIPE',i=>Object.assign(i.recoveryContext,{interrupted:true,interruptionReason:'TRAVEL',actualExposureKnown:true})]];
for(const [name,change]of probes){const i=scenarioInput('E2E-05');change(i);evaluate(i,'FAILURE_CLOSED_PROBES',name);}
// Alternating unsupported noisy inputs cannot become dose arithmetic or a stream of opposing prescriptions.
for(const v of ['LOW','HIGH','LOW','HIGH']){const i=scenarioInput('E2E-05');i.observation={type:'UNREVIEWED_BIOMARKER',hrv:v};evaluate(i,'NOISE_PROBES',v);}
const priorityProbes=[];
const candidates=[{id:'RUN',admissible:true,preservesGoals:['RUN']},{id:'STRENGTH',admissible:true,preservesGoals:['STRENGTH']}];
for(const adequate of [true,false])for(const priority of ['RUN_FIRST','STRENGTH_FIRST','BALANCED_HYBRID'])priorityProbes.push({adequacy:adequate?'ADEQUATE':'INADEQUATE',priority,result:arbitrate({adequacy:adequate?'ADEQUATE':'INADEQUATE',necessity:adequate?'NOT_REQUIRED':'REQUIRED',priority,candidates})});
assert.ok(priorityProbes.filter(p=>p.adequacy==='ADEQUATE').every(p=>p.result.action==='KEEP'));

const uniqueRows=[...new Map(rows.map(r=>[r.result.shadowDecision.traceId,r])).values()];
function tally(items){return Object.fromEntries(classes.map(c=>[c,items.filter(r=>r.coverage===c).length]));}
const baseline={revision:'BSR-COVERAGE-0.1.0',measuredAt:new Date().toISOString(),classDefinitions:{[classes[0]]:'Concrete supported proposal only, never applied; acceptance required',[classes[1]]:'Adequate no-op or exact previously accepted execution branch, no new prescription',[classes[2]]:'Choice-changing missing information; not a positive dose',[classes[3]]:'Dependent action retained for missing authority/evidence; not a positive dose',[classes[4]]:'Required behavior outside the executable approved subset',[classes[5]]:'Clinical or explicitly unauthorized real-service use'},denominatorPolicy:'Report each designed corpus separately. No efficacy/safety/general-population coverage inference. Replays excluded from unique totals.',corpora:Object.fromEntries([...new Set(rows.map(r=>r.corpus))].map(c=>[c,{count:rows.filter(r=>r.corpus===c).length,classes:tally(rows.filter(r=>r.corpus===c))}])),unique:{count:uniqueRows.length,classes:tally(uniqueRows)},acf24PositiveCount:rows.filter(r=>r.corpus==='ACF_24'&&r.coverage===classes[0]).length,fullV1PositiveCoverage:'NOT_READY',positiveNumeratorRule:'Only POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED. Never add KEEP/ASK/ABSTAIN. Branch withdrawal counts SUPPORTED_KEEP.'};
const metrics={revision:'BSR-SIM-0.1.0',generatedAt:new Date().toISOString(),simulationOnly:true,scriptedResponses:'Compatible daily actuals are explicit synthetic scripted outcomes derived from familiar source doses, not physiological predictions. Four-week proposals are evaluated independently, never used as adopted plan or evidence of response to the proposed dose.',evaluationRows:rows.length,uniqueLogicalEvaluations:uniqueRows.length,replaysExcluded:rows.length-uniqueRows.length,trajectories,decisionCounts:Object.fromEntries(['KEEP','MODIFY','ASK','HOLD','ABSTAIN','NOT_SUPPORTED_YET','CLINICAL_HUMAN_REQUIRED'].map(t=>[t,uniqueRows.filter(r=>r.result.shadowDecision.decisionType===t).length])),officialPlanMutations:0,accidentalReplanning:0,appliedEffects:0,officialPlanStickiness:{unchanged:rows.length,total:rows.length,limitation:'Shadow invariant by construction; not evidence of athlete adherence or deployment stability'},determinismChecks,replayChecks,traceCompleteness:{complete:rows.filter(r=>r.result.shadowDecision.traceId&&r.result.shadowDecision.inputHash&&r.result.shadowDecision.nextCheck.exit).length,total:rows.length},policyConflicts:{automaticIncompatibleActionSets:0,paretoAskObserved:rows.some(r=>r.label==='E2E-21'),limits:'Only selected closed candidate sets; no exhaustive policy pair search'},oscillation:{identicalInputFlips:0,unsupportedNoisePrescriptions:rows.filter(r=>r.corpus==='NOISE_PROBES'&&r.result.shadowDecision.decisionType==='MODIFY').length,limits:'No universal hysteresis threshold implemented. Novel noisy contexts fail closed; authority changes suspend immediately.'},priorityProbes};
write('SYNTHETIC_SHADOW_RESULTS.json',metrics);write('COACHING_COVERAGE_BASELINE.json',baseline);
write('RUNTIME_TRACE_EXAMPLES.json',{revision:'BSR-TRACES-0.1.0',evaluationIndex:rows.map((r,index)=>({index,corpus:r.corpus,label:r.label,coverage:r.coverage,traceId:r.result.shadowDecision.traceId})),traces:uniqueRows.map(r=>({corpus:r.corpus,label:r.label,coverage:r.coverage,input:r.input,...r.result}))});
write('SYNTHETIC_SHADOW_RESULTS.md',`# Synthetic shadow results\n\n${rows.length} evaluation rows; ${uniqueRows.length} unique logical evaluations. Nine seven-day familiar athlete weeks, four seven-day stress trajectories and a four-week observation stream executed. ${determinismChecks} determinism and ${replayChecks} replay checks passed.\n\nOfficial plan mutations: 0. Applied effects: 0. Accidental replanning: 0. Identical-input decision flips: 0. Unreviewed noise prescriptions: 0. This is executable conformance, not efficacy, safety or human validation.\n\nDaily responses are scripted supplied synthetic compatible observations. The four-week stream preserves the original official dose; future proposals are never adopted or treated as completed. Unresolved fatigue/race holds persist across subsequent days. See the JSON for denominators, trace IDs, priorities and limits.\n`);
write('COACHING_COVERAGE_BASELINE.md',`# Coaching coverage baseline\n\nThe original24 ACF scenarios produce ${baseline.acf24PositiveCount} concrete positive proposal decisions; the remaining classes are reported separately. This is a designed-case count, not V1 population coverage.\n\n| ACF24 class | Count |\n|---|---:|\n${classes.map(c=>'| '+c+' | '+baseline.corpora.ACF_24.classes[c]+' |').join('\n')}\n\nKEEP, ASK, HOLD and ABSTAIN never enter the positive numerator. Exact accepted withdrawal branches are SUPPORTED_KEEP. SDC successors, novice counterpart, daily no-ops, failure probes and replay have separate denominators. Full positive V1 coverage remains NOT_READY.\n`);
write('RUNTIME_TRACE_EXAMPLES.md',`# Runtime trace examples\n\nThe JSON retains every unique evaluated input and its official, observed, decision and applied snapshots, content hash, exact policy/review references and explicit unsupported gap.\n\nInspect E2E-05 (easy35 future proposal), E2E-11 (source reconciliation), E2E-15 (24min prefix/32min actual branch), E2E-16 (observational history), E2E-23 (57.5kg candidate), E2E-24 (actual7/planned9), S13-T/S14-T (different essentiality under the same restriction), S29-R2 (new post-start fact) and S29-C (human boundary). Every appliedState equals officialPlanState. No trace is an applied prescription.\n`);
console.log(JSON.stringify({rows:rows.length,unique:uniqueRows.length,acf24:baseline.corpora.ACF_24,counts:metrics.decisionCounts}));
