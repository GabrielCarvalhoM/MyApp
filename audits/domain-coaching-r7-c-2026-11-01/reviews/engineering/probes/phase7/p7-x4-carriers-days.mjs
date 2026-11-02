// P7-X4: shortened, adverse and mixed answers through the carriers and carrier days test/r7c-phase7 does not use. Programs GEN (b 7, 9) and R10K
// taper (b 10); gap from week 0 or 2; RV or NR; answers SHORT60, SHORT80, SHORT_ADVERSE, LONGSHORT_REST_MISS, MIX_SHORT_MISS, ADVERSE over every
// gap run; carriers CSUB (substitution with pain), CRET (return report, INJURY, 3 days ending the day before), each cleared, and CHOICE (an
// unrecognised block choice whose ASK the client records but does not apply, C2); carrier days 1, 4 and 5 (07:00). Reference: the same answer
// as a plain review at the same time. Steps: S1 a plain review the next day (07:00); S2 the week's review (day 6, 21:00, no reports); S3 week
// b+1 day 1 plain review. Each step: validity and the plan from the step's day over weeks b, b+1 against the reference's. Also while a clinical
// route stands (before clearance) the next day: CLINICAL_HUMAN_REQUIRED, no proposal, never valid. Read-only; prints JSON.
import {RUNTIMES,client,live,programs,strengthOf,runSessions,answer,csub,fork,AT,brief,runsFromDay,planFrom,val,addDays} from './p7-lib.mjs';
const out={probe:'P7-X4 carriers and carrier days',runtimes:Object.keys(RUNTIMES),summary:{},failures:[],clinicalStanding:{}};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,P=programs(H),sum={trajectories:0,steps:0,failedSteps:0,failedTrajectories:0,staleValid:0,validDiffering:0,byV:{},byCarrier:{},byStep:{}},stand={checked:0,violations:[]};
 for(const [prog,o,b] of [['GEN',P.GEN,7],['GEN',P.GEN,9],['R10K taper',P.R10K,10]])for(const g of [0,2])for(const mode of ['RV','NR']){
  const {t:B,question}=fork(R,o,{g,b,mode});if(question!=='UNREPORTED_TRAINING')continue;
  for(const V of ['SHORT60','SHORT80','SHORT_ADVERSE','LONGSHORT_REST_MISS','MIX_SHORT_MISS','ADVERSE'].filter(v=>!process.env.P7X4_V||process.env.P7X4_V.split(',').includes(v))){
   const facts=runSessions(B.p,g,b).flatMap((s,i)=>answer(H,B.p,s,i,V));
   for(const d of [1,4,5]){
    const steps=[['S1 plain d'+(d+1),b,AT(d+1),d+1],['S2 week review',b,{day:6,hour:'21:00:00'},6],['S3 next week d1',b+1,AT(1),null]];
    const run=t=>steps.map(([label,w,x,day])=>{const stale=w===b?planFrom(R,t.p,b,day??0):null;const r=t.step(w,x);const dd=w===b?day:1;return {label,...brief(r),plan:planFrom(R,t.p,w,dd),runs:runsFromDay(t.p,w,dd,2),stale};});
    const ref=B.copy();ref.step(b,{...AT(d),observations:facts});const RS=run(ref);
    for(const carrier of ['CSUB','CRET','CHOICE']){
     const t=B.copy();let c;
     if(carrier==='CSUB')c=(()=>{const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];return t.step(b,{...AT(d),kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});})();
     else if(carrier==='CRET')c=t.step(b,{...AT(d),kind:'RETURN_AFTER_PAUSE',interruption:{days:3,reasonCategory:'INJURY',endDate:addDays(t.p.weeks[b].startDate,d-1)},observations:facts});
     else c=t.step(b,{...AT(d),observations:facts,choices:[{type:'NOT_A_CHOICE'}]},{apply:false});
     if(carrier!=='CHOICE'){const h=t.copy(),x=h.step(b,AT(d+1));stand.checked++;if(x.status!=='CLINICAL_HUMAN_REQUIRED'||x.proposal||val(x)==='VALID')stand.violations.push(`${prog} b=${b} g=${g} ${mode} ${V} ${carrier} d=${d}: ${x.status}`);t.ref=null;}
     const S=run(t);sum.trajectories++;let failed=false;
     S.forEach((s,i)=>{sum.steps++;const r=RS[i],ok=s.validity===r.validity&&JSON.stringify(s.plan)===JSON.stringify(r.plan);if(!ok){failed=true;sum.failedSteps++;sum.byStep[s.label.split(' ')[0]]=(sum.byStep[s.label.split(' ')[0]]??0)+1;if(s.validity==='VALID'&&r.validity==='VALID')sum.validDiffering++;if(s.validity==='VALID'&&s.stale&&JSON.stringify(s.plan)===JSON.stringify(s.stale)&&JSON.stringify(r.plan)!==JSON.stringify(s.stale))sum.staleValid++;if(out.failures.length<60)out.failures.push({runtime:name,cell:`${prog} b=${b} g=${g} ${mode} ${V} ${carrier} d=${d}`,step:s.label,carrier:c.status,path:{status:s.status,validity:s.validity,origin:s.origin,question:s.question,runs:s.runs},reference:{status:r.status,validity:r.validity,origin:r.origin,question:r.question,runs:r.runs}});}});
     if(failed){sum.failedTrajectories++;sum.byV[V]=(sum.byV[V]??0)+1;sum.byCarrier[carrier]=(sum.byCarrier[carrier]??0)+1;}
    }
   }
  }
 }
 out.summary[name]=sum;out.clinicalStanding[name]=stand;
}
console.log(JSON.stringify(out,null,1));
