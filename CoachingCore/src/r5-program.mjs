import {clone,freeze,hash} from './value.mjs';
import {validateProgramInput,levelIntent,onDate,daysBetween,dateValid,anchorConfigurationHash} from './r5-contract.mjs';
import {programAuthority} from './r5-authority.mjs';
import {scheduleCandidates,chooseSchedule} from './r5-schedule.mjs';

const goalIntents={HALF_MARATHON:'Develop familiar running durability and event-specific readiness while retaining a real secondary strength trajectory',STRENGTH:'Develop familiar strength while sustaining secondary aerobic work',BALANCED:'Develop both modalities; seek Pareto continuity and disclose necessary trade-offs',GENERAL_FITNESS:'Sustainable hybrid participation, competence and response-guided development without event pressure'};
export const baselinePrescriptionHash=anchorConfigurationHash;
export function programHash(program){const copy=clone(program);delete copy.hash;return hash(copy);}
export const validProgram=p=>p?.version==='R5-PROGRAM-1'&&p.hash===programHash(p);
function combinedTolerance(input){
 const t=input.athlete.weeklyTolerance;
 return t?.current===true&&t.source==='SELF_REPORT'&&t.recovery==='COMPATIBLE'&&dateValid(t.observedAt)&&daysBetween(t.observedAt,input.asOf)>=0&&daysBetween(t.observedAt,input.asOf)<=28&&Array.isArray(t.anchorIds)&&hash([...t.anchorIds].sort())===hash(input.athlete.anchors.map(a=>a.id).sort());
}
function blocksFor(input){
 const eventWeek=input.athlete.goal.eventDate?Math.floor(daysBetween(input.startDate,input.athlete.goal.eventDate)/7):null;
 const end=eventWeek??input.weeks,first=Math.min(end,Math.max(1,Math.floor(end/3))),second=Math.min(end,Math.max(first+1,Math.floor(end*2/3)));
 const definitions=[['FOUNDATION',0,first,'Re-establish comparable exposure and stable scheduling'],['DEVELOPMENT',first,second,'Earn bounded progress while preserving both essential modalities'],['SPECIFIC',second,end,input.athlete.goal.kind==='HALF_MARATHON'?'Retain familiar long and event-specific tasks; no novel intensity near event':'Consolidate goal-specific strength and running trajectories']];
 if(eventWeek!==null)definitions.push(['EVENT',eventWeek,eventWeek+1,'Review complete baseline-relative event configuration and preserve freshness without invented taper']);
 if(eventWeek!==null&&eventWeek+1<input.weeks)definitions.push(['REVIEW',eventWeek+1,input.weeks,'Post-event current eligibility and response review; no automatic restoration']);
 return definitions.filter(([,a,b])=>b>a).map(([phase,start,end,intent],index)=>({id:'block-'+index,phase,startWeek:start,endWeekExclusive:end,...levelIntent(intent,['Goal-aligned essential stimulus','Actual-response transition review'],['Additional tolerated development']),transitionAutomatic:false}));
}
function sessionsFor(selected,anchors,weekIndex,block,startDate){
 return selected.sessions.map((s,index)=>({...clone(s),id:`w${weekIndex}-${s.anchorId}`,arrangement:selected.id,weekIndex,blockId:block.id,date:onDate(startDate,weekIndex*7+s.day),status:'PLANNED',plannedPrescriptionHash:hash(s.prescription),prescriptionSource:{origin:'CURRENT_SELF_REPORTED_TOLERATED_TASK',anchorId:s.anchorId,anchorObservedAt:anchors.find(a=>a.id===s.anchorId)?.observedAt},...levelIntent(s.objective,[s.essential?s.objective:'Retain optional productive exposure'],s.essential?[]:[s.objective]),optional:!s.essential,order:index}));
}
function eventConfiguration(input,asOf){
 const event=input.eventWeek;
 if(!event||event.goalKind!==input.athlete.goal.kind||event.eventDate!==input.athlete.goal.eventDate||event.baselineHash!==baselinePrescriptionHash(input.athlete.anchors))return null;
 const candidate={...clone(input),athlete:{...clone(input.athlete),anchors:event.anchors,weeklyTolerance:event.weeklyTolerance},scheduleOptions:event.scheduleOptions,asOf};
 const v=validateProgramInput(candidate);
 if(!v.valid||!combinedTolerance(candidate))return null;
 const r=chooseSchedule(scheduleCandidates(event.anchors,input.availability,event.scheduleOptions,asOf),input.athlete.goal.priority);
 return r.selected?{selected:r.selected,anchors:event.anchors}:null;
}
/** New versioned reference entrypoint; imports no fixture, expectation or evaluation corpus. */
export function generateProgram(input,options={}){
 const source=clone(input??{});let validation;
 try{validation=validateProgramInput(source);}catch(e){if(!(e instanceof TypeError))throw e;validation={clinical:false,errors:['Malformed nested input: '+e.message],missing:[]};}
 const authority=programAuthority(options);
 const base={runtimeVersion:'R5-1',mode:'SHADOW',inputHash:hash(source),program:null,applied:false,officialPlanState:clone(source.officialPlanState??null),appliedState:clone(source.officialPlanState??null),completedWork:clone(source.completedWork??[]),missingInputs:[],errors:[],horizonsConsidered:['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT']};
 const reject=(status,reason,extra={})=>freeze({...base,status,reason,...extra});
 if(validation.clinical)return reject('CLINICAL_HUMAN_REQUIRED','Current clinical concern requires qualified human assessment; no prescription or clinical return');
 if(validation.errors.length)return reject('INVALID_INPUT','Material input validation failed',{errors:validation.errors});
 if(validation.missing.length)return reject('ASK','Current material facts are required; perfect product history is not required',{missingInputs:validation.missing});
 if(!combinedTolerance(source))return reject('ASK','Individual session tolerance does not establish the complete combined weekly configuration',{missingInputs:['athlete.weeklyTolerance']});
 if(!authority.valid)return reject('UNSUPPORTED','Current independent reusable program-boundary authority is unavailable');
 const candidates=scheduleCandidates(source.athlete.anchors,source.availability,source.scheduleOptions,source.asOf,{forbiddenPairs:source.constraints?.forbiddenPairs??[]}),ranking=chooseSchedule(candidates,source.athlete.goal.priority);
 if(!ranking.selected)return reject(ranking.tiedIds.length?'ASK':'UNSUPPORTED',ranking.reason,{missingInputs:ranking.tiedIds.length?['temporaryTradeOffPreference']:[],counterfactuals:candidates,ranking});
 if(source.athlete.goal.kind==='HALF_MARATHON'&&!source.athlete.anchors.some(a=>a.prescription.family==='LONG'))return reject('ASK','Event durability needs a current long-run anchor or bounded establishment pathway',{missingInputs:['athlete.anchors.LONG']});
 const blocks=blocksFor(source),gaps=[],weeks=[];
 for(let index=0;index<source.weeks;index++){
  const block=blocks.find(b=>index>=b.startWeek&&index<b.endWeekExclusive),event=block.phase==='EVENT'?eventConfiguration(source,source.asOf):null;
  const unsupported=block.phase==='EVENT'&&!event||block.phase==='REVIEW';
  const status=unsupported?(block.phase==='EVENT'?'UNSUPPORTED_EVENT_CONFIGURATION':'POST_EVENT_ASSESSMENT_REQUIRED'):'CONDITIONAL';
  if(unsupported)gaps.push({weekIndex:index,phase:block.phase,dependency:status});
  const sessions=unsupported?[]:sessionsFor(event?.selected??ranking.selected,event?.anchors??source.athlete.anchors,index,block,source.startDate);
  weeks.push({index,startDate:onDate(source.startDate,index*7),blockId:block.id,phase:block.phase,status,conditional:true,sessions,restDays:[0,1,2,3,4,5,6].filter(d=>!sessions.some(s=>s.day===d)),...levelIntent(block.intent,['Retain run and strength essential exposure','Respond to actual tolerance before progression'],['Optional productive work']),progressionAutomatic:false,plannedRunMinutes:sessions.filter(s=>s.prescription.modality==='RUN').reduce((n,s)=>n+s.prescription.durationMinutes,0)});
 }
 const program={version:'R5-PROGRAM-1',id:'program-'+base.inputHash,athleteId:source.athlete.id,goal:clone(source.athlete.goal),startDate:source.startDate,timezone:'UTC_SYNTHETIC_REFERENCE',proposalOnly:true,official:false,revision:0,sourceInputHash:base.inputHash,policyHash:authority.policyHash,baselineHash:baselinePrescriptionHash(source.athlete.anchors),...levelIntent(goalIntents[source.athlete.goal.kind],source.athlete.anchors.filter(a=>a.essential).map(a=>a.objective),source.athlete.anchors.filter(a=>!a.essential).map(a=>a.objective)),blocks,weeks,anchors:clone(source.athlete.anchors),availability:clone(source.availability),scheduleOptions:clone(source.scheduleOptions),constraints:clone(source.constraints??{}),selectedScheduleId:ranking.selected.id,weeklyTolerance:clone(source.athlete.weeklyTolerance),completedWork:clone(source.completedWork??[]),decisions:[],gaps,horizonContract:'H0 must remain feasible in H1, preserve protected H2 stimulus and serve H3; uncertainty never authorizes extra mutation',assumptions:['Future weeks are conditional candidate projections, not physiological predictions','Phase lengths partition this requested horizon operationally; not validated optimal periodization','Familiar task tolerance and combined configuration are self-reported, not measured clearance']};
 program.hash=programHash(program);
 return freeze({...base,status:'PROPOSED',reason:ranking.reason,program,requestedScopeSatisfied:gaps.length===0,unsupportedProgramDecisions:gaps.length,counterfactuals:candidates,ranking:{selectedId:ranking.selected.id,paretoIds:ranking.paretoIds,whySelected:ranking.reason},authorityRefs:authority.records.map(r=>({boundaryId:r.boundaryId,policyHash:r.policyHash,sourceIds:r.sourceIds})),nextObservation:'Record actual task, effort, recovery, performance and adherence; reassess eligibility before execution and compare prior dose at next horizon'});
}
