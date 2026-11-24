// SEC_FPV_R1 probe r3b: after r3 case a (an ASK'd "not 100%" erased), what an athlete write needs: a report of a session without a screen, and
// the api.mjs logRun. Usage: node r3b-after-erased-question.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];
const {athlete,addDays,ELIG}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r?.ok===false?r.error.code:'OK';
const t=athlete({id:'r3b'});t.enroll();const p=t.doc().program,d4=addDays(p.startDate,4);t.set(d4,'08:00');
const r=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),eligibility:ELIG(d4),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{},intent:'REST',days:1}});
t.set(d4,'09:00');t.it.eraseHealthFacts({actor:t.actor,eventIds:[r.eventId],expectedVersion:t.version()});
const s=t.sessions(0).find(x=>x.date>=d4);t.set(s.date,'20:00');
const noScreen=t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(s)]});
console.log(JSON.stringify({session:s.sport,noScreen:[code(noScreen),noScreen.status??null,noScreen.recorded?.length??0,noScreen.error?.message?.slice(0,100)??null],view:t.api.plan({actor:t.actor}).view.state}));
