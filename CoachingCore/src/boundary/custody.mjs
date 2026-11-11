// V1 Coaching Integration Boundary: RECORD-CUSTODY (PCG-V1CPFF-CFOBS1-r1 Q5; Security C2, C5, C6, C7, C8, SEC-V1CPI-06; QRE Q5). The server, not the
// app, keeps the athlete's program, record, reference state and learning model. The app sends only what the athlete did or said (a closed payload);
// the server composes the engine input from its stored copies, assigns the event ids and the clock, binds the athlete, accepts only a record that
// extends the stored one, and keeps every row under a keyed chain (HMAC) a client cannot recompute. A hold on the record is enforced here too
// (defence in depth): no prescription leaves custody while it stands.
// What this module is: the contract, the validators and a working reference implementation over a store adapter (store.mjs), exercised by tests.
// What it is not (PENDING, operational): authentication and session issuance, key management (KMS, rotation), the production database, backups,
// monitoring, rate limits, and the legal basis, texts and periods of consent and retention (G07). It runs the shadow engine on synthetic data only.
import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
import {canonical,hash} from '../value.mjs';
import {generateProgram,evaluateProgram,restartProgram} from '../v1-index.mjs';
import {validProgram} from '../r6-program.mjs';
import {readableF08,standingHolds,isF08Fact,erasureFact,WELLBEING_DECLARED,WELLBEING_CHECKED,READINESS_DECLARED} from '../v1-f08.mjs';

export const CUSTODY_SCHEMA='V1CIB-CUSTODY-2';
/** The review fields the app may send (anything else is refused, never forwarded: SEC-V1CP-02 server part). */
export const CLIENT_REVIEW_FIELDS=Object.freeze(['kind','observations','eligibility','interruption','changes','choices','wellbeing','wellbeingCheck','readiness','loadConfirmations','substitution','targetSessionId','signals','currentDemonstration']);
/** The fields only custody sets: a request carrying any of them is refused (the app never builds, edits, re-seals or drops this state). */
export const ENGINE_OWNED_FIELDS=Object.freeze(['version','synthetic','purpose','asOf','weekIndex','event','actualLedger','referenceState','athleteModel','officialPlanState','learningConsent','athleteId']);
const F08_KINDS=['NOT_FEELING_100','WELLBEING_CHECK','READINESS_DECLARATION'];
/** The changes the athlete applies to their own context or plan, whose resulting plan waits for their confirmation (AEC §3.4: "mudança que a pessoa
 * aplica em seu contexto/plano ... mostra alcance e exige confirmação"; §2: moving a session to another day only by the person's act). A change that
 * follows the evidence (the week's gates, a re-plan from reports, a reduction after a reported fatigue) is a recalculated recommendation, applied
 * with its decision and shown with its reason. The boundary's reading; Product/UX may change this list without any engine change. */
export const CONFIRMATION_KINDS=Object.freeze(['SCHEDULE_CHANGE','UNAVAILABLE_DAY','DOUBLE_CONFLICT','PREFERENCE_CHANGE','GOAL_CHANGE','EQUIPMENT_CHANGE','EVENT_DATE_CHANGE','EVENT_WEEK_CONFLICT','EXERCISE_SUBSTITUTION']);
/** V1 Final Closure (PCG-V1CIB-F01, A-C1): changes the coach may suggest but only the athlete applies. Moving a missed session to another day and
 * rearranging the days from a learned pattern keep the plan in force admissible, so they are offered: custody decides the same review without them
 * (the engine's withhold option), applies that decision with its evidence, and keeps the change as a proposal waiting for the athlete. A decline
 * holds: a learned rearrangement the athlete declined is not offered again for the same pattern. */
export const OFFERED_ACTIONS=Object.freeze(['MOVE','LEARNED_REARRANGEMENT']);
/** Retention and erasure policy of this reference implementation (mechanism only; the legal basis and the periods are G07's). */
export const RETENTION=Object.freeze({record:'KEPT_WHILE_THE_ACCOUNT_EXISTS',decisionLog:'KEPT_WITH_THE_RECORD',idempotencyEntries:500,erasure:['ACCOUNT','F08_FACTS'],
 tombstone:'Pseudonymous subject digest, time and scope only; refuses any later write for an erased account (no resurrection by a device that synchronises old data)',status:'MECHANISM_ONLY_PENDING_G07'});
/** The consent purposes custody checks (placeholders for the purposes G07 names; no legal claim is made here). */
export const PURPOSES=Object.freeze({COACHING:'COACHING',HEALTH_SIGNALS:'HEALTH_SIGNALS',LEARNING:'LEARNING'});

const fail=(code,message,extra={})=>({ok:false,error:{code,message,...extra}});
const sha=text=>createHash('sha256').update(text).digest('hex');
const digest=v=>sha(canonical(v)??'null');
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
/** The program's local ISO instant for epoch ms (the engine reads local dates in the program's fixed offset). */
function localIso(ms,offsetMin){const d=new Date(ms+offsetMin*60000).toISOString().slice(0,19),a=Math.abs(offsetMin);return `${d}${offsetMin<0?'-':'+'}${String(Math.floor(a/60)).padStart(2,'0')}:${String(a%60).padStart(2,'0')}`;}
const weekIndexOf=(program,day)=>Math.floor((Date.parse(day+'T00:00:00Z')-Date.parse(program.startDate+'T00:00:00Z'))/(7*864e5));

/**
 * The custody service. `store` is a store adapter (store.mjs); `key` the server's integrity key (a Buffer or string the app never holds); `now` the
 * server clock (epoch ms); `newId` the opaque id source. Every operation takes `actor` = {athleteId} from the authentication layer (PENDING).
 */
export function createCustody({store,key,now=()=>Date.now(),newId,syntheticOnly=true,engine={generateProgram,evaluateProgram,restartProgram}}={}){
 if(!store||!key)throw new Error('custody needs a store and a key');
 const hmac=text=>createHmac('sha256',key).update(text).digest('hex');
 /** SEC-V1CIB-04: the digest a chain entry keeps of its row is keyed. An erased slot keeps it (the chain still verifies), and without the server key
  * it is no oracle for guessing the erased content. The idempotency digest of a request is keyed for the same reason. */
 const rowDigest=row=>hmac(CUSTODY_SCHEMA+'|content|'+(canonical(row)??'null'));
 let counter=0;const id=prefix=>newId?newId(prefix):`${prefix}_${hmac(`${prefix}|${now()}|${++counter}|${Math.random()}`).slice(0,26)}`;
 const subjectOf=athleteId=>hmac(`${CUSTODY_SCHEMA}|subject|${athleteId}`);
 const link=(athleteId,c,prev)=>hmac(`${CUSTODY_SCHEMA}|row|${athleteId}|${c.seq}|${c.recordedAt}|${c.digest}|${prev}`);
 const envelope=doc=>({schema:doc.schema,athleteId:doc.athleteId,version:doc.version,createdAt:doc.createdAt,program:digest(doc.program),pending:digest(doc.pending??null),reference:digest(doc.reference??null),
  model:digest(doc.model??null),consents:digest(doc.consents),agency:digest(doc.agency??null),head:doc.chain.at(-1)?.mac??'genesis',rows:doc.chain.length,decisions:digest(doc.decisions),requests:digest(doc.requests)});
 const seal=doc=>({...doc,docMac:hmac(`${CUSTODY_SCHEMA}|doc|`+canonical(envelope(doc)))});
 const same=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
 /** Integrity of a stored document: its seal, the order and links of the chain, every row's digest (the digest of its latest annotation entry, when a
  * correction annotated it; an erased row keeps its digest and no content), and the program's own validity. Returns the failing part or null.
  * The chain has one entry per row slot; an annotation entry (`of`: the seq it annotates) holds no row of its own. */
 function verify(doc){
  if(!isObj(doc)||doc.schema!==CUSTODY_SCHEMA||!Array.isArray(doc.rows)||!Array.isArray(doc.chain)||doc.rows.length!==doc.chain.length)return 'shape';
  if(!same(seal({...doc,docMac:undefined}).docMac,doc.docMac))return 'document';
  let prev='genesis';const latest=new Map();
  for(let i=0;i<doc.chain.length;i++){const c=doc.chain[i];if(!isObj(c)||c.seq!==i+1)return 'sequence';if(!same(link(doc.athleteId,c,prev),c.mac))return 'chain';prev=c.mac;
   if(Number.isInteger(c.of)){if(c.of<1||c.of>i||Number.isInteger(doc.chain[c.of-1].of)||doc.rows[i]!==null)return 'annotation';latest.set(c.of,c.digest);}}
  for(let i=0;i<doc.chain.length;i++){const c=doc.chain[i];if(Number.isInteger(c.of))continue;if(c.erased?doc.rows[i]!==null:!same(rowDigest(doc.rows[i]),latest.get(c.seq)??c.digest))return 'row';}
  if(!validProgram(doc.program))return 'program';
  return null;
 }
 const visible=doc=>doc.rows.filter(r=>r!==null);
 const entry=(doc,chain,d,extra={})=>{const c={seq:chain.length+1,recordedAt:extra.at,digest:d,...(extra.of?{of:extra.of}:{})};c.mac=link(doc.athleteId,c,chain.at(-1)?.mac??'genesis');return c;};
 function append(doc,rows,at,annotations=[]){
  const chain=[...doc.chain],out=[...doc.rows],stamp=new Date(at).toISOString();
  for(const {i,row} of annotations){out[i]=row;chain.push(entry(doc,chain,rowDigest(row),{at:stamp,of:i+1}));out.push(null);}
  for(const row of rows){chain.push(entry(doc,chain,rowDigest(row),{at:stamp}));out.push(row);}
  return {...doc,rows:out,chain};
 }
 /** The identity of a record row: a fact by its type and event id, a session report by its event id. */
 const identity=x=>x?.fact?`f:${x.fact}:${x.eventId}`:`o:${x?.eventId}`;
 const ANNOTATION=['superseded','supersededBy','supersededAt'];
 /** A correction's only change to a stored report: the supersession annotation added (R7-A: facts a correction replaced travel as inert history). */
 const annotates=(x,y)=>!x.fact&&x.superseded!==true&&y.superseded===true&&typeof y.supersededBy==='string'&&typeof y.supersededAt==='string'&&digest(Object.fromEntries(Object.entries(y).filter(([k])=>!ANNOTATION.includes(k))))===digest(x);
 /** The engine's record against the stored one: every stored row comes back, unchanged or (a report) only annotated by a correction; nothing else may
  * change or disappear. Returns {added, annotations} in the engine's order, or {error}. The engine regroups rows by type; custody keeps arrival order. */
 function reconcile(doc,after){
  const by=new Map();for(const y of after){const k=identity(y);if(by.has(k))return {error:'a row identity appears twice'};by.set(k,y);}
  const annotations=[];
  for(let i=0;i<doc.rows.length;i++){const x=doc.rows[i];if(x===null)continue;const k=identity(x),y=by.get(k);
   if(!y)return {error:'a stored row is missing'};by.delete(k);
   if(digest(y)===digest(x))continue;if(annotates(x,y)){annotations.push({i,row:y});continue;}return {error:'a stored row changed'};}
  return {added:[...by.values()],annotations};
 }
 /** Loads, authorizes and verifies the actor's document; {doc} or {error}. */
 function open(actor){
  if(!isObj(actor)||typeof actor.athleteId!=='string'||!actor.athleteId)return fail('UNAUTHENTICATED','No authenticated athlete');
  if(store.tombstoneOf(subjectOf(actor.athleteId)))return fail('GONE','This account was erased; nothing is accepted for it');
  let doc;try{doc=store.load(actor.athleteId);}catch{return fail('INTEGRITY_FAILURE','The stored record cannot be read');}
  if(!doc)return fail('NOT_ENROLLED','No plan for this athlete');
  if(doc.athleteId!==actor.athleteId)return fail('FORBIDDEN','This record belongs to another athlete');
  const bad=verify(doc);if(bad)return fail('INTEGRITY_FAILURE',`The stored record failed its integrity check (${bad}); nothing is planned over it`,{part:bad});
  return {ok:true,doc};
 }
 const commit=(before,next)=>{const r=store.commit(before.athleteId,before.version,seal({...next,version:before.version+1}));return r.ok?{ok:true}:r.busy?fail('BUSY','Another update is in progress; try again'):fail('CONFLICT_STALE_VERSION','The record changed since this request was prepared; refresh and send again',{version:r.version});};
 const holdsOf=(rows,athleteId,atMs)=>standingHolds(readableF08(rows.filter(isF08Fact),{athleteId,at:atMs})).holds;
 /** The minimal, closed decision entry custody keeps (no free text from the app; the guidance level and the warning sign names in the closed
  * vocabulary: Security C8's durable trace of a sign answered during a hold). The engine's reason is kept for the athlete's own history. */
 const entryOf=(decisionId,eventId,kind,at,r,extra={})=>({decisionId,eventId,kind,at:new Date(at).toISOString(),status:r.status,action:r.action,reason:typeof r.reason==='string'?r.reason:null,
  missingInputs:Array.isArray(r.missingInputs)?[...r.missingInputs]:[],question:r.question?.kind??null,planValidity:r.planValidity?.status??null,
  ...(r.guidance?{guidance:{level:r.guidance.level,wordingStatus:r.guidance.wordingStatus}}:{}),...(Array.isArray(r.warningSigns)&&r.warningSigns.length?{warningSigns:[...r.warningSigns]}:{}),
  ...(r.question?{questionDetail:r.question}:{}),...extra});
 const remember=(requests,clientRequestId,requestDigest,response)=>{const out={...requests,[clientRequestId]:{requestDigest,response}},keys=Object.keys(out);for(const k of keys.slice(0,Math.max(0,keys.length-RETENTION.idempotencyEntries)))delete out[k];return out;};

 /** A-C2: a change that was waiting and is closed without the athlete's answer is closed with its cause, never dropped silently. */
 const closed=(doc,at,cause,status='SUPERSEDED')=>doc.pending?[{decisionId:id('dc'),kind:'ADOPTION',of:doc.pending.decisionId,at:new Date(at).toISOString(),status,cause}]:[];
 /** The key of a learned pattern (its causes), by which a decline is remembered. */
 const patternKey=r=>digest((Array.isArray(r.learnedPatterns)?r.learnedPatterns:[]).map(x=>String(x?.cause??x?.kind??'')).sort());
 /** A waiting change whose own days have passed: a session it plans or changes (a live prescription that differs from the plan in force, or is new)
  * is dated before today, so adopting it would plan training behind the athlete. A session it only marks as not done is no such change. */
 const daysPassed=(program,proposal,day)=>{const now=new Map(program.weeks.flatMap(w=>w.sessions).map(x=>[x.id,x])),planned=x=>!!x?.prescription&&x.status!=='SKIPPED';
  return proposal.weeks.flatMap(w=>w.sessions).some(x=>{if(!planned(x)||!(x.date<day))return false;const y=now.get(x.id);return !y||y.date!==x.date||!planned(y)||hash(y.prescription)!==hash(x.prescription);});};
 return {
  verify,subjectOf,
  /** First plan: the athlete's intake (closed by the engine), bound to the authenticated athlete; consents are explicit acts (PENDING G07 texts). */
  enroll({actor,intake,consents={},clientRequestId}){
   if(!isObj(actor)||typeof actor.athleteId!=='string'||!actor.athleteId)return fail('UNAUTHENTICATED','No authenticated athlete');
   if(store.tombstoneOf(subjectOf(actor.athleteId)))return fail('GONE','This account was erased; a new account is a new athlete');
   if(store.load(actor.athleteId))return fail('CONFLICT_ALREADY_ENROLLED','This athlete already has a plan; a new plan is a restart');
   if(!isObj(intake))return fail('INVALID_REQUEST','The intake is missing');
   if(syntheticOnly&&(intake.synthetic!==true||intake.purpose!=='SHADOW_REFERENCE'))return fail('SYNTHETIC_ONLY','Only synthetic data is accepted: real collection is not authorized');
   if(consents[PURPOSES.COACHING]!==true)return fail('CONSENT_REQUIRED','Coaching needs the athlete\'s consent',{purpose:PURPOSES.COACHING});
   // The athlete and the generation day are bound by the server (its clock in the plan's offset), never taken from the app.
   const at=now(),day=localIso(at,intake.timezoneOffsetMinutes??0).slice(0,10),bound={...intake,asOf:day,athlete:{...(intake.athlete??{}),id:actor.athleteId},learningConsent:consents[PURPOSES.LEARNING]===true};
   const g=engine.generateProgram(bound);
   if(g.status!=='PROPOSED')return {ok:true,status:g.status,missingInputs:g.missingInputs??[],errors:g.errors??[],reason:g.reason??null,enrolled:false};
   const stamp=new Date(at).toISOString(),doc=seal({schema:CUSTODY_SCHEMA,athleteId:actor.athleteId,version:1,createdAt:stamp,program:g.program,pending:null,reference:null,model:null,
    consents:Object.fromEntries(Object.values(PURPOSES).map(p=>[p,{granted:consents[p]===true,at:stamp}])),rows:[],chain:[],decisions:[],requests:{}});
   const r=store.commit(actor.athleteId,null,doc);if(!r.ok)return fail('CONFLICT_ALREADY_ENROLLED','This athlete already has a plan');
   return {ok:true,status:'PROPOSED',enrolled:true,version:1,programHash:g.program.hash,clientRequestId:clientRequestId??null};
  },
  /** One review. `review` holds only CLIENT_REVIEW_FIELDS; `expectedVersion` the record version the app last saw (optimistic concurrency);
   * `clientRequestId` the idempotency key of this request (a retry returns the stored response). */
  submit({actor,clientRequestId,expectedVersion,review}){
   const o=open(actor);if(!o.ok)return o;const {doc}=o;
   if(typeof clientRequestId!=='string'||!clientRequestId||clientRequestId.length>128)return fail('INVALID_REQUEST','A request id (1 to 128 characters) is required');
   if(!isObj(review))return fail('INVALID_REQUEST','The review is missing');
   const owned=Object.keys(review).filter(k=>ENGINE_OWNED_FIELDS.includes(k)),unknown=Object.keys(review).filter(k=>!CLIENT_REVIEW_FIELDS.includes(k)&&!ENGINE_OWNED_FIELDS.includes(k));
   if(owned.length)return fail('INVALID_REQUEST','These fields are kept by the server and are never accepted from the app',{fields:owned});
   if(unknown.length)return fail('INVALID_REQUEST',`${unknown.length} field${unknown.length>1?'s are':' is'} not part of a review`,{count:unknown.length});
   const requestDigest=hmac(CUSTODY_SCHEMA+'|request|'+(canonical(review)??'null')),seen=doc.requests[clientRequestId];
   if(seen)return seen.requestDigest===requestDigest?{...seen.response,replayed:true}:fail('CONFLICT_IDEMPOTENCY_KEY','This request id was already used for another request');
   if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed since this request was prepared; refresh and send again',{version:doc.version});
   const kind=review.kind;
   if(doc.consents[PURPOSES.COACHING]?.granted!==true)return fail('CONSENT_REQUIRED','Coaching consent was revoked',{purpose:PURPOSES.COACHING});
   if((F08_KINDS.includes(kind)||review.wellbeing||review.wellbeingCheck||review.readiness)&&doc.consents[PURPOSES.HEALTH_SIGNALS]?.granted!==true)return fail('CONSENT_REQUIRED','Reporting how you feel needs your consent for health signals',{purpose:PURPOSES.HEALTH_SIGNALS});
   // The engine input, composed from the stored copies: server id, server clock, the athlete bound, observation ids assigned by the server.
   const at=now(),tz=doc.program.timezoneOffsetMinutes??0,asOf=localIso(at,tz),day=asOf.slice(0,10),eventId=id('ev'),{kind:_k,...payload}=review;
   // Clocks (SEC-V1CPI-07 at the boundary): a screen answered at an instant is read in the plan's offset (the engine reads its local day); a screen
   // from the future is refused.
   if(isObj(payload.eligibility)&&typeof payload.eligibility.assessedAt==='string'&&payload.eligibility.assessedAt.includes('T')){
    const ms=Date.parse(payload.eligibility.assessedAt);if(!Number.isFinite(ms))return fail('INVALID_REQUEST','The screening time is not a time');
    if(ms>at+5*60e3)return fail('INVALID_REQUEST','A screen cannot be answered in the future');
    payload.eligibility={...payload.eligibility,assessedAt:localIso(ms,tz)};
   }
   const observations=Array.isArray(review.observations)?review.observations.map((x,i)=>isObj(x)?{...x,eventId:`ob_${hmac(`${clientRequestId}|${i}`).slice(0,26)}`,athleteId:doc.athleteId}:x):review.observations;
   const input={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',...payload,...(observations!==undefined?{observations}:{}),asOf,weekIndex:weekIndexOf(doc.program,day),event:{id:eventId,kind},
    actualLedger:visible(doc),...(doc.reference?{referenceState:doc.reference}:{}),...(doc.model?{athleteModel:doc.model}:{}),learningConsent:doc.consents[PURPOSES.LEARNING]?.granted===true};
   let r,offer=null;try{r=engine.evaluateProgram(doc.program,input);
    // PCG-V1CIB-F01: a move or a learned rearrangement is the athlete's to apply. The same review is decided without it; that decision stands, and
    // the change waits as an offer (none when the athlete already declined this pattern, or when the decision without the move re-plans the week).
    if(r.proposal&&OFFERED_ACTIONS.includes(r.action)){
     const plain=engine.evaluateProgram(doc.program,input,{withhold:[r.action]});
     if(plain.proposal&&OFFERED_ACTIONS.includes(plain.action))return fail('ENGINE_CONTRACT_VIOLATION','The decision kept a change it was asked to withhold; nothing was kept');
     const key=r.action==='LEARNED_REARRANGEMENT'?patternKey(r):null,declined=key!==null&&(doc.agency?.declined??[]).some(d=>d.kind===r.action&&d.key===key);
     if(!declined&&!(r.action==='MOVE'&&plain.proposal))offer={kind:r.action,proposal:r.proposal,reason:typeof r.reason==='string'?r.reason:null,...(key?{key}:{})};
     r=plain;
    }
   }catch(e){return fail('OPERATIONAL_ERROR','The coach could not decide this request',{cause:e?.constructor?.name??'Error'});}
   // The record must keep every stored row (an absent record is the record unchanged: OBS-FFC-01); only new rows and a correction's annotation pass.
   const after=Array.isArray(r.actualLedger)?r.actualLedger:visible(doc),rec=reconcile(doc,after);
   if(rec.error)return fail('ENGINE_CONTRACT_VIOLATION',`The decision did not keep the stored record (${rec.error}); nothing was kept`);
   const {added,annotations}=rec,decisionId=id('dc');
   // Defence in depth: while the new record holds a hold, no prescription leaves custody, whatever the engine returned.
   const held=holdsOf(after,doc.athleteId,Date.parse(r.referenceState?.asOf??new Date(at).toISOString())).length>0;
   let proposal=r.proposal??null,suppressed=false;if(held&&proposal){proposal=null;suppressed=true;}
   if(held||r.status==='CLINICAL_HUMAN_REQUIRED'||r.status==='HOLD')offer=null;
   const factBound=added.some(x=>isF08Fact(x)||x?.fact==='INTERRUPTION_DECLARED');
   // A change that follows the evidence is applied with its reason, unless it rearranges the days: then it waits too (the generic form of F01).
   const rearranges=!!proposal&&!factBound&&digest(proposal.arrangementSessions??null)!==digest(doc.program.arrangementSessions??null);
   const confirm=!!proposal&&!factBound&&(CONFIRMATION_KINDS.includes(kind)||rearranges);if(confirm)offer=null;
   const entry=entryOf(decisionId,eventId,kind,at,r,{...(suppressed?{suppressed:'HOLD_ON_RECORD'}:{}),...(proposal?{proposalHash:proposal.hash,adoption:confirm?'PENDING':factBound?'APPLIED_WITH_ITS_FACT':'APPLIED_WITH_ITS_EVIDENCE'}:{}),
    ...(offer?{offer:{kind:offer.kind,proposalHash:offer.proposal.hash,reason:offer.reason,adoption:'PENDING'}}:{})});
   let next=append(doc,added,at,annotations);
   const waiting=confirm?{decisionId,kind:'REQUESTED_CHANGE',proposal,basisVersion:doc.version+1}:offer?{decisionId,kind:offer.kind,proposal:offer.proposal,basisVersion:doc.version+1,...(offer.key?{key:offer.key}:{})}:null;
   next={...next,reference:r.referenceState??doc.reference,model:r.updatedModel??doc.model,decisions:[...doc.decisions,...closed(doc,at,'LATER_REVIEW'),entry],
    ...(proposal&&!confirm?{program:proposal}:{}),pending:waiting};
   const response={ok:true,decisionId,eventId,version:doc.version+1,status:r.status,action:r.action,held,suppressed,adoption:entry.adoption??null,...(offer?{offer:{decisionId,kind:offer.kind}}:{}),
    ...(doc.pending?{supersededPending:doc.pending.decisionId}:{}),...(r.unavailable?{unavailable:r.unavailable}:{}),
    observationIds:Array.isArray(observations)?observations.map(x=>x?.eventId??null):[],decision:entry};
   next={...next,requests:remember(doc.requests,clientRequestId,requestDigest,response)};
   const c=commit(doc,next);if(!c.ok)return c;
   return response;
  },
  /** The athlete adopts a pending change (AEC §2 agency, §3.5: only on the current version; a later review supersedes it). */
  accept({actor,decisionId,expectedVersion}){
   const o=open(actor);if(!o.ok)return o;const {doc}=o;
   if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed; refresh',{version:doc.version});
   if(!doc.pending||doc.pending.decisionId!==decisionId)return fail('NOT_PENDING','This change is no longer waiting for you');
   // SEC-V1CIB-01, PCG A-C3: a change prepared before a hold or a consent revocation is never adopted over them (defence in depth: erasure and a
   // revocation also close it). A change whose own days have already passed is closed too: adopting it would rewrite days behind the athlete.
   const at=now(),stamp=new Date(at).toISOString(),today=localIso(at,doc.program.timezoneOffsetMinutes??0).slice(0,10);
   if(doc.consents[PURPOSES.COACHING]?.granted!==true)return fail('CONSENT_REQUIRED','Coaching consent was revoked',{purpose:PURPOSES.COACHING});
   if(holdsOf(visible(doc),doc.athleteId,at).length)return fail('HOLD_ON_RECORD','A hold is on your record: no change to the plan is adopted while it stands');
   if(!validProgram(doc.pending.proposal)||daysPassed(doc.program,doc.pending.proposal,today)){
    const c=commit(doc,{...doc,pending:null,decisions:[...doc.decisions,...closed(doc,at,'ITS_DAYS_PASSED','EXPIRED')]});
    return c.ok?fail('PENDING_EXPIRED','This change was prepared for days that have passed; ask again if you still want it',{version:doc.version+1}):c;}
   const next={...doc,program:doc.pending.proposal,pending:null,decisions:[...doc.decisions,{decisionId:id('dc'),kind:'ADOPTION',of:decisionId,at:stamp,status:'ADOPTED'}]};
   const c=commit(doc,next);return c.ok?{ok:true,version:doc.version+1,programHash:next.program.hash}:c;
  },
  /** The athlete keeps the plan in force instead (allowed only for a change that no recorded fact of theirs requires). */
  decline({actor,decisionId,expectedVersion}){
   const o=open(actor);if(!o.ok)return o;const {doc}=o;
   if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed; refresh',{version:doc.version});
   if(!doc.pending||doc.pending.decisionId!==decisionId)return fail('NOT_PENDING','This change is no longer waiting for you');
   // A-C1: a decline holds. A learned rearrangement the athlete declined is remembered by its pattern and not offered again for it.
   const at=now(),stamp=new Date(at).toISOString(),p=doc.pending,remembered=p.kind==='LEARNED_REARRANGEMENT'&&p.key?{agency:{declined:[...(doc.agency?.declined??[]),{kind:p.kind,key:p.key,at:stamp}].slice(-50)}}:{};
   const next={...doc,...remembered,pending:null,decisions:[...doc.decisions,{decisionId:id('dc'),kind:'ADOPTION',of:decisionId,at:stamp,status:'DECLINED'}]};
   const c=commit(doc,next);return c.ok?{ok:true,version:doc.version+1}:c;
  },
  /** A new plan (F08 Situation 3, restartProgram) from an updated intake and the stored record; the record is carried whole. */
  restart({actor,intake,expectedVersion}){
   const o=open(actor);if(!o.ok)return o;const {doc}=o;
   if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed; refresh',{version:doc.version});
   if(!isObj(intake))return fail('INVALID_REQUEST','The intake is missing');
   if(syntheticOnly&&(intake?.synthetic!==true||intake?.purpose!=='SHADOW_REFERENCE'))return fail('SYNTHETIC_ONLY','Only synthetic data is accepted');
   // SEC-V1CIB-02: a new plan needs the coaching consent in force, as the first plan and every review do.
   if(doc.consents[PURPOSES.COACHING]?.granted!==true)return fail('CONSENT_REQUIRED','Coaching consent was revoked',{purpose:PURPOSES.COACHING});
   // SEC-V1CIB-03: the learning consent of the new plan is the one custody holds, never what the app sends.
   const at=now(),tz=doc.program.timezoneOffsetMinutes??0,asOf=localIso(at,tz),bound={...intake,asOf:asOf.slice(0,10),athlete:{...(intake.athlete??{}),id:doc.athleteId},learningConsent:doc.consents[PURPOSES.LEARNING]?.granted===true};
   const r=engine.restartProgram({intake:bound,record:visible(doc),referenceState:doc.reference,asOf,athleteId:doc.athleteId});
   if(r.status!=='PROPOSED')return {ok:true,status:r.status,reason:r.reason??null,missingInputs:r.missingInputs??[],errors:r.errors??[]};
   const next={...doc,program:r.program,pending:null,reference:null,decisions:[...doc.decisions,...closed(doc,at,'NEW_PLAN'),{decisionId:id('dc'),kind:'RESTART',at:new Date(at).toISOString(),status:'PROPOSED',programHash:r.program.hash}]};
   const c=commit(doc,next);return c.ok?{ok:true,status:'PROPOSED',version:doc.version+1,programHash:r.program.hash}:c;
  },
  /** Consent changes are explicit acts; revoking health signals stops new F08 entries (what is recorded stays under the retention policy). */
  setConsent({actor,purpose,granted,expectedVersion}){
   const o=open(actor);if(!o.ok)return o;const {doc}=o;
   if(!Object.values(PURPOSES).includes(purpose)||typeof granted!=='boolean')return fail('INVALID_REQUEST','Unknown purpose or answer');
   if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed; refresh',{version:doc.version});
   // A-C3: revoking the coaching consent closes a change that was waiting (it is never adopted after the revocation, even if consent returns).
   const ms=now(),at=new Date(ms).toISOString(),closes=purpose===PURPOSES.COACHING&&granted===false&&!!doc.pending;
   const next={...doc,consents:{...doc.consents,[purpose]:{granted,at}},...(closes?{pending:null,decisions:[...doc.decisions,...closed(doc,ms,'CONSENT_REVOKED')]}:{})};
   const c=commit(doc,next);return c.ok?{ok:true,version:doc.version+1}:c;
  },
  /** SEC-V1CPI-06 / C6: erases the content of F08 facts and of every row that references them (cross-row references, transitively); each erased
   * slot keeps its digest in the chain, and one erasure marker is appended, which the core reads as a standing hold of unknown cause. */
  eraseHealthFacts({actor,eventIds,expectedVersion}){
   const o=open(actor);if(!o.ok)return o;const {doc}=o;
   if(expectedVersion!==doc.version)return fail('CONFLICT_STALE_VERSION','The record changed; refresh',{version:doc.version});
   if(!Array.isArray(eventIds)||!eventIds.length||eventIds.some(x=>typeof x!=='string'))return fail('INVALID_REQUEST','Name the facts to erase');
   const rows=doc.rows,gone=new Set(eventIds);
   if(!rows.some(r=>r&&isF08Fact(r)&&gone.has(r.eventId)))return fail('NOT_FOUND','No such health fact on record');
   for(let changed=true;changed;){changed=false;for(const r of rows)if(r&&isF08Fact(r)&&!gone.has(r.eventId)&&referencesOf(r).some(x=>gone.has(x))){gone.add(r.eventId);changed=true;}}
   const erased=[],chain=doc.chain.map((c,i)=>{const r=rows[i];if(r&&isF08Fact(r)&&gone.has(r.eventId)){erased.push(r.eventId);return {...c,erased:true};}return c;});
   const at=now(),tz=doc.program.timezoneOffsetMinutes??0,marker=erasureFact({athleteId:doc.athleteId,eventId:id('er'),asOf:localIso(at,tz),erased});
   let next={...doc,rows:rows.map((r,i)=>chain[i].erased?null:r),chain};next=append(next,[marker],at);
   // SEC-V1CIB-01, A-C3: a change that was waiting is closed by the erasure (the marker is a hold; nothing prepared before it is adopted over it).
   // PCG B-C1 (C8 enters the erasure): the decision entries and the stored responses of the erased events lose their content too (the reason, the
   // sign names, the guidance); the entry keeps its id and time only. The cached reference of an erased event goes (the marker holds without it).
   const scrub=d=>gone.has(d.eventId)?{decisionId:d.decisionId,eventId:d.eventId,kind:'ERASED',at:d.at,status:'ERASED'}:d;
   const requests=Object.fromEntries(Object.entries(doc.requests).filter(([,q])=>!gone.has(q?.response?.eventId)));
   next={...next,pending:null,requests,...(gone.has(doc.reference?.pending?.eventId)?{reference:null}:{}),
    decisions:[...doc.decisions.map(scrub),...closed(doc,at,'HEALTH_FACTS_ERASED'),{decisionId:id('dc'),kind:'ERASURE',at:new Date(at).toISOString(),status:'ERASED',count:erased.length}]};
   const c=commit(doc,next);return c.ok?{ok:true,version:doc.version+1,erased:erased.length}:c;
  },
  /** Account erasure: the document goes; a tombstone (pseudonymous subject, time, scope) refuses every later write for this athlete id. */
  eraseAccount({actor}){
   const o=open(actor);if(!o.ok&&o.error.code!=='INTEGRITY_FAILURE')return o;
   store.remove(actor.athleteId);store.tombstone(subjectOf(actor.athleteId),{scope:'ACCOUNT',erasedAt:new Date(now()).toISOString()});
   return {ok:true,erased:'ACCOUNT'};
  },
  /** Read access for the views: the verified document, or the error the app must show (never an empty plan for a technical failure). */
  read({actor}){return open(actor);},
  visible,
 };
}
/** The F08 event ids a row references (the cross-row references an erasure must follow, Security C6). */
export function referencesOf(r){
 const out=[];const add=x=>{if(typeof x==='string')out.push(x);};
 if(r?.fact===WELLBEING_CHECKED){add(r.episode);for(const k of Object.keys(r.check?.kinds??{}))add(k);}
 if(r?.fact===WELLBEING_DECLARED){const w=r.wellbeing??{};for(const m of [w.takenFrom,w.chainFrom])for(const v of Object.values(m??{}))add(v);add(w.supersedes);for(const v of [].concat(w.supersedesAll??[],w.of??[]))add(v);for(const list of Object.values(w.carried??{}))for(const c of list??[])add(c?.episode);}
 if(r?.fact===READINESS_DECLARED){for(const h of [].concat(r.readiness?.hold??[]))add(h?.eventId);}
 return out;
}
