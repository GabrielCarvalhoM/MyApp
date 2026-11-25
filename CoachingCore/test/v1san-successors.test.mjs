// REPMILE V1 test-suite sanitization (2026-11-25), review cycle (QRE_SAN_R1 QRE-SAN-02): successors that keep every still-valid assertion of
// a historical test whose earlier successor covered only its superseded part. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,ELIG,addDays,spy,athleteA} from './v1int-helpers.mjs';

const code=r=>r.ok?'OK':r.error.code;

// v1int-authorship.test.mjs:141 (H26, tm-5). Its last record assertion pinned QRE-INT-02 "as it stands" (a receipt fact kept for a workout the
// decision did not record); the blocker closure closed it, and v1bc-blocker-closure's QRE-INT-02 successor asserts the closed behaviour. The
// rest of tm-5 is still the contract (SEC-INT-01, C-NCC-3 (b)) and is asserted here unchanged, with that one assertion inverted to the closed form.
test('successor of v1int-authorship.test.mjs:141 (tm-5, SEC-INT-01, C-NCC-3 (b)): a delivery carries the athlete\'s last screen byte for byte; when the engine still asks the workout is not recorded and the queue is told; the device states no screen; QRE-INT-02 closed',()=>{
 const sp=spy(),t=athlete({id:'tm-5',engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 const late=addDays(run.date,40);t.set(late,'09:00');const r=t.import([t.watch(run,{activityId:'HK-late'})]);
 assert.deepEqual(sp.calls.at(-1).input.eligibility,athleteA({weeks:8,id:'tm-5'}).athlete.eligibility,'the onboarding screen, byte for byte');
 assert.equal(r.status,'ASK');assert.deepEqual(r.decision.missingInputs,['eligibility.currentAssessment']);
 assert.equal(r.recorded.length,0);assert.deepEqual(r.activities.map(a=>a.outcome),['NOT_RECORDED']);assert.equal(r.activities[0].reason,'NOT_RECORDED_BY_THIS_DECISION');
 // QRE-INT-02, closed by the V1 blocker closure: a workout the decision did not record leaves no report fact in the record of formats.
 assert.equal(t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===run.id).length,0,'QRE-INT-02 closed');
 assert.equal(code(t.it.importActivities({actor:t.actor,clientRequestId:'x',expectedVersion:t.version(),activities:[t.watch(run)],eligibility:ELIG(late)})),'INVALID_REQUEST','the device states no screen');
});
