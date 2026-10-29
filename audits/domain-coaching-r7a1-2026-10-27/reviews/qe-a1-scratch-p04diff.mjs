// Exploration: field-level difference of next week's start in the P04 paths.
import {runtime,make,line,at} from './qe-a1-lib.mjs';
const RT=await runtime('A1'),H=make(RT),w=3;
const base=H.start({id:'qa1-p04',schedule:{runDays:[1,4,6],strengthDays:[0,2],longRunDay:6}},3);
const diff=(a,b,p='')=>{if(JSON.stringify(a)===JSON.stringify(b))return [];if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diff(a[k],b[k],p+'.'+k));return [`${p}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`];};
const sys={kind:'SYSTEMIC_FATIGUE'};
const thu=H.copy(base);H.ev(thu,at(thu.p,w,3,'21:00',sys));H.weekly(thu,w);
const sun=H.copy(base);H.ev(sun,at(sun.p,w,6,'07:00',sys));const rs=H.weekly(sun,w);const gs=sun.last.gates;
const none=H.copy(base);H.weekly(none,w);
console.log('sunday review',rs,JSON.stringify(gs));
console.log('thursday vs sunday next start:\n '+diff(sun.p.stateTrace[w+1],thu.p.stateTrace[w+1]).join('\n '));
console.log('none vs sunday next start:\n '+diff(sun.p.stateTrace[w+1],none.p.stateTrace[w+1]).join('\n '));
console.log('w4 rows sunday:',line(sun.p,w+1).join(' | '));console.log('w4 rows thursday:',line(thu.p,w+1).join(' | '));
for(const [k,x] of Object.entries({SCHEDULE_NEXT:{kind:'SCHEDULE_CHANGE',changes:{runDays:[1,3,6],longRunDay:6}},GOAL_NEXT:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},EQUIPMENT_SWAP:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}})){
 const T=H.copy(sun);const r=H.ev(T,at(T.p,w,6,'22:00',x));console.log(k,r,'gates in decision:',JSON.stringify(T.p.decisions.at(-1).gates??null));
 console.log(' held vs after:\n  '+diff(sun.p.stateTrace[w+1].run,T.p.stateTrace[w+1].run,'run').join('\n  '));
 console.log('  w4 rows:',line(T.p,w+1).join(' | '));
}
