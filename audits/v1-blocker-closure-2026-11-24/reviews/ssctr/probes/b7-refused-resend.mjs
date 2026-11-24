// SSCTR BC R1 probe b7: a workout the engine refused (FUTURE_OBSERVATION: delivered before its stated end, a device clock ahead), then the same
// workout re-sent once the clock has passed it. Is it recorded once, and is its pace carried? Usage: node b7-refused-resend.mjs <root>. Synthetic.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1int-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');const {athlete,ELIG}=H;const V=RF.runFormatAuthority({}).values;
const reading=(t,sid)=>{const row=t.live(sid)[0];return row?RF.reportsReading(row,RF.readReportFacts(t.carried().runFormatRecord,t.doc().program.athleteId,V,t.rows()),V):null;};
const t=athlete({id:'b7r'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
t.set(run.date,'06:00');t.screen(ELIG(run.date));t.clock+=60e3;const f=t.import([t.watch(run,{activityId:'HK-f',endTime:'07:45'})]);
console.log('first',f.activities.map(x=>x.outcome+':'+(x.reason??'')).join(','));
t.set(run.date,'09:00');const g=t.import([t.watch(run,{activityId:'HK-f',endTime:'07:45'})]);
console.log('re-sent',g.ok?g.activities.map(x=>x.outcome+':'+(x.reason??'')).join(','):g.error.code,'rows',t.live(run.id).length,'facts',t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===run.id).length,'reading',JSON.stringify(reading(t,run.id)));
