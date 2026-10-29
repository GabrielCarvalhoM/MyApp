// QE probe N2 (reach of finding B2): in every week of the 10K and half-marathon timelines of probe N, an EVENT_DATE_CHANGE moving the race
// 7 days earlier is adopted (day 0, 05:00), then the ordinary same-week reviews of probe N run (not adopted). Counted: proposals the
// current runtime rejects with phaseDose errors while the pre-R7A runtime does not. Also: GOAL_CHANGE adding a 10K to the no-event program.
import {cur,pre,opts,intake,review,obs,addDays,out,SQUAT,BENCH} from './qe-lib.mjs';
const P=await pre(),START='2026-11-02';
const programs={
 TEN_K:{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays(START,13*7+6)}},strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}},
 HALF:{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays(START,12*7+2)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:90}},schedule:{runDays:[0,2,4,6],strengthDays:[1,4],longRunDay:6,runMinutes:60,longRunMinutes:120,strengthMinutes:45}},
 NONE_ADD_10K:{weeks:12,add:true,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}},schedule:{strengthDays:[0,2,4],runDays:[1,3,6],longRunDay:6}}
};
const same=(p,w)=>{const wk=p.weeks[w],run=wk.sessions.find(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.day>0),l=[];
 if(run)l.push(['UNAVAILABLE_DAY',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[run.date]}}]);
 l.push(['LOCAL_FATIGUE',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}],['SYSTEMIC_FATIGUE',{kind:'SYSTEMIC_FATIGUE'}]);return l;};
const walk=(R,name,ia)=>{let p=R.generateProgram(intake({id:'qe-N2-'+name,...ia}),opts).program,ledger=[];const res={};
 for(let w=0;w<p.weeks.length-1;w++){
  const ev=p.goal.run.event,change=ia.add?{goals:{run:{kind:'RACE'}},event:{kind:'10K',date:addDays(p.weeks[w].startDate,9)}}:{eventDate:addDays(ev?.date??p.weeks[w].startDate,-7)};
  const e=R.evaluateProgram(p,review(p,w,{day:0,hour:'05',kind:ia.add?'GOAL_CHANGE':'EVENT_DATE_CHANGE',changes:change,actualLedger:ledger}),opts);
  if(e.proposal){for(const [k,x] of same(e.proposal,w)){const r=R.evaluateProgram(e.proposal,review(e.proposal,w,{day:0,hour:'06',...x,observations:[],actualLedger:e.actualLedger}),opts);res[`${name}:w${w}:${k}`]={change:`${e.status}/${e.action}`,status:r.status,phaseDose:(r.errors??[]).filter(x=>String(x).includes('phaseDose')).length};}}
  const r=R.evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }return res;};
const A={},B={};for(const [n,ia] of Object.entries(programs)){Object.assign(A,walk(cur,n,ia));Object.assign(B,walk(P,n,ia));}
const bad=Object.keys(A).filter(k=>A[k].status==='UNSUPPORTED'&&A[k].phaseDose>0);
out('N2',{sameWeekProposalsAfterChange:Object.keys(A).length,rejectedWithPhaseDose_current:bad.length,ofWhichAcceptedByPreR7A:bad.filter(k=>B[k]&&B[k].status!=='UNSUPPORTED').length,cases:bad.map(k=>`${k} cur=${A[k].status}(${A[k].phaseDose}) pre=${B[k]?.status??'-'}`)});
