// QRE R2 probe P13: the §9 queue rule "a refused link (UNKNOWN_SESSION after a restart) is re-sent unlinked": what the engine answers, why,
// (the delivery is made after the new plan has started), whether the plan view changes, and whether an unlinked workout before any restart (control) is recorded.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/r2/p13-unlinked-after-restart.mjs
import {athlete,ELIG,addDays,athleteA} from '../../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK'+(r.status?':'+r.status:''):r.error.code;
for(const restart of [true,false]){
 const t=athlete({id:'p13-'+restart});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');const {sessionId:_s,...w}=t.watch(s,{activityId:'HK-late'});
 const day=addDays(s.date,3);
 if(restart){const u={...athleteA({weeks:8,id:'p13-'+restart}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
  t.set(day,'10:00');console.log('restart',code(t.it.restart({actor:t.actor,intake:u,expectedVersion:t.version()})),'new plan starts',t.doc().program.startDate);}
 const when=restart?addDays(t.doc().program.startDate,1):day;t.set(when,'11:00');const before=t.api.plan({actor:t.actor}).view?.state;const r=t.import([w]);
 console.log(JSON.stringify({restart,answer:code(r),reason:r.decision?.reason,missing:r.decision?.missingInputs,errors:r.errors??r.decision?.errors,activities:r.activities,viewBefore:before,viewAfter:t.api.plan({actor:t.actor}).view?.state}));
 t.set(when,'12:00');const next=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(when),observations:[]});console.log('   next athlete review:',code(next),next.decision?.reason?.slice(0,140));
}
