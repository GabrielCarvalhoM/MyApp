// Author scratch diagnosis (not evidence): P47 PRE base, Sunday no-op sameEquipment at 11:00; what changes in the program and in B's record.
import {H,at,obs,on,addDays,brk,lastR,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const miss=s=>s.sport==='STRENGTH'&&s.day===5,t=H.start({id:'qab-p47-pre'},2);perDay(t,2,s=>!miss(s));H.ev(t,at(t.p,3,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[2].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
perDay(t,3,s=>!miss(s));
const bDay=addDays(t.p.weeks[4].startDate,1),sun=addDays(t.p.weeks[3].startDate,6);
const B=t=>{H.ev(t,on(t,addDays(bDay,2),'06:00',brk(bDay,addDays(bDay,1))));return lastR(t.p);};
const NOOP=process.env.NOOP??'sameEquipment',HM=process.env.HM??'11:00';
const mk={sameEquipment:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}),localFatigue:()=>({kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}}),sameMinutes:()=>({kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:60}})}[NOOP];
const ctl=copy(t),C=B(ctl);
const u=copy(t),p0=u.p,x=H.ev(u,on(u,sun,HM,mk())),p1=u.p,changed=p1!==p0,D=B(u);
const sa=(d)=>({kind:d.interruption.stateAt.kind,week:d.interruption.stateAt.week,authority:d.interruption.stateAt.authority,values:d.interruption.stateAt.values});
const diff=(a,b,at='',out=[])=>{if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],at+'/'+k,out);return out;}out.push(at+': '+JSON.stringify(a)+' -> '+JSON.stringify(b));return out;};
console.log(JSON.stringify({noop:NOOP,clock:HM,x,programChanged:changed,revision:[p0.revision,p1.revision],decisions:[p0.decisions.length,p1.decisions.length],lastDecision:p1.decisions.at(-1)?.action+' '+p1.decisions.at(-1)?.status,
 week4AuthBefore:p0.weeks[4].startAuthority?.STRENGTH?.provenance,week4AuthAfter:p1.weeks[4].startAuthority,week3AuthAfter:p1.weeks[3].startAuthority?.STRENGTH?.provenance},null,1));
console.log('stateTrace[4] diff:',diff(p0.stateTrace[4],p1.stateTrace[4]).slice(0,30));console.log('weeks[4] rows same:',JSON.stringify(p0.weeks[4].sessions)===JSON.stringify(p1.weeks[4].sessions));
console.log('weeks[3] adaptations after:',JSON.stringify((u.p.weeks[3].adaptations??[]).map(a=>a.kind)));
console.log('control stateAt:',JSON.stringify(sa(C)));
console.log('noop    stateAt:',JSON.stringify(sa(D)));
console.log('entry diff (control -> noop):',diff(C.interruption.entry,D.interruption.entry).slice(0,30));
