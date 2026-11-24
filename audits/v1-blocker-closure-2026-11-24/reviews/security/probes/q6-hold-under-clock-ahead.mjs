// SEC_BC_R2 probe q6 (D1 class, context for q5 v6): a clinical hold recorded while the clock is set 20 days ahead; once the clock is right, what
// does the plan view show, and can anything be written? Pre-existing behaviour, run on every tree.
// Usage: node q6-hold-under-clock-ahead.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q6-hold-under-clock-ahead.mjs <root>');
const {athlete,notFeeling100WithSign,addDays}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r.ok?'OK':r.error.code;
const t=athlete({id:'q6'});t.enroll();const d0=t.sessions(0)[0].date;
t.set(addDays(d0,20),'09:00');const h=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(addDays(d0,20))});
const ahead=t.api.status({actor:t.actor});t.set(addDays(d0,1),'09:00');const right=t.api.status({actor:t.actor});
console.log(JSON.stringify({hold:[code(h),h.status],stateAhead:ahead.state,stateRight:right.state,weekly:code(t.weekly(addDays(d0,1),[]))}));
