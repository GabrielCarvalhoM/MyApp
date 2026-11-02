// P6-I cell: GEN week 7, gap from week 0, weeks reviewed with strength only (RV); the answer (argv[3]: SHORT60 or EXEC) recorded by a clinical
// substitution on day 2, cleared, then a plain review on day 3 with QE_LOG set. Run with QE_ROOTS pointing at the instrumented copy:
//   QE_ROOTS="F3I=<instrumented copy>" node p6-i-cell.mjs <absolute path of p6-lib.mjs> SHORT60
import {pathToFileURL} from 'node:url';
const L=await import(pathToFileURL(process.argv[2]).href);
const {RUNTIMES,client,live,brief,runsFromDay}=L;const R=Object.values(RUNTIMES)[0],H=R.H;
const V=process.argv[3];
const GEN={id:'p6x5-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]};
const strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
const b=7,t=client(R,H.program(GEN));process.env.QE_LOG='';for(let w=0;w<b;w++)t.step(w,{observations:strengthOf(t.p,w)});
const facts=t.p.weeks.slice(0,b).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')).map(s=>V==='SHORT60'?H.obs(t.p,s,{minutes:Math.round(s.prescription.durationMinutes*0.6)}):H.obs(t.p,s));
const X=t.p.weeks[b].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
t.step(b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts});t.ref=null;
process.env.QE_LOG='1';const r=t.step(b,{day:3,hour:'07:00:00'});process.env.QE_LOG='';
console.log(V,JSON.stringify(brief(r)),runsFromDay(t.p,b,3));
