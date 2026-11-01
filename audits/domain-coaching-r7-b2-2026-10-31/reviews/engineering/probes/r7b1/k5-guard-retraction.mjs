// R7B1-ENG-r2 judge probe K5 (correction/retraction authority over the every-row event-week guard; HistoricalState vs PlanningProjection).
// Read-only; PROBE_ROOT=<tree> runs it on another runtime. A 10K athlete skips the day-4 strength session every week except one (its only
// execution), so the exercises only that session holds were performed once. On taper day 0 a correction says that session was not completed:
// - K5a: the factual re-plan leaves those exercises out of the event-week sessions still ahead (or a performed stand-in takes their place), and
//   discloses it; history no longer credits them;
// - K5b: without the correction (control) they stay (performed once), so the change is the correction's;
// - K5c: the same review carrying a block choice asks, and carries exactly that re-plan (R2-02 with the new guard).
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,correctionOf,apply,A,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const EV={id:'k5',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
const eventIds=(p,from,day)=>{const sk=P.skeletonOf(p,auth);return p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=day&&EVENT.includes(P.dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>s.prescription.exercises.map(e=>e.id)));};
const F=[],out={};
guard('K5','retraction',()=>{
 const t=reviewed(EV,0),T=t.p.phases.phases.indexOf('TAPER'),once=T-2;
 for(let w=0;w<T;w++)weekly(t,w,{keep:s=>!(s.sport==='STRENGTH'&&s.day===4)||w===once});
 const day=t.p.weeks[T].startDate,d4=t.p.weeks[once].sessions.find(s=>s.sport==='STRENGTH'&&s.day===4),d0=t.p.weeks[once].sessions.find(s=>s.sport==='STRENGTH'&&s.day===0);
 const onlyD4=d4.prescription.exercises.map(e=>e.id).filter(id=>!t.p.weeks.slice(0,T).some(w=>w.sessions.some(s=>s.sport==='STRENGTH'&&s.day===0&&(s.prescription?.exercises??[]).some(e=>e.id===id))));
 const obs=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&o.sessionId===d4.id),fix=obs.map(o=>correctionOf(o,{completed:false,minutes:0},`${day}T05:00:00Z`));
 const before=eventIds(t.p,T,day),ctl=evaluateProgram(t.p,{...review(t.p,T,{day:0,hour:'06:00:00',observations:[]}),actualLedger:t.ledger},opts);
 const r=evaluateProgram(t.p,{...review(t.p,T,{day:0,hour:'06:00:00',observations:fix}),actualLedger:t.ledger},opts);
 const withChoice=evaluateProgram(t.p,{...review(t.p,T,{day:0,hour:'06:00:00',observations:fix,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts);
 const after=r.proposal?eventIds(r.proposal,T,day):before,still=onlyD4.filter(id=>after.includes(id));
 const h=A.historicalStateOf(r.proposal??t.p,{asOf:`${day}T06:30:00Z`,actualLedger:r.actualLedger??t.ledger},opts),credited=onlyD4.filter(id=>h?.strength?.exercises?.[id]?.lastPerformedAt);
 const notes=(r.disclosures??[]).filter(d=>d.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');
 out.K5={onlyInTheRetractedSession:onlyD4,correction:{status:r.status,action:r.action,notes:notes.map(d=>d.detail.slice(0,200))},inEventWeeksBefore:onlyD4.filter(id=>before.includes(id)),stillAfter:still,historyStillCredits:credited,control:{status:ctl.status,action:ctl.action},withChoice:{status:withChoice.status,proposal:!!withChoice.proposal,same:!!withChoice.proposal&&!!r.proposal&&JSON.stringify(withChoice.proposal.weeks.slice(T).map(w=>w.sessions.map(s=>[s.id,s.prescription])))===JSON.stringify(r.proposal.weeks.slice(T).map(w=>w.sessions.map(s=>[s.id,s.prescription])))}};
 if(!onlyD4.length||!onlyD4.some(id=>before.includes(id))){F.push({note:'setup: no exercise held only by the retracted session is in the event weeks',info:out.K5});return;}
 if(still.length)F.push({note:'after the retraction a never-performed exercise stays in the event weeks ahead',still});
 if(credited.length)F.push({note:'history still credits a retracted execution',credited});
 if(!notes.length)F.push({note:'the omission the correction causes is not disclosed'});
 if(withChoice.status!=='ASK'||!out.K5.withChoice.same)F.push({note:'the block-choice question does not carry the same re-plan',withChoice:out.K5.withChoice});
});
record('K5','correction/retraction authority over the event-week guard',!F.length,'a retracted only execution removes the exercise from the event weeks ahead (disclosed), history stops crediting it, and a question carries the same re-plan',{label:LABEL,failures:F,info:out.K5??null});
done('k5-guard-retraction');
