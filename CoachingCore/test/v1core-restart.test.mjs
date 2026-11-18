// V1 Core Safety & Lifecycle, QRE-AIF-02 (L-APP-06, the RESTART gate): a plan made from the record has session identities of its own. A report
// of the new plan is the new plan's; a row of an earlier plan stays as it was recorded, never re-bound to a session of the new plan.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/v1-safety-index.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore} from '../src/boundary/store.mjs';
import {client,planAWithWeek0,restartAfter,liveReports,athleteA,reportOf,liveSessions,at,ELIG,addDays} from './v1core-helpers.mjs';

const rowsOfPlanA=env=>env.actualLedger.filter(o=>!o.fact&&o.eventId.startsWith('aif-w0-'));
const strip=o=>JSON.stringify(o);

test('QRE-AIF-02: a restarted plan has its own session ids; a plan that is not a restart keeps the ids it always had', ()=>{
 const c=planAWithWeek0(S),idsA=c.env.program.weeks.flatMap(w=>w.sessions.map(s=>s.id));
 assert.ok(idsA.includes('w0-run-d1')&&!c.env.program.sessionNamespace,'plan A: no namespace, the ids as before');
 const r=restartAfter(c,18);assert.equal(r.status,'PROPOSED');
 const ns=c.env.program.sessionNamespace,idsB=c.env.program.weeks.flatMap(w=>w.sessions.map(s=>s.id));
 assert.match(ns,/^r[0-9a-f]{10}$/);
 assert.ok(idsB.every(id=>id.startsWith(ns+'.')),'every session of plan B carries its namespace');
 assert.ok(!idsB.some(id=>idsA.includes(id)),'no session id of plan B is an id of plan A');
});

test('QRE-AIF-02: the first report of the new plan gets its own row; the rows of plan A are left exactly as recorded', ()=>{
 const c=planAWithWeek0(S),before=rowsOfPlanA(c.env).map(strip);
 restartAfter(c,18);
 // A review with no report (the AIF finding: any review after a restart rewrote plan A's rows).
 const d1=addDays(c.env.program.startDate,0);c.review('WEEKLY_REVIEW',at(d1,'07:00'),{eligibility:ELIG(d1)},'b-plain');
 assert.deepEqual(rowsOfPlanA(c.env).map(strip),before,'a review after the restart leaves plan A rows unchanged');
 const s0=liveSessions(c.env,0)[0],rep=reportOf(c.env,s0,{tag:'-b'});
 const r=c.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[rep]},'b-first');
 const own=c.env.actualLedger.filter(o=>o.eventId===rep.eventId);
 assert.equal(own.length,1,'the report has a row of its own');
 assert.equal(own[0].sessionId,s0.id);assert.equal(own[0].conflicted,undefined);assert.equal(own[0].context.sessionId,s0.id);
 assert.deepEqual(rowsOfPlanA(c.env).map(strip),before,'plan A rows unchanged, none conflicted');
 assert.ok(['KEEP','MODIFY','PROGRESS','HOLD_LOAD','CONTINUE'].includes(r.status)||typeof r.status==='string');
});

test('QRE-AIF-02: plan A executions are never credited to plan B (week evidence of plan B counts only its own reports)', ()=>{
 const c=planAWithWeek0(S);restartAfter(c,18);
 const sunday=addDays(c.env.program.startDate,6),r=c.probe('WEEKLY_REVIEW',at(sunday),{eligibility:ELIG(sunday)},'b-w0-empty');
 const ev=r.weekEvidence;
 assert.ok(ev,'the answer carries the week evidence');
 assert.equal(ev.completed,0,'nothing of plan B was done: plan A reports are not its executions');
 assert.ok(ev.rows.every(x=>x.status!=='COMPLETED'&&x.status!=='CONFLICTED'));
});

test('QRE-AIF-02: persist and restore keep the identities; the next answer is the same', ()=>{
 const c=planAWithWeek0(S);restartAfter(c,18);const s0=liveSessions(c.env,0)[0];
 c.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[reportOf(c.env,s0,{tag:'-b'})]},'b-first');
 const restored=client(S,JSON.parse(JSON.stringify(c.env))),d=addDays(s0.date,1);
 const a=c.probe('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d)},'next'),b=restored.probe('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d)},'next');
 assert.equal(JSON.stringify(a),JSON.stringify(b));
 assert.equal(restored.env.program.sessionNamespace,c.env.program.sessionNamespace);
});

test('QRE-AIF-02: a late correction of a plan A report keeps its chain and its provenance, and credits plan B nothing', ()=>{
 const c=planAWithWeek0(S),target=rowsOfPlanA(c.env).find(o=>o.context?.sport==='RUN');restartAfter(c,18);
 const d=addDays(c.env.program.startDate,1),{eventId:_e,athleteId:_a,conflicted:_c,provenance:_p,context:_x,comparable:_m,partial:_q,confounded:_f,logs:_l,localDate:_d,...body}=target;
 const corr={...body,eventId:'corr-a',correctionOf:target.eventId,correctedAt:at(d,'08:00'),actual:{...target.actual,minutes:(target.actual.minutes??30)+2}};
 c.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:[corr]},'b-corr');
 const old=c.env.actualLedger.find(o=>o.eventId===target.eventId),live=c.env.actualLedger.find(o=>o.eventId==='corr-a');
 assert.equal(old?.superseded,true);assert.equal(old.supersededBy,'corr-a');
 assert.ok(live&&!live.superseded&&live.correctionOf===target.eventId&&live.sessionId===target.sessionId);
 assert.ok(!c.env.program.weeks.some(w=>w.sessions.some(s=>s.id===live.sessionId)),'the corrected session is not a session of plan B');
 assert.ok(!c.env.actualLedger.some(o=>o.conflicted),'nothing conflicted');
});

test('QRE-AIF-02: an exact replay of a plan B report is one execution; a late plan A report does not collide with plan B', ()=>{
 const c=planAWithWeek0(S),startA=c.env.program.startDate,a1s=liveSessions(c.env,1).find(s=>s.sport==='RUN');restartAfter(c,18);const s0=liveSessions(c.env,0)[0],rep=reportOf(c.env,s0,{tag:'-b'});
 c.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[rep]},'b-first');
 const d=addDays(s0.date,1);c.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:[rep]},'b-replay');
 assert.equal(c.env.actualLedger.filter(o=>!o.fact&&o.sessionId===s0.id&&!o.superseded).length,1,'the replay merged, no second credit');
 // A plan A session never reported (week 1, before the restart), reported only now with plan A's id (a late activity): recorded, credited to no
 // plan B session, no conflict. Its id has plan B's week-day pattern without the namespace.
 assert.ok(a1s&&a1s.date>=startA);
 const a1={...rep,eventId:'late-a',sessionId:a1s.id,occurrenceDate:a1s.date};
 c.review('WEEKLY_REVIEW',at(d,'21:00'),{eligibility:ELIG(d),observations:[a1]},'late-a');
 const late=c.env.actualLedger.find(o=>o.eventId==='late-a');
 assert.ok(late,'the late report is on record');assert.ok(!c.env.program.weeks.some(w=>w.sessions.some(s=>s.id===late.sessionId)));
 assert.ok(!c.env.actualLedger.some(o=>o.conflicted),'no conflict with plan B');
});

test('QRE-AIF-02: a schedule change and a return after a pause inside plan B keep its namespace', ()=>{
 const c=planAWithWeek0(S);restartAfter(c,18);const ns=c.env.program.sessionNamespace,d=addDays(c.env.program.startDate,1);
 c.review('UNAVAILABLE_DAY',at(d,'07:00'),{eligibility:ELIG(d),unavailableDates:[addDays(c.env.program.startDate,3)]},'b-unavail');
 assert.ok(c.env.program.weeks.flatMap(w=>w.sessions).every(s=>s.id.startsWith(ns+'.')),'after an unavailable day');
 const d2=addDays(c.env.program.startDate,16);
 c.review('RETURN_AFTER_PAUSE',at(d2,'07:00'),{eligibility:ELIG(d2),interruption:{startDate:addDays(c.env.program.startDate,8),endDate:addDays(d2,-1),reasonCategory:'SCHEDULE'}},'b-return');
 assert.ok(c.env.program.weeks.flatMap(w=>w.sessions).every(s=>s.id.startsWith(ns+'.')),'after a return');
});

test('QRE-AIF-02: a third plan has a namespace of its own; the rows of both earlier plans stay as recorded', ()=>{
 const c=planAWithWeek0(S);restartAfter(c,18);const nsB=c.env.program.sessionNamespace,s0=liveSessions(c.env,0)[0];
 c.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[reportOf(c.env,s0,{tag:'-b'})]},'b-first');
 const before=c.env.actualLedger.filter(o=>!o.fact).map(strip);
 restartAfter(c,5);const nsC=c.env.program.sessionNamespace;
 assert.ok(nsC&&nsC!==nsB);
 const s=liveSessions(c.env,0)[0];c.review('WEEKLY_REVIEW',at(s.date),{eligibility:ELIG(s.date),observations:[reportOf(c.env,s,{tag:'-c'})]},'c-first');
 const after=c.env.actualLedger.filter(o=>!o.fact);
 for(const row of before)assert.ok(after.some(o=>strip(o)===row),'an earlier row is unchanged');
 assert.equal(after.filter(o=>o.sessionId===s.id).length,1);
});

test('QRE-AIF-02: the namespace is the restart\'s (facts and instant): the same restart gives the same plan; a second restart the same day gets its own', ()=>{
 const a=planAWithWeek0(S),b=planAWithWeek0(S);restartAfter(a,18);restartAfter(b,18);
 assert.equal(a.env.program.sessionNamespace,b.env.program.sessionNamespace,'same facts, same instant: the same plan (deterministic)');
 assert.equal(a.env.program.hash,b.env.program.hash);
 // The same athlete restarts again the same day, an hour later, after reporting the first session of plan B: plan C has its own ids.
 const s0=liveSessions(a.env,0)[0];a.review('WEEKLY_REVIEW',at(s0.date,'07:00'),{eligibility:ELIG(s0.date),observations:[reportOf(a.env,s0,{tag:'-b'})]},'b-first');
 const nsB=a.env.program.sessionNamespace,day=s0.date,upd={...athleteA({weeks:8,id:'core-a'}),asOf:day,startDate:addDays(day,3)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 assert.equal(a.restart(upd,at(day,'11:00')).status,'PROPOSED');
 assert.notEqual(a.env.program.sessionNamespace,nsB);
 assert.equal(a.env.actualLedger.filter(o=>o.sessionId===s0.id).length,1,'the plan B report stays its own row');
});

test('QRE-AIF-02 through the V1CIB custody: after a restart, a plain review and the first report are kept', ()=>{
 let clock=Date.parse('2026-11-14T12:00:00-03:00');const store=memoryStore(),cu=createCustody({store,key:'core-synthetic-key',now:()=>clock,engine:S}),actor={athleteId:'core-custody'};
 const plain=(program,s)=>{const {eventId:_e,athleteId:_a,...o}=reportOf({program,presentation:{runSessions:{}},actualLedger:[]},s);return o;};
 cu.enroll({actor,intake:athleteA({id:'core-custody'}),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});const p0=store.load(actor.athleteId).program;
 clock=Date.parse(at(addDays(p0.startDate,6)));assert.equal(cu.submit({actor,clientRequestId:'w0',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(addDays(p0.startDate,6)),observations:liveSessions({program:p0},0).map(s=>plain(p0,s))}}).ok,true);
 const day=addDays(p0.startDate,18),upd={...athleteA({weeks:8,id:'core-custody'}),asOf:day,startDate:addDays(p0.startDate,21)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 clock=Date.parse(at(day,'10:00'));assert.equal(cu.restart({actor,intake:upd,expectedVersion:store.load(actor.athleteId).version}).ok,true);
 const d1=store.load(actor.athleteId),dp=addDays(d1.program.startDate,0);clock=Date.parse(at(dp,'07:00'));
 const p=cu.submit({actor,clientRequestId:'plain',expectedVersion:d1.version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(dp)}});
 assert.equal(p.ok,true,JSON.stringify(p.error??null));
 const d2=store.load(actor.athleteId),s0=liveSessions({program:d2.program},0)[0];clock=Date.parse(at(s0.date));
 const r=cu.submit({actor,clientRequestId:'after-restart',expectedVersion:d2.version,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s0.date),observations:[plain(d2.program,s0)]}});
 assert.equal(r.ok,true,JSON.stringify(r.error??null));
});
