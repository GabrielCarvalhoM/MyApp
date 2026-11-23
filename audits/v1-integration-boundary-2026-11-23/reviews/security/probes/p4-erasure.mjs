// SEC_INT_R1 probe 4: erasure and the carried part. (A) What health-derived content survives eraseHealthFacts in `carried` (records, origins,
// presentation, requests). (B) The integration request record outlives custody's after an erasure: a retry of the erased request is sent
// past admission as a "retry", custody decides it anew, and the erased fact is recorded again while the answer is the old one.
// Run from CoachingCore/: node ../audits/v1-integration-boundary-2026-11-23/reviews/security/probes/p4-erasure.mjs
import {athlete,ELIG,notFeeling100WithSign} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
const code=r=>r.ok?'OK':r.error.code;
const t=athlete({id:'p4'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
t.set(run.date,'20:00');const stop=t.weekly(run.date,[{...t.form(run),actual:{...t.form(run).actual,minutes:15,stop:{reason:'SYMPTOM'}}}]);
t.set(run.date,'21:00');const v=t.version(),req={kind:'NOT_FEELING_100',...notFeeling100WithSign(run.date)};
const h=t.submit(req,{rid:'nf-1',expectedVersion:v});
const f08=t.rows().filter(r=>r.fact&&r.fact!=='INTERRUPTION_DECLARED').map(r=>r.eventId);
t.set(run.date,'22:00');const er=t.it.eraseHealthFacts({actor:t.actor,eventIds:f08,expectedVersion:t.version()});
const raw=JSON.parse(t.store.raw('p4'));const c=raw.carried;
const grepIn=(o,re)=>JSON.stringify(o).match(re)?.length??0;
console.log('A stop:',code(stop),'hold:',code(h),h.status,'erase:',code(er),er.erased);
console.log('A after erasure, carried.records.runFormatRecord mentions SYMPTOM:',/SYMPTOM/.test(JSON.stringify(c.records.runFormatRecord)),
 '| presentation.readings:',Object.keys(c.presentation.readings??{}),'| requests kept:',Object.keys(c.requests),'| custody requests kept:',Object.keys(raw.requests));
console.log('A request outcome nf-1 kept in carried:',JSON.stringify(c.requests['nf-1']?.outcome));
// B: the app retries nf-1 (an offline queue that never saw the first answer)
t.set(run.date,'22:30');const again=t.submit(req,{rid:'nf-1',expectedVersion:t.version()});
console.log('B retry of the erased request:',code(again),again.status,'replayed:',again.replayed??false,'| F08 facts on record again:',t.rows().filter(r=>r.fact&&r.fact!=='INTERRUPTION_DECLARED'&&r.fact!=='HEALTH_FACTS_ERASED').map(r=>r.fact));
console.log('B all facts now:',t.rows().filter(r=>r.fact).map(r=>r.fact),'| version advanced:',again.version,'| custody decisions tail:',t.doc().decisions.slice(-2).map(d=>d.kind+'/'+d.status));
