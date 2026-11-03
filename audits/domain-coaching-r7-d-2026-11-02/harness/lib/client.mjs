// R7-D evaluation client (R7D-HARNESS-2). A client conforming to C3: it carries the record exactly as the runtime returns it
// (actualLedger, referenceState, updatedModel), sends new reports only as observations, adopts proposals, never invents a report,
// a clock, a load, a confirmation or an answer, and models qualified clinical clearance only where a step says so (it drops the
// clinical continuation state and keeps the record, as the frozen tests model it).
// R7D-HARNESS-2 (Phase 3): it also carries the athlete's current learning consent to every decision (HG-01: the runtime reads consent per
// decision, so a revocation sent once would lapse), and confirms a pending load with the value the runtime returned (HG-06: a load
// question's `logged` is a number in kilograms; the convention is the planned row's).
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {clone,addDays,localDate,offsetString,hasZone,dayGap,digestOf,CorpusError} from './util.mjs';

export const REVIEW_KIND_FIELDS=['changes','interruption','signals','substitution','currentDemonstration'];
export const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const ELIGIBILITY_FLAGS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];

/** Loads the runtime entry point from a CoachingCore root (the frozen one, or an archive of a superseded freeze). */
export async function loadRuntime(coachingCoreRoot){
 const mod=await import(pathToFileURL(path.join(coachingCoreRoot,'src','r6-index.mjs')).href);
 return {generateProgram:mod.generateProgram,evaluateProgram:mod.evaluateProgram,root:coachingCoreRoot};
}

export function defaultEligibility(day){
 return {status:'NONCLINICAL_CONFIRMED',assessedAt:day,...Object.fromEntries(ELIGIBILITY_FLAGS.map(k=>[k,false]))};
}

/** The decision clock of a step: `{week, day, time}` in the athlete's local time, or an explicit timestamp with its zone. */
export function stepClock(step,program,tz){
 const at=step.at;
 if(typeof at==='string'){if(!hasZone(at))throw new CorpusError(`step ${step.stepId}: an explicit clock needs a time zone`,{at});return at;}
 if(!at||!Number.isInteger(at.week)||!Number.isInteger(at.day)||at.day<0||at.day>6||typeof at.time!=='string'||!/^\d{2}:\d{2}$/.test(at.time))throw new CorpusError(`step ${step.stepId}: at must be {week, day 0-6, time 'HH:MM'} or a zoned timestamp`,{at});
 return `${addDays(program.startDate,at.week*7+at.day)}T${at.time}:00${offsetString(tz)}`;
}

export function resolveSession(program,ref,label){
 if(!ref||typeof ref!=='object'||!Number.isInteger(ref.week)||!['RUN','STRENGTH'].includes(ref.sport))throw new CorpusError(`${label}: a reference needs {week, sport}`,{ref});
 const week=program.weeks[ref.week];
 if(!week)throw new CorpusError(`${label}: week ${ref.week} is outside the program`,{ref});
 const roles=ref.role==null?[null]:Array.isArray(ref.role)?ref.role:[ref.role];
 for(const pass of [live,s=>!!s.prescription])for(const role of roles){
  const found=week.sessions.filter(s=>s.sport===ref.sport&&(role==null||s.role===role)&&(ref.day==null||s.day===ref.day)&&pass(s)).sort((a,b)=>a.day-b.day||String(a.id).localeCompare(String(b.id)));
  if(found.length)return {session:found[0],resolution:{ref:clone(ref),role:found[0].role,sessionId:found[0].id,ambiguous:found.length>1,candidates:found.map(s=>s.id),live:live(found[0])}};
 }
 throw new CorpusError(`${label} matches no session: ${JSON.stringify(ref)}`,{ref});
}
const sessionById=(program,id)=>program.weeks.flatMap(w=>w.sessions).find(s=>s.id===id)??null;
const matchesRef=(s,ref)=>!!ref&&s.weekIndex===ref.week&&s.sport===ref.sport&&(ref.day==null||s.day===ref.day)&&(ref.role==null||(Array.isArray(ref.role)?ref.role.includes(s.role):s.role===ref.role));

/** An R6-REVIEW-1 observation from a case fact about session s. */
export function observationFrom(program,s,fact,{caseId}){
 const p=s.prescription;
 if(!p)throw new CorpusError(`a fact references a session without a prescription (${s.id})`,{fact});
 if(typeof fact.completed!=='boolean'&&fact.asPrescribed!==true)throw new CorpusError(`a fact about ${s.id} needs completed:boolean`,{fact});
 const completed=typeof fact.completed==='boolean'?fact.completed:true,actual={completed};
 let minutes=null;
 if(Number.isFinite(fact.minutes))minutes=fact.minutes;
 else if(completed&&fact.asPrescribed===true)minutes=p.durationMinutes;
 else if(completed&&Number.isFinite(fact.fraction))minutes=Math.round(p.durationMinutes*fact.fraction);
 if(Number.isFinite(minutes))actual.minutes=minutes;
 if(p.modality==='STRENGTH'&&completed){
  if(Array.isArray(fact.exercises))actual.exercises=clone(fact.exercises);
  else if(fact.asPrescribed===true||Number.isInteger(fact.firstExercises)){
   const rows=Number.isInteger(fact.firstExercises)?p.exercises.slice(0,fact.firstExercises):p.exercises;
   actual.exercises=rows.map(e=>{
    const stated=fact.loadsByPattern?.[e.pattern];
    const load=e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:e.load.mode==='KNOWN'&&Number.isFinite(e.load.value)?{value:e.load.value,unit:e.load.unit??'KG',convention:e.load.convention}:Number.isFinite(stated)?{value:stated,unit:'KG',convention:e.load.convention}:null;
    return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(load?{load}:{}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))};
   });
  }
 }
 const r=fact.response??{};
 const response={performance:r.performance??'UNKNOWN',recovery:r.recovery??'UNKNOWN',effort:r.effort??'UNKNOWN',...(r.nextDayFunction?{nextDayFunction:r.nextDayFunction}:{})};
 const o={eventId:fact.eventId??`${caseId}-${s.id}`,athleteId:program.athleteId,sessionId:s.id,actual,response};
 if(fact.observedAt){if(!hasZone(fact.observedAt))throw new CorpusError(`observedAt needs a time zone (${s.id})`,{fact});o.observedAt=fact.observedAt;}else o.occurrenceDate=fact.occurrenceDate??s.date;
 for(const k of ['reportedAt','correctionOf','correctedAt','source','comparable','confounded'])if(fact[k]!==undefined)o[k]=clone(fact[k]);
 return o;
}

/** Expands a step's facts (single references, the bulk form) into observations against the plan in force. */
function expandFacts(program,facts,ctx,resolutions){
 const out=[];
 for(const [i,f] of (facts??[]).entries()){
  if(f?.each){
   const e=f.each,weeks=Array.isArray(e.weeks)?e.weeks:[e.weeks];
   if(!['RUN','STRENGTH'].includes(e.sport))throw new CorpusError(`bulk fact ${i}: each.sport must be RUN or STRENGTH`,{fact:f});
   const {each,...fact}=f;let n=0;
   for(const w of weeks){
    const week=program.weeks[w];if(!week)throw new CorpusError(`bulk fact ${i}: week ${w} is outside the program`,{fact:f});
    for(const s of week.sessions.filter(s=>live(s)&&s.sport===e.sport&&(!e.roles||e.roles.includes(s.role)))){out.push(observationFrom(program,s,fact,ctx));n++;}
   }
   resolutions.push({kind:'BULK',index:i,each:clone(e),sessions:n});
   continue;
  }
  const {session,resolution}=resolveSession(program,f.ref,`fact ${i}`);
  resolutions.push({kind:'OBSERVATION',index:i,...resolution});
  const {ref,...fact}=f;out.push(observationFrom(program,session,fact,ctx));
 }
 return out;
}

/** What the client sent, without the carried record (kept by reference in the trace, sized here). */
const sent=review=>{const {actualLedger,referenceState,athleteModel,...rest}=review;return {...clone(rest),carried:{ledgerRows:(actualLedger??[]).length,referenceState:!!referenceState,athleteModel:!!athleteModel}};};

/**
 * Runs one case through the runtime. `hooks` (metamorphic variants only): `intake(intake)`, `review(review, ctx)` called on the assembled
 * review, `carry(state)` called before each step on the carried record. Returns the full trace.
 */
export function runCase(runtime,kase,hooks={}){
 const trace={caseId:kase.caseId,generation:null,steps:[],corpusErrors:[],runtimeErrors:[],integrity:[],notes:[],stopped:null};
 const intake=hooks.intake?hooks.intake(clone(kase.intake)):clone(kase.intake);
 let gen;
 try{gen=runtime.generateProgram(intake);}catch(e){trace.runtimeErrors.push({at:'GENERATE',name:e.name,message:e.message});trace.stopped='RUNTIME_EXCEPTION';return trace;}
 // Runtime outputs are deep-frozen and carried by reference, never re-serialized: a JSON copy would change values such as Infinity and
 // break the program's integrity hash (C3: the record and the plan travel exactly as returned).
 trace.generation=gen;trace.intake=intake;
 if(gen.status!=='PROPOSED'||!gen.program){trace.stopped=(kase.timeline??[]).length?'NO_PROGRAM':null;return trace;}
 const tz=intake.timezoneOffsetMinutes??0;
 // The athlete's current learning consent (HG-01): the intake's, then the latest a step states; sent with every decision once known.
 const st={program:gen.program,ledger:[],ref:null,model:null,last:null,pendingQuestion:null,prevAsOf:null,consent:typeof intake.learningConsent==='boolean'?intake.learningConsent:null};
 const caseId=kase.caseId;
 for(const step of kase.timeline??[]){
  const resolutions=[],notes=[];let review;
  try{
   const program=st.program,asOf=stepClock(step,program,tz),local=localDate(asOf,program.timezoneOffsetMinutes??0),weekIndex=Math.floor(dayGap(program.startDate,local)/7);
   if(!Number.isFinite(Date.parse(asOf)))throw new CorpusError(`step ${step.stepId}: invalid clock`,{asOf});
   if(weekIndex<0||weekIndex>=program.weeks.length)throw new CorpusError(`step ${step.stepId}: clock ${asOf} is outside the program`,{asOf});
   if(st.prevAsOf&&Date.parse(asOf)<Date.parse(st.prevAsOf))throw new CorpusError(`step ${step.stepId}: steps are not in clock order`,{asOf,previous:st.prevAsOf});
   const ev=step.event??{};
   if(typeof ev.kind!=='string')throw new CorpusError(`step ${step.stepId}: event.kind is required`,{});
   if(step.clearance==='QUALIFIED_CLEARANCE'){st.ref=null;notes.push('QUALIFIED_CLEARANCE_APPLIED');}
   const eligibility=step.eligibility===undefined||step.eligibility==='REANSWERED_NO_CHANGE'?defaultEligibility(local):clone(step.eligibility);
   const observations=expandFacts(program,step.observations,{caseId},resolutions);
   review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex,event:{id:`${caseId}-${step.stepId}`,kind:ev.kind},eligibility};
   for(const k of REVIEW_KIND_FIELDS)if(ev[k]!==undefined)review[k]=clone(ev[k]);
   if(review.substitution?.exerciseRef){
    const r=review.substitution.exerciseRef,{session}=resolveSession(program,{week:r.week,sport:'STRENGTH',day:r.day},'substitution.exerciseRef');
    const ex=(session.prescription.exercises??[]).find(e=>!r.pattern||e.pattern===r.pattern);
    if(!ex)throw new CorpusError(`substitution.exerciseRef: no ${r.pattern??''} exercise in ${session.id}`,{ref:r});
    delete review.substitution.exerciseRef;review.substitution.exerciseId=ex.id;resolutions.push({kind:'SUBSTITUTION',sessionId:session.id,exerciseId:ex.id});
   }
   if(step.answer){
    const q=st.pendingQuestion,a=step.answer;
    // R7D-HARNESS-4: the question about training between two separate breaks (TRAINING_BETWEEN_BREAKS) lists its sessions the same way.
    if(q?.kind==='UNREPORTED_TRAINING'||q?.kind==='TRAINING_BETWEEN_BREAKS'){
     const ids=q.unreported?.sessionIds??[],used=new Set();
     for(const id of ids){
      const s=sessionById(program,id);
      if(!s?.prescription){notes.push('QUESTION_SESSION_NOT_IN_PLAN:'+id);continue;}
      const oi=(a.overrides??[]).findIndex(o=>matchesRef(s,o.ref));
      if(oi>=0)used.add(oi);
      const fact=oi>=0?(({ref,...x})=>({...(a.report??{}),...x}))(a.overrides[oi]):a.report;
      if(fact)observations.push(observationFrom(program,s,fact,{caseId}));
     }
     for(const [i,o] of (a.overrides??[]).entries())if(!used.has(i)){const {session,resolution}=resolveSession(program,o.ref,`answer override ${i}`);resolutions.push({kind:'ANSWER_OVERRIDE',index:i,...resolution});const {ref,...x}=o;observations.push(observationFrom(program,session,{...(a.report??{}),...x},{caseId}));}
     resolutions.push({kind:'ANSWER',questionSessions:ids.length});
    }else notes.push('ANSWER_WITHOUT_PENDING_QUESTION');
    if(a.declareBreak)review.interruption=clone(a.declareBreak);
   }
   review.observations=observations;
   if(step.targetRef){const {session,resolution}=resolveSession(program,step.targetRef,'targetRef');resolutions.push({kind:'TARGET',...resolution});review.targetSessionId=session.id;}
   if(step.respondToOffers){
    const choices=[];
    for(const o of st.last?.offers??[]){
     const kind=o.type??o.id,answer=step.respondToOffers[kind];
     if(!answer)continue;
     if(kind==='RUN_QUALITY_GRADUATION')choices.push({offer:'RUN_QUALITY_GRADUATION',decision:answer});
     else if(kind==='LADDER_STEP'&&answer==='ACCEPT')choices.push({type:'LADDER_STEP',from:o.from,to:o.to});
    }
    if(choices.length)review.choices=choices;else notes.push('NO_OFFER_TO_RESPOND');
   }
   if(step.confirmPendingLoads===true){
    // The runtime returns `logged` as the kilogram value it read (or, for an unreadable unit, the raw value); a question carries no convention,
    // so the planned row's convention is used: a confirmation in another convention would confirm nothing (HG-06).
    const rowConvention=q=>sessionById(st.program,q.sessionId)?.prescription?.exercises?.find(e=>e.id===q.exerciseId)?.load?.convention??null;
    const loggedKg=q=>Number.isFinite(q.logged)?q.logged:Number.isFinite(q.logged?.value)?q.logged.value:null;
    const conf=(st.last?.loadQuestions??[]).filter(q=>q&&typeof q.exerciseId==='string'&&!q.confirmed&&Number.isFinite(loggedKg(q))&&rowConvention(q)).map(q=>({exerciseId:q.exerciseId,value:loggedKg(q),unit:'KG',convention:rowConvention(q)}));
    if(conf.length)review.loadConfirmations=conf;else notes.push('NO_LOAD_QUESTION_TO_CONFIRM');
   }
   if(typeof step.learningConsent==='boolean')st.consent=step.learningConsent;
   if(typeof st.consent==='boolean')review.learningConsent=st.consent;
   if(hooks.carry)hooks.carry(st,{step});
   if(st.ledger.length)review.actualLedger=st.ledger;
   if(st.ref)review.referenceState=st.ref;
   if(st.model)review.athleteModel=st.model;
   if(hooks.review)review=hooks.review(review,{step,program,st});
   st.prevAsOf=asOf;
  }catch(e){
   if(e instanceof CorpusError){trace.corpusErrors.push({stepId:step.stepId,message:e.message,detail:e.detail});trace.stopped='CORPUS_ERROR';break;}
   throw e;
  }
  const program=st.program,before=digestOf(program),reviewDigest=digestOf(review);let result;
  try{result=runtime.evaluateProgram(program,review);}catch(e){trace.runtimeErrors.push({at:step.stepId,name:e.name,message:e.message,stack:String(e.stack).split('\n').slice(0,4).join(' | ')});trace.stopped='RUNTIME_EXCEPTION';break;}
  if(digestOf(program)!==before)trace.integrity.push({stepId:step.stepId,issue:'PROGRAM_INPUT_MUTATED'});
  if(digestOf(review)!==reviewDigest)trace.integrity.push({stepId:step.stepId,issue:'REVIEW_INPUT_MUTATED'});
  if(result.applied!==false)trace.integrity.push({stepId:step.stepId,issue:'APPLIED_NOT_FALSE'});
  if(digestOf(result.officialPlanState??null)!==digestOf(result.appliedState??null))trace.integrity.push({stepId:step.stepId,issue:'OFFICIAL_EFFECT'});
  const r=result,asOfLocal=localDate(review.asOf,program.timezoneOffsetMinutes??0);
  const adopted=!!r.proposal&&step.adoptProposal!==false;
  trace.steps.push({stepId:step.stepId,kind:review.event.kind,consent:st.consent,asOf:review.asOf,asOfLocal,weekIndex:review.weekIndex,notes,resolutions,review:sent(review),result:r,planBefore:program,planAfter:adopted?r.proposal:program,adopted,ledgerBefore:st.ledger,refBefore:st.ref,pendingQuestionBefore:st.pendingQuestion,clearance:step.clearance==='QUALIFIED_CLEARANCE'});
  st.ledger=r.actualLedger??st.ledger;st.ref=r.referenceState??st.ref;st.model=r.updatedModel??st.model;st.last=r;
  if(r.question)st.pendingQuestion=r.question;else if(r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE')st.pendingQuestion=null;
  if(adopted)st.program=r.proposal;
 }
 return trace;
}
