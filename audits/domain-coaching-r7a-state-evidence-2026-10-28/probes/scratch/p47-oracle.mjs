// Author scratch (not evidence): P47's cells against two controls, per sport. C: no handler (the judge's oracle). S: a plain Sunday weekly
// review at the same clock, no observations (the week reviewed by the review's own rule). Facts as P47 (last performed aside).
import {H,at,obs,on,addDays,brk,lastR,afterA,reportOn,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const ex=st=>Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]));
const runF=st=>JSON.stringify({...st.run,planned:undefined}),strF=st=>JSON.stringify({...st.strength,planned:undefined,entryWeek:undefined,exercises:ex(st)});
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const bases={};
{const {t,d0}=afterA('qab-p47-ret');reportOn(t,5,2,'21:00',s=>s.day<3);bases.RET={t,w:5,bDay:addDays(d0,8)};}
{const miss=s=>s.sport==='STRENGTH'&&s.day===5,t=H.start({id:'qab-p47-pre'},2);perDay(t,2,s=>!miss(s));H.ev(t,at(t.p,3,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[2].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 perDay(t,3,s=>!miss(s));bases.PRE={t,w:3,bDay:addDays(t.p.weeks[4].startDate,1)};}
const rows=[];
for(const [bn,b] of Object.entries(bases)){
 const B=t=>{H.ev(t,on(t,addDays(b.bDay,2),'06:00',brk(b.bDay,addDays(b.bDay,1))));return lastR(t.p);};
 const sun=addDays(b.t.p.weeks[b.w].startDate,6),mon=addDays(sun,1);
 const NOOP={sameEquipment:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}),fullKitWindow:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(sun,22),to:addDays(sun,25)}}),localFatigue:()=>({kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}})};
 const CLOCKS={sun1100:[sun,'11:00'],sun1300:[sun,'13:00'],sun2200:[sun,'22:00']};
 const C=B(copy(b.t)).interruption.entry;
 for(const [cn,[d,hm]] of Object.entries(CLOCKS)){
  const s=copy(b.t),sx=H.ev(s,on(s,d,hm,{kind:'WEEKLY_REVIEW',observations:[]})),S=B(s).interruption,Se=S.entry;
  for(const [xn,mk] of Object.entries(NOOP)){
   const t=copy(b.t),x=H.ev(t,on(t,d,hm,mk(d))),Di=B(t).interruption,D=Di.entry;
   rows.push({cell:`${bn} ${cn} ${xn}`,x,sunReview:sx,auth:JSON.stringify(Di.stateAt.authority),sAuth:JSON.stringify(S.stateAt.authority),
    run:runF(D)===runF(C)?'=C':runF(D)===runF(Se)?'=S':'neither',strength:strF(D)===strF(C)?'=C':strF(D)===strF(Se)?'=S':'neither',
    strengthVsS:strF(D)===strF(Se),runVsS:runF(D)===runF(Se),runVsC:runF(D)===runF(C),strengthVsC:strF(D)===strF(C)});
  }
 }
}
for(const r of rows)console.log([r.cell,r.x,'sunReview '+r.sunReview,'run '+r.run,'strength '+r.strength,'auth '+r.auth,'S auth '+r.sAuth].join(' | '));
