// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): C-F01-2 (custody of the canonical record) and C-NCC-3 (a) (the record of
// formats travels with the ledger), persistence and restoration, write failures, corruption, identity, and the external anchor. Synthetic only.
// Each gap is first shown on the frozen V1CIB custody (custody.mjs, bound by COACHINGCORE-V1-FREEZE-1) driven with the composed entry point, then
// closed through integration.mjs, which composes that custody and changes neither it nor the engine.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCustody} from '../src/boundary/custody.mjs';
import {CARRIED_RECORDS} from '../src/boundary/integration.mjs';
import {S,athlete,spy,memoryStore,fileStore,memoryAnchor,scratchDir,createIntegration,ELIG,addDays,at,CONSENTS,athleteA,json,sortedById} from './v1int-helpers.mjs';

/** A run report the record of formats keeps only as a stop: it cites a format the record does not hold, so the report itself is not recorded. */
const unreadableStop=(t,s)=>({...t.form(s),actual:{completed:false,minutes:10,formatHash:'0'.repeat(64),stop:{reason:'SYMPTOM'}}});

test('C-NCC-3 (a), the gap shown: the frozen custody keeps none of the records the composed engine returns, so a kept symptom stop stops asking for the screen at the next review',()=>{
 const sp=spy(),store=memoryStore();let clock=Date.parse('2026-11-14T12:00:00-03:00');
 const cu=createCustody({store,key:'k',now:()=>clock,engine:sp.engine}),actor={athleteId:'gap-a'};
 assert.equal(cu.enroll({actor,intake:athleteA({weeks:8,id:'gap-a'}),consents:CONSENTS}).ok,true);
 assert.ok(sp.calls[0].out.runFormatRecord.length>0,'the engine returned formats');
 assert.equal('runFormatRecord' in store.load(actor.athleteId),false,'custody kept none');
 const p=store.load(actor.athleteId).program,d3=p.weeks[0].sessions.find(s=>s.id==='w0-run-d3');clock=Date.parse(at(d3.date));
 const t=athlete({id:'gap-ref'});t.enroll();const form=unreadableStop(t,t.sessions(0).find(s=>s.id==='w0-run-d3'));
 assert.equal(cu.submit({actor,clientRequestId:'stop',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(d3.date),observations:[form]}}).ok,true);
 assert.equal(sp.calls.at(-1).out.runFormat.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM','the review that brought the stop asks');
 clock+=3600e3;assert.equal(cu.submit({actor,clientRequestId:'next',expectedVersion:2,review:{kind:'WEEKLY_REVIEW',observations:[]}}).ok,true);
 assert.equal(sp.calls.at(-1).input.runFormatRecord,undefined,'the next review is handed no record of formats');
 assert.equal(sp.calls.at(-1).out.runFormat?.warningSignScreen?.reason,undefined,'and no longer asks for the screen');
 assert.equal(sp.calls.at(-1).out.runFormat?.warningSignScreen?.status,'NOT_RAISED_BY_THIS_EXTENSION');
});

test('C-NCC-3 (a) closed: through the integration boundary the record of formats is kept, handed back, and the screen is asked for at every later review and named in the answer',()=>{
 const sp=spy(),t=athlete({id:'ncc-a',engine:sp.engine});assert.equal(t.enroll().ok,true);
 assert.deepEqual(t.carried().runFormatRecord,sp.calls[0].out.runFormatRecord,'the formats the engine returned, as returned');
 const d3=t.sessions(0).find(s=>s.id==='w0-run-d3');t.set(d3.date);
 const r=t.weekly(d3.date,[unreadableStop(t,d3)]);
 assert.equal(r.ok,true);assert.equal(r.status,'ASK');assert.equal(r.warningSignScreen.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 assert.equal(r.recorded.length,0,'the report itself is not recorded');assert.equal(r.notRecorded.length,1,'and the app is told so');
 assert.ok(t.carried().runFormatRecord.some(x=>x.sessionId==='w0-run-d3'&&x.report?.stop?.reason==='SYMPTOM'),'the stop is kept in the record of formats');
 for(const day of [addDays(d3.date,1),addDays(d3.date,3)]){t.set(day);const n=t.submit({kind:'WEEKLY_REVIEW',observations:[]});
  assert.deepEqual(sp.calls.at(-1).input.runFormatRecord,t.carried().runFormatRecord,'handed back exactly as kept');
  assert.equal(n.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM',`still asked on ${day}`);}
});

test('C-F01-2: after every operation the stored unit is the engine\'s last answer (ledger as a set, every carried record, reference state, model), and the next call is handed exactly that unit',()=>{
 const sp=spy(),t=athlete({id:'unit-a',engine:sp.engine});t.enroll();
 const unit=()=>{const d=t.doc();return {rows:sortedById(t.rows()),carried:t.carried(),reference:d.reference??null,model:d.model??null};};
 const check=(from,label)=>{const calls=sp.calls.slice(from),last=calls.at(-1),u=unit();if(!last)return;
  if(last.op!=='generate'&&last.op!=='restart')assert.deepEqual(u.rows,sortedById(last.out.actualLedger??last.input.actualLedger??[]),label+': ledger');
  for(const k of CARRIED_RECORDS)assert.deepEqual(u.carried[k],last.out[k],label+': '+k);
  if(last.op==='evaluate'){if(last.out.referenceState)assert.deepEqual(u.reference,json(last.out.referenceState),label+': reference');if(last.out.updatedModel)assert.deepEqual(u.model,json(last.out.updatedModel),label+': model');}};
 const handed=(from,label)=>{const first=sp.calls[from];if(!first||first.op==='generate')return;const u=unit();
  for(const k of CARRIED_RECORDS)assert.deepEqual(first.input[k],u.carried[k],label+': handed '+k);
  assert.deepEqual(sortedById(first.input.actualLedger??first.input.record??[]),u.rows,label+': handed ledger');};
 const step=(label,f)=>{const from=sp.calls.length,before=unit(),r=f();if(sp.calls[from]&&sp.calls[from].op!=='generate'){
  for(const k of CARRIED_RECORDS)assert.deepEqual(sp.calls[from].input[k],before.carried[k],label+': handed '+k);
  assert.deepEqual(sortedById(sp.calls[from].input.actualLedger??sp.calls[from].input.record??[]),before.rows,label+': handed ledger');}
  if(r.ok!==false&&r.version!==before.version)check(from,label);return r;};
 const w0=t.sessions(0),sun=addDays(t.doc().program.startDate,6);t.set(sun,'19:00');
 assert.equal(step('watch',()=>t.import(w0.filter(s=>s.sport==='RUN').map(s=>t.watch(s)),{eligibility:ELIG(sun)})).ok,true);
 t.set(sun,'20:00');const forms=step('forms',()=>t.weekly(sun,w0.map(s=>t.form(s))));assert.equal(forms.ok,true,JSON.stringify(forms.error??null));
 const str=w0.find(s=>s.sport==='STRENGTH'),own=t.live(str.id)[0];t.set(sun,'21:00');
 const fix=step('correction',()=>t.weekly(sun,[{...t.form(str),correctionOf:own.eventId,actual:{...t.form(str).actual,exercises:t.form(str).actual.exercises.slice(0,1)}}]));
 assert.equal(fix.ok,true,JSON.stringify(fix.error??null));assert.equal(fix.recorded.length,1);
 const day=addDays(sun,4),upd={...athleteA({weeks:8,id:'unit-a'}),asOf:day,startDate:addDays(day,3)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 t.set(day,'10:00');const rs=step('restart',()=>t.it.restart({actor:t.actor,intake:upd,expectedVersion:t.version()}));assert.equal(rs.status,'PROPOSED');
 const restartCall=sp.calls.findLast(c=>c.op==='restart');
 assert.deepEqual(sortedById(restartCall.input.record),sortedById(sp.calls.findLast(c=>c.op==='evaluate').out.actualLedger),'the restart is handed the record the engine last returned, replaced rows included');
 assert.ok(restartCall.input.record.some(o=>o.superseded===true),'the replaced report travels as history');
 for(const k of CARRIED_RECORDS)assert.deepEqual(restartCall.input[k],sp.calls.filter(c=>c.op==='evaluate').at(-1).out[k],'restart handed '+k);
 handed(sp.calls.length,'');
});

test('C-F01-2: the record survives a process restart: a file store reopened by a new boundary instance gives the same unit and continues; another key reads it as an integrity failure',()=>{
 const dir=scratchDir('restore'),t=athlete({id:'file-a',store:fileStore(dir)});t.enroll();
 const sun=addDays(t.doc().program.startDate,6);t.set(sun);assert.equal(t.weekly(sun,t.sessions(0).map(s=>t.form(s))).ok,true);
 const before={rows:sortedById(t.rows()),carried:t.carried(),version:t.version()};
 const u=athlete({id:'file-a',store:fileStore(dir)});u.clock=t.clock+3600e3;
 assert.deepEqual({rows:sortedById(u.rows()),carried:u.carried(),version:u.version()},before);
 assert.equal(u.submit({kind:'WEEKLY_REVIEW',observations:[]},{rid:'rq-1'}).error.code,'CONFLICT_IDEMPOTENCY_KEY','a request id the record holds is never reused for another request after a restore');
 assert.equal(u.submit({kind:'WEEKLY_REVIEW',observations:[]},{rid:'after-restore'}).ok,true,'continues');
 const wrong=createIntegration({store:fileStore(dir),key:'another-key',clock:()=>u.clock});
 assert.equal(wrong.read({actor:{athleteId:'file-a'}}).error.code,'INTEGRITY_FAILURE');
});

test('C-F01-2: a failed write confirms nothing: the record is unchanged, the same request succeeds once after recovery; a write that landed before the store threw is replayed, never doubled',()=>{
 const base=memoryStore();let mode='ok';
 const flaky={...base,commit(id,v,doc){if(mode==='throw-before')throw Object.assign(new Error('disk full'),{code:'ENOSPC'});const r=base.commit(id,v,doc);if(mode==='throw-after')throw new Error('fsync');return r;}};
 const t=athlete({id:'flaky-a',store:flaky});t.enroll();const sun=addDays(t.doc().program.startDate,6);t.set(sun);
 const forms=t.sessions(0).map(s=>t.form(s)),raw=base.raw('flaky-a');
 mode='throw-before';const a=t.weekly(sun,forms,{});
 assert.equal(a.ok,false);assert.equal(a.error.code,'PERSISTENCE_FAILURE');assert.equal(base.raw('flaky-a'),raw,'nothing written');
 mode='ok';const ok=t.it.submit({actor:t.actor,clientRequestId:'w0',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(sun),observations:forms}});assert.equal(ok.ok,true);
 mode='throw-after';t.clock+=60e3;const b=t.it.submit({actor:t.actor,clientRequestId:'w0b',expectedVersion:2,review:{kind:'WEEKLY_REVIEW',observations:[]}});
 assert.equal(b.error.code,'PERSISTENCE_FAILURE','the caller is never told it was kept');
 mode='ok';const c=t.it.submit({actor:t.actor,clientRequestId:'w0b',expectedVersion:2,review:{kind:'WEEKLY_REVIEW',observations:[]}});
 assert.equal(c.ok,true);assert.equal(c.replayed,true,'it was in fact kept: the retry is its stored answer');assert.equal(t.version(),3);
});

test('C-F01-2: a partly corrupted record is never planned on: an edited or removed record of formats, records spliced from another version, unreadable text, a document without its carried records',()=>{
 const t=athlete({id:'bad-a'});t.enroll();const d3=t.sessions(0).find(s=>s.id==='w0-run-d3'),d1=t.sessions(0).find(s=>s.id==='w0-run-d1');t.set(d3.date);
 assert.equal(t.weekly(d3.date,[t.form(d1)]).recorded.length,1);t.set(d3.date,'20:30');t.weekly(d3.date,[unreadableStop(t,d3)]);
 const good=t.store.raw('bad-a'),old=JSON.parse(good);t.set(d3.date,'21:00');t.submit({kind:'WEEKLY_REVIEW',observations:[]});const newer=t.store.raw('bad-a');
 const cases={
  'stop removed':d=>{d.carried.records.runFormatRecord=d.carried.records.runFormatRecord.filter(x=>!x.report?.stop);return d;},
  'formats emptied':d=>{d.carried.records.runFormatRecord=[];return d;},
  'origins edited':d=>{for(const m of Object.values(d.carried.origins))m.ch='D';return d;},
  'spliced from v2':d=>{d.carried=old.carried;d.carriedMac=old.carriedMac;return d;},
  'no carried':d=>{delete d.carried;delete d.carriedMac;return d;}};
 for(const [name,f] of Object.entries(cases)){t.store.setRaw('bad-a',JSON.stringify(f(JSON.parse(newer))));
  for(const r of [t.it.read({actor:t.actor}),t.submit({kind:'WEEKLY_REVIEW',observations:[]},{expectedVersion:3}),t.it.restart({actor:t.actor,intake:athleteA({weeks:8,id:'bad-a'}),expectedVersion:3})])
   assert.equal(r.error?.code,'INTEGRITY_FAILURE',name);}
 t.store.setRaw('bad-a',newer.slice(0,newer.length>>1));assert.equal(t.it.read({actor:t.actor}).error.code,'INTEGRITY_FAILURE','truncated text');
 t.store.setRaw('bad-a',newer);assert.equal(t.it.read({actor:t.actor}).ok,true,'the intact record still reads');
});

test('C-F01-2: identity: another athlete\'s record is never read, written or restarted from, even copied under this athlete\'s id; an unauthenticated call is refused',()=>{
 const store=memoryStore(),a=athlete({id:'id-a',store}),b=athlete({id:'id-b',store});a.enroll();b.enroll();
 assert.equal(b.it.read({actor:{athleteId:'id-c'}}).error.code,'NOT_ENROLLED');
 assert.equal(b.it.read({actor:{}}).error.code,'UNAUTHENTICATED');
 store.setRaw('id-b',store.raw('id-a'));
 for(const r of [b.it.read({actor:b.actor}),b.submit({kind:'WEEKLY_REVIEW',observations:[]},{expectedVersion:1}),b.it.restart({actor:b.actor,intake:athleteA({weeks:8,id:'id-b'}),expectedVersion:1})])
  assert.equal(r.error.code,'FORBIDDEN');
});

test('C-F01-2 (anchor): a missing or rolled-back record is never replaced by a new plan or an older one; only the athlete\'s explicit acknowledgement starts over (without an anchor the limit is shown)',()=>{
 const store=memoryStore(),anchor=memoryAnchor(),t=athlete({id:'anc-a',store,anchor});t.enroll();
 const sun=addDays(t.doc().program.startDate,6);t.set(sun);const v1=store.raw('anc-a');assert.equal(t.weekly(sun,t.sessions(0).map(s=>t.form(s))).ok,true);
 store.setRaw('anc-a',v1);
 for(const r of [t.it.read({actor:t.actor}),t.submit({kind:'WEEKLY_REVIEW',observations:[]},{expectedVersion:1})])assert.equal(r.error.code,'RECORD_ROLLED_BACK');
 store.remove('anc-a');
 for(const r of [t.it.read({actor:t.actor}),t.enroll(),t.it.restart({actor:t.actor,intake:athleteA({weeks:8,id:'anc-a'}),expectedVersion:2})])assert.equal(r.error.code,'RECORD_LOST');
 assert.equal(t.it.acknowledgeRecordLoss({actor:t.actor}).ok,true);assert.equal(t.enroll().ok,true,'a new plan from a new intake, by the athlete\'s act');
 const plain=athlete({id:'anc-b'});plain.enroll();plain.store.remove('anc-b');
 assert.equal(plain.it.read({actor:plain.actor}).error.code,'NOT_ENROLLED','without an anchor a lost record reads as a new athlete: the native anchor is required');
});

test('custody: a report id derived from a request id custody no longer remembers is refused (REQUEST_ID_REUSED), never recorded over the report that holds it',()=>{
 // A fast stand-in engine (the property is custody's id derivation, not a sporting one): it records the reports it is given.
 const stub={...S,evaluateProgram:(p,i)=>({status:'KEEP',action:'KEEP',reason:'stub',missingInputs:[],actualLedger:[...(i.actualLedger??[]),...(i.observations??[]).map(o=>({...o,provenance:{}}))],runFormatRecord:i.runFormatRecord,runHistoryRecord:i.runHistoryRecord,runEvidenceRecord:i.runEvidenceRecord})};
 const t=athlete({id:'rid-a',engine:stub});t.enroll();const s=t.sessions(0)[0];t.set(s.date);
 const first=t.it.submit({actor:t.actor,clientRequestId:'r0',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',observations:[t.form(s)]}});assert.equal(first.ok,true);
 for(let k=1;k<=500;k++){t.clock+=1000;assert.equal(t.it.submit({actor:t.actor,clientRequestId:'r'+k,expectedVersion:t.version(),review:{kind:'WEEKLY_REVIEW',observations:[]}}).ok,true);}
 t.clock+=1000;const s2=t.sessions(0)[1],again=t.it.submit({actor:t.actor,clientRequestId:'r0',expectedVersion:t.version(),review:{kind:'WEEKLY_REVIEW',observations:[t.form(s2)]}});
 assert.equal(again.error?.code,'REQUEST_ID_REUSED');assert.equal(t.rows().filter(o=>o.eventId===first.observationIds[0]).length,1);
});

// ---------- the custody.mjs amendment (reconcile admits the engine's in-place evolution of a stored report by this review's reports) ----------
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const ATH=(b,extra={})=>({...b,actual:{completed:true,minutes:40,rpe:4,...extra}});
/** The frozen custody with an engine whose answer can be altered for one review (`alter(ledger, input)`), and one run session's report base. */
function custodyRig(alter=null){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(mode,json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const p=store.load('rc').program,s=p.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 const row=()=>cu.visible(store.load('rc')).find(o=>!o.fact&&o.sessionId===s.id&&!o.superseded);
 return {cu,store,s,b,send,row,head:()=>row()?.eventId};
}
test('custody amendment: the engine\'s own evolutions of the row in force are kept (a second voice, either order; a dispute; a third voice), each under an append-only chain entry; FREEZE-1 refused them all',()=>{
 const shapes={
  'device, then athlete':r=>[r.send('hk',[DEV(r.b)],'08:00'),r.send('form',[ATH(r.b)],'20:00')],
  'athlete, then device':r=>[r.send('form',[ATH(r.b)],'08:00'),r.send('hk',[DEV(r.b)],'20:00')],
  'a dispute kept as a voice':r=>[r.send('hk',[DEV(r.b)],'08:00'),r.send('form',[ATH(r.b,{minutes:90})],'20:00')],
  'a third voice':r=>[r.send('hk',[DEV(r.b)],'08:00'),r.send('form',[ATH(r.b)],'12:00'),r.send('hk2',[DEV(r.b,'HK2')],'20:00')]};
 for(const [name,f] of Object.entries(shapes)){const r=custodyRig(),out=f(r);
  assert.deepEqual(out.map(x=>x.ok?'ok':x.error.code),out.map(()=>'ok'),name);
  const doc=r.store.load('rc');assert.equal(r.cu.verify(doc),null,name+': the chain verifies');
  assert.ok(doc.chain.some(c=>Number.isInteger(c.of)),name+': the evolution is an annotation entry');
  assert.ok(Object.keys(r.row().provenance.parts).length>=2,name);}
});
test('custody amendment: what is not the engine\'s evolution by this review stays refused: an earlier voice changed or dropped, a voice no report of this review gave, a cleared conflict, an identity field, an amount changed with no new voice',()=>{
 const tamper=(f)=>(mode,ledger,input)=>{const target=ledger.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);f(target,input);return ledger;};
 const cases={
  'an earlier voice changed':tamper(t=>{const k=Object.keys(t.provenance.parts)[0];t.provenance.parts[k].actual.minutes=99;}),
  'an earlier voice dropped':tamper(t=>{delete t.provenance.parts[Object.keys(t.provenance.parts)[0]];}),
  'a voice from no report of this review':tamper(t=>{t.provenance.parts.ob_forged={actual:{completed:true,minutes:5},response:{}};}),
  'an earlier input hash changed':tamper(t=>{const k=Object.keys(t.provenance.inputHashes)[0];t.provenance.inputHashes[k]='0'.repeat(64);}),
  'the session moved':tamper(t=>{t.sessionId='w0-run-d3';}),
  'the observation time moved':tamper(t=>{t.observedAt='2026-11-01T00:00:00.000Z';}),
  'the provider rewritten':tamper(t=>{t.provenance.provider='MANUAL';})};
 for(const [name,alter] of Object.entries(cases)){const r=custodyRig(alter);r.send('hk',[DEV(r.b)],'08:00');r.send('form',[ATH(r.b)],'12:00');const before=r.store.raw('rc');
  const x=r.send('hk2',[DEV(r.b,'HK2')],'20:00','x');assert.equal(x.ok?'ok':x.error.code,'ENGINE_CONTRACT_VIOLATION',name);assert.equal(r.store.raw('rc'),before,name+': nothing kept');}
 // Cycle 1 (QRE-INT-11 C03, SEC-INT-02): on the first merge the row's own voice must be there, as stored; a new voice says what its report said.
 const first=(f)=>{const r=custodyRig((m,l)=>{const t=l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);f(t);return l;});r.send('hk',[DEV(r.b)],'08:00');return r.send('form',[ATH(r.b)],'20:00','x');};
 assert.equal(first(t=>{delete t.provenance.parts[Object.keys(t.provenance.parts).find(k=>t.provenance.parts[k].activityId)];}).error.code,'ENGINE_CONTRACT_VIOLATION','first merge: own voice dropped');
 assert.equal(first(t=>{const k=Object.keys(t.provenance.parts).find(k=>!t.provenance.parts[k].activityId);t.provenance.parts[k].actual={...t.provenance.parts[k].actual,stop:{reason:'TIME'}};}).error.code,'ENGINE_CONTRACT_VIOLATION','a new voice that says a stop its report did not');
 assert.equal(first(t=>{t.actual={...t.actual,minutes:5};}).error.code,'ENGINE_CONTRACT_VIOLATION','an amount neither voice stated');
 assert.equal(first(t=>{t.response={...t.response,recovery:'COMPATIBLE',nextDayFunction:'NORMAL'};delete t.actual.rpe;}).error.code,'ENGINE_CONTRACT_VIOLATION','a stated value dropped');
 const quiet=custodyRig((m,l)=>{const t=l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);t.actual.minutes=10;return l;});quiet.send('hk',[DEV(quiet.b)],'08:00');quiet.send('form',[ATH(quiet.b)],'12:00');
 assert.equal(quiet.send('none',[],'20:00','x').error.code,'ENGINE_CONTRACT_VIOLATION','an amount changed by a review that brought no report');
 const flagged=custodyRig((m,l)=>{const t=l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);delete t.conflicted;return l;});flagged.send('hk',[DEV(flagged.b)],'08:00');flagged.send('form',[ATH(flagged.b,{minutes:90})],'12:00');
 assert.equal(flagged.row().conflicted,true);assert.equal(flagged.send('hk2',[DEV(flagged.b,'HK2')],'20:00','x').error.code,'ENGINE_CONTRACT_VIOLATION','a conflict flag is never cleared in place');
});

test('custody amendment (QRE C-R2-1): each guard of evolves is needed: a kept voice whose own safety facts differ from its report, a non-boolean flag on a merge, a relabelled conflict, a kept voice whose amount changed',()=>{
 const rowOf=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded);
 // C06: the dispute keeps the athlete as a voice; that voice says ADVERSE although the report did not (only the per-voice check sees it).
 const c06=custodyRig((m,l)=>{const t=rowOf(l);const k=Object.keys(t.provenance.parts).find(k=>!t.provenance.parts[k].activityId);t.provenance.parts[k].response={...t.provenance.parts[k].response,recovery:'ADVERSE'};return l;});
 c06.send('hk',[DEV(c06.b)],'08:00');assert.equal(c06.send('form',[ATH(c06.b,{minutes:90})],'20:00','x').error.code,'ENGINE_CONTRACT_VIOLATION','C06');
 // C07: an agreeing merge marked with a flag that is not the boolean true.
 const c07=custodyRig((m,l)=>{rowOf(l).conflicted='maybe';return l;});c07.send('hk',[DEV(c07.b)],'08:00');
 assert.equal(c07.send('form',[ATH(c07.b)],'20:00','x').error.code,'ENGINE_CONTRACT_VIOLATION','C07');
 // C08: a disputed row keeps a third voice, and its conflict label is changed.
 const c08=custodyRig((m,l)=>{rowOf(l).provenance.conflict='SOMETHING_ELSE';return l;});c08.send('hk',[DEV(c08.b)],'08:00');c08.send('form',[ATH(c08.b,{minutes:90})],'12:00');
 assert.equal(c08.row().conflicted,true);assert.equal(c08.send('hk2',[DEV(c08.b,'HK2',60)],'20:00','x').error.code,'ENGINE_CONTRACT_VIOLATION','C08');
 // C09: a kept voice (the dispute) with the amount of the row changed.
 const c09=custodyRig((m,l)=>{rowOf(l).actual.minutes=5;return l;});c09.send('hk',[DEV(c09.b)],'08:00');
 assert.equal(c09.send('form',[ATH(c09.b,{minutes:90})],'20:00','x').error.code,'ENGINE_CONTRACT_VIOLATION','C09');
 // Controls: the same reviews without the alteration are kept.
 const ok=custodyRig();ok.send('hk',[DEV(ok.b)],'08:00');assert.equal(ok.send('form',[ATH(ok.b,{minutes:90})],'12:00').ok,true);assert.equal(ok.send('hk2',[DEV(ok.b,'HK2',60)],'20:00').ok,true);
});
