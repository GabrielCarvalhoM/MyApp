import {clone,freeze,hash} from './value.mjs';
import {validProgram,programHash} from './r5-program.mjs';
import {programAuthority} from './r5-authority.mjs';
import {prepareReview} from './r5-review-context.mjs';
import {selectProgramAction} from './r5-selectors.mjs';
import {levelIntent,onDate,validatePrescription} from './r5-contract.mjs';
import {previousValidity,referenceResult} from './r5-validity.mjs';

function patchProgram(program,review,selection){
 const proposal=clone(program),start=selection.fromWeek??review.weekIndex+1,end=selection.throughWeek??start;
 for(const week of proposal.weeks){
  if(week.index<start||week.index>end||week.status!=='CONDITIONAL'||['EVENT','REVIEW'].includes(week.phase))continue;
  if(selection.schedule){
   week.availabilityOverride=clone(selection.availability??program.availability);
   week.sessions=selection.schedule.sessions.map((s,index)=>({...clone(s),id:`w${week.index}-${s.anchorId}`,arrangement:selection.schedule.id,weekIndex:week.index,blockId:week.blockId,date:onDate(program.startDate,week.index*7+s.day),status:'PLANNED',order:index,plannedPrescriptionHash:hash(s.prescription),prescriptionSource:{origin:'FAMILIAR_COMBINED_CONFIGURATION',anchorId:s.anchorId},...levelIntent(s.objective,[s.objective]),optional:!s.essential}));
  }
  if(selection.prescription){
   const s=week.sessions.find(s=>s.anchorId===selection.anchorId);
   if(s){s.prescription=clone(selection.prescription);s.plannedPrescriptionHash=hash(s.prescription);s.prescriptionSource={origin:'EARNED_CURRENT_FAMILIAR_ALTERNATIVE',anchorId:selection.anchorId,alternativeId:selection.alternativeId,sourceEventIds:selection.athleteEvidence?.sourceEventIds??[]};}
  }
  if(selection.removeSessionIds)week.sessions=week.sessions.filter(s=>!selection.removeSessionIds.includes(s.id));
  week.plannedRunMinutes=week.sessions.filter(s=>s.prescription.modality==='RUN').reduce((n,s)=>n+s.prescription.durationMinutes,0);
  week.restDays=[0,1,2,3,4,5,6].filter(d=>!week.sessions.some(s=>s.day===d));
 }
 // Never restore an earlier larger dose just because another calendar week starts.
 if(selection.prescription)for(const w of proposal.weeks.filter(w=>w.index>end))if(w.status==='CONDITIONAL')w.requiresReconciliationBeforeExecution=true;
 proposal.revision++;proposal.decisions.push({eventId:review.event.id,asOf:review.asOf,action:selection.action,fromWeek:start,throughWeek:end,reason:selection.reason,horizonsConsidered:['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT']});
 proposal.hash=programHash(proposal);return proposal;
}
export function evaluateProgram(program,review,options={}){
 const official=clone(review?.officialPlanState??null),base={runtimeVersion:'R5-1',mode:'SHADOW',applied:false,proposal:null,officialPlanState:official,appliedState:clone(official),completedWork:clone(program?.completedWork??[]),horizonsConsidered:['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'],qualityAssessment:{assessor:'RUNTIME_SELF_CHECK',independent:false,class:'UNREVIEWED'},missingInputs:[],counterfactuals:[]};
 if(!validProgram(program))return freeze({...base,status:'HOLD',action:'HOLD',reason:'Program integrity/version is invalid'});
 let prepared,continuationGuard;
 try{continuationGuard=previousValidity(program,review??{});prepared=prepareReview(program,clone(review??{}),{learningBlocked:!!continuationGuard,priorClinical:continuationGuard?.status==='CLINICAL_HUMAN_REQUIRED'});}catch(e){if(!(e instanceof TypeError))throw e;return freeze(referenceResult(program,review,{...base,status:'HOLD',action:'HOLD',reason:'Malformed review context: '+e.message,actualLedger:clone(Array.isArray(review?.actualLedger)?review.actualLedger:[])}));}
 const output={...base,updatedModel:prepared.model,actualLedger:prepared.actualLedger,excludedObservations:prepared.excluded,inputHash:hash({programHash:program.hash,review})};
 const reject=(status,reason,extra={})=>freeze(referenceResult(program,review,{...output,status,action:status,reason,...extra}));
 if(prepared.clinical)return reject('CLINICAL_HUMAN_REQUIRED','Clinical concern routes to qualified human assessment; no dependent prescription');
 if(prepared.errors.length)return reject('HOLD','Material context/provenance failed validation',{errors:prepared.errors});
 if(prepared.missing.length)return reject('ASK','Current eligibility must be assessed; unknown remains unknown',{missingInputs:prepared.missing});
 if(continuationGuard)return reject(continuationGuard.status,continuationGuard.reason,{missingInputs:continuationGuard.missingInputs??[]});
 const authority=programAuthority(options);
 if(!authority.valid||authority.policyHash!==program.policyHash)return reject('UNSUPPORTED','Current independent reusable program authority is missing or stale');
 const selection=selectProgramAction(program,review,prepared);
 const status=['KEEP','DISCARD'].includes(selection.action)?'KEEP':['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'].includes(selection.action)?selection.action:'MODIFY';
 const proposal=status==='MODIFY'?patchProgram(program,review,selection):null;
 if(proposal){
  const changed=proposal.weeks.filter((w,i)=>hash(w)!==hash(program.weeks[i]));
  for(const week of changed)for(const session of week.sessions){
   const previous=program.weeks[week.index].sessions.find(s=>s.id===session.id);if(previous&&hash(previous)===hash(session))continue;
   const window=(week.availabilityOverride??proposal.availability).find(d=>d.day===session.day)?.windows.find(w=>w.id===session.windowId);
   if(validatePrescription(session.prescription).length||!window||session.prescription.durationMinutes>window.durationMinutes||!session.prescription.equipment.every(e=>window.equipment.includes(e))||Date.parse(session.date+'T00:00:00Z')<=Date.parse(review.asOf))return reject('UNSUPPORTED','Counterfactual fails complete future prescription, window, equipment or chronology validation');
  }
  for(const actual of prepared.actualLedger){
   const old=program.weeks.flatMap(w=>w.sessions).find(s=>s.id===actual.sessionId),updated=proposal.weeks.flatMap(w=>w.sessions).find(s=>s.id===actual.sessionId);
   if(old&&hash(old)!==hash(updated??null))return reject('HOLD','Counterfactual would rewrite a session with immutable actual execution');
  }
 }
 if(proposal&&hash(proposal.weeks)===hash(program.weeks))return reject('UNSUPPORTED','Selected change has no executable uncompleted horizon; no false positive mutation');
 return freeze(referenceResult(program,review,{...output,...selection,status,proposal,selectedAction:selection.action,trace:{sourceProgramHash:program.hash,reviewHash:hash(review),policyHash:authority.policyHash,modelBeforeHash:review.athleteModel?.hash??null,modelAfterHash:prepared.model.hash,completedHash:hash(output.completedWork),officialHash:hash(official),authoritySplit:'Reusable boundaries constrain; deterministic coaching compares concrete feasible options',noCausalClaim:true},nextObservation:selection.nextObservation??'Compare actual execution/effort/recovery at the selected dose; revalidate the next horizon before execution. Unknown response never earns automatic restoration.'}));
}
export class ProgramShadowJournal{
 #events=new Map();
 #states=new Map();
 record(program,review,options={}){
  const key=program.athleteId+':'+review.event.id,fingerprint=hash({program,review,options});
  if(this.#events.has(key)){
   const old=this.#events.get(key);return freeze({duplicate:true,conflict:old.fingerprint!==fingerprint,result:old.fingerprint===fingerprint?old.result:null});
  }
  const prior=this.#states.get(program.athleteId),effective={...prior,...review,...(prior?.referenceState?{referenceState:prior.referenceState}: {})};
  if(prior?.actualLedger)effective.actualLedger=[...prior.actualLedger,...(review.actualLedger??[]).filter(o=>!prior.actualLedger.some(p=>p.eventId===o.eventId))];
  const result=evaluateProgram(program,effective,options);if(result.referenceState)this.#states.set(program.athleteId,{referenceState:result.referenceState,athleteModel:result.updatedModel,actualLedger:result.actualLedger});this.#events.set(key,{fingerprint,result});return freeze({duplicate:false,conflict:false,result});
 }
 get size(){return this.#events.size;}
}
