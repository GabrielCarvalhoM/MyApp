// Recheck probe RC-P5: provenance of week b+1's start after a factual re-plan with `uncredited` sessions (QE-R7C-02 / C9). composeWeeks now
// projects week b+1 from week b WITHOUT the elapsed unreported sessions (`credited`), but records the start's authority with
// projectedStart(first.week), whose RUN premise is documented as "the rows of one sport a projection of the next week's start assumed executed".
// Does the recorded RUN premise name the uncredited rows as assumed executed? GEN week 7, known stop answered on day 2 (the day-1 run elapsed with
// no report). Read-only; prints JSON.
import {RUNTIMES,live,addDays,notDone} from './rc-lib.mjs';
const out={probe:'RC-P5 premise of the start after an uncredited re-plan',runtimes:Object.keys(RUNTIMES),by:{}};
const GEN={id:'rc-p5',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:82.5,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,b=7;
 const step=(t,w,x={})=>{const r=H.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},H.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 const t={p:H.program(GEN),ledger:[],ref:null};
 for(let w=0;w<b-1;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(t.p,s))});
 step(t,b-1,{observations:t.p.weeks[b-1].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(t.p,s))});
 const facts=t.p.weeks.slice(0,b).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')).map(s=>notDone(t.p,s));
 const r=step(t,b,{day:2,hour:'07:00:00',observations:facts});
 const wk=t.p.weeks[b],day2=addDays(wk.startDate,2),reported=new Set(t.ledger.map(o=>o.sessionId));
 const uncredited=wk.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&s.date<day2&&!reported.has(s.id)).map(s=>s.id);
 const premise=t.p.weeks[b+1].startAuthority?.RUN?.premise??null;
 out.by[name]={decision:{status:r.status,action:r.action},uncredited,recordedRunPremise:premise,provenance:t.p.weeks[b+1].startAuthority?.RUN?.provenance??null,
  premiseOfWeekAsPlanned:R.P.premiseOf(wk,'RUN'),premiseWithoutUncredited:R.P.premiseOf({...wk,sessions:wk.sessions.filter(s=>!uncredited.includes(s.id))},'RUN')};
 out.by[name].namesUncreditedAsAssumed=premise===out.by[name].premiseOfWeekAsPlanned&&uncredited.length>0;
}
console.log(JSON.stringify(out,null,1));
