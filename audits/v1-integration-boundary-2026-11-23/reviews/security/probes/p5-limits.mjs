// SEC_INT_R1 probe 5: admission limits per route. (A) the per-day bound, spread over back-dated days. (B) after the correction limit a
// symptom stop on that session has no admissible route. (C) enroll/restart intake: no admission bound. (D) wall time of one refusal.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p5-limits.mjs
import {athlete,athleteA,ELIG,addDays} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;
const bytes=t=>t.store.raw(t.id).length;

// A
{const t=athlete({id:'p5a'});t.enroll();const ss=t.sessions(0),run=ss.find(s=>s.id==='w0-run-d1');t.set(addDays(run.date,1),'20:00');
 const base=bytes(t);let rec=0,refused={};const {sessionId:_s,...free}=t.form(run);
 for(let back=1;back<=60;back++){const day=addDays(run.date,-back),obs=Array.from({length:8},(_,k)=>({...free,occurrenceDate:day,actual:{completed:true,minutes:30+k,rpe:4}}));
  const r=t.weekly(addDays(run.date,1),obs);if(r.ok)rec+=r.recorded.length;else refused[r.error.code]=(refused[r.error.code]??0)+1;}
 console.log('A 60 back-dated days x 8 unplanned reports (60 requests): recorded',rec,'refused',refused,'| record bytes',base,'->',bytes(t));}

// B
{const t=athlete({id:'p5b'});t.enroll();const str=t.sessions(0).find(s=>s.sport==='STRENGTH');t.set(str.date,'20:00');
 let id=t.weekly(str.date,[t.form(str)]).recorded[0];
 for(let k=1;k<=16;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:id,actual:{...t.form(str).actual,minutes:30+k}}]);if(!r.ok){console.log('B correction',k,code(r));break;}id=r.recorded[0];}
 t.clock+=60e3;const withStop={...t.form(str),actual:{...t.form(str).actual,stop:{reason:'SYMPTOM'}},response:{recovery:'ADVERSE'}};
 const c17=t.weekly(str.date,[{...withStop,correctionOf:id}]),fresh=t.weekly(str.date,[withStop]);
 console.log('B 17th correction carrying a symptom stop:',code(c17),c17.error?.limit,c17.safetyFields,'| as a new report:',code(fresh),fresh.safetyFields);}

// C
{const t=athlete({id:'p5c'});const intake=athleteA({weeks:8,id:'p5c'});const pad='x'.repeat(400000);
 const big={...intake,athlete:{...intake.athlete,notes:pad,performanceAnchors:[...intake.athlete.performanceAnchors,...Array.from({length:3000},(_,i)=>({...intake.athlete.performanceAnchors[0],note:String(i)}))]}};
 let t0=Date.now();const e=t.enroll(big);console.log('C enroll with a 400 KB field and 3000 anchors:',code(e),e.status??'',e.enrolled??'',Date.now()-t0,'ms; record bytes',t.store.raw('p5c')?.length??null);
 if(!e.enrolled){t.enroll();}const v=t.version();t0=Date.now();const r=t.it.restart({actor:t.actor,intake:big,expectedVersion:v});
 console.log('C restart with the same intake:',code(r),r.status??'',Date.now()-t0,'ms; record bytes',t.store.raw('p5c').length,'| JSON depth 5000 intake:');
 let deep={};let cur=deep;for(let i=0;i<5000;i++){cur.a={};cur=cur.a;}t0=Date.now();
 let r2;try{r2=t.it.restart({actor:t.actor,intake:{...intake,athlete:{...intake.athlete,deep}},expectedVersion:t.version()});}catch(e){r2={ok:false,error:{code:'THREW:'+e.constructor.name}};}
 console.log('C restart with a 5000-deep field:',code(r2),r2.status??'',Date.now()-t0,'ms');}
