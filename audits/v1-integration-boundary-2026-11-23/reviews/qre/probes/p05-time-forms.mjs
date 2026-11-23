// QRE probe P05: an observedAt with no offset ("2026-11-17T23:30:00") is admitted (instantOk only asks for a T and Date.parse), and Date.parse
// reads it in the runtime's own time zone. Run twice with different TZ and compare what is stored (the plan-local day, the instant).
// Run from CoachingCore/:
//   TZ=UTC node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p05-time-forms.mjs
//   TZ=Asia/Tokyo node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p05-time-forms.mjs
import {athlete,ELIG,addDays} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const t=athlete({id:'p05'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(addDays(s.date,1),'12:00');
const w={...t.watch(s),observedAt:`${s.date}T23:30:00`};
const r=t.import([w],{eligibility:ELIG(addDays(s.date,1))});
const row=t.rows().find(o=>o.eventId===r.recorded?.[0]);
console.log(JSON.stringify({tz:Intl.DateTimeFormat().resolvedOptions().timeZone,code:r.ok?'OK':r.error.code,status:r.status,recorded:r.recorded?.length,notRecorded:r.notRecorded,
 observedAtStored:row?.observedAt??null,localDate:row?.localDate??null,sessionDate:s.date,storedDigest:t.doc().docMac.slice(0,16)}));
