// Recheck probe RC-P4b: the mechanism of QE-R7C-07 on one cell per carrier (F2 = the worktree unless QE_ROOTS says otherwise).
// R10K race week, gap from week 2, RV, MIXED answer (gap long runs done, the other gap runs not done) carried by (a) an R4 schedule change on day 2
// (HOLD, recorded) and (b) an exercise substitution with pain on day 2 (clinical, recorded; then clearance). For the next decision (plain review,
// day 3) it prints the facts' single-run ceiling for the week (longest completed run in the 30 days before it + 5), the stored runs ahead, whether
// any run dose ahead exceeds that ceiling (the only condition under which the ceiling re-plan acts), and the plan in force, against the same
// answer delivered as a plain review on day 2. Read-only; prints JSON.
import {RUNTIMES,live,addDays,notDone} from './rc-lib.mjs';
const R10K={id:'rc-p4b-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const GEN={id:'rc-p4b-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:82.5,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]};
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const out={probe:'RC-P4b mechanism',cases:[]};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H;
 const step=(t,w,x={})=>{const r=H.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},H.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
 const runs=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
 const ceilingAt=(t,w)=>{const start=t.p.weeks[w].startDate,from=addDays(start,-30);const m=t.ledger.filter(o=>!o.conflicted&&o.context?.sport==='RUN'&&(o.actual?.completed===true||Number(o.actual?.minutes)>0)&&o.localDate>=from&&o.localDate<start).map(o=>Number(o.actual?.minutes)||0);return m.length?Math.max(...m)+5:H.opts.authority.policy.operational.return.entryRunMinutes;};
 for(const [label,o,b,V,carrier] of [['R10K race week g=2 RV MIXED',R10K,11,'MIXED','R4'],['R10K race week g=2 RV MIXED',R10K,11,'MIXED','CLIN'],['GEN week 7 g=0 RV ADVERSE',GEN,7,'ADVERSE','CLIN'],['R10K taper g=2 RV MIXED',R10K,10,'MIXED','CLIN']]){
  const g=label.includes('g=2')?2:0,t0={p:H.program(o),ledger:[],ref:null};
  for(let w=0;w<g;w++)step(t0,w,{observations:t0.p.weeks[w].sessions.filter(live).map(s=>H.obs(t0.p,s))});
  for(let w=g;w<b;w++)step(t0,w,{observations:t0.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(t0.p,s))});
  const q=t0.ref?.pending?.status??null;
  const facts=t0.p.weeks.slice(g,b).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')).map(s=>V==='MIXED'&&s.role!=='LONG'?notDone(t0.p,s):H.obs(t0.p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{}));
  const direct=copy(t0);step(direct,b,{day:2,hour:'07:00:00',observations:facts});const d3=step(direct,b,{day:3,hour:'07:00:00'});
  const t=copy(t0);let c;
  if(carrier==='R4')c=step(t,b,{day:2,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
  else{const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];c=step(t,b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;}
  const ceiling=ceilingAt(t,b),stored=runs(t.p,b,3),r=step(t,b,{day:3,hour:'07:00:00'});
  out.cases.push({runtime:name,case:`${label} via ${carrier}`,questionBeforeAnswerWeek:q,carrier:{status:c.status,reason:String(c.reason??'').slice(0,100),answerRecorded:facts.every(f=>t.ledger.some(x=>x.sessionId===f.sessionId))},
   factsCeiling:ceiling,storedRunsAhead:stored,anyRunAboveCeiling:stored.some(x=>!/^RACE:/.test(x)&&Number(x.split(':')[1])>ceiling),
   nextDecision:{status:r.status,action:r.action,validity:r.planValidity?.status,runsAhead:runs(r.proposal??t.p,b,3)},directAnswerThenDay3:{runsAhead:runs(d3.proposal??direct.p,b,3),validity:d3.planValidity?.status}});
 }
}
console.log(JSON.stringify(out,null,1));
