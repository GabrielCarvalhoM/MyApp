import {clone,freeze,hash} from './value.mjs';
import {r6Authority,allows} from './r6-authority.mjs';
import {validProgram,programHash,skeletonOf,projectWeeks,advanceRun,advanceStrength,loggedLoadDecision,adoptionBasis,startStrengthReturn,eventCompletionItem,validateWeeks,peakOf,contextOf,arrangementCandidates,arrangementDisclosures,strengthTemplates,planPhases,buildGoalModel,blocksFrom,goalDose,runTarget,runMinutesOf,EVENT_PHASES,DEVELOPMENT,BLOCK_INTENT} from './r6-program.mjs';
import {chooseBalanced,interferenceCosts,SEVERITY} from './r6-balanced.mjs';
import {substitutesFor,catalogueEntry} from './r6-catalogue.mjs';
import {exerciseRow,fitStrengthSession,strengthPrescription,easyPrescription,validateR6Prescription} from './r6-prescription.mjs';
import {createLearningModel,updateLearningModel,validateLearningModel,evidenceFor,preferredArrangement,classify} from './r6-learning.mjs';
import {normalizeObservations,utcTimestamp,localDate} from './r6-provenance.mjs';
import {onDate,dayGap,isoDay,LB_TO_KG,toKilograms,RUN_GOALS,STRENGTH_GOALS,EVENTS} from './r6-intake.mjs';
import {screenInterruptionReason,isYes} from './r6-clinical.mjs';

export const REVIEW_VERSION='R6-REVIEW-1';
const KIND_ALIASES={REVIEW:'WEEKLY_REVIEW',MISSED_ESSENTIAL:'MISSED_SESSION',MISSED_OPTIONAL:'MISSED_SESSION',RETURN:'RETURN_AFTER_PAUSE',CONFLICT:'DOUBLE_CONFLICT',DOUBLE_INFEASIBLE:'DOUBLE_CONFLICT',EVENT_NEAR:'EVENT_WEEK_CONFLICT',SESSION_MOVED:'UNAVAILABLE_DAY',TRAVEL:'EQUIPMENT_CHANGE',SUBSTITUTION_NEED:'EQUIPMENT_CHANGE'};
export const REVIEW_KINDS=['WEEKLY_REVIEW','MISSED_SESSION','PARTIAL_SESSION','UNDERPERFORMANCE','OVERPERFORMANCE','PROGRESSION_NOT_TOLERATED','PROGRESSION_TOO_EASY','LOCAL_FATIGUE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE','UNAVAILABLE_DAY','DOUBLE_CONFLICT','EQUIPMENT_CHANGE','GOAL_CHANGE','EVENT_DATE_CHANGE','RETURN_AFTER_PAUSE','EVENT_WEEK_CONFLICT','RECOVERED'];
const HORIZONS=['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'];
const CLINICAL_KEYS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
const rank=s=>SEVERITY.indexOf(s??'NONE');
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
  const loads=unitUnknown?[]:readings.map(r=>r.kg).filter(Number.isFinite),rirs=sets.map(x=>x.rir).filter(Number.isFinite),reps=sets.map(x=>Number.isFinite(x.reps)?x.reps:0);
  out[e.id]={load:loads.length?Math.max(...loads):null,loggedRaw:raw.length?Math.max(...raw):null,unitUnknown,convention:conv,reps:Math.min(...reps),setsDone:sets.length,plannedSets:planned.sets,plannedReps:planned.reps,plannedRir:planned.rir,minRir:rirs.length?Math.min(...rirs):null,repsMet:sets.length>=planned.sets&&reps.every(x=>x>=planned.reps)};
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
  const u=used.find(x=>x.id===id),load=c?c.kg:l.load;if(!u||!Number.isFinite(load))continue;
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
  const {s,w}=x,p=s.prescription,minutesOk=s.sport==='STRENGTH'||!Number.isFinite(o.actual.minutes)||o.actual.minutes>=0.9*p.durationMinutes;
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
 const below=l=>!l.repsMet||Number.isFinite(l.minRir)&&Number.isFinite(l.plannedRir)&&l.minRir<l.plannedRir-SG.advanceMinimumLoggedRirBelowPrescribed;
 const surplus=l=>l.repsMet&&Number.isFinite(l.minRir)&&Number.isFinite(l.plannedRir)&&l.minRir>=l.plannedRir+SG.earnedLoggedRirAbovePrescribed;
 for(const row of ev.rows.filter(x=>x.sport==='STRENGTH'))for(const id of row.exercises){
  if(gates[id]&&gates[id]!=='ADVANCE')continue;
  const exState=program.stateTrace[w]?.strength?.exercises?.[id],returning=Number.isInteger(exState?.returnStep);
  const since=later(lastRegression(program,id),returnStart),type='STRENGTH:'+row.role.replace('STRENGTH_',''),log=row.logs[id],hist=ledger.filter(o=>o.logs?.[id]&&Date.parse(asOf)-Date.parse(o.observedAt)<=L.repeatedAdverseWindowDays*86400000&&(!since||Date.parse(o.observedAt)>Date.parse(since)));
  const missedReps=hist.filter(o=>below(o.logs[id])).length,easy=hist.filter(o=>surplus(o.logs[id])&&o.context?.phase!=='CONSOLIDATION').length,adverse=recent(ledger,type,asOf,L.repeatedAdverseWindowDays,{since}).adverse;
  if(['MISSED','NOT_REPORTED','PARTIAL','CONFLICTED','PENDING'].includes(row.status)){setGate(id,'HOLD',`${id}: session ${row.status.toLowerCase()}; repeat`);continue;}
  if(missedReps>=2||adverse>=L.repeatedAdverseForRegression){setGate(id,'REGRESS',`${id}: repeated missed reps, reserve below the prescription, or adverse response`);continue;}
  if(!log){setGate(id,'HOLD',`${id}: no logged set this week; the dose holds until a logged set supports a step`);continue;}
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
// confirmation in the planned convention replaces the logged value (SSCTR D45).
const loggedLoads=(ev,confirmations={})=>{const out={};for(const r of ev.rows)for(const [id,l] of Object.entries(r.logs??{})){const c=confirmationFor(confirmations,id,l),earlier=Number.isFinite(out[id]?.load)?out[id].load:null;if(c)out[id]={load:c.kg,convention:l.convention,reps:l.reps,confirmed:true,earlier,sessionId:r.sessionId};else if(Number.isFinite(l.load)||!l.unitUnknown&&l.convention==='BODYWEIGHT')out[id]={load:Number.isFinite(l.load)?l.load:null,convention:l.convention,reps:l.reps,earlier,sessionId:r.sessionId};}return out;};
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
function usedInWeek(week){return week.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>({id:e.id,mode:e.load.mode,value:e.load.value??null,convention:e.load.convention,reps:e.reps,sets:e.sets,rir:e.rir,practice:e.role==='PRACTICE'})));}
function reproject(program,sk,fromWeek,{runState,strengthState},{arrangementOverride=null,completedRuns=[]}={}){
 const prior=program.weeks.slice(0,fromWeek),{weeks,states}=projectWeeks(sk,fromWeek,{runState,strengthState},prior,{arrangementOverride,completedRuns});
 return {weeks:[...prior,...weeks],stateTrace:[...program.stateTrace.slice(0,fromWeek),...states]};
}
function finishProposal(program,sk,next,decision){
 const proposal=clone(program);proposal.weeks=next.weeks;proposal.stateTrace=next.stateTrace??program.stateTrace;
 if(next.schedule)proposal.schedule=clone(next.schedule);if(next.canonical)proposal.canonical=clone(next.canonical);if(next.templates)proposal.templates=clone(next.templates);if(next.arrangementSessions){proposal.arrangementSessions=clone(next.arrangementSessions);proposal.arrangement=Object.fromEntries(Object.entries(next.arrangementSessions).map(([k,v])=>[k,{id:v.id,quality:v.quality,perm:v.perm,runFirstOnShared:v.runFirstOnShared}]));}if(next.phases)proposal.phases=clone(next.phases);if(next.negotiation)proposal.negotiation=clone(next.negotiation);if(next.blocks)proposal.blocks=clone(next.blocks);if(next.goal)proposal.goal=clone(next.goal);
 // The completion negotiation follows the proposal's own race-week state, so a restart or a goal change applied by a review carries it (SSCTR D47).
 const rw=proposal.phases?.raceWeek,raceState=proposal.goal?.run?.event&&Number.isInteger(rw)?proposal.stateTrace[rw]?.run:null;
 const item=raceState?eventCompletionItem({...sk,goal:proposal.goal,plan:proposal.phases},raceState):null,list=proposal.negotiation??[],at=list.findIndex(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');
 if(at>=0||item)proposal.negotiation=at>=0?list.flatMap((n,i)=>i!==at?[n]:item?[item]:[]):[...list,item];
 proposal.revision=program.revision+1;proposal.decisions=[...program.decisions,decision];delete proposal.hash;proposal.hash=programHash(proposal);return proposal;
}
const changedSessions=(a,b)=>{let n=0;const old=new Map(a.weeks.flatMap(w=>w.sessions.map(s=>[s.id,hash(s.prescription)])));for(const w of b.weeks)for(const s of w.sessions)if(old.get(s.id)!==hash(s.prescription))n++;return n;};
function immutabilityErrors(program,next,asOfLocal){
 const errors=[],old=new Map(program.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));
 for(const w of next.weeks)for(const s of w.sessions){const o=old.get(s.id);if(o&&o.date<=asOfLocal&&hash(o.prescription)!==hash(s.prescription))errors.push('pastSessionRewritten:'+s.id);}
 for(const [id,o] of old)if(o.date<=asOfLocal&&!next.weeks.some(w=>w.sessions.some(s=>s.id===id)))errors.push('pastSessionRemoved:'+id);
 return errors;
}
function horizonSummary(sk,program,next,{w,changed}){
 const before=peakOf(program.weeks),after=peakOf(next.weeks),raceWeek=sk.plan.raceWeek,target=runTarget(sk);
 const lastStrength=weeks=>{const s=[...weeks].reverse().flatMap(x=>x.sessions).find(x=>x.sport==='STRENGTH'&&x.prescription&&x.prescription.exercises.some(e=>e.load.mode==='KNOWN'));return s?Object.fromEntries(s.prescription.exercises.filter(e=>e.load.mode==='KNOWN').map(e=>[e.id,e.load.value])):{};};
 return {H0_SESSION:changed?`${changed} future session prescription(s) differ; completed sessions unchanged`:'No session changes',H1_WEEK:`Week ${w+1}: planned run ${next.weeks[w+1]?.plannedRunMinutes??'-'} min (was ${program.weeks[w+1]?.plannedRunMinutes??'-'}), strength sets ${next.weeks[w+1]?.plannedStrengthSets??'-'} (was ${program.weeks[w+1]?.plannedStrengthSets??'-'})`,H2_BLOCK:`Block ${sk.blocks.find(b=>w+1>=b.startWeek&&w+1<b.endWeekExclusive)?.family??'-'} intent kept: ${BLOCK_INTENT[sk.plan.phases[w+1]]??'end of horizon'}`,H3_GOAL_EVENT:raceWeek!==null?`Long-run peak ${after.long} min (planned ${before.long}, target ${target}); race week ${next.weeks[raceWeek]?.sessions.some(s=>s.role==='RACE')?'intact':'missing'}`:`Final planned known loads ${JSON.stringify(lastStrength(next.weeks))} (planned ${JSON.stringify(lastStrength(program.weeks))}); long run ${after.long} (planned ${before.long})`};
}
const counter=(id,action,admissible,reason,extra={})=>({id,action,admissible,reason,selected:false,reversible:true,...extra});
/** Lexicographic choice: admissible → safety → H3 essential → H2 → H1 interference → change cost. No summed score. */
function choose(cands){
 const ok=cands.filter(c=>c.admissible);
 const key=c=>[c.clinical?1:0,c.h3Loss??0,c.h2Loss??0,rank(c.h1Worst??'NONE'),c.h0Loss??0,c.changeCount??0,c.order??0];
 const best=[...ok].sort((a,b)=>{const x=key(a),y=key(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;})[0]??null;
 for(const c of cands){c.selected=c===best;if(!c.selected&&!c.whyLost)c.whyLost=!c.admissible?c.reason:'Ranked lower on essential-stimulus preservation, interference or change cost'}
 return best;
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
  const n=normalizeObservations(review.observations??[],{athleteId:program.athleteId,asOf,prior:priorLedger,maximumAgeDays:36500,futureSkewSeconds:authority.policy.operational.learning.futureClockSkewSeconds,timezoneOffsetMinutes:tz});
  const {bound,unbound}=bindObservations(program,n.accepted,authority.policy.operational.hybrid,authority.policy),ledger=[...bound,...unbound];
  // Conflicted facts stay in the record but never count for gating counts, capacity or learning until corrected (QRE-R6-14).
  const usable=ledger.filter(o=>!o.conflicted),usableBound=bound.filter(o=>!o.conflicted);
  model=model??createLearningModel({athleteId:program.athleteId,purposeAllowed:consent,asOf,policy:authority.policy.operational.learning});
  if(allows(authority,'R6-PARTIAL-NOISY-LEARNING'))model=updateLearningModel(model,usableBound,{asOf,purposeAllowed:consent,timezoneOffsetMinutes:tz});
  const sk=skeletonOf(program,authority),ev=weekEvidence(program,w,asOfLocal,bound,n.quarantinedIdentities);
  const confirmations=loadConfirmationsOf(review.loadConfirmations);
  out={...base,updatedModel:model,actualLedger:ledger,provenance:{excluded:n.excluded,duplicates:n.duplicates,conflicts:n.conflicts,superseded:n.superseded,causalCutoff:n.causalCutoff},weekEvidence:ev,loadQuestions:[],inputHash:hash({programHash:program.hash,review})};
  const ctx={program,sk,review,kind,w,week,asOf,asOfLocal,ev,ledger:usable,fullLedger:ledger,model,consent,authority,out,confirmations,completedRuns:completedRuns(program,usable)};
  const decision=(HANDLERS[kind]??weeklyReview)(ctx);
  // Load questions follow the decision's own gates, so they never contradict the adoption the transition made (SSCTR D44).
  out.loadQuestions=loggedLoadQuestions(program,sk,w,ev,{gates:decision.gates??null,confirmations});
  if(decision.proposal){
   const from=decision.proposal.decisions.at(-1)?.fromWeek??w;
   const v=[...validateWeeks(decision.sk??sk,decision.proposal.weeks.filter(x=>x.index>=from)),...immutabilityErrors(program,decision.proposal,asOfLocal)];
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
 const systemic=systemicSignal||ev.systemicConvergence;
 // An athlete-specific pattern is learning: without learning consent it never changes the plan (QRE-R6-16).
 if(!ev.pending&&ctx.consent===true&&allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING')&&allows(ctx.authority,'R6-HYBRID-ARRANGEMENT')){
  const patterns=learnedInterference(ledger,asOf);
  if(patterns.length){
   const athleteSeverity=Object.fromEntries(patterns.map(x=>[x.cause,'HIGH']));
   const r=rebuild(ctx,{canonical:program.canonical,reason:'Learned athlete-specific pattern: '+patterns.map(x=>`${x.adverseWith} adverse key runs after "${x.cause.toLowerCase()}", ${x.compatibleWithout} compatible without it`).join('; ')+'. The arrangement changes for future weeks at the same doses (association, not causation).',action:'LEARNED_REARRANGEMENT',athleteSeverity});
   if(r.proposal&&hash(r.proposal.arrangementSessions)!==hash(program.arrangementSessions))return {...r,learnedPatterns:patterns};
  }
 }
 if(ev.pending)return {action:'KEEP',reason:(extraReason?extraReason+'; ':'')+'next-week steps are gated when this week’s remaining sessions are complete',counterfactuals:[counter('KEEP','KEEP',true,'Smallest effective decision mid-week',{selected:true}),counter('EARLY_GATE','HOLD_NEXT_STEP',false,'Gating before the week ends would treat future sessions as missed')]};
 const {gates,reasons}=weeklyGates(program,sk,w,ev,ledger,asOf,{systemic});
 const logs=loggedLoads(ev,ctx.confirmations),allAdvance=Object.values(gates).every(g=>g==='ADVANCE');
 const state=program.stateTrace[w],used=usedInWeek(program.weeks[w]);
 // A dimension with no executed session this week has no gate: it holds, it never counts as executed (QRE-R6-04).
 const evidenceGates={ALL:'HOLD',...gates};
 const nextState={runState:advanceRun(sk,state.run,w,evidenceGates),strengthState:advanceStrength(sk,state.strength,w,used,evidenceGates,logs)};
 const projected=reproject(program,sk,w+1,nextState,{completedRuns:ctx.completedRuns}),changed=changedSessions(program,projected);
 // An unconfirmed establishment load lives only in the state: a new or changed pending value needs a proposal to reach the next review (SSCTR D45).
 const pending=Object.keys(logs).filter(id=>Number.isFinite(nextState.strengthState.exercises[id]?.pendingLoad)),pendingMoved=pending.some(id=>nextState.strengthState.exercises[id].pendingLoad!==program.stateTrace[w+1]?.strength?.exercises?.[id]?.pendingLoad);
 const keepOk=allAdvance&&!changed&&!pendingMoved,knownChanged=allAdvance&&changed>0&&knownLoadsChanged(program,projected,w+1);
 const keep=counter('KEEP','KEEP',keepOk,keepOk?'Every gated session executed without adverse signal: the planned next step stands':allAdvance?'Logged loads differ from the planned loads or placeholders; keeping them would ignore executed evidence':'Planned next step would advance work that was not executed or tolerated as planned',{h3Loss:0,changeCount:0,order:0});
 const gated=counter('GATED_NEXT_STEP',allAdvance?(knownChanged?'ADOPT_LOGGED_LOADS':Object.keys(logs).length?'INSTANTIATE_LOGGED_LOADS':'KEEP'):'HOLD_OR_REGRESS_NEXT_STEP',true,'Smallest valid change: repeat or step back only the affected session types; everything else proceeds',{changeCount:changed,order:1,gates});
 const replan=counter('REBASE_BLOCK','LARGER_REPLAN',systemic&&Object.values(gates).filter(g=>g==='REGRESS').length>=2,'A wider rebase is justified only by repeated converging adverse evidence',{changeCount:changed+3,order:2});
 if(keepOk)return {action:'KEEP',reason:extraReason??'Executed as planned without adverse signal; the planned progression step stands',gates,counterfactuals:[{...keep,selected:true},{...gated,admissible:false,reason:'No difference from the plan'},replan],nextObservation:'Execute next week as planned; record actual minutes, sets, reps, loads, effort and next-day function'};
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
/** Same-week rearrangement among chosen days of the same sport: the coach reallocates content, never the athlete's days. */
function moveCandidates(ctx,target){
 const {program,asOfLocal,w}=ctx,week=program.weeks[w],later=week.sessions.filter(s=>s.sport===target.sport&&s.id!==target.id&&s.date>asOfLocal&&s.prescription&&!s.key&&!['RACE','REST_BY_DESIGN'].includes(s.role));
 return later.map(slot=>{
  const sessions=week.sessions.map(s=>s.id===slot.id?{...clone(target),id:slot.id,day:slot.day,date:slot.date,turn:slot.turn,backToBackOrder:slot.backToBackOrder,moved:{from:target.id}}:s.id===target.id?{...s,status:'SKIPPED',movedTo:slot.id}:s);
  const hybrid=ctx.authority.policy.operational.hybrid,before=interferenceCosts(week.sessions.filter(s=>s.prescription&&s.date>asOfLocal||s.id===target.id),{wrap:true,hybrid}),after=interferenceCosts(sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&(s.date>asOfLocal||s.id===slot.id)),{wrap:true,hybrid});
  const worst=list=>list.reduce((m,c)=>rank(c.severity)>rank(m)?c.severity:m,'NONE');
  return {slot,sessions,addedCost:rank(worst(after))>rank(worst(before))?worst(after):'NONE',costs:after};
 });
}
function missedSession(ctx){
 const {program,sk,w,asOfLocal,review}=ctx,target=targetSession(ctx);
 if(!target)return weeklyReview(ctx,{extraReason:'Missed work is recorded as zero; no debt and no compensation'});
 // A session the record shows as done cannot also be missed: ask which is right, never repeat its content (QRE-R6-15).
 if((ctx.fullLedger??ctx.ledger).some(o=>o.sessionId===target.id&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)))return {action:'ASK',reason:'The record already has an execution report for this session; confirm whether it was missed, or correct the report',missingInputs:['observations.correction'],counterfactuals:[counter('MOVE','MOVE',false,'Moving a session that was reported as executed would repeat its content'),counter('ASK','ASK',true,'Contradictory facts are asked about',{selected:true})]};
 const phase=sk.plan.phases[w],eventLate=['TAPER','RACE_WEEK'].includes(phase);
 const skip=counter('SKIP_NO_DEBT','KEEP',true,'Record zero work; the next comparable session repeats the last executed dose',{h3Loss:target.key&&phase==='SPECIFIC'?1:0,h2Loss:target.key?1:0,changeCount:0,order:0});
 const cands=[skip];
 if(target.key&&!eventLate)for(const m of moveCandidates(ctx,target)){
  const admissible=m.addedCost==='NONE'&&!['RACE_TOUCH','SHAKEOUT'].includes(target.role);
  cands.push(counter('MOVE_TO_'+m.slot.id,'MOVE',admissible,admissible?`Do the missed ${target.role.toLowerCase().replace('strength_','')} on ${m.slot.date} instead of the ${m.slot.role.toLowerCase().replace('strength_','')} session planned there; no new day, no added interference`:`Moving would add ${m.addedCost} interference`,{h3Loss:0,h2Loss:0,h1Worst:m.addedCost,changeCount:2,order:1,proposalSessions:m.sessions}));
 }
 cands.push(counter('STACK_OR_CATCH_UP','CATCH_UP',false,'Stacking missed work or adding it to next week creates load debt; never selected',{order:9}));
 const best=choose(cands);
 const gateReview=weeklyReview(ctx,{extraReason:'Missed work is recorded as zero; next step repeats without debt'});
 if(best.action==='MOVE'){
  const next={weeks:program.weeks.map((x,i)=>i===w?{...clone(x),sessions:best.proposalSessions}:x),stateTrace:program.stateTrace};
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
 const {program,sk,w,asOfLocal,review}=ctx,week=program.weeks[w],systemic=ctx.kind==='SYSTEMIC_FATIGUE',region=String(review.signals?.region??'LOWER').toUpperCase();
 const remaining=week.sessions.filter(s=>s.date>asOfLocal&&s.prescription);
 const sessions=week.sessions.map(s=>{
  if(!remaining.includes(s))return s;
  if(systemic&&s.sport==='RUN'&&['QUALITY','RACE_TOUCH'].includes(s.role)){const p=easyPrescription(Math.min(s.prescription.durationMinutes,ctx.sk.c.schedule.runMinutes),{cue:sk.op.run.effortCues.EASY_CONVERSATIONAL});return {...s,role:'EASY',key:false,prescription:p,plannedPrescriptionHash:hash(p),explanation:'Converging fatigue: the remaining hard run becomes easy'};}
  if(s.sport==='STRENGTH'){const ex=s.prescription.exercises.filter(e=>systemic?e.role==='MAIN':!(e.role!=='MAIN'&&(e.region===region||region==='ALL'))).map(e=>systemic?{...e,sets:Math.max(1,e.sets-1),rir:Math.max(e.rir,4)}:e);if(!ex.length||hash(ex)===hash(s.prescription.exercises))return s;const p=strengthPrescription(s.prescription.family,ex,{budget:ctx.sk.c.schedule.strengthMinutes,warmup:s.prescription.warmupMinutes,cooldown:s.prescription.cooldownMinutes,secondsPerRep:s.prescription.secondsPerRep,goalMode:s.prescription.goalMode,instructions:[systemic?'Converging fatigue: main lifts only, fewer sets, more reps in reserve':'Local fatigue: optional accessories for the affected region removed']});return {...s,prescription:p,plannedPrescriptionHash:hash(p)};}
  return s;
 });
 const changed=sessions.filter((s,i)=>hash(s)!==hash(week.sessions[i])).length;
 const keep=counter('KEEP','KEEP',!changed,'Nothing affected remains this week; monitor function',{order:0}),reduce=counter(systemic?'REMOVE_REMAINING_HARD_WORK':'REMOVE_AFFECTED_OPTIONAL','REDUCE',changed>0,systemic?'Remove the remaining hard suffix; keep easy participation':'Remove only optional local work for the affected region; essentials stay',{changeCount:changed,order:1}),wider=counter('BLOCK_ADJUSTMENT','LARGER_REPLAN',false,'No evidence yet that a wider change is necessary; repeated converging signals would justify it',{order:2});
 if(!changed){const g=weeklyReview(ctx,{systemicSignal:systemic});return {...g,reason:(systemic?'Converging fatigue signal: ':'Local fatigue: ')+g.reason,counterfactuals:[{...keep,selected:!g.proposal},reduce,wider,...(g.counterfactuals??[])]};}
 const next={weeks:program.weeks.map((x,i)=>i===w?{...clone(x),sessions}:x),stateTrace:program.stateTrace};
 reduce.selected=true;
 return {action:'REDUCE',reason:reduce.reason,proposal:finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'REDUCE',fromWeek:w,throughWeek:w,horizonsConsidered:HORIZONS}),counterfactuals:[keep,reduce,wider],horizons:{H0_SESSION:'Remaining affected work reduced',H1_WEEK:'Essential participation kept',H2_BLOCK:'Next week is gated by this week’s evidence at the weekly review',H3_GOAL_EVENT:'No goal change from one fatigue signal'},nextObservation:systemic?'Report function and recovery; if signals persist or include illness, pain or injury, route to qualified assessment':'Report whether local fatigue resolves before the next session of that region'};
}
/** Rebuilds future arrangements after an agenda/equipment/goal change, reusing the same state machines. */
function rebuild(ctx,{canonical,goal=ctx.program.goal,fromWeek=ctx.w+1,reason,action,athleteSeverity=null}){
 const {program,authority,review}=ctx,cap=program.capability,phases=goal.run.event?.date!==program.goal.run.event?.date||goal.run.kind!==program.goal.run.kind?planPhases({...canonical,goals:{run:{kind:goal.run.kind},strength:{kind:goal.strength.kind},event:goal.run.event}},cap,authority.policy.operational):program.phases;
 const mergedPhases={...phases,phases:[...program.phases.phases.slice(0,fromWeek),...phases.phases.slice(fromWeek)]},blocks=blocksFrom(mergedPhases.phases,goal.priorityByPhase);
 const templates=strengthTemplates(canonical,goal,{knownOnly:!allows(authority,'R6-LOAD-ESTABLISHMENT')});
 const sk=skeletonOf({...program,canonical,goal,phases:mergedPhases,blocks,templates,arrangementSessions:{}},authority);
 const severityAuthority=allows(authority,'R6-HYBRID-ARRANGEMENT'),contexts=[...new Set(mergedPhases.phases.slice(fromWeek).map((p,i)=>contextOf(mergedPhases.phases,fromWeek+i)))],arrangementSessions={},traces={},choices={};
 for(const context of contexts){
  const candidates=arrangementCandidates(canonical,cap,goal,context,sk,templates),lead=goal.priorityByPhase[context]?.lead??goal.baseLead;
  const doseKey=doseKeyOf(program.weeks[ctx.w]?.sessions.find(s=>s.role==='QUALITY'));
  const pref=ctx.model?.purposeAllowed&&doseKey?preferredArrangement(ctx.model,candidates,{sessionType:'RUN:QUALITY',phaseClass:phaseClassOf(authority.policy,context,'EASY'),doseKey},{asOf:ctx.asOf}):null;
  const choice=chooseBalanced(candidates,{lead,temporaryPreference:canonical.schedule.temporaryPreference??goal.temporaryPreference,severityAuthority,hybrid:authority.policy.operational.hybrid,athleteSeverity,athleteEvidence:pref?.preferredId?pref:null,currentId:program.arrangement?.[context]?.id??null,context:{eventPhase:EVENT_PHASES.includes(context),strengthDevelopment:goal.strength.development,runDevelopment:goal.run.development,runRole:goal.run.kind==='NONE'?'MAINTAIN':'PRIMARY',strengthRole:EVENT_PHASES.includes(context)||goal.strength.kind==='MAINTAIN'?'MAINTAIN':'PRIMARY'}});
  traces[context]={basis:choice.basis,reason:choice.reason,selectedId:choice.selected?.id??null};choices[context]=choice;
  if(choice.askRequired)return {action:'ASK',reason:'The new agenda creates a genuine run/strength trade-off; a temporary preference is needed',missingInputs:['schedule.temporaryPreference'],question:choice.question,counterfactuals:choice.counterfactuals.slice(0,8)};
  if(!choice.selected)return {action:'ASK',reason:'No admissible arrangement for the new agenda',missingInputs:['schedule'],counterfactuals:choice.counterfactuals.slice(0,8)};
  arrangementSessions[context]=choice.selected;
 }
 sk.arrangement={...program.arrangementSessions,...arrangementSessions};sk.templates=templates;
 const state=program.stateTrace[Math.min(fromWeek,program.stateTrace.length-1)],prevWeek=fromWeek-1;
 const gates=ctx.ev.pending?{ALL:'HOLD'}:weeklyGates(program,skeletonOf(program,authority),ctx.w,ctx.ev,ctx.ledger,ctx.asOf).gates,evidenceGates={ALL:'HOLD',...gates};
 const startState=fromWeek===ctx.w+1?{runState:advanceRun(sk,program.stateTrace[ctx.w].run,ctx.w,evidenceGates),strengthState:advanceStrength(sk,program.stateTrace[ctx.w].strength,ctx.w,usedInWeek(program.weeks[ctx.w]),evidenceGates,loggedLoads(ctx.ev,ctx.confirmations))}:{runState:state.run,strengthState:state.strength};
 const projected=reproject(program,sk,fromWeek,startState,{completedRuns:ctx.completedRuns});
 const disclosures=arrangementDisclosures(choices),negotiation=[...(program.negotiation??[]).filter(n=>n.id!=='ARRANGEMENT_COST_DISCLOSED'||!contexts.includes(n.context)),...disclosures];
 const next={...projected,schedule:canonical.schedule,canonical,templates,arrangementSessions:sk.arrangement,phases:mergedPhases,blocks,goal,negotiation};
 const applied=fromWeek===ctx.w+1?gates:null;
 const proposal=finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action,fromWeek,reason,arrangement:traces,horizonsConsidered:HORIZONS,...(applied?{gates:applied}:{})});
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
 return errors;
}
function scheduleChange(ctx){
 const {program,review}=ctx,ch=review.changes,s=program.canonical.schedule;
 if(!ch||typeof ch!=='object'||Array.isArray(ch))return {action:'ASK',reason:'Say which days, shifts or times changed',missingInputs:['changes']};
 const norm={...ch,...(typeof ch.runTurn==='string'?{runTurn:ch.runTurn.toUpperCase()}:{}),...(typeof ch.strengthTurn==='string'?{strengthTurn:ch.strengthTurn.toUpperCase()}:{}),...(typeof ch.temporaryPreference==='string'?{temporaryPreference:ch.temporaryPreference.toUpperCase().replace('_FIRST','')}:{})};
 const schedule={...clone(s),...Object.fromEntries(['runDays','strengthDays','runTurn','strengthTurn','runMinutes','strengthMinutes','longRunDay','longRunMinutes','sameTurnConfirmed','temporaryPreference'].filter(k=>norm[k]!==undefined).map(k=>[k,clone(norm[k])]))};
 const invalid=scheduleChangeErrors(ch,schedule);
 if(invalid.length)return {action:'ASK',reason:'The new schedule has values the plan cannot use ('+invalid.join(', ')+'); nothing is re-planned until they are corrected',missingInputs:invalid.map(k=>'changes.'+k),counterfactuals:[counter('REARRANGE_FUTURE_WEEKS','REARRANGE_FUTURE_WEEKS',false,'Invalid days, shifts or times would produce sessions the athlete did not choose')]};
 schedule.runDays=[...schedule.runDays].sort((a,b)=>a-b);schedule.strengthDays=[...schedule.strengthDays].sort((a,b)=>a-b);
 schedule.sharedDays=schedule.runDays.filter(d=>schedule.strengthDays.includes(d));
 if(schedule.longRunDay!==null&&schedule.longRunDay!==undefined&&!schedule.runDays.includes(schedule.longRunDay))schedule.longRunDay=schedule.runDays.at(-1)??null;
 if(!schedule.runDays.length&&program.capability.run.programmed||!schedule.strengthDays.length&&program.capability.strength.programmed)return {action:'ASK',reason:'A programmed sport has no chosen day left; confirm whether to pause it or choose a day',missingInputs:['schedule.days']};
 if(hash(schedule)===hash(s))return {action:'KEEP',reason:'The new schedule matches the current one',counterfactuals:[counter('KEEP','KEEP',true,'No change',{selected:true})]};
 return rebuild(ctx,{canonical:{...clone(program.canonical),schedule},reason:'New chosen days or shifts: same doses rearranged on the new days from next week; this week’s remaining sessions are not moved onto days the athlete removed',action:'REARRANGE_FUTURE_WEEKS'});
}
function unavailableDay(ctx){
 const {program,sk,w,review,asOfLocal}=ctx,dates=new Set(Array.isArray(review.changes?.unavailableDates)?review.changes.unavailableDates:[]),week=program.weeks[w];
 const hit=week.sessions.filter(s=>dates.has(s.date)&&s.date>asOfLocal&&s.prescription);
 if(!hit.length)return {action:'KEEP',reason:'No planned session falls on the unavailable date',counterfactuals:[counter('KEEP','KEEP',true,'Nothing to move',{selected:true})]};
 if(hit.some(s=>s.role==='RACE'))return {action:'ASK',reason:'The race date is marked unavailable; confirm whether the race still happens on that date or the new date',missingInputs:['event.date'],counterfactuals:[counter('SKIP_RACE','SKIP',false,'Dropping the athlete’s event is their decision, never a scheduling default'),counter('ASK','ASK',true,'The event date is the athlete’s decision',{selected:true})]};
 let sessions=clone(week.sessions);const cands=[];
 for(const target of hit){
  const skip=counter('SKIP_'+target.id,'SKIP',true,'Skip without debt; the next comparable session repeats the last executed dose',{h2Loss:target.key?1:0,order:0});
  const moves=target.key?moveCandidates({...ctx,program:{...program,weeks:program.weeks.map((x,i)=>i===w?{...x,sessions}:x)}},target).filter(m=>!dates.has(m.slot.date)).map(m=>counter('MOVE_'+target.id+'_TO_'+m.slot.id,'MOVE',m.addedCost==='NONE',m.addedCost==='NONE'?'Same session on a later chosen day of the same sport, replacing an easy session':'Added interference '+m.addedCost,{h1Worst:m.addedCost,changeCount:2,order:1,proposalSessions:m.sessions})):[];
  const best=choose([skip,...moves]);cands.push(skip,...moves);
  sessions=best.proposalSessions??sessions.map(s=>s.id===target.id?{...s,status:'SKIPPED',explanation:'Unavailable date; skipped without debt'}:s);
 }
 const next={weeks:program.weeks.map((x,i)=>i===w?{...clone(x),sessions}:x),stateTrace:program.stateTrace};
 const proposal=finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'RESCHEDULE_WITHIN_WEEK',fromWeek:w,throughWeek:w,horizonsConsidered:HORIZONS});
 return {action:'RESCHEDULE_WITHIN_WEEK',reason:'Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt',proposal,counterfactuals:cands.map(({proposalSessions,...c})=>c),horizons:{H0_SESSION:'Unavailable sessions handled',H1_WEEK:'No new day and no stacked work',H2_BLOCK:'Next step gated at the weekly review',H3_GOAL_EVENT:'Unchanged'}};
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
 const equipment=[...new Set((review.changes?.equipment??program.canonical.athlete.equipment).map(e=>String(e).toUpperCase()))].sort(),from=review.changes?.from??asOfLocal,to=review.changes?.to??null,permanent=!to;
 const canonical=clone(program.canonical);
 if(permanent)canonical.athlete.equipment=equipment;else canonical.equipmentWindows=[...(canonical.equipmentWindows??[]),{from,to,equipment}];
 const templates=permanent?strengthTemplates(canonical,program.goal,{knownOnly:!allows(authority,'R6-LOAD-ESTABLISHMENT')}):program.templates;
 const sk2=skeletonOf({...program,canonical,templates},authority);
 const start=program.stateTrace[w],projected=projectWeeks(sk2,w,{runState:start.run,strengthState:start.strength},program.weeks.slice(0,w),{completedRuns:ctx.completedRuns});
 const swaps=[],omitted=[];
 const weeks=program.weeks.map((wk,i)=>{
  if(i<w)return wk;
  const p=projected.weeks[i-w],sessions=wk.sessions.map(s=>{
   if(s.sport!=='STRENGTH'||s.date<=asOfLocal)return s;
   const n=p.sessions.find(x=>x.id===s.id)??s,before=s.prescription?.exercises??[],after=n.prescription?.exercises??[];
   for(const e of before)if(!after.some(x=>x.id===e.id)){const sub=after.find(x=>x.pattern===e.pattern&&!before.some(y=>y.id===x.id));if(sub)swaps.push({sessionId:s.id,date:s.date,from:e.id,to:sub.id,pattern:e.pattern,requiresEstablishment:sub.load.mode==='ESTABLISH',stimulusChange:sub.load.mode==='BODYWEIGHT'&&e.load.mode!=='BODYWEIGHT'?'Bodyweight practice is a different stimulus, not an equivalent load':null});else omitted.push({sessionId:s.id,date:s.date,exerciseId:e.id,pattern:e.pattern});}
   return n;
  });
  return {...clone(wk),sessions,plannedStrengthSets:sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription).reduce((n,x)=>n+x.prescription.exercises.reduce((m,e)=>m+e.sets,0),0)};
 });
 const inWindow=swaps.filter(x=>x.date>=from&&(!to||x.date<=to));
 if(!inWindow.length&&!omitted.length)return {action:'KEEP',reason:'Planned exercises already fit the available equipment',counterfactuals:[counter('KEEP','KEEP',true,'No change needed',{selected:true})]};
 const stateTrace=program.stateTrace.map((st,i)=>i<w?st:{run:st.run,strength:projected.states[i-w].strength});
 const substitutions=[...new Map(inWindow.map(x=>[x.from+'>'+x.to,{exerciseId:x.from,selected:x.to,pattern:x.pattern,requiresEstablishment:x.requiresEstablishment,stimulusChange:x.stimulusChange,reason:`Same ${x.pattern.toLowerCase()} intent with available equipment${x.requiresEstablishment?'; the new task starts with effort-guided establishment':''}; no load is converted`}])).values()];
 const proposal=finishProposal(program,sk2,{weeks,stateTrace,canonical,templates},{eventId:review.event.id,asOf:ctx.asOf,action:'SUBSTITUTE',fromWeek:w,window:{from,to},permanent,swaps:inWindow,omitted,horizonsConsidered:HORIZONS});
 return {action:'SUBSTITUTE',reason:'Equipment changed: same-intent substitutes '+(permanent?'from now on':`from ${from} to ${to}`)+'; unfamiliar ones are established by effort; the stimulus change is disclosed',proposal,sk:sk2,substitutions,counterfactuals:[counter('KEEP','KEEP',false,'Prescribing unavailable equipment is never valid'),counter('OMIT_STRENGTH','OMIT',false,'Omitting the session loses the strength stimulus when a same-intent substitute exists'),counter('SUBSTITUTE','SUBSTITUTE',true,'Same-intent substitutes that persist through later reviews',{selected:true})],horizons:{H0_SESSION:`${inWindow.length} exercise substitution(s)${omitted.length?`, ${omitted.length} pattern(s) without a substitute disclosed`:''}`,H1_WEEK:'Session count and days unchanged; running unchanged',H2_BLOCK:'No progression on a substitute in its first exposure; originals resume after a temporary window from their last logged load',H3_GOAL_EVENT:'Strength goal continues through same-intent movements'}};
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
 if(ctx.kind==='EVENT_DATE_CHANGE'&&ch.eventDate!==undefined&&!c.goals.event)invalid.push('event');
 if(invalid.length)return {action:'ASK',reason:'The new goal or event is not one the plan can use ('+invalid.join(', ')+'); say the goal and the event date',missingInputs:invalid};
 const run=ch.goals?.run!==undefined?RUN_GOALS[key(word(ch.goals.run))]:c.goals.run.kind,strength=ch.goals?.strength!==undefined?STRENGTH_GOALS[key(word(ch.goals.strength))]:c.goals.strength.kind;
 const event=ch.event===null?null:ch.event?{kind:EVENTS[key(ch.event.kind)],date:ch.event.date,timeGoalMinutes:ch.event.timeGoalMinutes??null}:ctx.kind==='EVENT_DATE_CHANGE'&&ch.eventDate?{...c.goals.event,date:ch.eventDate}:c.goals.event;
 if(event&&(!['10K','HALF_MARATHON'].includes(event.kind)||dayGap(c.startDate,event.date)>=program.weeks.length*7||dayGap(ctx.asOfLocal,event.date)<7))return {action:'ASK',reason:'The new event is outside this program horizon or too close to plan safely; a new program input is needed',missingInputs:['newProgramInput']};
 if(event&&!allows(ctx.authority,'R6-EVENT-TRANSITION'))return {action:'UNSUPPORTED',status:'UNSUPPORTED',reason:'Event transition authority unavailable'};
 const goalKey=g=>hash({run:g.run.kind,strength:g.strength.kind,event:g.event?{kind:g.event.kind,date:g.event.date}:null});
 const before=goalKey(c.goals);
 c.goals={run:{kind:event?'RACE':run==='RACE'?'PERFORMANCE':run,raw:run},strength:{kind:strength,raw:strength},event};
 if(goalKey(c.goals)===before)return {action:'KEEP',reason:'The supplied goal and event match the current ones; nothing to re-plan'};
 const goal=buildGoalModel(c),newPhases=planPhases(c,program.capability,ctx.authority.policy.operational);
 if(event&&newPhases.raceWeek<=ctx.w)return {action:'ASK',reason:'The new date falls inside the current week; confirm the event plan',missingInputs:['event.date']};
 return rebuild(ctx,{canonical:c,goal,reason:'Goal or event date changed: future phases, priorities and arrangements are re-planned from the current state; completed weeks stay as they were',action:'REPLAN_FUTURE_PHASES'});
}
/** Nonclinical return: current evidence is the start, prior tolerated dose the ceiling; no universal percentage rollback. */
function returnAfterPause(ctx){
 const {program,sk,w,review,asOfLocal}=ctx,i=review.interruption&&typeof review.interruption==='object'&&!Array.isArray(review.interruption)?review.interruption:{},R=sk.op.return;
 const screen=screenInterruptionReason({reason:i.reason,reasonCategory:i.reasonCategory,nonclinical:i.nonclinical??null,clinicalReason:i.clinicalReason??null});
 if(screen.status==='CLINICAL')return {action:'CLINICAL_HUMAN_REQUIRED',status:'CLINICAL_HUMAN_REQUIRED',reason:'The interruption reason is clinical or possibly clinical'+(screen.matched.length?' ('+screen.matched.join(', ')+')':'')+': qualified assessment is needed; no nonclinical return recipe',screen};
 if(!allows(ctx.authority,'R6-NONCLINICAL-RETURN'))return {action:'UNSUPPORTED',status:'UNSUPPORTED',reason:'Nonclinical return authority unavailable'};
 if(screen.status==='ASK')return {action:'ASK',reason:screen.basis==='MISSING_REASON'?'Say what interrupted training (for example travel, work, family, illness or injury) before a nonclinical restart':'The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness',missingInputs:['interruption.reasonCategory'],screen};
 // Interruption facts out of range or contradicting each other are asked, never resolved to the least conservative class (QRE-R6-06).
 const invalid=[];
 if(i.days!==undefined&&i.days!==null&&!(Number.isInteger(i.days)&&i.days>=1&&i.days<=3650))invalid.push('interruption.days');
 for(const k of ['startDate','endDate'])if(i[k]!==undefined&&i[k]!==null&&!isoDay(i[k]))invalid.push('interruption.'+k);
 if(!invalid.length&&isoDay(i.startDate)&&isoDay(i.endDate)&&dayGap(i.startDate,i.endDate)<0)invalid.push('interruption.startAfterEnd');
 if(!invalid.length&&isoDay(i.endDate)&&dayGap(asOfLocal,i.endDate)>0)invalid.push('interruption.endAfterThisReview');
 if(!invalid.length&&isoDay(i.startDate)&&dayGap(asOfLocal,i.startDate)>0)invalid.push('interruption.startAfterThisReview');
 if(!invalid.length&&Number.isInteger(i.days)&&isoDay(i.startDate)&&isoDay(i.endDate)&&Math.abs(i.days-(dayGap(i.startDate,i.endDate)+1))>1)invalid.push('interruption.daysContradictDates');
 if(invalid.length)return {action:'ASK',reason:'The interruption facts are out of range or contradict each other ('+invalid.join(', ')+'); say when it started and when it ended',missingInputs:invalid,screen};
 // Without an end date the interruption ended the day before this return review.
 const end=isoDay(i.endDate)?i.endDate:onDate(asOfLocal,-1),start=isoDay(i.startDate)?i.startDate:null;
 const days=Number.isInteger(i.days)?i.days:start?dayGap(start,end)+1:null;
 if(days===null)return {action:'ASK',reason:'The interruption length decides the re-entry stage; supply start and end dates',missingInputs:['interruption.days']};
 const assessedDay=dayOf(review.eligibility?.assessedAt);
 if(!assessedDay||dayGap(end,assessedDay)<0)return {action:'ASK',reason:'Eligibility must be assessed on or after the interruption ended',missingInputs:['eligibility.assessedOnOrAfterInterruptionEnd']};
 const pauseStart=start??onDate(end,-(days-1)),demo=review.currentDemonstration,demoDay=String(demo?.observedAt??'').slice(0,10);
 // A current demonstration is a completed conversational easy run with compatible response and function, observed after the interruption began.
 // A demonstration shorter than the minimum easy session demonstrates no easy-run capacity (QRE-R6-06: out-of-range return facts).
 const demoOk=!!demo&&(demo.sport??demo.modality??demo.prescription?.modality)==='RUN'&&R.demonstration.families.includes(demo.family??demo.prescription?.family)&&demo.completed===true&&(demo.minutes??demo.prescription?.durationMinutes)>=sk.op.run.minimumSessionMinutes&&(['CONVERSATIONAL','EASY','ON_TARGET'].includes(String(demo.effort??'').toUpperCase())||demo.prescription?.effortDomain==='EASY_CONVERSATIONAL')&&demo.response==='COMPATIBLE'&&demo.ordinaryFunction==='COMPATIBLE'&&demo.nextDayFunction==='NORMAL'&&isoDay(demoDay)&&dayGap(pauseStart,demoDay)>=0&&dayGap(demoDay,asOfLocal)>=0&&dayGap(demoDay,asOfLocal)<=R.currentDemonstrationMaxAgeDays;
 const cls=days<=R.shortMaxDays?'SHORT':days<=R.moderateMaxDays?'MODERATE':'LONG';
 const pauseWeek=Math.max(0,Math.min(w,Math.floor(dayGap(program.startDate,pauseStart)/7))),prior=program.stateTrace[pauseWeek]??program.stateTrace[0];
 let runState=clone(prior.run),strengthState=clone(prior.strength);
 const demoMinutes=demoOk&&Number.isFinite(demo.minutes??demo.prescription?.durationMinutes)?Math.min(demo.minutes??demo.prescription.durationMinutes,prior.run.easy??R.entryRunMinutes*2):null;
 if(cls==='SHORT'){/* resume last completed doses; the next step waits for observed execution */}
 else if(cls==='MODERATE'){
  if(runState.mode==='EASY'){const entry=Math.max(R.entryRunMinutes,demoMinutes??R.entryRunMinutes);runState={...runState,mode:'RETURN',returnStep:0,returnFrom:{easy:Math.min(entry,runState.easy??entry),long:runState.long!==null?Math.min(runState.long,entry+5):null},returnTo:{mode:'EASY',easy:runState.easy,long:runState.long,walks:runState.walks,qualityStep:runState.qualityStep,specificStep:runState.specificStep}};}
  else if(runState.mode==='WALK_JOG')runState.walkStep=Math.max(0,runState.walkStep-1);
  strengthState={...strengthState,exercises:Object.fromEntries(Object.entries(strengthState.exercises).map(([id,ex])=>[id,startStrengthReturn(ex)]))};
 }else{
  // A restart begins from current capacity: runs before the break no longer count as reached, so the race statement (SSCTR D47) and the
  // taper, race-week, race-day and next-block doses come only from runs executed after it (author-found with D47).
  runState={...runState,mode:runState.mode==='WALK_JOG'?'WALK_JOG':'RESTART',restart:demoMinutes??R.entryRunMinutes,walkStep:0,longestContinuous:0,achieved:{long:null,easy:null,quality:null,strides:0}};
  strengthState={...strengthState,exercises:Object.fromEntries(Object.entries(strengthState.exercises).map(([id,ex])=>[id,startStrengthReturn(ex)]))};
 }
 const returnRuns=[...ctx.completedRuns,...(demoMinutes?[{date:demoDay,minutes:demo.minutes??demoMinutes,source:'CURRENT_DEMONSTRATION'}]:[])];
 const futureThisWeek=program.weeks[w].sessions.filter(s=>s.date>asOfLocal&&s.prescription).length,fromWeek=futureThisWeek>=2||w+1>=program.weeks.length?w:w+1;
 let next;
 if(fromWeek===w){// re-entry starts inside this week: only its future sessions change
  const projected=projectWeeks(sk,w,{runState,strengthState},program.weeks.slice(0,w),{completedRuns:returnRuns});
  const current={...projected.weeks[0],sessions:projected.weeks[0].sessions.map(s=>s.date>asOfLocal?s:program.weeks[w].sessions.find(x=>x.id===s.id)??s)};
  next={weeks:[...program.weeks.slice(0,w),current,...projected.weeks.slice(1)],stateTrace:[...program.stateTrace.slice(0,w),...projected.states]};
 }else next=reproject(program,sk,fromWeek,{runState,strengthState},{completedRuns:returnRuns});
 if(cls==='SHORT'){// the first run back is easy
  const wk=next.weeks[fromWeek],q=wk.sessions.find(s=>s.date>asOfLocal&&s.role==='QUALITY');
  if(q){const p=easyPrescription(Math.min(q.prescription.durationMinutes,sk.c.schedule.runMinutes),{cue:sk.op.run.effortCues.EASY_CONVERSATIONAL});Object.assign(q,{role:'EASY',key:false,prescription:p,plannedPrescriptionHash:hash(p),explanation:'First quality slot after a short break runs easy'});}
 }
 const eventSoon=sk.plan.raceWeek!==null&&sk.plan.raceWeek-fromWeek<=3&&sk.plan.raceWeek>=fromWeek;
 const proposal=finishProposal(program,sk,next,{eventId:review.event.id,asOf:ctx.asOf,action:'REESTABLISH',fromWeek,interruption:{days,class:cls,nonclinical:true,screen},demonstrationUsed:!!demoMinutes,horizonsConsidered:HORIZONS});
 return {action:'REESTABLISH',reason:`${cls.toLowerCase()} nonclinical interruption (${days} days): ${cls==='SHORT'?'resume the last completed doses; no step until execution is observed':cls==='MODERATE'?`re-entry from ${demoMinutes?'the current demonstration':'the reviewed entry dose'}, returning to the prior tolerated dose in ${R.moderateStepsToPrior} conditional steps`:'restart from current capacity; prior doses are only a ceiling'}`,proposal,counterfactuals:[counter('RESUME_PRIOR_PLAN','KEEP',cls==='SHORT','Resuming the planned (higher) week restores dose by elapsed time',{selected:false}),counter('PERCENT_ROLLBACK','ROLLBACK',false,'A universal percentage rollback is not an approved rule'),counter('REESTABLISH','REESTABLISH',true,'Current evidence first, prior tolerance as ceiling',{selected:true}),counter('CLINICAL_ROUTE','CLINICAL',false,'The interruption reason screened nonclinical ('+screen.matched.join(', ')+') and no current clinical flag is present')],horizons:{H0_SESSION:'First sessions back are easy and effort-governed',H1_WEEK:'No quality or heavy loading in the entry step',H2_BLOCK:`Prior dose reached in ${cls==='SHORT'?1:R.moderateStepsToPrior} conditional step(s)`,H3_GOAL_EVENT:eventSoon?'The event is close: the plan aims at completion and cannot catch up missed preparation':'Goal trajectory continues after re-establishment'},missingInputs:[],nextObservation:'Record minutes, effort and next-day function after each return session; any pain, illness or abnormal symptom routes to qualified assessment'};
}
function eventWeekConflict(ctx){
 const {program,sk,w,asOfLocal,review}=ctx,raceWeek=sk.plan.raceWeek,week=program.weeks[w],dates=new Set(Array.isArray(review.changes?.unavailableDates)?review.changes.unavailableDates:[]);
 if(raceWeek===null)return weeklyReview(ctx);
 // The race day itself unavailable is a question about the event, never silently kept (QRE-R6-18).
 if(dates.has(onDate(program.startDate,raceWeek*7+sk.plan.raceDay)))return {action:'ASK',reason:'The race date is marked unavailable; confirm whether the race still happens on that date or the new date',missingInputs:['event.date'],counterfactuals:[counter('KEEP','KEEP',false,'Keeping a race on a day the athlete cannot attend ignores the stated fact'),counter('ASK','ASK',true,'The event date is the athlete’s decision',{selected:true})]};
 const sessions=week.sessions.map(s=>dates.has(s.date)&&s.date>asOfLocal&&s.role!=='RACE'?{...s,status:'SKIPPED',explanation:'Unavailable in the event period: skipped; nothing is added elsewhere'}:s);
 const changed=sessions.some((s,i)=>s.status!==week.sessions[i].status);
 if(!changed)return {action:'KEEP',reason:'Protect the event horizon: no new load, no catch-up',counterfactuals:[counter('KEEP','KEEP',true,'Freshness and the race come first',{selected:true}),counter('CATCH_UP','CATCH_UP',false,'Catch-up work near the event is never selected')]};
 const proposal=finishProposal(program,sk,{weeks:program.weeks.map((x,i)=>i===w?{...clone(x),sessions}:x),stateTrace:program.stateTrace},{eventId:review.event.id,asOf:ctx.asOf,action:'SKIP_NO_CATCH_UP',fromWeek:w,throughWeek:w,horizonsConsidered:HORIZONS});
 return {action:'SKIP_NO_CATCH_UP',reason:'Event period conflict: the affected session is skipped, the race and freshness are protected, nothing is stacked',proposal,counterfactuals:[counter('MOVE_INTO_TAPER','MOVE',false,'Moving work closer to the race adds fatigue when it should fall'),counter('SKIP_NO_CATCH_UP','SKIP',true,'Smallest safe change',{selected:true})]};
}
function recovered(ctx){return weeklyReview(ctx,{extraReason:'Recovered label noted; the next step still follows executed evidence'});}
const HANDLERS={WEEKLY_REVIEW:weeklyReview,MISSED_SESSION:missedSession,PARTIAL_SESSION:ctx=>weeklyReview(ctx,{extraReason:'Partial execution counts only what was done; the next comparable step repeats'}),UNDERPERFORMANCE:performanceSignal,PROGRESSION_NOT_TOLERATED:performanceSignal,OVERPERFORMANCE:performanceSignal,PROGRESSION_TOO_EASY:performanceSignal,LOCAL_FATIGUE:fatigue,SYSTEMIC_FATIGUE:fatigue,SCHEDULE_CHANGE:scheduleChange,UNAVAILABLE_DAY:unavailableDay,DOUBLE_CONFLICT:doubleConflict,EQUIPMENT_CHANGE:equipmentChange,GOAL_CHANGE:goalChange,EVENT_DATE_CHANGE:goalChange,RETURN_AFTER_PAUSE:returnAfterPause,EVENT_WEEK_CONFLICT:eventWeekConflict,RECOVERED:recovered};
