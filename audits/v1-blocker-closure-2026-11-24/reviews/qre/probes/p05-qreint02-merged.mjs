// QRE BC R1 probe 5: QRE-INT-02's "decided" set on the paths the focal test does not pin: a report merged into a row (watch then form,
// form then watch) and a report kept as a voice (dispute). Its report fact must stay a report in force (standing) and its reading unchanged.
// Run with and without a mutant of the decided set (R10: only row ids and refusals). Synthetic. Read-only.
// Usage: node [--import mutate-hook.mjs with MUT] p05-qreint02-merged.mjs <CoachingCore dir>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(process.argv[2]),imp=f=>import(pathToFileURL(path.join(CC,f)).href);
const H=await imp('test/v1int-helpers.mjs'),RF=await imp('src/v1-run-format.mjs');
const {athlete,ELIG}=H,V=RF.runFormatAuthority({}).values;
const facts=(t,sid)=>t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===sid).map(x=>({standing:x.report?.standing,stop:!!x.report?.stop}));
const reading=(t,sid)=>{const r=RF.reportsReading(t.live(sid)[0],RF.readReportFacts(t.carried().runFormatRecord,t.doc().program.athleteId,V,t.rows()),V);return {withheld:r.withheld,wholeRow:r.wholeRow,wholeKm:r.wholeKm};};
for(const [name,steps] of Object.entries({
 'watch then form (merge)':['watch','form'],'form then watch (merge)':['form','watch'],'watch then a disputing form (kept voice)':['watch','dispute']})){
 const t=athlete({id:'p5-'+name.length});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');t.set(run.date,'21:00');t.screen(ELIG(run.date));
 for(const s of steps){t.clock+=60e3;
  if(s==='watch')t.import([t.watch(run)]);
  else if(s==='form')t.weekly(run.date,[t.form(run,{actual:{rpe:5}})]);
  else t.weekly(run.date,[t.form(run,{actual:{minutes:t.form(run).actual.minutes+30}})]);}
 const row=t.live(run.id)[0];
 console.log(name.padEnd(44),JSON.stringify({voices:Object.keys(row?.provenance?.parts??{}).length,conflicted:row?.conflicted===true,facts:facts(t,run.id),reading:reading(t,run.id)}));}
