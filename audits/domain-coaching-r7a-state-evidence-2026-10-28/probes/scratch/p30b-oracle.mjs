// Author scratch (not evidence): P30b's Sunday equipment cells per sport, against the no-handler control and a Sunday review at the same clock.
import {H,afterA,reportOn,at,on,addDays,brk,lastR,copy} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const runF=st=>JSON.stringify({...st.run,planned:undefined}),strF=st=>JSON.stringify({...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))});
const {t:base,d0}=afterA('qaf-p30b');reportOn(base,5,2,'21:00',s=>s.day<3);
const XS={equipmentWindow:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}),equipmentNoop:()=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}})};
for(const [cn,c] of Object.entries({sun0600:{d:addDays(d0,6),hm:'06:00',b:7},sun1000:{d:addDays(d0,6),hm:'10:00',b:7}})){
 const B=t=>{H.ev(t,on(t,addDays(d0,c.b+2),'06:00',brk(addDays(d0,c.b),addDays(d0,c.b+1))));return lastR(t.p).interruption.entry;};
 const C=B(copy(base)),s=copy(base);H.ev(s,on(s,c.d,c.hm,{kind:'WEEKLY_REVIEW',observations:[]}));const S=B(s);
 for(const [xn,mk] of Object.entries(XS)){const t=copy(base);H.ev(t,on(t,c.d,c.hm,mk()));const D=B(t);
  console.log(cn,xn,'run=control',runF(D)===runF(C),'strength=Sunday review',strF(D)===strF(S),'strength=control',strF(D)===strF(C));}
}
