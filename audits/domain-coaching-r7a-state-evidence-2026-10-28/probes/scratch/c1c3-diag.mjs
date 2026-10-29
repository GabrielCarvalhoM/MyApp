import {H,R,opts,afterA,at,on,obs,addDays,brk,lastR,copy,stateSummary,preBreakDose,live,print,tzOf} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const out={probe:'R7AB-SELF-CHALLENGE-1',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',classes:{},violations:[]};
const flag=(c,what)=>out.violations.push(`${c}: ${what}`),expect=(c,ok,what)=>{if(!ok)flag(c,what);return ok;};
const steps=st=>({run:st?.run?.returnStep??null,mode:st?.run?.mode??null,strength:Object.fromEntries(Object.entries(st?.strength?.exercises??{}).map(([k,e])=>[k,e.returnStep??null]))});
const point=d=>{const s=d?.interruption?.stateAt;return s?`${s.kind}/w${s.week}/${s.eventId??'-'}`:null;};
const facts=st=>JSON.stringify({run:{...st.run,planned:undefined},strength:{...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))}});
const WED=new Set(['back-squat','db-bench-press','db-row','db-calf-raise','dead-bug']);
// Reports: each session of week w chosen by `keep`, observed on its own day, sent the same evening (a mid-week review: no consolidation)
// or at `hm` on `day`. `edit` changes an observation (not completed, adverse, a lighter load).
const report=(t,w,{keep=()=>true,day=null,hm='21:00',kind='WEEKLY_REVIEW',edit=o=>o}={})=>{const ss=t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s));if(day!==null)return H.ev(t,at(t.p,w,day,hm,{kind,observations:ss.map(s=>edit(obs(t.p,s),s))}));for(const s of ss)H.ev(t,at(t.p,w,s.day,hm,{kind,observations:[edit(obs(t.p,s),s)]}));return 'per-day';};
const B=(t,d0,{from=8,to=9,said=10,hm='06:00',extra={}}={})=>{const r=H.ev(t,on(t,addDays(d0,said),hm,brk(addDays(d0,from),addDays(d0,to),extra)));if(r!=='MODIFY/REESTABLISH')flag('harness',`B (${addDays(d0,from)}..${addDays(d0,to)}) is ${r}: ${t.last.reason}`);return {r,d:lastR(t.p)};};
const base=(id,o={})=>afterA(id,o);
// Author scratch (not evidence): C1's Sunday equipment cells and C3's strength-only premise breakers, per sport.
const runF=st=>JSON.stringify({...st.run,planned:undefined}),strF=st=>JSON.stringify({...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))});

{const {t:b0,d0}=base('ab-c1');report(b0,5,{keep:s=>s.day<3});
 const C=B(copy(b0),d0).d.interruption.entry,rv=copy(b0);H.ev(rv,at(rv.p,5,6,'06:00',{kind:'WEEKLY_REVIEW'}));const RV=B(rv,d0).d.interruption.entry;
 const X={equipmentWindow:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}},equipmentNoop:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}},equipmentSame:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}};
 for(const [n,x] of Object.entries(X)){const t=copy(b0),xr=H.ev(t,on(t,addDays(d0,6),'06:00',structuredClone(x))),D=B(t,d0).d,e=D.interruption.entry;
  console.log('C1',n,xr,'run=control',runF(e)===runF(C),'strength=weeklyReview',strF(e)===strF(RV),'strength=control',strF(e)===strF(C),JSON.stringify(D.interruption.stateAt.authority));}}
{const {t:b0,d0,A}=base('ab-c3');
 const known=t=>(o,s)=>s.sport!=='STRENGTH'?o:{...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>Number.isFinite(t.p.stateTrace[5].strength.exercises[e.id]?.load)&&x.load.unit==='KG'?{...x,load:{...x.load,value:t.p.stateTrace[5].strength.exercises[e.id].load}}:x)}))}};
 const finish=t=>H.ev(t,on(t,addDays(d0,7),'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const cases={reducedBySystemicFatigue:t=>{H.ev(t,on(t,addDays(d0,0),'08:00',{kind:'SYSTEMIC_FATIGUE'}));report(t,5,{keep:s=>s.day<6,edit:known(t)});finish(t);},
  missedSaturdayLift:t=>{report(t,5,{keep:s=>s.day<6&&s.day!==5,edit:known(t)});finish(t);},
  strengthNotLogged:t=>{report(t,5,{keep:s=>s.day<6,edit:(o,s)=>s.sport==='STRENGTH'?{...o,actual:{completed:true,minutes:o.actual.minutes}}:o});finish(t);}};
 const full=copy(b0);report(full,5,{keep:s=>s.day<6,edit:known(full)});finish(full);const F=B(full,d0).d;
 for(const [n,fn] of Object.entries(cases)){const t=copy(b0);fn(t);const D=B(t,d0).d,e=D.interruption.entry,s=D.interruption.stateAt;
  const runRows=(p)=>p.weeks[5].sessions.filter(x=>live(x)&&x.sport==='RUN').map(x=>x.day+':'+x.prescription.durationMinutes).join(',');
  console.log('C3',n,'auth',JSON.stringify(s.authority),'run=full-week control',runF(e)===runF(F.interruption.entry),'strength=A re-entry',strF(e)===strF(A.interruption.entry),'week5 runs as A planned',runRows(t.p)===runRows(b0.p));}}
