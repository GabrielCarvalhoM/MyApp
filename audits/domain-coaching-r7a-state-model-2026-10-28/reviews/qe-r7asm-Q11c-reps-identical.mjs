// Q11c (reviewer-owned): Q11(c) with IDENTICAL ledgers. HYPERTROPHY (REPS_THEN_LOAD). Weeks 0-3 trained and reviewed; weeks 4 and 5: nothing
// executed. U: week 4 not reviewed, week 5 reviewed. R: both reviewed. The decision at week 5's review has every fact (two empty weeks).
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q11c-reps-identical',root:L.ROOT_USED,cells:{}};
for(const cell of ['U','R']){
 const g=L.R.generateProgram(L.intake({id:'qe-q11c',athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'}}}),L.opts),t={p:g.program,ledger:[]};
 for(let w=0;w<4;w++)L.weekly(t,w);
 if(cell==='R')L.weekly(t,4,()=>false);
 L.weekly(t,5,()=>false);
 const H=L.history(t,6,0),ids=Object.keys(H.state.strength.exercises).sort();
 out.cells[cell]={ledgerHash:L.V.hash(t.ledger.filter(o=>!o.superseded).map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt}))),
  history:Object.fromEntries(ids.map(id=>[id,(e=>`${e.mode}${e.load??''} x${e.reps} lp ${e.lastPerformed}`)(H.state.strength.exercises[id])])),
  plan6:Object.fromEntries(ids.map(id=>[id,(e=>e?`${e.mode}${e.load??''} x${e.reps}`:null)(t.p.stateTrace[6].strength.exercises[id])])),
  rows6:L.rowsOf(t,6,s=>s.sport==='STRENGTH').map(r=>`${r.date} ${r.id} ${r.kind} ${r.mode}${r.value??''} x${r.reps}`)};
}
const U=out.cells.U,R=out.cells.R;
out.identicalLedgers=U.ledgerHash===R.ledgerHash;out.historyEqual=JSON.stringify(U.history)===JSON.stringify(R.history);
out.rowDiff={onlyU:U.rows6.filter(x=>!R.rows6.includes(x)),onlyR:R.rows6.filter(x=>!U.rows6.includes(x))};
console.log(JSON.stringify(out,null,1));
