// R7ASE-QE-r1 P51d (independent engineering judge, STATE-EVIDENCE-FREEZE-1): P51c's repsShort and repsUnlogged cells with IDENTICAL ledgers.
// The control R6 is built first; in both cells week 7 is then reported with the same loads for every exercise (R6's prescribed loads; U's
// plan prescribed heavier ones for db-bench-press and db-row), and db-rdl/db-split-squat at 24 kg with the target missed (3 of 5 reps) or
// repetitions unlogged. The two ledgers are checked equal field by field (event ids aside). Oracle (Founder §1, §13, I5, P7): identical facts
// give the identical history at B. Read-only; synthetic; DEV_TEST_ONLY; prints only. QE_TZ sets the time zone.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));
 H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,IDS=['db-rdl','db-split-squat'];
const exs=st=>Object.fromEntries(Object.entries(st.strength?.exercises??st.exercises).sort().map(([id,e])=>[id,`${e.mode}${e.load??''} reps ${e.reps} tick ${e.loadTick??0} step ${e.returnStep??'-'} sets ${e.sets??'-'}`]));
const facts=t=>JSON.stringify(t.ledger.filter(o=>!o.conflicted).map(o=>({s:o.sessionId,at:o.observedAt,d:o.localDate,a:o.actual,r:o.response})).sort((x,y)=>x.at<y.at?-1:x.at>y.at?1:x.s<y.s?-1:1));
const satRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''}`));
const TZ=Number(process.env.QE_TZ??0),base=H.start({id:'qse-p51d',tz:TZ},5),out={probe:'R7ASE-QE-P51d',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',tz:TZ,variants:{}};
for(const [vn,edit] of Object.entries({repsShort:x=>({...x,reps:3}),repsUnlogged:({reps,...x})=>x})){
 const R6=copy(base),U=copy(base);perDay(R6,5,s=>!SAT(s));H.weekly(R6,6,s=>!SAT(s));perDay(U,5,s=>!SAT(s));perDay(U,6,s=>!SAT(s));
 // The loads every week-7 exercise is reported at, in both cells: R6's prescription (the two Saturday-only exercises are 24 kg in both plans).
 const loads=new Map(R6.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>[s.id+':'+e.id,e.load.mode==='KNOWN'?e.load.value:20])));
 const week7=t=>H.ev(t,at(t.p,7,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[7].sessions.filter(live).map(s=>{const o=obs(t.p,s);
  if(s.sport==='STRENGTH')o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>{const y=x.load?.unit==='KG'?{...x,load:{...x.load,value:loads.get(s.id+':'+e.id)}}:x;return IDS.includes(e.id)&&SAT(s)?edit(y):y;})}));return o;})}));
 const cells={U,R6},v={cells:{}};
 for(const [cell,t] of Object.entries(cells)){const plan7=exs(t.p.stateTrace[7]),rv=week7(t);
  const d=t.p.weeks[8].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
  v.cells[cell]={week7Planning:plan7,week7Review:rv,B:b,class:B.interruption.class,stateAt:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,values:Object.fromEntries(IDS.map(id=>[id,B.interruption.stateAt.values?.STRENGTH?.[id]])),entry:exs(B.interruption.entry),rowsAfterB:[...satRows(t.p,8),...satRows(t.p,9),...satRows(t.p,10)]};}
 v.ledgersEqual=facts({ledger:U.ledger.filter(o=>!o.context||o.context.weekIndex<8)})===facts({ledger:R6.ledger.filter(o=>!o.context||o.context.weekIndex<8)});
 v.entryDiff=Object.keys(v.cells.U.entry).filter(id=>v.cells.U.entry[id]!==v.cells.R6.entry[id]).map(id=>`${id}: U=${v.cells.U.entry[id]} R6=${v.cells.R6.entry[id]}`);
 out.variants[vn]=v;
}
print(out);
