// QRE probe Q8b: a logged load far above the prescription (typo / implausible) replaces the planned load next week
// without any bound or one-step limit. Real authority. Also checks a logged load BELOW prescription (respected) as control.
import {R6,baseIntake,review,obsFor,sessionsOf,write} from './qlib.mjs';
const squat=p=>sessionsOf(p).filter(s=>s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>({week:s.weekIndex,load:e.load.value,mode:e.load.mode,sets:e.sets,reps:e.reps,rir:e.rir})));
const r0=R6.generateProgram(baseIntake({id:'q-log-bound'})),p=r0.program;
const out={probe:'Q8b-logged-load-bound',authorityUsed:'REAL r6Authority()',planned:squat(p).slice(0,4)};
for(const logged of [800,200,82.5,60]){
 const w0=sessionsOf(p).filter(s=>s.weekIndex===0&&s.prescription);
 const obs=w0.map(s=>{const o=obsFor(p,s);for(const e of o.actual.exercises??[])if(e.id==='back-squat')for(const set of e.sets)set.load.value=logged;return o;});
 const ev=R6.evaluateProgram(p,review(p,0,{observations:obs}));
 out['logged_'+logged]={status:ev.status,action:ev.action,gates:ev.gates?.['back-squat'],next:ev.proposal?squat(ev.proposal).filter(x=>x.week>=1&&x.week<=3):null};
}
write('q8b-logged-load-bound.out.json',out);console.log(JSON.stringify(out,null,0));
