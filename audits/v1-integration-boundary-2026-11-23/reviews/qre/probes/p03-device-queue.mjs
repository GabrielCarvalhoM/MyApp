// QRE probe P03: what the HealthKit queue is told (the contract: "keeps a workout until it is in `recorded`").
// (a) a duplicate-only delivery; (b) a mixed delivery (one duplicate + one new): can the answer be mapped back to activities?
// (c) an empty delivery; (d) an ASK (no screen) then the re-send with the screen: does the record of formats then hold two device reports
//     of the same activity, and is the run withheld from pace readers (REPORT_NOT_CARRIED)?
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p03-device-queue.mjs
import {athlete,ELIG} from '../../../../../CoachingCore/test/v1int-helpers.mjs';

const {t}=(()=>{const t=athlete({id:'p03'});t.enroll();return {t};})();
const ss=t.sessions(0),r1=ss.find(s=>s.id==='w0-run-d1'),r3=ss.find(s=>s.id==='w0-run-d3');
t.set(r1.date,'09:00');const first=t.import([t.watch(r1)],{eligibility:ELIG(r1.date)});
console.log('first',first.ok,JSON.stringify({recorded:first.recorded,observationIds:first.observationIds}));
t.set(r1.date,'09:05');const dup=t.import([t.watch(r1)]);
console.log('(a) duplicate-only answer:',JSON.stringify(dup),'typeof recorded =',typeof dup.recorded);
t.set(r3.date,'21:00');const mixed=t.import([t.watch(r1),t.watch(r3)],{eligibility:ELIG(r3.date)});
console.log('(b) mixed answer:',JSON.stringify({duplicates:mixed.duplicates,recorded:mixed.recorded,notRecorded:mixed.notRecorded,observationIds:mixed.observationIds}),
 '-> activityIds are not in the answer; index 0 of observationIds is the activity at index 1 of the delivery');
const v=t.version();t.clock+=60e3;const empty=t.import([]);
console.log('(c) empty delivery:',empty.ok,empty.status,'version',v,'->',t.version(),'decision kind',empty.decision?.kind);

// (d) ASK then re-send.
const u=athlete({id:'p03-d'});u.enroll();const s=u.sessions(0).find(x=>x.id==='w0-run-d1');
u.set(s.date,'09:00');const ask=u.import([u.watch(s)]);console.log('(d) no screen:',ask.status,JSON.stringify(ask.notRecorded));
u.set(s.date,'20:00');const again=u.import([u.watch(s)],{eligibility:ELIG(s.date)});console.log('    re-sent with the screen:',again.status,'recorded',again.recorded.length);
const facts=u.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===s.id);
console.log('    report facts for the session:',facts.length,JSON.stringify(facts.map(f=>({eventId:f.eventId,speaker:f.report?.speaker??f.report?.source??f.speaker??null}))));
u.set(s.date,'21:00');const next=u.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:[]});
const withheld=JSON.stringify(next).match(/REPORT_NOT_CARRIED|WHOLE_ROW_WITHHELD|PACE_WITHHELD/g);
const cal=u.it.presentation({actor:u.actor}).readings?.runCalibration;
console.log('    next review: withheld markers in the answer:',withheld,'| calibration readings mention',JSON.stringify(cal??null).match(/REPORT_NOT_CARRIED|withheld[^"]*/gi));
// Control: the same workout sent once with the screen (no earlier ASK).
const c=athlete({id:'p03-ctl'});c.enroll();const cs=c.sessions(0).find(x=>x.id==='w0-run-d1');c.set(cs.date,'20:00');c.import([c.watch(cs)],{eligibility:ELIG(cs.date)});
c.set(cs.date,'21:00');const cn=c.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(cs.date),observations:[]});
console.log('    control (no ASK first): report facts',c.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===cs.id).length,'withheld markers',JSON.stringify(cn).match(/REPORT_NOT_CARRIED|WHOLE_ROW_WITHHELD|PACE_WITHHELD/g));
// The lineage verdict on the row, read with the engine's own functions (v1-run-format.mjs), for (d) and the control.
const RF=await import('../../../../../CoachingCore/src/v1-run-format.mjs');
const V=RF.runFormatAuthority({}).values;
for(const [name,x,sid] of [['(d) ASK then re-send',u,s.id],['control',c,cs.id]]){const ledger=x.rows(),row=x.live(sid)[0],facts=RF.readReportFacts(x.carried().runFormatRecord,x.doc().program.athleteId,V,ledger);
 console.log('   ',name,'reportsReading:',JSON.stringify(RF.reportsReading(row,facts,V)));}
