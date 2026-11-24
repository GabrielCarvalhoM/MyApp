// V1 UI functional reconciliation (2026-11-24), finding GAP-CORE-06: an unplanned strength report through the ATHLETE channel. The answer lists
// it in `recorded`; this trace prints whether the engine ledger and the stored document hold a row with that id. Diagnostic only, no rule here.
import {athlete,ELIG,addDays,U,spy} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`; // deterministic ids (as v1int-journeys Journey D): reruns give the same bytes
const sp=spy();const t=athlete({newId,id:'ui-chk',weeks:12,engine:sp.engine});t.enroll();
const d=addDays(t.doc().program.startDate,5);t.set(d,'19:00');
for(const [tag,actual] of [['nosport',{completed:true,minutes:25}],['strength',{completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]}]]){
 const before=t.doc().rows.length;const r=t.weekly(d,[{occurrenceDate:d,actual,response:U}]);
 const call=sp.calls.at(-1);const engIds=(call.out.actualLedger??[]).map(o=>o.eventId);
 console.log(tag,r.ok,'recorded',r.recorded,'rows',before,'->',t.doc().rows.length,'inEngineLedger',r.recorded.every(id=>engIds.includes(id)),'inDoc',r.recorded.every(id=>t.doc().rows.some(x=>x?.eventId===id)),"version",r.version,"last",JSON.stringify(t.doc().rows.at(-1)).slice(0,300));
}
