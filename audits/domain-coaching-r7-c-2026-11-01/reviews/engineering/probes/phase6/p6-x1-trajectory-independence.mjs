// P6-X1: recorder independence beyond the 160-cell grid, followed over a trajectory. The answer to UNREPORTED_TRAINING (asked by the review that
// closes week b-1) is recorded by a decision that does not apply it, and the client then continues through the rest of week b and the next two
// weeks. Reference: the same answer delivered directly as a plain review on the same day, then the same continuation.
// Dimensions (beyond rc-p4 / test/r7c-phase6): programs GEN (b 7, 9) and R10K (b 8, 10, 11); gap from week 0 or 2; RV (weeks reviewed with
// strength only) or NR (not reviewed); answers MISS, EXEC, MIXED, ADVERSE, PARTIAL, LONGONE (only the oldest gap long run in the window done),
// SHORT (every gap run done at 60 % of its minutes), EASYONLY (every gap run but the long runs done); carrier days 1, 2 and 4; carriers:
//  CSUB    an exercise substitution with pain (handler clinical route), then qualified clearance (the client drops the clinical reference state);
//  CRET    a return report with a clinical reason (INJURY, 3 days ending the day before), then qualified clearance;
//  CHOICE  a plain review carrying the answer and an unrecognised block choice: ASK with the answered re-plan proposed, which the client records
//          but does not apply (C2: a REQUIRES_RECONCILIATION result is not presented as a prescription);
//  R4      a schedule change in the program's last week (HOLD), R10K race week only.
// Continuation (S1..S6): plain review the next day; plain review on day 5; the week's review (day 6, no reports); week b+1 day 1 plain review;
// week b+1 day 6 review with its sessions reported as prescribed; week b+2 day 1 plain review. Each step compares status, validity, question
// and the plan from the step's day over two weeks with the reference's. Also checked while the clinical route stands (before clearance): the
// next day is CLINICAL_HUMAN_REQUIRED, no proposal, never valid. Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,notDone,BAD,brief,val,planFrom,runsFromDay} from './p6-lib.mjs';
const LIMIT=Number(process.env.P6_LIMIT??40);
const out={probe:'P6-X1 trajectory recorder independence',runtimes:Object.keys(RUNTIMES),summary:{},failures:{},clinicalStanding:{}};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H;
 const GEN={id:'p6x1-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
 const R10K={id:'p6x1-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
 const runSessions=(p,from,to)=>p.weeks.slice(from,to).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'));
 const report=(p,g,b,V)=>{
  const runs=runSessions(p,g,b),start=p.weeks[b].startDate,oldestLong=runs.filter(s=>s.role==='LONG'&&addDays(s.date,30)>=start).sort((x,y)=>x.date<y.date?-1:1)[0];
  return runs.flatMap((s,i)=>{
   switch(V){
    case 'MISS':return [notDone(p,s)];
    case 'EXEC':return [H.obs(p,s)];
    case 'MIXED':return [s.role==='LONG'?H.obs(p,s):notDone(p,s)];
    case 'ADVERSE':return [H.obs(p,s,s.role==='LONG'?{response:BAD}:{})];
    case 'PARTIAL':return i%2===0?[notDone(p,s)]:[];
    case 'LONGONE':return [s.id===oldestLong?.id?H.obs(p,s):notDone(p,s)];
    case 'SHORT':return [H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.6))})];
    case 'EASYONLY':return [s.role==='LONG'?notDone(p,s):H.obs(p,s)];
   }
  });
 };
 function fork(o,{g,b,mode}){
  const t=client(R,H.program(o));
  for(let w=0;w<g;w++)t.step(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)t.step(w,{observations:strengthOf(t.p,w)});
  const strength=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)];
  const before=t.copy(),q=t.step(b-1,{observations:strength});
  return {t,before,question:q.question?.kind??null};
 }
 const AT=(d,h='07:00:00')=>({day:d,hour:h});
 function carry(t,b,carrier,facts,d){
  if(carrier==='R4')return t.step(b,{...AT(d),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts});
  if(carrier==='CSUB'){const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];return t.step(b,{...AT(d),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});}
  if(carrier==='CRET')return t.step(b,{...AT(d),kind:'RETURN_AFTER_PAUSE',interruption:{days:3,reasonCategory:'INJURY',endDate:addDays(t.p.weeks[b].startDate,d-1)},observations:facts});
  if(carrier==='CHOICE')return t.step(b,{...AT(d),observations:facts,choices:[{type:'NOT_A_CHOICE'}]},{apply:false});
 }
 /** The continuation after the carrier day d; returns one record per step. */
 function continueFrom(t,b,d){
  const steps=[],N=t.p.weeks.length,rec=(label,w,day,r)=>steps.push({label,...brief(r),plan:planFrom(R,t.p,w,day),runs:runsFromDay(t.p,w,day)});
  if(d+1<=5)rec('S1 plain d+1',b,d+1,t.step(b,AT(d+1)));
  if(d+1<5)rec('S2 plain d5',b,5,t.step(b,AT(5)));
  rec('S3 week review d6',b,6,t.step(b,AT(6,'21:00:00')));
  if(b+1<N){rec('S4 next week d1',b+1,1,t.step(b+1,AT(1)));
   rec('S5 next week review d6 (reported)',b+1,6,t.step(b+1,{...AT(6,'21:00:00'),observations:t.p.weeks[b+1].sessions.filter(live).map(s=>H.obs(t.p,s))}));}
  if(b+2<N)rec('S6 week b+2 d1',b+2,1,t.step(b+2,AT(1)));
  return steps;
 }
 const sum={trajectories:0,steps:0,failedSteps:0,failedTrajectories:0,validDiffering:0,staleValid:0,questionNotAsked:0,byCarrier:{},byV:{},byStep:{}},fails=[],standing={checked:0,violations:[]};
 for(const [prog,o,b] of [['GEN',GEN,7],['GEN',GEN,9],['R10K',R10K,8],['R10K',R10K,10],['R10K',R10K,11]])
 for(const g of [0,2])for(const mode of ['RV','NR']){
  const {t:B,question}=fork(o,{g,b,mode});
  if(question!=='UNREPORTED_TRAINING'){sum.questionNotAsked++;continue;}
  for(const V of ['MISS','EXEC','MIXED','ADVERSE','PARTIAL','LONGONE','SHORT','EASYONLY'].filter(v=>!process.env.P6_V||process.env.P6_V.split(',').includes(v))){
   const facts=report(B.p,g,b,V);
   for(const d of [1,2,4]){
    const direct=B.copy(),d0=direct.step(b,{...AT(d),observations:facts}),ref=continueFrom(direct,b,d);
    const carriers=['CSUB','CRET','CHOICE',...(b===11?['R4']:[])];
    for(const carrier of carriers){
     const t=B.copy(),stale=planFrom(R,t.p,b,d+1<=6?d+1:6),c=carry(t,b,carrier,facts,d);
     const label=`${prog} b=${b} g=${g} ${mode} ${V} d=${d} ${carrier}`;
     if(carrier==='CSUB'||carrier==='CRET'){
      // While the clinical route stands: the client keeps the clinical reference state.
      const held=t.copy(),h=held.step(b,AT(Math.min(d+1,6)));standing.checked++;
      if(c.status!=='CLINICAL_HUMAN_REQUIRED'||h.status!=='CLINICAL_HUMAN_REQUIRED'||h.proposal||val(h)==='VALID')standing.violations.push({label,carrier:brief(c),next:brief(h)});
      t.ref=null;
     }
     const steps=continueFrom(t,b,d);sum.trajectories++;let bad=false;
     for(const [i,s] of steps.entries()){
      const r=ref[i];sum.steps++;
      // The property is the plan in force, its validity and the open question; the status may differ only where the carried path re-plans at
      // this step what the direct path re-planned on the carrier's day (MODIFY against KEEP), which is counted apart.
      const same=r&&s.validity===r.validity&&s.question===r.question&&JSON.stringify(s.plan)===JSON.stringify(r.plan);
      if(same&&s.status!==r.status){sum.statusOnly=(sum.statusOnly??0)+1;const k=`${s.status}/${s.origin} vs ${r.status}/${r.origin}`;sum.statusOnlyKinds=sum.statusOnlyKinds??{};sum.statusOnlyKinds[k]=(sum.statusOnlyKinds[k]??0)+1;}
      if(!same){
       bad=true;sum.failedSteps++;sum.byStep[s.label]=(sum.byStep[s.label]??0)+1;
       if(s.validity==='VALID')sum.validDiffering++;
       if(i===0&&s.validity==='VALID'&&JSON.stringify(s.plan)===JSON.stringify(stale)&&JSON.stringify(r?.plan)!==JSON.stringify(stale))sum.staleValid++;
       if(fails.length<LIMIT)fails.push({label,carrier:brief(c),step:s.label,got:{status:s.status,validity:s.validity,question:s.question,origin:s.origin,runs:s.runs},ref:r?{status:r.status,validity:r.validity,question:r.question,origin:r.origin,runs:r.runs}:null});
      }
     }
     if(bad){sum.failedTrajectories++;sum.byCarrier[carrier]=(sum.byCarrier[carrier]??0)+1;sum.byV[V]=(sum.byV[V]??0)+1;}
    }
   }
  }
 }
 out.summary[name]=sum;out.failures[name]=fails;out.clinicalStanding[name]=standing;
}
console.log(JSON.stringify(out,null,1));
