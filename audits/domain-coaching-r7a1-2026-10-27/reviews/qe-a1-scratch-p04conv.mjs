// Exploration: run-state difference after a convergence-held review and a later schedule change.
import {runtime,make,line,at,obs} from './qe-a1-lib.mjs';
const RT=await runtime('A1'),H=make(RT),w=3,{R,opts}=RT;
const base=H.start({id:'qa1-p04',schedule:{runDays:[1,4,6],strengthDays:[0,2],longRunDay:6}},3);
const ADVERSE={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'NORMAL'};
const conv=H.copy(base),reps=conv.p.weeks[w].sessions.filter(s=>s.prescription).map((s,i)=>({...obs(conv.p,s),response:i<3?{...ADVERSE}:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));
const r=R.evaluateProgram(conv.p,{...at(conv.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:reps}),actualLedger:conv.ledger},opts);conv.ledger=r.actualLedger;conv.p=r.proposal;
const diff=(a,b,p='')=>{if(JSON.stringify(a)===JSON.stringify(b))return [];if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diff(a[k],b[k],p+'.'+k));return [`${p}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`];};
for(const x of [{kind:'SCHEDULE_CHANGE',changes:{runDays:[1,3,6],longRunDay:6}},{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}]){const T=H.copy(conv);H.ev(T,at(T.p,w,6,'22:00',x));console.log(x.kind,diff(conv.p.stateTrace[w+1].run,T.p.stateTrace[w+1].run,'run').join('; '));
 for(let i=w+1;i<w+4;i++){const a=conv.p.weeks[i].sessions.filter(s=>s.sport==='RUN').map(s=>s.role+':'+JSON.stringify(s.prescription?.work??s.prescription?.durationMinutes)),b=T.p.weeks[i].sessions.filter(s=>s.sport==='RUN').map(s=>s.role+':'+JSON.stringify(s.prescription?.work??s.prescription?.durationMinutes));console.log('  w'+i,a.join(' '),'\n     ',b.join(' '));}}
