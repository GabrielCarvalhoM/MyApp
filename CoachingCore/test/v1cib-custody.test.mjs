// V1 Coaching Integration Boundary: RECORD-CUSTODY and the app boundary (src/boundary). Every requirement of the Founder's RECORD-CUSTODY list has a
// directed test: opaque server ids, athlete binding and authorization, order and continuity, prefix-only updates, tamper and truncation detection,
// idempotent retries, optimistic concurrency, the server clock, persistence across a restart, multi-device use, retention and erasure, consents,
// fail-closed reads, the hold enforced in custody, and the client states. Synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,F,HYBRID,NO,XNO,RNO,READY,ELIG,addDays,live,clone} from './v1cib-helpers.mjs';

const B=p=>import(pathToFileURL(path.join(ROOT,'CoachingCore/src/boundary',p)).href);
const {createCustody,CLIENT_REVIEW_FIELDS,ENGINE_OWNED_FIELDS,referencesOf}=await B('custody.mjs');
const {memoryStore,fileStore}=await B('store.mjs');
const {createBoundary}=await B('api.mjs');
const {CLIENT_STATES:S}=await B('views.mjs');
const {NEVER_OUTBOUND,DATA_INVENTORY,pushTextOf}=await B('inventory.mjs');
const Engine=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const V=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);

const START='2026-11-09',TZ='-03:00';
const at=(w,d,hm='20:00')=>Date.parse(`${addDays(START,w*7+d)}T${hm}:00${TZ}`);
const KEY=Buffer.from('v1cib-test-key-not-a-secret-0001');
/** A server with a controlled clock and a store; `log` collects the operational telemetry. */
function server({store=memoryStore(),engine}={}){
 const clock={t:at(-1,5,'12:00')},logs=[];
 const custody=createCustody({store,key:KEY,now:()=>clock.t,...(engine?{engine}:{})}),api=createBoundary({custody,now:()=>clock.t,log:x=>logs.push(x)});
 return {store,custody,api,clock,logs,set:(w,d,hm)=>{clock.t=at(w,d,hm);}};
}
const ME={athleteId:'ath-v1cib-1'},OTHER={athleteId:'ath-v1cib-2'};
const CONSENTS={COACHING:true,HEALTH_SIGNALS:true,LEARNING:false};
let n=0;const rid=()=>`req-${++n}`;
function enrolled(opts){const s=server(opts);const e=s.api.onboard({actor:ME,intake:HYBRID(),consents:CONSENTS,clientRequestId:rid()});assert.ok(e.ok&&e.enrolled,JSON.stringify(e));return s;}
const v=s=>s.api.plan({actor:ME}).view.version;
const elig=s=>({...ELIG(new Date(s.clock.t-3*3600e3).toISOString().slice(0,10)),assessedAt:new Date(s.clock.t).toISOString()});
const weekReports=(s,w)=>{const p=s.custody.read({actor:ME}).doc.program;return p.weeks[w].sessions.filter(x=>live(x)&&!x.optional).map(x=>({sessionId:x.id,occurredOn:x.date,completed:true,minutes:x.prescription.durationMinutes,
 ...(x.sport==='STRENGTH'?{exercises:x.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));};
const checkIn=(s,w,extra={})=>{s.set(w,6,'20:00');return s.api.weeklyCheckIn({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),reports:weekReports(s,w),...extra});};
const signHold=s=>{s.set(1,1,'08:00');const r=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W7]:true},intent:'REST',days:5}});assert.equal(r.ok,true,JSON.stringify(r.error));return r;};

test('custody binds the athlete and the clock: the program is the authenticated athlete\'s, whatever the intake says; the app cannot set asOf, event ids, the record or the reference',()=>{
 const s=server(),intake=HYBRID();intake.athlete.id='someone-else';
 const e=s.api.onboard({actor:ME,intake,consents:CONSENTS,clientRequestId:rid()});assert.ok(e.ok&&e.enrolled);
 const doc=s.custody.read({actor:ME}).doc;assert.equal(doc.program.athleteId,ME.athleteId);assert.equal(doc.createdAt,new Date(s.clock.t).toISOString(),'stamped by the server clock');
 for(const f of ENGINE_OWNED_FIELDS){const r=s.custody.submit({actor:ME,clientRequestId:rid(),expectedVersion:1,review:{kind:'WEEKLY_REVIEW',[f]:f==='actualLedger'?[]:'x'}});assert.equal(r.error?.code,'INVALID_REQUEST',f);}
 const u=s.custody.submit({actor:ME,clientRequestId:rid(),expectedVersion:1,review:{kind:'WEEKLY_REVIEW',notes:'free text'}});assert.equal(u.error.code,'INVALID_REQUEST');assert.ok(!JSON.stringify(u).includes('free text'),'a refused field is never echoed');
 assert.ok(CLIENT_REVIEW_FIELDS.includes('observations')&&!CLIENT_REVIEW_FIELDS.includes('actualLedger'));
});
test('custody: another athlete never reads or writes this record; unauthenticated calls are refused',()=>{
 const s=enrolled();
 assert.equal(s.api.plan({actor:OTHER}).error.code,'NOT_ENROLLED');
 assert.equal(s.api.plan({actor:{}}).error.code,'UNAUTHENTICATED');
 // A record moved under another id is refused (binding is checked on the stored document itself).
 s.store.setRaw(OTHER.athleteId,s.store.raw(ME.athleteId));assert.equal(s.custody.read({actor:OTHER}).error.code,'FORBIDDEN');
});
test('custody assigns opaque ids: the event id and every session report id are the server\'s; the athlete id of a report is the server\'s too',()=>{
 const s=enrolled(),r=checkIn(s,0);
 assert.ok(r.ok,JSON.stringify(r.error));assert.match(r.eventId,/^ev_[0-9a-f]{26}$/);assert.ok(r.observationIds.every(x=>/^ob_[0-9a-f]{26}$/.test(x)));
 const rows=s.custody.read({actor:ME}).doc.rows.filter(x=>x&&!x.fact);assert.ok(rows.length&&rows.every(x=>x.athleteId===ME.athleteId&&/^ob_/.test(x.eventId)));
});
test('custody: a retry of the same request returns the stored response and changes nothing; the same key with another request is refused',()=>{
 const s=enrolled();s.set(0,6,'20:00');
 const req={actor:ME,clientRequestId:'retry-1',expectedVersion:1,eligibility:elig(s),reports:weekReports(s,0)};
 const a=s.api.weeklyCheckIn(req),b=s.api.weeklyCheckIn(req);
 assert.ok(a.ok&&b.ok&&b.replayed);assert.equal(b.decisionId,a.decisionId);assert.equal(v(s),2,'one version only');
 const c=s.api.weeklyCheckIn({...req,reports:[]});assert.equal(c.error.code,'CONFLICT_IDEMPOTENCY_KEY');
});
test('custody: concurrent updates from two devices: the second one, prepared on the same version, is refused and succeeds after a refresh',()=>{
 const s=enrolled();s.set(0,2,'20:00');
 const ver=v(s),reports=weekReports(s,0).filter(x=>x.occurredOn<=addDays(START,1));
 const phone=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver,eligibility:elig(s),...reports[0]});
 const watch=s.api.logRun({actor:ME,clientRequestId:'watch-1',expectedVersion:ver,eligibility:elig(s),...reports[1]});
 assert.ok(phone.ok);assert.equal(watch.error.code,'CONFLICT_STALE_VERSION');assert.equal(watch.state,S.OPERATIONAL_ERROR);
 const again=s.api.logRun({actor:ME,clientRequestId:'watch-1',expectedVersion:v(s),eligibility:elig(s),...reports[1]});assert.ok(again.ok,'the refused attempt was not stored, so the same key now goes through');
});
test('custody keeps order and continuity: rows are appended with a sequence and a keyed chain; the app\'s record can never shrink, reorder or change it',()=>{
 const s=enrolled();checkIn(s,0);checkIn(s,1);
 const doc=s.custody.read({actor:ME}).doc;assert.ok(doc.chain.length>=10);assert.deepEqual(doc.chain.map(c=>c.seq),doc.chain.map((_,i)=>i+1));
 // An engine that returned a record that does not extend the stored one would be refused, and nothing kept.
 const shrink=enrolled({engine:{...Engine,evaluateProgram:(p,i)=>{const r=Engine.evaluateProgram(p,i);return {...r,actualLedger:(r.actualLedger??i.actualLedger).slice(1)};}}});checkIn(shrink,0);
 const r=checkIn(shrink,1);assert.equal(r.error?.code,'ENGINE_CONTRACT_VIOLATION');assert.equal(r.state,S.INTEGRITY_FAILURE);
});
test('custody: a correction of a session report keeps the original on record, annotated as superseded (an append-only annotation entry), and the chain verifies',()=>{
 const s=enrolled();s.set(0,1,'21:00');const [run]=weekReports(s,0).filter(x=>x.occurredOn===addDays(START,1));
 const first=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),...run,minutes:20});assert.ok(first.ok,JSON.stringify(first.error));
 s.set(0,1,'22:00');const fix=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),...run,minutes:run.minutes,correctionOf:first.observationIds[0],correctedAt:new Date(s.clock.t).toISOString()});
 assert.ok(fix.ok,JSON.stringify(fix.error));
 const doc=s.custody.read({actor:ME}).doc,orig=doc.rows.find(x=>x?.eventId===first.observationIds[0]);
 assert.equal(orig.superseded,true,'the original stays, annotated');assert.equal(orig.supersededBy,fix.observationIds[0]);
 assert.ok(doc.chain.some(c=>Number.isInteger(c.of)),'an annotation entry');assert.equal(s.custody.verify(doc),null);
});
test('custody order independence: the same journey through custody (arrival order) and through the conforming client (the engine\'s own order) gives the same decisions and the same sessions',async()=>{
 // V1 Final Closure: this journey uses the temporary reduction (F08 Situation 1), which V1 does not offer (test/v1fc-scope.test.mjs). It runs on the
 // research engine (r6-index) to keep the custody property over those row kinds; custody's default engine is the V1 one.
 const {timeline,doneWeek:dw}=await import('./v1cib-helpers.mjs');
 const s=enrolled({engine:Engine}),t=timeline();
 const sessions=p=>p.weeks.map(w=>w.sessions.map(x=>`${x.id}|${x.date}|${x.status??'PLANNED'}|${V.hash(x.prescription??null)}`));
 const strip=o=>o.map(({eventId,athleteId,...x})=>x);
 const steps=[[0,6,'20:00','WEEKLY_REVIEW',t=>({observations:dw(t,0)})],[1,1,'08:00','NOT_FEELING_100',()=>({wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:5}})],
  [1,6,'20:00','WEEKLY_REVIEW',t=>({observations:dw(t,1),wellbeingCheck:{warningSigns:NO('MILD_ILLNESS'),exerciseResponse:XNO('MILD_ILLNESS'),improved:true}})],
  [2,2,'08:00','NOT_FEELING_100',()=>({wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W7]:true},intent:'REST',days:4}})],
  [2,4,'09:00','READINESS_DECLARATION',()=>({readiness:READY()})],[2,6,'20:00','WEEKLY_REVIEW',t=>({observations:dw(t,2).filter(o=>o.occurrenceDate>addDays(START,18))})]];
 for(const [w,d,hm,kind,make] of steps){
  s.set(w,d,hm);const x=make(t),screen={...ELIG(addDays(START,w*7+d)),assessedAt:`${addDays(START,w*7+d)}T${hm}:00${TZ}`};
  const a=t.step(w,d,kind,{...(x.observations?{observations:x.observations}:{}),...(x.wellbeing?{wellbeing:x.wellbeing}:{}),...(x.wellbeingCheck?{check:x.wellbeingCheck}:{}),...(x.readiness?{readiness:x.readiness}:{}),eligibility:screen},hm);
  const b=s.custody.submit({actor:ME,clientRequestId:rid(),expectedVersion:v(s),review:{kind,...x,...(x.observations?{observations:strip(x.observations)}:{}),eligibility:screen}});
  assert.ok(b.ok,JSON.stringify(b.error));assert.equal(b.status,a.status,`${kind} w${w}: ${a.reason}`);assert.equal(b.action,a.action,kind);
  if(a.proposal&&b.adoption==='PENDING')s.custody.accept({actor:ME,decisionId:b.decisionId,expectedVersion:v(s)});
  assert.deepEqual(sessions(s.custody.read({actor:ME}).doc.program),sessions(t.p),`${kind} w${w}: the same sessions`);
 }
});
test('custody detects tampering: an edited row, a row whose keyless hash was recomputed, a removed hold row, a truncated tail or an edited program is an integrity failure, never planned on',()=>{
 const mk=()=>{const s=enrolled();checkIn(s,0);signHold(s);return s;};
 const edits=[['an edited row',d=>{const i=d.rows.findIndex(x=>x&&!x.fact);d.rows[i].actual.minutes+=30;}],
  ['a hold row moved earlier and re-sealed by its keyless hash',d=>{const i=d.rows.findIndex(x=>x?.fact===F.CLINICAL_HOLD);const {rowHash,...x}=d.rows[i];x.declaredAt='2026-11-01T08:00:00-03:00';d.rows[i]={...x,rowHash:V.hash(x)};}],
  ['the hold row removed',d=>{const i=d.rows.findIndex(x=>x?.fact===F.CLINICAL_HOLD);d.rows.splice(i,1);d.chain.splice(i,1);}],
  ['the tail truncated',d=>{d.rows.pop();d.chain.pop();}],
  ['the program edited and its hash recomputed',d=>{const x=d.program.weeks[3].sessions.find(y=>y.prescription&&y.sport==='RUN');x.prescription.durationMinutes+=20;delete d.program.hash;d.program.hash=Engine.programHash(d.program);}],
  ['the reference re-sealed clean',d=>{d.reference={...d.reference,pending:null};}]];
 for(const [label,edit] of edits){
  const s=mk(),doc=JSON.parse(s.store.raw(ME.athleteId));edit(doc);s.store.setRaw(ME.athleteId,JSON.stringify(doc));
  const p=s.api.plan({actor:ME});assert.equal(p.ok,false,label);assert.equal(p.state,S.INTEGRITY_FAILURE,label+': '+JSON.stringify(p.error));assert.equal(p.view,undefined,label+': no sessions, no rest rows');
  const w=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:3,eligibility:elig(s),sessionId:'x',occurredOn:'2026-11-17',completed:true,minutes:30});assert.equal(w.error.code,'INTEGRITY_FAILURE',label);
 }
 // A corrupted file is the same failure (never an empty plan).
 const s=mk();s.store.setRaw(ME.athleteId,'{not json');assert.equal(s.api.plan({actor:ME}).state,S.INTEGRITY_FAILURE);
});
test('custody limit, shown: an operator-level rollback of the whole sealed document to an earlier version verifies (the production store needs an external monotonic version, PENDING)',()=>{
 const s=enrolled();checkIn(s,0);const snapshot=s.store.raw(ME.athleteId);signHold(s);
 s.store.setRaw(ME.athleteId,snapshot);
 assert.equal(s.api.plan({actor:ME}).ok,true,'documented residual: the document seal cannot see a whole-document rollback');
});
test('custody enforces the hold (CF-OBS-1 two layers): the app never holds the reference, so every review stays blocked and no prescription leaves custody until the readiness declaration',()=>{
 const s=enrolled();checkIn(s,0);const h=signHold(s);
 assert.equal(h.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(h.view.state,S.BLOCKED);assert.equal(h.view.hold.exit,'READINESS_DECLARATION');
 assert.ok(h.view.week.sessions.every(x=>x.prescription===null&&x.executable===false),'no prescription while the hold stands');
 for(const [w,d] of [[1,3],[1,6],[2,6]]){s.set(w,d,'20:00');const r=s.api.weeklyCheckIn({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),reports:[]});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.view.state,S.BLOCKED);}
 s.set(3,0,'09:00');const ready=s.api.declareReadiness({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),readiness:READY()});
 assert.equal(ready.status,'MODIFY',ready.decision?.reason);assert.equal(ready.adoption,'APPLIED_WITH_ITS_FACT');assert.equal(ready.view.state,S.RETURNING);
 assert.ok(ready.view.week.sessions.some(x=>x.executable),'the restart is executable');
});
test('custody defence in depth: an engine that returned a prescription over a standing hold would have it suppressed, recorded as suppressed, and the plan unchanged',()=>{
 let leak=false;const engine={...Engine,evaluateProgram:(p,i)=>{const r=Engine.evaluateProgram(p,i);if(!leak||r.status!=='CLINICAL_HUMAN_REQUIRED')return r;return {...r,status:'MODIFY',action:'KEEP',proposal:p};}};
 const s=enrolled({engine});checkIn(s,0);signHold(s);leak=true;const before=s.custody.read({actor:ME}).doc.program.hash;
 s.set(1,3,'20:00');const r=s.api.weeklyCheckIn({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),reports:[]});
 assert.equal(r.suppressed,true);assert.equal(r.decision.suppressed,'HOLD_ON_RECORD');assert.equal(s.custody.read({actor:ME}).doc.program.hash,before);assert.equal(r.view.state,S.BLOCKED);
});
test('custody C8: a warning sign answered during a hold leaves a durable, minimised trace: the closed sign names, the guidance level, the event id and the time, no free text',()=>{
 const s=enrolled();checkIn(s,0);signHold(s);s.set(1,3,'09:00');
 const r=s.api.wellbeingCheck({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),check:{warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W2]:true}}});
 const d=s.custody.read({actor:ME}).doc.decisions.find(x=>x.decisionId===r.decisionId);
 assert.deepEqual(d.warningSigns,[F.WARNING_SIGNS.W2]);assert.equal(d.guidance.level,'URGENT_CARE_ADVISED');assert.match(d.eventId,/^ev_/);assert.ok(d.at);
 assert.deepEqual(Object.keys(d).sort(),['action','at','decisionId','eventId','guidance','kind','missingInputs','planValidity','question','reason','status','warningSigns'].sort(),'a closed entry');
});
test('custody keeps everything across a restart of the server: a file store reopened by a new process gives the same verified record and continues',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'v1cib-store-'));
 try{
  const a=enrolled({store:fileStore(dir)});checkIn(a,0);checkIn(a,1);const before=a.api.plan({actor:ME}).view;
  const b=server({store:fileStore(dir)});b.clock.t=a.clock.t;const after=b.api.plan({actor:ME}).view;
  assert.deepEqual(after,before,'the same view after the restart');
  const r=checkIn(b,2);assert.ok(r.ok,JSON.stringify(r.error));assert.equal(r.version,before.version+1);
 }finally{for(const f of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,f));fs.rmdirSync(dir);}
});
test('custody consents: coaching needs consent; health signals need their own; revoking them stops new reports of how the athlete feels, and the rest goes on',()=>{
 const s=server();assert.equal(s.api.onboard({actor:ME,intake:HYBRID(),consents:{},clientRequestId:rid()}).error.code,'CONSENT_REQUIRED');
 const t=enrolled();checkIn(t,0);
 assert.ok(t.api.setConsent({actor:ME,purpose:'HEALTH_SIGNALS',granted:false,expectedVersion:v(t)}).ok);
 t.set(1,1,'08:00');const r=t.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:v(t),eligibility:elig(t),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}});
 assert.equal(r.error.code,'CONSENT_REQUIRED');assert.equal(checkIn(t,1).ok,true,'training reports go on');
});
test('custody: synthetic data only; real collection is not authorized',()=>{
 const s=server(),intake=HYBRID();delete intake.synthetic;assert.equal(s.api.onboard({actor:ME,intake,consents:CONSENTS,clientRequestId:rid()}).error.code,'SYNTHETIC_ONLY');
});
test('custody erasure of health facts (SEC-V1CPI-06, C6): a report and every row that references it lose their content, the chain still verifies, and the core reads a hold of unknown cause until a readiness declaration',()=>{
 // V1 Final Closure: this journey uses the temporary reduction (F08 Situation 1), which V1 does not offer (test/v1fc-scope.test.mjs). It runs on the
 // research engine (r6-index) to keep the custody property over those row kinds; custody's default engine is the V1 one.
 const s=enrolled({engine:Engine});checkIn(s,0);s.set(1,1,'08:00');
 const rep=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4}});assert.ok(rep.ok);
 s.set(1,5,'09:00');const chk=s.api.wellbeingCheck({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),check:{warningSigns:NO('NEED_REST'),improved:true}});assert.ok(chk.ok,JSON.stringify(chk.error));
 const doc=s.custody.read({actor:ME}).doc,report=doc.rows.find(x=>x?.fact===F.WELLBEING_DECLARED);
 const refs=doc.rows.filter(x=>x&&referencesOf(x).includes(report.eventId));assert.ok(refs.length>=1,'the check references the report');
 const e=s.api.eraseHealthFacts({actor:ME,eventIds:[report.eventId],expectedVersion:v(s)});assert.ok(e.ok,JSON.stringify(e.error));assert.ok(e.erased>=2,'the report and its check');
 const after=s.custody.read({actor:ME}).doc;assert.equal(s.custody.verify(after),null,'the chain verifies with the erased slots');
 assert.ok(!JSON.stringify(after.rows).includes(report.eventId+'"'+',"athleteId"')&&!after.rows.some(x=>x&&x.eventId===report.eventId),'no content of the erased report');
 assert.equal(after.rows.filter(x=>x?.fact===F.ERASED_F08).length,1);assert.equal(e.view.state,S.BLOCKED,'an erased fact is never read as absent');
 s.set(1,6,'09:00');const ready=s.api.declareReadiness({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),readiness:READY()});assert.equal(ready.status,'MODIFY',ready.decision?.reason);
});
test('custody account erasure: the record goes, a tombstone refuses every later write for that athlete, and a device that synchronises old data cannot bring it back',()=>{
 const s=enrolled();checkIn(s,0);
 assert.ok(s.api.eraseAccount({actor:ME}).ok);assert.equal(s.store.raw(ME.athleteId),null);
 assert.equal(s.api.plan({actor:ME}).state,S.NO_DATA);
 assert.equal(s.api.onboard({actor:ME,intake:HYBRID(),consents:CONSENTS,clientRequestId:rid()}).error.code,'GONE');
 assert.equal(s.custody.submit({actor:ME,clientRequestId:rid(),expectedVersion:2,review:{kind:'WEEKLY_REVIEW',observations:[]}}).error.code,'GONE');
 const tomb=JSON.stringify(s.store.tombstoneOf(s.custody.subjectOf(ME.athleteId)));assert.ok(!tomb.includes(ME.athleteId),'the tombstone holds no athlete id');
});
test('boundary adoption (AEC §2, §3.5): a change that no recorded fact requires waits for the athlete (accept or keep); a later review supersedes it; a change that the athlete\'s own report requires is applied with it',()=>{
 // V1 Final Closure: this journey uses the temporary reduction (F08 Situation 1), which V1 does not offer (test/v1fc-scope.test.mjs). It runs on the
 // research engine (r6-index) to keep the custody property over those row kinds; custody's default engine is the V1 one.
 const s=enrolled({engine:Engine});checkIn(s,0);s.set(1,1,'08:00');
 const ch=s.api.updateAvailability({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),changes:{runDays:[0,2,4]}});
 assert.equal(ch.status,'MODIFY',ch.decision?.reason);assert.equal(ch.adoption,'PENDING');assert.equal(ch.view.state,S.PENDING_CONFIRMATION);
 const kept=s.custody.read({actor:ME}).doc.program.hash;
 assert.ok(s.api.decline({actor:ME,decisionId:ch.decisionId,expectedVersion:v(s)}).ok);assert.equal(s.custody.read({actor:ME}).doc.program.hash,kept,'declined: the plan in force stays');
 const ch2=s.api.updateAvailability({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),changes:{runDays:[0,2,4]}});
 const ok=s.api.accept({actor:ME,decisionId:ch2.decisionId,expectedVersion:v(s)});assert.ok(ok.ok);assert.notEqual(s.custody.read({actor:ME}).doc.program.hash,kept);
 s.set(1,2,'08:00');const rep=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}});
 assert.equal(rep.adoption,'APPLIED_WITH_ITS_FACT');assert.equal(rep.view.state,S.REDUCED);
});
test('boundary client states: valid plan, a question (no projected session executable), reduced, returning, blocked, integrity failure, operational error, no data; a technical failure is never a rest day',()=>{
 // V1 Final Closure: this journey uses the temporary reduction (F08 Situation 1), which V1 does not offer (test/v1fc-scope.test.mjs). It runs on the
 // research engine (r6-index) to keep the custody property over those row kinds; custody's default engine is the V1 one.
 const s=enrolled({engine:Engine});assert.equal(s.api.plan({actor:ME}).view.state,S.VALID_PLAN);
 checkIn(s,0);s.set(1,1,'08:00');
 const ask=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:{...elig(s),assessedAt:'2026-10-01'},sessionId:'x',occurredOn:'2026-11-17',completed:true,minutes:30});
 assert.equal(ask.status,'ASK');assert.equal(ask.view.state,S.NEEDS_INPUT);assert.ok(ask.view.week.sessions.every(x=>!x.executable),'nothing is executable while a question stands');
 assert.ok(ask.view.week.sessions.filter(x=>x.date>=ask.view.today).every(x=>x.projected),'the sessions ahead are a projection');
 s.set(1,2,'08:00');const red=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}});
 assert.equal(red.view.state,S.REDUCED,red.decision?.reason);
 s.set(1,5,'09:00');const back=s.api.wellbeingCheck({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),check:{warningSigns:NO('NEED_REST'),improved:true}});
 assert.equal(back.view.state,S.RETURNING,back.decision?.reason);
 const broken=enrolled({engine:{...Engine,evaluateProgram:()=>{throw new TypeError('boom');}}});
 const err=broken.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:1,eligibility:elig(broken),sessionId:'x',occurredOn:'2026-11-09',completed:true,minutes:30});
 assert.equal(err.state,S.OPERATIONAL_ERROR);assert.equal(err.view,undefined,'no sessions: never a rest day');
 assert.equal(server().api.plan({actor:ME}).state,S.NO_DATA);
 assert.ok(Object.values(S).includes('NOT_SYNCED'),'the app\'s own offline state is part of the contract');
});
test('boundary telemetry and push (C4, SEC-V1CP-17): across a journey with reports, a hold, a sign and a declaration, no log record and no push text holds a health-derived word or field',()=>{
 const s=enrolled();checkIn(s,0);signHold(s);s.set(1,3,'09:00');
 s.api.wellbeingCheck({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),check:{warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W3]:true}}});
 s.set(2,0,'09:00');const r=s.api.declareReadiness({actor:ME,clientRequestId:rid(),expectedVersion:v(s),eligibility:elig(s),readiness:READY()});
 const text=JSON.stringify(s.logs);
 for(const w of NEVER_OUTBOUND)assert.ok(!text.toLowerCase().includes(w.toLowerCase()),`no "${w}" in telemetry: ${text.slice(0,300)}`);
 assert.ok(s.logs.length>=4&&s.logs.every(x=>Object.keys(x).every(k=>['op','ok','code','version','category','decisionId'].includes(k))));
 for(const st of ['MODIFY','CLINICAL_HUMAN_REQUIRED','ASK','KEEP','HOLD']){const p=pushTextOf({status:st});if(p)for(const w of NEVER_OUTBOUND)assert.ok(!p.toLowerCase().includes(w.toLowerCase()));}
 assert.equal(pushTextOf({status:'CLINICAL_HUMAN_REQUIRED'}),pushTextOf({status:'MODIFY'}),'a hold reads as any change on the lock screen');
 assert.ok(DATA_INVENTORY.length>=15&&DATA_INVENTORY.filter(x=>x.class==='HEALTH'||x.class==='HEALTH_DERIVED').every(x=>x.egress==='NONE'));
 assert.ok(r.ok);
});
