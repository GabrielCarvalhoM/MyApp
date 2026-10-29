// R7A1-QE-r1 P12: a refusal found by P09. A bodyweight-only equipment window over Wednesday-Thursday of week 6, then the race moved to the
// Wednesday of week 7 (so this week's Thursday falls in the race window): the composed week puts the window's substitute for the main hinge
// (glute-bridge, a catalogue ACCESSORY) into a race-window strength session, and final validation (C7, phase dose: main lifts only) refuses
// the whole event change as UNSUPPORTED. Both orders and FREEZE-2. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,addDays,print} from './qe-a1-lib.mjs';
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const out={probe:'R7A1-QE-P12',cases:{}};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT),w=6;
 const t=H.start({id:'qa1-p12',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},w),d0=t.p.weeks[w].startDate;
 const win={kind:'EQUIPMENT_CHANGE',changes:{equipment:['BODYWEIGHT'],from:addDays(d0,2),to:addDays(d0,3)}},move={kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d0,9)}};
 const A=H.copy(t),la=[H.ev(A,at(A.p,w,0,'05:00',win)),H.ev(A,at(A.p,w,0,'07:00',move))],ea=A.last.errors??null;
 const B=H.copy(t),lb=[H.ev(B,at(B.p,w,0,'05:00',move)),H.ev(B,at(B.p,w,0,'07:00',win))],eb=B.last.errors??null;
 const E=H.copy(t),le=[H.ev(E,at(E.p,w,0,'07:00',move))];
 out.cases[tag]={windowThenEvent:{log:la,errors:ea,eventDate:A.p.goal.run.event.date},eventThenWindow:{log:lb,errors:eb,eventDate:B.p.goal.run.event.date,week:line(B.p,w).filter(r=>r.includes('STRENGTH'))},eventAlone:{log:le,week:line(E.p,w).filter(r=>r.includes('STRENGTH'))}};
}
print(out);
