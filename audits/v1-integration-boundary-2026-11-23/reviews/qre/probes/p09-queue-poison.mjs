// QRE probe P09: one refused workout refuses the whole HealthKit delivery (by design: "the whole request is refused"), and the README's queue
// rule ("a workout leaves the queue only when its id is in `recorded`") has no rule for a workout that is refused. Shapes:
// (a) a valid workout + a workout linked to a session no plan holds; (b) after a restart, a queued workout linked to the old plan's session.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p09-queue-poison.mjs
import {athlete,ELIG,addDays,athleteA} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;
{const t=athlete({id:'p09-a'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 for(let k=0;k<3;k++){const r=t.import([t.watch(s),{...t.watch(s,{activityId:'HK-x'}),sessionId:'w9-run-d9'}],{eligibility:ELIG(s.date)});console.log('(a) delivery',k+1,code(r),JSON.stringify(r.error??{}),'rows',t.live(s.id).length);t.clock+=60e3;}}
{const t=athlete({id:'p09-b'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');const queued=t.watch(s,{activityId:'HK-late'});
 const day=addDays(s.date,3),u={...athleteA({weeks:8,id:'p09-b'}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 t.set(day,'10:00');console.log('(b) restart',t.it.restart({actor:t.actor,intake:u,expectedVersion:t.version()}).status);
 t.set(day,'11:00');const r=t.import([queued],{eligibility:ELIG(day)});console.log('    queued workout of the old plan\'s session:',code(r),JSON.stringify(r.error??{}),'(the old plan session id',s.id,'is',t.doc().program.weeks.flatMap(w=>w.sessions).some(x=>x.id===s.id)?'held':'not held','by the new plan)');}
