// QRE probe P03b: the athlete-channel twin of P03 (d): a run form answered ASK (no current screen), then sent again with the screen.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p03b-athlete-ask.mjs
import {athlete,ELIG} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const RF=await import('../../../../../CoachingCore/src/v1-run-format.mjs');const V=RF.runFormatAuthority({}).values;
const t=athlete({id:'p03b'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');
t.set(s.date,'20:00');const a=t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(s)]});console.log('no screen:',a.status,JSON.stringify(a.notRecorded));
t.set(s.date,'20:10');const b=t.weekly(s.date,[t.form(s)]);console.log('again with the screen:',b.ok?b.status:b.error.code,'recorded',b.recorded?.length);
const facts=RF.readReportFacts(t.carried().runFormatRecord,t.doc().program.athleteId,V,t.rows());
console.log('report facts:',t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===s.id).length,'reportsReading:',JSON.stringify(RF.reportsReading(t.live(s.id)[0],facts,V)));
