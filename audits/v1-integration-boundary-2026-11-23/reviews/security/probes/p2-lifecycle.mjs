// SEC_INT_R1 probe 2: lifecycle operations. (A) acknowledgeRecordLoss on a healthy record that holds a standing hold. (B) one clock set ahead
// locks every later mutation, consent revocation and health-fact erasure included.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p2-lifecycle.mjs
import {athlete,memoryAnchor,ELIG,addDays,notFeeling100WithSign} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;

// A
{const anchor=memoryAnchor(),t=athlete({id:'p2a',anchor});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'08:00');const h=t.api.notFeeling100({actor:t.actor,clientRequestId:'hold',expectedVersion:t.version(),...notFeeling100WithSign(run.date)});
 const before=t.it.read({actor:t.actor});const facts=t.rows().filter(r=>r.fact).map(r=>r.fact);
 console.log('A hold recorded:',code(h),h.status,'record ok:',before.ok,'facts:',facts);
 const ack=t.it.acknowledgeRecordLoss({actor:t.actor});
 const after=t.it.read({actor:t.actor});
 console.log('A acknowledgeRecordLoss on a HEALTHY record:',code(ack),'→ read:',code(after));
 const re=t.enroll();console.log('A new enrollment over it:',code(re),re.status??re.error,'→ facts now:',re.ok&&re.enrolled?t.rows().filter(r=>r.fact).map(r=>r.fact):'-');
 if(re.ok&&re.enrolled){t.set(addDays(run.date,1),'08:00');console.log('A the next review status:',t.weekly(addDays(run.date,1),[]).status);}}

// B
{const t=athlete({id:'p2b'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'08:00');const h=t.api.notFeeling100({actor:t.actor,clientRequestId:'hold',expectedVersion:t.version(),...notFeeling100WithSign(run.date)});
 const f08=t.rows().filter(r=>r.fact&&r.fact!=='INTERRUPTION_DECLARED').map(r=>r.eventId);
 // the device clock is set one year ahead once (a wrong manual date), one harmless action is taken, then the clock is corrected
 const real=t.clock;t.clock=real+365*864e5;const ahead=t.it.setConsent({actor:t.actor,purpose:'LEARNING',granted:true,expectedVersion:t.version()});
 t.clock=real+3600e3;
 const revoke=t.it.setConsent({actor:t.actor,purpose:'HEALTH_SIGNALS',granted:false,expectedVersion:t.version()});
 const erase=t.it.eraseHealthFacts({actor:t.actor,eventIds:f08,expectedVersion:t.version()});
 const stop=t.weekly(run.date,[{...t.form(run),actual:{...t.form(run).actual,minutes:20,stop:{reason:'SYMPTOM'}}}]);
 console.log('B one action with the clock a year ahead:',code(ahead));
 console.log('B after the clock is corrected: revoke HEALTH_SIGNALS:',code(revoke),'| eraseHealthFacts:',code(erase),'| a symptom stop:',code(stop),stop.safetyFields??'');
 console.log('B eraseAccount still works:',code(t.it.eraseAccount({actor:t.actor})));}
