// QRE R2 probe P15: the device screen mitigation (SEC-INT-01 / QRE-INT-02 boundary part).
// (a) 40 days on, the athlete answers a new screen in their own review, then a workout is delivered: it must carry THAT screen and be recorded
//     (under mutant S02 it carries the onboarding screen and is ASK, the QRE-INT-02 path).
// (b) an intake with no screen: a delivery is SCREEN_REQUIRED (mutant S01 removes the guard).
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/r2/p15-screen.mjs
import {athlete,spy,ELIG,addDays,athleteA} from '../../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK'+(r.status?':'+r.status:''):r.error.code;
{const sp=spy(),t=athlete({id:'p15-a',engine:sp.engine});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');const late=addDays(s.date,40);
 t.set(late,'08:00');const sc=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(late)});t.set(late,'09:00');const r=t.import([t.watch(s,{activityId:'HK-late'})]);
 console.log('(a) athlete screen',code(sc),'| delivery',code(r),JSON.stringify(r.activities?.map(a=>a.outcome)),'| carried the athlete\'s new screen:',JSON.stringify(sp.calls.at(-1).input.eligibility)===JSON.stringify(ELIG(late)));}
{const i=athleteA({weeks:8,id:'p15-b'});delete i.athlete.eligibility;const t=athlete({id:'p15-b'});const e=t.enroll(i);console.log('(b) enroll without a screen:',code(e));
 if(e.ok&&e.enrolled!==false){const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');console.log('    delivery:',code(t.import([t.watch(s)])),'version',t.version());}}
