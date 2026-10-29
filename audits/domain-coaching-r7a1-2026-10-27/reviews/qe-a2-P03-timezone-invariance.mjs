// R7A1-QE-r1 P03: time-zone translation invariance. The same athlete, schedule and history in another time zone, with every review and
// report at the same *local* wall time, must get the same plan (rows in order and states). C1 (`aheadOf`: noon and day end), `returnedOn`,
// the adaptations' clocks and the observation dates all read local time; a difference here is a handler reading UTC somewhere.
// Single changes and pairs of the author's change set, at local 05:00/06:00, 11:30/12:30 (the AM boundary) and 23:00/23:30 (a UTC date
// different from the local one for both signs of the offset). Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,addDays,print,whole,firstDiff} from './qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const ZONES=[0,-300,330,780,-600];
const programs={plain:{ia:{schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},weeks:3},race:{ia:{athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},weeks:6}};
const changes=(p,w,day,isRace)=>{const d0=p.weeks[w].startDate,dd=addDays(d0,day),wk=p.weeks[w].sessions,late=wk.find(s=>s.prescription&&s.day>day)??wk.filter(s=>s.prescription).at(-1);
 const key=wk.find(s=>s.prescription&&s.sport==='RUN'&&s.role==='QUALITY'&&s.day<day);
 return {SYSTEMIC:{kind:'SYSTEMIC_FATIGUE'},UNAVAILABLE:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[late.date]}},
  EQUIPMENT:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},WINDOW:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:dd,to:addDays(d0,13)}},
  SCHEDULE:{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}},GOAL:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},
  RETURN_MOD:{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(dd,-16),endDate:addDays(dd,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},
  RETURN_SHORT:{kind:'RETURN_AFTER_PAUSE',interruption:{days:5,startDate:addDays(dd,-5),endDate:addDays(dd,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},
  ...(key?{MISSED:{kind:'MISSED_SESSION',targetSessionId:key.id}}:{}),
  ...(isRace?{EVENT_REACH:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d0,9)}},EVENT_LATER:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.goal.run.event.date,14)}}}:{})};};
const CLOCKS=[[0,'05:00','06:00'],[1,'11:30','12:30'],[3,'23:00','23:30'],[4,'20:00','21:00']];
const out={probe:'R7A1-QE-P03',zones:ZONES,clocks:CLOCKS,compared:0,same:0,differences:[],errors:[]};
const bases={};
for(const tz of ZONES)for(const [name,{ia,weeks}] of Object.entries(programs))bases[tz+name]=H.start({...ia,id:'qa1-p03-'+name,tz},weeks);
for(const [name,{weeks:w}] of Object.entries(programs))for(const [day,h1,h2] of CLOCKS){
 const C=changes(bases['0'+name].p,w,day,name==='race'),keys=Object.keys(C),seqs=[...keys.map(k=>[k]),...keys.flatMap((a,i)=>keys.slice(i+1).flatMap(b=>[[a,b],[b,a]]))];
 for(const seq of seqs){
  const res={};
  for(const tz of ZONES){try{const T=H.copy(bases[tz+name]),log=seq.map((k,i)=>H.ev(T,at(T.p,w,day,i?h2:h1,changes(T.p,w,day,name==='race')[k])));res[tz]={P:T.p,log};}catch(e){out.errors.push({name,day,seq,tz,error:String(e).slice(0,200)});}}
  if(!res[0])continue;
  for(const tz of ZONES.slice(1)){if(!res[tz])continue;out.compared++;if(whole(res[tz].P,w)===whole(res[0].P,w)&&res[tz].log.join()===res[0].log.join()){out.same++;continue;}
   out.differences.push({program:name,day,clock:[h1,h2],seq:seq.join(' then '),tz,logUtc:res[0].log.join(' | '),logTz:res[tz].log.join(' | '),first:firstDiff(res[0].P,res[tz].P,w)});}
 }
}
out.differences=out.differences.slice(0,40);
print(out);
