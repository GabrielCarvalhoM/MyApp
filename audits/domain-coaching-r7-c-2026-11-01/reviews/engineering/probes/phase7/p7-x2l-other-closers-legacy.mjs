// P7-X2L (legacy records): P7-X2 with every first-recorded clock removed from the carried record before the day-3 decision on both paths, as
// test/r7c-phase7 'backward behaviour' does (a record written before R7C-FREEZE-4). P7-X2: weeks of the unknown window closed by a decision other than the weekly review. GEN (b 7) or R10K taper (b 10), gap from week 0 or 2,
// RV. The week c (b-4, the last week the window closes with WEEK_EVIDENCE on the RV fork) is closed at day 6, 21:00 not by its weekly review but by
//  SUB  a nonclinical exercise substitution (a MODIFY whose decision records no gates), or
//  SCH  a schedule change moving the strength days (a MODIFY whose decision records no gates),
// both carrying the week's strength reports. The other gap weeks are reviewed with strength only; the review closing week b-1 asks. The answer
// (V over every gap run) is recorded on day 2 of week b by a clinical substitution with pain (cleared) or an unrecognised block choice whose ASK
// the client does not apply (C2); next decision a plain review on day 3, with and without the re-send. Reference: the same answer as a plain
// review on day 2. Property: plan in force from day 3 (weeks b, b+1) and validity equal the reference's. Read-only; prints JSON.
import {RUNTIMES,client,live,programs,strengthOf,runSessions,answer,csub,AT,brief,runsFromDay,planFrom,val,startsOf,strip} from './p7-lib.mjs';
const out={probe:'P7-X2L weeks closed by other handlers, legacy records (no first-recorded clocks)',runtimes:Object.keys(RUNTIMES),cells:[],summary:{}};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,P=programs(H),sum={cells:0,fail:0,staleValid:0,closedAsIntended:0,byV:{},byCloser:{}};
 for(const [prog,o,b] of [['GEN',P.GEN,7],['R10K taper',P.R10K,10]])for(const g of [0,2])for(const closer of ['SUB','SCH']){
  const c=b-4,t=client(R,H.program(o));
  for(let w=0;w<g;w++)t.step(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s))});
  let closeRes=null;
  for(let w=g;w<b-1;w++){
   const x={observations:strengthOf(H,t.p,w)};
   if(w!==c){t.step(w,x);continue;}
   if(closer==='SUB'){const X=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)).find(id=>/squat|deadlift|press|row/.test(id))??t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];closeRes=t.step(w,{...x,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:false}});}
   else closeRes=t.step(w,{...x,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[2,5]}});
  }
  const q=t.step(b-1,{observations:strengthOf(H,t.p,b-1)}),st=startsOf(t.p)[c+1],closedBy=t.p.decisions.find(d=>d.eventId===st.eventId);
  const intended=st.run==='WEEK_EVIDENCE'&&!!closedBy&&closedBy.action!=='GATED_NEXT_STEP';if(intended)sum.closedAsIntended++;
  for(const V of ['SHORT60','SHORT80','ADVERSE','SHORT_ADVERSE','LONGSHORT_REST_MISS','MIX_SHORT_MISS','EXEC']){
   const facts=runSessions(t.p,g,b).flatMap((s,i)=>answer(H,t.p,s,i,V)),stale=planFrom(R,t.p,b,3);
   const d=t.copy();d.step(b,{...AT(2),observations:facts});d.ledger=strip(d.ledger);const d3=d.step(b,AT(3));const ref={validity:val(d3),plan:planFrom(R,d.p,b,3),runs:runsFromDay(d.p,b,3,2)};
   for(const carrier of ['CSUB','CHOICE']){
    const u0=t.copy();let cr;
    if(carrier==='CSUB')cr=csub(u0,b,facts);else cr=u0.step(b,{...AT(2),observations:facts,choices:[{type:'NOT_A_CHOICE'}]},{apply:false});
    for(const [next,x] of [['plain day 3',{}],['re-sent day 3',{observations:facts}]]){
     const u=u0.copy();u.ledger=strip(u.ledger);const r=u.step(b,{...AT(3),...x}),plan=planFrom(R,u.p,b,3),ok=val(r)===ref.validity&&JSON.stringify(plan)===JSON.stringify(ref.plan);
     const staleValid=!ok&&val(r)==='VALID'&&JSON.stringify(plan)===JSON.stringify(stale)&&JSON.stringify(ref.plan)!==JSON.stringify(stale);
     sum.cells++;if(!ok){sum.fail++;sum.byV[V]=(sum.byV[V]??0)+1;sum.byCloser[closer]=(sum.byCloser[closer]??0)+1;}if(staleValid)sum.staleValid++;
     out.cells.push({runtime:name,cell:`${prog} g=${g} close w${c} by ${closer} ${V} ${carrier} :: ${next}`,question:q.question?.kind??null,closing:{start:st.run,by:closedBy?.action??null,gates:closedBy?.gates??null,closeStatus:closeRes?.status},carrier:cr.status,decision:brief(r),runs:runsFromDay(u.p,b,3,2),direct:ref.runs,directValidity:ref.validity,ok,staleValid});
    }
   }
  }
 }
 out.summary[name]=sum;
}
console.log(JSON.stringify(out,null,1));
