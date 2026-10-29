// QRE probe Q8a: load-unit handling. A self-reported known load in LB (accepted by the canonicalizer as complete) and a
// logged set in LB (review observation) both become KNOWN kilogram prescriptions without conversion. Real authority.
import {R6,baseIntake,review,obsFor,sessionsOf,write} from './qlib.mjs';
const out={probe:'Q8a-pound-load',authorityUsed:'REAL r6Authority()'};
const squatLoads=p=>sessionsOf(p).filter(s=>s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>({week:s.weekIndex,session:s.id,load:e.load,sets:e.sets,reps:e.reps})));
// 1. Intake known load in LB.
for(const unit of ['KG','LB']){
 const i=baseIntake({id:'q-unit-'+unit,athlete:{knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:135,unit,convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]}});
 const r=R6.generateProgram(i);
 out['intake_'+unit]={status:r.status,canonicalKnownLoad:r.program?.canonical.athlete.knownExercises.find(e=>e.id==='back-squat')?.dose?.load,week0Squat:r.program?squatLoads(r.program).filter(x=>x.week===0):null};
}
// 2. Review log in LB for a KNOWN-load exercise (athlete logs 100 lb = 45.4 kg while prescribed 80 kg).
const r0=R6.generateProgram(baseIntake({id:'q-unit-log'})),p=r0.program;
const w0=sessionsOf(p).filter(s=>s.weekIndex===0&&s.prescription);
const obs=w0.map(s=>{const o=obsFor(p,s);if(o.actual.exercises)for(const e of o.actual.exercises)if(e.id==='back-squat')for(const set of e.sets)set.load={value:176,unit:'LB',convention:'TOTAL'};return o;});
const ev=R6.evaluateProgram(p,review(p,0,{observations:obs}));
out.reviewLogLB={status:ev.status,action:ev.action,plannedWeek0:squatLoads(p).filter(x=>x.week===0),proposedWeek1:ev.proposal?squatLoads(ev.proposal).filter(x=>x.week===1):null,loggedValue:'176 LB (= 79.8 kg)'};
write('q8a-pound-load.out.json',out);
console.log(JSON.stringify(out,null,1));
