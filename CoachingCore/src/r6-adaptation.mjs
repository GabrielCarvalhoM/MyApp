import {clone,freeze,hash} from './value.mjs';
import {r6Authority,allows} from './r6-authority.mjs';
import {validProgram,programHash,skeletonOf,noviceDensityApplies,slotsInUse,advanceRun,advanceStrength,strengthAtBreak,historicalStrength,historicalRun,loggedLoadDecision,adoptionBasis,asEstablishment,heldKnownLoad,resolveExercisePrescription,dayPhaseOf,startStrengthReturn,eventCompletionItem,validateWeeks,peakOf,contextOf,arrangementCandidates,arrangementDisclosures,strengthTemplates,planPhases,buildGoalModel,blocksFrom,goalDose,runTarget,runMinutesOf,plannedOf,plannedStrengthOf,anchoredStart,projectedStart,WEEK_START,EVENT_PHASES,DEVELOPMENT,BLOCK_INTENT} from './r6-program.mjs';
import {chooseBalanced,interferenceCosts,SEVERITY} from './r6-balanced.mjs';
import {substitutesFor,catalogueEntry,CATALOGUE as CATALOG_CONFIGURATIONS} from './r6-catalogue.mjs';
import {exerciseRow,fitStrengthSession,strengthPrescription,easyPrescription,validateR6Prescription} from './r6-prescription.mjs';
import {aheadOf,usedInWeek,rebasedNext,returnOf,beforeReturn,moveCandidates,choose,counter,rank,fatigueSessions,unavailableSessions,missedMove,conflictSessions,waitSessions,adaptThisWeek,adaptation,withContextChange,composeWeeks,weekAsPlanned,conditionalNext} from './r6-composition.mjs';
import {createLearningModel,updateLearningModel,validateLearningModel,evidenceFor,preferredArrangement,classify} from './r6-learning.mjs';
import {normalizeObservations,utcTimestamp,localDate} from './r6-provenance.mjs';
import {onDate,dayGap,isoDay,LB_TO_KG,toKilograms,RUN_GOALS,STRENGTH_GOALS,EVENTS} from './r6-intake.mjs';
import {screenInterruptionReason,isYes} from './r6-clinical.mjs';
import {repertoireAuthority,repertoireBinding,allowsCandidate,NO_KG_CONVENTIONS,incrementFor,kgText,configurationOf,ladderNext,ladderDown,ladderChangesSubpattern,admitted,skillRank,RUN_CLASS_THRESHOLDS,ROTATION_DEFERRED_PHASES} from './r7b-repertoire.mjs';

export const REVIEW_VERSION='R6-REVIEW-1';
const KIND_ALIASES={REVIEW:'WEEKLY_REVIEW',MISSED_ESSENTIAL:'MISSED_SESSION',MISSED_OPTIONAL:'MISSED_SESSION',RETURN:'RETURN_AFTER_PAUSE',CONFLICT:'DOUBLE_CONFLICT',DOUBLE_INFEASIBLE:'DOUBLE_CONFLICT',EVENT_NEAR:'EVENT_WEEK_CONFLICT',SESSION_MOVED:'UNAVAILABLE_DAY',TRAVEL:'EQUIPMENT_CHANGE',SUBSTITUTION_NEED:'EQUIPMENT_CHANGE'};
export const REVIEW_KINDS=['WEEKLY_REVIEW','MISSED_SESSION','PARTIAL_SESSION','UNDERPERFORMANCE','OVERPERFORMANCE','PROGRESSION_NOT_TOLERATED','PROGRESSION_TOO_EASY','LOCAL_FATIGUE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE','UNAVAILABLE_DAY','DOUBLE_CONFLICT','EQUIPMENT_CHANGE','GOAL_CHANGE','EVENT_DATE_CHANGE','RETURN_AFTER_PAUSE','EVENT_WEEK_CONFLICT','RECOVERED','EXERCISE_SUBSTITUTION'];
const HORIZONS=['H0_SESSION','H1_WEEK','H2_BLOCK','H3_GOAL_EVENT'];
const CLINICAL_KEYS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
export const sessionType=s=>s.sport==='RUN'?'RUN:'+s.role:'STRENGTH:'+(s.templateType??s.prescription?.family??'SESSION');
const RUN_GATE_ROLE={LONG:'LONG',QUALITY:'QUALITY',EASY:'EASY',WALK_JOG:'WALK_JOG'};
/** Gate precedence (decision authority closure, QE-R7ASC-03): a gate that stops progression outranks one that allows it. */
const GATE_ORDER={EARNED:0,ADVANCE:1,HOLD:2,REGRESS:3};

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
  const conv=planned.load.convention,raw=NO_KG_CONVENTIONS.includes(conv)?[]:sets.map(x=>typeof x.load==='number'?x.load:x.load?.value).filter(Number.isFinite);
  // Unit and convention decide whether a value can be read; its size is judged later (an implausible value is asked, not unknown).
  // Bodyweight, band and assistance rows carry no kilogram: a logged band or assistance value is never read as a load (B0-C04).
  const read=x=>{const l=x.load;if(l===undefined||l===null||NO_KG_CONVENTIONS.includes(conv))return {kg:null,unknown:false};if(typeof l==='number')return Number.isFinite(l)?{kg:l,unknown:false}:{kg:null,unknown:true};
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
function loggedLoadQuestions(program,sk,w,ev,{gates=null,confirmations={},base=null}={}){
 // The week's start as the decision read it (PlanningView, state model), so a question follows the adoption the transition made.
 const used=usedInWeek(program.weeks[w]),state=(base??program.stateTrace[w])?.strength?.exercises??{},out=[],G=gates?{ALL:'HOLD',...gates}:null,deciding=loggedLoads(ev,confirmations);
 for(const row of ev.rows)for(const [id,l] of Object.entries(row.logs??{})){
  const c=confirmationFor(confirmations,id,l);
  if(l.unitUnknown&&!c){out.push({exerciseId:id,sessionId:row.sessionId,logged:l.loggedRaw,reason:'LOGGED_UNIT_OR_CONVENTION_UNKNOWN',question:`Confirm the load logged for ${id}: its unit or convention is not the planned one, so it was not used`});continue;}
  // The question judges a log against the exposure it was logged in, as the transition does (SSCTR D44; R7-A); an exercise the start does not hold
  // with a known load is an establishment, whatever its row prescribed (asEstablishment, heldKnownLoad; QE-R7ASM-01, QE-R7ASC-01).
  const row0=used.find(x=>x.id===id&&x.session===row.sessionId)??used.find(x=>x.id===id),u=heldKnownLoad(state[id])?row0:asEstablishment(row0),load=c?c.kg:l.load;if(!u||!Number.isFinite(load))continue;
  const k=G?G[id]??G.STRENGTH??G.ALL:null,own=deciding[id]?.sessionId===row.sessionId;
  const d=loggedLoadDecision(sk.op.strength,adoptionBasis(state[id],u),u,{load,convention:l.convention,confirmed:!!c,earlier:own?deciding[id].earlier:null},{advanced:k?['ADVANCE','EARNED'].includes(k):null,hint:sk.cap?.strength?.loadHints?.[id]??null});
  if(d.adopted&&!d.capped||d.pending&&!own)continue;
  const kg=kgText(load,l.convention);
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
function weeklyGates(program,sk,w,ev,ledger,asOf,{systemic=false,base=null}={}){
 const L=sk.op.learning,SG=sk.op.strength.gates,gates={},reasons=[],phase=sk.plan.phases[w],nearEvent=['SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'].includes(sk.plan.phases[w+1])||['TAPER','RACE_WEEK','POST_EVENT'].includes(phase);
 // One verdict per gate key, whatever order its roles or rows are read in (decision authority closure, QE-R7ASC-03): the most restrictive one
 // stands, so a role or row that holds or steps back a dose is never overwritten by one read after it. In RETURN and RESTART every run role gates
 // on EASY (SSCTR R13): a missed long run holds the return, and a run not yet due (PENDING) holds it until it is executed.
 const setGate=(key,value,why)=>{if(!(key in gates)||GATE_ORDER[value]>GATE_ORDER[gates[key]])gates[key]=value;reasons.push({key,gate:value,why});};
 // The week's start the gates read for its mode and return steps (state model): the caller's base, a PlanningView start or the evidence state;
 // the stored start only when none is given.
 const start=base??program.stateTrace[w];
 const runState=start?.run,mode=runState?.mode??'EASY',noEarned=['WALK_JOG','RESTART','RETURN'].includes(mode),returnStart=lastReturn(program);
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
  const exState=start?.strength?.exercises?.[id],returning=Number.isInteger(exState?.returnStep);
  // The logs a gate counts exist by its clock (state model consumer closure, Property D): when the evidence reducer reads an earlier week at that
  // week's own clock, a log executed after it never makes that week REGRESS or EARNED, as recent() already bounds the adverse count.
  const since=later(lastRegression(program,id),returnStart),type='STRENGTH:'+row.role.replace('STRENGTH_',''),log=row.logs[id],hist=ledger.filter(o=>o.logs?.[id]&&Date.parse(asOf)-Date.parse(o.observedAt)<=L.repeatedAdverseWindowDays*86400000&&Date.parse(o.observedAt)<=Date.parse(asOf)&&(!since||Date.parse(o.observedAt)>Date.parse(since)));
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
const reviewGates=(ctx,{systemicSignal=false}={})=>weeklyGates(ctx.program,ctx.sk,ctx.w,ctx.ev,ctx.ledger,ctx.asOf,{systemic:systemicSignal||systemicOf(ctx),base:ctx.base});
/**
 * The weekly review's rule (R7-A.1 C3): next week's start from this week's evidence, applied to the start the decision plans from. `start` is
 * that start: the PlanningView of this week (planningBase, state model) or this week as a composition re-planned it from that view; `week` is the
 * week's rows as they stand. A planning transition: it writes the projection's next start, never history.
 */
function evidenceStart(ctx,{week,start},skn,{gates=null}={}){
 const {w}=ctx,g=gates??reviewGates(ctx).gates,evidenceGates={ALL:'HOLD',...g};
 return {runState:advanceRun(skn,start.run,w,evidenceGates),strengthState:advanceStrength(skn,start.strength,w,usedInWeek(week),evidenceGates,loggedLoads(ctx.ev,confirmationsOf(ctx)),{performed:performedInWeek(ctx.ev,ctx.fullLedger??ctx.ledger)})};
}
const evidenceRule=ctx=>(view,skn)=>evidenceStart(ctx,{week:view.weeks[ctx.w],start:view.stateTrace[ctx.w]},skn);
function finishProposal(program,sk,next,decision){
 const proposal=clone(program);proposal.weeks=next.weeks;proposal.stateTrace=next.stateTrace??program.stateTrace;
 // The earlier contexts still in force for some weeks travel with the program (R7-A.1 C2).
 if('contextBefore' in next){if(next.contextBefore)proposal.contextBefore=clone(next.contextBefore);else delete proposal.contextBefore;}
 // So do the novice (density-capped) templates of the context in force (B0-C08; QE-R7B-R2-01): a change that rebuilt them stores them, one whose
 // context has none removes them; whether a week is capped stays the state's (densityCappedAt). Nothing else is copied.
 if('noviceTemplates' in next){if(next.noviceTemplates)proposal.noviceTemplates=clone(next.noviceTemplates);else delete proposal.noviceTemplates;}
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
 // The repertoire authority is read at the review's date; the program must have been planned under the same catalog (R7-B, fail closed).
 const authority0=r6Authority(options),authority={...authority0,repertoire:authority0.repertoire??repertoireAuthority({...options,asOf:typeof review?.asOf==='string'?review.asOf:null})};
 if(!authority.policy||authority.policyHash!==program.policyHash||!allows(authority,'R6-PLANNED-PROGRESSION'))return finish('UNSUPPORTED','UNSUPPORTED','Current independent program authority is missing or does not match the program policy');
 if(!authority.repertoire.valid||program.repertoire?.catalogSha256!==authority.repertoire.catalogSha256)return finish('UNSUPPORTED','UNSUPPORTED','The program was not planned under the bound repertoire catalog, or that catalog and its SSCTR records are unavailable');
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
 // Block choices (QE-R7B-08): a list of ladder steps, main-lift changes with their reason, or keeping or declining the harder session; anything
 // else is asked. They are applied only by the weekly review of a complete week (the block-boundary step); never silently dropped.
 if(review.choices!==undefined&&review.choices!==null&&!Array.isArray(review.choices))return finish('HOLD','HOLD','Choices must be a list',{errors:['choices.array']});
 const blockChoices=Array.isArray(review.choices)?review.choices:[],knownChoice=c=>!!c&&typeof c==='object'&&(['LADDER_STEP','MAIN_CHANGE'].includes(c.type)||c.offer==='RUN_QUALITY_GRADUATION'&&['ACCEPT','DECLINE'].includes(String(c.decision).toUpperCase()));
 if(blockChoices.some(c=>!knownChoice(c)))return finish('ASK','ASK','Some choices are not recognised: a block choice is a ladder step, a main-lift change with its reason, or keeping or declining the harder session',{missingInputs:['choices']});
 const consent=(review.learningConsent??program.learningConsent)===true;
 let model=review.athleteModel;
 if(model!==undefined&&model!==null&&(typeof model!=='object'||!validateLearningModel(model)||model.athleteId!==program.athleteId||Date.parse(model.asOf)>Date.parse(asOf)))return finish('HOLD','HOLD','Athlete model integrity, ownership or clock is invalid');
 let out=null;
 // Any malformed fact inside the review gives a status, never an exception (QRE-R6-10).
 try{
  // Causal provenance: only facts observed and reported by the decision clock count; the actual ledger is append-only.
  const priorLedger=Array.isArray(review.actualLedger)?clone(review.actualLedger):[];
  const n=normalizeObservations(review.observations??[],{athleteId:program.athleteId,asOf,prior:priorLedger,maximumAgeDays:36500,futureSkewSeconds:authority.policy.operational.learning.futureClockSkewSeconds,timezoneOffsetMinutes:tz,loadIncrements:{...authority.policy.operational.strength.smallestIncrement,SINGLE_IMPLEMENT:incrementFor(authority.policy.operational.strength,'SINGLE_IMPLEMENT')}});
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
  // The start every decision plans from (PlanningView, state model): history from the evidence reducer, targets from the projection.
  ctx.base=planningBase(ctx);
  // A review's load confirmations are facts of its week, recorded on it so every later handler reads them as this review does (QE-R7A1-02).
  if(Object.keys(confirmations).length)ctx.program={...program,weeks:program.weeks.map((x,i)=>i!==w?x:{...x,adaptations:[...(x.adaptations??[]),adaptation(ctx,'LOAD_CONFIRMATIONS',{confirmations})]})};
  // The canonical factual state comes before any decision (residual authority closure, QE-R7ADA-01): evidence that moved this week's PlanningView
  // re-plans the sessions still ahead first, and the handler, whatever its kind, decides on that program.
  const factual0=factualReplan(ctx),factual=factual0?.ask?factual0:graduationWithdrawal(factual0?.ctx??ctx)??factual0;
  // Training before the latest interruption that its return did not read is confirmed first (R7-A final I6); a return report decides it itself.
  const decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||(HANDLERS[kind]??weeklyReview)(c);
  // A question about block choices is a decision like any other (QE-R7B-R2-02; R7-A A5): it never drops the canonical factual state computed above. A
  // question the factual re-plan itself raises keeps precedence; otherwise the block-choice question carries the factual re-plan and any graduation
  // withdrawal (withFactualReplan), because the facts it follows stand whatever is still asked.
  const choiceAsk=blockChoices.length&&(kind!=='WEEKLY_REVIEW'||ev.pending)?{action:'ASK',reason:'Block choices are made in the weekly review of a block\'s last week, once its sessions are complete',missingInputs:['choices']}:null;
  const decision0=factual?.ask??withFactualReplan(factual,choiceAsk??decide(factual?.ctx??ctx));
  const decision=blockChoices.length&&!choiceAsk&&!out.choicesHandled&&decision0.action!=='ASK'&&decision0.status!=='CLINICAL_HUMAN_REQUIRED'?withFactualReplan(factual,{action:'ASK',reason:'The block choices could not be applied in this review; they are made at the block boundary review',missingInputs:['choices']}):decision0;
  // Load questions follow the decision's own gates, so they never contradict the adoption the transition made (SSCTR D44).
  out.loadQuestions=loggedLoadQuestions(program,sk,w,ev,{gates:decision.gates??null,confirmations:confirmationsOf(ctx),base:ctx.base});
  if(decision.proposal){
   // A factual re-plan of this week is validated with the handler's own change, from this week (residual authority closure).
   const from=Math.min(decision.proposal.decisions.at(-1)?.fromWeek??w,factual?.proposal?w:Infinity);
   const ahead=ctx.ahead,kept=new Map(program.weeks.flatMap(x=>x.sessions).filter(s=>!ahead(s)).map(s=>[s.id,hash(s.prescription)])),history=new Set(decision.proposal.weeks.flatMap(x=>x.sessions).filter(s=>kept.get(s.id)===hash(s.prescription)).map(s=>s.id));
   // Each week is validated under its own context (C2), and an event is never planned twice: at most one race still ahead (C5, C7).
   const races=decision.proposal.weeks.flatMap(x=>x.sessions).filter(s=>s.role==='RACE'&&s.prescription&&s.status!=='SKIPPED'&&ahead(s));
   const v=[...validateWeeks(skeletonOf(decision.proposal,authority),decision.proposal.weeks.filter(x=>x.index>=from),{history}),...immutabilityErrors(program,decision.proposal,asOfLocal,ahead),...(races.length>1?['duplicateRace:'+races.map(s=>s.id).join('+')]:[])];
   if(v.length)return finish('UNSUPPORTED','UNSUPPORTED','Counterfactual failed complete validation; no partial change is presented as valid',{...out,errors:v,counterfactuals:decision.counterfactuals??[]});
  }
  const status=decision.status??(decision.proposal&&!decision.instantiationOnly?'MODIFY':decision.action==='ASK'?'ASK':'KEEP');
  return finish(status,decision.action,decision.reason,{...out,proposal:decision.proposal??null,disclosures:decision.disclosures??[],offers:decision.offers??[],learnedPatterns:decision.learnedPatterns??null,substitutions:decision.substitutions??null,instantiationOnly:!!decision.instantiationOnly,gates:decision.gates??null,counterfactuals:decision.counterfactuals??[],horizons:decision.horizons??null,missingInputs:decision.missingInputs??[],question:decision.question??null,trace:{sourceProgramHash:program.hash,reviewHash:hash(review),policyHash:authority.policyHash,modelBeforeHash:review.athleteModel?.hash??null,modelAfterHash:model.hash,ledgerSize:ledger.length,authoritySplit:'Reusable boundaries constrain; coaching compares concrete feasible options',noCausalClaim:true},nextObservation:decision.nextObservation??'Record actual execution, effort if known and next-day function; the next step advances only on that evidence'});
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
 // Mid-week the week continues as planned: evidence about an earlier week that moved this week's PlanningView has already re-planned the sessions
 // still ahead before any handler decides (factualReplan).
 if(ev.pending)return {action:'KEEP',reason:(extraReason?extraReason+'; ':'')+'next-week steps are gated when this week’s remaining sessions are complete',counterfactuals:[counter('KEEP','KEEP',true,'Smallest effective decision mid-week',{selected:true}),counter('EARLY_GATE','HOLD_NEXT_STEP',false,'Gating before the week ends would treat future sessions as missed')]};
 const {gates,reasons}=weeklyGates(program,sk,w,ev,ledger,asOf,{systemic,base:ctx.base});
 // R7-B block boundary (B0-C01, B0-C06, B0-C07): graduation, ladder offers, MAIN changes with a recorded reason and the block summary, all on
 // executed evidence at the boundary of a development block; accepted changes re-plan from next week through the context (the evidence reducer
 // replays them). Nothing changes on the calendar alone.
 const boundary=blockBoundary(ctx,gates);
 if(boundary.ask)return boundary.ask;
 if(boundary.changes){const r=rebuild(ctx,{canonical:boundary.changes,fromWeek:w+1,reason:boundary.reason,action:boundary.action});return r.proposal?{...r,offers:boundary.offers,disclosures:[...(r.disclosures??[]),...boundary.disclosures]}:r;}
 const logs=loggedLoads(ev,confirmationsOf(ctx)),allAdvance=Object.values(gates).every(g=>g==='ADVANCE');
 const rebased=rebasedNext(program,w),skn=sk.at(w+1)??sk;
 // A dimension with no executed session this week has no gate: it holds, it never counts as executed (QRE-R6-04). The review's rule applies to
 // the start this decision plans from (PlanningView, state model), never to a stored projection's history-defined atoms.
 const nextState=rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:evidenceStart(ctx,{week:program.weeks[w],start:ctx.base},skn,{gates});
 // A return's re-base stays next week's start, with its authority; otherwise the review's evidence sets it (R7-A.1 C3; WEEK_EVIDENCE).
 const projected=composeWeeks(ctx,program,{fromWeek:w+1,start:nextState,startAuthority:rebased?program.weeks[w+1].startAuthority:anchoredStart(WEEK_START.WEEK_EVIDENCE,{eventId:ctx.review.event.id,asOf})});
 if(projected.ask)return {action:'ASK',reason:projected.ask,missingInputs:projected.missingInputs};
 const changed=changedSessions(program,projected);
 // An unconfirmed establishment load lives only in the state: a new or changed pending value needs a proposal to reach the next review (SSCTR D45).
 const pending=Object.keys(logs).filter(id=>Number.isFinite(nextState.strengthState.exercises[id]?.pendingLoad)),pendingMoved=pending.some(id=>nextState.strengthState.exercises[id].pendingLoad!==program.stateTrace[w+1]?.strength?.exercises?.[id]?.pendingLoad);
 const keepOk=(allAdvance||!!rebased)&&!changed&&!pendingMoved,knownChanged=allAdvance&&changed>0&&knownLoadsChanged(program,projected,w+1);
 const keep=counter('KEEP','KEEP',keepOk,keepOk?'Every gated session executed without adverse signal: the planned next step stands':allAdvance?'Logged loads differ from the planned loads or placeholders; keeping them would ignore executed evidence':'Planned next step would advance work that was not executed or tolerated as planned',{h3Loss:0,changeCount:0,order:0});
 const gated=counter('GATED_NEXT_STEP',allAdvance?(knownChanged?'ADOPT_LOGGED_LOADS':Object.keys(logs).length?'INSTANTIATE_LOGGED_LOADS':'KEEP'):'HOLD_OR_REGRESS_NEXT_STEP',true,'Smallest valid change: repeat or step back only the affected session types; everything else proceeds',{changeCount:changed,order:1,gates});
 const replan=counter('REBASE_BLOCK','LARGER_REPLAN',systemic&&Object.values(gates).filter(g=>g==='REGRESS').length>=2,'A wider rebase is justified only by repeated converging adverse evidence',{changeCount:changed+3,order:2});
 if(keepOk)return {action:'KEEP',offers:boundary.offers,disclosures:boundary.disclosures,reason:extraReason??(rebased&&!allAdvance?'The return reported this week already plans next week; this review keeps it':'Executed as planned without adverse signal; the planned progression step stands'),gates,counterfactuals:[{...keep,selected:true},{...gated,admissible:false,reason:'No difference from the plan'},replan],nextObservation:'Execute next week as planned; record actual minutes, sets, reps, loads, effort and next-day function'};
 const action=allAdvance?(knownChanged?'ADOPT_LOGGED_LOADS':'INSTANTIATE_LOGGED_LOADS'):'GATED_NEXT_STEP';
 const decision={eventId:ctx.review.event.id,asOf,action,fromWeek:w+1,gates,reasons,horizonsConsidered:HORIZONS};
 const proposal=finishProposal(program,sk,projected,decision);
 const horizons=horizonSummary(sk,program,proposal,{w,changed});
 gated.selected=true;
 const wait=pending.length?`first logged loads wait for confirmation before they become numbers (${pending.join(', ')})`:null,instantiated=Object.keys(logs).some(id=>Number.isFinite(logs[id].load)&&!pending.includes(id));
 const why=extraReason??(action==='ADOPT_LOGGED_LOADS'?'Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time':action==='INSTANTIATE_LOGGED_LOADS'?(instantiated||!wait?'Logged loads replace planned placeholders; the progression rule is unchanged':'The progression rule is unchanged'):'Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation');
 return {action,offers:boundary.offers,disclosures:boundary.disclosures,instantiationOnly:allAdvance&&!knownChanged,reason:wait?why+'; '+wait:why,proposal,gates,horizons,counterfactuals:[{...keep,whyLost:keep.admissible?null:keep.reason},gated,replan]};
}
// ---------- R7-B: block boundary and reason-based substitution ----------
const DEV_FAMILIES=['BUILD','DEVELOPMENT','NEXT_BLOCK'];
/** The executed continuous running minutes and days of a week's easy and long runs, from the completed-work ledger (walks excluded). */
function runningMinutes(ctx,rows){
 const by=new Map();for(const r of rows){const o=ctx.ledger.filter(x=>x.sessionId===r.sessionId).at(-1),m=Number(o?.actual?.minutes);if(Number.isFinite(m)&&m>0)by.set(r.date,(by.get(r.date)??0)+m);}
 return {minutes:[...by.values()].reduce((n,x)=>n+x,0),days:by.size};
}
/**
 * B0-C01 graduation evidence for week k: a non-establishment week that started in EASY mode, every easy and long run completed and reported, no
 * adverse or conflicting run report, the weekly rule's EASY and LONG gates ADVANCE or EARNED, and at least the EASY_CURRENT boundary of executed
 * continuous running (RUN_CLASS_THRESHOLDS: 60 minutes on 2 days). A week without that complete evidence has no gating review (R18).
 */
function graduationWeek(ctx,k){
 const {program,sk}=ctx,T=RUN_CLASS_THRESHOLDS;
 if(k<0)return {week:k,ok:false,why:'NO_WEEK'};
 if(program.phases.phases[k]==='ESTABLISHMENT')return {week:k,ok:false,why:'ESTABLISHMENT_WEEK'};
 const start=k===ctx.w?ctx.base:program.stateTrace[k];if(start?.run?.mode!=='EASY')return {week:k,ok:false,why:'NOT_EASY_MODE'};
 const ev=weekEvidence(program,k,ctx.asOfLocal,ctx.ledger,ctx.quarantined??[]),run=ev.rows.filter(r=>r.sport==='RUN'),running=run.filter(r=>['EASY','LONG'].includes(r.role));
 if(!running.length||running.some(r=>r.status!=='COMPLETED'))return {week:k,ok:false,why:'NOT_ALL_REPORTED'};
 // Any adverse or conflicted report of the week, whichever sport, disqualifies it (the stricter reading of B0-C01 c3; declared R7B-DECL-02).
 if(ev.rows.some(r=>['ADVERSE','CONFLICTING'].includes(r.kind)||r.status==='CONFLICTED'))return {week:k,ok:false,why:'ADVERSE_OR_CONFLICTED'};
 const {gates}=weeklyGates(program,sk.at(k)??sk,k,ev,ctx.ledger,ctx.asOf,{base:start});
 if(['EASY','LONG'].some(key=>running.some(r=>r.role===key)&&!['ADVANCE','EARNED'].includes(gates[key])))return {week:k,ok:false,why:'GATE_NOT_ADVANCE'};
 const m=runningMinutes(ctx,running);
 return {week:k,ok:m.minutes>=T.easyLowWeeklyMinutesBelow&&m.days>=T.easyLowRunDaysBelow,why:m.minutes>=T.easyLowWeeklyMinutesBelow&&m.days>=T.easyLowRunDaysBelow?'QUALIFIES':'BELOW_RUNNING_THRESHOLD',...m};
}
const choicesOf=review=>(Array.isArray(review?.choices)?review.choices:[]).filter(c=>c&&typeof c==='object');
/**
 * The boundary of a development block (the reviewed week ends one): graduation (B0-C01), skill-ladder offers and accepted steps (B0-C07), MAIN
 * changes with a recorded reason (B0-C06) and the block summary. Returns the context change to apply from next week, if any.
 */
function blockBoundary(ctx,gates){
 const {program,sk,w,review}=ctx,rep=sk.repertoire,P=program.phases.phases,next=P[w+1],out={offers:[],disclosures:[]};
 const boundary=next!==undefined&&program.blocks.some(b=>DEV_FAMILIES.includes(b.family)&&b.endWeekExclusive===w+1);
 const choices=choicesOf(review);ctx.out.choicesHandled=true;
 if(!boundary){if(choices.some(c=>['LADDER_STEP','MAIN_CHANGE'].includes(c.type)))return {ask:{action:'ASK',reason:'Exercise changes for a block are made at a block boundary review; this week does not end a block',missingInputs:['choices']}};return out;}
 const c=program.canonical,goal=program.goal,cap=program.capability,base=ctx.base,returning=Object.values(base?.strength?.exercises??{}).some(e=>Number.isInteger(e.returnStep))||base?.run?.mode==='RETURN';
 const nextDeferred=ROTATION_DEFERRED_PHASES.includes(next)||!DEV_FAMILIES.includes(next)&&next!=='CONSOLIDATION';
 let graduation=null;const selections=[],reached=[],invalid=[],notes=[];
 // B0-C01: graduation of a WALK_JOG-, RESTART- or EASY_LOW-started athlete, from executed evidence only, under every R6 quality gate.
 const candidate=allowsCandidate(rep,'B0-C01')&&['WALK_JOG','RESTART','EASY_LOW'].includes(cap.run.class)&&!c.athlete.runGraduation&&['RACE','PERFORMANCE'].includes(goal.run.kind)&&c.schedule.runDays.length>=3&&allows(ctx.authority,'R6-RUN-QUALITY')&&DEV_FAMILIES.includes(next)&&base?.run?.mode==='EASY'&&!base.run.qualityRunner;
 if(candidate){
  const ending=program.blocks.find(b=>DEV_FAMILIES.includes(b.family)&&b.endWeekExclusive===w+1);
  // Walk/jog and restart starters: the qualifying weeks lie in a block executed entirely in EASY mode after the exit.
  const wholeEasy=!['WALK_JOG','RESTART'].includes(cap.run.class)||[...Array(w+1-ending.startWeek).keys()].map(i=>ending.startWeek+i).every(k=>(k===w?base:program.stateTrace[k])?.run?.mode==='EASY');
  const weeks=[graduationWeek(ctx,w-1),graduationWeek(ctx,w)],declined=choices.some(x=>x.offer==='RUN_QUALITY_GRADUATION'&&String(x.decision).toUpperCase()==='DECLINE');
  if(wholeEasy&&weeks.every(x=>x.ok)){
   if(declined)out.disclosures.push({id:'RUN_QUALITY_GRADUATION_DECLINED',blocking:false,informational:true,detail:'You kept easy running; the harder session can be offered again at the next block review',basis:'B0-C01'});
   else{graduation={fromWeek:w+1,decidedBy:review.event.id,asOf:ctx.asOf,qualifyingWeeks:weeks.map(({week,minutes,days})=>({week,minutes,days})),basis:'B0-C01'};out.disclosures.push({id:'RUN_QUALITY_INTRODUCED',blocking:false,detail:'Your last two weeks of running went well, so one harder threshold session a week starts next week at its first step and by feel (talk test about 6–7 of 10); the first one is a calibration with no pace target. In that week the other runs stay as they were. An easy run of the usual length is an equal alternative you can keep without penalty',options:['Keep the new session','Keep easy runs (no penalty; offered again at the next block review)'],basis:'B0-C01'});}
  }else if(['WALK_JOG','RESTART','EASY_LOW'].includes(cap.run.class))out.disclosures.push({id:'RUN_QUALITY_NOT_YET',blocking:false,informational:true,weeks:weeks.map(({week,why,minutes,days})=>({week,why,minutes:minutes??null,days:days??null})),blockEntirelyEasy:wholeEasy,detail:'A harder session is introduced only after two complete weeks of easy running reach about an hour on at least two days without an adverse response, in a block run entirely as easy running',basis:'B0-C01'});
 }
 // B0-C07: one ladder step per configuration, offered (never applied) after final exposures ADVANCE or EARNED; never in deferred phases or returns.
 const inUse=new Map();for(const s of program.weeks[w].sessions)for(const e of s.prescription?.exercises??[])if(e.role!=='PRACTICE')inUse.set(e.id,e.role);
 const pref=c.athlete.strengthPreferences.rotation,available=new Set([...(sk.equipmentForDate?.(program.weeks[w+1]?.startDate??program.weeks[w].startDate)??c.athlete.equipment),'BODYWEIGHT']);
 const horizontalPushKept=to=>[...inUse].some(([id])=>configurationOf(id)?.subpattern==='HORIZONTAL_PUSH'&&id!==to);
 // A configuration set aside for a stated reason is never offered or chosen again (QE-R7B-07).
 const asideIds=new Set((c.athlete.strengthSelections??[]).filter(x=>x.setAside!==false&&['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'].includes(x.reason)).map(x=>x.from));
 const stepOk=(x,y,role)=>{const e=configurationOf(y);return !!e&&!asideIds.has(y)&&admitted(e,rep)&&e.roles.includes(role)&&e.equipment.every(q=>available.has(q))&&!inUse.has(y)&&ladderNext(x).includes(y)&&(!ladderChangesSubpattern(x,y)||configurationOf(x)?.pattern!=='PUSH'||horizontalPushKept(x));};
 const ladderOpen=allowsCandidate(rep,'B0-C07')&&!nextDeferred&&!returning;
 if(ladderOpen&&pref!=='FIXED')for(const [x,role] of inUse)if(['ADVANCE','EARNED'].includes(gates[x]))for(const y of ladderNext(x))if(stepOk(x,y,role))out.offers.push({id:'LADDER_STEP',type:'LADDER_STEP',from:x,to:y,role,detail:`Next step on your skill ladder: ${y} instead of ${x}, from next week; it starts with effort-guided establishment from the lightest load (the empty bar for barbell lifts), technique first; you can always step back`,basis:'B0-C07'});
 const MAIN_REASONS=['DELIBERATE_BLOCK_TRANSITION','EQUIPMENT_CHANGE','ATHLETE_PREFERENCE'],PURPOSES=['PHASE','GOAL_SPECIFICITY','EQUIPMENT','TECHNIQUE'];
 const familiar=new Set((c.athlete.knownExercises??[]).filter(k=>k.familiar!==false).map(k=>k.id)),ladder=new Set([...(c.athlete.ladderReached??[])]),maxSkill=['NONE','NOVICE'].includes(c.athlete.strengthExperience)?0:1;
 const skillOk=e=>familiar.has(e.id)||ladder.has(e.id)||skillRank(e.skill)<=maxSkill;
 // One change per exercise per boundary, whatever the order of the choices (QE-R7B-06): two changes of one exercise are asked, none applied.
 const count=new Map();for(const ch of choices)if(['LADDER_STEP','MAIN_CHANGE'].includes(ch.type))count.set(ch.from,(count.get(ch.from)??0)+1);
 const twice=[...count].filter(([,n])=>n>1).map(([id])=>id);
 if(twice.length)return {ask:{action:'ASK',reason:'One change per exercise at a block boundary: choose either a ladder step or a main-lift change for '+twice.join(', '),missingInputs:['choices'],invalidChoices:choices.filter(ch=>twice.includes(ch.from)).map(choice=>({choice,why:'More than one change of the same exercise'}))}};
 for(const ch of choices){
  if(ch.type==='LADDER_STEP'){
   const role=inUse.get(ch.from);
   if(selections.some(x=>x.from===ch.from)){invalid.push({choice:ch,why:'One ladder step per exercise per block boundary'});continue;}
   if(!ladderOpen||!role||!['ADVANCE','EARNED'].includes(gates[ch.from])||!stepOk(ch.from,ch.to,role)){invalid.push({choice:ch,why:!ladderOpen?'Ladder steps are not offered in this phase or during a return':!role?'The exercise is not in use':!['ADVANCE','EARNED'].includes(gates[ch.from])?'The exercise did not end the block progressing':'Not the next step on its ladder, or not available'});continue;}
   selections.push({from:ch.from,to:ch.to,reason:'SKILL_PROGRESSION',fromWeek:w+1,decidedBy:review.event.id,slots:slotsInUse(ctx.skw,w,ctx.base.strength,ch.from)});reached.push(ch.to);
  }else if(ch.type==='MAIN_CHANGE'){
   const from=configurationOf(ch.from),to=configurationOf(ch.to),reason=String(ch.reason??'').toUpperCase(),purpose=ch.purpose==null?null:String(ch.purpose).toUpperCase();
   const why=!allowsCandidate(rep,'B0-C06')?'MAIN changes at a block boundary are not available':nextDeferred||returning?'No MAIN change in this phase or during a return':inUse.get(ch.from)!=='MAIN'?'The exercise is not a main lift in use':!to||to.id===from?.id||to.pattern!==from.pattern||!to.primary.some(m=>from.primary.includes(m))||!to.roles.includes('MAIN')?'The new main lift must fill the same slot pattern and share a primary muscle':asideIds.has(to.id)?'An exercise set aside for a stated reason is not chosen again':!admitted(to,rep)||!skillOk(to)||!to.equipment.every(q=>available.has(q))?'The new main lift is not admissible (skill or equipment)':!MAIN_REASONS.includes(reason)?'A main lift changes only with a recorded reason':reason==='DELIBERATE_BLOCK_TRANSITION'&&!PURPOSES.includes(purpose)?'A deliberate block transition states its training purpose (phase, goal specificity, equipment or technique), never variety alone':null;
   if(why){invalid.push({choice:ch,why});continue;}
   selections.push({from:from.id,to:to.id,reason,purpose,fromWeek:w+1,decidedBy:review.event.id});
   if(goal.strength.kind==='STRENGTH')notes.push({id:'MAIN_CHANGE_LOAD_RESTARTS',blocking:false,informational:true,detail:`${to.id} replaces ${from.id}: its load starts again by effort, so progress is shown by block and by effort, not by the old lift's numbers`,basis:'B0-C06'});
  }
 }
 if(invalid.length)return {ask:{action:'ASK',reason:'Some block choices cannot be applied: '+invalid.map(x=>x.why).join('; '),missingInputs:['choices'],invalidChoices:invalid}};
 // The block summary: which doses moved across the block and which held through it (information only; no plateau threshold, LATER.STR.STAGNATION_RULE).
 const ending=program.blocks.find(b=>DEV_FAMILIES.includes(b.family)&&b.endWeekExclusive===w+1),first=program.stateTrace[ending.startWeek];
 if(first&&base){const held=[],moved=[];for(const [id,e] of Object.entries(base.strength?.exercises??{})){const f0=first.strength?.exercises?.[id];if(!f0||!inUse.has(id))continue;(f0.load===e.load&&f0.reps===e.reps&&(f0.sets??null)===(e.sets??null)?held:moved).push(id);}
  for(const k of ['long','easy','qualityStep']){const a=first.run?.[k],b=base.run?.[k];if(Number.isFinite(a)&&Number.isFinite(b))(a===b?held:moved).push('run.'+k);}
  out.disclosures.push({id:'BLOCK_REVIEW',blocking:false,informational:true,block:ending.id,moved,held,detail:held.length?'Some doses held through the whole block; that can be the right dose. At a block boundary a main lift can change for a stated reason, or an exercise can step back on its ladder':'Every dose moved during the block',options:['Keep the plan','Change a main lift with a reason','Step back on a skill ladder']});}
 out.disclosures.push(...notes);
 if(!graduation&&!selections.length)return out;
 out.changes=x=>({...x,athlete:{...x.athlete,...(graduation?{runGraduation:graduation}:{}),...(selections.length?{strengthSelections:[...(x.athlete.strengthSelections??[]),...selections],ladderReached:[...new Set([...(x.athlete.ladderReached??[]),...reached])]}:{})}});
 out.action=graduation&&selections.length?'BLOCK_BOUNDARY_CHANGES':graduation?'RUN_QUALITY_GRADUATION':'BLOCK_EXERCISE_CHANGES';
 out.reason=[graduation?'Two complete weeks of easy running met the graduation evidence: the threshold ladder starts next week at its first step':null,selections.length?'Block-boundary exercise changes recorded with their reasons: '+selections.map(x=>x.from+' → '+x.to+' ('+x.reason.toLowerCase().replace(/_/g,' ')+')').join(', '):null].filter(Boolean).join('; ');
 return out;
}
/**
 * Reason-based substitution (DR-134; B0-C06 condition 8, B0-C07, B0-C09): it overrides the cadence, MAIN retention and a FIXED preference,
 * never safety, policy or agency. The clinical screen comes first: pain, injury, illness or a functional limitation route to a human for the
 * dependent scope; an unclear report is asked. SKILL_MISMATCH steps back along the skill ladder (or to a lower-skill configuration of the same
 * pattern); a confirmed nonclinical dislike or discomfort takes the best same-pattern alternative (familiar, close variation, subpattern, pattern).
 * The configuration set aside is never selected or rotated back; the new one starts with establishment; nothing is converted.
 */
function exerciseSubstitution(ctx){
 const {program,review,w,sk}=ctx,sub=review.substitution&&typeof review.substitution==='object'?review.substitution:null,rep=sk.repertoire;
 if(!sub||typeof sub.exerciseId!=='string')return {action:'ASK',reason:'Say which exercise should change and why',missingInputs:['substitution.exerciseId','substitution.reason']};
 const text=typeof sub.text==='string'?sub.text:'',screen=text?screenInterruptionReason({reason:text,reasonCategory:null,nonclinical:null,clinicalReason:null}):null;
 if(screen?.status==='CLINICAL'||isYes(sub.pain)||isYes(sub.injury))return {action:'CLINICAL_HUMAN_REQUIRED',status:'CLINICAL_HUMAN_REQUIRED',reason:'Pain, injury, illness or a functional limitation with '+sub.exerciseId+' routes to qualified human assessment; no exercise is substituted as a remedy',scope:{exerciseId:sub.exerciseId}};
 const reason=String(sub.reason??'').toUpperCase();
 if(!['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'].includes(reason))return {action:'ASK',reason:'Say why the exercise should change: it cannot be done with steady technique, or a dislike or discomfort without pain',missingInputs:['substitution.reason']};
 if(reason==='NONCLINICAL_DISCOMFORT_OR_PREFERENCE'&&sub.nonclinicalConfirmed!==true)return {action:'ASK',reason:'Confirm there is no pain, injury or functional limitation with this exercise; with pain it goes to a qualified person instead',missingInputs:['substitution.nonclinicalConfirmed']};
 const X=configurationOf(sub.exerciseId),ahead=program.weeks.slice(w).flatMap(x=>x.sessions).filter(s=>ctx.ahead(s)),rows=ahead.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id===sub.exerciseId);
 if(!X||!rows.length)return {action:'ASK',reason:sub.exerciseId+' is not in the sessions still ahead',missingInputs:['substitution.exerciseId']};
 const role=rows[0].role,c=program.canonical,available=new Set([...(c.athlete.equipment??[]),'BODYWEIGHT']),setAside=new Set([...(c.athlete.strengthSelections??[]).filter(x=>x.setAside).map(x=>x.from),X.id]);
 const familiar=new Set((c.athlete.knownExercises??[]).filter(k=>k.familiar!==false).map(k=>k.id)),ladder=new Set(c.athlete.ladderReached??[]),maxSkill=['NONE','NOVICE'].includes(c.athlete.strengthExperience)?0:1;
 const fits=e=>!!e&&admitted(e,rep)&&e.pattern===X.pattern&&e.roles.includes(role)&&e.equipment.every(q=>available.has(q))&&!setAside.has(e.id)&&(familiar.has(e.id)||ladder.has(e.id)||skillRank(e.skill)<=maxSkill);
 // A named target that is not in the repertoire is asked, never replaced by an automatic pick (QE-R7B-08).
 if(sub.to!==undefined&&sub.to!==null&&!configurationOf(sub.to))return {action:'ASK',reason:String(sub.to)+' is not an exercise of the repertoire; name another exercise of the same pattern, or leave the choice to the plan',missingInputs:['substitution.to']};
 const named=sub.to?configurationOf(sub.to):null;if(named&&!fits(named))return {action:'ASK',reason:sub.to+' cannot replace '+X.id+' here (pattern, role, skill or equipment)',missingInputs:['substitution.to']};
 // The candidates in the order of the reason's rule: the athlete's named exercise; after a SKILL_MISMATCH the rungs below on its ladder (nearest
 // first: the previous rung, then the chain below it, B0-C07 condition 1), then a lower skill or another kind of the same pattern (lowest first);
 // after a nonclinical preference the best same-pattern alternatives (familiar, close variation, subpattern, pattern).
 const order=named?[named]:reason==='SKILL_MISMATCH'?[...ladderDown(X.id).map(configurationOf).filter(fits),...CONFIGURATIONS_SAME(X).filter(fits).filter(e=>skillRank(e.skill)<skillRank(X.skill)||e.kind!==X.kind).sort((a,b)=>skillRank(a.skill)-skillRank(b.skill)||(a.id<b.id?-1:1))]:substitutesFor(X.id,{equipment:[...available],experience:c.athlete.strengthExperience,known:c.athlete.knownExercises.filter(k=>k.familiar!==false),role,auth:rep}).map(e=>configurationOf(e.id)).filter(fits);
 const candidates=[...new Map(order.map(e=>[e.id,e])).values()];
 if(!candidates.length)return {action:'ASK',reason:'No admissible alternative of the same pattern fits your equipment and skill; options: add equipment, or keep '+X.id,missingInputs:['substitution.to'],disclosures:[{id:'NO_ADMISSIBLE_ALTERNATIVE',blocking:false,pattern:X.pattern,options:['Add equipment','Keep '+X.id]}]};
 // The slots where X is next in use (rotation included) take the new configuration from this week (QE-R7B-01).
 const kX=program.weeks.findIndex((x,i)=>i>=w&&x.sessions.some(s=>ctx.ahead(s)&&(s.prescription?.exercises??[]).some(e=>e.id===X.id))),slots=kX<0?[]:slotsInUse(ctx.sk.at(kX)??ctx.sk,kX,program.stateTrace[kX]?.strength??ctx.base.strength,X.id);
 for(const to of candidates){
  const selection={from:X.id,to:to.id,reason,fromWeek:w,setAside:true,decidedBy:review.event.id,slots,...(sub.text?{statedReason:String(sub.text).slice(0,200)}:{})};
  const r=rebuild(ctx,{canonical:x=>({...x,athlete:{...x.athlete,strengthSelections:[...(x.athlete.strengthSelections??[]),selection]}}),fromWeek:w,reason:X.id+' is replaced by '+to.id+' ('+(reason==='SKILL_MISMATCH'?'cannot be done with steady technique':'a nonclinical preference')+'); the new exercise starts with effort-guided establishment, nothing is converted',action:'SUBSTITUTE_FOR_REASON'});
  if(!r.proposal)return r;
  // The plan prescribes what the decision selects in every slot of X (QE-R7B-01; its residual QE-R7B-R2-04): a candidate that cannot take X's place in a
  // slot (it is already in that session) leaves the slot to a fallback, so the next candidate is tried; the athlete's named exercise is asked about.
  if(slipsFrom(ctx,r.proposal,X.id,to.id)){if(named)return {action:'ASK',reason:to.id+' is already in a session with '+X.id+', so it cannot take its place there; name another exercise of the same pattern, or leave the choice to the plan',missingInputs:['substitution.to']};continue;}
  // A substitute that an equipment window ahead leaves without a lower option is asked about, never replaced by a harder one (QE-R7B-R2-03).
  const gap=skillMismatchGap(ctx,r.proposal);if(gap)return gap;
  // The replaced exercise leaves every session ahead and the selected one takes its place; otherwise nothing is proposed and the athlete is asked.
  const proposed=r.proposal.weeks.slice(w).flatMap(x=>x.sessions).filter(s=>ctx.ahead(s)&&s.status!=='SKIPPED'),later=proposed.filter(s=>s.prescription?.modality==='STRENGTH'),has=id=>later.some(s=>s.prescription.exercises.some(e=>e.id===id));
  // QE-R7B-OBS-04: in the taper, race and post-event weeks the planner keeps a substitute this program has not performed out of the sessions (a
  // configuration already performed stands in, or the slot is left out), so the substitute may first appear after the post-event week.
  const stands=proposed.flatMap(s=>(s.eventStandIns??[]).filter(g=>g.setAside===X.id&&g.selected===to.id).map(g=>({...g,week:s.weekIndex,sessionId:s.id})));
  if(has(X.id)||!has(to.id)&&!stands.length)return {action:'ASK',reason:to.id+' cannot take the place of '+X.id+' in the sessions ahead; name another exercise of the same pattern',missingInputs:['substitution.to']};
  const event=stands.length?eventWeekDisclosure(X,to,stands,has(to.id)):null;
  return {...r,...(event?{reason:r.reason+'; no new exercise starts in the taper, race or post-event weeks, so '+to.id+' starts after the post-event week',disclosures:[...(r.disclosures??[]),event]}:{}),substitutions:[{exerciseId:X.id,selected:to.id,reason,requiresEstablishment:true,stimulusChange:X.loading==='EXTERNAL'&&to.loading!=='EXTERNAL'?'A bodyweight or band exercise in place of a loaded one is a different stimulus, not an equivalent':null,...(event?{eventWeeks:{standIns:event.standIns,omittedSessions:event.omittedSessions,weeks:event.weeks,startsAfterEvent:has(to.id)}}:{})}]};
 }
 return {action:'ASK',reason:'Every admissible alternative of the same pattern ('+candidates.map(e=>e.id).join(', ')+') is already in a session with '+X.id+', so none can take its place there; options: add equipment, or keep '+X.id,missingInputs:['substitution.to'],disclosures:[{id:'NO_ADMISSIBLE_ALTERNATIVE',blocking:false,pattern:X.pattern,options:['Add equipment','Keep '+X.id]}]};
}
/** QE-R7B-01 (its residual QE-R7B-R2-04): a template slot that held the replaced configuration, in a context in force from this week, that does not
 * hold the decision's configuration after it (that configuration is already in the session, so the slot fell back or stayed unfilled). */
function slipsFrom(ctx,proposal,xId,toId){
 const before=skeletonOf(ctx.program,ctx.authority),after=skeletonOf(proposal,ctx.authority),seen=new Set();
 for(let k=ctx.w;k<proposal.weeks.length;k++){
  const b=before.at(k)??before,a=after.at(k)??after;if(seen.has(a))continue;seen.add(a);
  for(const key of ['templates','noviceTemplates'])for(const t of b[key]??[]){
   const t2=(a[key]??[]).find(x=>x.type===t.type&&x.index===t.index)??(a[key]??[]).find(x=>x.type===t.type);
   for(const row of t.rows.filter(r=>r.entry.id===xId))if(t2?.rows.find(r=>r.slot===row.slot)?.entry.id!==toId)return true;
  }
 }
 return false;
}
/** The disclosure of a substitution whose new configuration waits for the end of the event weeks (QE-R7B-OBS-04; R6-SUBSTITUTION condition 8). */
function eventWeekDisclosure(X,to,stands,startsAfter){
 const standIns=[...new Set(stands.map(g=>g.inEventWeeks).filter(Boolean))].sort(),left=stands.filter(g=>!g.inEventWeeks),weeks=[...new Set(stands.map(g=>g.week))].sort((a,b)=>a-b);
 const instead=standIns.length?`${standIns.join(' or ')}, already done in this program, takes the place of ${X.id}${left.length?' where it fits, and the slot is left out of the other sessions':''}`:`the place of ${X.id} is left out of those sessions (no exercise already done in this program fits it)`;
 return {id:'NO_NEW_EXERCISE_IN_EVENT_WEEKS',blocking:false,exerciseId:X.id,selected:to.id,standIns,omittedSessions:[...new Set(left.map(g=>g.sessionId))],weeks,
  detail:`${to.id} is new in this program, and no new exercise starts in the taper, race week or post-event week: in those weeks ${instead}. ${to.id} starts after the post-event week${startsAfter?' with effort-guided establishment':', beyond this program'}`,
  options:['Keep this plan',`Keep ${X.id} until after the event instead: make this change after the post-event week`],basis:'R6-EVENT-TRANSITION condition 7; B0-C05 condition 1; R6-SUBSTITUTION condition 8 (QE-R7B-OBS-04)'};
}
const CONFIGURATIONS_SAME=X=>CATALOG_CONFIGURATIONS.filter(e=>e.pattern===X.pattern&&e.id!==X.id);
/**
 * QE-R7B-R2-03: a slot whose configuration was set aside for a SKILL_MISMATCH, whose substitute no longer fits and which has no configuration in the
 * direction of that reason (buildTemplates `asideGaps`), in a context in force from this week or an equipment window still ahead. The plan never
 * climbs the ladder in its place: the decision asks (keep the equipment, or name the exercise). Null when there is none.
 */
function skillMismatchGap(ctx,next){
 const sk=skeletonOf(next,ctx.authority),seen=new Set(),gaps=[],collect=(list,on)=>{for(const t of list??[])for(const g of t.asideGaps??[])gaps.push({...g,on});};
 for(let k=ctx.w;k<next.weeks.length;k++){
  const s=sk.at(k)??sk;if(seen.has(s))continue;seen.add(s);collect(s.templates,null);collect(s.noviceTemplates,null);
  for(const win of (s.c.equipmentWindows??[]).filter(x=>!x.to||x.to>=ctx.asOfLocal)){collect(s.templatesFor(win.equipment),win);if(s.noviceTemplates)collect(s.templatesFor(win.equipment,{capped:true}),win);}
 }
 const g=gaps[0];if(!g)return null;
 const need=[...new Set((configurationOf(g.substitute)?.equipment??[]).filter(q=>q!=='BODYWEIGHT'))].map(q=>q.toLowerCase().replace(/_/g,' ')),when=g.on?` from ${g.on.from}${g.on.to?' to '+g.on.to:''}`:'',p=g.pattern.toLowerCase();
 return {action:'ASK',reason:`${g.substitute} needs ${need.join(' and ')||'equipment'} that is not available${when}, and ${g.setAside} was set aside because it could not be done with steady technique; no lower ${p} exercise fits the equipment left, and the plan never moves to a harder one in its place: keep that equipment, or name the ${p} exercise to use (an exercise substitution)`,missingInputs:['changes.equipment','substitution.to'],
  disclosures:[{id:'NO_LOWER_SKILL_ALTERNATIVE',blocking:false,pattern:g.pattern,setAside:g.setAside,substitute:g.substitute,...(g.on?{window:{from:g.on.from,to:g.on.to??null}}:{}),options:['Keep the equipment',`Name a ${p} exercise`],basis:'Catalog SKILL_MISMATCH rule; B0-C07 condition 1; QE-R7B-R2-03'}],
  counterfactuals:[counter('HARDER_FALLBACK','SUBSTITUTE',false,'A configuration above the one the athlete could do would raise the skill demand when equipment is lost'),counter('ASK','ASK',true,'Keeping the equipment or naming the exercise is the athlete’s decision',{selected:true})]};
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
 // Templates from the bound catalog; exercises already in use are kept for continuity (catalog selection order) and the novice variant
 // is rebuilt with them (B0-C08).
 const knownOnly=!allows(authority,'R6-LOAD-ESTABLISHMENT'),established=Object.keys((ctx.base??program.stateTrace[ctx.w])?.strength?.exercises??{}),rep=authority.repertoire;
 const templates=strengthTemplates(canonical,goal,{knownOnly,auth:rep,established});
 // The novice variant exists whenever the new context can be capped (B0-C08): also when a change raises the strength days above two before the
 // first block boundary (QE-R7B-05); whether a week is capped is the state's (densityCappedAt).
 const noviceTemplates=base.noviceTemplates||noviceDensityApplies({c:canonical,cap,repertoire:rep})?strengthTemplates(canonical,goal,{knownOnly,auth:rep,established,capped:true}).map(t=>({...t,densityCapped:true})):null;
 const view={...program,canonical,goal,phases:mergedPhases,blocks,templates,noviceTemplates,arrangementSessions:{}};delete view.contextBefore;
 const sk=skeletonOf(view,authority),severityAuthority=allows(authority,'R6-HYBRID-ARRANGEMENT'),contexts=[...new Set(mergedPhases.phases.slice(start).map((p,i)=>contextOf(mergedPhases.phases,start+i)))],arrangementSessions={};
 const variants=contexts.flatMap(context=>[[context,false],...(noviceTemplates&&sk.noviceTemplates?[[context,true]]:[])]),cmpI11=severityAuthority&&allowsCandidate(rep,'B0-C11');
 for(const [context,capped] of variants){
  const key=capped?context+'@B0-C08':context;
  // A configuration not yet in use starts with its first exposure: the ranking sees it (CMP.I11; B0-C07 c7, B0-C06 c2) when a review re-plans.
  const candidates=arrangementCandidates(canonical,cap,goal,context,sk,capped?noviceTemplates:templates,{established:new Set(established)}),lead=goal.priorityByPhase[context]?.lead??goal.baseLead;
  const doseKey=doseKeyOf(program.weeks[ctx.w]?.sessions.find(s=>s.role==='QUALITY'));
  const pref=ctx.model?.purposeAllowed&&doseKey?preferredArrangement(ctx.model,candidates,{sessionType:'RUN:QUALITY',phaseClass:phaseClassOf(authority.policy,context,'EASY'),doseKey},{asOf:ctx.asOf}):null;
  const choice=chooseBalanced(candidates,{lead,temporaryPreference:canonical.schedule.temporaryPreference??goal.temporaryPreference,severityAuthority,cmpI11,hybrid:authority.policy.operational.hybrid,athleteSeverity,athleteEvidence:pref?.preferredId?pref:null,currentId:base.arrangementSessions?.[key]?.id??base.arrangementSessions?.[context]?.id??null,context:{eventPhase:EVENT_PHASES.includes(context),strengthDevelopment:goal.strength.development,runDevelopment:goal.run.development,runRole:goal.run.kind==='NONE'?'MAINTAIN':'PRIMARY',strengthRole:EVENT_PHASES.includes(context)||goal.strength.kind==='MAINTAIN'?'MAINTAIN':'PRIMARY'}});
  trace.traces[key]={basis:choice.basis,reason:choice.reason,selectedId:choice.selected?.id??null};
  if(capped&&(choice.askRequired||!choice.selected)){trace.traces[key].fallback='CONTEXT_ARRANGEMENT';continue;}
  trace.choices[key]=choice;
  if(choice.askRequired)return {ask:{action:'ASK',reason:'The new agenda creates a genuine run/strength trade-off; a temporary preference is needed',missingInputs:['schedule.temporaryPreference'],question:choice.question,counterfactuals:choice.counterfactuals.slice(0,8)}};
  if(!choice.selected)return {ask:{action:'ASK',reason:'No admissible arrangement for the new agenda',missingInputs:['schedule'],counterfactuals:choice.counterfactuals.slice(0,8)}};
  arrangementSessions[key]=choice.selected;
 }
 trace.contexts.push(...contexts);
 return {canonical,goal,phases:mergedPhases,blocks,templates,...(noviceTemplates?{noviceTemplates}:{}),arrangementSessions:{...base.arrangementSessions,...arrangementSessions}};
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
 // Each start carries its authority: the return's, this week's evidence (WEEK_EVIDENCE) or the conditional plan of this week as planned.
 const current=fromWeek===ctx.w+1&&!rebased&&!gates?weekAsPlanned(ctx,program,ctx.w):null,by={eventId:review.event.id,asOf:ctx.asOf};
 const start=fromWeek!==ctx.w+1?null:rebased?{runState:clone(rebased.run),strengthState:clone(rebased.strength)}:gates?evidenceStart(ctx,{week:program.weeks[ctx.w],start:ctx.base},skn,{gates}):conditionalNext(ctx,skn,ctx.w,current);
 const startAuthority=fromWeek!==ctx.w+1?null:rebased?program.weeks[ctx.w+1].startAuthority:gates?anchoredStart(WEEK_START.WEEK_EVIDENCE,by):projectedStart(current.week,by);
 // A change that reaches this week changes the context this week is entered under: this week is planned from the PlanningView of the changed
 // program (the transition into it under its new context, C2), the start every later decision reads too, so the order in which this change and
 // any other one arrive never changes the dose (decision authority closure, QE-R7ASC-04).
 const own=fromWeek===ctx.w?{...ctx,program:next,sk,evidence:undefined}:ctx;if(own!==ctx)own.base=planningBase(own);
 const projected=composeWeeks(own,next,{fromWeek,start,startAuthority,evidence:evidenceRule(own)});
 if(projected.ask)return {action:'ASK',reason:projected.ask,missingInputs:projected.missingInputs};
 const disclosures=arrangementDisclosures(trace.choices),negotiation=[...(program.negotiation??[]).filter(n=>n.id!=='ARRANGEMENT_COST_DISCLOSED'||!trace.contexts.includes(n.context)),...disclosures];
 const fields={weeks:projected.weeks,stateTrace:projected.stateTrace,schedule:next.canonical.schedule,canonical:next.canonical,templates:next.templates,noviceTemplates:next.noviceTemplates??null,arrangementSessions:next.arrangementSessions,phases:next.phases,blocks:next.blocks,goal:next.goal,negotiation,contextBefore:next.contextBefore??null};
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
 const changed=withContextChange(ctx,program,w,base=>{const canonical=clone(base.canonical);if(permanent){canonical.athlete.equipment=equipment;const kept=before(canonical.equipmentWindows??[]);if(kept.length)canonical.equipmentWindows=kept;else delete canonical.equipmentWindows;}else canonical.equipmentWindows=[...(canonical.equipmentWindows??[]),{from,to,equipment}];const established=Object.keys((ctx.base??program.stateTrace[w])?.strength?.exercises??{});return {...base,canonical,templates:permanent?strengthTemplates(canonical,base.goal,{knownOnly,auth:authority.repertoire,established}):base.templates,...(base.noviceTemplates?{noviceTemplates:permanent?strengthTemplates(canonical,base.goal,{knownOnly,auth:authority.repertoire,established,capped:true}).map(t=>({...t,densityCapped:true})):base.noviceTemplates}:{})};});
 // After a SKILL_MISMATCH the plan never climbs in place of a substitute whose equipment goes: without a lower option it asks (QE-R7B-R2-03).
 const next=changed.program,gap=skillMismatchGap(ctx,next);if(gap)return gap;
 // Only strength is re-planned, from the sessions still ahead (C1, C6), keeping next week's start and this week's adaptations (C3, C4).
 const composed=composeWeeks(ctx,next,{fromWeek:w,sports:['STRENGTH'],evidence:evidenceRule(ctx)});
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
  const recorded=finishProposal(program,composed.sk,{weeks:composed.weeks,stateTrace:composed.stateTrace,canonical:next.canonical,templates:next.templates,noviceTemplates:next.noviceTemplates??null,contextBefore:next.contextBefore??null},{eventId:review.event.id,asOf:ctx.asOf,action:'KEEP',fromWeek:w,window:{from,to},permanent,swaps:[],omitted:[],horizonsConsidered:HORIZONS});
  return {action:'KEEP',instantiationOnly:true,reason:'Planned exercises already fit the available equipment; the equipment is recorded for the dates stated',proposal:recorded,counterfactuals:keep};
 }
 const substitutions=[...new Map(inWindow.map(x=>[x.from+'>'+x.to,{exerciseId:x.from,selected:x.to,pattern:x.pattern,requiresEstablishment:x.requiresEstablishment,stimulusChange:x.stimulusChange,reason:`Same ${x.pattern.toLowerCase()} intent with available equipment${x.requiresEstablishment?'; the new task starts with effort-guided establishment':''}; no load is converted`}])).values()];
 const proposal=finishProposal(program,composed.sk,{weeks:composed.weeks,stateTrace:composed.stateTrace,canonical:next.canonical,templates:next.templates,noviceTemplates:next.noviceTemplates??null,contextBefore:next.contextBefore??null},{eventId:review.event.id,asOf:ctx.asOf,action:'SUBSTITUTE',fromWeek:w,window:{from,to},permanent,swaps:inWindow,omitted,horizonsConsidered:HORIZONS});
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
// ---------- the state model: HistoricalState, PlanningProjection, PlanningView (Founder 2026-10-28; audits/domain-coaching-r7a-state-model-2026-10-28/STATE_MODEL_CONTRACT.md) ----------
// HistoricalState is written in one place, the evidence reducer below, from canonical evidence only. PlanningProjection is the program's
// stateTrace, written only by the planner. PlanningView (planningBase) is the start the planner decides from, a declared combination of the two.
/**
 * The evidence reducer: the evidence state at the start of week k as the record stands at a cut (`at(k)`), the only writer of history. It folds
 * canonical evidence and never reads a value of a stored start (stateTrace):
 * - week 0 is the intake: the athlete's reported current state, as the program recorded it under INTAKE authority (the one start it reads);
 * - a return in force at the cut restarts it from its entry, which the return computed from history, at the return's point (R7-A final §4: the
 *   report in force sets the point of its own week, a late one the point of the break's week); the sessions before that point in its week
 *   belong to the plan before the break (C5);
 * - every other week start applies the week before as evidence, per sport (SSCTR R40): by the weekly review's own rule (weeklyGates on this
 *   state, advanceRun, advanceStrength in evidence mode) on this state's own base, when a review closed that week for the sport before the cut
 *   (WEEK_EVIDENCE) or the athlete executed every row of the sport with every gate ADVANCE or EARNED (COMPLETED_SESSIONS); otherwise by its facts
 *   only (strengthAtBreak in evidence mode; a run keeps its state), so a step needs a closed or complete week (SSCTR S-A; R7-A final P5).
 * The strength state carries the dose each exercise executed (`facts`; EARNED_PROGRESS stays in its ticks, R42). Evidence about one exercise or
 * sport never moves another (I10, I11). From the planning record it reads only the prescription (the week's rows and their summary, `planned`),
 * which decisions closed a week (a start's WEEK_EVIDENCE provenance and its clock) and a return's recorded entry. Memoized per week.
 *
 * Two readings of the same evidence (decision authority closure). HISTORY (the default) is HistoricalState: a week's evidence is judged under
 * the context the athlete executed it in. PLAN is the basis of the PlanningView, the one reading every planning consumer resolves a decision
 * from (QE-R7ASC-04): the same facts, gates and transitions, except that
 * - the transition out of week j follows the context of the week it enters (R7-A.1 C2, as the weekly review, a re-plan and a projection
 *   apply it), so a goal, schedule or event change is applied once, explicitly, at its first week, and never by one consumer only;
 * - the run of a week neither closed nor complete makes no step (every gate HOLD) while the plan's calendar constraints still apply (a trim to
 *   the dose the week prescribed, the next block's resumption, a re-entry dose): an unexecuted week is held, never progressed (QE-R7ASC-02).
 * Neither reading reads a value of PlanningProjection.
 */
function evidenceState(ctx,{cut,day,ledger,program=ctx.program,ret=null,p=null,reading='HISTORY'}){
 const until=Date.parse(cut),seen=ledger.filter(o=>Date.parse(o.observedAt)<until),usable=seen.filter(o=>!o.conflicted),plan=reading==='PLAN';
 const view={...program,decisions:program.decisions.filter(d=>Date.parse(d.asOf)<until)},runKeys=new Set(Object.values(RUN_GATE_ROLE)),memo=new Map();
 // The state after the last week (k = weeks.length, what the public reader reads in that week) falls in no week (state model consumer closure).
 const skOf=j=>ctx.sk.at?.(j)??ctx.sk,inWeek=(k,d)=>!!d&&!!program.weeks[k]&&d>=program.weeks[k].startDate&&d<=onDate(program.weeks[k].startDate,6),before=a=>Date.parse(a.asOf)<until;
 const signals=week=>({systemic:(week.adaptations??[]).some(a=>a.kind==='SYSTEMIC_SIGNAL'&&before(a)),confirmations:Object.assign({},...(week.adaptations??[]).filter(a=>a.kind==='LOAD_CONFIRMATIONS'&&before(a)).map(a=>a.confirmations))});
 // A review closed week j for a sport before the cut: the start of week j+1 (or the start a return of week j+1 replaced) records, for that sport,
 // the weekly review's rule decided before the cut. Its provenance and clock only, never its values.
 const closedBy=(j,sport)=>{const n=program.weeks[j+1];if(!n)return null;const a=(n.startBeforeReturn?n.startBeforeReturnAuthority:n.startAuthority)?.[sport];return a?.provenance===WEEK_START.WEEK_EVIDENCE&&Date.parse(a.evidenceThrough??a.asOf??'')<until?a.evidenceThrough??a.asOf:null;};
 const closed=(j,sport)=>!!closedBy(j,sport);
 // The clock a week's gates are read at: the decision that closed it, else the week's last instant. Their windows (repeated adverse responses,
 // earned surplus, the last regression and return) look back from there, never from the cut, so history does not move with time (P2).
 const tz=program.timezoneOffsetMinutes??0,weekEnd=j=>new Date(Date.parse(onDate(program.weeks[j].startDate,7)+'T00:00:00Z')-tz*60000-1).toISOString();
 const clockOf=j=>[closedBy(j,'STRENGTH'),closedBy(j,'RUN')].filter(Boolean).sort().at(-1)??weekEnd(j);
 // The intake: week 0's start as recorded under INTAKE authority (before any return of week 0 replaced it), without the week's prescription summary.
 const intake=()=>{const w0=program.weeks[0],s=clone(w0?.startBeforeReturn??program.stateTrace[0]);delete s.run.planned;delete s.strength.planned;delete s.strength.entryWeek;delete s.strength.facts;return s;};
 // The return in force at the cut sets the point of the week it was reported in, a late one the point of the break's week (R7-A final §4).
 const returnAt=k=>ret?.entry&&(ret.late?k===p:ret.inForce&&inWeek(k,ret.day))?ret:null;
 const pointOf=k=>{const r=returnAt(k);return r?{kind:'RETURN',week:k,day:r.day,asOf:r.asOf,eventId:r.eventId}:{kind:'WEEK_START',week:k,day:program.weeks[k].startDate,asOf:null,eventId:null};};
 const at=k=>{
  if(memo.has(k))return memo.get(k);
  const r=returnAt(k);let out;
  if(r){const v={basis:WEEK_START.RETURN_ENTRY,week:k};out={state:{run:clone(r.entry.run),strength:clone(r.entry.strength)},values:{RUN:v,STRENGTH:Object.fromEntries(Object.keys(r.entry.strength?.exercises??{}).map(id=>[id,v]))},sport:{RUN:v,STRENGTH:v},since:{day:r.day,asOf:r.asOf},executed:[]};}
  else if(k===0){const v={basis:WEEK_START.INTAKE,week:0},s=intake();out={state:s,values:{RUN:v,STRENGTH:Object.fromEntries(Object.keys(s.strength.exercises).map(id=>[id,v]))},sport:{RUN:v,STRENGTH:v},since:null,executed:[]};}
  else{
   // HISTORY: a week's evidence is judged under the plan the athlete executed that week, its own context (sk.at(j)), never one a later change
   // re-planned, so no later decision (a goal, event or schedule change) rewrites what an earlier week earned (I1, P3). PLAN: the gates and the
   // transition follow the context of the week entered, as the planner's own transitions do (C2; QE-R7ASC-04).
   const j=k-1,P=at(j),week=program.weeks[j],skj=skOf(j),skn=plan?skOf(k):skj,sg=signals(week),clock=clockOf(j);
   // The evidence of the week as read at the cut, from some of its sessions, with the prescription summary that describes them (what the plan
   // prescribed; never the plan's state).
   const read=(sessions,stored,entryWeek)=>{
    const wk={...week,sessions},v={...view,weeks:program.weeks.map((x,i)=>i===j?wk:x)},ev=weekEvidence(v,j,day,seen,ctx.quarantined??[]),used=usedInWeek(wk);
    const vj={...v,decisions:view.decisions.filter(d=>Date.parse(d.asOf)<Date.parse(clock))},{gates}=weeklyGates(vj,skn,j,ev,usable,clock,{systemic:!!ev.systemicConvergence||sg.systemic,base:P.state});
    return {ev,used,gates,g:{ALL:'HOLD',...gates},logs:loggedLoads(ev,sg.confirmations),performed:performedInWeek(ev,seen),entryWeek,plannedRun:stored?.run?.planned??plannedOf(wk),plannedStrength:stored?.strength?.planned??plannedStrengthOf(used.map(u=>({...u,sets:u.phasedSets??u.sets})))};
   };
   // The week's sessions after the return whose entry the state before it is (C5), with their own summary: a run planned before the break, inside
   // the pause, is never read as executed (state model consumer closure, Property A; NF-R7ASM-1). The PLAN reading reads a return's own week as the
   // planner's weekly review reads it, every row of the week with the week's summary (E7), whether or not a review closed it: the start it gives
   // is the one that review gives, so a review closing the week never changes the dose (decision authority closure, QE-R7ASC-04).
   const after=P.since?s=>!beforeReturn(program,P.since)(s):()=>true,C5=read(week.sessions.filter(after),P.since?null:program.stateTrace[j]);
   const R=plan&&P.since?read(week.sessions,program.stateTrace[j],program.stateTrace[j]?.strength?.entryWeek):C5;
   // Executed completely: every gate of the sport ADVANCE or EARNED (a gate holds when any row of its role or exercise was not executed as
   // prescribed) and, for strength, every exercise's deciding log usable: a load in an unknown unit is no evidence of any load (Founder §13).
   const complete=sport=>{const {gates,ev,logs}=R,keys=sport==='RUN'?Object.keys(gates).filter(x=>runKeys.has(x)):[...new Set(ev.rows.filter(x=>x.sport==='STRENGTH').flatMap(x=>x.exercises))];return keys.length>0&&keys.every(x=>['ADVANCE','EARNED'].includes(gates[x])&&(sport==='RUN'||!!logs[x]));};
   const how=sport=>closed(j,sport)?WEEK_START.WEEK_EVIDENCE:complete(sport)?'COMPLETED_SESSIONS':null;
   const hr=how('RUN'),hs=how('STRENGTH');
   const run=hr?advanceRun(skn,{...P.state.run,planned:R.plannedRun},j,R.g):plan?advanceRun(skn,{...P.state.run,planned:R.plannedRun},j,{ALL:'HOLD'}):P.state.run;
   const strength=hs?advanceStrength(skn,{...P.state.strength,planned:R.plannedStrength,...(typeof R.entryWeek==='boolean'?{entryWeek:R.entryWeek}:{})},j,R.used,R.g,R.logs,{performed:R.performed,evidenceMode:true}):strengthAtBreak(skj,{...P.state.strength,planned:C5.plannedStrength},C5.used,C5.g,{performed:C5.performed,logged:C5.logs,evidenceMode:true});
   const runV=hr?{basis:hr,week:k}:P.values.RUN,sv=hs?{basis:hs,week:k}:null;
   const values=Object.fromEntries(Object.keys(strength.exercises).map(id=>[id,sv??P.values.STRENGTH[id]??{basis:'FACTS',week:null}]));
   out={state:{run,strength},values:{RUN:runV,STRENGTH:values},sport:{RUN:runV,STRENGTH:sv??P.sport.STRENGTH},since:null,executed:hs?[]:[...new Set([...P.executed,...Object.keys(C5.performed)])]};
  }
  memo.set(k,out);return out;
 };
 at.pointOf=pointOf;
 return at;
}
/** The return in force for a decision's own clock: the latest interruption's report in force (every recorded report precedes the decision). */
const returnInForce=program=>{const r=episodesOf(program).at(-1)?.live;return r?.entry?{entry:r.entry,day:r.day,asOf:r.asOf,eventId:r.eventId,late:false,inForce:true}:null;};
/** The evidence state at the decision's own cut, in the PLAN reading every planning consumer resolves from (memoized on the decision's context). */
const decisionEvidence=ctx=>ctx.evidence??=evidenceState(ctx,{cut:ctx.asOf,day:ctx.asOfLocal,ledger:ctx.fullLedger??ctx.ledger,ret:returnInForce(ctx.program),reading:'PLAN'});
/**
 * PlanningView (Founder §1, §15; state model consumer closure §7–§11; decision authority closure): the start of this week the decision plans from,
 * one DecisionContext for every consumer. It is derived and has no historical authority of its own; it declares which structure each part comes
 * from, so no reader confuses it with history:
 * - the evidence, in the PLAN reading of the evidence reducer: the facts and gates of HistoricalState, with each transition under the context of
 *   the week it enters (one goal, phase and schedule per transition, QE-R7ASC-04);
 * - strength: each exercise's dose as one unit, resolved from that reading by resolveExercisePrescription (EarnedProgress: load, repetition
 *   target and tick together, with the dates, return steps, counts and caps only executed evidence moves). An exercise only the plan assumed
 *   established is absent, so its next exposure is an establishment (D52). No projected atom is mixed into a dose (QE-R7ASM-03, F2, F3);
 * - the run: that reading's whole run in every mode (EarnedRunProgress). The projection's targets, ladder steps and unlock counters are never a
 *   start (QE-R7ASM-02, QE-R7ASC-02): two unexecuted weeks advance no threshold, quality, strides, walk/jog step or long run. The modes the
 *   program used (`modeHistory`, SSCTR D47) are a record of the plan, kept from both;
 * - the week's prescription summaries (`planned`) and its entry-week flag from the projection, which describe the rows the week prescribes.
 * The planner reads it; it never writes HistoricalState.
 */
function planningBase(ctx){
 const P=ctx.program.stateTrace[ctx.w],V=decisionEvidence(ctx)(ctx.w).state;
 const run={...clone(V.run),planned:clone(P.run.planned)},modes=[...new Set([...(V.run.modeHistory??[]),...(P.run.modeHistory??[])])].sort();
 if(modes.length)run.modeHistory=modes;else delete run.modeHistory;
 const exercises={};
 for(const [id,h] of Object.entries(V.strength.exercises)){const v=resolveExercisePrescription(h);if(v)exercises[id]=v;}
 // The novice density cap is evidence-gated (B0-C08): a decision reads it from the reducer, never from the projection's assumed release (QE-R7B-03).
 const strength={...clone(P.strength),exercises};if(V.strength.density!==undefined)strength.density=clone(V.strength.density);else delete strength.density;
 return {run,strength};
}
/**
 * Whether this review withdrew or changed evidence the plan may have been built on, and so moved this week's PlanningView (decision authority
 * closure, Property B): it carries a correction or a retraction, or a report that quarantines another in conflict, and the view on the record as
 * the review received it (the carried record, read canonically) differs from the view with the review's reports. New facts alone (a late record
 * of an earlier session) leave a projection ahead of them standing: the plan keeps projecting until a review gates the week.
 */
function viewMovedBy(ctx){
 const obs=(Array.isArray(ctx.review.observations)?ctx.review.observations:[]).filter(o=>o&&typeof o==='object'),start=ctx.program.weeks[ctx.w].startDate,dates=new Map(ctx.program.weeks.flatMap(x=>x.sessions.map(s=>[s.id,s.date])));
 const corrects=obs.some(o=>o.correctionOf!==undefined&&o.correctionOf!==null);
 if(!corrects&&!obs.some(o=>(dates.get(o.sessionId)??start)<start))return false;
 const {ledger,quarantined}=canonicalRecord(ctx.program,Array.isArray(ctx.review.actualLedger)?ctx.review.actualLedger:[],{authority:ctx.authority,cut:ctx.asOf});
 if(!corrects&&!(ctx.quarantined??[]).some(q=>!quarantined.includes(q)))return false;
 return hash(planningBase({...ctx,fullLedger:ledger,ledger:ledger.filter(o=>!o.conflicted),quarantined,evidence:undefined}))!==hash(ctx.base);
}
/**
 * The canonical factual state before any decision (residual authority closure, QE-R7ADA-01; Founder: raw evidence, dedupe, corrections, retractions
 * and conflicts, the canonical factual state, then the decision). A review under way whose evidence about an earlier week moved this week's
 * PlanningView (viewMovedBy: a correction, a retraction, a newly quarantined conflict) re-plans the sessions still ahead from that view (A3) whatever
 * kind of review carries it; completed sessions keep their rows. A week is under way while any session is still ahead by the one C1 test (a later
 * date, or later today), so a correction on the week's last day re-plans that day's sessions too. The re-plan projects the weeks after this one
 * from the same view and never closes the week: only a review of the complete week applies its evidence. It is a recorded decision
 * (REPLAN_FROM_EVIDENCE) and the handler decides on the program it gives, with the PlanningView read on that program (`ctx`). The same facts
 * therefore give the same factual history whichever review carried them, and no row planned from a retracted fact is the reference a later log is
 * judged against (A1, SSCTR D44). Null when nothing ahead moved; {ask} when the re-plan cannot be composed.
 */
function factualReplan(ctx){
 if(!(ctx.ev.pending||ctx.program.weeks[ctx.w].sessions.some(s=>s.prescription&&ctx.ahead(s)))||!viewMovedBy(ctx))return null;
 const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w});
 if(replan.ask)return {ask:{action:'ASK',reason:replan.ask,missingInputs:replan.missingInputs}};
 const changed=changedSessions(ctx.program,replan);if(!changed)return null;
 const proposal=finishProposal(ctx.program,ctx.sk,replan,{eventId:ctx.review.event.id,asOf:ctx.asOf,action:'REPLAN_FROM_EVIDENCE',fromWeek:ctx.w,horizonsConsidered:HORIZONS});
 const own={...ctx,program:proposal,evidence:undefined};own.base=planningBase(own);
 return {proposal,changed,ctx:own,horizons:horizonSummary(ctx.sk,ctx.program,proposal,{w:ctx.w,changed}),counterfactuals:[counter('KEEP','KEEP',false,'Keeping rows planned from evidence that has since been corrected would judge the next logs against facts that no longer stand'),counter('REPLAN_FROM_EVIDENCE','REPLAN_FROM_EVIDENCE',true,'The sessions still ahead follow the evidence as it now stands',{selected:true,changeCount:changed})]};
}
const FACTUAL_REPLAN='Evidence about an earlier week changed what this week starts from; the sessions still ahead are planned again from it, completed sessions stay as they were';
/**
 * B0-C01 with R7-A A5 (QE-R7B-04): a graduation stands only while its qualifying weeks still qualify on the canonical record, judged as the
 * boundary review judged them (its gates' windows at its clock) with the facts as they now stand. When a correction, a retraction or a quarantine
 * disqualifies one, the same facts known at the boundary would not have graduated: the graduation leaves the contexts from this week (or from
 * its first week, if later), the threshold ladder leaves the sessions ahead, executed sessions stay history, and a later block review can
 * graduate again from new executed weeks. Part of the canonical factual state, before any decision (as factualReplan). Null when it stands.
 */
function graduationWithdrawal(c){
 const grad=c.program.canonical.athlete.runGraduation;
 if(!grad||!Array.isArray(grad.qualifyingWeeks)||!grad.qualifyingWeeks.length)return null;
 const judged={...c,asOf:typeof grad.asOf==='string'?grad.asOf:c.asOf},failed=grad.qualifyingWeeks.map(q=>graduationWeek(judged,q.week)).filter(x=>!x.ok);
 if(!failed.length)return null;
 const from=Math.max(c.w,grad.fromWeek),weeks=failed.map(({week,why})=>({week,why}));
 const reason='A corrected report of week '+weeks.map(x=>x.week).join(' and ')+' no longer meets the graduation evidence: the harder session leaves the plan and easy running continues';
 const entry={...clone(grad),withdrawnFrom:from,withdrawnBy:c.review.event.id,withdrawnAt:c.asOf,failed:weeks,basis:'B0-C01; R7-A A5'};
 const r=rebuild(c,{canonical:x=>{const {runGraduation,...athlete}=x.athlete;return {...x,athlete:{...athlete,runGraduationWithdrawn:[...(x.athlete.runGraduationWithdrawn??[]),entry]}};},fromWeek:c.w,reason,action:'REPLAN_FROM_EVIDENCE'});
 if(!r.proposal)return {ask:r};
 const own={...c,program:r.proposal,evidence:undefined};own.base=planningBase(own);
 return {proposal:r.proposal,changed:changedSessions(c.program,r.proposal),ctx:own,horizons:r.horizons,
  counterfactuals:[counter('KEEP','KEEP',false,'Keeping the harder session would plan it on evidence that no longer stands'),counter('REPLAN_FROM_EVIDENCE','REPLAN_FROM_EVIDENCE',true,reason,{selected:true})],
  disclosures:[{id:'RUN_QUALITY_GRADUATION_WITHDRAWN',blocking:false,informational:true,weeks,fromWeek:from,detail:reason+'; it can be offered again at a later block review from new executed weeks',basis:'B0-C01'}]};
}
/**
 * A decision taken on the factually re-planned program (residual authority closure): a handler's own proposal already carries the re-plan; a decision
 * that changes nothing else proposes the re-plan (REPLAN_FROM_EVIDENCE); a question or a refusal is still asked or refused, with the re-plan proposed,
 * because the facts it follows stand. A clinical route proposes nothing (no dependent prescription).
 */
function withFactualReplan(f,d){
 if(!f||d.status==='CLINICAL_HUMAN_REQUIRED')return d;
 const note=FACTUAL_REPLAN.charAt(0).toLowerCase()+FACTUAL_REPLAN.slice(1),disclosures=[...(f.disclosures??[]),...(d.disclosures??[])],x=disclosures.length?{disclosures}:{};
 if(d.action==='KEEP')return {...d,...x,action:'REPLAN_FROM_EVIDENCE',instantiationOnly:false,proposal:d.proposal??f.proposal,reason:FACTUAL_REPLAN+(d.reason?'; '+d.reason:''),horizons:d.proposal?d.horizons:f.horizons,counterfactuals:[...f.counterfactuals,...(d.counterfactuals??[]).filter(c=>c.id!=='KEEP')]};
 if(d.proposal)return {...d,...x,instantiationOnly:false,reason:d.reason+'; '+note};
 return {...d,...x,status:d.status??(d.action==='ASK'?'ASK':undefined),proposal:f.proposal,reason:d.reason+'; meanwhile '+note,horizons:d.horizons??f.horizons};
}
/**
 * HistoricalState (Founder §1, §3, §13): what is known to have happened by a cut, read from canonical evidence only. Public and read-only: it
 * runs the evidence reducer on a program and its completed-work record (`actualLedger`, as evaluateProgram returns it) and reports the state as
 * of the cut: the reducer's own reading of the week the cut falls in, which is that week's facts while it is under way and its closed or complete
 * result once the decision that closes it has been made, so the state is continuous across a week boundary (P2):
 * - per strength exercise, the dose last executed (`lastExecutedLoad` as the evidence settled it, the load and repetitions logged), the last
 *   performed date (`lastPerformedAt`, an execution date only) and EARNED_PROGRESS (`earnedProgress.loadTick`; `stepEarned` when the evidence
 *   released a step the athlete has not executed yet);
 * - the run's evidence-gated state and its capability atoms;
 * - `state`, the same history as a state in the planner's terms (historicalStrength), which is what a return reads (I13).
 */
export function historicalStateOf(program,{asOf,actualLedger=[]},options={}){
 const authority=r6Authority(options),cut=utcTimestamp(asOf);
 if(!validProgram(program)||!authority.policy||!cut)return null;
 const tz=program.timezoneOffsetMinutes??0,day=localDate(cut,tz),sk=skeletonOf(program,authority);
 const k=program.weeks.findIndex(x=>day>=x.startDate&&day<=onDate(x.startDate,6));if(k<0)return null;
 // The record as the runtime reads it (canonicalRecord), never the carried rows as given: a superseded or retracted fact is not evidence here
 // either (Property B, QE-R7ASM-04), so this reader and the decisions' own reducer read one HistoricalState (P7).
 const {ledger,quarantined}=canonicalRecord(program,actualLedger,{authority,cut});
 const ctx={program,sk,authority,quarantined,fullLedger:ledger,ledger:ledger.filter(o=>!o.conflicted)};
 const E=evidenceState(ctx,{cut,day,ledger,ret:returnInForce({...program,decisions:program.decisions.filter(d=>Date.parse(d.asOf)<Date.parse(cut))})});
 // The reducer's reading of week k itself: facts while the week is under way (nothing closes or completes it yet), its closed or complete result
 // once the decision that closes it has been made. One reading, so the boundary between week k and week k+1 moves nothing (P2).
 const H=E(k+1),strength=H.state.strength,facts=strength.facts??{},resumable=historicalStrength(strength);
 const exercises=Object.fromEntries(Object.entries(resumable.exercises).map(([id,ex])=>{const f=facts[id],earnedStep=!!f&&ex.mode==='KNOWN'&&f.mode==='KNOWN'&&Number.isFinite(strength.exercises[id]?.load)&&strength.exercises[id].load>f.load+1e-9;
  return [id,{mode:ex.mode,lastExecutedLoad:f?.load??null,convention:f?.convention??ex.convention??null,lastExecutedReps:f?.reps??null,liftedLoad:f?.lifted??null,liftedReps:f?.liftedReps??null,lastExecutedOn:f?.on??null,lastPerformedAt:ex.lastPerformed??null,lastExecutedSets:ex.lastExecutedSets??null,earnedProgress:{loadTick:ex.loadTick??0,stepEarned:earnedStep},returnStep:Number.isInteger(ex.returnStep)?ex.returnStep:null}];}));
 const last=program.weeks.length-1,point=E.pointOf(Math.min(last,Math.min(H.sport.RUN.week,H.sport.STRENGTH.week)));
 return freeze({version:HISTORICAL_STATE_VERSION,athleteId:program.athleteId,cut,week:k,point,strength:{exercises},run:{mode:H.state.run.mode,achieved:clone(H.state.run.achieved),longestContinuous:H.state.run.longestContinuous??null},state:{run:clone(H.state.run),strength:resumable},basis:{RUN:H.sport.RUN.basis,STRENGTH:H.sport.STRENGTH.basis}});
}
export const HISTORICAL_STATE_VERSION='R7-HISTORICAL-STATE-1';
/**
 * The canonical record (state model consumer closure, Property B; Founder §6): the completed-work record as evaluateProgram returns it, normalized
 * and bound by the very functions evaluateProgram applies to it (normalizeObservations: duplicates merged, corrections and their supersession,
 * retractions, conflicts quarantined; then bindObservations), at the record's own clock: the latest instant any of its facts became available, or
 * the cut if later. Every fact the record holds is therefore read, a correction made after the cut still replaces what it corrects, and only the
 * reducer's cut (executions observed before it) limits what counts. The superseded rows the record carries stay inert history, as in a decision.
 */
function canonicalRecord(program,actualLedger,{authority,cut}){
 const rows=(Array.isArray(actualLedger)?actualLedger:[]).filter(o=>o&&typeof o==='object'),op=authority.policy.operational;
 const latest=rows.reduce((m,o)=>Math.max(m,...[o.correctedAt,o.reportedAt,o.supersededAt,o.observedAt].map(utcTimestamp).filter(Boolean).map(Date.parse)),Date.parse(cut));
 const n=normalizeObservations([],{athleteId:program.athleteId,asOf:new Date(latest).toISOString(),prior:rows,maximumAgeDays:36500,futureSkewSeconds:op.learning.futureClockSkewSeconds,timezoneOffsetMinutes:program.timezoneOffsetMinutes??0,loadIncrements:{...op.strength.smallestIncrement,SINGLE_IMPLEMENT:incrementFor(op.strength,'SINGLE_IMPLEMENT')}});
 const {bound,unbound}=bindObservations(program,n.accepted,op.hybrid,authority.policy);
 return {ledger:[...bound,...unbound],quarantined:n.quarantinedIdentities};
}
/**
 * executedStateAt(start) (R7-A final; Founder 0.5–0.8, §10; SSCTR D59): what the athlete had executed when an interruption began.
 * 1. The point: the start set by the latest decision in force at that moment. The latest interruption before this one, other than this one's own
 *    earlier reports, sets it when one of its reports was made by then (on or before the first day; before the stated start time when there is
 *    one): the report in force then, even if a newer report of it came later (I4). Reported in this week, the start it set from its report on;
 *    reported earlier, the start of this week, which carries it (C5). An interruption first reported only after this one began is still the
 *    latest one before it: the start its report set (0.7; the sessions between its end and its report belong to the plan before it, C5).
 *    Without one, the start of this week.
 *    The start is HistoricalState's (the evidence reducer, state model): never a stored start's values, so the same history gives the same state
 *    whichever side of a week boundary the interruption begins (P5), whichever handler ran meanwhile (I8) and whether the week before was
 *    reviewed (QE-R7AB-01). The record keeps, per value, its basis and the week it comes from.
 * 2. The facts (strengthAtBreak in evidence mode, R7-A.2): the strength exposures the record shows executed after that point and before the
 *    interruption began (planned before it, or executed before it; a conflicted report executes nothing until corrected, QRE-R6-14), each week read
 *    as the weekly review reads it, as facts only (a known load lifted is the load, Founder P5; a load only a row prescribed starts its tick at 0,
 *    R42). Nothing from the start on counts (I7). Runs keep the point's state; what they executed counts through the completed-work record.
 * 3. A session on the first day (0.8): with a stated start time it is before or after it. Without one it cannot be ordered: `state` reads it as
 *    after the start (the first day is a whole day of the interruption, R7-A.2 §5), the other reading is recorded (`point.sameDay`), and
 *    `material` says whether the order changes the state the return starts from (then the return asks).
 * The state returned is history as a return reads it (I13, T13): historicalStrength undoes a step the evidence released but the athlete never
 * executed, so a return starts from the dose last executed; historicalRun does the same for the run (the running state and doses last executed:
 * SSCTR F4, F4-X; QE-R7ADA-02), with the releases the return's class `cls` undoes (none given: every one).
 */
function stateAtBreak(ctx,{start,startedAt=null,episode=null,cls=null}){
 const {program}=ctx,tz=program.timezoneOffsetMinutes??0,p=Math.max(0,Math.min(ctx.w,Math.floor(dayGap(program.startDate,start)/7)));
 const inForce=b=>startedAt?Date.parse(b.asOf)<Date.parse(startedAt):b.day<=start;
 const E=episodesOf(program).filter(e=>e.id!==episode&&e.live.end<start).reduce((m,e)=>!m||e.live.end>m.live.end||e.live.end===m.live.end&&Date.parse(e.first.asOf)>Date.parse(m.first.asOf)?e:m,null);
 const R=E?E.reports.filter(inForce).at(-1)??E.live:null,late=!!R&&!inForce(R);
 const cut=startedAt??new Date(Date.parse(start+'T00:00:00Z')-tz*60000).toISOString(),all=ctx.fullLedger??ctx.ledger,dayOf=o=>o.localDate??localDate(o.observedAt,tz);
 const weekOf=k=>program.weeks[k],before=a=>Date.parse(a.asOf)<Date.parse(cut);
 // The point: HistoricalState at the interruption's week start, or the return in force there (the evidence reducer).
 const at=evidenceState(ctx,{cut,day:start,ledger:all,ret:R?.entry?{entry:R.entry,day:R.day,asOf:R.asOf,eventId:R.eventId,late,inForce:inForce(R)}:null,p}),H=at(p);
 const after=H.since?s=>!beforeReturn(program,H.since)(s):()=>true;
 const read=sameDay=>{
  const ledger=all.filter(o=>startedAt?Date.parse(o.observedAt)<Date.parse(startedAt):dayOf(o)<start||sameDay&&dayOf(o)===start),executed=new Set(ledger.filter(o=>!o.conflicted).map(o=>o.sessionId));
  const sessions=weekOf(p).sessions.filter(s=>after(s)&&(s.date<start||executed.has(s.id))),skj=ctx.sk.at?.(p)??ctx.sk;
  const v0={...program,weeks:program.weeks.map((x,i)=>i===p?{...x,sessions}:x),decisions:program.decisions.filter(before)};
  const ev=weekEvidence(v0,p,start,ledger,ctx.quarantined??[]),adaptations=weekOf(p).adaptations??[];
  const systemic=!!ev.systemicConvergence||adaptations.some(a=>a.kind==='SYSTEMIC_SIGNAL'&&before(a)),confirmations=Object.assign({},...adaptations.filter(a=>a.kind==='LOAD_CONFIRMATIONS'&&before(a)).map(a=>a.confirmations));
  const logged=loggedLoads(ev,confirmations);
  const {gates}=weeklyGates(v0,skj,p,ev,ledger.filter(o=>!o.conflicted),cut,{systemic,base:H.state}),performed=performedInWeek(ev,ledger);
  return {strength:historicalStrength(strengthAtBreak(skj,H.state.strength,usedInWeek(v0.weeks[p]),{ALL:'HOLD',...gates},{performed,logged,evidenceMode:true})),performed};
 };
 const base=read(false),alt=!startedAt&&all.some(o=>!o.conflicted&&o.context?.sport==='STRENGTH'&&dayOf(o)===start)?read(true).strength:null;
 // The two readings differ materially when they differ in anything but a last performed date (an exercise in use or not, its ceiling, an
 // unlogged load): those set the return's start. A last performed date alone only moves a re-establishment threshold, and the reading kept
 // (the session after the start, so the earlier date) is the conservative one. Judged on the state, never on a plan that later changes.
 const facts=s=>hash({...s,exercises:Object.fromEntries(Object.entries(s.exercises).map(([id,{lastPerformed,...e}])=>[id,e]))});
 const other=alt&&hash(alt)!==hash(base.strength)?hash(alt):null,material=!!other&&facts(alt)!==facts(base.strength);
 // Why the point holds authority as history (Founder §7): per sport, the basis of the evidence it reads, and per value its basis and the week it
 // comes from. The point recorded is the earliest of those weeks (a return's entry when that is the point).
 const point=at.pointOf(Math.min(H.sport.RUN.week,H.sport.STRENGTH.week)),authority={RUN:H.sport.RUN.basis,STRENGTH:H.sport.STRENGTH.basis};
 // The run as a return reads it (decision authority closure, SSCTR F4; residual authority closure, QE-R7ADA-02, F4-X): never above the running
 // state or dose of the runs executed completely since the state's latest entry (the report of the latest return in force, which set the plan from
 // it; else the intake) and before this interruption began (historicalRun): a mode or step the evidence released but the athlete never ran is not
 // tolerated yet. Runs before that report belong to the plan before its break (C5), which the return's entry already read.
 // Which release is undone follows the return's recipe. A short break resumes the last executed doses: every release is undone. A moderate break
 // re-enters a continuous runner from the entry towards the doses executed, and a long one restarts it, so they read the released easy state with
 // its doses capped at the executed ones; an undone return completion or restart switch would resume a return step or restart minutes without the
 // entry. A walk/jog athlete's recipes are the ladder's own (one step back, step 0), so the exit is undone for every break (SSCTR R46).
 const byId=new Map(program.weeks.flatMap(x=>x.sessions.map(s=>[s.id,s]))),since=R?Date.parse(R.asOf):-Infinity;
 const ran=all.filter(o=>!o.conflicted&&!o.partial&&o.context?.sport==='RUN'&&Date.parse(o.observedAt)<Date.parse(cut)&&Date.parse(o.observedAt)>since).sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)).map(o=>{const s=byId.get(o.context.sessionId);return s?.prescription?{role:s.role,dimension:s.progression?.dimension??null,value:s.progression?.value??null,minutes:s.prescription.durationMinutes,week:o.context.weekIndex,tolerated:!['ADVERSE','CONFLICTING'].includes(kindOf(o))}:null;}).filter(Boolean);
 const run=historicalRun(clone(H.state.run),ran,{stateOf:k=>at(k)?.state?.run??null,easyStepMinutes:ctx.sk.op.run.easyStepMinutes,undo:m=>!cls||cls==='SHORT'||m==='WALK_JOG'});
 return {state:{run:run&&(ctx.program.capability?.run?.familiarBouts??[]).length?{...run,familiarBoutsLapsed:true}:run,strength:base.strength},material,point:{...point,authority,values:clone(H.values),executed:[...new Set([...H.executed,...Object.keys(base.performed)])].sort(),...(late?{reportedAfterStart:true}:{}),...(other?{sameDay:other}:{})}};
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
 const at=stateAtBreak(ctx,{start:pauseStart,startedAt,episode:ep.episode,cls});
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
 // The start a return replaces keeps its authority with it (historicalWeekStart reads that start for this week).
 if(fromWeek===w){const was=program.weeks[w];base={...base,weeks:base.weeks.map((x,k)=>k!==w?x:{...x,startBeforeReturn:clone(was.startBeforeReturn??program.stateTrace[w]),startBeforeReturnAuthority:clone((was.startBeforeReturn?was.startBeforeReturnAuthority:was.startAuthority)??null)})};}
 // Re-entry this week starts the week again from the return; re-entry next week is next week's start (C3). The entry is evidence-anchored:
 // the state executed when the interruption began, with its facts (RETURN_ENTRY).
 const next=composeWeeks(ctx,base,{fromWeek,start:{runState,strengthState},startAuthority:anchoredStart(WEEK_START.RETURN_ENTRY,{eventId:review.event.id,asOf:ctx.asOf}),completedRuns:returnRuns,returnDay:asOfLocal,evidence:evidenceRule(ctx)});
 if(next.ask)return {action:'ASK',reason:next.ask,missingInputs:next.missingInputs};
 // A named correction cannot move its interruption over the re-entry its return already had (Founder §11, I7): training recorded after that
 // return began (the interruption's first report), on or before the corrected end, would be both re-entry and before or inside the
 // interruption. When the new reading changes a prescription it is asked, never resolved by choosing one story.
 if(ep.relation==='SAME_BREAK'&&ep.basis==='EXPLICIT'){
  const e=episodesOf(program).find(x=>x.id===ep.episode),dayOfObs=o=>o.localDate??localDate(o.observedAt,tz);
  const crossed=(ctx.fullLedger??ctx.ledger).filter(o=>!o.conflicted&&o.context?.sessionId&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)&&Date.parse(o.observedAt)>=Date.parse(e.first.asOf)&&dayOfObs(o)<=end);
  if(crossed.length&&changedSessions(program,{weeks:next.weeks})>0)return {action:'ASK',reason:`This correction puts the interruption first reported on ${e.first.day} from ${pauseStart} to ${end}, but training recorded after its return began (${[...new Set(crossed.map(dayOfObs))].sort().join(', ')}) would then come before or inside it, and both cannot be true: say when the interruption started and ended`,missingInputs:['interruption.startDate','interruption.endDate'],screen};
 }
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
const HANDLERS={EXERCISE_SUBSTITUTION:exerciseSubstitution,WEEKLY_REVIEW:weeklyReview,MISSED_SESSION:missedSession,PARTIAL_SESSION:ctx=>weeklyReview(ctx,{extraReason:'Partial execution counts only what was done; the next comparable step repeats'}),UNDERPERFORMANCE:performanceSignal,PROGRESSION_NOT_TOLERATED:performanceSignal,OVERPERFORMANCE:performanceSignal,PROGRESSION_TOO_EASY:performanceSignal,LOCAL_FATIGUE:fatigue,SYSTEMIC_FATIGUE:fatigue,SCHEDULE_CHANGE:scheduleChange,UNAVAILABLE_DAY:unavailableDay,DOUBLE_CONFLICT:doubleConflict,EQUIPMENT_CHANGE:equipmentChange,GOAL_CHANGE:goalChange,EVENT_DATE_CHANGE:goalChange,RETURN_AFTER_PAUSE:returnAfterPause,EVENT_WEEK_CONFLICT:eventWeekConflict,RECOVERED:recovered};
