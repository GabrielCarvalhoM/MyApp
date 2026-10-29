// Q2 (reviewer-owned): does a real correction (correctionOf, the only chain normalizeObservations recognizes) reach HistoricalState?
// Compares historicalStateOf on the record as evaluateProgram returns it (superseded rows carried) with the same call on the record minus the
// superseded rows, and with the author's T15 form (`supersedes:`), which the normalizer does not recognize.
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q2-correction',root:L.ROOT_USED,cases:[]};
const IDS=['db-rdl','db-split-squat'];
const base=()=>{const t=L.start('qe-q2',2);L.perDay(t,2,s=>!L.SAT(s));L.weekly(t,3,s=>!L.SAT(s));return t;}; // the judge's P40 history
for(const form of ['correctionOf','supersedes']){
 const t=base(),sat=t.p.weeks[4].sessions.find(L.SAT),first=L.obs(t.p,sat);
 // Week 4's Saturday reported as executed at the 20/22 kg the row prescribes (Saturday 21:00), then corrected on Sunday 21:00: not done at all.
 L.step(t,L.at(t.p,4,5,'21:00:00',{observations:[first]}));
 const fixAt=`${L.addDays(t.p.weeks[4].startDate,6)}T20:00:00Z`;
 const fix={...L.obs(t.p,sat),eventId:first.eventId+'-fix',observedAt:first.observedAt,actual:{completed:false,minutes:0},...(form==='correctionOf'?{correctionOf:first.eventId,correctedAt:fixAt}:{supersedes:first.eventId})};
 const r=L.step(t,L.at(t.p,4,6,'21:00:00',{observations:[fix]}));
 const rows=t.ledger.filter(o=>o.sessionId===sat.id).map(o=>({eventId:o.eventId,superseded:!!o.superseded,conflicted:!!o.conflicted,completed:o.actual?.completed,logged:Object.fromEntries(IDS.map(id=>[id,o.logs?.[id]?.load??null]))}));
 const cut=`${L.addDays(t.p.weeks[5].startDate,0)}T06:00:00Z`;
 const Hraw=L.A.historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger},L.opts);
 const Hlive=L.A.historicalStateOf(t.p,{asOf:cut,actualLedger:t.ledger.filter(o=>!o.superseded)},L.opts);
 const pick=H=>Object.fromEntries(IDS.map(id=>[id,{lastExecutedLoad:L.hex(H,id)?.lastExecutedLoad,liftedLoad:L.hex(H,id)?.liftedLoad,lastPerformedAt:L.hex(H,id)?.lastPerformedAt,tick:L.hex(H,id)?.earnedProgress?.loadTick}]));
 // The internal reducer (inside evaluateProgram) reads the normalized ledger: observe it through a what-if SHORT return in week 5.
 const w=L.copy(t),d=L.step(w,L.at(w.p,5,3,'06:00:00',L.brk(L.addDays(w.p.weeks[5].startDate,1),L.addDays(w.p.weeks[5].startDate,2))));
 const entry=Object.fromEntries(IDS.map(id=>[id,{load:d.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[id]?.load,lastPerformed:d.proposal?.decisions.at(-1)?.interruption?.entry?.strength?.exercises?.[id]?.lastPerformed}]));
 out.cases.push({form,decisionStatus:r.status,provenance:{superseded:r.provenance?.superseded,conflicts:r.provenance?.conflicts?.map(c=>c.reason)},ledgerRowsForSession:rows,
  historicalStateOf_onRecordAsReturned:pick(Hraw),historicalStateOf_onRecordWithoutSupersededRows:pick(Hlive),internalReducer_viaWhatIfReturnEntry:entry,
  publicApiIgnoresCorrection:JSON.stringify(pick(Hraw))!==JSON.stringify(pick(Hlive))});
}
console.log(JSON.stringify(out,null,1));
