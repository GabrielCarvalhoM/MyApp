// SEC_INT_R1 probe 1: corrections on a merged row (the too-strict side of `evolves`), and two values of one activity in one request.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p1-merged-corrections.mjs
import {athlete,ELIG} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;
const setup=id=>{const t=athlete({id});t.enroll();const ss=t.sessions(0);return {t,run:ss.find(s=>s.id==='w0-run-d1')};};
const show=(t,sid)=>t.live(sid).map(r=>({id:r.eventId,min:r.actual.minutes,stop:r.actual.stop??null,rec:r.response?.recovery,parts:Object.keys(r.provenance?.parts??{}),conflicted:r.conflicted??null}));

// A: device first, athlete form merged into the device row; then the athlete corrects their own voice (adds a symptom stop).
{const {t,run}=setup('p1a');t.set(run.date,'08:00');const hk=t.import([t.watch(run)],{eligibility:ELIG(run.date)});
 t.set(run.date,'20:00');const f=t.weekly(run.date,[t.form(run)]);const mine=f.recorded[0];
 t.set(run.date,'21:00');const fix=t.weekly(run.date,[{...t.form(run),correctionOf:mine,actual:{...t.form(run).actual,completed:true,minutes:25,stop:{reason:'SYMPTOM'}},response:{recovery:'ADVERSE'}}]);
 console.log('A device-first, athlete corrects own merged voice:',code(fix),fix.ok?{recorded:fix.recorded,notRecorded:fix.notRecorded,ws:!!fix.warningSignScreen}:fix.error.message,show(t,run.id));}
// B: athlete first, device merged into the athlete row; then the device re-syncs with other values (device's own correction).
{const {t,run}=setup('p1b');t.set(run.date,'08:00');const f=t.weekly(run.date,[t.form(run)]);
 t.set(run.date,'09:00');const hk=t.import([t.watch(run)],{eligibility:ELIG(run.date)});
 t.set(run.date,'10:00');const rs=t.import([{...t.watch(run),actual:{...t.watch(run).actual,minutes:44}}],{eligibility:ELIG(run.date)});
 console.log('B athlete-first, device re-sync of merged voice:',code(rs),rs.ok?{recorded:rs.recorded,notRecorded:rs.notRecorded}:rs.error.message,show(t,run.id));}
// C: athlete first, device merged; then the athlete corrects own report (the row's own id) to add a stop.
{const {t,run}=setup('p1c');t.set(run.date,'08:00');const f=t.weekly(run.date,[t.form(run)]);const mine=f.recorded[0];
 t.set(run.date,'09:00');t.import([t.watch(run)],{eligibility:ELIG(run.date)});
 t.set(run.date,'21:00');const fix=t.weekly(run.date,[{...t.form(run),correctionOf:mine,actual:{...t.form(run).actual,minutes:25,stop:{reason:'SYMPTOM'}}}]);
 console.log('C athlete-first, athlete corrects own row id:',code(fix),fix.ok?{recorded:fix.recorded,notRecorded:fix.notRecorded,ws:!!fix.warningSignScreen}:fix.error.message,show(t,run.id));}
// D: two values of one new activity in one request (the second binds to a provisional id).
{const {t,run}=setup('p1d');t.set(run.date,'09:00');const w=t.watch(run);
 const r=t.import([w,{...w,actual:{...w.actual,minutes:44}}],{eligibility:ELIG(run.date)});
 const doc=t.doc();const origins=t.it.carried({actor:t.actor});
 console.log('D same activity twice in one request:',code(r),r.ok?{recorded:r.recorded,notRecorded:r.notRecorded}:r.error,show(t,run.id));}
