// Exploration helper (prints the week structure of candidate programs); no assertions.
import {runtime,make,line} from './qe-a1-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
for(const [id,sch,ath] of [['x-s3',{strengthDays:[0,2,4]},{}],['x-r5',{runDays:[0,1,3,4,6],strengthDays:[2,5]},{recent:{runDaysPerWeek:5,runMinutesPerWeek:250,longestRunMinutes:80,strengthDaysPerWeek:2}}],['x-r4',{runDays:[0,2,4,6],strengthDays:[1,3]},{recent:{runDaysPerWeek:4,runMinutesPerWeek:220,longestRunMinutes:80,strengthDaysPerWeek:2}}]]){
 const t=H.start({id,schedule:sch,athlete:ath},3);
 console.log(id,'w3',JSON.stringify(line(t.p,3).map((r,i)=>r+(t.p.weeks[3].sessions[i].key?' KEY':'')),null,1));
}
