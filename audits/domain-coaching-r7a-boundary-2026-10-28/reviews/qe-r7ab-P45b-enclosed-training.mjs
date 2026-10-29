// R7AB-QE-r1 P45b: a named correction of A that encloses training executed BEFORE A's first report (not its re-entry): the start moved
// earlier to Sunday 11-15 (week 1's executed Sunday run, then week 2's Tuesday-Saturday executed sessions, fall inside), evaluated without
// applying, and the same dates in A's first report (no correction). Contract §5 covers only training after the first report. Prints only.
import {on,addDays,brk,lastR,afterA,reportOn,print,copy,peek,dec,stateSummary} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const {t:base,d0,A}=afterA('qab-p45b');reportOn(base,5,2,'21:00',s=>s.day<3);
const r=peek(base,on(base,addDays(d0,4),'06:00',brk(addDays(d0,-22),addDays(d0,-1),{episodeId:A.interruption.episode})));
const enclosed=base.ledger.filter(o=>!o.conflicted&&o.localDate>=addDays(d0,-22)&&o.localDate<addDays(d0,-16)).map(o=>`${o.localDate} ${o.context?.sport} ${o.context?.role}`);
print({probe:'R7AB-QE-P45b',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',enclosedExecuted:enclosed,correction:{status:`${r.status}/${r.action}`,missing:r.missingInputs,decision:r.proposal?dec(lastR(r.proposal)):null,changedEntry:r.proposal?JSON.stringify(stateSummary(lastR(r.proposal).interruption.entry))!==JSON.stringify(stateSummary(A.interruption.entry)):null}});
