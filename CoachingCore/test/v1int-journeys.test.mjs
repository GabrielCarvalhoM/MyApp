// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): journeys A-H end to end through the real composed engine
// (v1-safety-index.mjs), the frozen api.mjs and the integration boundary, with the file store a device would use. Synthetic only. No journey
// restates the sporting matrix: each checks what the boundary owns (what is kept, handed back, refused, and never confirmed falsely).
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,spy,fileStore,memoryStore,scratchDir,ELIG,addDays,at,athleteA,notFeeling100WithSign,readiness,CONSENTS,sortedById} from './v1int-helpers.mjs';
import {CARRIED_RECORDS} from '../src/boundary/integration.mjs';
import {CLIENT_STATES} from '../src/boundary/views.mjs';

const code=r=>r.ok?'OK':r.error.code;
const U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const restartIntake=(id,day,pause)=>{const u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);if(pause)u.athlete.pause=pause;else delete u.athlete.pause;return u;};

test('Journey A, first plan: onboarding, the plan and its records kept, restored by a new process, shown as a valid plan',()=>{
 const dir=scratchDir('jA'),t=athlete({id:'jA',store:fileStore(dir)});const e=t.enroll();
 assert.equal(e.ok,true);assert.equal(e.status,'PROPOSED');assert.ok(t.carried().runFormatRecord.length>0);
 const u=athlete({id:'jA',store:fileStore(dir)});u.clock=t.clock;
 assert.deepEqual(u.carried(),t.carried());assert.equal(u.doc().program.hash,e.programHash);
 const view=u.api.plan({actor:u.actor});assert.equal(view.ok,true);assert.equal(view.view.state,CLIENT_STATES.VALID_PLAN);
 assert.ok(Object.keys(u.it.presentation({actor:u.actor}).inForce??{}).length>0,'the run sessions as prescribed, for the app to show');
});

test('Journey B, a run done: the watch in the morning, the athlete\'s effort in the evening, the Sunday review: one execution, two voices, never a second credit',()=>{
 const t=athlete({id:'jB'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');
 t.set(s.date,'08:00');const hk=t.import([t.watch(s)],{eligibility:ELIG(s.date)});assert.deepEqual([code(hk),hk.recorded.length],['OK',1]);
 t.set(s.date,'20:00');const form=t.weekly(s.date,[t.form(s)]);assert.deepEqual([code(form),form.recorded.length],['OK',1]);
 t.set(s.date,'20:05');assert.equal(t.import([t.watch(s)]).duplicate,true,'the same workout again');
 assert.equal(code(t.weekly(s.date,[t.form(s)])),'ALREADY_REPORTED','the same form again');
 const sun=addDays(t.doc().program.startDate,6);t.set(sun);assert.equal(code(t.weekly(sun,[])),'OK');
 const live=t.live(s.id);assert.equal(live.length,1);assert.deepEqual(Object.keys(live[0].provenance.parts).sort(),[...hk.recorded,...form.recorded].sort());
 assert.equal(t.rows().filter(o=>!o.fact&&o.sessionId===s.id).length,1,'no row besides it');
});

test('Journey C, strength: sets and loads logged by the athlete, a review, a restore by a new process: every exercise, set, load and reserve kept as sent',()=>{
 const dir=scratchDir('jC'),t=athlete({id:'jC',store:fileStore(dir)});t.enroll();const s=t.sessions(0).find(x=>x.sport==='STRENGTH');
 t.set(s.date);const f=t.form(s),r=t.weekly(s.date,[f]);assert.equal(code(r),'OK');
 const u=athlete({id:'jC',store:fileStore(dir)});u.clock=t.clock+60e3;const row=u.live(s.id)[0];
 assert.deepEqual(row.actual.exercises,f.actual.exercises);assert.equal(code(u.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:[]},{rid:'jC-next'})),'OK');
 assert.deepEqual(u.live(s.id)[0].actual.exercises,f.actual.exercises);
});

test('Journey D, a correction: recorded, corrected, the history kept, and the whole journey reprocessed gives the same stored bytes',()=>{
 const runJ=()=>{let n=0;const t=athlete({id:'jD',newId:p=>`${p}_${String(++n).padStart(6,'0')}`});t.enroll();const s=t.sessions(0).find(x=>x.sport==='STRENGTH');
  t.set(s.date);const id=t.weekly(s.date,[t.form(s)]).recorded[0];t.set(s.date,'21:00');
  const fix=t.weekly(s.date,[{...t.form(s),correctionOf:id,actual:{...t.form(s).actual,minutes:18}}]);
  return {t,s,id,fix,raw:t.store.raw('jD')};};
 const a=runJ(),b=runJ();
 assert.equal(code(a.fix),'OK');assert.equal(a.t.rows().find(o=>o.eventId===a.id).superseded,true,'the original stays as history');
 assert.equal(a.t.live(a.s.id)[0].actual.minutes,18);assert.equal(a.raw,b.raw,'deterministic: same inputs, same clock, same key, same bytes');
});

test('Journey E, an invalid correction: another athlete\'s event, another author, a forged identity: refused, the history byte-identical',()=>{
 const store=memoryStore(),t=athlete({id:'jE',store}),o=athlete({id:'jE-other',store});t.enroll();o.enroll();
 const s=t.sessions(0).find(x=>x.id==='w0-run-d1');o.set(s.date,'08:00');const theirs=o.import([o.watch(o.sessions(0).find(x=>x.id==='w0-run-d1'))],{eligibility:ELIG(s.date),rid:'other-athlete-hk'}).recorded[0];
 t.set(s.date,'08:00');const hk=t.import([t.watch(s)],{eligibility:ELIG(s.date)}).recorded[0];t.set(s.date,'20:00');const before=t.store.raw('jE');
 assert.equal(code(t.weekly(s.date,[{...t.form(s),correctionOf:theirs}])),'CORRECTION_TARGET_NOT_FOUND');
 assert.equal(code(t.weekly(s.date,[{...t.form(s),correctionOf:hk}])),'CROSS_AUTHOR_CORRECTION');
 assert.equal(code(t.it.submit({actor:{athleteId:'jE-other'},clientRequestId:'x',expectedVersion:t.version(),review:{kind:'WEEKLY_REVIEW',observations:[{...t.form(s),correctionOf:hk}]}})),'CORRECTION_TARGET_NOT_FOUND');
 assert.equal(t.store.raw('jE'),before);
});

test('Journey F, a restart: a plan, its records, a pause, a new plan from the canonical record: the engine is handed the whole record and every carried record, and the new plan continues after a restore',()=>{
 const dir=scratchDir('jF'),sp=spy(),t=athlete({id:'jF',store:fileStore(dir),engine:sp.engine});t.enroll();
 const w0=t.sessions(0),sun=addDays(t.doc().program.startDate,6);t.set(sun,'19:00');t.import(w0.filter(s=>s.sport==='RUN').map(s=>t.watch(s)),{eligibility:ELIG(sun)});
 t.set(sun,'20:00');assert.equal(code(t.weekly(sun,w0.map(s=>t.form(s)))),'OK');
 const day=addDays(sun,12);t.set(day,'10:00');const rows=sortedById(t.rows()),carried=t.carried();
 const r=t.it.restart({actor:t.actor,intake:restartIntake('jF',day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),expectedVersion:t.version()});
 assert.equal(r.status,'PROPOSED');const call=sp.calls.findLast(c=>c.op==='restart');
 assert.deepEqual(sortedById(call.input.record),rows);for(const k of CARRIED_RECORDS)assert.deepEqual(call.input[k],carried[k]);
 const u=athlete({id:'jF',store:fileStore(dir)}),s=u.sessions(0)[0];u.set(s.date);assert.notEqual(s.id,w0[0].id,'the new plan\'s own session ids');
 const after=u.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:[u.form(s)]},{rid:'jF-b'});assert.equal(code(after),'OK');assert.equal(after.recorded.length,1);
});

test('Journey G, safety: a hold, the readiness, a run stopped for a symptom, the athlete\'s own correction to "not done", a restore: the restart still asks for readiness; a later declaration answers it',()=>{
 const dir=scratchDir('jG'),t=athlete({id:'jG',store:fileStore(dir)});t.enroll();const p=t.doc().program,d0=addDays(p.startDate,6);
 t.set(d0);assert.equal(code(t.weekly(d0,t.sessions(0).map(s=>t.form(s)))),'OK');
 const h=addDays(p.startDate,8),rd=addDays(h,4);
 t.set(h,'08:00');assert.equal(code(t.api.notFeeling100({actor:t.actor,clientRequestId:'hold',expectedVersion:t.version(),...notFeeling100WithSign(h)})),'OK');
 t.set(rd,'08:00');assert.equal(code(t.api.declareReadiness({actor:t.actor,clientRequestId:'ready',expectedVersion:t.version(),...readiness(rd)})),'OK');
 const s=t.sessions(2).find(x=>x.sport==='RUN'&&x.date>rd);t.set(s.date,'21:00');
 const stop=t.weekly(s.date,[{...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]);
 assert.equal(code(stop),'OK');assert.equal(stop.recorded.length,1);
 t.set(s.date,'22:30');const fix=t.weekly(s.date,[{...t.form(s),correctionOf:stop.recorded[0],actual:{completed:false,minutes:0},response:U3}]);assert.equal(code(fix),'OK');
 const u=athlete({id:'jG',store:fileStore(dir)}),day=addDays(s.date,3);u.set(day,'10:00');
 const ask=u.it.restart({actor:u.actor,intake:restartIntake('jG',day,null),expectedVersion:u.version()});
 assert.equal(ask.status,'ASK','the stop after the declaration is still heard (SB-1), as in the Mac journey sc-stop-corrected');
 assert.ok(u.rows().some(o=>o.eventId===stop.recorded[0]&&o.superseded===true),'the stop stays as history');
 const h2=addDays(s.date,1),rd2=addDays(s.date,2);
 u.set(h2,'08:00');assert.equal(code(u.api.notFeeling100({actor:u.actor,clientRequestId:'hold-2',expectedVersion:u.version(),...notFeeling100WithSign(h2)})),'OK');
 u.set(rd2,'08:00');assert.equal(code(u.api.declareReadiness({actor:u.actor,clientRequestId:'ready-2',expectedVersion:u.version(),...readiness(rd2)})),'OK');
 u.set(day,'10:00');assert.equal(u.it.restart({actor:u.actor,intake:restartIntake('jG',day,null),expectedVersion:u.version()}).status,'PROPOSED');
});

test('Journey H, integration failures: a failed write, an excessive request, an invalid time, an inconsistent identity: each an explicit error, the plan and its version unchanged, no prescription',()=>{
 const base=memoryStore();let broken=false;const store={...base,commit:(i,v,d)=>{if(broken)throw new Error('EIO');return base.commit(i,v,d);}};
 const t=athlete({id:'jH',store});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date);
 const before={hash:t.doc().program.hash,version:t.version()};
 broken=true;const a=t.weekly(s.date,[t.form(s)]);broken=false;
 const b=t.weekly(s.date,Array(40).fill(t.form(s)));
 const c=t.weekly(s.date,[{...t.form(s),occurrenceDate:'2026-02-30x'}]);
 const d=t.it.submit({actor:{athleteId:'jH',extra:true},clientRequestId:'x',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',observations:[{...t.form(s),athleteId:'someone'}]}});
 assert.deepEqual([a,b,c,d].map(code),['PERSISTENCE_FAILURE','LIMIT_EXCEEDED','INVALID_TIME','BOUNDARY_OWNED_FIELD']);
 for(const r of [a,b,c,d]){assert.equal(r.ok,false);assert.equal(r.proposal,undefined);assert.equal(r.view,undefined);}
 assert.deepEqual({hash:t.doc().program.hash,version:t.version()},before);
 const v=t.api.logRun({actor:t.actor,clientRequestId:'api-1',expectedVersion:before.version,sessionId:s.id,occurredOn:s.date,completed:true,minutes:40,response:t.form(s).response,eligibility:ELIG(s.date)});
 assert.equal(code(v),'OK','the frozen api.mjs over the boundary: a run logged by the athlete');assert.equal(v.view.state,CLIENT_STATES.VALID_PLAN);
});
