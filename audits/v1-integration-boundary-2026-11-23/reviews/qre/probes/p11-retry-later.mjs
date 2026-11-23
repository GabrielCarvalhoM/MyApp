// QRE probe P11: a write that landed before the store threw, retried with the same request id five minutes LATER (as after a crash and a
// relaunch). Expected: the stored answer (replayed), one version. Mutant I06 (retry uses the new clock) survives the candidate's tests because
// they retry at the same clock; this probe is the discriminating case.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p11-retry-later.mjs
import {athlete,memoryStore,ELIG} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
for(const channel of ['ATHLETE','DEVICE']){
 const base=memoryStore();let mode='ok';const store={...base,commit(i,v,d){const r=base.commit(i,v,d);if(mode==='throw-after'){mode='ok';throw new Error('fsync');}return r;}};
 const t=athlete({id:'p11-'+channel,store});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 const send=()=>channel==='ATHLETE'?t.it.submit({actor:t.actor,clientRequestId:'same',expectedVersion:1,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:[t.form(s)]}})
  :t.it.importActivities({actor:t.actor,clientRequestId:'same',expectedVersion:1,activities:[t.watch(s)],eligibility:ELIG(s.date)});
 mode='throw-after';const a=send();t.clock+=5*60e3;const b=send();
 console.log(channel,'first:',a.ok?'OK':a.error.code,'| retry 5 min later:',b.ok?('OK replayed='+b.replayed+' recorded='+JSON.stringify(b.recorded)):b.error.code,'| version',t.version());
}
