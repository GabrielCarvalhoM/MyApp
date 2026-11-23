// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23): SEC-CORE-03 (authorship of reports and corrections) and C-NCC-3 (b)
// (one clock for the report times). Who speaks is the entry point the platform layer calls (the athlete's form: submit; HealthKit:
// importActivities), never a payload field. What this proves is the portable boundary only: where the channel comes from on the device, and how
// it is protected, is a native obligation (the Mac/iOS package), so SEC-CORE-03 is not declared closed by these tests. Synthetic only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,memoryStore,fileStore,scratchDir,ELIG,addDays,at,U,spy,athleteA} from './v1int-helpers.mjs';

/** Week 0 of a fresh athlete, the clock on the session's evening. */
const setup=(id,opts)=>{const t=athlete({id,...opts});t.enroll();const ss=t.sessions(0);return {t,run:ss.find(s=>s.id==='w0-run-d1'),run3:ss.find(s=>s.id==='w0-run-d3'),str:ss.find(s=>s.sport==='STRENGTH')};};
const code=r=>r.ok?'OK':r.error.code;

test('SEC-CORE-03 case 1: the athlete corrects their own report: admitted, the original kept as history, the correction in force',()=>{
 const {t,str}=setup('au-1');t.set(str.date);const r=t.weekly(str.date,[t.form(str)]),id=r.recorded[0];
 t.set(str.date,'21:00');const f=t.weekly(str.date,[{...t.form(str),correctionOf:id,actual:{...t.form(str).actual,minutes:20}}]);
 assert.equal(code(f),'OK');assert.equal(f.recorded.length,1);
 assert.equal(t.rows().find(o=>o.eventId===id).superseded,true);assert.equal(t.live(str.id).length,1);assert.equal(t.live(str.id)[0].actual.minutes,20);
});

test('SEC-CORE-03 case 2: the athlete contests an imported workout: a correction of the device\'s report is refused; the athlete\'s own account of the session is admitted as their voice beside it',()=>{
 const {t,run}=setup('au-2');t.set(run.date,'08:00');const hk=t.import([t.watch(run)],{eligibility:ELIG(run.date)});assert.equal(hk.recorded.length,1);
 t.set(run.date,'20:00');const x=t.weekly(run.date,[{...t.form(run),correctionOf:hk.recorded[0],actual:{completed:false,minutes:0}}]);
 assert.equal(code(x),'CROSS_AUTHOR_CORRECTION');assert.equal(t.live(run.id)[0].actual.minutes,40,'the device\'s report is untouched');
 const own=t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:70,rpe:6}}]);
 assert.equal(code(own),'OK');const row=t.live(run.id)[0];
 assert.ok(Object.keys(row.provenance.parts).includes(own.recorded[0]),'the athlete\'s account is a voice of the session\'s row');assert.equal(row.conflicted,true,'and the engine reads the dispute (O-1)');
});

test('SEC-CORE-03 cases 3 and 4: a correction of an event that does not exist, or of another athlete\'s event, is refused alike (no oracle of other athletes)',()=>{
 const store=memoryStore(),{t,str}=setup('au-3',{store}),{t:o}=setup('au-3b',{store});
 o.set(str.date);const theirs=o.weekly(str.date,[o.form(o.sessions(0).find(s=>s.sport==='STRENGTH'))]).recorded[0];
 t.set(str.date);for(const id of ['ob_nothing',theirs])assert.equal(code(t.weekly(str.date,[{...t.form(str),correctionOf:id}])),'CORRECTION_TARGET_NOT_FOUND');
 assert.equal(t.rows().filter(r=>!r.fact).length,0,'nothing recorded');
});

test('SEC-CORE-03 case 5: an event id is the boundary\'s: one sent is refused; a report id custody would derive again is refused (v1int-custody); an id is scoped to its athlete record',()=>{
 const {t,str}=setup('au-5');t.set(str.date);
 assert.equal(code(t.weekly(str.date,[{...t.form(str),eventId:'chosen'}])),'BOUNDARY_OWNED_FIELD');
 assert.equal(code(t.weekly(str.date,[{...t.form(str),athleteId:'au-other'}])),'BOUNDARY_OWNED_FIELD');
});

test('SEC-CORE-03 case 6: a device activity is one report: the same workout again changes nothing; with other values it is the device\'s own correction; claimed for another session it is refused; the athlete cannot name one',()=>{
 const {t,run,run3}=setup('au-6');t.set(run.date,'08:00');const w=t.watch(run),first=t.import([w],{eligibility:ELIG(run.date)}),v=t.version();
 t.set(run.date,'08:05');const dup=t.import([w]);assert.equal(dup.duplicate,true);assert.equal(t.version(),v,'no new version');
 const moved=t.import([{...w,sessionId:run3.id}]);assert.equal(code(moved),'ACTIVITY_LINKED_ELSEWHERE');assert.equal(moved.error.eventId,first.recorded[0]);
 t.set(run.date,'09:00');const resync=t.import([{...w,actual:{...w.actual,minutes:42}}],{eligibility:ELIG(run.date)});
 assert.equal(code(resync),'OK');assert.equal(t.rows().find(o=>o.eventId===first.recorded[0]).superseded,true,'the earlier report of that workout is history');
 assert.equal(t.live(run.id).length,1);assert.equal(t.live(run.id)[0].actual.minutes,42);
 assert.equal(code(t.weekly(run.date,[{...t.form(run),activityId:'HK-x'}])),'UNKNOWN_FIELD');
});

test('SEC-CORE-03 cases 7 and 8: a missing or misdeclared origin: no device id is no device report; a form claiming a device source, a device report stating the athlete\'s own facts, a form stating a measurement',()=>{
 const {t,run}=setup('au-7');t.set(run.date);const {activityId:_,...noId}=t.watch(run);
 assert.equal(code(t.import([noId])),'INVALID_IDENTIFIER');
 assert.equal(code(t.weekly(run.date,[{...t.form(run),source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'}}])),'BOUNDARY_OWNED_FIELD');
 assert.equal(code(t.weekly(run.date,[{...t.form(run),provider:'HEALTHKIT'}])),'BOUNDARY_OWNED_FIELD');
 const voice=t.import([{...t.watch(run),actual:{...t.watch(run).actual,rpe:3,stop:{reason:'SYMPTOM'}}}]);assert.equal(code(voice),'REPORT_VOICE_MIXED');assert.deepEqual(voice.error.fields,['actual.stop','actual.rpe']);
 assert.equal(code(t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:40,measurement:'GPS'}}])),'REPORT_VOICE_MIXED');
 assert.equal(t.rows().filter(r=>!r.fact).length,0);
});

test('SEC-CORE-03 case 9: a correction with forged provenance, another session, or another workout is refused; the record is unchanged',()=>{
 const {t,run,run3}=setup('au-9');t.set(run.date);const id=t.weekly(run.date,[t.form(run)]).recorded[0],before=JSON.stringify(t.rows());
 for(const [o,c] of [[{...t.form(run),correctionOf:id,provenance:{parts:{x:{}}}},'BOUNDARY_OWNED_FIELD'],[{...t.form(run3),correctionOf:id},'CORRECTION_SESSION_MISMATCH'],
  [{...t.form(run),correctionOf:id,correctedAt:at(run.date,'01:00')},'BOUNDARY_OWNED_FIELD']])assert.equal(code(t.weekly(run.date,[o])),c);
 assert.equal(JSON.stringify(t.rows()),before);
 t.set(run.date,'21:00');const hk=t.import([t.watch(run,{activityId:'HK-9'})],{eligibility:ELIG(run.date)});assert.equal(code(hk),'OK');
});

test('SEC-CORE-03 case 10: a replayed correction: the same request is its stored answer; the same correction sent again as a new request names the report now in force',()=>{
 const {t,str}=setup('au-10');t.set(str.date);const id=t.weekly(str.date,[t.form(str)]).recorded[0];t.set(str.date,'21:00');
 const fix={...t.form(str),correctionOf:id,actual:{...t.form(str).actual,minutes:15}},v=t.version();
 const a=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(str.date),observations:[fix]},{rid:'fix-1',expectedVersion:v});
 const b=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(str.date),observations:[fix]},{rid:'fix-1',expectedVersion:v});
 assert.equal(b.replayed,true);assert.deepEqual(b.recorded,a.recorded);assert.equal(t.version(),v+1);
 const c=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(str.date),observations:[fix]},{rid:'fix-2'});
 assert.equal(code(c),'CORRECTION_OF_REPLACED');assert.equal(c.error.eventId,a.recorded[0]);
});

test('SEC-CORE-03 case 11: a correction after the record was restored by a new process is bound the same way (origins are kept under the record\'s seal)',()=>{
 const dir=scratchDir('auth'),{t,run}=setup('au-11',{store:fileStore(dir)});t.set(run.date,'08:00');const hk=t.import([t.watch(run)],{eligibility:ELIG(run.date)});
 t.set(run.date,'19:00');const mine=t.weekly(run.date,[{...t.form(run),actual:{completed:true,minutes:40,rpe:4}}]).recorded[0];
 const u=athlete({id:'au-11',store:fileStore(dir)});u.clock=Date.parse(at(run.date,'21:00'));
 assert.equal(code(u.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[{...u.form(run),correctionOf:hk.recorded[0]}]},{rid:'cross'})),'CROSS_AUTHOR_CORRECTION');
 const ok=u.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[{...u.form(run),correctionOf:mine,actual:{completed:true,minutes:40,rpe:7}}]},{rid:'after-restore'});
 assert.equal(code(ok),'OK');
});

test('SEC-CORE-03 cases 12 and 13: a workout linked to its session is credited once with the athlete\'s form (one row, two voices); linked to a session of another sport, or to none the plan holds, it is refused',()=>{
 const {t,run,str}=setup('au-12');t.set(run.date,'08:00');assert.equal(code(t.import([t.watch(run)],{eligibility:ELIG(run.date)})),'OK');
 t.set(run.date,'20:00');assert.equal(code(t.weekly(run.date,[t.form(run)])),'OK');
 const live=t.live(run.id);assert.equal(live.length,1,'one execution');assert.equal(Object.keys(live[0].provenance.parts).length,2,'two voices');assert.equal(live[0].conflicted,undefined);
 assert.equal(live[0].actual.rpe,4);assert.equal(live[0].actual.measurement,'GPS');
 assert.equal(code(t.import([{...t.watch(run,{activityId:'HK-s'}),sessionId:str.id}])),'SPORT_MISMATCH');
 assert.equal(code(t.import([{...t.watch(run,{activityId:'HK-n'}),sessionId:'w9-run-d9'}])),'UNKNOWN_SESSION');
});

test('SEC-CORE-03 (scope, stated): the binding holds only as far as the channel is the platform\'s: a caller that reaches importActivities is the device for this boundary',()=>{
 // The portable boundary cannot tell a HealthKit query from code that calls importActivities with made-up values: the native layer must keep
 // that entry point reachable only from the HealthKit delivery path (Mac/iOS package). This test pins the limit so it is never read as closed.
 const {t,run}=setup('au-scope');t.set(run.date,'08:00');
 assert.equal(code(t.import([{...t.watch(run,{activityId:'made-up'}),actual:{completed:true,minutes:90,distanceKm:20,measurement:'GPS'}}],{eligibility:ELIG(run.date)})),'OK');
});

// ---------- C-NCC-3 (b): one clock ----------
test('C-NCC-3 (b): reportedAt and correctedAt are the operation\'s clock (the asOf custody gives the engine), to the second; the activity\'s own times are kept as sent',()=>{
 const {t,run}=setup('tm-1');t.clock=Date.parse(at(run.date,'20:00'))+999;
 const hk=t.import([t.watch(run,{endTime:'07:45'})],{eligibility:ELIG(run.date)}),row=t.rows().find(o=>o.eventId===hk.recorded[0]);
 assert.equal(row.reportedAt,new Date(Date.parse(at(run.date,'20:00'))).toISOString(),'the second, never later than asOf');
 assert.equal(row.observedAt,new Date(Date.parse(at(run.date,'07:45'))).toISOString(),'the workout\'s own end');
 t.set(run.date,'21:00');const mine=t.weekly(run.date,[t.form(run)]).recorded[0];t.set(addDays(run.date,5),'10:00');
 const fix=t.weekly(addDays(run.date,5),[{...t.form(run),correctionOf:mine,actual:{completed:true,minutes:35,rpe:4}}]);
 assert.equal(code(fix),'OK','a late correction is admitted: its clock is after the report it names');
 const c=t.rows().find(o=>o.eventId===fix.recorded[0])??t.live(run.id)[0];assert.ok(Object.values(c.provenance.parts??{}).some(p=>p.availableAt===new Date(Date.parse(at(addDays(run.date,5),'10:00'))).toISOString()));
});

test('C-NCC-3 (b): a workout imported days later keeps its day; a retroactive form keeps the day the athlete states; run and strength on one day are both kept',()=>{
 const {t,run,str}=setup('tm-2');const late=addDays(run.date,4);t.set(late,'12:00');
 const hk=t.import([t.watch(run)],{eligibility:ELIG(late)});assert.equal(code(hk),'OK');
 const row=t.rows().find(o=>o.eventId===hk.recorded[0]);assert.equal(row.localDate,run.date);assert.ok(row.reportedAt>row.observedAt);
 const f=t.weekly(late,[t.form(str),{...t.form(run),actual:{completed:true,minutes:40,rpe:4}}]);assert.equal(code(f),'OK');assert.equal(f.recorded.length,2);
 assert.equal(t.rows().find(o=>o.eventId===f.recorded[0]).localDate,str.date);
});

test('C-NCC-3 (b): the same instant written in another offset (travel) is the same instant and the same local day of the plan; a clock behind the record is refused, never moved forward',()=>{
 const {t,run}=setup('tm-3');t.set(run.date,'21:00');const w=t.watch(run,{endTime:'07:45'}),inst=new Date(Date.parse(w.observedAt)).toISOString().replace('Z','+00:00');
 const a=t.import([{...w,observedAt:inst}],{eligibility:ELIG(run.date)});assert.equal(t.rows().find(o=>o.eventId===a.recorded[0]).localDate,run.date);
 const v=t.version();t.set(run.date,'20:59');const back=t.weekly(run.date,[t.form(run)]);
 assert.equal(code(back),'CLOCK_BEHIND_RECORD');assert.equal(t.version(),v);
 assert.equal(t.it.read({actor:t.actor}).ok,true,'reads still work');
 t.set(run.date,'21:00');assert.equal(code(t.weekly(run.date,[t.form(run)])),'OK','the same second as the record is not behind it');
});

test('C-NCC-3 (b): a workout dated in the future is not recorded, and the answer says so (never dropped silently); the app closed for days continues',()=>{
 const {t,run}=setup('tm-4');t.set(run.date,'06:00');
 const r=t.import([t.watch(run,{endTime:'07:45'})],{eligibility:ELIG(run.date)});
 assert.equal(code(r),'OK');assert.equal(r.recorded.length,0);assert.equal(r.notRecorded[0].reason,'FUTURE_OBSERVATION');
 t.set(addDays(run.date,9),'09:00');const later=t.import([t.watch(run)],{eligibility:ELIG(addDays(run.date,9))});assert.equal(later.recorded.length,1);
});

test('C-NCC-3 (b), SEC-INT-01: a delivery carries the last screen of the athlete exactly; when the engine still asks (a screen no longer current) the workout is not recorded and the queue is told; QRE-INT-02 (open, routed) pinned',()=>{
 const sp=spy(),t=athlete({id:'tm-5',engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 const late=addDays(run.date,40);t.set(late,'09:00');const r=t.import([t.watch(run,{activityId:'HK-late'})]);
 assert.deepEqual(sp.calls.at(-1).input.eligibility,t.doc()&&athleteA({weeks:8,id:'tm-5'}).athlete.eligibility,'the onboarding screen, byte for byte');
 // 40 days on, the onboarding screen is no longer current (10 days on it still is: the engine judges, not the boundary).
 assert.equal(r.status,'ASK');assert.deepEqual(r.decision.missingInputs,['eligibility.currentAssessment']);
 assert.equal(r.recorded.length,0);assert.deepEqual(r.activities.map(a=>a.outcome),['NOT_RECORDED']);assert.equal(r.activities[0].reason,'NOT_RECORDED_BY_THIS_DECISION');
 // QRE-INT-02 (open, routed to Core/SSCTR): the record of formats keeps a report fact for a workout the decision did not record.
 assert.ok(t.carried().runFormatRecord.some(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===run.id),'QRE-INT-02 as it stands');
 assert.equal(code(t.it.importActivities({actor:t.actor,clientRequestId:'x',expectedVersion:t.version(),activities:[t.watch(run)],eligibility:ELIG(late)})),'INVALID_REQUEST','the device states no screen');
});
