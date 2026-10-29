import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {evaluateHoldoutCase} from './evaluate-holdout-r6.mjs';
import {r6Authority} from '../src/r6-authority.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {hash} from '../src/value.mjs';

/** Frozen R5 holdout replayed through R6. Facts are never edited; classification belongs to an independent judge. */
const root=path.resolve(import.meta.dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const CORPUS='CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json',FIRST='CoachingCore/r5/holdout/FIRST_EVALUATION.json',QUALITY='audits/domain-coaching-r5-2026-10-25/reviews/quality-holdout-review.json';
const causes={
 H01:['EVENT_TRANSITION_NOT_DERIVABLE','R5 could only repeat supplied tasks; taper and race-week work had to be supplied as tasks.','R6-EVENT-TRANSITION derives taper and race-week work from the achieved peak (same effort, less work) without pace or readiness claims.'],
 H02:['VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES','A REGRESS alternative changing duration and sets together rejected the executable baseline.','Each alternative is validated separately and dependent dimensions (duration that follows sets) are not independent progressions; an invalid alternative is dropped with a reason.'],
 H03:['BALANCED_INPUT_ORDER','Equivalent essential-stimulus preservation hid incomparable freshness costs; input order chose.','Pareto over ordinal interference and H0–H3 costs, then lowest worst-case joint harm, with the cost stated; ASK only when still incomparable.'],
 H07:['ADAPTER_CLOCK_AND_STRUCTURED_TOTALS','The adapter invented 22:00 after the 20:00 review and omitted derivable physical totals.','Day precision uses the latest causal instant not after the review clock; totals are derived from explicit stimuli.'],
 H08:['ADAPTER_CLOCK_AND_PHASE_COMPARABILITY','A fabricated future clock rejected every observation; phases of the same class were treated as non-comparable.','Causal clock fixed; comparability classes make repeated easier long runs count toward one earned step.'],
 H09:['VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES','A progression alternative blocked initial baseline generation.','Per-alternative admissibility.'],
 H10:['ADAPTER_CLOCK','The adapter invented a future observation clock.','Causal clock fixed; the missed essential session is resolved without debt.'],
 H11:['BALANCED_INPUT_ORDER_AND_ADAPTER_CLOCK','Initial Balanced ambiguity and a fabricated future timestamp.','Both fixes above.'],
 H13:['VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES','A multidimensional strength regression alternative blocked the whole trajectory.','Per-alternative admissibility with dependent dimensions.'],
 H16:['RETURN_PREPARATION_DIMENSION','Duration plus preparation was treated as forbidden independent load progression.','R6-NONCLINICAL-RETURN stages re-entry from the current demonstration and the last completed doses.'],
 H19:['SUBSTITUTION_NOT_SELECTED','Supplied physically valid substitutes were never considered.','Same-intent substitutes are candidates; unfamiliar ones start with effort-guided establishment.'],
 H20:['BALANCED_INITIAL_GENERATION','A good later MOVE did not repair the unjustified initial selection.','Initial generation uses the same Balanced selector as adaptation.'],
 H21:['UNKNOWN_COMBINED_TOLERANCE','Explicitly unknown combined-week recovery refused generation.','UNKNOWN arrangement evidence is carried as uncertainty with weekly tolerance review instead of refusal; learned ranking cites its evidence.'],
 H22:['EVENT_TRANSITION_NOT_DERIVABLE','Event-week work had to be supplied.','Derived event week inside R6-EVENT-TRANSITION.'],
 H24:['STALE_ALTERNATIVE_POISONS_BASELINE','Stale and multidimensional alternatives blocked the source-identity reviews.','Stale alternatives drop out individually; R6 provenance runs before binding (duplicates merge, conflicts quarantine).']};
const main=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename);
if(main){
 const dev=process.argv.includes('--dev'),options=dev?{authority:devAuthority()}:{},authority=r6Authority(options);
 const corpus=read(CORPUS),old=read(FIRST),quality=read(QUALITY);
 const rows=corpus.cases.map(item=>{
  const suffix=item.caseId.replace('R5-',''),q=quality.cases.find(c=>c.caseId===item.caseId),before=old.rows.find(c=>c.caseId===item.caseId);
  let output=null,error=null;try{output=evaluateHoldoutCase(item,options);}catch(e){error={name:e.name,message:e.message};}
  const [rootCause,r5Gap,correctionR6]=causes[suffix]??['BOUNDED_R5_BEHAVIOR','No R6 correction targeted; the case is replayed as a regression check.','None; behaviour is expected to be preserved.'];
  const last=output?.steps?.at(-1)?.result;
  return {caseId:item.caseId,immutableFactsHash:hash(item),r5Classification:q.quality,r5Reason:q.reason??null,firstR5EvaluationHash:hash(before),rootCause,r5Gap,correctionR6,
   generationR6:output?{status:output.generation.status,reason:output.generation.reason??null,selectedScheduleId:output.generation.program?.selectedScheduleId??null}:null,
   stepsR6:(output?.steps??[]).map(s=>({event:s.review.event?.kind??null,status:s.result.status,action:s.result.action,reason:s.result.reason})),
   resultR6:last?.status??output?.generation?.status??'ERROR',r6Error:error,r6Output:output,classificationR6:'PENDING_INDEPENDENT_REVIEW'};
 });
 const doc={revision:'R5-REGRESSION-R6-2',evaluatedAt:new Date().toISOString(),authority:dev?'DEV_TEST_ONLY':'CURRENT_INDEPENDENT_REVIEW',approvedBoundaries:authority.approved,policyHash:authority.policyHash,
  scope:'Frozen R5 holdout replayed as development regression; never fresh holdout evidence. Facts unchanged; classification by an independent judge.',
  corpusSha256:sha(CORPUS),r5FirstRawSha256:sha(FIRST),r5QualityReviewSha256:sha(QUALITY),rows};
 assert.equal(rows.length,24);
 const file=path.join(root,dev?'CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.dev.json':'CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.json');
 fs.writeFileSync(file,JSON.stringify(doc,null,2)+'\n');
 console.log(JSON.stringify({cases:rows.length,errors:rows.filter(r=>r.r6Error).length,authority:doc.authority,states:Object.fromEntries([...new Set(rows.map(r=>r.resultR6))].map(s=>[s,rows.filter(r=>r.resultR6===s).length]))}));
}
