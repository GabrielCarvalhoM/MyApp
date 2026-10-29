// R7AB-QE-r1 P46 (independent engineering judge): evidence promotion before any return (Founder P3, I5; §20 "evidence promotion").
// Weeks 0..F-1 trained and reviewed; week F executed (a) exactly as projected, reported day by day with Sunday's run on Monday (U), or the
// same facts reviewed on Sunday 21:00 (R); or (b) not as projected: Thursday's run missed, Thursday's run partial (5 min), Thursday's run
// adverse, Saturday's lift logged 2 kg lighter on its known rows, Saturday's lift with no exercise log, a systemic-fatigue report on Monday
// (REDUCE), an unavailable Thursday (moved or skipped). B: Tuesday-Wednesday of week F+1, reported Thursday 06:00.
// Oracles: (a) U and R give the same start, last-performed dates aside (P2), U by COMPLETED_SESSIONS; (b) U never takes week F+1's start
// (projected) as its point. Prints only; synthetic data; DEV_TEST_ONLY authority.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const facts=st=>JSON.stringify({run:{...st.run,planned:undefined},strength:{...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))}});
const thu=s=>s.sport==='RUN'&&s.day===3,sat=s=>s.sport==='STRENGTH'&&s.day===5;
const lighter=(p,s)=>{const o=obs(p,s);if(o.actual.exercises)o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>x.load.unit==='KG'?{...x,load:{...x.load,value:Math.max(0,x.load.value-2)}}:x)}));return o;};
const V={exact:{},thursdayMissed:{skip:thu},thursdayPartial:{edit:(p,s)=>thu(s)?{...obs(p,s),actual:{completed:true,minutes:5}}:null},thursdayAdverse:{edit:(p,s)=>thu(s)?{...obs(p,s),response:{performance:'COMPATIBLE',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'NORMAL'}}:null},
 saturdayLighter:{edit:(p,s)=>sat(s)?lighter(p,s):null},saturdayUnlogged:{edit:(p,s)=>sat(s)?{...obs(p,s),actual:{completed:true,minutes:s.prescription.durationMinutes}}:null},
 systemicMonday:{pre:t=>H.ev(t,at(t.p,F,0,'07:00',{kind:'SYSTEMIC_FATIGUE'}))},unavailableThursday:{pre:t=>H.ev(t,at(t.p,F,0,'07:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(t.p.weeks[F].startDate,3)]}}))}};
var F=Number(process.env.QE_F??3);
const out={probe:'R7AB-QE-P46',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',F,cells:{},violations:[]};
const base=H.start({id:'qab-p46'},F);
for(const [n,v] of Object.entries(V)){const res={};
 for(const cell of ['U','R']){const t=copy(base);v.pre?.(t);const rows=t.p.weeks[F].sessions.filter(s=>live(s)&&!(v.skip?.(s))),mk=s=>v.edit?.(t.p,s)??obs(t.p,s);
  if(cell==='U'){for(const s of rows.filter(s=>s.day<6))H.ev(t,at(t.p,F,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[mk(s)]}));H.ev(t,at(t.p,F+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:rows.filter(s=>s.day===6).map(mk)}));}
  else H.ev(t,at(t.p,F,6,'21:00',{kind:'WEEKLY_REVIEW',observations:rows.map(mk)}));
  const d=t.p.weeks[F+1].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
  res[cell]={B:b,point:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,authority:B.interruption.stateAt.authority,facts:facts(B.interruption.entry)};}
 const same=res.U.facts===res.R.facts;out.cells[n]={U:{B:res.U.B,point:res.U.point,authority:res.U.authority},R:{B:res.R.B,point:res.R.point,authority:res.R.authority},sameStart:same};
 if(n==='exact'&&(!same||res.U.point!==`WEEK_START/w${F+1}`))out.violations.push(`${n}: U and R differ or U not at week ${F+1}`);
 if(n!=='exact'&&res.U.point===`WEEK_START/w${F+1}`)out.violations.push(`${n}: U takes week ${F+1}'s projected start as its point (${JSON.stringify(res.U.authority)})`);
}
print(out);
