// Q12 (reviewer-owned) robustness of two findings.
// (a) QE-R7ASM-01 through the facts-only reading (strengthAtBreak): Q3's LATE cell with week 2 reported day by day and never reviewed.
// (b) QE-R7ASM-03 on the GENERAL and RUNNING_SUPPORT goals (REPS_THEN_LOAD), identical ledgers, as Q11c.
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q12-robustness',root:L.ROOT_USED};
{const ID='db-rdl',g=L.R.generateProgram(L.intake({id:'qe-q12a'}),L.opts),t={p:g.program,ledger:[]};
 L.weekly(t,0);const w1=t.p.weeks[1].sessions.filter(L.live).map(s=>L.obs(t.p,s));L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));
 const originals=t.ledger.filter(o=>o.logs?.[ID]&&!o.superseded),correctedAt=`${L.addDays(t.p.weeks[2].startDate,0)}T06:30:00Z`;
 const corrections=originals.map(o=>{const c={eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==ID)},response:{...o.response}};return c;});
 L.step(t,L.at(t.p,2,0,'07:00:00',{observations:corrections}));
 const row=L.rowsOf(t,2,L.SAT,[ID]);
 L.perDay(t,2,()=>true,s=>L.SAT(s)?{noDetails:true}:{}); // week 2 never reviewed: the reducer reads it by facts only
 const H=L.A.historicalStateOf(t.p,{asOf:`${t.p.weeks[3].startDate}T12:00:00Z`,actualLedger:t.ledger.filter(o=>!o.superseded)},L.opts),h=L.hex(H,ID),st=H.state.strength.exercises[ID];
 const w=L.copy(t),d=L.step(w,L.at(w.p,3,3,'06:00:00',L.brk(L.addDays(w.p.weeks[3].startDate,1),L.addDays(w.p.weeks[3].startDate,2))));
 out.a_factsOnly={week2Row:row.map(r=>`${r.kind} ${r.mode}${r.value??''}`),week3StartAuthority:t.p.weeks[3].startAuthority?.STRENGTH?.provenance,basis:H.basis,usableLoadLogs:L.logsOf({ledger:t.ledger.filter(o=>!o.superseded)},ID).filter(x=>Number.isFinite(x.load)).length,
  historical:{mode:h?.mode,stateLoad:st?.load,source:st?.source,lastExecutedLoad:h?.lastExecutedLoad},returnEntry:(e=>e&&{mode:e.mode,load:e.load,source:e.source})(d.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[ID])};}
out.b_goals={};
for(const goal of ['GENERAL','RUNNING_SUPPORT']){const res={};for(const cell of ['U','R']){
 const g=L.R.generateProgram(L.intake({id:'qe-q12b-'+goal,athlete:{goals:{run:'PERFORMANCE',strength:goal}}}),L.opts);if(!g.program){res[cell]={error:g.status+' '+g.reason};continue;}
 const t={p:g.program,ledger:[]};for(let w=0;w<4;w++)L.weekly(t,w);if(cell==='R')L.weekly(t,4,()=>false);L.weekly(t,5,()=>false);
 res[cell]={ledger:L.V.hash(t.ledger.map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt}))),history:L.V.hash(L.history(t,6,0).strength),rows6:L.rowsOf(t,6,s=>s.sport==='STRENGTH').map(r=>`${r.id} ${r.mode}${r.value??''} x${r.reps}`)};}
 out.b_goals[goal]={identicalLedgers:res.U?.ledger===res.R?.ledger,historyEqual:res.U?.history===res.R?.history,onlyU:res.U?.rows6?.filter(x=>!res.R.rows6.includes(x)),onlyR:res.R?.rows6?.filter(x=>!res.U.rows6.includes(x)),err:res.U?.error??res.R?.error??null};}
console.log(JSON.stringify(out,null,1));
