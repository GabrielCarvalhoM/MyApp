// SEC_INT_R1 probe 3: the athlete's clinical screen (eligibility) travels on the DEVICE channel (importActivities({eligibility})).
// After a symptom stop the engine asks the warning-sign screen. What does a HealthKit import do with (a) the athlete's last screen replayed
// as answered (before the stop), (b) the same screen re-stamped with today's assessedAt (a native caching bug or a forged channel)?
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p3-device-eligibility.mjs
import {athlete,ELIG,addDays} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;
for(const variant of ['none','stale','restamped','athlete-restamped']){
 const t=athlete({id:'p3-'+variant});t.enroll();const ss=t.sessions(0),run=ss.find(s=>s.id==='w0-run-d1'),run3=ss.find(s=>s.id==='w0-run-d3');
 t.set(run.date,'20:00');const stop=t.weekly(run.date,[{...t.form(run),actual:{...t.form(run).actual,minutes:15,stop:{reason:'SYMPTOM'}}}]);
 const d=run3.date;t.set(d,'20:00');
 const elig=variant==='none'?undefined:variant==='stale'?ELIG(run.date):ELIG(d);
 const r=variant==='athlete-restamped'?t.weekly(d,[t.form(run3)],{eligibility:elig}):t.import([t.watch(run3)],{eligibility:elig});
 console.log(variant.padEnd(18),'stop:',code(stop),stop.status,'screen:',stop.warningSignScreen?.status??null,'| next:',code(r),r.status,r.action,'recorded:',r.recorded?.length,'screen:',r.warningSignScreen?.status??null,'missing:',r.decision?.missingInputs);
}
