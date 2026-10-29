// Exploration: a re-plan from next week on Sunday 07:00 (the Sunday long run still ahead by C1) — is the week "complete" for C3?
import {runtime,make,line,at,obs} from './qe-a1-lib.mjs';
const RT=await runtime('A1'),H=make(RT),w=3;
const base=H.start({id:'qa1-sun',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);
// Report Monday-Saturday as prescribed at Saturday 21:00 (a mid-week partial report), then a schedule change Sunday 07:00.
const T=H.copy(base);H.ev(T,at(T.p,w,5,'21:00',{kind:'PARTIAL_SESSION',observations:T.p.weeks[w].sessions.filter(s=>s.prescription&&s.day<=5).map(s=>obs(T.p,s))}));
const r=H.ev(T,at(T.p,w,6,'07:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}}));
console.log('Sunday 07:00 schedule change',r,'gates',JSON.stringify(T.p.decisions.at(-1).gates??null));
const U=H.copy(T);H.ev(U,at(U.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:U.p.weeks[w].sessions.filter(s=>s.prescription&&s.day===6).map(s=>obs(U.p,s))}));
console.log('then weekly review',U.last.status+'/'+U.last.action,JSON.stringify(U.last.gates));
console.log('w4 runs after Sunday-morning change:',line(T.p,w+1).filter(x=>x.includes('RUN')).join(' | '));
console.log('w4 runs after the weekly review   :',line(U.p,w+1).filter(x=>x.includes('RUN')).join(' | '));
