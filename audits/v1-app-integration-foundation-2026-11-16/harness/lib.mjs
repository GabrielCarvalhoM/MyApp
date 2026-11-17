// Application Integration Foundation (Founder request of 2026-11-16): the headless client of the composed CoachingCore entry point.
// What it is: the smallest layer an app needs above the engine. It keeps the record envelope (the plan in force and every record an answer
// returns), sends each record back with the next review, persists the envelope atomically, restores it, and projects answers into small,
// versioned views (APP-VIEW-0) for screens. It decides nothing about training: every session, dose, hold, forecast, insight and exposure is
// the engine's answer, reshaped. The plan view is the V1CIB one (src/boundary/views.mjs), reused through a document-shaped adapter.
// What it is not: custody (no keyed chain, no authentication, no consent), an iOS adapter, HealthKit, or a contract approved by a judge.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as S from '../../../CoachingCore/src/v1-strength-index.mjs';
import {planView} from '../../../CoachingCore/src/boundary/views.mjs';
import {canonical} from '../../../CoachingCore/src/value.mjs';

export {S};
export const ENVELOPE_SCHEMA='VF-APP-RECORD-ENVELOPE-0';
export const VIEW_SCHEMA='VF-APP-VIEW-0';
/** The records the composed entry point returns and must receive back (PHASE_B_CLOSURE §5; ATHLETE_DATA_FOUNDATION §2.2; custody keeps the model). */
export const CARRIED=Object.freeze(['actualLedger','referenceState','athleteModel','runEvidenceRecord','runFormatRecord','runHistoryRecord']);
/** The presentation blocks of an answer the app shows between reviews (a cache, never canonical: rebuilt by the next answer). */
export const PRESENTATION=Object.freeze(['status','action','reason','missingInputs','question','runSessions','runFormat','runForecast','paceInsights','paceRevision','strengthExtension','strengthExposure']);

const sha=text=>createHash('sha256').update(text).digest('hex');
export const digestOf=v=>sha(canonical(v)??'null');
const bytes=v=>Buffer.byteLength(JSON.stringify(v)??'null');
const now=()=>performance.now();

/** A new, empty envelope for one athlete. */
const emptyEnvelope=()=>({schema:ENVELOPE_SCHEMA,engine:S.V1_STRENGTH_ENGINE,version:0,athleteId:null,program:null,actualLedger:[],referenceState:null,athleteModel:null,
 runEvidenceRecord:[],runFormatRecord:[],runHistoryRecord:[],decisions:[],presentation:null});

/**
 * createClient({envelope?, onMeasure?}) → the headless client. `onMeasure(op, {ms, ...})` receives timings and sizes.
 * Every engine call goes through the composed entry point with no options, as an integration must (PHASE_B_CLOSURE §5).
 */
export function createClient({envelope=null,onMeasure=()=>{}}={}){
 let env=envelope?structuredClone(envelope):emptyEnvelope(),n=0,last=null;
 const measure=(op,t0,extra={})=>onMeasure(op,{ms:now()-t0,...extra});
 /** Keeps what an answer returns: the plan in force (a proposal adopted as the engine applied it), every carried record, the presentation cache. */
 function keep(r,{kind,asOf,eventId}){
  if(r.program&&!env.program)env.program=r.program;
  if(r.proposal)env.program=r.proposal;
  if(Array.isArray(r.actualLedger))env.actualLedger=r.actualLedger;
  else if(Array.isArray(r.carriedRecord))env.actualLedger=r.carriedRecord;
  if(r.referenceState!==undefined&&r.referenceState!==null)env.referenceState=r.referenceState;
  if(r.updatedModel)env.athleteModel=r.updatedModel;
  for(const k of ['runEvidenceRecord','runFormatRecord','runHistoryRecord'])if(Array.isArray(r[k]))env[k]=r[k];
  env.athleteId=env.program?.athleteId??env.athleteId;
  env.decisions=[...env.decisions,{eventId,kind,asOf,status:r.status,action:r.action??null,reason:typeof r.reason==='string'?r.reason:null,programHash:env.program?.hash??null,
   ...(r.guidance?{guidance:{level:r.guidance.level,wordingStatus:r.guidance.wordingStatus}}:{})}];
  env.presentation={asOf,engine:S.V1_STRENGTH_ENGINE,...Object.fromEntries(PRESENTATION.filter(k=>r[k]!==undefined).map(k=>[k,r[k]]))};
  // A runSessions block is only the sessions the format layer delivered for this answer; an inactive layer keeps the last delivered detail.
  env.version+=1;last=r;return r;
 }
 /** The review input: the common fields, the athlete's facts, and every carried record sent back as kept. */
 function input(kind,asOf,extra){
  const weekIndex=Math.floor((Date.parse(asOf.slice(0,10)+'T00:00:00Z')-Date.parse(env.program.startDate+'T00:00:00Z'))/(7*864e5));
  return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex,event:{id:extra.eventId??`hx-${env.version}-${++n}`,kind},...extra.facts,
   ...(env.actualLedger.length?{actualLedger:env.actualLedger}:{}),...(env.referenceState?{referenceState:env.referenceState}:{}),...(env.athleteModel?{athleteModel:env.athleteModel}:{}),
   runEvidenceRecord:env.runEvidenceRecord,runFormatRecord:env.runFormatRecord,runHistoryRecord:env.runHistoryRecord};
 }
 return {
  get envelope(){return env;},get last(){return last;},
  /** Onboarding: the synthetic intake normalized and planned by the engine. */
  onboard(intake){
   const t0=now(),r=S.generateProgram(intake);measure('generate',t0,{answerBytes:bytes(r),programBytes:bytes(r.program)});
   return r.status==='PROPOSED'?keep(r,{kind:'ONBOARD',asOf:intake.asOf,eventId:'onboard'}):(last=r,r);
  },
  /** One review: `kind` the engine event kind, `asOf` the local instant with offset, `facts` the athlete's own fields (observations, eligibility...). */
  review(kind,asOf,facts={},{eventId}={}){
   const rv=input(kind,asOf,{facts,eventId}),t0=now(),r=S.evaluateProgram(env.program,rv);
   measure('evaluate',t0,{kind,status:r.status,ledgerRows:env.actualLedger.length,inputBytes:bytes(rv),answerBytes:bytes(r)});
   return keep(r,{kind,asOf,eventId:rv.event.id});
  },
  /** A new plan from updated facts, the record carried (F08 Situation 3 and any restart). */
  restart(intake,asOf){
   const t0=now(),r=S.restartProgram({intake,record:env.actualLedger,referenceState:env.referenceState,asOf,athleteId:env.athleteId,runEvidenceRecord:env.runEvidenceRecord,runFormatRecord:env.runFormatRecord,runHistoryRecord:env.runHistoryRecord});
   measure('restart',t0,{answerBytes:bytes(r)});
   if(r.status!=='PROPOSED'){last=r;return r;}
   env.program=r.program;env.referenceState=null;return keep(r,{kind:'RESTART',asOf,eventId:`restart-${env.version}`});
  }
 };
}

// ---------- persistence: atomic write, digest check, restore ----------
/** Writes the envelope as JSON next to its digest, through a temporary file renamed over the target (atomic on one file system). */
export function persist(env,file){
 const t0=now(),text=JSON.stringify(env),body=JSON.stringify({digest:sha(text),envelope:env});
 fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.tmp';fs.writeFileSync(tmp,body);fs.renameSync(tmp,file);
 return {ms:now()-t0,bytes:Buffer.byteLength(body)};
}
/** Reads an envelope back; a digest mismatch (corruption) is refused, never planned on. The digest detects accidents, not tampering (no key). */
export function restore(file){
 const t0=now(),raw=fs.readFileSync(file,'utf8'),{digest,envelope}=JSON.parse(raw);
 if(sha(JSON.stringify(envelope))!==digest)return {ok:false,error:'DIGEST_MISMATCH'};
 if(envelope.schema!==ENVELOPE_SCHEMA||envelope.engine!==S.V1_STRENGTH_ENGINE)return {ok:false,error:'ENVELOPE_OF_ANOTHER_VERSION',engine:envelope.engine};
 return {ok:true,envelope,ms:now()-t0,bytes:Buffer.byteLength(raw)};
}

// ---------- projections (APP-VIEW-0): reshaping only, no training rule ----------
/** The V1CIB plan view over the envelope (the same states, the hold read from the record, executable/projected flags). */
export function planOf(env,{nowMs,week=null}){
 const doc={athleteId:env.athleteId,version:env.version,program:env.program,rows:env.actualLedger,reference:env.referenceState,pending:null,decisions:env.decisions.map(d=>({...d,at:d.asOf}))};
 return planView(doc,{nowMs,week});
}
/** A session row for a list: what a list cell needs, never the prescription body. */
function sessionRow(s,runs){
 const run=runs?.[s.id];
 return {id:s.id,date:s.date,sport:s.sport,role:s.role,turn:s.turn,status:s.status,executable:s.executable,projected:s.projected,
  minutes:s.prescription?.durationMinutes??null,...(s.sport==='RUN'?{expression:run?.expression??(s.prescription?'TIME':null)}:{}),
  ...(s.sport==='STRENGTH'&&s.prescription?{exercises:s.prescription.exercises?.length??0}:{})};
}
/** Today: the plan state and today's sessions (list rows), the week's summary counts. */
export function todayView(env,{nowMs}){
 const v=planOf(env,{nowMs}),runs=env.presentation?.runSessions;
 const rows=(v.week?.sessions??[]).map(s=>sessionRow(s,runs));
 return {schema:VIEW_SCHEMA,view:'TODAY',asOf:env.presentation?.asOf??null,state:v.state,today:v.today,weekIndex:v.weekIndex,sports:v.sports,hold:v.hold,question:v.question,
  sessions:rows.filter(s=>s.date===v.today),week:{planned:rows.filter(s=>s.status!=='REST'&&s.minutes!==null).length,minutes:rows.reduce((a,s)=>a+(s.minutes??0),0)}};
}
/** The week: one row per session. */
export function weekView(env,{nowMs,week=null}){
 const v=planOf(env,{nowMs,week}),runs=env.presentation?.runSessions;
 return {schema:VIEW_SCHEMA,view:'WEEK',state:v.state,weekIndex:v.week?.index??null,startDate:v.week?.startDate??null,sessions:(v.week?.sessions??[]).map(s=>sessionRow(s,runs))};
}
/** One session's detail: a run's structure (the format layer's blocks when delivered, else the time prescription), or a strength session's rows. */
export function sessionDetail(env,{nowMs,sessionId}){
 const v=planOf(env,{nowMs,week:null}),all=env.program.weeks.flatMap((_,k)=>planOf(env,{nowMs,week:k}).week.sessions),s=all.find(x=>x.id===sessionId);
 if(!s)return {schema:VIEW_SCHEMA,view:'SESSION',status:'NOT_FOUND'};
 if(!s.prescription)return {schema:VIEW_SCHEMA,view:'SESSION',status:v.hold?'HELD':'NO_PRESCRIPTION',id:s.id,sport:s.sport};
 const base={schema:VIEW_SCHEMA,view:'SESSION',status:'AVAILABLE',id:s.id,date:s.date,sport:s.sport,role:s.role,executable:s.executable,explanation:s.explanation};
 if(s.sport==='RUN'){const run=env.presentation?.runSessions?.[s.id];
  // The format layer's own fields when it delivered this session (native or time version), else the engine's time prescription as it is.
  return {...base,run:run?{expression:run.expression,formatHash:run.formatHash,blocks:run.blocks,estimate:run.estimate??null,dose:run.dose??null,unavailable:run.unavailable??null,provisional:run.provisional??null,instructions:run.instructions??[]}
   :{expression:'TIME',family:s.prescription.family,minutes:s.prescription.durationMinutes,prescription:s.prescription}};}
 return {...base,strength:{minutes:s.prescription.durationMinutes,warmupMinutes:s.prescription.warmupMinutes??null,instructions:s.prescription.instructions??[],
  exercises:(s.prescription.exercises??[]).map(e=>({id:e.id,role:e.role,pattern:e.pattern,laterality:e.laterality,sets:e.sets,reps:e.reps,rir:e.rir,restSeconds:e.restSeconds,load:e.load,equipment:e.equipment,instructions:e.instructions}))}};
}
/** The insight surfaces: forecast, pace insights and strength exposure as the engine stated them (status first; numbers only when shown). */
export function insightsView(env){
 const p=env.presentation??{},f=p.runForecast,i=p.paceInsights,x=p.strengthExposure;
 return {schema:VIEW_SCHEMA,view:'INSIGHTS',asOf:p.asOf??null,
  forecast:f?{status:f.status,reason:f.reason??null,shown:f.shown??[],observed:f.shown?.includes('OBSERVED_FORECAST')?f.observedForecast:null,plan:f.shown?.includes('PLAN_SCENARIO')?f.planScenario:null,basis:f.basis?.statement??null,raceWeek:f.raceWeek??null,availableFrom:f.availableFrom??null}:null,
  paceInsights:i?{status:i.status,reason:i.reason??null,domains:Object.fromEntries(Object.entries(i.domains??{}).map(([d,v])=>[d,{state:v.state,id:v.id??null,action:v.action??null}]))}:null,
  paceRevision:p.paceRevision?.status??null,
  strengthExposure:x?{status:x.status,reason:x.reason??null,descriptiveOnly:x.descriptiveOnly??null,weekIndex:x.weekIndex??null,unit:x.unit??null,label:x.label??null,
   planned:x.planned?.byPrimaryMuscle??null,executed:x.executed?.byPrimaryMuscle??null}:null};
}
export const sizes=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,bytes(v)]));
export {bytes};
