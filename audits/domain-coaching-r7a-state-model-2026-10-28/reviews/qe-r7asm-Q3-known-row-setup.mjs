// Q3 (reviewer-owned): can a prescribed KNOWN load become an exercise's historical load without any usable logged load?
// Mechanism under test: setUp(u) (src/r6-program.mjs) builds a fresh exercise's state from the row that prescribed it, load:u.value for a KNOWN
// row; advanceStrength keeps a fresh KNOWN exercise without a log, strengthAtBreak sets every performed fresh exercise up. A KNOWN row for an
// exercise history does not hold appears when the evidence that established it is corrected away (valid correctionOf chain, Founder I12) after
// the row was planned. Cells, with the SAME record of facts (checked: ids, sessions, clocks, payloads, correction chain):
//   EARLY : the corrections are delivered with week 1's review, before week 2 is planned;
//   LATE  : the same corrections (same rows, same correctedAt) arrive on Monday 07:00 of week 2, after week 2's rows were planned from the
//           uncorrected evidence (a mid-week review that keeps the plan);
//   NOCORR: no correction (control: the exercise genuinely established at 20 kg).
// Week 2 is then executed with db-rdl performed but its load unknown (variant) and reviewed; its reports are built once (from the control's
// prescriptions) and sent identically in every cell, so the cells hold the same record. History is read on the record without superseded
// rows (so finding Q2 does not confound it) and through the internal reducer (a what-if SHORT return's entry).
import * as L from './qe-r7asm-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asm-Q3-known-row-setup',root:L.ROOT_USED,exercise:ID,variants:[]};
const clean=t=>t.ledger.filter(o=>!o.superseded);
const variants={
 noDetails:{noDetails:true},
 repsNoLoad:{set:(id,x)=>id===ID?{reps:x.reps,rir:x.rir}:x},
 unknownUnit:{set:(id,x)=>id===ID?{...x,load:{...x.load,unit:'STONE'}}:x},
 loggedAt18:{kg:(id,e)=>id===ID?18:(e.load.mode==='KNOWN'?e.load.value:20)},
};
/** Week 2's reports, built once from a reference program (no correction), so every cell sends the identical observations. */
function week2Reports(vopt){L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-q3'}),L.opts),t={p:g.program,ledger:[]};L.weekly(t,0);
 const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`q3-w1-${i}`}));L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));
 return t.p.weeks[2].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?vopt:{}),eventId:`q3-w2-${i}`}));}
for(const [vname,vopt] of Object.entries(variants)){
 const res={variant:vname,cells:{}},w2ref=week2Reports(vopt);
 for(const cell of ['EARLY','LATE','NOCORR']){
  L.resetIds();
  const g=L.R.generateProgram(L.intake({id:'qe-q3'}),L.opts),t={p:g.program,ledger:[]};
  L.weekly(t,0);
  const w1=t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`q3-w1-${i}`}));
  const hasId=o=>t.p.weeks.some(w=>w.sessions.some(s=>s.id===o.sessionId&&s.prescription?.exercises?.some(e=>e.id===ID)));
  const originals=[...t.ledger.filter(o=>o.logs?.[ID]&&!o.superseded),...w1.filter(hasId)];
  const correctedAt=`${L.addDays(t.p.weeks[1].startDate,6)}T20:30:00Z`;
  // Each correction keeps the session's other exercises and removes db-rdl: "I did not do the RDLs".
  const corrections=originals.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual:{...structuredClone(o.actual),exercises:(o.actual.exercises??[]).filter(e=>e.id!==ID)},response:{...o.response}}));
  if(cell==='EARLY')L.step(t,L.at(t.p,1,6,'21:00:00',{observations:[...w1,...corrections]}));
  else{L.step(t,L.at(t.p,1,6,'21:00:00',{observations:w1}));if(cell==='LATE')L.step(t,L.at(t.p,2,0,'07:00:00',{observations:corrections}));}
  const rows2=L.rowsOf(t,2,L.SAT,[ID]);
  L.step(t,L.at(t.p,2,6,'21:00:00',{observations:structuredClone(w2ref)}));
  const H=L.A.historicalStateOf(t.p,{asOf:`${t.p.weeks[3].startDate}T06:00:00Z`,actualLedger:clean(t)},L.opts);
  const h=L.hex(H,ID),st=H.state.strength.exercises[ID];
  const w=L.copy(t),d=L.step(w,L.at(w.p,3,3,'06:00:00',L.brk(L.addDays(w.p.weeks[3].startDate,1),L.addDays(w.p.weeks[3].startDate,2))));
  const e=d.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[ID];
  res.cells[cell]={record:L.V.hash(L.recordOf(t)),week2SaturdayRows:rows2,usableLogsOfExerciseInRecord:L.logsOf({ledger:clean(t)},ID),
   historical:{present:!!h,mode:h?.mode??null,stateLoad:st?.load??null,stateSource:st?.source??null,lastExecutedLoad:h?.lastExecutedLoad??null,liftedLoad:h?.liftedLoad??null,lastPerformedAt:h?.lastPerformedAt??null},
   returnEntry:e?{mode:e.mode,load:e.load??null,source:e.source??null}:null,
   week3SaturdayRows:L.rowsOf(t,3,L.SAT,[ID])};
 }
 const late=res.cells.LATE,early=res.cells.EARLY;
 res.sameRecordEarlyLate=late.record===early.record;
 res.prescribedKnownLoadBecameHistory=late.historical.mode==='KNOWN'&&late.usableLogsOfExerciseInRecord.every(x=>!Number.isFinite(x.load))&&late.historical.stateLoad===late.week2SaturdayRows.find(r=>r.mode==='KNOWN')?.value;
 res.sameRecordDifferentHistory=res.sameRecordEarlyLate&&JSON.stringify(late.historical)!==JSON.stringify(early.historical);
 out.variants.push(res);
}
console.log(JSON.stringify(out,null,1));
