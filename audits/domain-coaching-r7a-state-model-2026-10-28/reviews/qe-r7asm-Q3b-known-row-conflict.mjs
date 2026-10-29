// Q3b (reviewer-owned): the Q3 mechanism through a conflict instead of a correction. Week 0's Saturday lift establishes db-rdl at 20 kg with the
// athlete's confirmation (SSCTR D45), so week 1's rows prescribe KNOWN 20. On Monday of week 1 a second report of that Saturday session arrives
// (a wearable activity with a different duration): the reports conflict and the session is quarantined (QRE-R6-14), so the only evidence of
// db-rdl is void. Week 1's Saturday is then executed and synced without exercise details (a workout record) and the week is reviewed.
// Control ORDERED: the identical observations, the conflicting one delivered with week 0's own review (before week 1 is planned).
import * as L from './qe-r7asm-lib.mjs';
const ID='db-rdl',out={probe:'qe-r7asm-Q3b-known-row-conflict',root:L.ROOT_USED,cells:{}};
const clean=t=>t.ledger.filter(o=>!o.superseded);
/** Week 1's reports, built once from a reference program (no conflict yet, so db-rdl is KNOWN 20 there), sent identically in both cells. */
function week1Reports(){L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-q3b'}),L.opts),t={p:g.program,ledger:[]};const w0=t.p.weeks[0].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`q3b-w0-${i}`}));
 L.step(t,{...L.at(t.p,0,6,'21:00:00',{observations:w0}),loadConfirmations:[{exerciseId:ID,value:20,unit:'KG',convention:'PER_HAND'}]});
 return t.p.weeks[1].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s,L.SAT(s)?{noDetails:true}:{}),eventId:`q3b-w1-${i}`}));}
const w1ref=week1Reports();
for(const cell of ['ORDERED','LATE']){
 L.resetIds();
 const g=L.R.generateProgram(L.intake({id:'qe-q3b'}),L.opts),t={p:g.program,ledger:[]};
 const w0=t.p.weeks[0].sessions.filter(L.live).map((s,i)=>({...L.obs(t.p,s),eventId:`q3b-w0-${i}`}));
 const sat0=t.p.weeks[0].sessions.find(L.SAT),manual=w0.find(o=>o.sessionId===sat0.id);
 const wearable={eventId:'q3b-w0-wearable',athleteId:t.p.athleteId,sessionId:sat0.id,observedAt:manual.observedAt,source:{provider:'HEALTHKIT',activityId:'hk-123',quality:'WEARABLE_FULL'},actual:{completed:true,minutes:Math.round(manual.actual.minutes*0.6)},response:{...L.OK}};
 const conf=[{exerciseId:ID,value:20,unit:'KG',convention:'PER_HAND'}];
 L.step(t,{...L.at(t.p,0,6,'21:00:00',{observations:cell==='ORDERED'?[...w0,wearable]:w0}),loadConfirmations:conf});
 const rows1=L.rowsOf(t,1,L.SAT,[ID]);
 if(cell==='LATE')L.step(t,L.at(t.p,1,0,'07:00:00',{observations:[wearable]}));
 const conflicts=t.last.provenance?.conflicts?.map(c=>c.reason)??[];
 L.step(t,L.at(t.p,1,6,'21:00:00',{observations:structuredClone(w1ref)}));
 const H=L.A.historicalStateOf?L.A.historicalStateOf(t.p,{asOf:`${t.p.weeks[2].startDate}T06:00:00Z`,actualLedger:clean(t)},L.opts):null,h=L.hex(H,ID),st=H?.state?.strength?.exercises?.[ID];
 const w=L.copy(t),d=L.step(w,L.at(w.p,2,3,'06:00:00',L.brk(L.addDays(w.p.weeks[2].startDate,1),L.addDays(w.p.weeks[2].startDate,2))));
 const e=d.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[ID];
 out.cells[cell]={record:L.V.hash(L.recordOf(t)),week1SaturdayRows:rows1,quarantinedSessions:[...new Set(t.ledger.filter(o=>o.conflicted).map(o=>o.sessionId))],conflictsAtDelivery:conflicts,
  usableLogsOfExercise:L.logsOf({ledger:clean(t)},ID),
  historical:{present:!!h,mode:h?.mode??null,stateLoad:st?.load??null,source:st?.source??null,lastExecutedLoad:h?.lastExecutedLoad??null,lastPerformedAt:h?.lastPerformedAt??null},
  returnEntry:e?{mode:e.mode,load:e.load??null,source:e.source??null}:null,week2SaturdayRows:L.rowsOf(t,2,L.SAT,[ID])};
}
out.sameRecord=out.cells.LATE.record===out.cells.ORDERED.record;
out.prescribedKnownLoadBecameHistory=out.cells.LATE.historical.mode==='KNOWN'&&out.cells.LATE.usableLogsOfExercise.length===0;
out.historiesDiffer=JSON.stringify(out.cells.LATE.historical)!==JSON.stringify(out.cells.ORDERED.historical);
console.log(JSON.stringify(out,null,1));
