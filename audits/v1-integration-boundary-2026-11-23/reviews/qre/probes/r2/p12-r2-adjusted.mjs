// QRE R2 probe P12: the R1 probes adjusted to the cycle's API (a delivery states no screen) and the probe artifacts of R1 removed.
// (1) P01 with the report sent on the moved session's own day; also decline and an accept after a later review (the change closed).
// (2) P03 (b) the mixed delivery answer per activity; (d) the residual QRE-INT-02 path: a stale screen (ASK), the athlete answers a screen, re-delivery.
// (3) P09 (b) the old plan's workout re-sent unlinked after a restart (the §9 queue rule).
// (4) P11 DEVICE: a landed write retried 5 minutes later (no eligibility argument).
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/r2/p12-r2-adjusted.mjs
import {athlete,memoryStore,ELIG,addDays,athleteA} from '../../../../../../CoachingCore/test/v1int-helpers.mjs';
import {EDGE_PROFILES} from '../../../../../../CoachingCore/r6/fixtures/profiles.mjs';
const RF=await import('../../../../../../CoachingCore/src/v1-run-format.mjs');const V=RF.runFormatAuthority({}).values;
const code=r=>r.ok?'OK'+(r.status?':'+r.status:''):r.error.code;
// (1)
function offered(id){const i=JSON.parse(JSON.stringify(EDGE_PROFILES.TEN_K_EIGHT_WEEKS));i.asOf='2026-11-01';i.startDate='2026-11-02';
 const u=athlete({id,start:'2026-11-01T12:00:00-03:00'});u.enroll({...i,athlete:{...i.athlete,id}});
 for(const w of [0,1,2,3]){const sun=addDays(u.doc().program.startDate,w*7+6);u.set(sun);u.weekly(sun,u.sessions(w).map(s=>u.form(s)));}
 const q=u.doc().program.weeks[4].sessions.find(x=>x.role==='QUALITY');u.set(q.date,'21:00');
 const r=u.api.logRun({actor:u.actor,clientRequestId:'miss',expectedVersion:u.version(),eligibility:ELIG(q.date),sessionId:q.id,occurredOn:q.date,completed:false});return {u,q,r};}
const reportMoved=(u,label)=>{const shown=u.it.presentation({actor:u.actor}).inForce,moved=u.doc().program.weeks.flatMap(w=>w.sessions).find(x=>x.moved);
 const sid=moved?.id??'w4-run-d2',s=u.doc().program.weeks.flatMap(w=>w.sessions).find(x=>x.id===sid);u.set(s.date,'21:00');const f=u.form(s);
 const rep=u.weekly(s.date,[{...f,actual:{...f.actual,formatHash:shown[sid]?.formatHash}}]);
 const emitted=new Set(u.carried().runFormatRecord.filter(x=>x.fact==='RUN_FORMAT_EMITTED').map(x=>x.sessionId+'|'+x.formatHash));
 console.log('(1)',label,'| moved:',!!moved,'| report:',code(rep),'recorded',rep.recorded?.length,JSON.stringify(rep.notRecorded),'| shown formats not on record:',Object.entries(u.it.presentation({actor:u.actor}).inForce).filter(([k,v])=>v?.formatHash&&!emitted.has(k+'|'+v.formatHash)).length);};
{const {u,q,r}=offered('r2-acc');u.set(q.date,'21:05');console.log('(1) accept',code(u.api.accept({actor:u.actor,decisionId:r.offer.decisionId,expectedVersion:u.version()})));reportMoved(u,'after accept');}
{const {u,q,r}=offered('r2-dec');u.set(q.date,'21:05');console.log('(1) decline',code(u.api.decline({actor:u.actor,decisionId:r.offer.decisionId,expectedVersion:u.version()})));reportMoved(u,'after decline');}
{const {u,q,r}=offered('r2-late');u.set(q.date,'21:30');u.weekly(q.date,[]);u.set(q.date,'21:40');
 console.log('(1) accept after a later review:',code(u.api.accept({actor:u.actor,decisionId:r.offer.decisionId,expectedVersion:u.version()})),'| pendingRecords kept:',!!u.doc().carried.pendingRecords);}
// (2)
{const t=athlete({id:'r2-mix'});t.enroll();const ss=t.sessions(0),r1=ss.find(s=>s.id==='w0-run-d1'),r3=ss.find(s=>s.id==='w0-run-d3');t.set(r1.date,'09:00');t.import([t.watch(r1)],{eligibility:ELIG(r1.date)});
 t.set(r3.date,'21:00');const m=t.import([t.watch(r1),t.watch(r3)]);console.log('(2b) mixed:',JSON.stringify(m.activities));}
{const t=athlete({id:'r2-stale'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');const late=addDays(s.date,40);t.set(late,'09:00');
 const a=t.import([t.watch(s,{activityId:'HK-late'})]);console.log('(2d) stale screen:',code(a),JSON.stringify(a.activities));
 t.set(late,'10:00');const b=t.import([t.watch(s,{activityId:'HK-late'})],{eligibility:ELIG(late)});console.log('     after the athlete answers a screen, re-delivered:',code(b),JSON.stringify(b.activities));
 const facts=RF.readReportFacts(t.carried().runFormatRecord,t.doc().program.athleteId,V,t.rows());console.log('     lineage:',JSON.stringify(RF.reportsReading(t.live(s.id)[0],facts,V)));}
// (3)
{const t=athlete({id:'r2-old'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');const w=t.watch(s,{activityId:'HK-late'});
 const day=addDays(s.date,3),u={...athleteA({weeks:8,id:'r2-old'}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 t.set(day,'10:00');t.it.restart({actor:t.actor,intake:u,expectedVersion:t.version()});t.set(day,'11:00');
 const linked=t.import([w]);const {sessionId:_s,...unlinked}=w;const un=t.import([unlinked]);
 console.log('(3) old plan workout linked:',code(linked),'| re-sent unlinked:',code(un),JSON.stringify(un.activities));}
// (4)
{const base=memoryStore();let mode='ok';const store={...base,commit(i,v,d){const r=base.commit(i,v,d);if(mode==='throw-after'){mode='ok';throw new Error('fsync');}return r;}};
 const t=athlete({id:'r2-rt',store});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');const v=t.version();
 const send=()=>t.it.importActivities({actor:t.actor,clientRequestId:'same',expectedVersion:v,activities:[t.watch(s)]});
 mode='throw-after';const a=send();t.clock+=5*60e3;const b=send();console.log('(4) DEVICE landed write:',code(a),'| retry 5 min later:',b.ok?'OK replayed='+b.replayed+' '+JSON.stringify(b.activities):code(b),'| version',v,'->',t.version());}
