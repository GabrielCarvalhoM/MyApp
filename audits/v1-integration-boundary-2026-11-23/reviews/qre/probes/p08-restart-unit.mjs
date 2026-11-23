// QRE probe P08: what the engine's restart answer returns besides the program, against what the integration keeps (custody keeps the stored
// rows, sets reference to null and keeps the model; the Mac core-driver keeps carriedRecord, a non-null referenceState and updatedModel).
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/qre/probes/p08-restart-unit.mjs
import {athlete,spy,ELIG,addDays,athleteA,sortedById,json} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const sp=spy(),t=athlete({id:'p08',engine:sp.engine});t.enroll();
const w0=t.sessions(0),sun=addDays(t.doc().program.startDate,6);t.set(sun,'19:00');t.import(w0.filter(s=>s.sport==='RUN').map(s=>t.watch(s)),{eligibility:ELIG(sun)});
t.set(sun,'20:00');t.weekly(sun,w0.map(s=>t.form(s)));
const day=addDays(sun,12),u={...athleteA({weeks:8,id:'p08'}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
t.set(day,'10:00');const before={rows:sortedById(t.rows()),model:t.doc().model};
const r=t.it.restart({actor:t.actor,intake:u,expectedVersion:t.version()});
const call=sp.calls.findLast(c=>c.op==='restart'),out=call.out,d=t.doc();
console.log(JSON.stringify({status:r.status,outKeys:Object.keys(out).sort(),
 carriedRecordEqualsStoredRows:Array.isArray(out.carriedRecord)?JSON.stringify(sortedById(json(out.carriedRecord)))===JSON.stringify(sortedById(t.rows())):'absent',
 carriedRecordLen:out.carriedRecord?.length??null,storedRows:t.rows().length,
 engineReferenceState:out.referenceState===undefined?'absent':out.referenceState===null?'null':'present',storedReference:d.reference===null?'null':'present',
 engineUpdatedModel:out.updatedModel===undefined?'absent':'present',storedModelChanged:JSON.stringify(d.model)!==JSON.stringify(before.model)}));
