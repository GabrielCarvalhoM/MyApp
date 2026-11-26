// ABC foundation consolidation (2026-11-26): diagnostic probe over the current runtime (synthetic). Run from the repo root: node audits/v1-abc-foundation-consolidation-2026-11-26/evidence/probe-gap12-merge.mjs
import {athlete,ELIG,addDays,U} from '../../../CoachingCore/test/v1int-helpers.mjs';
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const STR={completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]};
for(const scen of ['strength-alone','run-then-strength','strength-then-run','strength-other-day']){
 const t=athlete({newId,id:'g12-'+scen,weeks:12});t.enroll();const d=addDays(t.doc().program.startDate,5);t.set(d,'19:00');
 const seq=scen==='strength-alone'?[STR]:scen==='run-then-strength'?[{completed:true,minutes:25},STR]:scen==='strength-then-run'?[STR,{completed:true,minutes:25,sport:'RUN'}]:[STR];
 let day=d;
 for(const actual of seq){const r=t.weekly(day,[{occurrenceDate:day,actual,response:U}]);
  const rows=t.doc().rows;const id=r.recorded?.[0];const row=rows.find(x=>x?.eventId===id);const host=rows.find(x=>x&&(x.provenance?.mergedSourceIds??[]).includes(id)||x&&x.provenance?.parts&&Object.keys(x.provenance.parts).includes(id));
  console.log(scen, actual.sport??'nosport', 'ok',r.ok,'rec',JSON.stringify(r.recorded),'notRec',JSON.stringify(r.notRecorded),'rowKept',!!row,'mergedInto',host?.eventId??null,'ctx',JSON.stringify(row?.context??host?.context??null),'nulls',rows.filter(x=>x===null).length);
  if(scen==='strength-other-day')day=addDays(d,1);}
}
