// Q9 (reviewer-owned): what the public HistoricalState's "lastExecuted*" atoms hold when the execution differs from the row (Founder I5).
// P40 history; week 4's Saturday row prescribes db-rdl KNOWN 20 x5. Variants of what the athlete logs; week reviewed.
import * as L from './qe-r7asm-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asm-Q9-executed-atoms',root:L.ROOT_USED,cases:[]};
const variants={
 repsShort_20x3:{set:(id,x)=>id===ID?{...x,reps:3}:x},
 heavierAbovePlan_24x5:{kg:(id,e)=>id===ID?24:(e.load.mode==='KNOWN'?e.load.value:20)},
 heavierAbovePlanRepsShort_22x3:{kg:(id,e)=>id===ID?22:(e.load.mode==='KNOWN'?e.load.value:20),set:(id,x)=>id===ID?{...x,reps:3}:x},
 lighter_18x5:{kg:(id,e)=>id===ID?18:(e.load.mode==='KNOWN'?e.load.value:20)},
};
for(const [name,o] of Object.entries(variants)){
 const t=L.start('qe-q9',2);L.perDay(t,2,s=>!L.SAT(s));L.weekly(t,3,s=>!L.SAT(s));
 const row=L.rowsOf(t,4,L.SAT,[ID])[0];
 L.weekly(t,4,()=>true,s=>L.SAT(s)?o:{});
 const h=L.hex(L.A.historicalStateOf(t.p,{asOf:`${t.p.weeks[5].startDate}T06:00:00Z`,actualLedger:t.ledger.filter(x=>!x.superseded)},L.opts),ID);
 const lg=L.logsOf(t,ID).at(-1);
 out.cases.push({variant:name,prescribed:`${row.mode}${row.value} x${row.reps}`,logged:`${lg.load} x${lg.reps}`,history:{lastExecutedLoad:h.lastExecutedLoad,lastExecutedReps:h.lastExecutedReps,liftedLoad:h.liftedLoad,liftedReps:h.liftedReps},
  lastExecutedEqualsLogged:h.lastExecutedLoad===lg.load&&h.lastExecutedReps===lg.reps});
}
console.log(JSON.stringify(out,null,1));
