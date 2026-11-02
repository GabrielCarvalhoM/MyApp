// Recheck probe RC-P4: QE-R7C-01 beyond the known stop. The predecessor's E1 reproduced the class with MISS answers only (every gap run reported
// not done). Its expectation is general: once the canonical facts make the window known, the run doses still ahead follow those facts whichever
// decision recorded them. Here the answer is V = MISS, EXEC (all done), MIXED (long runs done, the rest not done), ADVERSE (done, the long runs
// with an adverse response) or PARTIAL (half not done, the rest still unreported), recorded by a decision that does not apply it:
//  R4      a schedule change in the program's last week (HOLD), R10K race week;
//  CLIN    an exercise substitution with pain (CLINICAL_HUMAN_REQUIRED), GEN week 7 and R10K taper week 10, then qualified clearance (the client
//          continues with the carried record and no clinical reference state, as the predecessor modelled it);
// and the next decision is a plain review on day 3 (no observations; and the answer re-sent). Reference: the same answer delivered directly as a
// plain review on day 2 (DIRECT), then the same day-3 review. Property RI (recorder independence): the plan in force after the day-3 decision,
// from day 3 on (this week and the next), equals DIRECT's, with the same validity. Gap from week 0 or 2, RV or NR. Read-only; prints JSON.
import {RUNTIMES,live,addDays,notDone} from './rc-lib.mjs';
const GEN={id:'rc-p4-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:82.5,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]};
const R10K={id:'rc-p4-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const out={probe:'RC-P4 recorder independence of the answer',runtimes:Object.keys(RUNTIMES),cells:[],summary:{}};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,hash=R.hash;
 const step=(t,w,x={})=>{const r=H.evaluateProgram(t.p,{...H.review(t.p,w,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},H.opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
 const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
 const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
 const report=(p,from,to,V)=>runSessions(p,from,to).flatMap((s,i)=>V==='PARTIAL'?(i%2===0?[notDone(p,s)]:[]):[V==='MISS'||V==='MIXED'&&s.role!=='LONG'?notDone(p,s):H.obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{})]);
 function fork(o,{g,b,mode,V}){
  const t={p:H.program(o),ledger:[],ref:null};
  for(let w=0;w<g;w++)step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)step(t,w,{observations:strengthOf(t.p,w)});
  const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
  const facts=report(t.p,g,b,V),B=copy(t);step(B,b-1,{observations:strength});
  return {B,facts};
 }
 const plan=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks.slice(b,b+2).flatMap(x=>x.sessions).filter(s=>s.date>=day).map(s=>`${s.id}:${s.status??'PLANNED'}:${hash(s.prescription??null)}`);};
 const runs=(P,b,d)=>{const day=addDays(P.weeks[b].startDate,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}`);};
 const val=r=>r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status;
 for(const [prog,o,b,carriers] of [['R10K race week',R10K,11,['R4','CLIN']],['R10K taper',R10K,10,['CLIN']],['GEN',GEN,7,['CLIN']]])
 for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC','MIXED','ADVERSE','PARTIAL']){
  const {B,facts}=fork(o,{g,b,mode,V});
  const direct=copy(B),d2=step(direct,b,{day:2,hour:'07:00:00',observations:facts}),d3=step(direct,b,{day:3,hour:'07:00:00'});
  const ref={d2:d2.status,status:d3.status,validity:val(d3),plan:plan(d3.proposal??direct.p,b,3),runs:runs(d3.proposal??direct.p,b,3)};
  for(const carrier of carriers){
   const t=copy(B);let c;
   if(carrier==='R4')c=step(t,b,{day:2,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
   else{const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];c=step(t,b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;}
   for(const [label,x] of [['plain day 3',{}],['answer re-sent day 3',{observations:facts}]]){
    const u=copy(t),r=step(u,b,{day:3,hour:'07:00:00',...x}),P=r.proposal??u.p;
    const cell={runtime:name,cell:`${prog} g=${g} ${mode} ${V} ${carrier} :: ${label}`,carrier:c.status,status:r.status,validity:val(r),runs:runs(P,b,3),direct:ref,ceiling:/exceed what the recorded runs allow/.test(r.reason??'')};
    cell.RI=cell.validity===ref.validity&&JSON.stringify(plan(P,b,3))===JSON.stringify(ref.plan);
    out.cells.push(cell);
   }
  }
 }
 const mine=out.cells.filter(c=>c.runtime===name);
 out.summary[name]={cells:mine.length,RIfail:mine.filter(c=>!c.RI).length,RIfailValid:mine.filter(c=>!c.RI&&c.validity==='VALID').length,byV:Object.fromEntries(['MISS','EXEC','MIXED','ADVERSE','PARTIAL'].map(V=>[V,mine.filter(c=>c.cell.includes(` ${V} `)&&!c.RI).length]))};
}
console.log(JSON.stringify(out,null,1));
