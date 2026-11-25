// REPMILE V1 test-suite sanitization (2026-11-25): the safety and integrity points of the 51 historical failures, reproduced against the
// integration API the app uses (createIntegration + api.mjs createBoundary over the composed engine), not against the frozen functions the
// historical tests drove. Each test names the historical identifiers it answers. Synthetic athletes only; no training rule is stated here: every
// expectation is a property (nothing lost, nothing counted twice, nothing of another athlete read), never a new prescription.
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,spy,ELIG,U,addDays,memoryAnchor,json,athleteA,CONSENTS} from './v1int-helpers.mjs';

const code=r=>r.ok?'OK':r.error.code;
const lastEval=sp=>sp.calls.filter(c=>c.op==='evaluate').at(-1).out;
const rowOf=(out,sid)=>out.weekEvidence.rows.find(r=>r.sessionId===sid);
/** The calibration less the review instant and the hash that covers it (the only fields a later review moves by itself). */
const calOf=c=>{const {asOf:_a,hash:_h,...rest}=json(c);return rest;};
/** One synthetic athlete, the first easy run of week 0, the athlete's screen answered. */
function rig(id){
 const sp=spy(),t=athlete({id,engine:sp.engine});t.enroll();
 const run=t.sessions(0).find(s=>s.sport==='RUN');t.set(run.date,'21:00');assert.equal(code(t.screen(ELIG(run.date))),'OK');
 return {sp,t,run,tick:()=>{t.clock+=60e3;}};
}
const ADVERSE={recovery:'ADVERSE',effort:'HARDER'};

// ---------- 1. HARD GATE E-1 / SSCTR L5 / QRE-RWS-*: a device re-sync never erases what the athlete said ----------
for(const order of ['athlete first','device first']){
 test(`E-1 at the boundary (${order}): a HealthKit re-sync of a merged run keeps the athlete's effort and recovery in the row, the week's adverse count and one row`,()=>{
  const {sp,t,run,tick}=rig(`san-e1-${order[0]}`);
  const form=()=>t.weekly(run.date,[t.form(run,{response:ADVERSE})]),watch=()=>t.import([t.watch(run)]);
  if(order==='athlete first'){assert.equal(code(form()),'OK');tick();assert.equal(code(watch()),'OK');}
  else{assert.equal(code(watch()),'OK');tick();assert.equal(code(form()),'OK');}
  tick();t.weekly(run.date,[]);
  const before=lastEval(sp),m=rowOf(before,run.id);
  assert.deepEqual([m.kind,before.weekEvidence.adverseSessions,t.live(run.id).length],['ADVERSE',1,1],'the merged row: the athlete\'s answer counts');
  // The watch re-syncs the same workout with other values: the device's own correction (bound by the activity, never by a payload id).
  tick();const re=t.import([t.watch(run,{actual:{minutes:t.watch(run).actual.minutes+3}})]);assert.equal(code(re),'OK');
  tick();t.weekly(run.date,[]);
  const after=lastEval(sp),live=t.live(run.id);
  assert.equal(live.length,1,'one row in force: the re-sync replaced the device\'s part, it added no second execution');
  assert.deepEqual([live[0].response.recovery,live[0].response.effort],['ADVERSE','HARDER'],'E-1 closed: the athlete\'s answers stay on the row in force');
  assert.equal(after.weekEvidence.adverseSessions,1,'the adverse session is still counted');
  assert.equal(rowOf(after,run.id).kind,'ADVERSE');
  assert.equal(after.weekEvidence.completed,before.weekEvidence.completed,'completion credit unchanged by the re-sync');
 });
}
test('E-1 at the boundary, late: a re-sync in the middle of the following week still keeps the athlete\'s answers and adds no execution',()=>{
 const {sp,t,run,tick}=rig('san-e1-late');
 assert.equal(code(t.weekly(run.date,[t.form(run,{response:ADVERSE})])),'OK');tick();assert.equal(code(t.import([t.watch(run)])),'OK');
 const later=addDays(run.date,9);t.set(later,'09:00');assert.equal(code(t.screen(ELIG(later))),'OK');t.clock+=60e3;
 assert.equal(code(t.import([t.watch(run,{actual:{minutes:t.watch(run).actual.minutes+2}})])),'OK');
 const live=t.live(run.id);assert.equal(live.length,1);assert.deepEqual([live[0].response.recovery,live[0].response.effort],['ADVERSE','HARDER']);
 assert.ok(sp.calls.length>0);
});

// ---------- 2. A12 / B4-B5 / B7 / O-1: an import and the athlete's report in head-on conflict ----------
test('A12, B4-B5, O-1 at the boundary: the athlete says "not done", the watch says done: one flagged row, not an execution, the athlete\'s voice kept',()=>{
 const {sp,t,run,tick}=rig('san-o1');
 assert.equal(code(t.import([t.watch(run)])),'OK');tick();
 assert.equal(code(t.weekly(run.date,[t.form(run,{actual:{completed:false,minutes:0}})])),'OK');tick();t.weekly(run.date,[]);
 const live=t.live(run.id),out=lastEval(sp);
 assert.equal(live.length,1,'one row: the dispute is never two executions');
 assert.equal(live[0].conflicted,true,'the row is flagged');
 assert.notEqual(rowOf(out,run.id).status,'COMPLETED','a disputed occurrence is not credited as done');
 assert.ok(Object.keys(live[0].provenance?.parts??{}).length>=2,'both voices are kept on the row (the athlete\'s is never dropped)');
});
test('O-1 / C-O1-2 at the boundary: a disputed amount (other minutes) is never dose twice and never the larger amount',()=>{
 const {sp,t,run,tick}=rig('san-o1-dose');
 const w=t.watch(run);assert.equal(code(t.import([w])),'OK');tick();
 assert.equal(code(t.weekly(run.date,[t.form(run,{actual:{minutes:w.actual.minutes+30}})])),'OK');tick();t.weekly(run.date,[]);
 const live=t.live(run.id);assert.equal(live.length,1);
 assert.ok(!(live[0].actual.minutes>w.actual.minutes),'the disputed row never carries the larger amount as dose');
 assert.ok(lastEval(sp).weekEvidence.completed<=1);
});

test('QRE-RWS-F-01 (still open in the engine, pinned by v1rfc-evidence) is not reachable through the boundary: a device report stating conditions is refused, and the athlete\'s heat stays on the merged row',()=>{
 const {t,run,tick}=rig('san-f01');
 assert.equal(code(t.weekly(run.date,[t.form(run,{actual:{conditions:['HEAT']}})])),'OK');tick();
 const w=t.watch(run),mixed=t.import([{...w,actual:{...w.actual,conditions:['RAIN']}}]);
 assert.equal(code(mixed),'REPORT_VOICE_MIXED','the device states no athlete fact (report-voices, wired at ingest)');
 tick();assert.equal(code(t.import([w])),'OK');
 const live=t.live(run.id);assert.equal(live.length,1);assert.deepEqual(live[0].actual.conditions,['HEAT'],'the athlete\'s comparability fact is kept');
});

// ---------- 3. QRE-RWS-B-01 / C-01: duplicates and re-readings do not move the calibration ----------
test('QRE-RWS-B-01 / C-01 at the boundary: the same workout imported again, and the same form sent again, are duplicates: nothing recorded, the calibration unchanged',()=>{
 const {sp,t,run,tick}=rig('san-b01');
 assert.equal(code(t.weekly(run.date,[t.form(run)])),'OK');tick();assert.equal(code(t.import([t.watch(run)])),'OK');tick();t.weekly(run.date,[]);
 const cal=calOf(lastEval(sp).runCalibration),v=t.version(),n=sp.calls.length;
 tick();const d1=t.import([t.watch(run)]);assert.equal(d1.duplicate,true);
 tick();const d2=t.weekly(run.date,[t.form(run)]);assert.equal(d2.duplicate,true);
 assert.equal(t.version(),v,'nothing written');assert.equal(sp.calls.length,n,'no engine call');
 tick();t.weekly(run.date,[]);assert.deepEqual(calOf(lastEval(sp).runCalibration),cal,'the calibration is where the facts put it');
 assert.equal(t.live(run.id).length,1);
});

// ---------- 4. Warning signs and screen answers survive re-syncs (SSCTR-RWS-B-01, SEC-R2-01) ----------
test('SSCTR-RWS-B-01 / SEC-R2-01 at the boundary: a symptom stop the athlete reported survives a HealthKit import and re-sync of the same run; the screen is still asked',()=>{
 const {sp,t,run,tick}=rig('san-stop');
 const stop=t.weekly(run.date,[t.form(run,{actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U,recovery:'ADVERSE'}})]);
 assert.equal(code(stop),'OK');assert.equal(stop.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 tick();const hk=t.it.importActivities({actor:t.actor,clientRequestId:'hk-a',expectedVersion:t.version(),activities:[t.watch(run,{actual:{minutes:12}})]});
 tick();const hk2=t.it.importActivities({actor:t.actor,clientRequestId:'hk-b',expectedVersion:t.version(),activities:[t.watch(run,{actual:{minutes:13}})]});
 assert.deepEqual([code(hk),code(hk2)],['OK','OK'],'the import and its re-sync are recorded');
 const live=t.live(run.id);assert.equal(live.length,1,'one row for the session');
 assert.equal(live[0].conflicted,true,'the athlete\'s "stopped" and the watch\'s "completed" are a dispute, never the watch alone');
 assert.ok(Object.values(live[0].provenance?.parts??{}).some(p=>p.actual?.stop?.reason==='SYMPTOM'),'the athlete\'s stop is still a voice of the row in force');
 tick();const next=t.weekly(run.date,[]);
 assert.equal(next.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM','the stop still asks for its screen after the re-sync');
 assert.ok(sp.calls.length>0);
});

// ---------- 5. Records of another athlete or plan ----------
test('another athlete at the boundary: an unenrolled actor and an ENROLLED athlete of the same custody read and change nothing of this one\'s record; a correction of this athlete\'s report by the other is refused',()=>{
 const t=athlete({id:'san-own'});t.enroll();
 // The same custody (store, key, clock) holds a second, enrolled athlete (QRE-SAN-06), enrolled on the same day.
 const other={athleteId:'san-intruder'},en=t.it.enroll({actor:other,intake:athleteA({weeks:8,id:'san-intruder'}),consents:CONSENTS});assert.equal(en.enrolled,true,JSON.stringify(en.status));
 const run=t.sessions(0).find(s=>s.sport==='RUN');t.set(run.date,'21:00');assert.equal(code(t.screen(ELIG(run.date))),'OK');const tick=()=>{t.clock+=60e3;};
 tick();assert.equal(code(t.weekly(run.date,[t.form(run,{response:ADVERSE})])),'OK');
 const id=t.live(run.id)[0].eventId,v=t.version(),before=JSON.stringify(t.rows());
 const stranger={athleteId:'san-stranger'};tick();
 assert.equal(t.it.importActivities({actor:stranger,clientRequestId:'x1',expectedVersion:v,activities:[t.watch(run)]}).ok,false);
 assert.equal(t.it.submit({actor:stranger,clientRequestId:'x2',expectedVersion:v,review:{kind:'WEEKLY_REVIEW',observations:[{...t.form(run),correctionOf:id}]}}).ok,false);
 const ov=()=>t.it.read({actor:other}).doc.version;tick();
 const corr=t.it.submit({actor:other,clientRequestId:'x3',expectedVersion:ov(),review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[{...t.form(run),correctionOf:id}]}});
 assert.equal(corr.ok,false,'a correction naming this athlete\'s report is refused for the other athlete');
 assert.ok(['CORRECTION_TARGET_NOT_FOUND','CORRECTION_ORIGIN_UNKNOWN'].includes(corr.error.code),corr.error.code);
 tick();t.it.importActivities({actor:other,clientRequestId:'x4',expectedVersion:ov(),activities:[t.watch(run)]});
 assert.equal(t.version(),v);assert.equal(JSON.stringify(t.rows()),before,'this athlete\'s record is byte-identical');
 const theirs=t.it.visible(t.it.read({actor:other}).doc);assert.ok(Array.isArray(theirs));
 assert.ok(theirs.every(r=>r.eventId!==id&&(r.athleteId===undefined||r.athleteId==='san-intruder')),'the other record holds none of this athlete\'s rows');
});
test('QRE-RFC-A-03 / QRE-AIF-02 at the boundary: after a restart, no session id of the new plan is an id of the old plan, and the old plan\'s row is no execution of the new plan',()=>{
 const sp=spy(),t=athlete({id:'san-rfc',engine:sp.engine});t.enroll();const w0=t.sessions(0),sun=addDays(t.doc().program.startDate,6);t.set(sun,'20:00');
 assert.equal(code(t.weekly(sun,w0.map(s=>t.form(s)),{eligibility:ELIG(sun)})),'OK');
 const oldIds=new Set(t.doc().program.weeks.flatMap(w=>w.sessions).map(s=>s.id));
 const day=addDays(sun,4),upd={...athleteA({weeks:8,id:'san-rfc'}),asOf:day,startDate:addDays(day,3)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 t.set(day,'10:00');const rs=t.it.restart({actor:t.actor,intake:upd,expectedVersion:t.version()});assert.equal(rs.status,'PROPOSED',JSON.stringify(rs.error??null));
 const newIds=t.doc().program.weeks.flatMap(w=>w.sessions).map(s=>s.id);assert.ok(newIds.length>0);
 assert.deepEqual(newIds.filter(x=>oldIds.has(x)),[],'no session id of the new plan is an id of the old plan');
 t.set(addDays(day,3),'20:00');assert.equal(code(t.weekly(addDays(day,3),[],{eligibility:ELIG(addDays(day,3))})),'OK');
 const rows=lastEval(sp).weekEvidence.rows;assert.ok(rows.length>0);
 assert.ok(rows.every(r=>r.status!=='COMPLETED'),'no session of the new plan is credited by a row of the old plan');
});

// ---------- 6-7. Duplicates never count effort twice; the recognized amount never grows by re-sending ----------
test('duplicates at the boundary: one workout sent twice in one request is refused; sent again later it is a duplicate; credit and minutes counted once',()=>{
 const {sp,t,run,tick}=rig('san-dup');const w=t.watch(run);
 assert.equal(code(t.import([w,w])),'DUPLICATE_IN_REQUEST');
 assert.equal(code(t.import([w])),'OK');tick();t.weekly(run.date,[]);const once=json(lastEval(sp).completedWork);
 for(let i=0;i<3;i++){tick();assert.equal(t.import([w]).duplicate,true);}
 tick();t.weekly(run.date,[]);assert.deepEqual(json(lastEval(sp).completedWork),once,'the recognized work is the same after three re-sends');
 assert.equal(t.live(run.id).length,1);
});
test('the athlete\'s second form of a session is not a second execution: it is refused as ALREADY_REPORTED unless sent as their correction',()=>{
 const {t,run,tick}=rig('san-twice');assert.equal(code(t.weekly(run.date,[t.form(run)])),'OK');tick();
 assert.equal(code(t.weekly(run.date,[t.form(run,{actual:{minutes:t.form(run).actual.minutes+10}})])),'ALREADY_REPORTED');
 assert.equal(t.live(run.id).length,1);
});

// ---------- 8. Custody integrity, versioning and recovery ----------
test('custody at the boundary: a stale version is refused, a reused request id replays, a tampered record or a rolled-back one is never read as a plan',()=>{
 const anchor=memoryAnchor(),t=athlete({id:'san-cust',anchor});t.enroll();const run=t.sessions(0).find(s=>s.sport==='RUN');t.set(run.date,'21:00');
 const v=t.version(),first=t.weekly(run.date,[t.form(run)],{});assert.equal(code(first),'OK');
 assert.equal(code(t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date)},{expectedVersion:v})),'CONFLICT_STALE_VERSION');
 // A retry of the same request (same id, same body): its stored answer, nothing written again (QRE-SAN-06).
 const v1=t.version(),again=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[t.form(run)]},{rid:'rq-1',expectedVersion:v});
 assert.equal(again.ok,true,JSON.stringify(again.error??null));assert.equal(again.decisionId,first.decisionId,'the same decision is answered');assert.equal(t.version(),v1,'nothing written');
 assert.equal(code(t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date)},{rid:'rq-1',expectedVersion:v1})),'CONFLICT_IDEMPOTENCY_KEY','the same id with another body is refused');
 const raw=t.store.raw?.(t.id);assert.equal(typeof raw,'string','the memory store exposes its raw document (no silent skip)');
 const old=raw;t.clock+=60e3;assert.equal(code(t.screen(ELIG(run.date))),'OK');
 t.store.setRaw(t.id,old);const back=t.it.read({actor:t.actor});assert.equal(back.ok,false);assert.equal(back.error.code,'RECORD_ROLLED_BACK');
 const doc=JSON.parse(old);doc.carried.records.runFormatRecord=[];t.store.setRaw(t.id,JSON.stringify(doc));anchor.clear(t.id);
 const bad=t.it.read({actor:t.actor});assert.equal(bad.ok,false);assert.equal(bad.error.code,'INTEGRITY_FAILURE');
});
