// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): the custody the RepMile app uses with the composed engine entry point
// (v1-safety-index.mjs, COACHINGCORE-V1-CORE-SAFETY-FREEZE-7). It composes the frozen V1CIB custody (custody.mjs, V1CIB-CUSTODY-3, bound by
// COACHINGCORE-V1-FREEZE-1) through its two injection points, `store` and `engine`, and changes neither it nor the engine.
//
// What it adds, and why (each one a gap of the frozen custody under the composed engine, reproduced by test/v1int-*.test.mjs):
// - C-F01-2, C-NCC-3 (a): THE UNIT OF CUSTODY. The composed entry reads and returns three records besides the ledger: runFormatRecord (the
//   formats delivered and the report facts, a refused athlete's symptom stop among them), runHistoryRecord and runEvidenceRecord. V1CIB keeps
//   none of them. Here they are kept in the same stored document, written in the same atomic store commit as custody's, under a MAC bound to
//   custody's own seal (docMac and version), handed back to the engine on every review and restart exactly as the engine last returned them.
// - SEC-CORE-03: AUTHORSHIP. Who speaks is decided by the entry point native code calls, never by a payload field: `submit` is the athlete's
//   own form (channel ATHLETE), `importActivities` is the HealthKit layer (channel DEVICE). The boundary builds the source of each report from
//   its channel, refuses every field that would state another author, and binds a correction to the report it names through an origins map
//   it keeps under the same seal: a correction is refused unless it is the same channel's, of the same session (and device activity), and of
//   the report in force of that chain.
// - C-NCC-3 (b): ONE CLOCK. reportedAt and correctedAt are set by the boundary from the operation's clock, the same instant custody gives the
//   engine as asOf; the times a report states of the activity (occurrenceDate, observedAt) are kept as sent. A clock behind the record is refused,
//   never moved forward.
// - SEC-O1-03 (boundary part): admission.mjs limits, and per-session, per-chain and per-day bounds on new reports (agreeing growth, O-SC-1).
// - Honest failures: a store that throws is PERSISTENCE_FAILURE (nothing is confirmed); an optional external anchor (native: Keychain) turns a
//   missing or rolled-back record into RECORD_LOST / RECORD_ROLLED_BACK instead of a new athlete or an older plan.
//
// What it is not: authentication (the actor comes from the app's platform layer), the native store or anchor (adapters with this contract),
// the HealthKit query, or any sporting rule. Synthetic data only, as custody.
import {createHmac} from 'node:crypto';
import {createCustody} from './custody.mjs';
import {checkReportVoice} from './report-voices.mjs';
import {canonical} from '../value.mjs';
import * as CORE from '../v1-safety-index.mjs';
import {LIMITS,OBSERVATION_KEYS,observationError,requestError,safetyFieldsOf} from './admission.mjs';

export const INTEGRATION_SCHEMA='V1INT-CARRIED-1';
/** The records the composed entry carries besides the ledger, reference state and model (the AIF client's CARRIED; the Mac core-driver's). */
export const CARRIED_RECORDS=Object.freeze(['runFormatRecord','runHistoryRecord','runEvidenceRecord']);
export const CHANNELS=Object.freeze({ATHLETE:'ATHLETE',DEVICE:'DEVICE'});
const EMPTY=Object.freeze({records:{runFormatRecord:[],runHistoryRecord:[],runEvidenceRecord:[]},origins:{},presentation:{},requests:{},lastAt:null});
/** As many requests as custody remembers (custody.mjs RETENTION.idempotencyEntries). */
const REQUEST_WINDOW=500;
/** The readings of an answer the app shows beside the plan (projections, as v1-safety-index READINGS names them). */
const READINGS=Object.freeze(['runCalibration','runForecast','paceInsights','strengthExposure']);

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const fail=(code,message,extra={})=>({ok:false,error:{code,message,...extra}});
const iso=ms=>new Date(ms).toISOString();
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
/** The program's local calendar day of an instant (the engine's own reading: the plan's fixed offset). */
const localDay=(instant,offsetMin)=>new Date(Date.parse(instant)+offsetMin*60000).toISOString().slice(0,10);
/** Every event id a ledger holds: row ids, merged ids and part ids (an admitted report is one of them, whether kept, merged or kept as a voice). */
function idsOf(ledger){const out=new Set();for(const r of Array.isArray(ledger)?ledger:[]){if(!isObj(r)||r.fact)continue;if(typeof r.eventId==='string')out.add(r.eventId);
 for(const x of Array.isArray(r.provenance?.mergedSourceIds)?r.provenance.mergedSourceIds:[])if(typeof x==='string')out.add(x);
 if(isObj(r.provenance?.parts))for(const x of Object.keys(r.provenance.parts))out.add(x);}return out;}
class Collision extends Error{}

/**
 * createIntegration({store, key, clock, anchor, engine}) → a custody-compatible service (drop-in for api.mjs createBoundary({custody})) with
 * `importActivities` for the device channel and `carried`/`presentation` reads.
 * - store: a store adapter (store.mjs contract). key: the integrity key (native: Keychain, never in the app's UI layer).
 * - clock: epoch ms (native: the device clock); each operation reads it once, to the second.
 * - anchor (optional): {get(id) → {version, docMac}|null, set(id, v), clear(id)}, kept apart from the store (native: Keychain item).
 */
export function createIntegration({store,key,clock=()=>Date.now(),anchor=null,engine=CORE,newId,syntheticOnly=true}={}){
 if(!store||!key)throw new Error('integration needs a store and a key');
 const hmac=text=>createHmac('sha256',key).update(text).digest('hex');
 // A comparison of two MACs whose time does not depend on where they differ (no Buffer: portable to a bare JavaScriptCore context).
 const same=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;};
 const macOf=(id,doc,carried)=>hmac(`${INTEGRATION_SCHEMA}|carried|${id}|${doc.version}|${doc.docMac}|`+(canonical(carried)??'null'));
 /** The operation in progress (one at a time: native calls go through one serial queue). */
 let op=null;
 const openCarried=(id,doc)=>{if(!isObj(doc.carried)||!same(macOf(id,doc,doc.carried),doc.carriedMac))return null;return doc.carried;};

 // ---- The store custody is given: custody's document plus the carried records, one atomic write. ----
 const carriedStore={
  load(id){
   const doc=store.load(id);
   if(anchor&&op?.athleteId===id){const a=anchor.get(id);
    if(a&&!doc){op.flag='RECORD_LOST';throw new Error('record lost');}
    if(a&&doc&&(!Number.isInteger(doc.version)||doc.version<a.version||doc.version===a.version&&doc.docMac!==a.docMac)){op.flag='RECORD_ROLLED_BACK';throw new Error('record rolled back');}}
   // Another athlete's document is custody's to refuse (FORBIDDEN), before anything of it is read here.
   if(!doc||doc.athleteId!==id)return doc;
   const c=openCarried(id,doc);if(!c){if(op)op.flag='CARRIED_INTEGRITY';throw new Error('carried records failed their integrity check');}
   if(op?.athleteId===id){op.loaded=c;
    if(op.mutating&&typeof c.lastAt==='string'&&Date.parse(c.lastAt)>op.at){op.flag='CLOCK_BEHIND_RECORD';throw new Error('clock behind the record');}}
   return doc;
  },
  commit(id,expectedVersion,doc){
   const carried=nextCarried(doc);
   let r;try{r=store.commit(id,expectedVersion,{...doc,carried,carriedMac:macOf(id,doc,carried)});}catch(e){if(op)op.flag='PERSISTENCE_FAILURE';return {ok:false,busy:true};}
   if(!r?.ok)return r??{ok:false,busy:true};
   if(anchor)try{anchor.set(id,{version:doc.version,docMac:doc.docMac});}catch{if(op)op.anchorStale=true;}
   return r;
  },
  remove:id=>store.remove(id),tombstone:(s,t)=>store.tombstone(s,t),tombstoneOf:s=>store.tombstoneOf(s),
  raw:id=>store.raw?.(id)??null,setRaw:(id,t)=>store.setRaw?.(id,t),
 };
 /** The carried records custody's next document goes with: what the engine last returned in this operation, or what was loaded. */
 function nextCarried(doc){
  const base=op?.loaded??EMPTY,calls=op?.calls??[],last=calls.at(-1),records=last?last.records:base.records;
  const origins={...base.origins};
  // Origins of this operation's reports: only those the engine admitted into the record (a report it refused is not on record, and may be sent
  // again). An admitted report is in the ledger as a row, a merged id or a kept voice (O-1).
  if(last&&op.pendingOrigins){const admitted=idsOf(last.ledger);for(const [i,meta] of op.pendingOrigins){const id=last.observationIds[i];if(typeof id==='string'&&admitted.has(id))origins[id]=meta;}}
  // The presentation of each plan an answer was about (the run sessions as prescribed, which a report cites by format), and the readings of the
  // last answer: projections for the app, never sent to the engine and never canonical.
  const sessions={...(base.presentation?.sessions??{})};for(const c of calls)if(c.programHash&&c.runSessions!==undefined)sessions[c.programHash]=c.runSessions;
  const keep=new Set([doc.program?.hash,doc.pending?.proposal?.hash].filter(Boolean));for(const h of Object.keys(sessions))if(!keep.has(h))delete sessions[h];
  const presentation={sessions,readings:last?{...last.readings,at:iso(op.at)}:base.presentation?.readings??null};
  // The request record: what a retry needs to send custody exactly what was sent (its clock and the bindings admission chose), and what the
  // decision recorded of each report. Kept for as many requests as custody keeps (RETENTION.idempotencyEntries).
  let requests=base.requests??{};
  if(op?.request){op.request.outcome=outcomeOf(last);
   requests={...requests,[op.request.id]:{...op.request.info,outcome:op.request.outcome}};const ks=Object.keys(requests);for(const k of ks.slice(0,Math.max(0,ks.length-REQUEST_WINDOW)))delete requests[k];}
  return {schema:INTEGRATION_SCHEMA,records,origins,presentation,requests,lastAt:op?iso(op.at):base.lastAt};
 }
 /** What the decision recorded of each report of the request (the HealthKit queue keeps a workout until it is recorded), and the warning-sign
  * screen the engine asks for (runFormat.warningSignScreen: a stop for a symptom, from this request or kept in the record of formats). */
 function outcomeOf(last){
  if(!last)return {recorded:[],notRecorded:[],warningSignScreen:null};
  const admitted=idsOf(last.ledger),excluded=new Map((last.excluded??[]).map(x=>[x?.eventId,x?.reason]));
  const recorded=[],notRecorded=[];last.observationIds.forEach((id,k)=>{if(admitted.has(id))recorded.push(id);else notRecorded.push({eventId:id,reason:excluded.get(id)??'NOT_RECORDED_BY_THIS_DECISION'});});
  return {recorded,notRecorded,warningSignScreen:last.readings?.warningSignScreen??null};
 }
 // ---- The engine custody is given: the composed entry, with the carried records handed in and taken back. ----
 const recordsIn=()=>Object.fromEntries(CARRIED_RECORDS.map(k=>[k,clone((op?.loaded??EMPTY).records[k]??[])]));
 const take=(r,input,programHash)=>{if(!op)return r;
  const records=Object.fromEntries(CARRIED_RECORDS.map(k=>[k,Array.isArray(r?.[k])?r[k]:input[k]??[]]));
  op.calls.push({records,ledger:Array.isArray(r?.actualLedger)?r.actualLedger:input.actualLedger??[],runSessions:r?.runSessions,excluded:r?.provenance?.excluded??[],
   observationIds:Array.isArray(input.observations)?input.observations.map(o=>o?.eventId):[],programHash:r?.proposal?.hash??r?.program?.hash??programHash,
   readings:{warningSignScreen:clone(r?.runFormat?.warningSignScreen??r?.runCalibration?.warningSignScreen??null),...Object.fromEntries(READINGS.map(k=>[k,clone(r?.[k]??null)]))}});return r;};
 const tapped={
  generateProgram(input,o){const full={...input};const r=engine.generateProgram(full,o);return take(r,{...full,...recordsIn()},null);},
  evaluateProgram(program,input,o){
   const full={...input,...recordsIn()};
   // A report id custody derives from a request id it no longer remembers (its idempotency window is 500 requests) would name a report already
   // on record: refused before the engine reads it (the custody answers OPERATIONAL_ERROR; the boundary names it).
   if(op&&Array.isArray(full.observations)){const held=new Set([...Object.keys(op.loaded?.origins??{}),...idsOf(full.actualLedger)]);
    if(full.observations.some(x=>held.has(x?.eventId))){op.flag='REQUEST_ID_REUSED';throw new Collision('report id already on record');}}
   return take(engine.evaluateProgram(program,full,o),full,program?.hash);},
  restartProgram(input,o){const full={...input,...recordsIn()};return take(engine.restartProgram(full,o),full,null);},
 };
 const custody=createCustody({store:carriedStore,key,now:()=>op?op.at:Math.floor(clock()/1000)*1000,newId,syntheticOnly,engine:tapped});

 const CODES={RECORD_LOST:['RECORD_LOST','The record this device kept is missing; nothing is planned without it'],
  RECORD_ROLLED_BACK:['RECORD_ROLLED_BACK','The stored record is older than the last one kept; nothing is planned over it'],
  CARRIED_INTEGRITY:['INTEGRITY_FAILURE','The stored record failed its integrity check (carried); nothing is planned over it'],
  CLOCK_BEHIND_RECORD:['CLOCK_BEHIND_RECORD','The device clock is earlier than the last record; check the date and time, then send again'],
  PERSISTENCE_FAILURE:['PERSISTENCE_FAILURE','The record could not be saved; nothing was changed, send again'],
  REQUEST_ID_REUSED:['REQUEST_ID_REUSED','This request id was used before; send the request with a new id']};
 /** One operation: one clock reading, one serial step, every failure explicit and nothing confirmed that was not stored. */
 function run(actor,mutating,fn){
  if(op)return fail('BUSY','Another operation is in progress');
  op={athleteId:isObj(actor)?actor.athleteId:undefined,at:Math.floor(clock()/1000)*1000,mutating,loaded:null,calls:[],flag:null,pendingOrigins:null};
  try{
   const r=fn();
   if(r&&r.ok===false&&op.flag){const [code,message]=CODES[op.flag];return {...fail(code,message,op.flag==='CARRIED_INTEGRITY'?{part:'carried'}:{}),...(r.safetyFields?{safetyFields:r.safetyFields}:{})};}
   return r;
  }catch(e){if(op.flag){const [code,message]=CODES[op.flag];return fail(code,message);}return fail('OPERATIONAL_ERROR','The operation failed',{cause:e?.constructor?.name??'Error'});}
  finally{op=null;}
 }

 /** The engine observation of one admitted report, from its channel (the source is the channel's; the report clocks are the boundary's). */
 function build(channel,o,{at,correctionOf}){
  const out={...(o.sessionId!==undefined?{sessionId:o.sessionId}:{}),...(o.occurrenceDate!==undefined?{occurrenceDate:o.occurrenceDate}:{}),...(o.observedAt!==undefined?{observedAt:o.observedAt}:{}),
   actual:clone(o.actual),...(isObj(o.response)&&channel===CHANNELS.ATHLETE?{response:clone(o.response)}:{}),reportedAt:iso(at)};
  if(channel===CHANNELS.DEVICE){out.source={provider:'HEALTHKIT',activityId:o.activityId,quality:o.sourceQuality??'WEARABLE_FULL'};out.canonicalActivityId=o.activityId;}
  if(correctionOf){out.correctionOf=correctionOf;out.correctedAt=iso(at);}
  return out;
 }
 const factsDigest=o=>hmac(`${INTEGRATION_SCHEMA}|facts|`+(canonical({sessionId:o.sessionId??null,observedAt:o.observedAt??null,occurrenceDate:o.occurrenceDate??null,actual:o.actual,response:o.response??null})??'null'));
 /**
  * Admission of a request's reports against the record: authorship, correction chains, duplicates and the per-session/day bounds.
  * Returns {observations, metas, duplicates} or a refusal. `doc` is the verified custody document, `origins` the sealed origins map.
  */
 function admit(channel,list,doc,origins){
  const tz=doc.program.timezoneOffsetMinutes??0,sessions=new Map(doc.program.weeks.flatMap(w=>w.sessions).map(s=>[s.id,s]));
  const all={...origins},succ=new Map(),out=[],metas=[],duplicates=[],of=[];
  for(const [id,m] of Object.entries(all))if(m.of)succ.set(m.of,id);
  const replaced={has:id=>succ.has(id)};
  const headOf=id=>{let h=id;for(let n=0;n<=LIMITS.correctionsPerReport+1&&succ.has(h);n++)h=succ.get(h);return h;};
  const depthOf=id=>{let d=0;for(let x=all[id];x?.of&&d<=LIMITS.correctionsPerReport;x=all[x.of])d++;return d;};
  const dayOf=o=>o.occurrenceDate??(o.observedAt?localDay(o.observedAt,tz):null);
  for(let i=0;i<list.length;i++){
   const o=list[i],shape=observationError(channel,o,i);if(shape)return {refusal:shape};
   let correctionOf=o.correctionOf??null;
   if(channel===CHANNELS.DEVICE){
    const s=o.sessionId!==undefined?sessions.get(o.sessionId):null;
    if(o.sessionId!==undefined&&!s)return {refusal:{code:'UNKNOWN_SESSION',index:i,field:'sessionId'}};
    if(s&&s.sport!==o.activityType)return {refusal:{code:'SPORT_MISMATCH',index:i,field:'sessionId'}};
    const known=Object.entries(all).filter(([,m])=>m.ch==='D'&&m.act===o.activityId);
    if(known.length){const head=headOf(known[0][0]),m=all[head];
     if((m.s??null)!==(o.sessionId??null))return {refusal:{code:'ACTIVITY_LINKED_ELSEWHERE',index:i,eventId:head}};
     if(m.d===factsDigest(o)){duplicates.push(i);continue;}
     // A re-sync of a known workout with other values is the device's own correction of its report (SEC-CORE-03 resolution: a re-sync names
     // the device's own previous event): it is bound here, by the activity, never by an id the HealthKit layer chose.
     correctionOf=head;
    }else if(o.sessionId!==undefined&&new Set(Object.values(all).filter(m=>m.ch==='D'&&m.s===o.sessionId).map(m=>m.act)).size>=LIMITS.deviceActivitiesPerSession)
     return {refusal:{code:'LIMIT_EXCEEDED',index:i,limit:'deviceActivitiesPerSession'}};
   }
   if(correctionOf){
    const m=all[correctionOf];
    if(!m)return {refusal:{code:idsOf(doc.rows).has(correctionOf)?'CORRECTION_ORIGIN_UNKNOWN':'CORRECTION_TARGET_NOT_FOUND',index:i,field:'correctionOf'}};
    if(m.ch!==(channel===CHANNELS.ATHLETE?'A':'D'))return {refusal:{code:'CROSS_AUTHOR_CORRECTION',index:i,field:'correctionOf'}};
    if(replaced.has(correctionOf))return {refusal:{code:'CORRECTION_OF_REPLACED',index:i,field:'correctionOf',eventId:headOf(correctionOf)}};
    if((m.s??null)!==(o.sessionId??null))return {refusal:{code:'CORRECTION_SESSION_MISMATCH',index:i,field:'sessionId'}};
    if(channel===CHANNELS.DEVICE&&m.act!==o.activityId)return {refusal:{code:'CORRECTION_ACTIVITY_MISMATCH',index:i,field:'activityId'}};
    if(depthOf(correctionOf)+1>LIMITS.correctionsPerReport)return {refusal:{code:'LIMIT_EXCEEDED',index:i,limit:'correctionsPerReport'}};
   }else{
    if(channel===CHANNELS.ATHLETE&&o.sessionId!==undefined){const mine=Object.entries(all).find(([,m])=>m.ch==='A'&&m.s===o.sessionId);
     if(mine)return {refusal:{code:'ALREADY_REPORTED',index:i,field:'sessionId',eventId:headOf(mine[0])}};}
    const day=dayOf(o),ch=channel===CHANNELS.ATHLETE?'A':'D';
    if(day&&Object.values(all).filter(m=>m.ch===ch&&!m.of&&m.day===day).length>=LIMITS.reportsPerDayPerChannel)return {refusal:{code:'LIMIT_EXCEEDED',index:i,limit:'reportsPerDayPerChannel'}};
   }
   const built=build(channel,o,{at:op.at,correctionOf});
   const voice=checkReportVoice(channel,built);if(!voice.ok)return {refusal:{code:voice.code,index:i,fields:voice.errors}};
   const meta={ch:channel===CHANNELS.ATHLETE?'A':'D',s:o.sessionId??null,act:channel===CHANNELS.DEVICE?o.activityId:null,of:correctionOf,day:dayOf(o),at:iso(op.at),d:factsDigest(o)};
   // Within one request, a later report sees this one (a second new report of the session, a second correction of one report).
   const provisional=`pending:${i}`;all[provisional]=meta;if(correctionOf)succ.set(correctionOf,provisional);
   out.push(built);metas.push([out.length-1,meta]);of.push(correctionOf);
  }
  return {observations:out,metas,duplicates,of};
 }
 /** A plan answer (first plan, restart) with the warning-sign screen its engine answer asked for, if any. */
 const withScreen=r=>r?.ok===false?r:{...r,warningSignScreen:op.calls.at(-1)?.readings?.warningSignScreen??null};
 /** A review through custody, admitted first; the answer names the reports the engine refused (they are not on record and may be sent again). */
 function review(channel,{actor,clientRequestId,expectedVersion,review:rv}){
  const req=requestError(rv,{observations:rv?.observations});if(req)return {...fail(req.code,'The request is not one the coach admits',req),...(isObj(rv)?{safetyFields:safetyFieldsOf(rv)}:{})};
  if(typeof clientRequestId!=='string'||!clientRequestId||clientRequestId.length>LIMITS.idLength)return fail('INVALID_REQUEST','A request id (1 to 128 characters) is required');
  const o=custody.read({actor});if(!o.ok)return o;
  const list=Array.isArray(rv.observations)?rv.observations:[],d=hmac(`${INTEGRATION_SCHEMA}|request|${channel}|`+(canonical(rv)??'null')),seen=op.loaded.requests?.[clientRequestId];
  let a;
  if(seen){
   // A retry: custody is sent exactly what was sent (the first clock, the bindings admission chose then), so custody returns its stored answer.
   if(seen.d!==d)return fail('CONFLICT_IDEMPOTENCY_KEY','This request id was already used for another request');
   const at=Date.parse(seen.at),kept=list.map((x,i)=>[x,i]).filter(([,i])=>!seen.dup.includes(i));
   a={observations:kept.map(([x],k)=>build(channel,x,{at,correctionOf:seen.of[k]})),metas:[],duplicates:seen.dup};
  }else{
   a=admit(channel,list,o.doc,op.loaded?.origins??{});
   if(a.refusal){const {code,...rest}=a.refusal;return {...fail(code,'A report of this request is not admitted; nothing was recorded',rest),safetyFields:safetyFieldsOf(rv)};}
   if(!a.observations.length&&a.duplicates.length&&channel===CHANNELS.DEVICE)return {ok:true,duplicate:true,duplicates:a.duplicates,version:o.doc.version,recorded:0};
   op.pendingOrigins=a.metas;op.request={id:clientRequestId,info:{d,at:iso(op.at),of:a.of,dup:a.duplicates}};
  }
  const sent=channel===CHANNELS.ATHLETE?{...rv,...(Array.isArray(rv.observations)?{observations:a.observations}:{})}:{kind:'WEEKLY_REVIEW',observations:a.observations,...(rv.eligibility?{eligibility:rv.eligibility}:{})};
  const r=custody.submit({actor,clientRequestId,expectedVersion,review:sent});
  if(!r.ok)return r;
  const outcome=seen?seen.outcome:op.request?.outcome;
  return {...r,...(outcome??{recorded:[],notRecorded:[],warningSignScreen:null}),...(a.duplicates.length?{duplicates:a.duplicates}:{})};
 }
 return {
  CHANNELS,
  /** The first plan (custody.enroll), its carried records kept with it. */
  enroll:args=>run(args?.actor,true,()=>withScreen(custody.enroll(args))),
  /** The athlete's own review (the app's forms; channel ATHLETE). Every api.mjs operation reaches this. */
  submit:args=>run(args?.actor,true,()=>review(CHANNELS.ATHLETE,args??{})),
  /** HealthKit workouts (channel DEVICE): [{activityId, activityType:'RUN', sessionId?, observedAt, actual, sourceQuality?}]. The eligibility
   * the athlete answered last can be sent with them (the device states none of its own). */
  importActivities:({actor,clientRequestId,expectedVersion,activities,eligibility})=>run(actor,true,()=>review(CHANNELS.DEVICE,{actor,clientRequestId,expectedVersion,review:{kind:'WEEKLY_REVIEW',observations:activities,...(eligibility?{eligibility}:{})}})),
  accept:args=>run(args?.actor,true,()=>custody.accept(args)),
  decline:args=>run(args?.actor,true,()=>custody.decline(args)),
  /** A new plan from the record custody holds (C-F01-2: the canonical record, never a reconstruction) with every carried record. */
  restart:args=>run(args?.actor,true,()=>withScreen(custody.restart(args))),
  setConsent:args=>run(args?.actor,true,()=>custody.setConsent(args)),
  eraseHealthFacts:args=>run(args?.actor,true,()=>custody.eraseHealthFacts(args)),
  eraseAccount:args=>run(args?.actor,false,()=>{const r=custody.eraseAccount(args);if(r.ok&&anchor)try{anchor.clear(args.actor.athleteId);}catch{}return r;}),
  /** The athlete's explicit act after RECORD_LOST / RECORD_ROLLED_BACK: what remains is set aside and a new plan starts from a new intake. */
  acknowledgeRecordLoss:({actor})=>run(actor,false,()=>{if(!isObj(actor)||typeof actor.athleteId!=='string')return fail('UNAUTHENTICATED','No authenticated athlete');
   const a=anchor?.get(actor.athleteId);if(!a)return fail('NOT_LOST','Nothing to acknowledge');store.remove(actor.athleteId);anchor.clear(actor.athleteId);return {ok:true};}),
  read:args=>run(args?.actor,false,()=>custody.read(args)),
  verify:doc=>custody.verify(doc),
  visible:doc=>custody.visible(doc),
  /** The carried records as kept (what the next review and restart receive). */
  carried:({actor})=>run(actor,false,()=>{const o=custody.read({actor});return o.ok?{ok:true,records:clone(op.loaded.records),version:o.doc.version}:o;}),
  /** The run sessions as prescribed, for the plan in force and a pending change: a projection for the app, never canonical. */
  presentation:({actor})=>run(actor,false,()=>{const o=custody.read({actor});if(!o.ok)return o;const p=op.loaded.presentation?.sessions??{};
   return {ok:true,version:o.doc.version,inForce:p[o.doc.program.hash]??null,pending:o.doc.pending?.proposal?(p[o.doc.pending.proposal.hash]??null):null,readings:clone(op.loaded.presentation?.readings??null)};}),
 };
}
export {LIMITS,OBSERVATION_KEYS};
