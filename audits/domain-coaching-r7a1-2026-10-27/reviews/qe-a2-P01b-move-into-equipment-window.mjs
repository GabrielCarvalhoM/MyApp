// R7A1-QE-r1 P01b: the same mechanism as P01 without any later re-plan. An equipment window (dumbbells and bench only) stated in advance
// covers Wednesday-Sunday of week w; Monday's barbell session is outside it. (1) Monday's key session is missed and moved to Wednesday;
// (2) Monday is declared unavailable on Monday 06:00 (its PM session still ahead), so its key session is moved by the unavailable-day handler. Either move puts
// content planned for an outside-window date into a window date. Oracle: no session dated inside the window prescribes an exercise whose
// catalogue equipment is outside the window's list. Synthetic data, DEV_TEST_ONLY authority, prints only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,runtime,make,line,at,addDays,print} from './qe-a2-lib.mjs';
const {catalogueEntry}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-catalogue.mjs')).href);
const out={probe:'R7A1-QE-P01b',cases:{}};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT),w=3;
 const base=H.start({id:'qa1-p01b',schedule:{strengthDays:[0,2,5],runDays:[1,3,6],longRunDay:6}},3),d0=base.p.weeks[w].startDate;
 const list=['DUMBBELLS','BENCH'],win={from:addDays(d0,2),to:addDays(d0,6)};
 const stated=H.copy(base);H.ev(stated,at(stated.p,w-1,6,'22:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:list,...win}}));
 const bad=P=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED'&&s.date>=win.from&&s.date<=win.to).flatMap(s=>s.prescription.exercises.filter(e=>!(catalogueEntry(e.id)?.equipment??[]).every(q=>q==='BODYWEIGHT'||list.includes(q))).map(e=>`${s.date} ${s.id}${s.moved?'<-'+s.moved.from:''} ${e.id} ${e.sets}x${e.reps} ${e.load.mode}${e.load.value??''}`));
 const A=H.copy(stated),la=H.ev(A,at(A.p,w,1,'07:00',{kind:'MISSED_SESSION',targetSessionId:`w${w}-str-d0`}));
 const B=H.copy(stated),lb=H.ev(B,at(B.p,w,0,'06:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[d0]}}));
 out.cases[tag]={windowRowsBefore:line(stated.p,w),missedMove:{log:la,week:line(A.p,w),outsideWindowEquipment:bad(A.p)},unavailableMove:{log:lb,week:line(B.p,w),outsideWindowEquipment:bad(B.p)}};
}
print(out);
