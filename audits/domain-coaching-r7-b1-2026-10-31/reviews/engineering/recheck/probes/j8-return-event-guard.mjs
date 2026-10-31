// R7B1-ENG-r1 judge probe J8 (event-week guard through a return): a substitution before the taper whose substitute was executed (kept) or missed
// (never performed), then a short nonclinical interruption reported in the taper week. The return's re-plan of the event weeks keeps the guard:
// a never-performed substitute does not enter them; a performed one may. Read-only; PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,apply,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const EV={goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
const EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const eventRows=(p,from,day)=>{const sk=P.skeletonOf(p,auth);return p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=day&&EVENT.includes(P.dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>s.prescription.exercises.map(e=>({w:w.index,s:s.id,id:e.id}))));};
const F=[],out={};
for(const id of ['db-split-squat','db-row','db-rdl'])for(const exec of [true,false])guard('J8-'+id+'-'+exec,'return in taper',()=>{
 const t=reviewed({...EV,id:'j8-'+id},0),T=t.p.phases.phases.indexOf('TAPER'),pre=T-1;for(let w=0;w<pre;w++)weekly(t,w);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,pre,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts));
 if(s.status!=='MODIFY')return;const S=s.substitutions[0].selected;
 weekly(t,pre,{keep:exec?()=>true:x=>!(x.prescription.exercises??[]).some(e=>e.id===S)});
 const rep=addDays(t.p.weeks[T].startDate,3);
 const r=evaluateProgram(t.p,{...review(t.p,T,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:addDays(rep,-3),endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts);
 const rows=r.proposal?eventRows(r.proposal,T,rep).filter(x=>x.id===S):[];
 out[id+(exec?'-executed':'-missed')]={substitute:S,return:{status:r.status,action:r.action},substituteInEventWeeksAfterReturn:rows.length};
 if(!exec&&rows.length)F.push({id,S,note:'a never-performed substitute enters the event weeks through the return',rows:rows.slice(0,4)});
});
record('J8','event-week guard through a return',!F.length,'the return re-plans the event weeks with the guard: no never-performed substitute',{label:LABEL,failures:F,cases:out});
done('j8-return-event-guard');
