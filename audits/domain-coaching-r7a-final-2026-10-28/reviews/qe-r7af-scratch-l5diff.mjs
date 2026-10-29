// R7AF-QE-r1 scratch: which fields of B's entry the late Saturday lift (P32 L5) changes. Prints only.
import {H,on,obs,addDays,brk,lastR,afterA,reportOn,live,print} from './qe-r7af-lib.mjs';
const {t,d0}=afterA('qaf-p32-l5x');reportOn(t,5,2,'21:00',s=>s.day<3);
const sat=t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===5);
H.ev(t,on(t,addDays(d0,9),'06:00',brk(addDays(d0,7),addDays(d0,8))));const B=lastR(t.p);
H.ev(t,on(t,addDays(d0,9),'07:00',{kind:'PARTIAL_SESSION',observations:sat.map(x=>obs(t.p,x))}));const ask=t.last.status;
H.ev(t,on(t,addDays(d0,9),'08:00',brk(addDays(d0,7),addDays(d0,8))));const B2=lastR(t.p);
const diff=[];const walk=(a,b,p)=>{if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'.'+k);}else diff.push(`${p}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);};
walk(B.interruption.entry,B2.interruption.entry,'entry');
const rows=(P)=>P.weeks.slice(6,9).flatMap(w=>w.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>s.id+' '+JSON.stringify(s.prescription.exercises?.map(e=>[e.id,e.sets,e.reps,e.rir,e.load.mode,e.load.value])??s.prescription.durationMinutes)));
const r1=rows({weeks:[]}),before=t.p;
print({ask,entryDiff:diff,saturdayLifts:sat.map(s=>s.id)});
