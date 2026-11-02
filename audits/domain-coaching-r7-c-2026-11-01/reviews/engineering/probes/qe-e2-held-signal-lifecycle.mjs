// QE probe E2: the held reactive signal's lifecycle across decisions that do not answer the question.
// (a) a fatigue held on day 0; on day 1 a strength-only change is kept beside the question (REQUIRES_RECONCILIATION, the "carried" path); the
//     answer comes in a plain review on day 2. Is the held fatigue still carried, and re-evaluated with the answer (as on time)?
// (b) a LOCAL_FATIGUE held on day 0, then a SYSTEMIC_FATIGUE held on day 1: does the first signal survive?
// (c) a fatigue held on day 0; a plain review on day 1 that does not answer; the answer on day 2 (control: tested path).
// Read-only. node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e2-held-signal-lifecycle.mjs
import {GEN,fork,step,copy,AT,fromDay,brief,addDays} from './qe-lib.mjs';
const out={probe:'QE-E2 held signal lifecycle',cases:[]};
const sig=r=>r.referenceState?.pending?.signal?{kind:r.referenceState.pending.signal.kind,weekIndex:r.referenceState.pending.signal.weekIndex}:null;
for(const V of ['MISS','EXEC']){
 const b=7,{A,B,facts}=fork(GEN,{g:0,b,mode:'RV',V}),day4=addDays(A.p.weeks[b].startDate,4);
 // (a)
 {
  const a=copy(A),t=copy(B);
  const a0=step(a,b,{...AT(0),kind:'SYSTEMIC_FATIGUE'}),a1=step(a,b,{day:1,hour:'07:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day4]}});
  const b0=step(t,b,{...AT(0),kind:'SYSTEMIC_FATIGUE'}),b1=step(t,b,{day:1,hour:'07:00:00',kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[day4]}}),b2=step(t,b,{...AT(2),observations:facts});
  out.cases.push({case:`(a) held fatigue, then a kept strength change, then the answer (${V})`,onTime:[brief(a0),brief(a1)],B:[{...brief(b0),signal:sig(b0)},{...brief(b1),signal:sig(b1)},{...brief(b2),signal:sig(b2)}],
   fatigueReEvaluatedWithAnswer:/re-evaluated with the answer/.test(b2.reason??''),samePlanAsOnTimeFromDay2:JSON.stringify(fromDay(t.p,b,2))===JSON.stringify(fromDay(a.p,b,2)),
   onTimeRunsFromDay2:a.p.weeks[b].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&s.date>=addDays(a.p.weeks[b].startDate,2)).map(s=>`${s.role}:${s.prescription.durationMinutes}`),
   BRunsFromDay2:t.p.weeks[b].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&s.date>=addDays(t.p.weeks[b].startDate,2)).map(s=>`${s.role}:${s.prescription.durationMinutes}`)});
 }
 // (b)
 {
  const t=copy(B),b0=step(t,b,{...AT(0),kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),b1=step(t,b,{day:1,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE'});
  out.cases.push({case:`(b) local fatigue held, then systemic fatigue held (${V})`,B:[{...brief(b0),signal:sig(b0)},{...brief(b1),signal:sig(b1)}],firstSignalSurvives:sig(b1)?.kind==='LOCAL_FATIGUE'||false});
 }
 // (c) control
 {
  const a=copy(A),t=copy(B),a0=step(a,b,{...AT(0),kind:'SYSTEMIC_FATIGUE'});
  const b0=step(t,b,{...AT(0),kind:'SYSTEMIC_FATIGUE'}),b1=step(t,b,{day:1,hour:'07:00:00'}),b2=step(t,b,{...AT(2),observations:facts});
  out.cases.push({case:`(c) control: held fatigue, plain review without answer, then answer (${V})`,B:[{...brief(b0),signal:sig(b0)},{...brief(b1),signal:sig(b1)},{...brief(b2),signal:sig(b2)}],samePlanAsOnTimeFromDay2:JSON.stringify(fromDay(t.p,b,2))===JSON.stringify(fromDay(a.p,b,2))});
 }
}
console.log(JSON.stringify(out,null,1));
