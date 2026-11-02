// P6-X5: QE-R7C-07's class with answers that report executed but shortened runs. The predecessor's grid (rc-p4) and test/r7c-phase6 use EXEC,
// MIXED and ADVERSE answers only. Here the answer to UNREPORTED_TRAINING reports:
//  SHORT60          every gap run done at 60 % of its minutes;
//  SHORT80          every gap run done at 80 % of its minutes;
//  LONGSHORT_REST_MISS  the gap long runs done at 60 %, every other gap run reported not done;
//  LONGSHORT_REST_EXEC  the gap long runs done at 60 %, every other gap run done as prescribed (control: an executed gate);
//  EXEC             control.
// recorded by a decision that does not apply it (CSUB: a substitution with pain, then qualified clearance; CHOICE: a plain review with an
// unrecognised block choice whose ASK proposal the client does not apply; R4: a schedule change in the last week), then a plain review on day 3
// with and without the re-send. Reference: the same answer delivered directly as a plain review on day 2, then the same day-3 review.
// Programs: GEN week 7 and R10K taper (week 10), gap from week 0 or 2, RV (weeks reviewed with strength only) or NR; R10K race week (11) with R4.
// Property: the plan in force from day 3 (weeks b, b+1) and its validity equal the reference's. Reported per runtime: failing cells, and those
// where the stale projection stays VALID. Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,notDone,brief,val,planFrom,runsFromDay} from './p6-lib.mjs';
const out={probe:'P6-X5 shortened executed answers',runtimes:Object.keys(RUNTIMES),summary:{},cells:[]};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H;
 const GEN={id:'p6x5-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
 const R10K={id:'p6x5-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
 const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
 const short=(p,s,f)=>H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*f))});
 const report=(p,g,b,V)=>runSessions(p,g,b).map(s=>{switch(V){
  case 'SHORT60':return short(p,s,0.6);
  case 'SHORT80':return short(p,s,0.8);
  case 'LONGSHORT_REST_MISS':return s.role==='LONG'?short(p,s,0.6):notDone(p,s);
  case 'LONGSHORT_REST_EXEC':return s.role==='LONG'?short(p,s,0.6):H.obs(p,s);
  case 'EXEC':return H.obs(p,s);}});
 function fork(o,{g,b,mode}){
  const t=client(R,H.program(o));
  for(let w=0;w<g;w++)t.step(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)t.step(w,{observations:strengthOf(t.p,w)});
  const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
  const q=t.step(b-1,{observations:strength});return {t,question:q.question?.kind??null};
 }
 const AT=d=>({day:d,hour:'07:00:00'});
 const sum={cells:0,fail:0,staleValid:0,byV:{},byCarrier:{},byMode:{}};
 for(const [prog,o,b,carriers] of [['GEN',GEN,7,['CSUB','CHOICE']],['R10K taper',R10K,10,['CSUB','CHOICE']],['R10K race week',R10K,11,['CSUB','CHOICE','R4']]])
 for(const g of [0,2])for(const mode of ['RV','NR']){
  const {t:B,question}=fork(o,{g,b,mode});
  for(const V of ['SHORT60','SHORT80','LONGSHORT_REST_MISS','LONGSHORT_REST_EXEC','EXEC']){
   const facts=report(B.p,g,b,V),stale=planFrom(R,B.p,b,3),staleRuns=runsFromDay(B.p,b,3);
   const direct=B.copy();direct.step(b,{...AT(2),observations:facts});const d3=direct.step(b,AT(3));
   const ref={validity:val(d3),plan:planFrom(R,direct.p,b,3),runs:runsFromDay(direct.p,b,3)};
   for(const carrier of carriers){
    const t=B.copy();let c;
    if(carrier==='R4')c=t.step(b,{...AT(2),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
    else if(carrier==='CSUB'){const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];c=t.step(b,{...AT(2),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;}
    else c=t.step(b,{...AT(2),observations:facts,choices:[{type:'NOT_A_CHOICE'}]},{apply:false});
    for(const [next,x] of [['plain day 3',{}],['answer re-sent day 3',{observations:facts}]]){
     const u=t.copy(),r=u.step(b,{...AT(3),...x}),plan=planFrom(R,u.p,b,3);
     const ok=val(r)===ref.validity&&JSON.stringify(plan)===JSON.stringify(ref.plan);
     const staleValid=!ok&&val(r)==='VALID'&&JSON.stringify(plan)===JSON.stringify(stale)&&JSON.stringify(ref.plan)!==JSON.stringify(stale);
     sum.cells++;if(!ok){sum.fail++;sum.byV[V]=(sum.byV[V]??0)+1;sum.byCarrier[carrier]=(sum.byCarrier[carrier]??0)+1;sum.byMode[mode]=(sum.byMode[mode]??0)+1;}if(staleValid)sum.staleValid++;
     out.cells.push({runtime:name,cell:`${prog} g=${g} ${mode} ${V} ${carrier} :: ${next}`,question,carrier:c.status,decision:brief(r),runs:runsFromDay(u.p,b,3),stale:staleRuns,direct:ref.runs,directValidity:ref.validity,ok,staleValid});
    }
   }
  }
 }
 out.summary[name]=sum;
}
console.log(JSON.stringify(out,null,1));
