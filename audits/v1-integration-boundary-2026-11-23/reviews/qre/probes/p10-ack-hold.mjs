// QRE probe P10: acknowledgeRecordLoss on an intact record that holds a standing hold. A restart answers the hold first; does
// acknowledgeRecordLoss + enroll give a new plan with no hold?
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p10-ack-hold.mjs
import {athlete,memoryAnchor,ELIG,addDays,athleteA,notFeeling100WithSign} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK'+(r.status?':'+r.status:''):r.error.code;
const t=athlete({id:'p10',anchor:memoryAnchor()});t.enroll();const p=t.doc().program,h=addDays(p.startDate,2);
t.set(h,'08:00');console.log('hold:',code(t.api.notFeeling100({actor:t.actor,clientRequestId:'hold',expectedVersion:t.version(),...notFeeling100WithSign(h)})));
const day=addDays(h,1),u={...athleteA({weeks:8,id:'p10'}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);
t.set(day,'10:00');console.log('restart over the intact record:',code(t.it.restart({actor:t.actor,intake:u,expectedVersion:t.version()})),'| plan view:',t.api.plan({actor:t.actor}).view?.state);
console.log('acknowledgeRecordLoss on the intact record:',code(t.it.acknowledgeRecordLoss({actor:t.actor})));
const e=t.it.enroll({actor:t.actor,intake:{...athleteA({weeks:8,id:'p10'}),asOf:day,startDate:addDays(day,3)},consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});
console.log('enroll after it:',code(e),'| plan view:',t.api.plan({actor:t.actor}).view?.state,'| rows on record:',t.rows().length);
