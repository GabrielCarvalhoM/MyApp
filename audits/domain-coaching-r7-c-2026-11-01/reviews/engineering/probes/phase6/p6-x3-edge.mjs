// P6-X3: the disclosed edge. GEN, weeks 0-6 reviewed with strength only (runs never reported), so the review of week 6 asks UNREPORTED_TRAINING.
// The answer: only the oldest long run of the window done, every other gap run not done (LONGONE). Paths, on every runtime given:
//  T  the answer delivered inside a day-4 SCHEDULE_CHANGE (the transition path, gapAnsweredBy): the change's re-plan from next week asks about
//     next week's window (week 7's elapsed runs have no report);
//  C  the same answer recorded by a clinical substitution on day 2, cleared, then the same day-4 SCHEDULE_CHANGE (the recorded path, G01 guard);
//  M  the answer delivered directly on day 2 (applied), then on day 4 a SCHEDULE_CHANGE carrying a correction of the answer's long run (the
//     MOVED origin, viewMovedBy), to see whether the edge is specific to the transition path.
// For each: the decision (status, validity, question, origin, proposal) and, when there is a proposal, the run doses it plans for weeks 7 and 8;
// then two clients: one applies the ASK's proposal, one does not; each continues with a plain review on day 5, the week's review on day 6 and
// week 8's first decision. Reported: whether any of those decisions is VALID, and the plans. Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,notDone,brief,val,planFrom,runsOfWeek,runsFromDay} from './p6-lib.mjs';
const out={probe:'P6-X3 the transition path beside a later-week question',runtimes:Object.keys(RUNTIMES),results:{}};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,b=7,GEN={id:'p6x3-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
 const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
 const B=client(R,H.program(GEN));for(let w=0;w<b;w++)B.step(w,{observations:strengthOf(B.p,w)});
 const runs=B.p.weeks.slice(0,b).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')),start=B.p.weeks[b].startDate;
 const longest=runs.filter(s=>s.role==='LONG'&&addDays(s.date,30)>=start).sort((x,y)=>x.date<y.date?-1:1)[0];
 const facts=runs.map(s=>s.id===longest.id?H.obs(B.p,s):notDone(B.p,s));
 const SC={day:4,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]}};
 const stale={w7:runsFromDay(B.p,b,4),w8:runsOfWeek(B.p,b+1)};
 const show=(t,r)=>({...brief(r),reason:String(r.reason??'').slice(0,240),questionFromWeek:r.question?.fromWeek??null,unreported:r.question?.unreported?.sessionIds??null,proposal:r.proposal?{w7FromDay4:runsFromDay(r.proposal,b,4),w8:runsOfWeek(r.proposal,b+1),w8StartProvenance:r.proposal.weeks[b+1].startAuthority?.RUN?.provenance??null}:null});
 const follow=(t)=>{const a=t.step(b,{day:5,hour:'07:00:00'}),c=t.step(b,{day:6,hour:'21:00:00'}),d=t.step(b+1,{day:1,hour:'07:00:00'});return [['d5 plain',a,b,5],['d6 review',c,b,6],['w8 d1',d,b+1,1]].map(([l,r,w,day])=>({step:l,...brief(r),question:r.question?.kind??null,runs:runsFromDay(t.p,w,day),w8:runsOfWeek(t.p,b+1)}));};
 const res={stale,paths:{}};
 // T: the transition path.
 {const t=B.copy(),r=t.step(b,{...SC,observations:facts},{apply:false});res.paths.T={decision:show(t,r)};
  const applied=B.copy();applied.step(b,{...SC,observations:facts},{apply:true});res.paths.T.clientApplies=follow(applied);
  const ignored=B.copy();ignored.step(b,{...SC,observations:facts},{apply:false});res.paths.T.clientIgnores=follow(ignored);}
 // C: recorded by a clinical route, cleared, then the same change.
 {const t=B.copy(),X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  const c=t.step(b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;
  const u=t.copy(),r=u.step(b,SC,{apply:false});res.paths.C={carrier:brief(c),decision:show(u,r)};
  const applied=t.copy();applied.step(b,SC,{apply:true});res.paths.C.clientApplies=follow(applied);}
 // D: the direct answer on day 2, then the same change on day 4 (no new facts): the reference for both.
 {const t=B.copy(),a=t.step(b,{day:2,hour:'07:00:00',observations:facts}),r=t.copy().step(b,SC,{apply:false});res.paths.D={answer:show(t,a),change:show(t,r)};
  const applied=t.copy();applied.step(b,SC,{apply:true});res.paths.D.clientApplies=follow(applied);}
 // M: the direct answer on day 2, then a day-4 change carrying a correction of the answer's long run (60 % of its minutes).
 {const t=B.copy();t.step(b,{day:2,hour:'07:00:00',observations:facts});
  const orig=t.ledger.find(o=>o.sessionId===longest.id&&o.actual?.completed===true),fix={...H.obs(B.p,longest,{minutes:Math.round(longest.prescription.durationMinutes*0.6)}),correctionOf:orig.eventId,correctedAt:`${addDays(start,4)}T06:00:00Z`};
  const r=t.copy().step(b,{...SC,observations:[fix]},{apply:false});res.paths.M={decision:show(t,r)};
  const applied=t.copy();applied.step(b,{...SC,observations:[fix]},{apply:true});res.paths.M.clientApplies=follow(applied);}
 out.results[name]=res;
}
console.log(JSON.stringify(out,null,1));
