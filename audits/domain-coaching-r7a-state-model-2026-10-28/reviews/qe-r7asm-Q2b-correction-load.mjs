// Q2b (reviewer-owned): Q2 with a corrected LOAD. P40 history; week 4's Saturday reported at 22 kg for db-rdl (row KNOWN 20, target met, so
// the adoption rule takes it), then corrected the next day (correctionOf): it was 20 kg. historicalStateOf on the record as evaluateProgram
// returns it, versus the same record without the superseded row, versus the internal reducer (a what-if return's entry).
import * as L from './qe-r7asm-lib.mjs';
const ID='db-rdl',t=L.start('qe-q2b',2);L.perDay(t,2,s=>!L.SAT(s));L.weekly(t,3,s=>!L.SAT(s));
const sat=t.p.weeks[4].sessions.find(L.SAT),first=L.obs(t.p,sat,{kg:(id,e)=>id===ID?22:(e.load.mode==='KNOWN'?e.load.value:20)});
L.step(t,L.at(t.p,4,5,'21:00:00',{observations:[first]}));
const fixed=L.obs(t.p,sat);
L.step(t,L.at(t.p,4,6,'21:00:00',{observations:[{...fixed,eventId:first.eventId+'-fix',observedAt:first.observedAt,correctionOf:first.eventId,correctedAt:`${L.addDays(t.p.weeks[4].startDate,6)}T20:00:00Z`}]}));
const cut=`${t.p.weeks[5].startDate}T06:00:00Z`,pick=H=>{const h=L.hex(H,ID);return {lastExecutedLoad:h.lastExecutedLoad,liftedLoad:h.liftedLoad,stateLoad:H.state.strength.exercises[ID].load,tick:h.earnedProgress.loadTick};};
const raw=pick(L.A.historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},L.opts)),live=pick(L.A.historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger.filter(o=>!o.superseded)},L.opts));
const w=L.copy(t),d=L.step(w,L.at(w.p,5,3,'06:00:00',L.brk(L.addDays(w.p.weeks[5].startDate,1),L.addDays(w.p.weeks[5].startDate,2))));
const e=d.proposal.decisions.at(-1).interruption.entry.strength.exercises[ID];
console.log(JSON.stringify({probe:'qe-r7asm-Q2b-correction-load',root:L.ROOT_USED,row:L.rowsOf(t,4,L.SAT,[ID])[0],ledger:t.ledger.filter(o=>o.sessionId===sat.id).map(o=>({eventId:o.eventId,superseded:!!o.superseded,logged:o.logs?.[ID]?.load})),
 historicalStateOf_recordAsReturned:raw,historicalStateOf_withoutSupersededRows:live,internalReducer_returnEntry:{load:e.load,loadTick:e.loadTick},publicApiReadsRetractedLoad:raw.liftedLoad!==live.liftedLoad},null,1));
