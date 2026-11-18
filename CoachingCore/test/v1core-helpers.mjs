// V1 Core Safety & Lifecycle (Founder mission of 2026-11-18): test helpers. A minimal record-carrying client over any composed entry point (the
// AIF headless client's keep/input rules, parameterized by the engine module), and the synthetic athlete and reports of the AIF harness.
// No training rule here: every decision is the engine's answer.
import {athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness} from '../../audits/v1-app-integration-foundation-2026-11-16/harness/scenario.mjs';
export {athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness};

const CARRIED=['runEvidenceRecord','runFormatRecord','runHistoryRecord'];
/** A client over the entry point `S`: the plan in force, every carried record, sent back with each review exactly as kept. */
export function client(S,envelope=null){
 let env=envelope?structuredClone(envelope):{program:null,actualLedger:[],referenceState:null,athleteModel:null,runEvidenceRecord:[],runFormatRecord:[],runHistoryRecord:[],presentation:null},n=0;
 const keep=r=>{
  if(r.program&&!env.program)env.program=r.program;if(r.proposal)env.program=r.proposal;
  if(Array.isArray(r.actualLedger))env.actualLedger=r.actualLedger;else if(Array.isArray(r.carriedRecord))env.actualLedger=r.carriedRecord;
  if(r.referenceState!==undefined&&r.referenceState!==null)env.referenceState=r.referenceState;if(r.updatedModel)env.athleteModel=r.updatedModel;
  for(const k of CARRIED)if(Array.isArray(r[k]))env[k]=r[k];
  env.presentation={runSessions:r.runSessions};return r;
 };
 const input=(kind,asOf,facts,eventId)=>{const weekIndex=Math.floor((Date.parse(asOf.slice(0,10)+'T00:00:00Z')-Date.parse(env.program.startDate+'T00:00:00Z'))/(7*864e5));
  return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex,event:{id:eventId??`cx-${++n}`,kind},...facts,
   ...(env.actualLedger.length?{actualLedger:env.actualLedger}:{}),...(env.referenceState?{referenceState:env.referenceState}:{}),...(env.athleteModel?{athleteModel:env.athleteModel}:{}),
   runEvidenceRecord:env.runEvidenceRecord,runFormatRecord:env.runFormatRecord,runHistoryRecord:env.runHistoryRecord};};
 return {
  get env(){return env;},
  onboard(intake,options){const r=S.generateProgram(intake,options);return r.status==='PROPOSED'?keep(r):r;},
  input,
  review(kind,asOf,facts={},eventId,options){return keep(S.evaluateProgram(env.program,input(kind,asOf,facts,eventId),options));},
  /** The answer only; the record is not kept (a probe). */
  probe(kind,asOf,facts={},eventId,options){return S.evaluateProgram(env.program,input(kind,asOf,facts,eventId),options);},
  restart(intake,asOf,options){const r=S.restartProgram({intake,record:env.actualLedger,referenceState:env.referenceState,asOf,athleteId:env.program?.athleteId??null,runEvidenceRecord:env.runEvidenceRecord,runFormatRecord:env.runFormatRecord,runHistoryRecord:env.runHistoryRecord},options);
   if(r.status!=='PROPOSED')return r;env.program=r.program;env.referenceState=null;return keep(r);}
 };
}
/** Plan A, its week 0 reported in full on its Sunday. */
export function planAWithWeek0(S,{weeks=8,id='core-a'}={}){
 const c=client(S);c.onboard(athleteA({weeks,id}));const p=c.env.program,day=addDays(p.startDate,6);
 c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:liveSessions(c.env,0).map(s=>reportOf(c.env,s))},'a-w0');
 return c;
}
/** A restart from the record, `daysAfter` the start of the plan in force, starting three days later (a nonclinical schedule pause). */
export function restartAfter(c,daysAfter,{id='core-a',weeks=8}={}){
 const day=addDays(c.env.program.startDate,daysAfter),upd={...athleteA({weeks,id}),asOf:day,startDate:addDays(day,3)};
 upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 return c.restart(upd,at(day,'10:00'));
}
/** The rows of the record that are reports (not facts), live (not superseded). */
export const liveReports=env=>env.actualLedger.filter(o=>!o.fact&&!o.superseded);
