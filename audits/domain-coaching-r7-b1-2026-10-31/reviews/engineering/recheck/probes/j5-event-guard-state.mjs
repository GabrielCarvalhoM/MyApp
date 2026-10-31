// R7B1-ENG-r1 judge probe J5 (state transitions on the new paths; QE-R7B-OBS-04 guard semantics as engineering, not dose adequacy).
// Read-only; PROBE_ROOT=<tree> runs it on another runtime. A 10K athlete substitutes an exercise for a nonclinical preference on day 0 of the
// last week before the taper (the substitute is new in this program), then:
// - A executed: the substitute is executed that week and the week reviewed: it stays in the taper (performed, preservation);
// - B missed: its sessions are missed and the week reviewed: no taper row prescribes it (the guard reads the week's start state from evidence);
// - C retracted: executed and reviewed (so it is in the taper), then a correction on taper day 0 says those sessions were not done: the factual
//   re-plan takes it out of the taper sessions still ahead (correction/retraction authority over the guard's "performed");
// - D unreviewed (R18 path): nothing reported and no review of that week; a decision on taper day 0 that re-plans the week (a substitution of
//   another exercise) plans the taper from the PlanningView, not from the projection's assumed exposure;
// - J5h: HistoricalState never reads the projection: the substitute's lastPerformedAt is the execution date (A) or null (B, C, D).
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,correctionOf,apply,A,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const EV={goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
const EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const eventRows=(p,from,day=null)=>{const sk=P.skeletonOf(p,auth);return p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&(!day||s.date>=day)&&EVENT.includes(P.dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>s.prescription.exercises.map(e=>({w:w.index,s:s.id,id:e.id}))));};
const F=[],info={};
for(const [label,id] of [['split-squat','db-split-squat'],['row','db-row'],['rdl','db-rdl']])guard('J5-'+label,'event guard state',()=>{
 const base=reviewed({...EV,id:'j5-'+label},0),T=base.p.phases.phases.indexOf('TAPER'),pre=T-1;for(let w=0;w<pre;w++)weekly(base,w);
 if(!base.p.weeks[pre].sessions.some(s=>live(s)&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===id))){info[label]={skipped:id+' not in use in week '+pre};return;}
 const sub=t=>apply(t,evaluateProgram(t.p,{...review(t.p,pre,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts));
 const out={};
 const hist=(t,day,S)=>A.historicalStateOf(t.p,{asOf:`${day}T05:30:00Z`,actualLedger:t.ledger},opts)?.strength?.exercises?.[S]?.lastPerformedAt??null;
 // A executed
 {const t=structuredClone(base),r=sub(t),S=r.substitutions?.[0]?.selected;if(r.status!=='MODIFY'){info[label]={decision:r.status,reason:String(r.reason).slice(0,160)};return;}
  const projected=eventRows(t.p,T).filter(x=>x.id===S).length;weekly(t,pre);const tday=t.p.weeks[T].startDate;
  out.A={substitute:S,projectedInEventWeeksByTheDecision:projected,inTaperAfterReview:eventRows(t.p,T).filter(x=>x.id===S).length,history:hist(t,tday,S)};
  if(!out.A.history)F.push({label,case:'A',note:'executed substitute has no lastPerformedAt in history'});
  // C retracted: a correction on taper day 0 says the substitute's sessions were not done.
  const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[pre].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===S))).map(o=>correctionOf(o,{completed:false,minutes:0},`${tday}T05:00:00Z`));
  const c=structuredClone(t),rc=apply(c,evaluateProgram(c.p,{...review(c.p,T,{day:0,hour:'06:00:00',observations:fixes}),actualLedger:c.ledger},opts));
  const ahead=eventRows(c.p,T,addDays(tday,0)).filter(x=>x.id===S);
  out.C={corrected:fixes.length,status:rc.status,action:rc.action,substituteAheadInEventWeeks:ahead.length,history:hist(c,addDays(tday,0),S)};
  if(ahead.length)F.push({label,case:'C',note:'after the retraction the never-performed substitute is still prescribed in the event weeks ahead',rows:ahead.slice(0,4)});
  if(out.C.history)F.push({label,case:'C',note:'history keeps a retracted execution',history:out.C.history});}
 // B missed
 {const t=structuredClone(base),r=sub(t),S=r.substitutions[0].selected;weekly(t,pre,{keep:s=>!(s.prescription.exercises??[]).some(e=>e.id===S)});
  const rows=eventRows(t.p,T).filter(x=>x.id===S);out.B={inEventWeeks:rows.length,history:hist(t,t.p.weeks[T].startDate,S)};
  if(rows.length)F.push({label,case:'B',note:'missed substitute prescribed in the event weeks after the review',rows:rows.slice(0,4)});
  if(out.B.history)F.push({label,case:'B',note:'history reads a projected execution',history:out.B.history});}
 // D unreviewed week (R18 path), then a decision on taper day 0 that re-plans the week
 {const t=structuredClone(base),r=sub(t),S=r.substitutions[0].selected,tday=t.p.weeks[T].startDate;
  const other=t.p.weeks[T].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.id!==S&&e.role!=='PRACTICE').map(e=>e.id))[0];
  const d=other?evaluateProgram(t.p,{...review(t.p,T,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:other,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts):null;
  const planned=eventRows(t.p,T).filter(x=>x.id===S).length,after=d?.proposal?eventRows(d.proposal,T,tday).filter(x=>x.id===S&&x.w===T):[];
  out.D={projectedBeforeTheDecision:planned,decision:d?{status:d.status,action:d.action}:null,substituteInTaperWeekAfterDecision:after.length,history:hist(t,tday,S)};
  if(after.length)F.push({label,case:'D',note:'a decision in the taper week re-plans it from the projection: the unexecuted substitute stays',rows:after.slice(0,4)});
  if(out.D.history)F.push({label,case:'D',note:'history reads a projected execution',history:out.D.history});}
 info[label]=out;
});
record('J5','event-week guard and state transitions',!F.length,'the guard reads the evidence of the decision\'s own week; corrections and missed sessions remove a never-performed substitute from the event weeks; history never reads the projection',{failures:F,cases:info});
done('j5-event-guard-state');
