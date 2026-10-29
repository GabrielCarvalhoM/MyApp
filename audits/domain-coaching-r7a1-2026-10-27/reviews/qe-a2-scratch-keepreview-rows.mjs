// R7A1-QE-r2 scratch (exploration only): rows of later weeks after a KEEP weekly review vs after a no-op / schedule change the same evening;
// and the rows when the next week is then reviewed as prescribed. Prints only.
import {runtime,make,at,obs,line,print} from './qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const ALL=['DUMBBELLS','BENCH','BARBELL','RACK'];
const pick=P=>P.weeks.slice(3,9).map((x,k)=>`w${3+k}: `+x.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>/calf|split/.test(e.id)).map(e=>`${s.id.slice(-2)}:${e.id.replace('db-','')} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''}`)).join(' | '));
const out={};
for(const [n,x] of Object.entries({reviewOnly:null,noopEquipment:{kind:'EQUIPMENT_CHANGE',changes:{equipment:[...ALL,'TREADMILL']}},scheduleSameDays:{kind:'SCHEDULE_CHANGE',changes:{runMinutes:61}}})){
 const t=H.start({id:'qa2-p15a'},3);H.weekly(t,3);if(x)H.ev(t,at(t.p,3,6,'22:00',x));
 const plan=pick(t.p);H.weekly(t,4);H.weekly(t,5);
 out[n]={planAfter:plan,afterReviewsOfW4W5:pick(t.p)};
}
out.planSame=out.reviewOnly.planAfter.join()===out.noopEquipment.planAfter.join();
out.afterSame=out.reviewOnly.afterReviewsOfW4W5.join()===out.noopEquipment.afterReviewsOfW4W5.join();
print(out);
