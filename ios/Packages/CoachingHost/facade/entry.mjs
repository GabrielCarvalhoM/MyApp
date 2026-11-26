// RepMile CoachingHost app facade (front A, V1, base v1-abc-ready-2026-11-26). Application code, not engine code: the only surface the Swift
// host calls. Every function takes and returns small JSON strings over `createBoundary({custody: createIntegration({store, key, clock, anchor})})`
// (the frozen boundary of REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2) and the shared read-only projections of
// ios/Packages/CoachingPresentation/Facade/app-projections.mjs, linked verbatim.
//
// Rules this file keeps (PARALLEL_IMPLEMENTATION_CONTRACT rev. 2 §5, A handoff §4):
// - no sporting rule, no new engine operation, no reinterpretation: states and executability come only from the engine's `view`;
// - every athlete report goes through `integration.submit` with the review JSON exactly as Swift encoded it (ReviewRequest; FND-ABC-03:
//   never the api.mjs form helpers, which keep only completed/minutes/exercises/response);
// - `syntheticOnly` stays at its default (true, OPEN-4): `open` refuses any other value;
// - the key never enters JavaScript: `keyRef` is an opaque label the host resolves in the Keychain (`__p0host.hmacSHA256(keyRef, text)`);
// - logs: only `telemetryOf` records reach the host (`__chlog`), never a payload.
import {createIntegration} from '../../../../CoachingCore/src/boundary/integration.mjs';
import {createBoundary} from '../../../../CoachingCore/src/boundary/api.mjs';
import {stateOfError} from '../../../../CoachingCore/src/boundary/views.mjs';
import {telemetryOf} from '../../../../CoachingCore/src/boundary/inventory.mjs';
import {memoryStore} from '../../../../CoachingCore/src/boundary/store.mjs';
import {repertoireAuthority} from '../../../../CoachingCore/src/r7b-repertoire.mjs';
import {loggedEntries,keepsReport,weekPlan,warningSignSet,timeInZones,PROJECTIONS_VERSION} from '../../CoachingPresentation/Facade/app-projections.mjs';
import {pendingWeek,PENDING_WEEK_VERSION} from './pending-week.mjs';

export const FACADE_VERSION='RM-COACHINGHOST-FACADE-1';
const out=o=>JSON.stringify(o);
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const parse=s=>{const v=JSON.parse(s);if(!isObj(v))throw new Error('facade: an object is required');return v;};
const hostLog=rec=>{if(typeof globalThis.__chlog==='function')globalThis.__chlog(JSON.stringify(rec));};
const failure=(code,message)=>({ok:false,error:{code,message},state:stateOfError({code})});

/** The native store and Keychain anchor the Swift host installs (`__chstore`, `__chanchor`), as store.mjs / the anchor contract expect them. */
function nativeStore(){
 const s=globalThis.__chstore;if(!s)throw new Error('facade: the native store is not installed');
 const parsed=t=>t===null||t===undefined?null:JSON.parse(t);
 return {
  load:id=>parsed(s.load(id)),
  commit:(id,v,doc)=>{const r=JSON.parse(s.commit(id,v===null||v===undefined?-1:v,v===null||v===undefined,JSON.stringify(doc)));if(r.thrown)throw new Error('store: '+r.thrown);return r;},
  remove:id=>{s.remove(id);},
  tombstone:(subject,t)=>{const e=s.tombstone(subject,JSON.stringify(t));if(e)throw new Error('store: '+e);},
  tombstoneOf:subject=>parsed(s.tombstoneOf(subject)),
  raw:id=>{const t=s.raw(id);return t===null||t===undefined?null:t;},
  setRaw:(id,t)=>{s.setRaw(id,t);}
 };
}
function keychainAnchor(){
 const a=globalThis.__chanchor;if(!a)throw new Error('facade: the Keychain anchor is not installed');
 // QRE-A-03: a failed Keychain read is an error (the boundary then answers a failure), never "no anchor".
 return {get:id=>{const t=a.get(id);if(t==='\u0000KEYCHAIN_READ_FAILED')throw new Error('keychain anchor read failed');return t===null||t===undefined||t===''?null:JSON.parse(t);},
  set:(id,v)=>{if(!a.set(id,JSON.stringify(v)))throw new Error('keychain anchor write failed');},
  clear:id=>{a.clear(id);}};
}

let H=null; // the open host: {actor, it, api, setClock}

/** Every operation: `nowMs` is the operation clock the Swift host has already bounded (D1); nothing here reads another clock. */
function withClock(nowMs,fn){
 if(!H)return out(failure('HOST_NOT_OPEN','The host facade is not open'));
 if(typeof nowMs!=='number'||!Number.isFinite(nowMs))throw new Error('facade: nowMs is required');
 H.clock=nowMs;
 return out(fn());
}
const recordOf=()=>{const o=H.it.read({actor:H.actor});return o.ok?o.doc:null;};
/** GAP-12 (FND-ABC-01): which reports the record keeps as their own session, read right after the write, in the same call (same queue). */
function keptOf(r){
 if(!r?.ok||!Array.isArray(r.recorded))return {};
 const o=H.it.read({actor:H.actor});if(!o.ok)return {kept:[],notKept:[...r.recorded]};
 const e=loggedEntries(H.it.visible(o.doc));
 return {kept:r.recorded.filter(id=>keepsReport(e,id)),notKept:r.recorded.filter(id=>!keepsReport(e,id))};
}
/** api.mjs `done`, unchanged in shape: the answer, then the view (or why there is none). */
function done(op,r){
 hostLog(telemetryOf(op,r));
 if(!r.ok)return {...r,state:stateOfError(r.error)};
 const v=H.api.plan({actor:H.actor});
 return {...r,...(v.ok?{view:v.view}:{viewError:v.error,state:v.state})};
}

export const api=Object.freeze({
 facadeVersion:FACADE_VERSION,
 /**
  * {athleteId, keyRef, store:'native'|'memory', syntheticOnly?} and, only when the host set `__chTestMode` (tests): store 'memory',
  * ids 'shared' (deterministic ids, for the fixture reproduction), anchor 'none' (as the shared fixtures were captured). The app opens the
  * native store and the Keychain anchor with the boundary's own ids.
  */
 open(configJSON){
  const c=parse(configJSON),test=globalThis.__chTestMode===true;
  if(typeof c.athleteId!=='string'||!c.athleteId||c.athleteId.length>128)return out(failure('INVALID_CONFIG','athleteId'));
  if(typeof c.keyRef!=='string'||!c.keyRef)return out(failure('INVALID_CONFIG','keyRef'));
  if(c.syntheticOnly!==undefined&&c.syntheticOnly!==true)return out(failure('INVALID_CONFIG','syntheticOnly stays true (OPEN-4)'));
  if((c.store==='memory'||c.ids!==undefined||c.anchor!==undefined)&&!test)return out(failure('INVALID_CONFIG','test-only option'));
  // Test only: deterministic ids from one counter shared by every athlete of a run (`__chIdSeq`), as the shared fixtures were captured.
  const newId=c.ids==='shared'?p=>`${p}_${String(globalThis.__chIdSeq=(globalThis.__chIdSeq??0)+1).padStart(6,'0')}`:undefined;
  const store=c.store==='memory'?memoryStore():nativeStore(),anchor=c.store==='memory'||c.anchor==='none'?null:keychainAnchor();
  const h={actor:{athleteId:c.athleteId},clock:0};
  h.it=createIntegration({store,key:c.keyRef,clock:()=>h.clock,anchor,newId});
  h.api=createBoundary({custody:h.it,now:()=>h.clock,log:hostLog});
  H=h;
  return out({ok:true,facade:FACADE_VERSION,projections:PROJECTIONS_VERSION,pendingWeek:PENDING_WEEK_VERSION});
 },
 close(){H=null;return out({ok:true});},
 /** The prelude's host counters (QRE-P0-02): an asset asked for but not bundled, or a host function asked for but not provided, is the loud
  * signal an equivalence run must end without. Operational counts only. Null outside JavaScriptCore (Node has no prelude). */
 hostCalls(){const h=typeof __p0==='undefined'?null:__p0;return out(h?{calls:h.calls,misses:h.misses,unsupported:h.unsupported}:null);},

 // ---- reads ----
 version:(nowMs)=>withClock(nowMs,()=>{const o=H.it.read({actor:H.actor});return o.ok?{ok:true,version:o.doc.version}:{ok:false,error:o.error,state:stateOfError(o.error)};}),
 plan:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.plan({actor:H.actor,week:Number.isInteger(a.week)?a.week:null});}),
 sessions:(nowMs)=>withClock(nowMs,()=>H.api.sessions({actor:H.actor})),
 status:(nowMs)=>withClock(nowMs,()=>H.api.status({actor:H.actor})),
 history:(nowMs)=>withClock(nowMs,()=>H.api.history({actor:H.actor})),
 decision:(argsJSON,nowMs)=>withClock(nowMs,()=>H.api.decision({actor:H.actor,decisionId:parse(argsJSON).decisionId})),
 presentation:(nowMs)=>withClock(nowMs,()=>H.it.presentation({actor:H.actor})),
 loggedEntries:(nowMs)=>withClock(nowMs,()=>{const o=H.it.read({actor:H.actor});return o.ok?{ok:true,projections:PROJECTIONS_VERSION,entries:loggedEntries(H.it.visible(o.doc))}:{ok:false,error:o.error,state:stateOfError(o.error)};}),
 weekPlan:(nowMs)=>withClock(nowMs,()=>{const o=H.it.read({actor:H.actor});if(!o.ok)return {ok:false,error:o.error,state:stateOfError(o.error)};
  const v=H.api.plan({actor:H.actor});return {ok:true,projections:PROJECTIONS_VERSION,...weekPlan(o.doc,{today:v.ok?v.view.today:null})};}),
 warningSignSet:(argsJSON)=>out(warningSignSet(parse(argsJSON).condition)),
 /** Mission 6.3: the engine's classifier over the current five-zone reading, behind the shared gate (enabled:false until SSCTR C10). */
 timeInZones:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON),p=H.it.presentation({actor:H.actor});
  if(!p.ok)return {status:'UNAVAILABLE',reason:p.error?.code??'NO_RECORD',fromAverageHeartRate:false};
  return timeInZones(p.readings??null,a.series,{durationSeconds:typeof a.durationSeconds==='number'?a.durationSeconds:null});}),
 /** CHG-UI-2 2.3: the sessions of the proposal waiting for confirmation, strength included, in the view's own week format (never startable). */
 pendingWeek:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON),o=H.it.read({actor:H.actor});
  if(!o.ok)return {ok:false,error:o.error,state:stateOfError(o.error)};return pendingWeek(o.doc,{nowMs:H.clock,week:Number.isInteger(a.week)?a.week:null});}),
 /** DeviceActivitySink.ingestContext: a derived read (handoff §4 item 1), no rule. */
 ingestContext:(nowMs)=>withClock(nowMs,()=>{const o=H.it.read({actor:H.actor});if(!o.ok)return {ok:false,error:o.error};
  const s=H.api.sessions({actor:H.actor}),p=o.doc.program,tz=p?.timezoneOffsetMinutes??0;
  const day=new Date(Date.parse(o.doc.createdAt)+tz*60000).toISOString().slice(0,10);
  const runSessions=(s.ok?s.weeks:[]).flatMap(w=>w?.sessions??[]).filter(x=>x.sport==='RUN').map(x=>({sessionId:x.id,day:x.date}));
  return {ok:true,recordStartDay:day,timezoneOffsetMinutes:tz,runSessions,version:o.doc.version};}),
 /** R7-B0 (7.6): whether the strength repertoire records are in force on the plan-local day, by the engine's own authority reader. */
 repertoire:(argsJSON)=>{const a=parse(argsJSON),r=repertoireAuthority({asOf:a.today});
  return out({valid:r.valid===true,reviewBy:r.records.map(x=>x.reviewBy).filter(Boolean).sort()[0]??null});},

 /** Tests only (`__chTestMode`): the opaque event ids of the athlete's heart-rate declarations on record (HR5 two-writer proof). No value. */
 heartRateDeclarationIds:(nowMs)=>withClock(nowMs,()=>{if(globalThis.__chTestMode!==true)return failure('TEST_ONLY','test-only read');
  const c=H.it.carried({actor:H.actor});return c.ok?{ok:true,ids:(c.records.heartRateProfileRecord??[]).filter(r=>r.source==='ATHLETE').map(r=>r.eventId)}:{ok:false,error:c.error};}),

 // ---- writes ----
 onboard:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.onboard({actor:H.actor,intake:a.intake,consents:a.consents,clientRequestId:a.clientRequestId});}),
 restart:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.restart({actor:H.actor,intake:a.intake,expectedVersion:a.expectedVersion});}),
 /** Every athlete review (WEEKLY_REVIEW, MISSED_SESSION, NOT_FEELING_100, ...), exactly as encoded, through integration.submit. */
 submit:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);
  const r=H.it.submit({actor:H.actor,clientRequestId:a.clientRequestId,expectedVersion:a.expectedVersion,review:a.review});
  const k=keptOf(r);return {...done('submit',r),...k};}),
 accept:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.accept({actor:H.actor,decisionId:a.decisionId,expectedVersion:a.expectedVersion});}),
 decline:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.decline({actor:H.actor,decisionId:a.decisionId,expectedVersion:a.expectedVersion});}),
 setHeartRateProfile:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.setHeartRateProfile({actor:H.actor,clientRequestId:a.clientRequestId,expectedVersion:a.expectedVersion,heartRateProfile:a.heartRateProfile});}),
 eraseHeartRateProfile:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.eraseHeartRateProfile({actor:H.actor,clientRequestId:a.clientRequestId,expectedVersion:a.expectedVersion});}),
 setConsent:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.setConsent({actor:H.actor,purpose:a.purpose,granted:a.granted,expectedVersion:a.expectedVersion});}),
 eraseHealthFacts:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);return H.api.eraseHealthFacts({actor:H.actor,eventIds:a.eventIds,expectedVersion:a.expectedVersion});}),
 eraseAccount:(nowMs)=>withClock(nowMs,()=>H.api.eraseAccount({actor:H.actor})),
 /** The device channel: only DeviceActivitySink.deliver reaches this (contract §4.1 item 1). */
 importActivities:(argsJSON,nowMs)=>withClock(nowMs,()=>{const a=parse(argsJSON);
  const r=H.it.importActivities({actor:H.actor,clientRequestId:a.clientRequestId,expectedVersion:a.expectedVersion,activities:a.activities});hostLog(telemetryOf('importActivities',r));return r;}),
 acknowledgeRecordLoss:(nowMs)=>withClock(nowMs,()=>{const r=H.it.acknowledgeRecordLoss({actor:H.actor});hostLog(telemetryOf('acknowledgeRecordLoss',r));return r;})
});
