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
import {LIMITS,OBSERVATION_KEYS,observationError,requestError,safetyFieldsOf,intakeError,statesSafetySignal} from './admission.mjs';
import {declarationErrors,appendProfile,eraseDeclarations} from '../v1-heart-rate-profile.mjs';

export const INTEGRATION_SCHEMA='V1INT-CARRIED-1';
/** The records the composed entry carries besides the ledger, reference state and model (the AIF client's CARRIED; the Mac core-driver's). */
// V1HR5R: heartRateProfileRecord (the athlete's age, declared maximum and custom zone limits) is carried and sealed as the others; a record stored
// before it holds none, and is read as an empty one (a first plan or restart then records the intake's age).
export const CARRIED_RECORDS=Object.freeze(['runFormatRecord','runHistoryRecord','runEvidenceRecord','heartRateProfileRecord']);
export const CHANNELS=Object.freeze({ATHLETE:'ATHLETE',DEVICE:'DEVICE'});
const EMPTY=Object.freeze({records:{runFormatRecord:[],runHistoryRecord:[],runEvidenceRecord:[],heartRateProfileRecord:[]},origins:{},presentation:{},requests:{},lastAt:null});
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
    if(a&&doc&&(!Number.isInteger(doc.version)||doc.version<a.version||doc.version===a.version&&doc.docMac!==a.docMac)){op.flag='RECORD_ROLLED_BACK';throw new Error('record rolled back');}
    // V1HR5R (QRE-HR5R-06): a carried commit at the same custody version (setHeartRateProfile) advances the carried sequence the anchor keeps,
    // so an older carried blob of the same version is a rollback too. An anchor written before it has no sequence and checks none.
    if(a&&doc&&doc.version===a.version&&Number.isInteger(a.carriedSeq)&&!(Number.isInteger(doc.carried?.seq)&&doc.carried.seq>=a.carriedSeq)){op.flag='RECORD_ROLLED_BACK';throw new Error('record rolled back');}}
   // Another athlete's document is custody's to refuse (FORBIDDEN), before anything of it is read here.
   if(!doc||doc.athleteId!==id)return doc;
   const c=openCarried(id,doc);if(!c){if(op)op.flag='CARRIED_INTEGRITY';throw new Error('carried records failed their integrity check');}
   if(op?.athleteId===id){op.loaded=c;
    if(op.mutating&&typeof c.lastAt==='string'&&Date.parse(c.lastAt)>op.at){op.flag='CLOCK_BEHIND_RECORD';throw new Error('clock behind the record');}
    // Cycle 1 (SEC-BC-01): an erasure or a revocation admitted under a clock behind the record is dated at the latest instant on record, never
    // earlier: what it writes (an erasure marker, a consent change) can then never predate a readiness declaration and release a standing hold.
    else if(!op.mutating&&['eraseHealthFacts','setConsent','eraseHeartRateProfile'].includes(op.name)&&typeof c.lastAt==='string'&&Date.parse(c.lastAt)>op.at)op.at=Date.parse(c.lastAt);}
   return doc;
  },
  commit(id,expectedVersion,doc){
   const carried=nextCarried(doc);
   let r;try{r=store.commit(id,expectedVersion,{...doc,carried,carriedMac:macOf(id,doc,carried)});}catch(e){if(op)op.flag='PERSISTENCE_FAILURE';return {ok:false,busy:true};}
   if(!r?.ok)return r??{ok:false,busy:true};
   if(anchor)try{anchor.set(id,{version:doc.version,docMac:doc.docMac,carriedSeq:carried.seq});}catch{if(op)op.anchorStale=true;}
   return r;
  },
  remove:id=>store.remove(id),tombstone:(s,t)=>store.tombstone(s,t),tombstoneOf:s=>store.tombstoneOf(s),
  raw:id=>store.raw?.(id)??null,setRaw:(id,t)=>store.setRaw?.(id,t),
 };
 /** The carried records custody's next document goes with: what the engine last returned in this operation, or what was loaded. */
 function nextCarried(doc){
  const base=op?.loaded??EMPTY,calls=op?.calls??[],last=calls.at(-1);let records=last?last.records:base.records;
  // Cycle 1 (QRE-INT-01, AUTH-INT-01): a change that waits for the athlete (an offer, or a change they asked for) keeps the records of the engine
  // answer that made it. When the athlete adopts exactly that plan (accept makes no engine call, and any later review closes the change), the
  // records in force become those: the formats of the sessions the athlete is now shown. Otherwise the records are the answer applied.
  // V1HR5R (QRE-HR5R-02): the athlete's heart-rate profile is no part of a plan: adopting a plan keeps the profile record in force, never the one
  // the offer was made with.
  if(op?.name==='accept'&&base.pendingRecords&&doc.program?.hash===base.pendingRecords.programHash)records={...base.pendingRecords.records,heartRateProfileRecord:base.records.heartRateProfileRecord??[]};
  const pendingHash=doc.pending?.proposal?.hash??null,maker=pendingHash?calls.find(c=>c.programHash===pendingHash):null;
  // V1HR5R (QRE-HR5R-N4): a pending change keeps no copy of the heart-rate profile (accept takes the record in force), so an erased value is gone.
  const noProfile=x=>x?{...x,records:Object.fromEntries(Object.entries(x.records??{}).filter(([k])=>k!=='heartRateProfileRecord'))}:null;
  const pendingRecords=noProfile(pendingHash?(maker?{programHash:pendingHash,records:maker.records}:base.pendingRecords?.programHash===pendingHash?base.pendingRecords:null):null);
  // Cycle 1 (SEC-INT-01, SSCTR-INT-04): the athlete's own last screen, as they sent it (onboarding or an athlete review), byte for byte: the
  // only screen the device channel ever carries.
  // V1 blocker closure (G07): an erasure of health facts also erases the stored screen (the athlete's pain, injury and illness answers); with none
  // stored the device channel waits for a new one (SCREEN_REQUIRED), never carries an erased one.
  const screen=op?.name==='eraseHealthFacts'?null:op?.screen!==undefined?op.screen:base.screen??null;
  const origins={...base.origins};
  // Origins of this operation's reports: only those the engine admitted into the record (a report it refused is not on record, and may be sent
  // again). An admitted report is in the ledger as a row, a merged id or a kept voice (O-1).
  if(last&&op.pendingOrigins){const admitted=idsOf(last.ledger);for(const [i,meta] of op.pendingOrigins){const id=last.observationIds[i];if(typeof id==='string'&&admitted.has(id))origins[id]=meta;}}
  // The presentation of each plan an answer was about (the run sessions as prescribed, which a report cites by format), and the readings of the
  // last answer: projections for the app, never sent to the engine and never canonical.
  const sessions={...(base.presentation?.sessions??{})};for(const c of calls)if(c.programHash&&c.runSessions!==undefined)sessions[c.programHash]=c.runSessions;
  const keep=new Set([doc.program?.hash,doc.pending?.proposal?.hash].filter(Boolean));for(const h of Object.keys(sessions))if(!keep.has(h))delete sessions[h];
  const erasing=op?.name==='eraseHealthFacts';
  // Cycle 1 (SEC-INT-08, QRE-INT-10): an erasure takes the last answer's readings (a warning-sign screen among them) and the boundary's record of
  // every request custody drops (the erased reports of how the athlete feels): a retry of one is then a new request, admitted again.
  // V1HR5R (QRE-HR5R-01): a heart-rate write keeps the readings as the last answer left them: null stays null (an erasure's, so a resend of an
  // erased report goes back to the engine), and their time stays the answer's.
  const presentation={sessions,readings:erasing?null:last?.readingsAsIs?last.readings:last?{...last.readings,at:iso(op.at)}:base.presentation?.readings??null};
  // The request record: what a retry needs to send custody exactly what was sent (its clock and the bindings admission chose), and what the
  // decision recorded of each report. Kept for as many requests as custody keeps (RETENTION.idempotencyEntries).
  let requests=base.requests??{};
  if(erasing)requests=Object.fromEntries(Object.entries(requests).filter(([k])=>Object.hasOwn(doc.requests??{},k)));
  if(op?.request){op.request.outcome=outcomeOf(last);
   requests={...requests,[op.request.id]:{...op.request.info,outcome:op.request.outcome}};const ks=Object.keys(requests);for(const k of ks.slice(0,Math.max(0,ks.length-REQUEST_WINDOW)))delete requests[k];}
  // The latest instant on record never moves back (a revocation allowed under a clock behind it keeps the later one).
  const lastAt=op?(base.lastAt&&Date.parse(base.lastAt)>op.at?base.lastAt:iso(op.at)):base.lastAt;
  // V1HR5R (QRE-HR5R-06): the carried sequence, one more on every carried commit (the anchor keeps it).
  return {schema:INTEGRATION_SCHEMA,records,pendingRecords,screen,origins,presentation,requests,lastAt,seq:(Number.isInteger(base.seq)?base.seq:0)+1};
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
  // V1HR5R (QRE-HR5R-05): an intake carries no record of the boundary's: a first plan starts from none, whatever the intake states.
  generateProgram(input,o){const full=Object.fromEntries(Object.entries(input??{}).filter(([k])=>!CARRIED_RECORDS.includes(k)));const r=engine.generateProgram(full,o);return take(r,{...full,...recordsIn()},null);},
  evaluateProgram(program,input,o){
   const full={...input,...recordsIn()};
   // A report id custody derives from a request id it no longer remembers (its idempotency window is 500 requests) would name a report already
   // on record: refused before the engine reads it (the custody answers OPERATIONAL_ERROR; the boundary names it).
   if(op&&Array.isArray(full.observations)){const held=new Set([...Object.keys(op.loaded?.origins??{}),...idsOf(full.actualLedger)]);
    if(full.observations.some(x=>held.has(x?.eventId))){op.flag='REQUEST_ID_REUSED';throw new Collision('report id already on record');}}
   return take(engine.evaluateProgram(program,full,o),full,program?.hash);},
  restartProgram(input,o){const full={...input,...(isObj(input?.intake)?{intake:Object.fromEntries(Object.entries(input.intake).filter(([k])=>!CARRIED_RECORDS.includes(k)))}:{}),...recordsIn()};return take(engine.restartProgram(full,o),full,null);},
 };
 const custody=createCustody({store:carriedStore,key,now:()=>op?op.at:Math.floor(clock()/1000)*1000,newId,syntheticOnly,engine:tapped});

 const CODES={RECORD_LOST:['RECORD_LOST','The record this device kept is missing; nothing is planned without it'],
  RECORD_ROLLED_BACK:['RECORD_ROLLED_BACK','The stored record is older than the last one kept; nothing is planned over it'],
  CARRIED_INTEGRITY:['INTEGRITY_FAILURE','The stored record failed its integrity check (carried); nothing is planned over it'],
  CLOCK_BEHIND_RECORD:['CLOCK_BEHIND_RECORD','The device clock is earlier than the last record; check the date and time, then send again'],
  PERSISTENCE_FAILURE:['PERSISTENCE_FAILURE','The record could not be saved; nothing was changed, send again'],
  REQUEST_ID_REUSED:['REQUEST_ID_REUSED','This request id was used before; send the request with a new id']};
 /** One operation: one clock reading, one serial step, every failure explicit and nothing confirmed that was not stored. */
 function run(actor,mutating,fn,name=null){
  if(op)return fail('BUSY','Another operation is in progress');
  op={name,athleteId:isObj(actor)?actor.athleteId:undefined,at:Math.floor(clock()/1000)*1000,mutating,loaded:null,calls:[],flag:null,pendingOrigins:null};
  try{
   const r=fn();
   if(r&&r.ok===false&&op.flag){const [code,message]=CODES[op.flag];return {...fail(code,message,op.flag==='CARRIED_INTEGRITY'?{part:'carried'}:{}),...(r.safetyFields?{safetyFields:r.safetyFields}:{})};}
   // Cycle 1 (QRE-INT-08): the record was kept but its anchor was not: said, so the native layer writes the anchor again before going on.
   if(r&&r.ok!==false&&op.anchorStale)return {...r,anchorStale:true};
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
  const MAX_CHAIN=LIMITS.correctionsPerReport+LIMITS.safetyExcess;
  const headOf=id=>{let h=id;for(let n=0;n<=MAX_CHAIN+1&&succ.has(h);n++)h=succ.get(h);return h;};
  const depthOf=id=>{let d=0;for(let x=all[id];x?.of&&d<=MAX_CHAIN;x=all[x.of])d++;return d;};
  const dayOf=o=>o.occurrenceDate??(o.observedAt?localDay(o.observedAt,tz):null);
  // V1 blocker closure (SEC-INT-06): no report is dated before the record began (the enrollment day, in the plan's offset). Training before it is
  // the onboarding intake's (its run history), never a report: so the per-day bound bounds the record by the days the record has existed.
  const firstDay=typeof doc.createdAt==='string'&&Number.isFinite(Date.parse(doc.createdAt))?localDay(doc.createdAt,tz):null;
  for(let i=0;i<list.length;i++){
   const o=list[i],shape=observationError(channel,o,i);if(shape)return {refusal:shape};
   let correctionOf=o.correctionOf??null;
   {const d=dayOf(o);if(firstDay&&d&&d<firstDay)return {refusal:{code:'BEFORE_RECORD_START',index:i,field:o.occurrenceDate!==undefined?'occurrenceDate':'observedAt',firstDay}};}
   if(channel===CHANNELS.DEVICE){
    const s=o.sessionId!==undefined?sessions.get(o.sessionId):null;
    if(o.sessionId!==undefined&&!s)return {refusal:{code:'UNKNOWN_SESSION',index:i,field:'sessionId'}};
    if(s&&s.sport!==o.activityType)return {refusal:{code:'SPORT_MISMATCH',index:i,field:'sessionId'}};
    const known=Object.entries(all).filter(([,m])=>m.ch==='D'&&m.act===o.activityId);
    if(known.length){const head=headOf(known[0][0]),m=all[head];
     // Cycle 1 (SEC-INT-11): one workout twice in one request is refused here (never sent with a provisional id).
     if(head.startsWith('pending:'))return {refusal:{code:'DUPLICATE_IN_REQUEST',index:i,field:'activityId'}};
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
    // SEC-INT-07: past the limit only a correction that states a safety signal is admitted, at most safetyExcess more.
    {const depth=depthOf(correctionOf)+1;if(depth>LIMITS.correctionsPerReport&&!(statesSafetySignal(o)&&depth<=MAX_CHAIN))return {refusal:{code:'LIMIT_EXCEEDED',index:i,limit:'correctionsPerReport'}};}
   }else{
    if(channel===CHANNELS.ATHLETE&&o.sessionId!==undefined){const mine=Object.entries(all).find(([,m])=>m.ch==='A'&&m.s===o.sessionId);
     if(mine){const head=headOf(mine[0]);
      // Cycle 1 (SSCTR-INT-01): the same report again (the report in force, unchanged) is a duplicate, as on the device channel: the rest of the
      // request (a report of how the athlete feels, a check, a declaration) goes on. Another report of the session is a correction to make.
      if(!head.startsWith('pending:')&&all[head]?.d===factsDigest(o)){duplicates.push(i);continue;}
      return {refusal:{code:'ALREADY_REPORTED',index:i,field:'sessionId',eventId:head}};}}
    const day=dayOf(o),ch=channel===CHANNELS.ATHLETE?'A':'D';
    // SEC-INT-07: past the limit only a report that states a safety signal is admitted, at most safetyExcess more.
    {const n=day?Object.values(all).filter(m=>m.ch===ch&&!m.of&&m.day===day).length:0;
     if(day&&n>=LIMITS.reportsPerDayPerChannel&&!(statesSafetySignal(o)&&n<LIMITS.reportsPerDayPerChannel+LIMITS.safetyExcess))return {refusal:{code:'LIMIT_EXCEEDED',index:i,limit:'reportsPerDayPerChannel'}};}
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
 /** V1HR5R (QRE-HR5R-05): an intake's heart-rate declaration is one the profile records, or the intake is refused whole (never dropped unsaid);
  * an intake states no carried record. */
 const hrIntakeError=intake=>{if(!isObj(intake))return null;
  const carried=Object.keys(intake).filter(k=>CARRIED_RECORDS.includes(k));if(carried.length)return {code:'INVALID_REQUEST',fields:carried};
  if(intake.heartRateProfile===undefined)return null;const errors=declarationErrors(intake.heartRateProfile);return errors.length?{code:'INVALID_REQUEST',fields:errors}:null;};
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
   // Only duplicates and nothing else said (no screen, no report of how the athlete feels): nothing to decide, nothing written.
   // (A screen equal to the one on record says nothing new either.)
   const sameScreen=rv.eligibility===undefined||canonical(rv.eligibility)===canonical(op.loaded.screen??null);
   // Cycle 1 (SEC-BC-02 = QRE-BC-01): only while the record holds the last answer's readings; after an erasure took them the engine is asked,
   // so the answer names the screen the kept stop still requires.
   if(!a.observations.length&&a.duplicates.length&&op.loaded?.presentation?.readings&&(channel===CHANNELS.DEVICE||Object.keys(rv).every(k=>['kind','observations','eligibility'].includes(k))&&rv.kind==='WEEKLY_REVIEW'&&sameScreen))
    // V1 blocker closure (SSCTR-INT-R2-01): no engine call is made, so the answer carries the screen the record last asked for (never a null
    // that could read as "no screen needed").
    return {ok:true,duplicate:true,duplicates:a.duplicates,version:o.doc.version,recorded:[],notRecorded:[],warningSignScreen:op.loaded?.presentation?.readings?.warningSignScreen??null,...activitiesOf(channel,list,a.duplicates,null)};
   op.pendingOrigins=a.metas;op.request={id:clientRequestId,info:{d,at:iso(op.at),of:a.of,dup:a.duplicates}};
  }
  // The device channel carries no screen of its own: only the athlete's last one, as they sent it (SEC-INT-01). Without one the workouts wait.
  if(channel===CHANNELS.DEVICE&&!seen&&!isObj(op.loaded.screen))return fail('SCREEN_REQUIRED','The athlete has answered no screen yet; the workouts wait for it (nothing was recorded)');
  if(channel===CHANNELS.ATHLETE&&isObj(rv.eligibility))op.screen=clone(rv.eligibility);
  const screen=channel===CHANNELS.DEVICE?(seen?seen.screen:op.loaded.screen):null;
  if(channel===CHANNELS.DEVICE&&op.request)op.request.info.screen=screen;
  const sent=channel===CHANNELS.ATHLETE?{...rv,...(Array.isArray(rv.observations)?{observations:a.observations}:{})}:{kind:'WEEKLY_REVIEW',observations:a.observations,...(screen?{eligibility:screen}:{})};
  const r=custody.submit({actor,clientRequestId,expectedVersion,review:sent});
  if(!r.ok)return r;
  const outcome=seen?seen.outcome:op.request?.outcome,out={...r,...(outcome??{recorded:[],notRecorded:[],warningSignScreen:null}),...(a.duplicates.length?{duplicates:a.duplicates}:{})};
  return {...out,...activitiesOf(channel,list,a.duplicates,out)};
 }
 /**
  * V1HR5R: one write of the athlete's heart-rate profile (setHeartRateProfile, eraseHeartRateProfile). It is no review: the engine is not asked,
  * custody records no decision, and no plan, session or record of custody changes. The new profile record and the last answer's five-zone
  * reading resolved again with it (the engine's own heartRateProfileReading) are written with the carried records in one atomic store commit at
  * the custody version the app last saw, advancing the carried sequence the anchor keeps (QRE-HR5R-06). Coaching consent is required, as for
  * a review, to record a value (QRE-HR5R-03), never to erase one (QRE-HR5R-N2). Idempotent by request id. Any fault is a typed refusal, nothing written.
  */
 function profileWrite({actor,clientRequestId,expectedVersion,payload,tag,change,consent=true}){
  if(typeof clientRequestId!=='string'||!clientRequestId||clientRequestId.length>LIMITS.idLength)return fail('INVALID_REQUEST','A request id (1 to 128 characters) is required');
  const o=custody.read({actor});if(!o.ok)return o;const doc=o.doc,base=op.loaded;
  const d=hmac(`${INTEGRATION_SCHEMA}|${tag}|`+(canonical(payload)??'null')),seen=base.requests?.[clientRequestId];
  if(seen)return seen.d===d?{ok:true,replayed:true,version:doc.version,...(seen.hr??{})}:fail('CONFLICT_IDEMPOTENCY_KEY','This request id was already used for another request');
  if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed since this request was prepared; refresh and send again',{version:doc.version});
  if(consent&&doc.consents?.COACHING?.granted!==true)return fail('CONSENT_REQUIRED','Coaching consent was revoked',{purpose:'COACHING'});
  const at=iso(op.at),tz=doc.program?.timezoneOffsetMinutes??0;
  let c,next;
  try{c=change(base.records.heartRateProfileRecord??[],doc,at);}catch{return fail('OPERATIONAL_ERROR','The heart-rate profile could not be read; nothing was recorded',{cause:'HEART_RATE_PROFILE'});}
  if(c.refusal)return fail('INVALID_REQUEST','The heart-rate profile is not one the coach records; nothing was recorded',{fields:c.refusal});
  const readings=base.presentation?.readings??null,rc=readings?.runCalibration??null;
  try{next=rc&&typeof engine.heartRateProfileReading==='function'?engine.heartRateProfileReading(rc,c.record,{athleteId:doc.athleteId,at,offsetMinutes:tz}):rc;}catch{next=rc;}
  const outcome={...c.outcome,fiveZones:next?.heartRateFiveZones?{status:next.heartRateFiveZones.status,reason:next.heartRateFiveZones.reason??null}:null};
  // The carried records of this write: the loaded ones with the new profile record; the readings as the last answer left them, with only the
  // five-zone reading resolved again (null readings stay null: QRE-HR5R-01).
  op.calls.push({records:{...base.records,heartRateProfileRecord:c.record},ledger:[],runSessions:undefined,excluded:[],observationIds:[],programHash:doc.program?.hash??null,
   readings:readings===null?null:{...readings,runCalibration:next},readingsAsIs:true});
  op.request={id:clientRequestId,info:{d,at,of:[],dup:[],hr:outcome}};
  const r=carriedStore.commit(doc.athleteId,doc.version,doc);
  if(!r?.ok)return r?.conflict?fail('CONFLICT_STALE_VERSION','The record changed since this request was prepared; refresh and send again'):fail('PERSISTENCE_FAILURE','The record could not be saved; nothing was changed, send again');
  return {ok:true,version:doc.version,...outcome};
 }
 /** Cycle 1 (QRE-INT-05): what happened to each workout of a delivery, by its own activity id and index, for the HealthKit queue. */
 function activitiesOf(channel,list,duplicates,out){
  if(channel!==CHANNELS.DEVICE)return {};
  const ids=Array.isArray(out?.observationIds)?out.observationIds:[],rec=new Set(out?.recorded??[]),why=new Map((out?.notRecorded??[]).map(x=>[x.eventId,x.reason]));let k=0;
  return {activities:list.map((w,index)=>{const activityId=w?.activityId??null;if(duplicates.includes(index))return {index,activityId,outcome:'DUPLICATE',eventId:null};
   const eventId=ids[k++]??null;return rec.has(eventId)?{index,activityId,outcome:'RECORDED',eventId}:{index,activityId,outcome:'NOT_RECORDED',eventId,reason:why.get(eventId)??'NOT_RECORDED_BY_THIS_DECISION'};})};
 }
 return {
  CHANNELS,
  /** The first plan (custody.enroll), its carried records kept with it. */
  enroll:args=>run(args?.actor,true,()=>{const e=intakeError(args?.intake)??hrIntakeError(args?.intake);if(e)return fail(e.code,'The intake is not one the coach admits',e);
   if(isObj(args.intake.athlete?.eligibility))op.screen=clone(args.intake.athlete.eligibility);return withScreen(custody.enroll(args));},'enroll'),
  /** The athlete's own review (the app's forms; channel ATHLETE). Every api.mjs operation reaches this. */
  submit:args=>run(args?.actor,true,()=>review(CHANNELS.ATHLETE,args??{}),'submit'),
  /** HealthKit workouts (channel DEVICE): [{activityId, activityType:'RUN', sessionId?, observedAt, actual, sourceQuality?}]. The device states
   * no screen: the athlete's last one goes with them, byte for byte (SEC-INT-01); a delivery is never empty. */
  importActivities:({actor,clientRequestId,expectedVersion,activities,...rest})=>run(actor,true,()=>{
   if(Object.keys(rest).some(k=>rest[k]!==undefined))return fail('INVALID_REQUEST','A delivery holds workouts only (the device states no screen)',{fields:Object.keys(rest)});
   if(!Array.isArray(activities)||!activities.length)return fail('NOTHING_TO_IMPORT','A delivery holds at least one workout');
   return review(CHANNELS.DEVICE,{actor,clientRequestId,expectedVersion,review:{kind:'WEEKLY_REVIEW',observations:activities}});},'importActivities'),
  /**
   * V1HR5R: the athlete's heart-rate profile (the athlete's own form): {maxHeartRateBpm: whole bpm 120-230 | null, zoneUpperBpm: [the highest whole
   * bpm of Z1..Z4, strictly increasing, 60-230] | null}, either or both (null clears). It is no review: the engine is not asked, custody records no
   * decision and no plan, session or record of custody changes. The declaration is appended to the carried heartRateProfileRecord, the last
   * answer's five-zone reading is resolved again with the new profile (the engine's own applyHeartRateProfile), and both are written with the
   * carried records in one atomic store commit under the same seal, at the custody version the app last saw. Refused whole when not one the
   * profile records. Idempotent by its request id.
   */
  setHeartRateProfile:({actor,clientRequestId,expectedVersion,heartRateProfile,...rest})=>run(actor,true,()=>{
   if(Object.keys(rest).some(k=>rest[k]!==undefined))return fail('INVALID_REQUEST','A heart-rate profile request holds the profile only',{fields:Object.keys(rest)});
   const errors=declarationErrors(heartRateProfile);if(errors.length)return fail('INVALID_REQUEST','The heart-rate profile is not one the coach records; nothing was recorded',{fields:errors});
   return profileWrite({actor,clientRequestId,expectedVersion,payload:heartRateProfile,tag:'heartRateProfile',consent:true,change:(rows,doc,at)=>{
    const a=appendProfile(rows,{athleteId:doc.athleteId,at,declaration:heartRateProfile,offsetMinutes:doc.program?.timezoneOffsetMinutes??0});
    return a.refused.length?{refusal:a.refused[0].errors}:{record:a.record,outcome:{heartRateProfile:{added:a.added,unchanged:a.unchanged}}};}});},'setHeartRateProfile'),
  /** V1HR5R (QRE-HR5R-08): the athlete erases the heart-rate maximum and limits they entered (every such row, history included); the age of the
   * intake stays (onboarding data, erased with the account). The same carried commit as setHeartRateProfile; idempotent by its request id. */
  // QRE-HR5R-N2/N3: an erasure is never held back by revoked consent or by a clock behind the record (SEC-INT-04): it runs as a non-mutating
  // operation dated at the record's latest instant, as eraseHealthFacts does.
  eraseHeartRateProfile:({actor,clientRequestId,expectedVersion,...rest})=>run(actor,false,()=>{
   if(Object.keys(rest).some(k=>rest[k]!==undefined))return fail('INVALID_REQUEST','An erasure of the heart-rate profile holds no field',{fields:Object.keys(rest)});
   return profileWrite({actor,clientRequestId,expectedVersion,payload:null,tag:'eraseHeartRateProfile',consent:false,change:(rows,doc)=>{const e=eraseDeclarations(rows,{athleteId:doc.athleteId});return {record:e.record,outcome:{erased:e.erased}};}});},'eraseHeartRateProfile'),
  accept:args=>run(args?.actor,true,()=>custody.accept(args),'accept'),
  decline:args=>run(args?.actor,true,()=>custody.decline(args),'decline'),
  /** A new plan from the record custody holds (C-F01-2: the canonical record, never a reconstruction) with every carried record. */
  restart:args=>run(args?.actor,true,()=>{const e=intakeError(args?.intake)??hrIntakeError(args?.intake);if(e)return fail(e.code,'The intake is not one the coach admits',e);
   if(isObj(args.intake.athlete?.eligibility))op.screen=clone(args.intake.athlete.eligibility);return withScreen(custody.restart(args));},'restart'),
  /** A revocation is never held back by a clock behind the record (SEC-INT-04, cycle 1): withdrawing consent always works. */
  setConsent:args=>run(args?.actor,args?.granted!==false,()=>custody.setConsent(args),'setConsent'),
  // V1 blocker closure (SEC-INT-04 rest): an erasure is never held back by a clock behind the record, as a revocation is not (the latest instant
  // on record never moves back).
  eraseHealthFacts:args=>run(args?.actor,false,()=>custody.eraseHealthFacts(args),'eraseHealthFacts'),
  eraseAccount:args=>run(args?.actor,false,()=>{const r=custody.eraseAccount(args);if(r.ok&&anchor)try{anchor.clear(args.actor.athleteId);}catch{}return r;},'eraseAccount'),
  /** The athlete's explicit act after RECORD_LOST / RECORD_ROLLED_BACK, and only then (SEC-INT-03, QRE-INT-03, cycle 1): a record that is
   * there and as anchored is never set aside this way (a hold on it would go with it). What remains is set aside; a new plan starts from a new intake. */
  acknowledgeRecordLoss:({actor})=>run(actor,false,()=>{if(!isObj(actor)||typeof actor.athleteId!=='string')return fail('UNAUTHENTICATED','No authenticated athlete');
   const id=actor.athleteId,a=anchor?.get(id);if(!a)return fail('NOT_LOST','Nothing to acknowledge');
   let doc;try{doc=store.load(id);}catch{return fail('NOT_LOST','The stored record is unreadable, not lost: it is an integrity failure (account erasure is the way out)');}
   // V1HR5R (QRE-HR5R-N1): a carried rollback at the same custody version is a loss too (load flags it RECORD_ROLLED_BACK); the athlete's act sets it aside.
   const lost=!doc||!Number.isInteger(doc.version)||doc.version<a.version||doc.version===a.version&&doc.docMac!==a.docMac
    ||doc.version===a.version&&Number.isInteger(a.carriedSeq)&&!(Number.isInteger(doc.carried?.seq)&&doc.carried.seq>=a.carriedSeq);
   if(!lost)return fail('NOT_LOST','The record is there and as last kept; nothing is set aside');
   if(doc)store.remove(id);anchor.clear(id);return {ok:true};},'acknowledgeRecordLoss'),
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
