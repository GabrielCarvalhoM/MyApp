// Exploration: which schedules let a missed key strength session move to a later strength slot (MISSED_SESSION -> MOVE).
import {runtime,make,line,at} from './qe-a1-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const out=[];
for(const sd of [[0,2,4],[0,2,5],[0,3,5],[0,1,3],[0,2,3],[0,4,5],[1,2,4],[0,2,4,5]])for(const rd of [[1,3,6],[3,5,6],[1,6],[5,6],[2,6],[4,6],[3,6]]){
 if(sd.some(d=>rd.includes(d)))continue;
 let t;try{t=H.start({id:'x-'+sd.join('')+rd.join(''),schedule:{strengthDays:sd,runDays:rd,longRunDay:6},athlete:{recent:{runDaysPerWeek:rd.length,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:sd.length}}},3);}catch(e){continue;}
 const wk=t.p.weeks[3].sessions,key=wk.filter(s=>s.sport==='STRENGTH'&&s.key&&s.prescription);
 for(const k of key){const T=H.copy(t);const r=H.ev(T,at(T.p,3,k.day+1,'07:00',{kind:'MISSED_SESSION',targetSessionId:k.id}));
  const mv=T.last.counterfactuals?.filter(c=>c.action==='MOVE');if(mv?.length)out.push([sd.join(''),rd.join(''),k.id,r,mv.map(c=>c.id+':'+c.admissible+':'+c.reason).join(' | ')].join(' '));}
}
console.log(out.join('\n'));
