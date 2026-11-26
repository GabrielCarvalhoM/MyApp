// ABC foundation consolidation (2026-11-26): diagnostic probe over the current runtime (synthetic). Run from the repo root: node audits/v1-abc-foundation-consolidation-2026-11-26/evidence/probe-gap12-symptom-stop.mjs
import {athlete,addDays,U} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const STOP={completed:false,minutes:10,sport:'RUN',stop:{reason:'SYMPTOM'}};
for(const sc of ['alone-noObs','alone-obs','second-obs','planned-stop']){
const t=athlete({newId,id:'g12e'+sc,weeks:12});t.enroll();const d=addDays(t.doc().program.startDate,5);t.set(d,'19:00');
if(sc==='second-obs')t.weekly(d,[{occurrenceDate:d,observedAt:d+'T17:00:00-03:00',actual:{completed:true,minutes:25,sport:'RUN'},response:U}]);
let o={occurrenceDate:d,actual:STOP,response:U};if(sc!=='alone-noObs')o.observedAt=d+'T18:30:00-03:00';
if(sc==='planned-stop'){const wk=t.doc().program.weeks[0];const s=wk.sessions.find(x=>x.sport==='RUN'&&x.prescription&&x.date>=wk.startDate);o={sessionId:s.id,occurrenceDate:s.date,actual:{completed:false,minutes:10,stop:{reason:'SYMPTOM'}},response:U};t.set(s.date,'19:00');}
const r=t.weekly(o.occurrenceDate,[o]);
console.log(sc,'rec',r.recorded.length,'kept',t.doc().rows.some(x=>x?.eventId===r.recorded[0]),'screen',JSON.stringify(r.warningSignScreen));}
