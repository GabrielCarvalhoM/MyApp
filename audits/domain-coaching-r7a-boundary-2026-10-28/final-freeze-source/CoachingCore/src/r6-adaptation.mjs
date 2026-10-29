import {clone,freeze,hash} from './value.mjs';
import {r6Authority,allows} from './r6-authority.mjs';
import {validProgram,programHash,skeletonOf,advanceRun,advanceStrength,strengthAtBreak,loggedLoadDecision,adoptionBasis,dayPhaseOf,startStrengthReturn,eventCompletionItem,validateWeeks,peakOf,contextOf,arrangementCandidates,arrangementDisclosures,strengthTemplates,planPhases,buildGoalModel,blocksFrom,goalDose,runTarget,runMinutesOf,EVENT_PHASES,DEVELOPMENT,BLOCK_INTENT} from './r6-program.mjs';
import {chooseBalanced,interferenceCosts,SEVERITY} from './r6-balanced.mjs';
import {substitutesFor,catalogueEntry} from './r6-catalogue.mjs';
import {exerciseRow,fitStrengthSession,strengthPrescription,easyPrescription,validateR6Prescription} from './r6-prescription.mjs';
import {aheadOf,usedInWeek,rebasedNext,returnOf,beforeReturn,moveCandidates,choose,counter,rank,fatigueSessions,unavailableSessions,missedMove,conflictSessions,waitSessions,adaptThisWeek,adaptation,withContextChange,composeWeeks,weekAsPlanned,conditionalNext} from './r6-composition.mjs';
import {createLearningModel,updateLearningModel,validateLearningModel,evidenceFor,preferredArrangement,classify} from './r6-learning.mjs';
import {normalizeObservations,utcTimestamp,localDate} from './r6-provenance.mjs';
import {onDate,dayGap,isoDay,LB_TO_KG,toKilograms,RUN_GOALS,STRENGTH_GOALS,EVENTS} from './r6-intake.mjs';
import {screenInterruptionReason,isYes} from './r6-clinical.mjs';

export const REVIEW_VERSION='R6-REVIEW-1';
const KIND_ALIASES={REVIEW:'WEEKLY_REVIEW',MISSED_ESSENTIAL:'MISSED_SESSION',MISSED_OPTIONAL:'MISSED_SESSION',RETURN:'RETURN_AFTER_PAUSE',CONFLICT:'DOUBLE_CONFLICT',DOUBLE_INFEASIBLE:'DOUBLE_CONFLICT',EVENT_NEAR:'EVENT_WEEK_CONFLICT',SESSION_MOVED:'UNAVAILABLE_DAY',TRAVEL:'EQUIPMENT_CHANGE',SUBSTITUTION_NEED:'EQUIPMENT_CHANGE'};
export const REVIEW_KINDS=['WEEKLY_REVIEW','MISSED_SESSION','PARTIAL_SESSION','UNDERPERFORMANCE','OVERPERFORMANCE','PROGRESSION_NOT_TOLERATED','PROGRESSION_TOO_EASY','LOCAL_FATIGUE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE','UNAVAILABLE_DAY','DOUBLE_CONFLICT','EQUIPMENT_CHANGE','GOAL_CHANGE','EVENT_DATE_CHANGE','RETURN_AFTER_PAUSE','EVENT_WEEK_CONFLICT','RECOVERED'];
const HORIZONS=['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'];
const CLINICAL_KEYS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
export const sessionType=s=>s.sport==='RUN'?'RUN:'+s.role:'STRENGTH:'+(s.templateType??s.prescription?.family??'SESSION');
const RUN_GATE_ROLE={LONG:'LONG',QUALITY:'QUALITY',EASY:'EASY',WALK_JOG:'WALK_JOG'};

// ---------- reference continuation state ----------
function previousValidity(program,review){
 const st=review.referenceState;if(!st)return null;
 const {hash:digest,...body}=st;
 if(st.version!=='R6-REFERENCE-STATE-1'||st.athleteId!==program.athleteId||digest!==hash(body)||Date.parse(st.asOf)>Date.parse(utcTimestamp(review.asOf)??0))return {status:'HOLD',reason:'Reference state integrity, ownership or clock is invalid'};
 if(!st.pending)return null;
 if(st.pending.status==='CLINICAL_HUMAN_REQUIRED')return {status:'CLINICAL_HUMAN_REQUIRED',reason:'A prior clinical dependency remains outside this nonclinical reference; no automatic clearance'};
 const kind=KIND_ALIASES[review.event?.kind]??review.event?.kind;
 if(kind==='RECOVERED')return {status:'ASK',reason:'A generic recovered label does not supply the specific facts the pending decision needs',missingInputs:st.pending.missingInputs??[]};
 return null;
}
function withReference(program,review,result){
 const prior=review?.referenceState,{hash:digest,...priorBody}=prior??{},priorValid=!!prior&&prior.athleteId===program?.athleteId&&digest===hash(priorBody);
 const clinicalSticky=priorValid&&prior.pending?.status==='CLINICAL_HUMAN_REQUIRED';
 if(clinicalSticky&&result.status!=='CLINICAL_HUMAN_REQUIRED')result={...result,status:'CLINICAL_HUMAN_REQUIRED',action:'CLINICAL_HUMAN_REQUIRED',proposal:null,reason:'Prior clinical dependency is preserved; this reference cannot clear it'};
 const pendingStatus=['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'].includes(result.status);
 const pending=clinicalSticky?clone(prior.pending):pendingStatus?{status:result.status,reason:result.reason,missingInputs:clone(result.missingInputs??[]),eventKind:KIND_ALIASES[review?.event?.kind]??review?.event?.kind??null,eventId:review?.event?.id??null}:null;
 const asOf=utcTimestamp(review?.asOf)&&(!priorValid||Date.parse(review.asOf)>=Date.parse(prior.asOf))?utcTimestamp(review.asOf):priorValid?prior.asOf:null;
 const body={version:'R6-REFERENCE-STATE-1',athleteId:program?.athleteId??null,programHash:result.proposal?.hash??program?.hash??null,asOf,pending,scope:'Synthetic reference continuation state; never authorizes official plan effects'};
 return {...result,planValidity:{status:pending?'REQUIRES_RECONCILIATION':'VALID_WITHIN_CURRENT_BOUNDED_SCOPE'},referenceState:{...body,hash:hash(body)}};
}
// ---------- binding and evidence ----------
function interferenceBefore(program,s,hybrid){
 const w=program.weeks[s.weekIndex],prev=program.weeks[s.weekIndex-1],sessions=[...(prev?prev.sessions.map(x=>({...x,day:x.day-7})):[]),...w.sessions].filter(x=>x.prescription);
 return interferenceCosts(sessions,{wrap:false,hybrid}).filter(c=>c.afterId===s.id).map(c=>c.cause);
}
/** Logged sets per planned exercise. Loads are read in kilograms in the planned convention; a set in another unit or
 * convention leaves the load unknown and asked about, never adopted (QRE-R6-01). */
function strengthLogs(o,s){
 const out={};
 for(const e of Array.isArray(o.actual?.exercises)?o.actual.exercises:[]){
  if(!e||typeof e!=='object')continue;
  const planned=s.prescription.exercises.find(x=>x.id===e.id),sets=Array.isArray(e.sets)?e.sets.filter(x=>x&&typeof x==='object'):[];
  if(!planned||!sets.length)continue;
  const conv=planned.load.convention,raw=sets.map(x=>typeof x.load==='number'?x.load:x.load?.value).filter(Number.isFinite);
  // Unit and convention decide whether a value can be read; its size is judged later (an implausible value is asked, not unknown).
  const read=x=>{const l=x.load;if(l===undefined||l===null||conv==='BODYWEIGHT')return {kg:null,unknown:false};if(typeof l==='number')return Number.isFinite(l)?{kg:l,unknown:false}:{kg:null,unknown:true};
   const c=l.convention??conv,u=typeof l.unit==='string'?l.unit.trim().toUpperCase():null;if(c!==conv||!Number.isFinite(l.value))return {kg:null,unknown:true};
   return u==='KG'?{kg:l.value,unknown:false}:u==='LB'?{kg:Math.round(l.value*LB_TO_KG*2)/2,unknown:false}:{kg:null,unknown:true};};
  const readings=sets.map(read),unitUnknown=readings.some(r=>r.unknown);
  // A set without a repetition count is unknown, not zero repetitions: the target is then neither met nor missed (R7-A; gates.missingLogs).
  const loads=unitUnknown?[]:readings.map(r=>r.kg).filter(Number.isFinite),rirs=sets.map(x=>x.rir).filter(Number.isFinite),reps=sets.map(x=>x.reps).filter(x=>Number.isFinite(x)&&x>=0),repsKnown=reps.length===sets.length;
  const shortfall=sets.length<planned.sets||reps.some(x=>x<planned.reps);
  out[e.id]={load:loads.length?Math.max(...loads):null,loggedRaw:raw.length?Math.max(...raw):null,unitUnknown,convention:conv,reps:repsKnown?Math.min(...reps):null,setsDone:sets.length,plannedSets:planned.sets,plannedReps:planned.reps,plannedRir:planned.rir,minRir:rirs.length?Math.min(...rirs):null,repsMet:shortfall?false:repsKnown?true:null};
 }
 return out;
}
/** Athlete confirmations of a logged load (SSCTR D45): {exerciseId, value, unit KG or LB, convention}. Anything else confirms nothing. */
function loadConfirmationsOf(list){
 const out={};
 for(const c of Array.isArray(list)?list:[]){
  if(!c||typeof c!=='object'||typeof c.exerciseId!=='string')continue;
  const kg=toKilograms({value:c.value,unit:c.unit,convention:c.convention});
  if(kg?.unit==='KG')out[c.exerciseId]={kg:kg.value,convention:kg.convention};
 }
 return out;
}
const confirmationFor=(confirmations,id,l)=>{const c=confirmations?.[id];return c&&c.convention===l.convention?c:null;};
const WHY_NOT_USED={LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET:'it is above the plan and the target reps or reps in reserve were not met, so the planned load stays',ESTABLISHMENT_LOG_UNCONFIRMED:'a first logged load becomes your reference only once you confirm it or log it again'};
/**
 * Logged loads that were not adopted as the next reference are asked about (QRE-R6-02; SSCTR D44, D45). Built after the
 * decision: with gates, each question follows the transition's own adoption rule; before the week is gated the target
 * criterion is not judged. A confirmed value is reported as confirmed, never asked again. Every logged value is checked; only
 * the deciding log of an exercise (the week's last usable one) can leave it waiting for confirmation.
 */
function loggedLoadQuestions(program,sk,w,ev,{gates=null,confirmations={}}={}){
 const used=usedInWeek(program.weeks[w]),state=program.stateTrace[w]?.strength?.exercises??{},out=[],G=gates?{ALL:'HOLD',...gates}:null,deciding=loggedLoads(ev,confirmations);
 for(const row of ev.rows)for(const [id,l] of Object.entries(row.logs??{})){
  const c=confirmationFor(confirmations,id,l);
  if(l.unitUnknown&&!c){out.push({exerciseId:id,sessionId:row.sessionId,logged:l.loggedRaw,reason:'LOGGED_UNIT_OR_CONVENTION_UNKNOWN',question:`Confirm the load logged for ${id}: its unit or convention is not the planned one, so it was not used`});continue;}
  // The question judges a log against the exposure it was logged in, as the transition does (SSCTR D44; R7-A).
  const u=used.find(x=>x.id===id&&x.session===row.sessionId)??used.find(x=>x.id===id),load=c?c.kg:l.load;if(!u||!Number.isFinite(load))continue;
  const k=G?G[id]??G.STRENGTH??G.ALL:null,own=deciding[id]?.sessionId===row.sessionId;
  const d=loggedLoadDecision(sk.op.strength,adoptionBasis(state[id],u),u,{load,convention:l.convention,confirmed:!!c,earlier:own?deciding[id].earlier:null},{advanced:k?['ADVANCE','EARNED'].includes(k):null,hint:sk.cap?.strength?.loadHints?.[id]??null});
  if(d.adopted&&!d.capped||d.pending&&!own)continue;
  const kg=`${load} kg${l.convention==='PER_HAND'?' per hand':''}`;
  out.push({exerciseId:id,sessionId:row.sessionId,logged:load,planned:d.planned??null,reason:d.reason,...(c?{confirmed:true}:{}),question:`${c?'The confirmed':'Confirm the'} ${kg} ${c?'for':'logged for'} ${id}${d.planned!=null?` (planned ${d.planned} kg)`:''}: ${d.capped?'the next load stays at the earlier ceiling':WHY_NOT_USED[d.reason]??'it was not used to set the next load'}`});
 }
 return out;
}
/** A future known load that differs from the plan is a modification, not an instantiation of a placeholder. */
const knownLoadsChanged=(a,b,from)=>{const old=new Map(a.weeks.filter(w=>w.index>=from).flatMap(w=>w.sessions.filter(s=>s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='KNOWN').map(e=>[s.id+':'+e.id,e.load.value]))));return b.weeks.filter(w=>w.index>=from).some(w=>w.sessions.some(s=>(s.prescription?.exercises??[]).some(e=>e.load.mode==='KNOWN'&&old.has(s.id+':'+e.id)&&old.get(s.id+':'+e.id)!==e.load.value)));};
/** Comparable phase class of a week; return and restart periods form their own class. */
export function phaseClassOf(policy,phase,mode){
 if(['RETURN','RESTART'].includes(mode))return 'RETURN';
 for(const [cls,list] of Object.entries(policy.operational.learning.comparablePhaseClasses))if(list.includes(phase))return cls;
 return phase;
}
/** Dose key: family plus ladder and step for quality, family for other runs, the planned prescription for strength. */
export const doseKeyOf=s=>!s?.prescription?null:s.sport==='RUN'?(s.role==='QUALITY'?`${s.prescription.family}:${s.progression?.ladder??'-'}:${s.progression?.value??'-'}`:s.prescription.family):s.plannedPrescriptionHash??null;
const modeOf=(program,s)=>s.sport==='RUN'?program.stateTrace[s.weekIndex]?.run?.mode??'EASY':Object.values(program.stateTrace[s.weekIndex]?.strength?.exercises??{}).some(e=>Number.isInteger(e.returnStep))?'RETURN':'NORMAL';
function bindObservations(program,accepted,hybrid,policy){
 const sessions=new Map(program.weeks.flatMap(w=>w.sessions.map(s=>[s.id,{s,w}]))),bound=[],unbound=[];
 for(const o of accepted){
  const x=sessions.get(o.sessionId);
  if(!x||!x.s.prescription){unbound.push({...o,context:{sessionType:x?'REST_BY_DESIGN':'UNPLANNED'},comparable:false});continue;}
  // A race's duration is the event window (operational.event.raceDay), not a target: a finished race is complete however fast (R7-A).
 const {s,w}=x,p=s.prescription,minutesOk=s.sport==='STRENGTH'||s.role==='RACE'||!Number.isFinite(o.actual.minutes)||o.actual.minutes>=0.9*p.durationMinutes;
  const logs=s.sport==='STRENGTH'?strengthLogs(o,s):{},setsOk=s.sport!=='STRENGTH'||!Object.keys(logs).length||Object.values(logs).every(l=>l.setsDone>=l.plannedSets);
  const complete=o.actual.completed===true&&minutesOk&&setsOk;
  bound.push({...o,partial:!complete,comparable:o.comparable!==false&&complete&&o.confounded!==true,confounded:o.confounded===true,logs,context:{sessionId:s.id,sessionType:sessionType(s),sport:s.sport,role:s.role,family:p.family,doseKey:doseKeyOf(s),runMinutes:runMinutesOf(s)||null,mode:modeOf(program,s),phaseClass:phaseClassOf(policy,w.phase,modeOf(program,s)),weekIndex:w.index,phase:w.phase,arrangementId:w.arrangementId,plannedHash:s.plannedPrescriptionHash,plannedMinutes:p.durationMinutes,dateShift:dayGap(s.date,o.localDate),interferenceBefore:interferenceBefore(program,s,hybrid)}});
 }
 return {bound,unbound};
}
const kindOf=o=>o.partial?'PARTIAL':o.confounded?'CONFOUNDED':classify(o);
function weekEvidence(program,w,asOfLocal,ledger,quarantined){
 const week=program.weeks[w];
 const rows=(week?.sessions??[]).filter(s=>s.prescription).map(s=>{
  const obs=ledger.filter(o=>o.sessionId===s.id),latest=obs.at(-1)??null,conflicted=quarantined.includes('session:'+s.id);
  const status=conflicted?'CONFLICTED':latest?(latest.partial?'PARTIAL':'COMPLETED'):s.date<asOfLocal?'MISSED':s.date===asOfLocal?'NOT_REPORTED':'PENDING';
  return {sessionId:s.id,sport:s.sport,role:s.role,key:s.key,optional:s.optional,date:s.date,status,kind:latest?kindOf(latest):null,eventId:latest?.eventId??null,logs:latest?.logs??{},exercises:s.sport==='STRENGTH'?s.prescription.exercises.map(e=>e.id):[]};
 });
 const adverse=rows.filter(r=>r.kind==='ADVERSE');
 return {week:w,rows,completed:rows.filter(r=>r.status==='COMPLETED').length,missed:rows.filter(r=>['MISSED','NOT_REPORTED'].includes(r.status)).length,partial:rows.filter(r=>r.status==='PARTIAL').length,pending:rows.filter(r=>r.status==='PENDING').length,conflicted:rows.filter(r=>r.status==='CONFLICTED').length,adverseSessions:adverse.length,systemicConvergence:new Set(adverse.map(r=>r.sport)).size>1||adverse.length>=3};
}
/** Ledger-based recent counts (operational completed-work record; learning consent governs only the athlete model). */
function recent(ledger,type,asOf,days,{since=null,pool=null,surplusOutsideConsolidation=false}={}){
 const rows=ledger.filter(o=>o.context?.sessionType===type&&(!pool||o.context.phaseClass===pool)&&Date.parse(asOf)-Date.parse(o.observedAt)<=days*86400000&&Date.parse(o.observedAt)<=Date.parse(asOf)&&(!since||Date.parse(o.observedAt)>Date.parse(since)));
 const kinds=rows.map(kindOf),surplusRows=rows.filter((o,i)=>kinds[i]==='SURPLUS'&&!(surplusOutsideConsolidation&&o.context.phase==='CONSOLIDATION')),surplusTimes=surplusRows.map(o=>Date.parse(o.observedAt));
 return {adverse:kinds.filter(k=>k==='ADVERSE').length,surplus:surplusRows.length,compatible:kinds.filter(k=>k==='COMPATIBLE').length,conflicting:kinds.filter(k=>k==='CONFLICTING').length,span:surplusTimes.length?(Math.max(...surplusTimes)-Math.min(...surplusTimes))/86400000:0};
}
const lastRegression=(program,key)=>program.decisions.filter(d=>d.gates?.[key]==='REGRESS').map(d=>d.asOf).sort().at(-1)??null;
const lastReturn=program=>program.decisions.filter(d=>d.action==='REESTABLISH').map(d=>d.asOf).sort().at(-1)??null;
const later=(a,b)=>!a?b:!b?a:Date.parse(a)>=Date.parse(b)?a:b;
/**
 * Gates for the transition after week w: per run role and per strength exercise. EARNED is one step and is unavailable in
 * walk/jog, restart and return; surplus counts only comparable observations of the same phase class since the last return,
 * outside consolidation weeks. A strength step needs a logged set meeting the target with reserve at or above the
 * prescribed RIR minus one; without a log the dose holds.
 */
function weeklyGates(program,sk,w,ev,ledger,asOf,{systemic=false}={}){
 const L=sk.op.learning,SG=sk.op.strength.gates,gates={},reasons=[],phase=sk.plan.phases[w],nearEvent=['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'].includes(sk.plan.phases[w+1])||['TAPER','RACE_WEEK','POST_EVENT'].includes(phase);
 const setGate=(key,value,why)=>{gates[key]=value;reasons.push({key,gate:value,why});};
 const runState=program.stateTrace[w]?.run,mode=runState?.mode??'EASY',noEarned=['WALK_JOG','RESTART','RETURN'].includes(mode),returnStart=lastReturn(program);
 const runPool=phaseClassOf(sk.authority.policy,phase,mode);
 for(const [role,key] of Object.entries(RUN_GATE_ROLE)){
  const rows=ev.rows.filter(r=>r.sport==='RUN'&&r.role===role);if(!rows.length)continue;
  const gateKey=mode==='RESTART'||mode==='RETURN'?'EASY':key;
  const type='RUN:'+role,r=recent(ledger,type,asOf,L.repeatedAdverseWindowDays,{since:later(lastRegression(program,gateKey),returnStart),pool:runPool}),s21=recent(ledger,type,asOf,21,{since:returnStart,pool:runPool,surplusOutsideConsolidation:true});
  if(rows.some(x=>['MISSED','NOT_REPORTED','PARTIAL','CONFLICTED','PENDING'].includes(x.status))){setGate(gateKey,'HOLD',`${role}: not executed as planned this week (${rows.map(x=>x.status).join(',')}); repeat the dose, no debt`);continue;}
  if(r.adverse>=L.repeatedAdverseForRegression){setGate(gateKey,'REGRESS',`${role}: ${r.adverse} comparable adverse responses within ${L.repeatedAdverseWindowDays} days`);continue;}
  if(rows.some(x=>x.kind==='ADVERSE'||x.kind==='CONFLICTING')){setGate(gateKey,'HOLD',`${role}: one adverse or conflicting response is a signal, not a trend; repeat the dose`);continue;}
  if(!noEarned&&s21.surplus>=L.earnedProgressionSessions&&s21.span>=7&&!s21.adverse&&!s21.conflicting&&DEVELOPMENT.includes(phase)&&!nearEvent){setGate(gateKey,'EARNED',`${role}: ${s21.surplus} comparable easier-than-target executions over ${Math.round(s21.span)} days; one extra step`);continue;}
  setGate(gateKey,'ADVANCE',`${role}: executed without adverse signal`);
 }
 // Repetitions not logged are unknown (repsMet null): neither a met nor a missed target (R7-A; gates.missingLogs "HOLD without regression").
 const below=l=>l.repsMet===false||Number.isFinite(l.minRir)&&Number.isFinite(l.plannedRir)&&l.minRir<l.plannedRir-SG.advanceMinimumLoggedRirBelowPrescribed;
 const surplus=l=>l.repsMet===true&&Number.isFinite(l.minRir)&&Number.isFinite(l.plannedRir)&&l.minRir>=l.plannedRir+SG.earnedLoggedRirAbovePrescribed;
 for(const row of ev.rows.filter(x=>x.sport==='STRENGTH'))for(const id of row.exercises){
  if(gates[id]&&gates[id]!=='ADVANCE')continue;
  const exState=program.stateTrace[w]?.strength?.exercises?.[id],returning=Number.isInteger(exState?.returnStep);
  const since=later(lastRegression(program,id),returnStart),type='STRENGTH:'+row.role.replace('STRENGTH_',''),log=row.logs[id],hist=ledger.filter(o=>o.logs?.[id]&&Date.parse(asOf)-Date.parse(o.observedAt)<=L.repeatedAdverseWindowDays*86400000&&(!since||Date.parse(o.observedAt)>Date.parse(since)));
  const missedReps=hist.filter(o=>below(o.logs[id])).length,easy=hist.filter(o=>surplus(o.logs[id])&&o.context?.phase!=='CONSOLIDATION').length,adverse=recent(ledger,type,asOf,L.repeatedAdverseWindowDays,{since}).adverse;
  if(['MISSED','NOT_REPORTED','PARTIAL','CONFLICTED','PENDING'].includes(row.status)){setGate(id,'HOLD',`${id}: session ${row.status.toLowerCase()}; repeat`);continue;}
  if(missedReps>=2||adverse>=L.repeatedAdverseForRegression){setGate(id,'REGRESS',`${id}: repeated missed reps, reserve below the prescription, or adverse response`);continue;}
  if(!log){setGate(id,'HOLD',`${id}: no logged set this week; the dose holds until a logged set supports a step`);continue;}
  if(!below(log)&&row.kind!=='ADVERSE'&&log.repsMet===null){setGate(id,'HOLD',`${id}: repetitions not logged; the dose holds (missing repetitions are not a missed target)`);continue;}
  if(!below(log)&&row.kind!=='ADVERSE'&&!Number.isFinite(log.minRir)){setGate(id,'HOLD',`${id}: reps in reserve not logged; the dose holds (missing effort is not an adverse signal)`);continue;}
  if(below(log)||row.kind==='ADVERSE'){setGate(id,'HOLD',`${id}: target not met with at least the prescribed reserve minus one; repeat`);continue;}
  if(!returning&&easy>=SG.earnedComparableExposures&&DEVELOPMENT.includes(phase)&&!nearEvent){setGate(id,'EARNED',`${id}: target met with at least ${SG.earnedLoggedRirAbovePrescribed} more reps in reserve than prescribed, ${easy} times`);continue;}
  setGate(id,'ADVANCE',`${id}: logged target met with the prescribed reserve`);
 }
 if(systemic){for(const k of Object.keys(gates))if(gates[k]==='ADVANCE'||gates[k]==='EARNED')gates[k]='HOLD';reasons.push({key:'ALL',gate:'HOLD',why:'Converging adverse signals across sessions: hold every step this week'});}
 return {gates,reasons};
}
/** Athlete-specific association: key runs repeatedly adverse after one preceding-session cause, compatible without it. Never causal. */
export function learnedInterference(ledger,asOf,{windowDays=28,minAdverse=2,minCompatible=1}={}){
 const rows=ledger.filter(o=>['RUN:QUALITY','RUN:LONG'].includes(o.context?.sessionType)&&o.context.phaseClass==='BUILD'&&o.comparable&&Date.parse(asOf)-Date.parse(o.observedAt)<=windowDays*86400000);
 const causes=[...new Set(rows.flatMap(o=>o.context.interferenceBefore??[]))],out=[];
 for(const cause of causes){
  const withCause=rows.filter(o=>(o.context.interferenceBefore??[]).includes(cause)),without=rows.filter(o=>!(o.context.interferenceBefore??[]).includes(cause));
  const adverse=withCause.filter(o=>kindOf(o)==='ADVERSE'),good=without.filter(o=>['COMPATIBLE','SURPLUS'].includes(kindOf(o))),badWithout=without.filter(o=>kindOf(o)==='ADVERSE');
  const span=adverse.length?(Math.max(...adverse.map(o=>Date.parse(o.observedAt)))-Math.min(...adverse.map(o=>Date.parse(o.observedAt))))/86400000:0;
  if(adverse.length>=minAdverse&&span>=7&&good.length>=minCompatible&&!badWithout.length&&withCause.every(o=>kindOf(o)!=='COMPATIBLE'))out.push({cause,adverseWith:adverse.length,compatibleWithout:good.length,spanDays:span,sourceEventIds:[...adverse,...good].map(o=>o.eventId),causal:false});
 }
 return out;
}
// A logged set is step evidence when its load is known in kilograms, or for a bodyweight row (no external load); a load in an unknown unit is not.
// The week's last usable log of an exercise decides; an earlier one in the same week travels with it as `earlier`, and an athlete
// confirmation in the planned convention replaces the logged value (SSCTR D45). A conflicted report is no evidence until it is
// corrected: it neither sets nor confirms a load (QRE-R6-14; author-found with SSCTR D52).
const loggedLoads=(ev,confirmations={})=>{const out={};for(const r of ev.rows.filter(x=>x.status!=='CONFLICTED'))for(const [id,l] of Object.entries(r.logs??{})){const c=confirmationFor(confirmations,id,l),earlier=Number.isFinite(out[id]?.load)?out[id].load:null;if(c)out[id]={load:c.kg,convention:l.convention,reps:l.reps,confirmed:true,earlier,sessionId:r.sessionId};else if(Number.isFinite(l.load)||!l.unitUnknown&&l.convention==='BODYWEIGHT')out[id]={load:Number.isFinite(l.load)?l.load:null,convention:l.convention,reps:l.reps,earlier,sessionId:r.sessionId};}return out;};
/**
 * Completed runs for the single-run ceiling (R6-PLANNED-PROGRESSION): executed runs from the completed-work ledger and,
 * while it is recent, the longest current run the athlete reported at intake. Walk/jog counts its jogging minutes.
 */
export function completedRuns(program,ledger,extra=[]){
 const out=[],cap=program.capability;
 if(['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap.run.class)&&Number.isFinite(cap.run.longestMinutes))out.push({date:program.canonical.asOf,minutes:cap.run.longestMinutes,source:'INTAKE_REPORTED_LONGEST'});
 for(const o of ledger){
  const planned=o.context?.runMinutes;if(o.context?.sport!=='RUN'||!planned||!o.actual)continue;
  if(!(o.actual.completed===true||Number.isFinite(o.actual.minutes)&&o.actual.minutes>0))continue;
  out.push({date:o.localDate,minutes:o.context.family==='WALK_JOG'?planned:Number.isFinite(o.actual.minutes)?o.actual.minutes:planned,source:'LEDGER',eventId:o.eventId});
 }
 return [...out,...extra];
}
// ---------- proposal mechanics ----------
/**
 * The local date each exercise was last performed in the reviewed week (SSCTR D52), and the sessions that performed it: a completed or
 * partial execution report of a session that prescribed it and lists it with at least one set; a completed report without exercise
 * details counts for every exercise of its session. A missed, pending or conflicted session performs nothing.
 */
function performedInWeek(ev,ledger){
 const out={},byEvent=new Map(ledger.map(o=>[o.eventId,o]));
 for(const r of ev.rows){
  if(r.sport!=='STRENGTH'||!['COMPLETED','PARTIAL'].includes(r.status))continue;
  const listed=Object.keys(r.logs??{}),ids=listed.length?listed:r.status==='COMPLETED'?r.exercises:[],date=byEvent.get(r.eventId)?.localDate??r.date;
  for(const id of ids){const o=out[id]??={date:null,sessions:[]};if(!(o.date>=date))o.date=date;o.sessions.push(r.sessionId);}
 }
 return out;
}
/**
 * The start of next week from this week's evidence (R7-A.1 C3): the transition of the week as it now stands, gated by its executed sessions,
 * into next week's context. The weekly review's rule; every other handler applies it once the week is complete. `gates` are the caller's
 * when it computed them.
 */
// The weekly review's inputs, read alike by every handler that starts next week from the week's evidence (R7-A.1 C3, QE-R7A1-02): the
// systemic determination (a signal recorded on the week, or converging reports) and every load confirmation the week's reviews carried.
const systemicOf=ctx=>!!ctx.ev.systemicConvergence||(ctx.program.weeks[ctx.w]?.adaptations??[]).some(a=>a.kind==='SYSTEMIC_SIGNAL');
const confirmationsOf=ctx=>Object.assign({},...(ctx.program.weeks[ctx.w]?.adaptations??[]).filter(a=>a.kind==='LOAD_CONFIRMATIONS').map(a=>a.confirmations),ctx.confirmations);
const reviewGates=(ctx,{systemicSignal=false}={})=>weeklyGates(ctx.program,ctx.sk,ctx.w,ctx.ev,ctx.ledger,ctx.asOf,{systemic:systemicSignal||systemicOf(ctx)});
function evidenceStart(ctx,program,skn,{gates=null}={}){
 const {w}=ctx,g=gates??reviewGates(ctx).gates,evidenceGates={ALL:'HOLD',...g};
 return {runState:advanceRun(skn,program.stateTrace[w].run,w,evidenceGates),strengthState:advanceStrength(skn,program.stateTrace[w].strength,w,usedInWeek(program.weeks[w]),evidenceGates,loggedLoads(ctx.ev,confirmationsOf(ctx)),{performed:performedInWeek(ctx.ev,ctx.fullLedger??ctx.ledger)})};
}
const evidenceRule=ctx=>(view,skn)=>evidenceStart(ctx,view,skn);
function finishProposal(program,sk,next,decision){
 const proposal=clone(program);proposal.weeks=next.weeks;proposal.stateTrace=next.stateTrace??program.stateTrace;
 // The earlier contexts still in force for some weeks travel with the program (R7-A.1 C2).
 if('contextBefore' in next){if(next.contextBefore)proposal.contextBefore=clone(next.contextBefore);else delete proposal.contextBefore;}
 if(next.schedule)proposal.schedule=clone(next.schedule);if(next.canonical)proposal.canonical=clone(next.canonical);if(next.templates)proposal.templates=clone(next.templates);if(next.arrangementSessions){proposal.arrangementSessions=clone(next.arrangementSessions);proposal.arrangement=Object.fromEntries(Object.entries(next.arrangementSessions).map(([k,v])=>[k,{id:v.id,quality:v.quality,perm:v.perm,runFirstOnShared:v.runFirstOnShared}]));}if(next.phases)proposal.phases=clone(next.phases);if(next.negotiation)proposal.negotiation=clone(next.negotiation);if(next.blocks)proposal.blocks=clone(next.blocks);if(next.goal)proposal.goal=clone(next.goal);
 // The completion negotiation follows the proposal's own race-week state, so a restart or a goal change applied by a review carries it (SSCTR D47).
 const rw=proposal.phases?.raceWeek,raceState=proposal.goal?.run?.event&&Number.isInteger(rw)?proposal.stateTrace[rw]?.run:null;
 const item=raceState?eventCompletionItem({...sk,goal:proposal.goal,plan:proposal.phases},raceState):null,list=proposal.negotiation??[],at=list.findIndex(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');
 if(at>=0||item)proposal.negotiation=at>=0?list.flatMap((n,i)=>i!==at?[n]:item?[item]:[]):[...list,item];
 proposal.revision=program.revision+1;proposal.decisions=[...program.decisions,decision];delete proposal.hash;proposal.hash=programHash(proposal);return proposal;
}
const changedSessions=(a,b)=>{let n=0;const old=new Map(a.weeks.flatMap(w=>w.sessions.map(s=>[s.id,hash(s.prescription)])));for(const w of b.weeks)for(const s of w.sessions)if(old.get(s.id)!==hash(s.prescription))n++;return n;};
function immutabilityErrors(program,next,asOfLocal,ahead=s=>s.date>asOfLocal){
 const errors=[],old=new Map(program.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));
 for(const w of next.weeks)for(const s of w.sessions){const o=old.get(s.id);if(o&&!ahead(o)&&hash(o.prescription)!==hash(s.prescription))errors.push('pastSessionRewritten:'+s.id);}
 for(const [id,o] of old)if(!ahead(o)&&!next.weeks.some(w=>w.sessions.some(s=>s.id===id)))errors.push('pastSessionRemoved:'+id);
 return errors;
}
function horizonSummary(sk,program,next,{w,changed}){
 const before=peakOf(program.weeks),after=peakOf(next.weeks),raceWeek=sk.plan.raceWeek,target=runTarget(sk);
 const lastStrength=weeks=>{const s=[...weeks].reverse().flatMap(x=>x.sessions).find(x=>x.sport==='STRENGTH'&&x.prescription&&x.prescription.exercises.some(e=>e.load.mode==='KNOWN'));return s?Object.fromEntries(s.prescription.exercises.filter(e=>e.load.mode==='KNOWN').map(e=>[e.id,e.load.value])):{};};
 return {H0_SESSION:changed?`${changed} future session prescription(s) differ; completed sessions unchanged`:'No session changes',H1_WEEK:`Week ${w+1}: planned run ${next.weeks[w+1]?.plannedRunMinutes??'-'} min (was ${program.weeks[w+1]?.plannedRunMinutes??'-'}), strength sets ${next.weeks[w+1]?.plannedStrengthSets??'-'} (was ${program.weeks[w+1]?.plannedStrengthSets??'-'})`,H2_BLOCK:`Block ${sk.blocks.find(b=>w+1>=b.startWeek&&w+1<b.endWeekExclusive)?.family??'-'} intent kept: ${BLOCK_INTENT[sk.plan.phases[w+1]]??'end of horizon'}`,H3_GOAL_EVENT:raceWeek!==null?`Long-run peak ${after.long} min (planned ${before.long}, target ${target}); race week ${next.weeks[raceWeek]?.sessions.some(s=>s.role==='RACE')?'intact':'missing'}`:`Final planned known loads ${JSON.stringify(lastStrength(next.weeks))} (planned ${JSON.stringify(lastStrength(program.weeks))}); long run ${after.long} (planned ${before.long})`};
}
// ---------- main ----------
export function evaluateProgram(program,review,options={}){
 const official=clone(review?.officialPlanState??program?.officialPlanState??null);
 const base={runtimeVersion:'R6-1',mode:'SHADOW',applied:false,proposal:null,officialPlanState:official,appliedState:clone(official),completedWork:clone(program?.completedWork??[]),horizonsConsidered:HORIZONS,qualityAssessment:{assessor:'RUNTIME_SELF_CHECK',independent:false,class:'UNREVIEWED'},missingInputs:[],counterfactuals:[]};
 const finish=(status,action,reason,extra={})=>freeze(withReference(program,review,{...base,status,action,reason,...extra}));
 if(!validProgram(program))return finish('HOLD','HOLD','Program integrity or version is invalid');
 const authority=r6Authority(options);
 if(!authority.policy||authority.policyHash!==program.policyHash||!allows(authority,'R6-PLANNED-PROGRESSION'))return finish('UNSUPPORTED','UNSUPPORTED','Current independent program authority is missing or does not match the program policy');
 const errors=[],missing=[],kind=KIND_ALIASES[review?.event?.kind]??review?.event?.kind,tz=program.timezoneOffsetMinutes??0,asOf=utcTimestamp(review?.asOf);
 if(review?.version!==REVIEW_VERSION||review?.synthetic!==true||review?.purpose!=='SHADOW_REFERENCE')errors.push('syntheticReviewContract');
 if(!asOf)errors.push('asOf.timezoneAwareTimestamp');
 if(!review?.event?.id||!REVIEW_KINDS.includes(kind))errors.push('event.id/kind');
 const w=review?.weekIndex,week=program.weeks[w];
 if(!Number.isInteger(w)||!week)errors.push('weekIndex');
 const asOfLocal=asOf?localDate(asOf,tz):null;
 if(week&&asOfLocal&&(asOfLocal<week.startDate||asOfLocal>onDate(week.startDate,6)))errors.push('weekIndex/asOf chronology');
 if(errors.length)return finish('HOLD','HOLD','Review contract or chronology failed validation',{errors});
 const el=review.eligibility&&typeof review.eligibility==='object'?review.eligibility:null;
 // A clinical flag that means yes in any form routes to a human; any other non-boolean flag is asked below (SSCTR R6).
 if(el&&(CLINICAL_KEYS.some(k=>isYes(el[k]))||['CLINICAL','PAIN_OR_INJURY'].includes(typeof el.status==='string'?el.status.trim().toUpperCase():el.status)))return finish('CLINICAL_HUMAN_REQUIRED','CLINICAL_HUMAN_REQUIRED','A current clinical flag routes to qualified human assessment; no dependent prescription or return recipe');
 // An assessment date that is not a date is no assessment at all (QRE-R6-05).
 const assessedDay=dayOf(el?.assessedAt);
 if(!el||el.status!=='NONCLINICAL_CONFIRMED'||!assessedDay||dayGap(assessedDay,asOfLocal)<0||dayGap(assessedDay,asOfLocal)>14||CLINICAL_KEYS.some(k=>typeof el[k]!=='boolean'))missing.push('eligibility.currentAssessment');
 if(missing.length)return finish('ASK','ASK','Current eligibility must be assessed; unknown is neither clearance nor illness',{missingInputs:missing});
 // After the race, redevelopment needs an eligibility and function check dated on or after race day (SSCTR D04).
 const ph=program.phases,raceDate=Number.isInteger(ph?.raceWeek)?onDate(program.startDate,ph.raceWeek*7+ph.raceDay):null;
 if(raceDate&&asOfLocal>=raceDate&&(['RACE_WEEK','POST_EVENT'].includes(ph.phases[w])||ph.phases[w+1]==='NEXT_BLOCK')&&dayGap(raceDate,assessedDay)<0)return finish('ASK','ASK','After the race, an eligibility and function check dated on or after race day is needed before the next steps',{missingInputs:['eligibility.assessedOnOrAfterRace']});
 const guard=previousValidity(program,review);
 if(guard)return finish(guard.status,guard.status,guard.reason,{missingInputs:guard.missingInputs??[]});
 if(review.observations!==undefined&&review.observations!==null&&!Array.isArray(review.observations))return finish('HOLD','HOLD','Observations must be a list of execution reports',{errors:['observations.array']});
 if(review.actualLedger!==undefined&&review.actualLedger!==null&&!Array.isArray(review.actualLedger))return finish('HOLD','HOLD','The completed-work ledger must be a list',{errors:['actualLedger.array']});
 if(review.loadConfirmations!==undefined&&review.loadConfirmations!==null&&!Array.isArray(review.loadConfirmations))return finish('HOLD','HOLD','Load confirmations must be a list',{errors:['loadConfirmations.array']});
 const consent=(review.learningConsent??program.learningConsent)===true;
 let model=review.athleteModel;
 if(model!==undefined&&model!==null&&(typeof model!=='object'||!validateLearningModel(model)||model.athleteId!==program.athleteId||Date.parse(model.asOf)>Date.parse(asOf)))return finish('HOLD','HOLD','Athlete model integrity, ownership or clock is invalid');
 let out=null;
 // Any malformed fact inside the review gives a status, never an exception (QRE-R6-10).
 try{
  // Causal provenance: only facts observed and reported by the decision clock count; the actual ledger is append-only.
  const priorLedger=Array.isArray(review.actualLedger)?clone(review.actualLedger):[];
  const n=normalizeObservations(review.observations??[],{athleteId:program.athleteId,asOf,prior:priorLedger,maximumAgeDays:36500,futureSkewSeconds:authority.policy.operational.learning.futureClockSkewSeconds,timezoneOffsetMinutes:tz,loadIncrements:authority.policy.operational.strength.smallestIncrement});
  const {bound,unbound}=bindObservations(program,n.accepted,authority.policy.operational.hybrid,authority.policy),ledger=[...bound,...unbound];
  // Conflicted facts stay in the record but never count for gating counts, capacity or learning until corrected (QRE-R6-14).
  const usable=ledger.filter(o=>!o.conflicted),usableBound=bound.filter(o=>!o.conflicted);
  model=model??createLearningModel({athleteId:program.athleteId,purposeAllowed:consent,asOf,policy:authority.policy.operational.learning});
  if(allows(authority,'R6-PARTIAL-NOISY-LEARNING'))model=updateLearningModel(model,usableBound,{asOf,purposeAllowed:consent,timezoneOffsetMinutes:tz});
  const sk=skeletonOf(program,authority),ev=weekEvidence(program,w,asOfLocal,bound,n.quarantinedIdentities);
  const confirmations=loadConfirmationsOf(review.loadConfirmations);
  // The carried record is append-only: facts a correction replaced travel with it as inert history (R7-A).
  out={...base,updatedModel:model,actualLedger:[...ledger,...n.supersededRows],provenance:{excluded:n.excluded,duplicates:n.duplicates,conflicts:n.conflicts,superseded:n.superseded,causalCutoff:n.causalCutoff},weekEvidence:ev,loadQuestions:[],inputHash:hash({programHash:program.hash,review})};
  const ctx={program,sk,review,kind,w,week,asOf,asOfLocal,ev,ledger:usable,fullLedger:ledger,quarantined:n.quarantinedIdentities,model,consent,authority,out,confirmations,completedRuns:completedRuns(program,usable)};
  // This week's own context (R7-A.1 C2), the one test of what is still ahead (C1) and the day of a return reported this week (C5).
  Object.assign(ctx,{skw:sk.at(w)??sk,ahead:aheadOf(ctx),returned:returnOf(program,w)});
  // A review's load confirmations are facts of its week, recorded on it so every later handler reads them as this review does (QE-R7A1-02).
  if(Object.keys(confirmations).length)ctx.program={...program,weeks:program.weeks.map((x,i)=>i!==w?x:{...x,adaptations:[...(x.adaptations??[]),adaptation(ctx,'LOAD_CONFIRMATIONS',{confirmations})]})};
  // Training before the latest interruption that its return did not read is confirmed first (R7-A final I6); a return report decides it itself.
  const decision=(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(ctx))||(HANDLERS[kind]??weeklyReview)(ctx);
  // Load questions follow the decision's own gates, so they never contradict the adoption the transition made (SSCTR D44).
  out.loadQuestions=loggedLoadQuestions(program,sk,w,ev,{gates:decision.gates??null,confirmations:confirmationsOf(ctx)});
  if(decision.proposal){
   const from=decision.proposal.decisions.at(-1)?.fromWeek??w;
   const ahead=ctx.ahead,kept=new Map(program.weeks.flatMap(x=>x.sessions).filter(s=>!ahead(s)).map(s=>[s.id,hash(s.prescription)])),history=new Set(decision.proposal.weeks.flatMap(x=>x.sessions).filter(s=>kept.get(s.id)===hash(s.prescription)).map(s=>s.id));
   // Each week is validated under its own context (C2), and an event is never planned twice: at most one race still ahead (C5, C7).
   const races=decision.proposal.weeks.flatMap(x=>x.sessions).filter(s=>s.role==='RACE'&&s.prescription&&s.status!=='SKIPPED'&&ahead(s));
   const v=[...validateWeeks(skeletonOf(decision.proposal,authority),decision.proposal.weeks.filter(x=>x.index>=from),{history}),...immutabilityErrors(program,decision.proposal,asOfLocal,ahead),...(races.length>1?['duplicateRace:'+races.map(s=>s.id).join('+')]:[])];
   if(v.length)return finish('UNSUPPORTED','UNSUPPORTED','Counterfactual failed complete validation; no partial change is presented as valid',{...out,errors:v,counterfactuals:decision.counterfactuals??[]});
  }
  const status=decision.status??(decision.proposal&&!decision.instantiationOnly?'MODIFY':decision.action==='ASK'?'ASK':'KEEP');
  return finish(status,decision.action,decision.reason,{...out,proposal:decision.proposal??null,disclosures:decision.disclosures??[],learnedPatterns:decision.learnedPatterns??null,substitutions:decision.substitutions??null,instantiationOnly:!!decision.instantiationOnly,gates:decision.gates??null,counterfactuals:decision.counterfactuals??[],horizons:decision.horizons??null,missingInputs:decision.missingInputs??[],question:decision.question??null,trace:{sourceProgramHash:program.hash,reviewHash:hash(review),policyHash:authority.policyHash,modelBeforeHash:review.athleteModel?.hash??null,modelAfterHash:model.hash,ledgerSize:ledger.length,authoritySplit:'Reusable boundaries constrain; coaching compares concrete feasible options',noCausalClaim:true},nextObservation:decision.nextObservation??'Record actual execution, effort if known and next-day function; the next step advances only on that evidence'});
 }catch(e){return finish('HOLD','HOLD','Malformed review facts: '+e.message,{...(out??{}),errors:['malformed:'+(e?.constructor?.name??'Error')]});}
}
const dayOf=v=>typeof v==='string'&&isoDay(v.slice(0,10))?v.slice(0,10):null;
// ---------- handlers ----------
/** End-of-week (or any) review: the next week's steps are gated by this week's evidence. */
function weeklyReview(ctx,{extraReason=null,systemicSignal=false}={}){
 const {program,sk,w,ev,ledger,asOf}=ctx;
 if(w+1>=program.weeks.length)return {action:'KEEP',reason:'Final week of the horizon; record outcomes for the next program',counterfactuals:[counter('KEEP','KEEP',true,'No further planned week')]};
 const systemic=systemicSignal||systemicOf(ctx);
 // An athlete-specific pattern is learning: without learning consent it never changes the plan (QRE-R6-16).
 if(!ev.pending&&ctx.consent===true&&allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING')&&allows(ctx.authority,'R6-HYBRID-ARRANGEMENT')){
  const patterns=learnedInterference(ledger,asOf);
  if(patterns.length){
   const athleteSeverity=Object.fromEntries(patterns.map(x=>[x.cause,'HIGH']));
   const r=rebuild(ctx,{reason:'Learned athlete-specific pattern: '+patterns.map(x=>`${x.adverseWith} adverse key runs after "${x.cause.toLowerCase()}", ${x.compatibleWithout} compatible without it`).join('; ')+'. The arrangement changes for future weeks at the same doses (association, not causation).',action:'LEARNED_REARRANGEMENT',athleteSeverity});
   if(r.proposal&&hash(r.proposal.arrangementSessions)!==hash(program.arrangementSessions))return {...r,learnedPatterns:patterns};
  }
 }
 if(ev.pending)return {action:'KEEP',reason:(extraReason?extraReason+'; ':'')+'next-week steps are gated when this week’s remaining sessions are complete',counterfactuals:[counter('KEEP','KEEP',true,'Smallest effective decision mid-week',{selected:true}),counter('EARLY_GATE','HOLD_NEXT_STEP',false,'Gating before the week ends would treat future sessions as missed')]};
 const {gates,reasons}=weeklyGates(program,sk,w,ev,ledger,asOf,{systemic});
 const logs=loggedLoads(ev,confirmationsOf(ctx)),allAdvance=Object.values(gates).every(g=>g==='ADVANCE');
 const rebased=rebasedNext(program,w),skn=sk.at(w+1)??sk;
 // A dimension with no executed session this week has no gate: it holds, it never counts as executed (QRE-R6-04).
 const nextState=rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:evidenceStart(ctx,program,skn,{gates});
 // A return's re-base stays next week's start; otherwise the review's evidence sets it (R7-A.1 C3).
 const projected=composeWeeks(ctx,program,{fromWeek:w+1,start:nextState});
 if(projected.ask)return {action:'ASK',reason:projected.ask,missingInputs:projected.missingInputs};
 const changed=changedSessions(program,projected);
 // An unconfirmed establishment load lives only in the state: a new or changed pending value needs a proposal to reach the next review (SSCTR D45).
 const pending=Object.keys(logs).filter(id=>Number.isFinite(nextState.strengthState.exercises[id]?.pendingLoad)),pendingMoved=pending.some(id=>nextState.strengthState.exercises[id].pendingLoad!==program.stateTrace[w+1]?.strength?.exercises?.[id]?.pendingLoad);
 const keepOk=(allAdvance||!!rebased)&&!changed&&!pendingMoved,knownChanged=allAdvance&&changed>0&&knownLoadsChanged(program,projected,w+1);
 const keep=counter('KEEP','KEEP',keepOk,keepOk?'Every gated session executed without adverse signal: the planned next step stands':allAdvance?'Logged loads differ from the planned loads or placeholders; keeping them would ignore executed evidence':'Planned next step would advance work that was not executed or tolerated as planned',{h3Loss:0,changeCount:0,order:0});
 const gated=counter('GATED_NEXT_STEP',allAdvance?(knownChanged?'ADOPT_LOGGED_LOADS':Object.keys(logs).length?'INSTANTIATE_LOGGED_LOADS':'KEEP'):'HOLD_OR_REGRESS_NEXT_STEP',true,'Smallest valid change: repeat or step back only the affected session types; everything else proceeds',{changeCount:changed,order:1,gates});
 const replan=counter('REBASE_BLOCK','LARGER_REPLAN',systemic&&Object.values(gates).filter(g=>g==='REGRESS').length>=2,'A wider rebase is justified only by repeated converging adverse evidence',{changeCount:changed+3,order:2});
 if(keepOk)return {action:'KEEP',reason:extraReason??(rebased&&!allAdvance?'The return reported this week already plans next week; this review keeps it':'Executed as planned without adverse signal; the planned progression step stands'),gates,counterfactuals:[{...keep,selected:true},{...gated,admissible:false,reason:'No difference from the plan'},replan],nextObservation:'Execute next week as planned; record actual minutes, sets, reps, loads, effort and next-day function'};
 const action=allAdvance?(knownChanged?'ADOPT_LOGGED_LOADS':'INSTANTIATE_LOGGED_LOADS'):'GATED_NEXT_STEP';
 const decision={eventId:ctx.review.event.id,asOf,action,fromWeek:w+1,gates,reasons,horizonsConsidered:HORIZONS};
 const proposal=finishProposal(program,sk,projected,decision);
 const horizons=horizonSummary(sk,program,proposal,{w,changed});
 gated.selected=true;
 const wait=pending.length?`first logged loads wait for confirmation before they become numbers (${pending.join(', ')})`:null,instantiated=Object.keys(logs).some(id=>Number.isFinite(logs[id].load)&&!pending.includes(id));
 const why=extraReason??(action==='ADOPT_LOGGED_LOADS'?'Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time':action==='INSTANTIATE_LOGGED_LOADS'?(instantiated||!wait?'Logged loads replace planned placeholders; the progression rule is unchanged':'The progression rule is unchanged'):'Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation');
 return {action,instantiationOnly:allAdvance&&!knownChanged,reason:wait?why+'; '+wait:why,proposal,gates,horizons,counterfactuals:[{...keep,whyLost:keep.admissible?null:keep.reason},gated,replan]};
}
function targetSession(ctx){const id=ctx.review.targetSessionId??ctx.review.event.sessionId;return ctx.program.weeks.flatMap(x=>x.sessions).find(s=>s.id===id)??null;}
function missedSession(ctx){
 const {program,sk,w,review}=ctx,target=targetSession(ctx);
 if(!target)return weeklyReview(ctx,{extraReason:'Missed work is recorded as zero; no debt and no compensation'});
 // A session the record shows as done cannot also be missed: ask which is right, never repeat its content (QRE-R6-15).
 if((ctx.fullLedger??ctx.ledger).some(o=>o.sessionId===target.id&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)))return {action:'ASK',reason:'The record already has an execution report for this session; confirm whether it was missed, or correct the report',missingInputs:['observations.correction'],counterfactuals:[counter('MOVE','MOVE',false,'Moving a session that was reported as executed would repeat its content'),counter('ASK','ASK',true,'Contradictory facts are asked about',{selected:true})]};
 const {best,cands}=missedMove({...ctx,sk:ctx.skw},program.weeks[w].sessions,target);
 const gateReview=weeklyReview(ctx,{extraReason:'Missed work is recorded as zero; next step repeats without debt'});
 if(best.action==='MOVE'){
  // The move is an adaptation of this week (R7-A.1 C4): recorded, so a later re-plan of the week applies it again.
  const next=adaptThisWeek(ctx,program,w,best.proposalSessions,adaptation(ctx,'MISSED_SESSION',{sessionId:target.id,slotId:best.id.replace(/^MOVE_TO_/,'')}));
  const proposal=finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'MOVE',fromWeek:w,throughWeek:w,sessionId:target.id,horizonsConsidered:HORIZONS});
  return {action:'MOVE',reason:best.reason,proposal,counterfactuals:cands.map(({proposalSessions,...c})=>c),horizons:{H0_SESSION:'Key stimulus preserved on a later chosen day',H1_WEEK:'No added interference; one easy run is replaced',H2_BLOCK:'Block progression continues',H3_GOAL_EVENT:'Goal trajectory unchanged'}};
 }
 return {...gateReview,action:gateReview.proposal?gateReview.action:'KEEP',reason:'Missed '+target.role.toLowerCase()+': zero work recorded, no debt; '+(gateReview.proposal?'the next comparable step repeats':'nothing else changes'),counterfactuals:[...cands.map(({proposalSessions,...c})=>c),...(gateReview.proposal?(gateReview.counterfactuals??[]).filter(c=>c.id!=='KEEP'):[])]};
}
function performanceSignal(ctx){
 const target=targetSession(ctx),{ledger,asOf,sk}=ctx;
 if(!target){const g=weeklyReview(ctx);return g.proposal?g:{...g,reason:'The report names no session; the plan stays and the next steps are gated on executed sessions. '+(g.reason??'')};}
 const type=sessionType(target),r=recent(ledger,type,asOf,sk.op.learning.repeatedAdverseWindowDays),s21=recent(ledger,type,asOf,21),single=ctx.kind==='UNDERPERFORMANCE'||ctx.kind==='PROGRESSION_NOT_TOLERATED'?r.adverse<sk.op.learning.repeatedAdverseForRegression:s21.surplus<sk.op.learning.earnedProgressionSessions;
 const gateReview=weeklyReview(ctx);
 if(single&&!gateReview.proposal)return {...gateReview,action:'KEEP',reason:(ctx.kind.includes('UNDER')||ctx.kind.includes('NOT_TOLERATED')?'One adverse execution is a signal, not a trend':'One easier execution does not earn an extra step')+'; keep the plan and compare the next execution',counterfactuals:[counter('KEEP','KEEP',true,'Smallest effective decision under single-event evidence',{selected:true}),counter('REGRESS','REGRESS',false,'Repeated comparable adverse responses are required before regression'),counter('EXTRA_PROGRESSION','EARNED',false,'Repeated comparable surplus is required before an extra step')]};
 return gateReview;
}
function fatigue(ctx){
 const {program,sk,w,review}=ctx,week=program.weeks[w],systemic=ctx.kind==='SYSTEMIC_FATIGUE',region=String(review.signals?.region??'LOWER').toUpperCase();
 const sessions=fatigueSessions({...ctx,sk:ctx.skw},week.sessions,{systemic,region});
 const changed=sessions.filter((s,i)=>hash(s)!==hash(week.sessions[i])).length;
 const keep=counter('KEEP','KEEP',!changed,'Nothing affected remains this week; monitor function',{order:0}),reduce=counter(systemic?'REMOVE_REMAINING_HARD_WORK':'REMOVE_AFFECTED_OPTIONAL','REDUCE',changed>0,systemic?'Remove the remaining hard suffix; keep easy participation':'Remove only optional local work for the affected region; essentials stay',{changeCount:changed,order:1}),wider=counter('BLOCK_ADJUSTMENT','LARGER_REPLAN',false,'No evidence yet that a wider change is necessary; repeated converging signals would justify it',{order:2});
 // With nothing left to reduce the report reviews the week with its signal, recorded so that a later review of the week keeps it (R7-A.1 C4).
 if(!changed){const signal=systemic?{...ctx,program:{...program,weeks:program.weeks.map((x,i)=>i!==w?x:{...x,adaptations:[...(x.adaptations??[]),adaptation(ctx,'SYSTEMIC_SIGNAL')]})}}:ctx,g=weeklyReview(signal,{systemicSignal:systemic});return {...g,reason:(systemic?'Converging fatigue signal: ':'Local fatigue: ')+g.reason,counterfactuals:[{...keep,selected:!g.proposal},reduce,wider,...(g.counterfactuals??[])]};}
 // The reduction is an adaptation of this week (R7-A.1 C4): recorded, so a later re-plan of the week applies it again.
 const next=adaptThisWeek(ctx,program,w,sessions,adaptation(ctx,ctx.kind,systemic?{}:{region}));
 reduce.selected=true;
 return {action:'REDUCE',reason:reduce.reason,proposal:finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'REDUCE',fromWeek:w,throughWeek:w,horizonsConsidered:HORIZONS}),counterfactuals:[keep,reduce,wider],horizons:{H0_SESSION:'Remaining affected work reduced',H1_WEEK:'Essential participation kept',H2_BLOCK:'Next week is gated by this week’s evidence at the weekly review',H3_GOAL_EVENT:'No goal change from one fatigue signal'},nextObservation:systemic?'Report function and recovery; if signals persist or include illness, pain or injury, route to qualified assessment':'Report whether local fatigue resolves before the next session of that region'};
}
/**
 * The context of the weeks from `start` after a change of the canonical facts (`canonical` maps them: a schedule or goal change; `goals`
 * when the goal model follows) or of the athlete-specific arrangement evidence: phases (re-planned when the event or the goal kind changes),
 * blocks, templates and one arrangement per phase context of those weeks (R7-A.1 C2). {ask} when the new facts leave no arrangement.
 */
function contextAfter(ctx,base,start,{canonical:change=null,goals=false,athleteSeverity=null,trace},changeStart=start){
 const {program,authority}=ctx,cap=program.capability,canonical=change?change(clone(base.canonical)):base.canonical,goal=goals?buildGoalModel(canonical):base.goal;
 const phases=goal.run.event?.date!==base.goal.run.event?.date||goal.run.kind!==base.goal.run.kind?planPhases({...canonical,goals:{run:{kind:goal.run.kind},strength:{kind:goal.strength.kind},event:goal.run.event}},cap,authority.policy.operational):base.phases;
 // The phases are one timeline of weeks: every context takes them from the change's first week on, whichever weeks it is in force for.
 const mergedPhases={...phases,phases:[...base.phases.phases.slice(0,changeStart),...phases.phases.slice(changeStart)]},blocks=blocksFrom(mergedPhases.phases,goal.priorityByPhase);
 const templates=strengthTemplates(canonical,goal,{knownOnly:!allows(authority,'R6-LOAD-ESTABLISHMENT')});
 const view={...program,canonical,goal,phases:mergedPhases,blocks,templates,arrangementSessions:{}};delete view.contextBefore;
 const sk=skeletonOf(view,authority),severityAuthority=allows(authority,'R6-HYBRID-ARRANGEMENT'),contexts=[...new Set(mergedPhases.phases.slice(start).map((p,i)=>contextOf(mergedPhases.phases,start+i)))],arrangementSessions={};
 for(const context of contexts){
  const candidates=arrangementCandidates(canonical,cap,goal,context,sk,templates),lead=goal.priorityByPhase[context]?.lead??goal.baseLead;
  const doseKey=doseKeyOf(program.weeks[ctx.w]?.sessions.find(s=>s.role==='QUALITY'));
  const pref=ctx.model?.purposeAllowed&&doseKey?preferredArrangement(ctx.model,candidates,{sessionType:'RUN:QUALITY',phaseClass:phaseClassOf(authority.policy,context,'EASY'),doseKey},{asOf:ctx.asOf}):null;
  const choice=chooseBalanced(candidates,{lead,temporaryPreference:canonical.schedule.temporaryPreference??goal.temporaryPreference,severityAuthority,hybrid:authority.policy.operational.hybrid,athleteSeverity,athleteEvidence:pref?.preferredId?pref:null,currentId:base.arrangementSessions?.[context]?.id??null,context:{eventPhase:EVENT_PHASES.includes(context),strengthDevelopment:goal.strength.development,runDevelopment:goal.run.development,runRole:goal.run.kind==='NONE'?'MAINTAIN':'PRIMARY',strengthRole:EVENT_PHASES.includes(context)||goal.strength.kind==='MAINTAIN'?'MAINTAIN':'PRIMARY'}});
  trace.traces[context]={basis:choice.basis,reason:choice.reason,selectedId:choice.selected?.id??null};trace.choices[context]=choice;
  if(choice.askRequired)return {ask:{action:'ASK',reason:'The new agenda creates a genuine run/strength trade-off; a temporary preference is needed',missingInputs:['schedule.temporaryPreference'],question:choice.question,counterfactuals:choice.counterfactuals.slice(0,8)}};
  if(!choice.selected)return {ask:{action:'ASK',reason:'No admissible arrangement for the new agenda',missingInputs:['schedule'],counterfactuals:choice.counterfactuals.slice(0,8)}};
  arrangementSessions[context]=choice.selected;
 }
 trace.contexts.push(...contexts);
 return {canonical,goal,phases:mergedPhases,blocks,templates,arrangementSessions:{...base.arrangementSessions,...arrangementSessions}};
}
/** Re-plans the weeks from `fromWeek` after an agenda, goal or learned-arrangement change: the new context from that week (C2), then the one
 * composition (C1–C6) with the same state machines. */
function rebuild(ctx,{canonical=null,goals=false,fromWeek=ctx.w+1,reason,action,athleteSeverity=null}){
 const {program,authority,review}=ctx,trace={traces:{},choices:{},contexts:[]};
 const changed=withContextChange(ctx,program,fromWeek,(base,start,changeStart)=>contextAfter(ctx,base,start,{canonical,goals,athleteSeverity,trace},changeStart));
 if(changed.ask)return changed.ask;
 const next=changed.program,sk=skeletonOf(next,authority),skn=sk.at(ctx.w+1)??sk;
 const gates=ctx.ev.pending?null:reviewGates(ctx).gates;
 const rebased=fromWeek===ctx.w+1?rebasedNext(program,ctx.w):null;
 // Next week's start follows the one rule (C3): a return's re-base; this week's evidence once it is complete; while it is under way, the
 // conditional plan of this week as planned (as every later week). From this week the composition applies the rule; from a later week the
 // re-plan starts where that week starts.
 const start=fromWeek!==ctx.w+1?null:rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:gates?evidenceStart(ctx,program,skn,{gates}):conditionalNext(ctx,skn,ctx.w,weekAsPlanned(ctx,program,ctx.w));
 const projected=composeWeeks(ctx,next,{fromWeek,start,evidence:evidenceRule(ctx)});
 if(projected.ask)return {action:'ASK',reason:projected.ask,missingInputs:projected.missingInputs};
 const disclosures=arrangementDisclosures(trace.choices),negotiation=[...(program.negotiation??[]).filter(n=>n.id!=='ARRANGEMENT_COST_DISCLOSED'||!trace.contexts.includes(n.context)),...disclosures];
 const fields={weeks:projected.weeks,stateTrace:projected.stateTrace,schedule:next.canonical.schedule,canonical:next.canonical,templates:next.templates,arrangementSessions:next.arrangementSessions,phases:next.phases,blocks:next.blocks,goal:next.goal,negotiation,contextBefore:next.contextBefore??null};
 const applied=fromWeek===ctx.w+1?gates:null;
 const proposal=finishProposal(program,sk,fields,{eventId:review.event.id,asOf:ctx.asOf,action,fromWeek,reason,arrangement:trace.traces,horizonsConsidered:HORIZONS,...(applied?{gates:applied}:{})});
 return {action,reason,proposal,sk,gates:applied,disclosures,counterfactuals:[counter('KEEP','KEEP',false,'The current plan no longer fits the stated facts'),counter(action,action,true,reason,{selected:true,changeCount:changedSessions(program,proposal)})],horizons:horizonSummary(sk,program,proposal,{w:ctx.w,changed:changedSessions(program,proposal)})};
}
/** A schedule change is validated like the intake: unique days 0–6, AM/PM shifts, 10–240 minutes, a long-run day among the run days (QRE-R6-08). */
function scheduleChangeErrors(ch,merged){
 const errors=[],dayList=v=>Array.isArray(v)&&v.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&new Set(v).size===v.length;
 for(const k of ['runDays','strengthDays'])if(ch[k]!==undefined&&!dayList(ch[k]))errors.push(k);
 for(const k of ['runTurn','strengthTurn'])if(ch[k]!==undefined&&ch[k]!==null&&!['AM','PM'].includes(String(ch[k]).toUpperCase()))errors.push(k);
 for(const k of ['runMinutes','strengthMinutes','longRunMinutes'])if(ch[k]!==undefined&&!(typeof ch[k]==='number'&&Number.isFinite(ch[k])&&ch[k]>=10&&ch[k]<=240))errors.push(k);
 if(ch.longRunDay!==undefined&&ch.longRunDay!==null&&!(Number.isInteger(ch.longRunDay)&&(merged?.runDays??[]).includes(ch.longRunDay)))errors.push('longRunDay');
 if(ch.sameTurnConfirmed!==undefined&&typeof ch.sameTurnConfirmed!=='boolean')errors.push('sameTurnConfirmed');
 if(ch.temporaryPreference!==undefined&&ch.temporaryPreference!==null&&!['RUN','STRENGTH','RUN_FIRST','STRENGTH_FIRST'].includes(String(ch.temporaryPreference).toUpperCase()))errors.push('temporaryPreference');
 for(const k of ['from','to'])if(ch[k]!==undefined&&ch[k]!==null&&!isoDay(ch[k]))errors.push(k);
 if(isoDay(ch.from)&&isoDay(ch.to)&&ch.to<ch.from)errors.push('to');
 return errors;
}
const SCHEDULE_KEYS=['runDays','strengthDays','runTurn','strengthTurn','runMinutes','strengthMinutes','longRunDay','longRunMinutes','sameTurnConfirmed','temporaryPreference'];
const mergedSchedule=(s,norm)=>({...clone(s),...Object.fromEntries(SCHEDULE_KEYS.filter(k=>norm[k]!==undefined).map(k=>[k,clone(norm[k])]))});
function normalizedSchedule(schedule){
 schedule.runDays=[...schedule.runDays].sort((a,b)=>a-b);schedule.strengthDays=[...schedule.strengthDays].sort((a,b)=>a-b);
 schedule.sharedDays=schedule.runDays.filter(d=>schedule.strengthDays.includes(d));
 if(schedule.longRunDay!==null&&schedule.longRunDay!==undefined&&!schedule.runDays.includes(schedule.longRunDay))schedule.longRunDay=schedule.runDays.at(-1)??null;
 return schedule;
}
function scheduleChange(ctx){
 const {program,review}=ctx,ch=review.changes;
 if(!ch||typeof ch!=='object'||Array.isArray(ch))return {action:'ASK',reason:'Say which days, shifts or times changed',missingInputs:['changes']};
 const norm={...ch,...(typeof ch.runTurn==='string'?{runTurn:ch.runTurn.toUpperCase()}:{}),...(typeof ch.strengthTurn==='string'?{strengthTurn:ch.strengthTurn.toUpperCase()}:{}),...(typeof ch.temporaryPreference==='string'?{temporaryPreference:ch.temporaryPreference.toUpperCase().replace('_FIRST','')}:{})};
 // The schedule in force where the change starts is the one it changes; the weeks before keep theirs (R7-A.1 C2).
 const start=isoDay(ch.from)?program.weeks.findIndex((x,i)=>i>ctx.w&&x.startDate>=ch.from):ctx.w+1,s=(start>=0&&ctx.sk.at(start)||ctx.sk).c.schedule;
 const schedule=mergedSchedule(s,norm);
 const invalid=scheduleChangeErrors(ch,schedule);
 if(invalid.length)return {action:'ASK',reason:'The new schedule has values the plan cannot use ('+invalid.join(', ')+'); nothing is re-planned until they are corrected',missingInputs:invalid.map(k=>'changes.'+k),counterfactuals:[counter('REARRANGE_FUTURE_WEEKS','REARRANGE_FUTURE_WEEKS',false,'Invalid days, shifts or times would produce sessions the athlete did not choose')]};
 normalizedSchedule(schedule);
 if(!schedule.runDays.length&&program.capability.run.programmed||!schedule.strengthDays.length&&program.capability.strength.programmed)return {action:'ASK',reason:'A programmed sport has no chosen day left; confirm whether to pause it or choose a day',missingInputs:['schedule.days']};
 if(hash(schedule)===hash(s))return {action:'KEEP',reason:'The new schedule matches the current one',counterfactuals:[counter('KEEP','KEEP',true,'No change',{selected:true})]};
 // A change stated for dates (changes.from/to) is never applied beyond them (R7-A). The weekly arrangement cannot hold a dated window of
 // days or shifts, so a bounded change is asked about; an open-ended one starts with the first week that begins on or after its date.
 if(isoDay(ch.to))return {action:'ASK',reason:`The change is stated for ${isoDay(ch.from)&&ch.from!==ch.to?ch.from+' to '+ch.to:ch.to} only; a dated window of days or shifts is not re-planned automatically. Say whether the change is permanent from a date, or move or skip the affected sessions`,missingInputs:['changes.permanentFrom|sessionMove'],counterfactuals:[counter('REARRANGE_FUTURE_WEEKS','REARRANGE_FUTURE_WEEKS',false,'Applying a change stated for some dates to every later week would change days and shifts the athlete did not mention'),counter('ASK','ASK',true,'The scope of the change is the athlete’s statement',{selected:true})]};
 if(start<0)return {action:'KEEP',reason:'The change starts after the last week of this program; the current weeks keep their days and shifts',counterfactuals:[counter('KEEP','KEEP',true,'Nothing in this program falls on or after the stated date',{selected:true})]};
 return rebuild(ctx,{canonical:c=>({...c,schedule:normalizedSchedule(mergedSchedule(c.schedule,norm))}),fromWeek:start,reason:`New chosen days or shifts: same doses rearranged on the new days from ${start===ctx.w+1?'next week':program.weeks[start].startDate}; this week’s remaining sessions are not moved onto days the athlete removed`,action:'REARRANGE_FUTURE_WEEKS'});
}
function unavailableDay(ctx){
 const {program,sk,w,review}=ctx,dates=new Set(Array.isArray(review.changes?.unavailableDates)?review.changes.unavailableDates:[]),week=program.weeks[w];
 const r=unavailableSessions({...ctx,sk:ctx.skw},week.sessions,dates);
 if(!r.hit.length)return {action:'KEEP',reason:'No planned session falls on the unavailable date',counterfactuals:[counter('KEEP','KEEP',true,'Nothing to move',{selected:true})]};
 if(r.race)return {action:'ASK',reason:'The race date is marked unavailable; confirm whether the race still happens on that date or the new date',missingInputs:['event.date'],counterfactuals:[counter('SKIP_RACE','SKIP',false,'Dropping the athlete’s event is their decision, never a scheduling default'),counter('ASK','ASK',true,'The event date is the athlete’s decision',{selected:true})]};
 // The reschedule is an adaptation of this week (R7-A.1 C4): recorded, so a later re-plan of the week applies it again.
 const next=adaptThisWeek(ctx,program,w,r.sessions,adaptation(ctx,'UNAVAILABLE_DAY',{dates:[...dates].filter(d=>typeof d==='string').sort()}));
 const proposal=finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'RESCHEDULE_WITHIN_WEEK',fromWeek:w,throughWeek:w,horizonsConsidered:HORIZONS});
 return {action:'RESCHEDULE_WITHIN_WEEK',reason:'Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt',proposal,counterfactuals:r.cands.map(({proposalSessions,...c})=>c),horizons:{H0_SESSION:'Unavailable sessions handled',H1_WEEK:'No new day and no stacked work',H2_BLOCK:'Next step gated at the weekly review',H3_GOAL_EVENT:'Unchanged'}};
}
function doubleConflict(ctx){
 const {program,review}=ctx,ch=review.changes??{};
 if(ch.runTurn||ch.strengthTurn||ch.sameTurnConfirmed!==undefined||ch.temporaryPreference)return scheduleChange(ctx);
 const shared=program.weeks.slice(ctx.w).some(week=>week.sessions.some(s=>s.sport==='RUN'&&s.prescription&&week.sessions.some(x=>x.sport==='STRENGTH'&&x.prescription&&x.day===s.day&&(x.turn??null)===(s.turn??null))));
 return {action:'ASK',reason:shared?'Run and strength cannot both fit this shared shift; choose a different shift for one sport or a temporary preference for which goes first':'No planned day puts run and strength in the same shift; say which day or shift conflicts, or a different shift for one sport',missingInputs:['changes.runTurn|changes.strengthTurn|changes.temporaryPreference'],counterfactuals:[counter('OVERLAP','OVERLAP',false,'Overlapping sessions in one window are never valid'),counter('DROP_ONE','DROP',false,'Dropping an essential session needs the athlete’s agency or a dominance proof')]};
}
/**
 * Substitution by movement intent when equipment changes. The change persists: a permanent change becomes the athlete's
 * equipment and templates, a temporary one a dated window, so every later reprojection keeps it. Only strength sessions
 * from today on are re-projected; a new exercise starts with effort-guided establishment and no load is converted.
 */
function equipmentChange(ctx){
 const {program,w,review,asOfLocal,authority}=ctx;
 if(!allows(authority,'R6-SUBSTITUTION'))return {action:'UNSUPPORTED',status:'UNSUPPORTED',reason:'Substitution authority is unavailable'};
 // Window dates are real dates with the end not before the start; anything else is asked, never read as a window (R7-A).
 const ch=review.changes??{},invalid=[];
 for(const k of ['from','to'])if(ch[k]!==undefined&&ch[k]!==null&&!isoDay(ch[k]))invalid.push('changes.'+k);
 if(!invalid.length&&isoDay(ch.from)&&isoDay(ch.to)&&ch.to<ch.from)invalid.push('changes.to');
 if(ch.equipment!==undefined&&ch.equipment!==null&&!(Array.isArray(ch.equipment)&&ch.equipment.every(e=>typeof e==='string')))invalid.push('changes.equipment');
 if(invalid.length)return {action:'ASK',reason:'The equipment change has dates or items the plan cannot use ('+invalid.join(', ')+'); say the equipment and, for a temporary change, its first and last day',missingInputs:invalid,counterfactuals:[counter('SUBSTITUTE','SUBSTITUTE',false,'A window with an unreadable or inverted date would change sessions outside the stated period')]};
 const equipment=[...new Set((ch.equipment??program.canonical.athlete.equipment).map(e=>String(e).toUpperCase()))].sort(),from=ch.from??asOfLocal,to=ch.to??null;
 // A permanent change stated from a later date is an open window from that date: the sessions before it keep their equipment (R7-A.1 C2).
 const permanent=!to&&from<=asOfLocal,knownOnly=!allows(authority,'R6-LOAD-ESTABLISHMENT');
 // A newer statement wins (C5): a permanent change ends every earlier window on the day before it starts.
 const before=list=>list.filter(x=>x.from<from).map(x=>!x.to||x.to>=from?{...x,to:onDate(from,-1)}:x);
 const changed=withContextChange(ctx,program,w,base=>{const canonical=clone(base.canonical);if(permanent){canonical.athlete.equipment=equipment;const kept=before(canonical.equipmentWindows??[]);if(kept.length)canonical.equipmentWindows=kept;else delete canonical.equipmentWindows;}else canonical.equipmentWindows=[...(canonical.equipmentWindows??[]),{from,to,equipment}];return {...base,canonical,templates:permanent?strengthTemplates(canonical,base.goal,{knownOnly}):base.templates};});
 // Only strength is re-planned, from the sessions still ahead (C1, C6), keeping next week's start and this week's adaptations (C3, C4).
 const next=changed.program,composed=composeWeeks(ctx,next,{fromWeek:w,sports:['STRENGTH'],evidence:evidenceRule(ctx)});
 if(composed.ask)return {action:'ASK',reason:composed.ask,missingInputs:composed.missingInputs};
 const swaps=[],omitted=[];
 for(const wk of program.weeks.slice(w))for(const s of wk.sessions){
   if(s.sport!=='STRENGTH'||!ctx.ahead(s))continue;
   const n=composed.weeks[wk.index].sessions.find(x=>x.id===s.id)??s,before=s.prescription?.exercises??[],after=n.prescription?.exercises??[];
   for(const e of before)if(!after.some(x=>x.id===e.id)){const sub=after.find(x=>x.pattern===e.pattern&&!before.some(y=>y.id===x.id));if(sub)swaps.push({sessionId:s.id,date:s.date,from:e.id,to:sub.id,pattern:e.pattern,requiresEstablishment:sub.load.mode==='ESTABLISH',stimulusChange:sub.load.mode==='BODYWEIGHT'&&e.load.mode!=='BODYWEIGHT'?'Bodyweight practice is a different stimulus, not an equivalent load':null});else omitted.push({sessionId:s.id,date:s.date,exerciseId:e.id,pattern:e.pattern});}
 }
 const inWindow=swaps.filter(x=>x.date>=from&&(!to||x.date<=to));
 // Nothing to substitute now: the statement is still the athlete's equipment on its dates, recorded so a later plan or move keeps it (QE-R7A1-01).
 if(!inWindow.length&&!omitted.length){
  const keep=[counter('KEEP','KEEP',true,'No change needed',{selected:true})];if(hash(next.canonical)===hash(program.canonical))return {action:'KEEP',reason:'Planned exercises already fit the available equipment',counterfactuals:keep};
  const recorded=finishProposal(program,composed.sk,{weeks:composed.weeks,stateTrace:composed.stateTrace,canonical:next.canonical,templates:next.templates,contextBefore:next.contextBefore??null},{eventId:review.event.id,asOf:ctx.asOf,action:'KEEP',fromWeek:w,window:{from,to},permanent,swaps:[],omitted:[],horizonsConsidered:HORIZONS});
  return {action:'KEEP',instantiationOnly:true,reason:'Planned exercises already fit the available equipment; the equipment is recorded for the dates stated',proposal:recorded,counterfactuals:keep};
 }
 const substitutions=[...new Map(inWindow.map(x=>[x.from+'>'+x.to,{exerciseId:x.from,selected:x.to,pattern:x.pattern,requiresEstablishment:x.requiresEstablishment,stimulusChange:x.stimulusChange,reason:`Same ${x.pattern.toLowerCase()} intent with available equipment${x.requiresEstablishment?'; the new task starts with effort-guided establishment':''}; no load is converted`}])).values()];
 const proposal=finishProposal(program,composed.sk,{weeks:composed.weeks,stateTrace:composed.stateTrace,canonical:next.canonical,templates:next.templates,contextBefore:next.contextBefore??null},{eventId:review.event.id,asOf:ctx.asOf,action:'SUBSTITUTE',fromWeek:w,window:{from,to},permanent,swaps:inWindow,omitted,horizonsConsidered:HORIZONS});
 return {action:'SUBSTITUTE',reason:'Equipment changed: same-intent substitutes '+(permanent?'from now on':to?`from ${from} to ${to}`:`from ${from} on`)+'; unfamiliar ones are established by effort; the stimulus change is disclosed',proposal,sk:composed.sk,substitutions,counterfactuals:[counter('KEEP','KEEP',false,'Prescribing unavailable equipment is never valid'),counter('OMIT_STRENGTH','OMIT',false,'Omitting the session loses the strength stimulus when a same-intent substitute exists'),counter('SUBSTITUTE','SUBSTITUTE',true,'Same-intent substitutes that persist through later reviews',{selected:true})],horizons:{H0_SESSION:`${inWindow.length} exercise substitution(s)${omitted.length?`, ${omitted.length} pattern(s) without a substitute disclosed`:''}`,H1_WEEK:'Session count and days unchanged; running unchanged',H2_BLOCK:'No progression on a substitute in its first exposure; originals resume after a temporary window from their last logged load',H3_GOAL_EVENT:'Strength goal continues through same-intent movements'}};
}
function goalChange(ctx){
 const {program,review}=ctx,ch=review.changes&&typeof review.changes==='object'&&!Array.isArray(review.changes)?review.changes:{},c=clone(program.canonical);
 if(ch.goals===undefined&&ch.event===undefined&&ch.eventDate===undefined)return {action:'ASK',reason:ctx.kind==='EVENT_DATE_CHANGE'?'No new event date was supplied; nothing to re-plan':'No new goal was supplied; nothing to re-plan',missingInputs:[ctx.kind==='EVENT_DATE_CHANGE'?'changes.eventDate':'changes.goals']};
 // Goals and events use the intake vocabulary and real dates; anything else is asked, never planned (QRE-R6-11).
 const word=v=>typeof v==='string'?v:v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.kind==='string'?v.kind:null,key=v=>typeof v==='string'?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
 const invalid=[];
 if(ch.goals!==undefined&&(!ch.goals||typeof ch.goals!=='object'))invalid.push('changes.goals');
 if(ch.goals?.run!==undefined&&!RUN_GOALS[key(word(ch.goals.run))])invalid.push('changes.goals.run');
 if(ch.goals?.strength!==undefined&&!STRENGTH_GOALS[key(word(ch.goals.strength))])invalid.push('changes.goals.strength');
 if(ch.event!==undefined&&ch.event!==null&&(typeof ch.event!=='object'||!EVENTS[key(ch.event.kind)]||!isoDay(ch.event.date)))invalid.push('changes.event');
 if(ch.eventDate!==undefined&&!isoDay(ch.eventDate))invalid.push('changes.eventDate');
 if(ch.from!==undefined&&ch.from!==null&&!isoDay(ch.from))invalid.push('changes.from');
 if(ctx.kind==='EVENT_DATE_CHANGE'&&ch.eventDate!==undefined&&!c.goals.event)invalid.push('event');
 if(invalid.length)return {action:'ASK',reason:'The new goal or event is not one the plan can use ('+invalid.join(', ')+'); say the goal and the event date',missingInputs:invalid};
 const run=ch.goals?.run!==undefined?RUN_GOALS[key(word(ch.goals.run))]:c.goals.run.kind,strength=ch.goals?.strength!==undefined?STRENGTH_GOALS[key(word(ch.goals.strength))]:c.goals.strength.kind;
 const event=ch.event===null?null:ch.event?{kind:EVENTS[key(ch.event.kind)],date:ch.event.date,timeGoalMinutes:ch.event.timeGoalMinutes??null}:ctx.kind==='EVENT_DATE_CHANGE'&&ch.eventDate?{...c.goals.event,date:ch.eventDate}:c.goals.event;
 if(event&&(!['10K','HALF_MARATHON'].includes(event.kind)||dayGap(c.startDate,event.date)>=program.weeks.length*7||dayGap(ctx.asOfLocal,event.date)<7))return {action:'ASK',reason:'The new event is outside this program horizon or too close to plan safely; a new program input is needed',missingInputs:['newProgramInput']};
 if(event&&!allows(ctx.authority,'R6-EVENT-TRANSITION'))return {action:'UNSUPPORTED',status:'UNSUPPORTED',reason:'Event transition authority unavailable'};
 const goalKey=g=>hash({run:g.run.kind,strength:g.strength.kind,event:g.event?{kind:g.event.kind,date:g.event.date}:null});
 // The goals a review states, applied to the goals in force: what it does not state keeps each context's own (R7-A.1 C2).
 const stated=g=>{const r=ch.goals?.run!==undefined?run:g.run.kind,st=ch.goals?.strength!==undefined?strength:g.strength.kind,e=ch.event!==undefined?event:ctx.kind==='EVENT_DATE_CHANGE'&&ch.eventDate?(g.event?{...g.event,date:ch.eventDate}:null):g.event;return {run:{kind:e?'RACE':r==='RACE'?'PERFORMANCE':r,raw:r},strength:{kind:st,raw:st},event:e};};
 const before=goalKey(c.goals);
 c.goals=stated(c.goals);
 if(goalKey(c.goals)===before)return {action:'KEEP',reason:'The supplied goal and event match the current ones; nothing to re-plan'};
 const goal=buildGoalModel(c),newPhases=planPhases(c,program.capability,ctx.authority.policy.operational);
 if(event&&newPhases.raceWeek<=ctx.w)return {action:'ASK',reason:'The new date falls inside the current week; confirm the event plan',missingInputs:['event.date']};
 const ahead=ctx.ahead,merged={...newPhases,phases:[...program.phases.phases.slice(0,ctx.w),...newPhases.phases.slice(ctx.w)]},newSk=skeletonOf({...program,canonical:c,goal,phases:merged},ctx.authority);
 // The change reaches this week's remaining days when it moves one of them into or out of the taper, race or post-event window (days count
 // to the race, SSCTR S4: a newer date is the event, R7-A.1 C5), or the race itself is still ahead this week; a goal that only renames a
 // training phase starts next week, as before. Whichever week the re-plan starts from, a return decided this week stays next week's start
 // and this week's adaptations apply again (R7-A.1 C3, C4).
 const eventDay=p=>['TAPER','RACE_WEEK','POST_EVENT'].includes(p),moved=s=>{const now=dayPhaseOf(newSk,ctx.w,s.day),was=dayPhaseOf(ctx.skw,ctx.w,s.day);return now!==was&&(eventDay(now)||eventDay(was));};
 const reachesThisWeek=program.weeks[ctx.w].sessions.some(s=>ahead(s)&&(s.role==='RACE'||moved(s)));
 // A goal stated from a later date starts with the first week that begins on or after it, never earlier (R7-A.1 C2).
 const statedFrom=isoDay(ch.from)?program.weeks.findIndex((x,i)=>i>ctx.w&&x.startDate>=ch.from):ctx.w+1;
 if(statedFrom<0)return {action:'KEEP',reason:'The goal change starts after the last week of this program; the current weeks keep their goals',counterfactuals:[counter('KEEP','KEEP',true,'Nothing in this program falls on or after the stated date',{selected:true})]};
 return rebuild(ctx,{canonical:x=>({...x,goals:stated(x.goals)}),goals:true,fromWeek:reachesThisWeek?ctx.w:statedFrom,reason:'Goal or event date changed: future phases, priorities and arrangements are re-planned from the current state'+(reachesThisWeek?', including this week\u2019s remaining sessions; completed sessions stay as they were':'; completed weeks stay as they were'),action:'REPLAN_FUTURE_PHASES'});
}
// ---------- the interruption a return reports (R7-A.2; R7-A final, audits/domain-coaching-r7a-final-2026-10-28/INTERRUPTION_EPISODE_CONTRACT.md) ----------
/** A recorded return's interruption: its days, its start time when stated, the local day it was reported, its class, the week its re-entry
 * starts and the start it set. A return recorded before R7-A.2 states no dates: its interruption is read as the days that ended the day before
 * its report, and its start as the start of its re-entry week. */
function breakOf(program,d){
 const i=d.interruption??{},day=localDate(d.asOf,program.timezoneOffsetMinutes??0),end=i.endDate??onDate(day,-1);
 return {eventId:d.eventId,episode:i.episode??d.eventId,start:i.startDate??onDate(end,-((i.days??1)-1)),startedAt:i.startedAt??null,end,day,asOf:d.asOf,cls:i.class??null,fromWeek:d.fromWeek,supersedes:i.supersedes??null,inputHash:i.inputHash??null,entry:i.entry??program.stateTrace[d.fromWeek]??null};
}
/**
 * The interruptions the record holds (InterruptionEpisode, Founder 0.1), in the order they were first reported: each is its identity (`id`), its
 * reports in the order they were made, the one in force now (`live`: no newer report of it superseded it) and its first report (`first`), the
 * day its re-entry began.
 */
function episodesOf(program){
 const reports=program.decisions.filter(d=>d.action==='REESTABLISH').map(d=>breakOf(program,d)),gone=new Set(reports.map(b=>b.supersedes).filter(Boolean)),by=new Map();
 for(const b of reports){if(!by.has(b.episode))by.set(b.episode,[]);by.get(b.episode).push(b);}
 return [...by].map(([id,list])=>({id,reports:list,first:list[0],live:list.filter(b=>!gone.has(b.eventId)).at(-1)??list.at(-1)}));
}
/** Training the record shows between two days (exclusive): a session of the plan executed then (Founder 0.3); a conflicted report trains nothing. */
const trainedBetween=(ctx,after,before)=>(ctx.fullLedger??ctx.ledger).some(o=>!o.conflicted&&o.context?.sessionId&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)&&o.localDate>after&&o.localDate<before);
/** An interruption beginning on `start` comes after interruption e's re-entry: after e's days, and on or after e's first report or with training since. */
const afterReentry=(ctx,e,start)=>start>e.live.end&&(start>=e.first.day||trainedBetween(ctx,e.live.end,start));
/**
 * Which interruption a return report is about (R7-A final; Founder 0.2–0.4, §8, §9), in this order:
 * 1. explicit identity: `id` (interruption.episodeId) names a recorded interruption, by its identity or by one of its reports: this is a newer
 *    report of it, which keeps its identity and supersedes its report in force (I1, I3). Only the latest interruption is corrected, and never
 *    back across the re-entry of the one before; a correction of an earlier one is asked. A name the record does not hold is a new interruption
 *    with that identity, under the rule of 3;
 * 2. without one (legacy input, §9), a demonstrable duplicate: the same days as the latest interruption: a newer report of it;
 * 3. a new interruption: it begins after the latest one's re-entry (I2), whatever the dates or the clock of any other report;
 * 4. everything else is asked, never guessed (I9): dates that touch or overlap never make two reports one interruption on their own (0.4).
 */
function interruptionEpisode(ctx,{start,end,id=null}){
 const eps=episodesOf(ctx.program),last=eps.at(-1),prev=eps.at(-2),named=id===null?null:eps.find(e=>e.id===id||e.reports.some(b=>b.eventId===id))??null;
 const dates=['interruption.startDate','interruption.endDate'];
 if(named){
  if(named!==last)return {ask:`This corrects the interruption first reported on ${named.first.day}, but a later interruption (first reported on ${last.first.day}) already set the plan: correct that one, or say the dates as one period`,missingInputs:dates};
  if(prev&&!afterReentry(ctx,prev,start))return {ask:`This correction reaches back across the return reported on ${prev.first.day}: say when the interruption started and ended`,missingInputs:dates};
  return {relation:'SAME_BREAK',episode:named.id,supersedes:named.live.eventId,basis:'EXPLICIT',revision:named.reports.length+1};
 }
 if(last&&id===null&&start===last.live.start&&end===last.live.end)return {relation:'SAME_BREAK',episode:last.id,supersedes:last.live.eventId,basis:'DUPLICATE',revision:last.reports.length+1};
 if(!last||afterReentry(ctx,last,start))return {relation:'NEW',episode:id??ctx.review.event.id,supersedes:null,basis:id!==null?'EXPLICIT':!last?'FIRST':start>=last.first.day?'AFTER_REENTRY':'TRAINING_BETWEEN',revision:1};
 if(end<last.live.start||prev&&!afterReentry(ctx,prev,start))return {ask:`This interruption ends before the one reported on ${last.first.day} began, or spans an earlier return: say when it started and ended, as one period`,missingInputs:dates};
 return {ask:`This interruption shares days with the one first reported on ${last.first.day} (${last.live.start} to ${last.live.end}), or follows it with no return or training between, and is not marked as its correction: say whether it corrects that interruption (its episodeId ${last.id}) or is a different one`,missingInputs:['interruption.episodeId']};
}
/**
 * executedStateAt(start) (R7-A final; Founder 0.5–0.8, §10; SSCTR D59): what the athlete had executed when an interruption began.
 * 1. The point: the start set by the latest decision in force at that moment. The latest interruption before this one, other than this one's own
 *    earlier reports, sets it when one of its reports was made by then (on or before the first day; before the stated start time when there is
 *    one): the report in force then, even if a newer report of it came later (I4). Reported in this week, the start it set from its report on;
 *    reported earlier, the start of this week, which carries it, as it stood before any return of this week replaced it (C5). An interruption
 *    first reported only after this one began is still the latest one before it: the start its report set (0.7; the sessions between its end
 *    and its report belong to the plan before it, C5). Without one, the start of this week.
 *    After an earlier interruption's return, a week's start is a point only when it was earned: that return set it, a decision re-planned it once
 *    the week before was over (the weekly review's rule), or the week before was executed as planned. Otherwise (a re-entry week neither
 *    reviewed nor executed as planned) its planned start assumes return steps the athlete did not take (§10): the point moves back to that
 *    week's own point, as far back as the return itself, and that week's executions are facts too, so the same history gives the same state
 *    whichever side of a week boundary the interruption begins (P5). Before any return, the start of the week stands as the plan's (C3;
 *    R7-A.2 §5, boundary 3).
 * 2. The facts (strengthAtBreak, R7-A.2): the strength exposures the record shows executed after that point and before the interruption began
 *    (planned before it, or executed before it; a conflicted report executes nothing until corrected, QRE-R6-14), each week read as the weekly
 *    review reads it, as facts only. Nothing from the start on counts (I7): no execution, no session planned then and not executed before it,
 *    no decision made then or later. Runs keep the point's state; what they executed counts through the completed-work record.
 * 3. A session on the first day (0.8): with a stated start time it is before or after it. Without one it cannot be ordered: `state` reads it as
 *    after the start (the first day is a whole day of the interruption, R7-A.2 §5), the other reading is recorded (`point.sameDay`), and
 *    `material` says whether the order changes the state the return starts from (then the return asks).
 */
function stateAtBreak(ctx,{start,startedAt=null,episode=null}){
 const {program}=ctx,tz=program.timezoneOffsetMinutes??0,p=Math.max(0,Math.min(ctx.w,Math.floor(dayGap(program.startDate,start)/7)));
 const inForce=b=>startedAt?Date.parse(b.asOf)<Date.parse(startedAt):b.day<=start;
 const E=episodesOf(program).filter(e=>e.id!==episode&&e.live.end<start).reduce((m,e)=>!m||e.live.end>m.live.end||e.live.end===m.live.end&&Date.parse(e.first.asOf)>Date.parse(m.first.asOf)?e:m,null);
 const R=E?E.reports.filter(inForce).at(-1)??E.live:null,late=!!R&&!inForce(R);
 const cut=startedAt??new Date(Date.parse(start+'T00:00:00Z')-tz*60000).toISOString(),all=ctx.fullLedger??ctx.ledger,dayOf=o=>o.localDate??localDate(o.observedAt,tz);
 const weekOf=k=>program.weeks[k],lastDay=k=>onDate(weekOf(k).startDate,6),doneBefore=new Set(all.filter(o=>!o.conflicted&&Date.parse(o.observedAt)<Date.parse(cut)).map(o=>o.sessionId));
 const pointAt=k=>R?.entry&&(late?k===p:inForce(R)&&R.day>=weekOf(k).startDate&&R.day<=lastDay(k))?{kind:'RETURN',day:R.day,asOf:R.asOf,eventId:R.eventId,state:R.entry}:{kind:'WEEK_START',day:weekOf(k).startDate,asOf:null,eventId:null,state:weekOf(k).startBeforeReturn??program.stateTrace[k]};
 const earned=k=>!!R&&!late&&R.fromWeek===k||program.decisions.some(d=>d.fromWeek<=k&&localDate(d.asOf,tz)>=lastDay(k-1)&&Date.parse(d.asOf)<Date.parse(cut))||weekOf(k-1).sessions.every(s=>!s.prescription||s.status==='SKIPPED'||doneBefore.has(s.id));
 let k=p,point=pointAt(p);
 while(point.kind==='WEEK_START'&&R&&!late&&R.day<weekOf(k).startDate&&!earned(k))point=pointAt(--k);
 const after=point.asOf?s=>!beforeReturn(program,{day:point.day,asOf:point.asOf})(s):()=>true;
 const read=sameDay=>{
  const ledger=all.filter(o=>startedAt?Date.parse(o.observedAt)<Date.parse(startedAt):dayOf(o)<start||sameDay&&dayOf(o)===start),executed=new Set(ledger.filter(o=>!o.conflicted).map(o=>o.sessionId)),performedAll={};
  let strength=point.state.strength;
  for(let j=k;j<=p;j++){
   const sessions=weekOf(j).sessions.filter(s=>(j>k||after(s))&&(s.date<start||executed.has(s.id))),skj=ctx.sk.at?.(j)??ctx.sk;
   const view={...program,weeks:program.weeks.map((x,i)=>i===j?{...x,sessions}:x),stateTrace:program.stateTrace.map((x,i)=>i===j?(j===k?point.state:{...x,strength}):x),decisions:program.decisions.filter(d=>Date.parse(d.asOf)<Date.parse(cut))};
   const ev=weekEvidence(view,j,start,ledger,ctx.quarantined??[]);
   const systemic=!!ev.systemicConvergence||(weekOf(j).adaptations??[]).some(a=>a.kind==='SYSTEMIC_SIGNAL'&&Date.parse(a.asOf)<Date.parse(cut));
   const {gates}=weeklyGates(view,skj,j,ev,ledger.filter(o=>!o.conflicted),cut,{systemic}),performed=performedInWeek(ev,ledger);
   strength=strengthAtBreak(skj,strength,usedInWeek(view.weeks[j]),{ALL:'HOLD',...gates},{performed});Object.assign(performedAll,performed);
  }
  return {strength,performed:performedAll};
 };
 const base=read(false),alt=!startedAt&&all.some(o=>!o.conflicted&&o.context?.sport==='STRENGTH'&&dayOf(o)===start)?read(true).strength:null;
 // The two readings differ materially when they differ in anything but a last performed date (an exercise in use or not, its ceiling, an
 // unlogged load): those set the return's start. A last performed date alone only moves a re-establishment threshold, and the reading kept
 // (the session after the start, so the earlier date) is the conservative one. Judged on the state, never on a plan that later changes.
 const facts=s=>hash({...s,exercises:Object.fromEntries(Object.entries(s.exercises).map(([id,{lastPerformed,...e}])=>[id,e]))});
 const other=alt&&hash(alt)!==hash(base.strength)?hash(alt):null,material=!!other&&facts(alt)!==facts(base.strength);
 return {state:{run:clone(point.state.run),strength:base.strength},material,point:{kind:point.kind,week:k,day:point.day,asOf:point.asOf,eventId:point.eventId,executed:Object.keys(base.performed).sort(),...(late?{reportedAfterStart:true}:{}),...(other?{sameDay:other}:{})}};
}
/** The strength start of a return from the state at its interruption: a short one resumes it; a moderate or long one starts the return steps
 * from it, its last executed count the ceiling (SSCTR D49). */
const returnStrength=(cls,strength)=>cls==='SHORT'?clone(strength):{...clone(strength),exercises:Object.fromEntries(Object.entries(strength.exercises).map(([id,ex])=>[id,startStrengthReturn(clone(ex))]))};
/**
 * Late evidence (R7-A final I6; Founder 0.7): training before the latest interruption that the record now shows, which its return did not read,
 * can change the state that return started from. While that return still sets the plan (until its re-entry week is over), nothing else is
 * planned until the athlete confirms the interruption again (confirmation-first): that newer report reads the whole record. After its re-entry
 * week, the re-entry was executed and reviewed, and a late fact is read as every late fact is read, never by replaying a decision.
 */
function staleReturn(ctx){
 const e=episodesOf(ctx.program).at(-1),r=e?.live;
 if(!r?.entry?.strength||!r.cls||ctx.w>r.fromWeek)return null;
 const at=stateAtBreak(ctx,{start:r.start,startedAt:r.startedAt,episode:e.id});
 if(hash(returnStrength(r.cls,at.state.strength))===hash(r.entry.strength)&&!at.material)return null;
 return {action:'ASK',reason:`Training before the interruption that began on ${r.start} is now recorded, and the return reported on ${r.day} did not read it: confirm that interruption again (episodeId ${e.id}, or the same dates) so its return reads the whole record; nothing else changes until then`,missingInputs:['interruption.episodeId'],question:{episodeId:e.id,startDate:r.start,endDate:r.end,reportedOn:r.day}};
}
/** Nonclinical return: current evidence is the start, prior tolerated dose the ceiling; no universal percentage rollback. */
function returnAfterPause(ctx){
 const {program,sk,w,review,asOfLocal}=ctx,i=review.interruption&&typeof review.interruption==='object'&&!Array.isArray(review.interruption)?review.interruption:{},R=sk.op.return,tz=program.timezoneOffsetMinutes??0;
 // The same report again (one event id, the same facts) is already recorded: nothing changes and no interruption is added (R7-A final P6).
 // One event id carrying other facts is asked, never applied.
 const again=program.decisions.find(d=>d.action==='REESTABLISH'&&d.eventId===review.event.id);
 if(again)return (again.interruption?.inputHash??hash(i))===hash(i)?{action:'KEEP',reason:'This interruption report is already recorded; nothing changes',counterfactuals:[counter('KEEP','KEEP',true,'A report recorded once is never applied twice',{selected:true})]}:{action:'ASK',reason:'This report id already belongs to a different interruption report; send a correction as a new report of that interruption (its episodeId)',missingInputs:['event.id']};
 const screen=screenInterruptionReason({reason:i.reason,reasonCategory:i.reasonCategory,nonclinical:i.nonclinical??null,clinicalReason:i.clinicalReason??null});
 if(screen.status==='CLINICAL')return {action:'CLINICAL_HUMAN_REQUIRED',status:'CLINICAL_HUMAN_REQUIRED',reason:'The interruption reason is clinical or possibly clinical'+(screen.matched.length?' ('+screen.matched.join(', ')+')':'')+': qualified assessment is needed; no nonclinical return recipe',screen};
 if(!allows(ctx.authority,'R6-NONCLINICAL-RETURN'))return {action:'UNSUPPORTED',status:'UNSUPPORTED',reason:'Nonclinical return authority unavailable'};
 if(screen.status==='ASK')return {action:'ASK',reason:screen.basis==='MISSING_REASON'?'Say what interrupted training (for example travel, work, family, illness or injury) before a nonclinical restart':'The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness',missingInputs:['interruption.reasonCategory'],screen};
 // Interruption facts out of range or contradicting each other are asked, never resolved to the least conservative class (QRE-R6-06).
 const invalid=[];
 if(i.days!==undefined&&i.days!==null&&!(Number.isInteger(i.days)&&i.days>=1&&i.days<=3650))invalid.push('interruption.days');
 for(const k of ['startDate','endDate'])if(i[k]!==undefined&&i[k]!==null&&!isoDay(i[k]))invalid.push('interruption.'+k);
 // The interruption's identity is a name (R7-A final §8), and its start time, when stated, orders a session of its first day (0.8).
 const named=i.episodeId!==undefined&&i.episodeId!==null,startedAt=i.startedAt===undefined||i.startedAt===null?null:utcTimestamp(i.startedAt);
 if(named&&!(typeof i.episodeId==='string'&&i.episodeId.trim()!==''&&i.episodeId.length<=200))invalid.push('interruption.episodeId');
 if(i.startedAt!==undefined&&i.startedAt!==null&&!startedAt)invalid.push('interruption.startedAt');
 if(!invalid.length&&startedAt&&isoDay(i.startDate)&&localDate(startedAt,tz)!==i.startDate)invalid.push('interruption.startedAtContradictsStartDate');
 if(!invalid.length&&startedAt&&Date.parse(startedAt)>Date.parse(ctx.asOf))invalid.push('interruption.startedAtAfterThisReview');
 const startDay=isoDay(i.startDate)?i.startDate:startedAt?localDate(startedAt,tz):null;
 if(!invalid.length&&startDay&&isoDay(i.endDate)&&dayGap(startDay,i.endDate)<0)invalid.push('interruption.startAfterEnd');
 if(!invalid.length&&isoDay(i.endDate)&&dayGap(asOfLocal,i.endDate)>0)invalid.push('interruption.endAfterThisReview');
 if(!invalid.length&&startDay&&dayGap(asOfLocal,startDay)>0)invalid.push('interruption.startAfterThisReview');
 if(!invalid.length&&Number.isInteger(i.days)&&startDay&&isoDay(i.endDate)&&Math.abs(i.days-(dayGap(startDay,i.endDate)+1))>1)invalid.push('interruption.daysContradictDates');
 if(invalid.length)return {action:'ASK',reason:'The interruption facts are out of range or contradict each other ('+invalid.join(', ')+'); say when it started and when it ended',missingInputs:invalid,screen};
 // Without an end date the interruption ended the day before this return review.
 const end=isoDay(i.endDate)?i.endDate:onDate(asOfLocal,-1),start=startDay;
 const days=Number.isInteger(i.days)?i.days:start?dayGap(start,end)+1:null;
 if(days===null)return {action:'ASK',reason:'The interruption length decides the re-entry stage; supply start and end dates',missingInputs:['interruption.days']};
 const assessedDay=dayOf(review.eligibility?.assessedAt);
 if(!assessedDay||dayGap(end,assessedDay)<0)return {action:'ASK',reason:'Eligibility must be assessed on or after the interruption ended',missingInputs:['eligibility.assessedOnOrAfterInterruptionEnd']};
 const pauseStart=start??onDate(end,-(days-1)),demo=review.currentDemonstration,demoDay=String(demo?.observedAt??'').slice(0,10);
 // A current demonstration is a completed conversational easy run with compatible response and function, observed after the interruption began.
 // A demonstration shorter than the minimum easy session demonstrates no easy-run capacity (QRE-R6-06: out-of-range return facts).
 const demoOk=!!demo&&(demo.sport??demo.modality??demo.prescription?.modality)==='RUN'&&R.demonstration.families.includes(demo.family??demo.prescription?.family)&&demo.completed===true&&(demo.minutes??demo.prescription?.durationMinutes)>=sk.op.run.minimumSessionMinutes&&(['CONVERSATIONAL','EASY','ON_TARGET'].includes(String(demo.effort??'').toUpperCase())||demo.prescription?.effortDomain==='EASY_CONVERSATIONAL')&&demo.response==='COMPATIBLE'&&demo.ordinaryFunction==='COMPATIBLE'&&demo.nextDayFunction==='NORMAL'&&isoDay(demoDay)&&dayGap(pauseStart,demoDay)>=0&&dayGap(demoDay,asOfLocal)>=0&&dayGap(demoDay,asOfLocal)<=R.currentDemonstrationMaxAgeDays;
 const cls=days<=R.shortMaxDays?'SHORT':days<=R.moderateMaxDays?'MODERATE':'LONG';
 // Which interruption this report is about and what the athlete had executed when it began (R7-A final): a newer report of the same
 // interruption keeps its identity, supersedes its report in force and starts from what preceded it, whichever week it comes in (I1, I3, 0.6);
 // a new interruption starts from what the athlete had then, after the earlier one's re-entry, with the exposures executed before it (I2, I4).
 const ep=interruptionEpisode(ctx,{start:pauseStart,end,id:named?i.episodeId:null});
 if(ep.ask)return {action:'ASK',reason:ep.ask,missingInputs:ep.missingInputs,screen};
 // A new interruption starts from the latest one's return, so that return must have read the training before it (I6, confirmation-first).
 const stale=ep.relation==='NEW'?staleReturn(ctx):null;
 if(stale)return {...stale,screen};
 const at=stateAtBreak(ctx,{start:pauseStart,startedAt,episode:ep.episode});
 // A strength session on the first day without a stated start time, whose order changes the state the return starts from: asked (0.8).
 if(at.material)return {action:'ASK',reason:`A strength session was recorded on ${pauseStart}, the day the interruption began, and whether it came before the interruption changes the state the return starts from: say the time the interruption began (interruption.startedAt)`,missingInputs:['interruption.startedAt'],screen};
 const prior=at.state;
 // Strength: a short interruption resumes the last completed doses (the next step waits for observed execution); a moderate or long one
 // starts the return steps (returnStrength).
 let runState=clone(prior.run);const strengthState=returnStrength(cls,prior.strength);
 const demoMinutes=demoOk&&Number.isFinite(demo.minutes??demo.prescription?.durationMinutes)?Math.min(demo.minutes??demo.prescription.durationMinutes,prior.run.easy??R.entryRunMinutes*2):null;
 if(cls==='MODERATE'){
  if(runState.mode==='EASY'){const entry=Math.max(R.entryRunMinutes,demoMinutes??R.entryRunMinutes);runState={...runState,mode:'RETURN',returnStep:0,returnFrom:{easy:Math.min(entry,runState.easy??entry),long:runState.long!==null?Math.min(runState.long,entry+5):null},returnTo:{mode:'EASY',easy:runState.easy,long:runState.long,walks:runState.walks,qualityStep:runState.qualityStep,specificStep:runState.specificStep}};}
  else if(runState.mode==='WALK_JOG')runState.walkStep=Math.max(0,runState.walkStep-1);
 }else if(cls==='LONG'){
  // A restart begins from current capacity: runs before the break no longer count as reached, so the race statement (SSCTR D47) and the
  // taper, race-week, race-day and next-block doses come only from runs executed after it (author-found with D47).
  runState={...runState,mode:runState.mode==='WALK_JOG'?'WALK_JOG':'RESTART',restart:demoMinutes??R.entryRunMinutes,walkStep:0,longestContinuous:0,achieved:{long:null,easy:null,quality:null,strides:0}};
 }
 const returnRuns=[...ctx.completedRuns,...(demoMinutes?[{date:demoDay,minutes:demo.minutes??demoMinutes,source:'CURRENT_DEMONSTRATION'}]:[])];
 const ahead=ctx.ahead,futureThisWeek=program.weeks[w].sessions.filter(s=>s.prescription&&ahead(s)).length,fromWeek=futureThisWeek>=2||w+1>=program.weeks.length?w:w+1;
 // A newer report of the same break replaces the adaptations its earlier report recorded on these weeks (R7-A.1 C5); a separate break's
 // stay with that break (R7-A.2 I9). This report records its own, with its break (C4): the wait of the sessions still ahead when re-entry
 // starts next week, and, after a short break, the easy first quality slot still ahead (SSCTR R27).
 const fact=kind=>adaptation(ctx,kind,{episode:ep.episode,past:program.weeks[w].sessions.filter(s=>s.date===asOfLocal&&!ahead(s)).map(s=>s.id)});
 const strip=x=>{const list=(x.adaptations??[]).filter(a=>!(['RETURN_WAIT','SHORT_RETURN_EASY'].includes(a.kind)&&(a.episode??a.eventId)===ep.episode)),y={...x};if(list.length)y.adaptations=list;else delete y.adaptations;return y;};
 let base={...program,weeks:program.weeks.map((x,k)=>k>=w?strip(x):x)};
 if(fromWeek===w+1){const a=fact('RETURN_WAIT');base={...base,...adaptThisWeek(ctx,base,w,waitSessions({...ctx,sk:ctx.skw},base.weeks[w].sessions,a),a)};}
 // After a short break the first quality slot still ahead of this report runs easy (SSCTR R27, D58): recorded on the week re-entry starts,
 // the composition moves it on to the first week that holds such a slot, so later re-plans and the weekly review keep exactly one. A newer
 // report of the same break whose slot is already history keeps that slot: nothing else changes (R7-A.2 I2, I9).
 const slotRun=ep.relation==='SAME_BREAK'&&program.weeks.some(x=>x.sessions.some(s=>s.easedFor===ep.episode&&!ahead(s)));
 if(cls==='SHORT'&&!slotRun)base={...base,weeks:base.weeks.map((x,k)=>k!==fromWeek?x:{...x,adaptations:[...(x.adaptations??[]),fact('SHORT_RETURN_EASY')]})};
 if(fromWeek===w)base={...base,weeks:base.weeks.map((x,k)=>k!==w?x:{...x,startBeforeReturn:clone(program.weeks[w].startBeforeReturn??program.stateTrace[w])})};
 // Re-entry this week starts the week again from the return; re-entry next week is next week's start (C3).
 const next=composeWeeks(ctx,base,{fromWeek,start:{runState,strengthState},completedRuns:returnRuns,returnDay:asOfLocal,evidence:evidenceRule(ctx)});
 if(next.ask)return {action:'ASK',reason:next.ask,missingInputs:next.missingInputs};
 const eventSoon=sk.plan.raceWeek!==null&&sk.plan.raceWeek-fromWeek<=3&&sk.plan.raceWeek>=fromWeek;
 // The report records its interruption (InterruptionEpisode, Founder 0.1): its days and start time when stated, its identity and revision, how
 // it relates to the report before and why (basis), the facts it was given (inputHash), the point its state came from and the start it set,
 // which a later, separate interruption starts from. Its clock (asOf) is its report time.
 const proposal=finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'REESTABLISH',fromWeek,interruption:{days,class:cls,nonclinical:true,screen,startDate:pauseStart,endDate:end,...(startedAt?{startedAt}:{}),episode:ep.episode,relation:ep.relation,supersedes:ep.supersedes,basis:ep.basis,revision:ep.revision,inputHash:hash(i),stateAt:at.point,entry:{run:clone(runState),strength:clone(strengthState)}},demonstrationUsed:!!demoMinutes,horizonsConsidered:HORIZONS});
 return {action:'REESTABLISH',reason:`${cls.toLowerCase()} nonclinical interruption (${days} days): ${cls==='SHORT'?'resume the last completed doses; no step until execution is observed':cls==='MODERATE'?`re-entry from ${demoMinutes?'the current demonstration':'the reviewed entry dose'}, returning to the prior tolerated dose in ${R.moderateStepsToPrior} conditional steps`:'restart from current capacity; prior doses are only a ceiling'}`,proposal,counterfactuals:[counter('RESUME_PRIOR_PLAN','KEEP',cls==='SHORT','Resuming the planned (higher) week restores dose by elapsed time',{selected:false}),counter('PERCENT_ROLLBACK','ROLLBACK',false,'A universal percentage rollback is not an approved rule'),counter('REESTABLISH','REESTABLISH',true,'Current evidence first, prior tolerance as ceiling',{selected:true}),counter('CLINICAL_ROUTE','CLINICAL',false,'The interruption reason screened nonclinical ('+screen.matched.join(', ')+') and no current clinical flag is present')],horizons:{H0_SESSION:'First sessions back are easy and effort-governed',H1_WEEK:'No quality or heavy loading in the entry step',H2_BLOCK:`Prior dose reached in ${cls==='SHORT'?1:R.moderateStepsToPrior} conditional step(s)`,H3_GOAL_EVENT:eventSoon?'The event is close: the plan aims at completion and cannot catch up missed preparation':'Goal trajectory continues after re-establishment'},missingInputs:[],nextObservation:'Record minutes, effort and next-day function after each return session; any pain, illness or abnormal symptom routes to qualified assessment'};
}
function eventWeekConflict(ctx){
 const {program,sk,w,asOfLocal,review}=ctx,raceWeek=sk.plan.raceWeek,week=program.weeks[w],dates=new Set(Array.isArray(review.changes?.unavailableDates)?review.changes.unavailableDates:[]);
 if(raceWeek===null)return weeklyReview(ctx);
 // The race day itself unavailable is a question about the event, never silently kept (QRE-R6-18).
 if(dates.has(onDate(program.startDate,raceWeek*7+sk.plan.raceDay)))return {action:'ASK',reason:'The race date is marked unavailable; confirm whether the race still happens on that date or the new date',missingInputs:['event.date'],counterfactuals:[counter('KEEP','KEEP',false,'Keeping a race on a day the athlete cannot attend ignores the stated fact'),counter('ASK','ASK',true,'The event date is the athlete’s decision',{selected:true})]};
 const sessions=conflictSessions({...ctx,sk:ctx.skw},week.sessions,dates);
 const changed=sessions.some((s,i)=>s.status!==week.sessions[i].status);
 if(!changed)return {action:'KEEP',reason:'Protect the event horizon: no new load, no catch-up',counterfactuals:[counter('KEEP','KEEP',true,'Freshness and the race come first',{selected:true}),counter('CATCH_UP','CATCH_UP',false,'Catch-up work near the event is never selected')]};
 // The skip is an adaptation of this week (R7-A.1 C4): recorded, so a later re-plan of the week applies it again.
 const proposal=finishProposal(program,sk,adaptThisWeek(ctx,program,w,sessions,adaptation(ctx,'EVENT_WEEK_CONFLICT',{dates:[...dates].filter(d=>typeof d==='string').sort()})),{eventId:review.event.id,asOf:ctx.asOf,action:'SKIP_NO_CATCH_UP',fromWeek:w,throughWeek:w,horizonsConsidered:HORIZONS});
 return {action:'SKIP_NO_CATCH_UP',reason:'Event period conflict: the affected session is skipped, the race and freshness are protected, nothing is stacked',proposal,counterfactuals:[counter('MOVE_INTO_TAPER','MOVE',false,'Moving work closer to the race adds fatigue when it should fall'),counter('SKIP_NO_CATCH_UP','SKIP',true,'Smallest safe change',{selected:true})]};
}
function recovered(ctx){return weeklyReview(ctx,{extraReason:'Recovered label noted; the next step still follows executed evidence'});}
const HANDLERS={WEEKLY_REVIEW:weeklyReview,MISSED_SESSION:missedSession,PARTIAL_SESSION:ctx=>weeklyReview(ctx,{extraReason:'Partial execution counts only what was done; the next comparable step repeats'}),UNDERPERFORMANCE:performanceSignal,PROGRESSION_NOT_TOLERATED:performanceSignal,OVERPERFORMANCE:performanceSignal,PROGRESSION_TOO_EASY:performanceSignal,LOCAL_FATIGUE:fatigue,SYSTEMIC_FATIGUE:fatigue,SCHEDULE_CHANGE:scheduleChange,UNAVAILABLE_DAY:unavailableDay,DOUBLE_CONFLICT:doubleConflict,EQUIPMENT_CHANGE:equipmentChange,GOAL_CHANGE:goalChange,EVENT_DATE_CHANGE:goalChange,RETURN_AFTER_PAUSE:returnAfterPause,EVENT_WEEK_CONFLICT:eventWeekConflict,RECOVERED:recovered};
