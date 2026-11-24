// SSCTR BC R1 probe b6: a device run recorded; later the athlete's own form of that session, which the engine ASKs about (stale screen, not
// recorded), stating (a) a symptom stop, (b) a different amount, (c) the same run. Is the device row's pace then carried (read by the pace
// readers), and is the stop screened? Then the same form re-sent with a screen. Usage: node b6-ask-stop-vs-device.mjs <CoachingCore root>.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2],imp=f=>import(pathToFileURL(path.join(root,f)).href);
const H=await imp('test/v1int-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');const {athlete,ELIG,addDays}=H;const V=RF.runFormatAuthority({}).values;
const code=r=>r.ok?'OK':r.error.code;
const reading=(t,sid)=>{const row=t.live(sid)[0];return row?RF.reportsReading(row,RF.readReportFacts(t.carried().runFormatRecord,t.doc().program.athleteId,V,t.rows()),V):null;};
function go(label,mk){
 const t=athlete({id:'b6-'+label[0]});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');t.screen(ELIG(run.date));t.clock+=60e3;const d=t.import([t.watch(run)]);
 const r0=reading(t,run.id);
 const late=addDays(run.date,40);t.set(late,'09:00');const f=mk(t,run);const a=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});
 const r1=reading(t,run.id);
 t.set(late,'09:10');const b=t.weekly(late,[f]);const r2=reading(t,run.id),row=t.live(run.id)[0];
 const sh=r=>r?JSON.stringify({withheld:r.withheld,wholeRow:r.wholeRow,wholeKm:r.wholeKm}):'null';
 console.log(label.padEnd(18),'device',code(d),'| reading',sh(r0),'\n   ASK form:',a.status,(a.notRecorded??[]).map(x=>x.reason).join(','),'screen',a.warningSignScreen?.reason??null,'| reading',sh(r1),
  '\n   re-sent:',code(b),b.status,'recorded',(b.recorded??[]).length,'screen',b.warningSignScreen?.reason??null,'| flagged',row?.conflicted===true,'| reading',sh(r2));
}
go('a symptom stop',(t,s)=>({...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}}}));
go('b other amount',(t,s)=>t.form(s,{actual:{minutes:t.form(s).actual.minutes+25}}));
go('c same run',(t,s)=>t.form(s));
