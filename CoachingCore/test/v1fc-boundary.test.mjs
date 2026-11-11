// CoachingCore V1 Final Closure (Founder request of 2026-11-11): the boundary. Directed tests of the four Security findings left open by the interrupted
// integration mission (SEC-V1CIB-01..04), of the PCG conditions on adoption (PCG-V1CIB-F01, A-C1..A-C3, B-C1) and of the V1 scope as the app meets it.
// Synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {ROOT,F,HYBRID,NO,READY,ELIG,addDays,live} from './v1cib-helpers.mjs';
import {EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const I=p=>import(pathToFileURL(path.join(ROOT,'CoachingCore/src',p)).href);
const {createCustody,OFFERED_ACTIONS}=await I('boundary/custody.mjs');
const {memoryStore}=await I('boundary/store.mjs');
const {createBoundary}=await I('boundary/api.mjs');
const {CLIENT_STATES:S,V1_SERVER_STATES}=await I('boundary/views.mjs');
const V1=await I('v1-index.mjs');
const Research=await I('r6-index.mjs');
const {canonical}=await I('value.mjs');

const TZ='-03:00',KEY=Buffer.from('v1fc-test-key-not-a-secret-0001');
const ME={athleteId:'ath-v1fc-1'},CONSENTS={COACHING:true,HEALTH_SIGNALS:true,LEARNING:false};
let n=0;const rid=()=>`v1fc-${++n}`;
/** A server with a controlled clock over a plan that starts on `start`. */
function server({start='2026-11-09',intake=HYBRID(),consents=CONSENTS,engine,enrollAt=-2}={}){
 const at=(w,d,hm='20:00')=>Date.parse(`${addDays(start,w*7+d)}T${hm}:00${TZ}`),clock={t:Date.parse(`${addDays(start,enrollAt)}T12:00:00${TZ}`)},store=memoryStore();
 const custody=createCustody({store,key:KEY,now:()=>clock.t,...(engine?{engine}:{})}),api=createBoundary({custody,now:()=>clock.t});
 const s={store,custody,api,clock,start,set:(w,d,hm)=>{clock.t=at(w,d,hm);}};
 const e=api.onboard({actor:ME,intake,consents,clientRequestId:rid()});assert.ok(e.ok&&e.enrolled,JSON.stringify(e));return s;
}
const doc=s=>s.custody.read({actor:ME}).doc,ver=s=>doc(s).version;
const elig=s=>({...ELIG(new Date(s.clock.t-3*3600e3).toISOString().slice(0,10)),assessedAt:new Date(s.clock.t).toISOString()});
const reportOf=x=>({sessionId:x.id,occurredOn:x.date,completed:true,minutes:x.prescription.durationMinutes,
 ...(x.sport==='STRENGTH'?{exercises:x.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}});
const weekReports=(s,w,keep=()=>true)=>doc(s).program.weeks[w].sessions.filter(x=>live(x)&&!x.optional&&keep(x)).map(reportOf);
const checkIn=(s,w)=>{s.set(w,6,'20:00');const r=s.api.weeklyCheckIn({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),reports:weekReports(s,w)});assert.ok(r.ok,JSON.stringify(r.error));return r;};
const signHold=s=>{const r=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W7]:true},intent:'REST',days:5}});assert.equal(r.ok,true,JSON.stringify(r.error));return r;};
/** A new plan's intake: the same athlete facts, starting the Monday after the server's day, screened today. */
const newPlan=(s,extra={})=>{const today=new Date(s.clock.t-3*3600e3).toISOString().slice(0,10),dow=(new Date(today+'T00:00:00Z').getUTCDay()+6)%7,h=HYBRID();return {...h,...extra,asOf:today,startDate:addDays(today,7-dow),athlete:{...h.athlete,eligibility:ELIG(today),pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};};
const change=s=>s.api.updateAvailability({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),changes:{runDays:[0,2,4]}});

// ---------- V1 scope at the boundary ----------
test('V1 scope: "not 100%" with every warning sign answered no keeps the plan as it is, says so as data, and records no temporary-reduction fact',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const before=doc(s).program.hash;
 const r=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4}});
 assert.equal(r.ok,true);assert.equal(r.status,'KEEP');assert.equal(r.action,'KEEP');assert.deepEqual(r.unavailable,{code:'OUTSIDE_V1_SCOPE',capability:'TEMPORARY_REDUCTION',paths:['MISSED_SESSION','RETURN_AFTER_PAUSE']});
 assert.equal(r.view.state,S.VALID_PLAN,'the plan stays valid and executable');assert.equal(doc(s).program.hash,before,'no window, no rung, no ladder');
 assert.ok(!doc(s).rows.some(x=>x&&[F.WELLBEING_DECLARED,F.WELLBEING_CHECKED].includes(x.fact)),'no temporary-reduction row on a V1 record');
 assert.ok(r.view.week.sessions.some(x=>x.executable),'sessions ahead stay executable');
 const chk=s.api.wellbeingCheck({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),check:{warningSigns:NO('NEED_REST'),improved:true}});
 assert.equal(chk.status,'KEEP');assert.equal(chk.unavailable?.code,'OUTSIDE_V1_SCOPE');assert.equal(chk.view.state,S.VALID_PLAN);
});
test('V1 scope: a "not 100%" report is still screened: an unanswered warning sign is asked, and any sign answered yes is the clinical hold on the record',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const signs=NO('MILD_ILLNESS');delete signs[F.WARNING_SIGNS.W1];
 const ask=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'MILD_ILLNESS',warningSigns:signs,intent:'REST',days:4}});
 assert.equal(ask.status,'ASK');assert.deepEqual(ask.decision.missingInputs,['wellbeing.warningSigns.'+F.WARNING_SIGNS.W1],'unknown is never read as no');
 const hold=signHold(s);assert.equal(hold.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(hold.view.state,S.BLOCKED);
 assert.equal(doc(s).rows.filter(x=>x?.fact===F.CLINICAL_HOLD).length,1,'the hold is a fact of the record');
 assert.ok(hold.view.week.sessions.every(x=>x.prescription===null&&!x.executable),'no prescription leaves custody under the hold');
 // A check that answers a sign yes holds too, even with no reduction in progress.
 const t=server();checkIn(t,0);t.set(1,1,'08:00');
 const c=t.api.wellbeingCheck({actor:ME,clientRequestId:rid(),expectedVersion:ver(t),eligibility:elig(t),check:{warningSigns:{...NO('NEED_REST'),[F.WARNING_SIGNS.W2]:true},improved:false}});
 assert.equal(c.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(c.decision.guidance.level,'URGENT_CARE_ADVISED');assert.equal(c.view.state,S.BLOCKED);
});
test('V1 scope: a hold is never released by omission, by a new plan or by a new report; only the readiness declaration releases it',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');signHold(s);
 s.set(1,3,'08:00');const log=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),...weekReports(s,1)[0]});
 assert.equal(log.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(log.view.state,S.BLOCKED);
 const again=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}});
 assert.equal(again.status,'CLINICAL_HUMAN_REQUIRED','a later all-clear report is not a release');
 const fresh=s.api.restart({actor:ME,intake:newPlan(s),expectedVersion:ver(s)});assert.notEqual(fresh.status,'PROPOSED','a new plan is not a release');assert.equal(s.api.plan({actor:ME}).view.state,S.BLOCKED);
 s.set(1,5,'09:00');const ready=s.api.declareReadiness({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),readiness:READY()});
 assert.equal(ready.status,'MODIFY',ready.decision?.reason);assert.equal(ready.adoption,'APPLIED_WITH_ITS_FACT');assert.notEqual(ready.view.state,S.BLOCKED);
});
test('V1 scope: a record that holds a temporary-reduction report (not kept by V1) is never planned over; the V1 server never returns REDUCED',()=>{
 // The research engine opens a window; the same record under the V1 engine holds, typed.
 const s=server({engine:Research});checkIn(s,0);s.set(1,1,'08:00');
 const r=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4}});assert.equal(r.view.state,S.REDUCED);
 const d=doc(s),input={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(s.start,9)}T08:00:00${TZ}`,weekIndex:1,event:{id:'ev-foreign',kind:'WEEKLY_REVIEW'},eligibility:ELIG(addDays(s.start,9)),actualLedger:d.rows.filter(x=>x!==null)};
 const v=V1.evaluateProgram(d.program,input);assert.equal(v.status,'HOLD');assert.deepEqual(v.errors,['record.outsideV1Scope']);assert.equal(v.proposal,null);assert.equal(v.unavailable.capability,'TEMPORARY_REDUCTION');
 assert.ok(!V1_SERVER_STATES.includes(S.REDUCED)&&V1_SERVER_STATES.includes(S.RETURNING));
 // The scope is the entry point's, not the caller's: an option sent to the V1 engine cannot widen it.
 const w=V1.evaluateProgram(d.program,input,{scope:'RESEARCH'});assert.equal(w.status,'HOLD');
});

// ---------- Security: SEC-V1CIB-01..04 ----------
test('SEC-V1CIB-01, A-C3: an erasure closes a change that was waiting, with its cause; it can never be adopted over the erasure hold',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const hold=signHold(s);
 s.set(1,3,'09:00');assert.equal(s.api.declareReadiness({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),readiness:READY()}).status,'MODIFY');
 s.set(1,4,'09:00');const ch=change(s);assert.equal(ch.adoption,'PENDING',ch.decision?.reason);const kept=doc(s).program.hash;
 const e=s.api.eraseHealthFacts({actor:ME,eventIds:[hold.eventId],expectedVersion:ver(s)});assert.ok(e.ok,JSON.stringify(e.error));
 const d=doc(s);assert.equal(d.pending,null,'the waiting change is closed by the erasure');
 assert.ok(d.decisions.some(x=>x.kind==='ADOPTION'&&x.of===ch.decisionId&&x.status==='SUPERSEDED'&&x.cause==='HEALTH_FACTS_ERASED'),'closed with its cause, never silently');
 const a=s.api.accept({actor:ME,decisionId:ch.decisionId,expectedVersion:ver(s)});assert.equal(a.error.code,'NOT_PENDING');
 assert.equal(doc(s).program.hash,kept,'the program is untouched');assert.equal(e.view.state,S.BLOCKED);
});
test('A-C3: revoking the coaching consent closes a waiting change; it is not adopted afterwards, even when consent returns',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const ch=change(s);assert.equal(ch.adoption,'PENDING');const kept=doc(s).program.hash;
 assert.ok(s.api.setConsent({actor:ME,purpose:'COACHING',granted:false,expectedVersion:ver(s)}).ok);
 assert.ok(doc(s).decisions.some(x=>x.of===ch.decisionId&&x.status==='SUPERSEDED'&&x.cause==='CONSENT_REVOKED'));
 assert.ok(s.api.setConsent({actor:ME,purpose:'COACHING',granted:true,expectedVersion:ver(s)}).ok);
 assert.equal(s.api.accept({actor:ME,decisionId:ch.decisionId,expectedVersion:ver(s)}).error.code,'NOT_PENDING');assert.equal(doc(s).program.hash,kept);
});
test('SEC-V1CIB-02: a new plan (restart) needs the coaching consent in force; none is made or stored after it was revoked',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const kept=doc(s).program.hash;
 assert.ok(s.api.setConsent({actor:ME,purpose:'COACHING',granted:false,expectedVersion:ver(s)}).ok);
 const r=s.api.restart({actor:ME,intake:newPlan(s),expectedVersion:ver(s)});assert.equal(r.error?.code,'CONSENT_REQUIRED');assert.equal(doc(s).program.hash,kept);
 assert.ok(s.api.setConsent({actor:ME,purpose:'COACHING',granted:true,expectedVersion:ver(s)}).ok);
 {const ok=s.api.restart({actor:ME,intake:newPlan(s),expectedVersion:ver(s)});assert.equal(ok.status,'PROPOSED',JSON.stringify(ok));}
 assert.equal(s.custody.restart({actor:ME,intake:null,expectedVersion:ver(s)}).error.code,'INVALID_REQUEST','a missing intake is refused, never an exception');
});
test('SEC-V1CIB-03: the learning consent of a new plan is the one custody holds, whatever the app sends',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');assert.equal(doc(s).consents.LEARNING.granted,false);
 const r=s.api.restart({actor:ME,intake:newPlan(s,{learningConsent:true}),expectedVersion:ver(s)});assert.equal(r.status,'PROPOSED',JSON.stringify(r));
 assert.equal(doc(s).program.learningConsent,false,'the app cannot assert a consent the athlete did not give');
 assert.ok(s.api.setConsent({actor:ME,purpose:'LEARNING',granted:true,expectedVersion:ver(s)}).ok);
 assert.equal(s.api.restart({actor:ME,intake:newPlan(s,{learningConsent:false}),expectedVersion:ver(s)}).status,'PROPOSED');assert.equal(doc(s).program.learningConsent,true);
});
test('SEC-V1CIB-04, B-C1: an erased slot keeps a keyed digest only (no keyless digest of the health row is stored), and the decision trace of the erased event loses its content',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const hold=signHold(s);
 const before=doc(s),row=before.rows.find(x=>x?.fact===F.CLINICAL_HOLD),keyless=createHash('sha256').update(canonical(row)).digest('hex');
 assert.ok(!s.store.raw(ME.athleteId).includes(keyless),'the chain never stores the keyless digest of a row');
 assert.ok(before.decisions.some(d=>d.eventId===hold.eventId&&d.warningSigns?.length),'before: the trace names the sign (C8)');
 const e=s.api.eraseHealthFacts({actor:ME,eventIds:[hold.eventId],expectedVersion:ver(s)});assert.ok(e.ok,JSON.stringify(e.error));
 const after=doc(s),raw=s.store.raw(ME.athleteId);assert.equal(s.custody.verify(after),null,'the chain verifies with the erased slot');
 assert.ok(!raw.includes(keyless)&&!raw.includes(row.rowHash),'no keyless digest of the erased content remains');
 const slot=after.chain.find(c=>c.erased);assert.ok(slot&&/^[0-9a-f]{64}$/.test(slot.digest));
 // An operator who guesses the content cannot confirm it without the server key; the server can.
 const other=createCustody({store:s.store,key:Buffer.from('another-key-not-the-server-key-0'),now:()=>s.clock.t});assert.notEqual(other.verify(after),null);
 const trace=after.decisions.find(d=>d.eventId===hold.eventId);assert.deepEqual(Object.keys(trace).sort(),['at','decisionId','eventId','kind','status']);assert.equal(trace.kind,'ERASED');
 assert.ok(!raw.includes(F.WARNING_SIGNS.W7),'the sign name is gone from the record, the decision log and the stored responses');
 assert.equal(e.view.state,S.BLOCKED,'an erased hold is never read as absent');
});

// ---------- Authority of changes: proposal, confirmation, application (PCG-V1CIB-F01) ----------
test('F01 MOVE: a missed key session is recorded at once; moving it to another day is offered, waits for the athlete, and is applied only when accepted',()=>{
 const make=()=>{const s=server({start:'2026-11-02',intake:EDGE_PROFILES.TEN_K_EIGHT_WEEKS,enrollAt:-1});for(const w of [0,1,2,3])checkIn(s,w);return s;};
 const s=make(),q=doc(s).program.weeks[4].sessions.find(x=>x.role==='QUALITY');assert.ok(q,'a quality session in the specific phase');
 s.set(4,q.day,'21:00');const kept=doc(s).program.hash;
 const r=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),sessionId:q.id,occurredOn:q.date,completed:false});
 assert.equal(r.ok,true,JSON.stringify(r.error));assert.deepEqual(r.offer,{decisionId:r.decisionId,kind:'MOVE'});assert.notEqual(r.action,'MOVE','the decision applied is the one without the move');
 assert.equal(doc(s).program.hash,kept,'the official plan is not changed by the offer');assert.equal(r.view.state,S.PENDING_CONFIRMATION);assert.deepEqual(r.view.pending,{decisionId:r.decisionId,kind:'CHANGE_WAITING_CONFIRMATION',change:'MOVE'});
 assert.ok(doc(s).rows.some(x=>x&&x.sessionId===q.id&&x.actual?.completed===false),'the missed session is on the record whatever the athlete answers');
 assert.equal(r.decision.offer.adoption,'PENDING');
 // Declined: the plan in force stays, and the decline is recorded.
 assert.ok(s.api.decline({actor:ME,decisionId:r.decisionId,expectedVersion:ver(s)}).ok);assert.equal(doc(s).program.hash,kept);assert.equal(s.api.plan({actor:ME}).view.state,S.VALID_PLAN);
 // Accepted (another athlete journey, same facts): the session moves to a later chosen day; nothing is added.
 const t=make();t.set(4,q.day,'21:00');const r2=t.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver(t),eligibility:elig(t),sessionId:q.id,occurredOn:q.date,completed:false});
 const ok=t.api.accept({actor:ME,decisionId:r2.decisionId,expectedVersion:ver(t)});assert.ok(ok.ok,JSON.stringify(ok.error));
 const moved=doc(t).program.weeks[4].sessions.find(x=>x.moved?.from===q.id);assert.ok(moved&&moved.date>q.date,'moved to a later day of the same week');
 // Too late (the days the move was prepared for have passed): closed as expired, never adopted.
 const u=make();u.set(4,q.day,'21:00');const r3=u.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver(u),eligibility:elig(u),sessionId:q.id,occurredOn:q.date,completed:false});
 const keptU=doc(u).program.hash;u.set(5,3,'08:00');const late=u.api.accept({actor:ME,decisionId:r3.decisionId,expectedVersion:ver(u)});assert.equal(late.error.code,'PENDING_EXPIRED');
 assert.equal(doc(u).pending,null);assert.ok(doc(u).decisions.some(x=>x.of===r3.decisionId&&x.status==='EXPIRED'));assert.equal(doc(u).program.hash,keptU);
});
test('F01 LEARNED_REARRANGEMENT: the weekly decision without the rearrangement is applied with its evidence; the rearrangement waits; a decline holds for the same pattern',()=>{
 // A stub engine isolates custody's rule: the first evaluation proposes the learned rearrangement, the withheld one the plain weekly step.
 const calls=[];let base=null;
 const engine={...V1,evaluateProgram:(program,input,options={})=>{calls.push(options.withhold??null);const r=V1.evaluateProgram(program,input,options);
  if(input.event.kind!=='WEEKLY_REVIEW'||!r.proposal)return r;base??=r.proposal;
  if(options.withhold?.includes('LEARNED_REARRANGEMENT'))return r;
  const p=JSON.parse(JSON.stringify(r.proposal));p.arrangementSessions={...p.arrangementSessions,__learned:true};
  return {...r,action:'LEARNED_REARRANGEMENT',reason:'Learned athlete-specific pattern',proposal:p,learnedPatterns:[{cause:'STRENGTH_LOWER_BEFORE_KEY_RUN',adverseWith:2,compatibleWithout:1}]};}};
 const s=server({engine,consents:{...CONSENTS,LEARNING:true}}),r=checkIn(s,0);
 assert.deepEqual(calls.filter(Boolean),[['LEARNED_REARRANGEMENT']],'the same review is decided again without the rearrangement');
 assert.deepEqual(r.offer,{decisionId:r.decisionId,kind:'LEARNED_REARRANGEMENT'});assert.notEqual(r.action,'LEARNED_REARRANGEMENT');
 assert.equal(doc(s).program.arrangementSessions.__learned,undefined,'the rearrangement is not in the official plan');assert.equal(doc(s).pending.kind,'LEARNED_REARRANGEMENT');
 assert.equal(r.adoption,'APPLIED_WITH_ITS_EVIDENCE','the week\'s own step is applied with its evidence');
 assert.ok(s.api.decline({actor:ME,decisionId:r.decisionId,expectedVersion:ver(s)}).ok);assert.equal(doc(s).agency.declined.length,1);
 const again=checkIn(s,1);assert.equal(again.offer,undefined,'the declined pattern is not offered again');assert.equal(doc(s).pending,null);assert.equal(doc(s).program.arrangementSessions.__learned,undefined);
 assert.equal(s.custody.verify(doc(s)),null,'the remembered decline is under the seal');
});
test('F01 on the engine: withholding the move or the learned rearrangement returns the same review decided without it, and only those two can be withheld',async()=>{
 const {generateProgram,evaluateProgram}=Research,{devAuthority}=await import('../r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
 const p=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,opts).program,q=p.weeks[4].sessions.find(x=>x.role==='QUALITY');
 const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:q.date+'T21:00:00Z',weekIndex:4,event:{id:'ev-miss',kind:'MISSED_SESSION'},targetSessionId:q.id,eligibility:ELIG(q.date)};
 const withMove=evaluateProgram(p,review,opts),without=evaluateProgram(p,review,{...opts,withhold:['MOVE']});
 assert.equal(withMove.action,'MOVE');assert.notEqual(without.action,'MOVE');assert.equal(without.proposal?.weeks[4].sessions.some(x=>x.moved)??false,false);
 assert.deepEqual(without.actualLedger,withMove.actualLedger,'the same record either way');
 const other=evaluateProgram(p,review,{...opts,withhold:['KEEP','GATED_NEXT_STEP','SAFETY']});assert.equal(other.action,'MOVE','nothing else can be withheld');
 assert.deepEqual([...OFFERED_ACTIONS],['MOVE','LEARNED_REARRANGEMENT']);
});
test('A-C2: a change that was waiting and is superseded by a later review is closed with its cause and named in the answer',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');const ch=change(s);assert.equal(ch.adoption,'PENDING');
 s.set(1,2,'21:00');const log=s.api.logRun({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),...weekReports(s,1,x=>x.sport==='RUN')[0]});
 assert.equal(log.supersededPending,ch.decisionId);assert.ok(doc(s).decisions.some(x=>x.of===ch.decisionId&&x.status==='SUPERSEDED'&&x.cause==='LATER_REVIEW'));
 assert.equal(s.api.accept({actor:ME,decisionId:ch.decisionId,expectedVersion:ver(s)}).error.code,'NOT_PENDING');
});
test('Normal weeks through custody: the week\'s own progression is applied with its evidence and never waits; the days are never rearranged without the athlete',()=>{
 const s=server(),arr=()=>JSON.stringify(doc(s).program.arrangementSessions);const a0=arr();
 for(const w of [0,1,2,3]){const r=checkIn(s,w);assert.notEqual(r.adoption,'PENDING',`week ${w}: ${r.decision?.reason}`);assert.equal(r.offer,undefined);assert.equal(doc(s).pending,null);}
 assert.equal(arr(),a0,'four executed weeks: the same arrangement of days');
});
test('C.1 and C6: a "not 100%" report that opened nothing is logged (append-only, with its reason) and can be erased by the athlete; no hold is written for it',()=>{
 const s=server();checkIn(s,0);s.set(1,1,'08:00');
 const r=s.api.notFeeling100({actor:ME,clientRequestId:rid(),expectedVersion:ver(s),eligibility:elig(s),wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4}});
 const logged=doc(s).decisions.find(d=>d.eventId===r.eventId);assert.equal(logged.kind,'NOT_FEELING_100');assert.equal(logged.status,'KEEP');assert.match(logged.reason,/does not adjust the plan for feeling under par/);
 const e=s.api.eraseHealthFacts({actor:ME,eventIds:[r.eventId],expectedVersion:ver(s)});assert.ok(e.ok,JSON.stringify(e.error));assert.equal(e.erased,1);
 const d=doc(s),trace=d.decisions.find(x=>x.eventId===r.eventId);assert.deepEqual(Object.keys(trace).sort(),['at','decisionId','eventId','kind','status']);assert.equal(trace.kind,'ERASED');
 assert.ok(!d.rows.some(x=>x?.fact===F.ERASED_F08),'nothing held was erased, so no hold marker');assert.equal(e.view.state,S.VALID_PLAN);assert.equal(s.custody.verify(d),null);
 assert.ok(!s.store.raw(ME.athleteId).includes('under par'),'the stored response of the erased event is gone too');
 assert.equal(s.api.eraseHealthFacts({actor:ME,eventIds:['ev_unknown'],expectedVersion:ver(s)}).error.code,'NOT_FOUND');
});
