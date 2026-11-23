// V1 CoachingCore Integration Boundary, the single focal correction cycle after R1 (SEC_INT_R1 PASS_WITH_CONDITIONS, QRE_INT_R1 NOT_READY,
// SSCTR_INT_R1 ACCEPT_WITH_CONDITIONS). One test per finding the cycle fixes; each fails on the candidate a52db2b (evidence/red-cycle1-on-a52db2b.txt).
import test from 'node:test';
import assert from 'node:assert/strict';
import {LIMITS} from '../src/boundary/admission.mjs';
import {athlete,spy,memoryStore,memoryAnchor,ELIG,addDays,at,athleteA,notFeeling100WithSign,CONSENTS} from './v1int-helpers.mjs';
import {EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const code=r=>r.ok?'OK':r.error.code;
const U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};

test('QRE-INT-01 / AUTH-INT-01: after the athlete accepts an offered move, the moved session cites a format the kept record holds, and its report is recorded',()=>{
 const i=JSON.parse(JSON.stringify(EDGE_PROFILES.TEN_K_EIGHT_WEEKS));i.asOf='2026-11-01';i.startDate='2026-11-02';
 const u=athlete({id:'c1-offer',start:'2026-11-01T12:00:00-03:00'});assert.equal(u.enroll({...i,athlete:{...i.athlete,id:'c1-offer'}}).status,'PROPOSED');
 for(const w of [0,1,2,3]){const sun=addDays(u.doc().program.startDate,w*7+6);u.set(sun);assert.equal(code(u.weekly(sun,u.sessions(w).map(s=>u.form(s)))),'OK');}
 const q=u.doc().program.weeks[4].sessions.find(x=>x.role==='QUALITY');u.set(q.date,'21:00');
 const r=u.api.logRun({actor:u.actor,clientRequestId:'miss',expectedVersion:u.version(),eligibility:ELIG(q.date),sessionId:q.id,occurredOn:q.date,completed:false});
 assert.equal(r.offer?.kind,'MOVE');u.set(q.date,'21:05');assert.equal(u.api.accept({actor:u.actor,decisionId:r.offer.decisionId,expectedVersion:u.version()}).ok,true);
 const shown=u.it.presentation({actor:u.actor}).inForce,emitted=new Set(u.carried().runFormatRecord.filter(x=>x.fact==='RUN_FORMAT_EMITTED').map(x=>x.sessionId+'|'+x.formatHash));
 const missing=Object.entries(shown).filter(([sid,v])=>v?.formatHash&&!emitted.has(sid+'|'+v.formatHash)).map(([sid])=>sid);
 assert.deepEqual(missing,[],'every format the app shows is one the record holds');
 const moved=u.doc().program.weeks.flatMap(w=>w.sessions).find(x=>x.id==='w4-run-d2');u.set(moved.date,'21:00');const f=u.form(moved);
 const rep=u.weekly(moved.date,[{...f,actual:{...f.actual,formatHash:shown[moved.id].formatHash}}]);assert.notEqual(rep.status,'ASK');assert.equal(rep.recorded.length,1);
});

test('QRE-INT-03 / SEC-INT-03: acknowledging a loss sets nothing aside when the record is there as kept (a standing hold stays), nor when it is unreadable; only a lost or rolled-back record',()=>{
 const store=memoryStore(),anchor=memoryAnchor(),t=athlete({id:'c1-ack',store,anchor});t.enroll();const d=addDays(t.doc().program.startDate,2);
 t.set(d,'08:00');assert.equal(t.api.notFeeling100({actor:t.actor,clientRequestId:'hold',expectedVersion:t.version(),...notFeeling100WithSign(d)}).ok,true);
 const raw=store.raw('c1-ack');
 assert.equal(code(t.it.acknowledgeRecordLoss({actor:t.actor})),'NOT_LOST');assert.equal(store.raw('c1-ack'),raw,'the record and its hold are untouched');
 store.setRaw('c1-ack','{broken');assert.equal(code(t.it.acknowledgeRecordLoss({actor:t.actor})),'NOT_LOST');assert.equal(store.raw('c1-ack'),'{broken');
 store.setRaw('c1-ack',raw);const fork=JSON.parse(raw);fork.docMac='0'.repeat(64);store.setRaw('c1-ack',JSON.stringify(fork));
 assert.equal(code(t.it.read({actor:t.actor})),'RECORD_ROLLED_BACK','QRE-INT-11 I13: the same version with another seal is a fork');
 assert.equal(code(t.it.acknowledgeRecordLoss({actor:t.actor})),'OK');assert.equal(store.raw('c1-ack'),null);
});

test('SEC-INT-01: the device channel carries no screen of its own: after a symptom stop a workout delivered next is decided with the screen the athlete answered, and the screen is still asked',()=>{
 const t=athlete({id:'c1-scr'});t.enroll();const ss=t.sessions(0),d1=ss.find(s=>s.id==='w0-run-d1'),d3=ss.find(s=>s.id==='w0-run-d3');
 t.set(d1.date,'20:00');const stop=t.weekly(d1.date,[{...t.form(d1),actual:{completed:false,minutes:10,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]);
 assert.equal(stop.warningSignScreen.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 t.set(d3.date,'08:00');assert.equal(code(t.it.importActivities({actor:t.actor,clientRequestId:'x',expectedVersion:t.version(),activities:[t.watch(d3)],eligibility:ELIG(d3.date)})),'INVALID_REQUEST');
 const hk=t.it.importActivities({actor:t.actor,clientRequestId:'hk',expectedVersion:t.version(),activities:[t.watch(d3)]});
 assert.equal(code(hk),'OK');assert.equal(hk.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM','a workout delivery never answers the screen');
});

test('SSCTR-INT-01: the same athlete report sent again is a duplicate, so a report of how the athlete feels riding with it reaches the engine (a warning sign routes clinically); safety kinds are named on a refusal',()=>{
 const t=athlete({id:'c1-dup'});t.enroll();const s=t.sessions(0).find(x=>x.sport==='STRENGTH');t.set(s.date,'08:00');const f=t.form(s);assert.equal(t.weekly(s.date,[f]).recorded.length,1);
 t.set(s.date,'09:00');const r=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(s.date),reports:[]});
 const both=t.submit({kind:'NOT_FEELING_100',...notFeeling100WithSign(s.date),observations:[f]},{rid:'nf-dup',expectedVersion:t.version()});
 assert.equal(code(both),'OK');assert.deepEqual(both.duplicates,[0]);assert.equal(both.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');
 const refused=t.submit({kind:'NOT_FEELING_100',...notFeeling100WithSign(s.date),observations:Array(40).fill(f)});
 assert.ok(refused.safetyFields.includes('kind:NOT_FEELING_100'));assert.ok(refused.safetyFields.includes('wellbeing'));
});

test('QRE-INT-05: a delivery is answered per workout (index, activity id, outcome, event id), duplicates included; a duplicate-only answer holds arrays; an empty delivery is refused and writes nothing; SEC-INT-11 one workout twice is refused',()=>{
 const t=athlete({id:'c1-q'});t.enroll();const ss=t.sessions(0).filter(s=>s.sport==='RUN');t.set(ss[1].date,'21:00');
 const a=t.import([t.watch(ss[0])],{eligibility:ELIG(ss[1].date)});assert.deepEqual(a.activities.map(x=>[x.index,x.activityId,x.outcome]),[[0,'HK-'+ss[0].id,'RECORDED']]);
 const b=t.import([t.watch(ss[0]),t.watch(ss[1])]);assert.deepEqual(b.activities.map(x=>[x.index,x.outcome]),[[0,'DUPLICATE'],[1,'RECORDED']]);assert.equal(b.activities[1].eventId,b.recorded[0]);
 const v=t.version(),c=t.import([t.watch(ss[1])]);assert.equal(c.duplicate,true);assert.deepEqual([c.recorded,c.notRecorded],[[],[]]);assert.deepEqual(c.activities.map(x=>x.outcome),['DUPLICATE']);
 assert.equal(code(t.import([])),'NOTHING_TO_IMPORT');assert.equal(t.version(),v);
 const w=t.watch(ss[2]);assert.equal(code(t.import([w,{...w,actual:{...w.actual,minutes:41}}])),'DUPLICATE_IN_REQUEST');
});

test('QRE-INT-02 (boundary part), QRE-INT-11 A03: an instant without its offset, or a device report without its end, is refused (never read in the runtime zone)',()=>{
 const t=athlete({id:'c1-t'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'21:00');
 assert.equal(code(t.import([{...t.watch(s),observedAt:s.date+'T07:45:00'}],{eligibility:ELIG(s.date)})),'INVALID_TIME');
 const {observedAt:_,...noEnd}=t.watch(s);assert.equal(code(t.import([noEnd])),'INVALID_TIME');
 assert.equal(code(t.weekly(s.date,[{...t.form(s),observedAt:s.date+'T07:45'}])),'INVALID_TIME');
});

test('SEC-INT-05: the intake of a first plan or a restart is bounded (size, depth), refused whole, nothing stored',()=>{
 const store=memoryStore(),t=athlete({id:'c1-in',store}),i=athleteA({weeks:8,id:'c1-in'});
 let deep={};for(let k=0;k<50;k++)deep={x:deep};
 assert.equal(t.enroll({...i,athlete:{...i.athlete,notes:deep}}).error.limit,'depth');
 assert.equal(t.enroll({...i,athlete:{...i.athlete,pad:'p'.repeat(LIMITS.stringLength),pads:Array(200).fill('p'.repeat(400))}}).error.limit,'intakeBytes');
 assert.equal(store.raw('c1-in'),null);assert.equal(t.enroll(i).ok,true);
 assert.equal(t.it.restart({actor:t.actor,intake:{...i,athlete:{...i.athlete,notes:deep}},expectedVersion:1}).error.limit,'depth');
});

test('SEC-INT-04 (part): a consent revocation is never held back by a clock behind the record, and the latest instant on record does not move back',()=>{
 const t=athlete({id:'c1-clk'});t.enroll();const s=t.sessions(0)[0];t.set(s.date,'21:00');t.weekly(s.date,[]);const last=t.doc().carried.lastAt;
 t.set(s.date,'20:00');assert.equal(code(t.weekly(s.date,[])),'CLOCK_BEHIND_RECORD');
 assert.equal(code(t.it.setConsent({actor:t.actor,purpose:'LEARNING',granted:false,expectedVersion:t.version()})),'OK');
 assert.equal(t.doc().carried.lastAt,last);assert.equal(code(t.it.setConsent({actor:t.actor,purpose:'LEARNING',granted:true,expectedVersion:t.version()})),'CLOCK_BEHIND_RECORD');
});

test('QRE-INT-08: a record kept whose anchor could not be written says so (anchorStale), so the native layer writes the anchor again',()=>{
 const anchor=memoryAnchor(),t=athlete({id:'c1-anc',anchor});t.enroll();const s=t.sessions(0)[0];t.set(s.date);
 const set=anchor.set;anchor.set=()=>{throw new Error('keychain');};const r=t.weekly(s.date,[]);anchor.set=set;
 assert.equal(r.ok,true);assert.equal(r.anchorStale,true);
});

test('SEC-INT-08 / QRE-INT-10: an erasure of health facts also takes the last readings and the boundary record of the erased request: a retry of it is admitted as new, never a stored answer',()=>{
 const t=athlete({id:'c1-er'});t.enroll();const d=addDays(t.doc().program.startDate,2);t.set(d,'08:00');
 const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-er',expectedVersion:t.version(),...notFeeling100WithSign(d)});assert.equal(nf.ok,true);
 t.set(d,'09:00');assert.equal(t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()}).ok,true);
 assert.equal(t.it.presentation({actor:t.actor}).readings,null);assert.equal(Object.hasOwn(t.doc().carried.requests,'nf-er'),false);
});

test('QRE-INT-11 I06, I12: a retry at a later clock replays on both channels (the first clock is kept); the presentation keeps only the plan in force and a pending change',()=>{
 const t=athlete({id:'c1-rt'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');t.screen(ELIG(s.date));
 const v=t.version(),hk=t.it.importActivities({actor:t.actor,clientRequestId:'hk-r',expectedVersion:v,activities:[t.watch(s)]}),fm=t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(s)]},{rid:'fm-r'});
 t.set(s.date,'23:00');
 assert.equal(t.it.importActivities({actor:t.actor,clientRequestId:'hk-r',expectedVersion:v,activities:[t.watch(s)]}).replayed,true);
 assert.equal(t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(s)]},{rid:'fm-r',expectedVersion:v}).replayed,true);
 assert.deepEqual(Object.keys(t.doc().carried.presentation.sessions),[t.doc().program.hash]);assert.ok(hk.ok&&fm.ok);
});

test('QRE-INT-11 A04L: the limits are the reviewed values (a change to them is a reviewed change, not a silent one)',()=>{
 assert.deepEqual({...LIMITS},{observationBytes:16384,requestBytes:131072,observationsPerRequest:32,depth:8,arrayLength:64,keysPerObject:32,stringLength:512,idLength:128,
  correctionsPerReport:16,deviceActivitiesPerSession:4,reportsPerDayPerChannel:8,intakeBytes:65536,intakeArrayLength:512});
});

test('SEC-INT-01 / QRE C-R2-1 (S02): the screen the athlete answers in their own review is the one a later delivery carries: a workout 40 days on is recorded after a screen answered on day 35',()=>{
 const t=athlete({id:'c1-s02'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(addDays(run.date,35),'09:00');assert.equal(code(t.screen(ELIG(addDays(run.date,35)))),'OK');
 t.set(addDays(run.date,40),'09:00');const r=t.it.importActivities({actor:t.actor,clientRequestId:'hk-40',expectedVersion:t.version(),activities:[t.watch(run)]});
 assert.deepEqual(r.activities.map(a=>a.outcome),['RECORDED']);
});
