// R7A1-QE-r1 P01: a missed key strength session moved to a later slot (C4 MISSED_SESSION), then an equipment change that removes the
// equipment the moved content uses. C4 re-applies the recorded move to the re-planned rows: does it put the missed session's *history*
// prescription (barbell back-squat) into a slot dated after the change, i.e. prescribe equipment the athlete just said is unavailable?
// Oracle (not only order equivalence): no session dated on or after the change prescribes an exercise that needs equipment outside the
// stated list. Also compared with the reverse order and with FREEZE-2. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,print} from './qe-a1-lib.mjs';
const NEEDS_BARBELL=/^(back-squat|barbell-|front-squat|deadlift|bench-press$)/;
const out={probe:'R7A1-QE-P01',cases:{}};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT);
 const base=H.start({id:'qa1-p01',schedule:{strengthDays:[0,2,5],runDays:[1,3,6],longRunDay:6}},3),w=3,d0=base.p.weeks[w].startDate;
 const missed={kind:'MISSED_SESSION',targetSessionId:`w${w}-str-d0`};
 for(const [name,changes] of Object.entries({permanent:{equipment:['DUMBBELLS','BENCH']},window:{equipment:['DUMBBELLS','BENCH'],from:d0,to:d0.replace(/\d\d$/,m=>String(+m+6).padStart(2,'0'))}})){
  const eq={kind:'EQUIPMENT_CHANGE',changes};
  const A=H.copy(base),la=[H.ev(A,at(A.p,w,1,'07:00',missed)),H.ev(A,at(A.p,w,1,'07:30',eq))];
  const B=H.copy(base),lb=[H.ev(B,at(B.p,w,0,'06:00',eq)),H.ev(B,at(B.p,w,1,'07:00',missed))];
  const E=H.copy(base),le=[H.ev(E,at(E.p,w,1,'07:30',eq))];
  const barbellAfter=P=>P.weeks[w].sessions.filter(s=>s.day>=1&&s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').flatMap(s=>s.prescription.exercises.filter(e=>NEEDS_BARBELL.test(e.id)).map(e=>`${s.id}${s.moved?'<-'+s.moved.from:''} ${e.id} ${e.sets}x${e.reps} ${e.load.mode}${e.load.value??''}`));
  out.cases[`${tag}:${name}`]={
   missThenEquipment:{log:la.join(' then '),week:line(A.p,w),barbellOnOrAfterChange:barbellAfter(A.p),adaptations:(A.p.weeks[w].adaptations??[]).map(a=>a.kind)},
   equipmentThenMiss:{log:lb.join(' then '),week:line(B.p,w),barbellOnOrAfterChange:barbellAfter(B.p)},
   equipmentAlone:{log:le.join(''),week:line(E.p,w),barbellOnOrAfterChange:barbellAfter(E.p)},
   sameEitherOrder:line(A.p,w).join('\n')===line(B.p,w).join('\n')
  };
 }
}
print(out);
