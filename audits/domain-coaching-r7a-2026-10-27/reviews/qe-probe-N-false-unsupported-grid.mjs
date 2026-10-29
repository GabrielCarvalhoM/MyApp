// QE probe N (does the new R7-A validation reject legitimate proposals in ordinary use?). For three programs (10K, half marathon,
// no event), every week of an as-prescribed timeline is branched into ordinary review kinds (not adopted). Each runtime walks its own
// timeline; a case where the current runtime returns UNSUPPORTED with phaseDose errors and the pre-R7A runtime does not is listed.
import {cur,pre,opts,intake,review,obs,addDays,out,SQUAT,BENCH} from './qe-lib.mjs';
const P=await pre();
const START='2026-11-02';
const programs={
 TEN_K:{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}},
 HALF:{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays(START,12*7+2)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:90}},schedule:{runDays:[0,2,4,6],strengthDays:[1,4],longRunDay:6,runMinutes:60,longRunMinutes:120,strengthMinutes:45}},
 NONE:{weeks:12,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}},schedule:{strengthDays:[0,2,4],runDays:[1,3,6],longRunDay:6}}
};
const kinds=(p,w)=>{const wk=p.weeks[w],str=wk.sessions.find(s=>s.sport==='STRENGTH'&&s.prescription),key=wk.sessions.find(s=>s.key&&s.prescription&&s.role!=='RACE'),run=wk.sessions.find(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.day>0);
 const day0=wk.startDate,list=[];
 if(key)list.push(['MISSED_SESSION',{day:key.day,kind:'MISSED_SESSION',targetSessionId:key.id}]);
 if(run)list.push(['UNAVAILABLE_DAY',{day:0,hour:'05',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[run.date]}}]);
 list.push(['LOCAL_FATIGUE',{day:0,hour:'05',kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}],['SYSTEMIC_FATIGUE',{day:0,hour:'05',kind:'SYSTEMIC_FATIGUE'}]);
 list.push(['EQUIPMENT_TEMP',{day:0,hour:'05',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:day0,to:addDays(day0,13)}}]);
 list.push(['SCHEDULE_NEXT',{day:0,hour:'05',kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:40}}]);
 list.push(['GOAL_STRENGTH',{day:0,hour:'05',kind:'GOAL_CHANGE',changes:{goals:{strength:'GENERAL'}}}]);
 if(p.goal.run.event){const ev=p.goal.run.event.date;list.push(['EVENT_LATER',{day:0,hour:'05',kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(ev,7)}}],['EVENT_EARLIER',{day:0,hour:'05',kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(ev,-7)}}]);}
 for(const d of [12,20,40])list.push(['RETURN_'+d,{day:2,kind:'RETURN_AFTER_PAUSE',interruption:{days:d,startDate:addDays(day0,2-d),endDate:addDays(day0,1),reasonCategory:'TRAVEL',reason:'Travel'}}]);
 return list;};
const walk=(R,name,ia)=>{let p=R.generateProgram(intake({id:'qe-N-'+name,...ia}),opts).program,ledger=[];const res={};
 for(let w=0;w<p.weeks.length-1;w++){
  for(const [k,x] of kinds(p,w)){const r=R.evaluateProgram(p,review(p,w,{...x,observations:[],actualLedger:ledger}),opts);res[`${name}:w${w}:${k}`]={status:r.status,phaseDose:(r.errors??[]).filter(e=>String(e).includes('phaseDose')).slice(0,3),other:(r.errors??[]).filter(e=>!String(e).includes('phaseDose')).slice(0,2)};}
  const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }return res;};
const A={},B={};for(const [n,ia] of Object.entries(programs)){Object.assign(A,walk(cur,n,ia));Object.assign(B,walk(P,n,ia));}
const tally=x=>Object.values(x).reduce((m,v)=>(m[v.status]=(m[v.status]??0)+1,m),{});
const newUnsupported=Object.keys(A).filter(k=>A[k].status==='UNSUPPORTED'&&A[k].phaseDose.length&&B[k]?.status!=='UNSUPPORTED').map(k=>({case:k,current:A[k],preR7A:B[k]?.status}));
const anyPhaseDose=Object.keys(A).filter(k=>A[k].phaseDose.length).map(k=>({case:k,status:A[k].status,phaseDose:A[k].phaseDose}));
out('N',{cases:Object.keys(A).length,currentStatuses:tally(A),preR7AStatuses:tally(B),newUnsupportedWithPhaseDose:newUnsupported.length,list:newUnsupported.slice(0,20),allPhaseDoseRejections:anyPhaseDose.length,phaseDoseList:anyPhaseDose.slice(0,20)});
