// SEC_BC_R1 probe q3 (SSCTR-INT-R2-01 x G07): after a symptom stop and an erasure of health facts, the stop is retained and the screen is still
// required; what does a duplicate-only answer (no engine call) say of the screen?
// Usage: node q3-duplicate-after-erasure.mjs <root containing CoachingCore>   (synthetic athlete only)
import {pathToFileURL} from 'node:url';
const root=process.argv[2];if(!root)throw new Error('usage: node q3-duplicate-after-erasure.mjs <root>');
const {athlete,notFeeling100WithSign,U}=await import(pathToFileURL(`${root}/CoachingCore/test/v1int-helpers.mjs`).href);
const code=r=>r.ok?'OK':r.error.code;
const t=athlete({id:'q3'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
const f={...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U};
const first=t.weekly(s.date,[f]);
t.set(s.date,'20:30');const dupBefore=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});
t.set(s.date,'21:00');const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-q3',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
t.set(s.date,'21:30');const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()});
t.set(s.date,'22:00');const dupAfter=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});
t.set(s.date,'22:30');const plain=t.submit({kind:'WEEKLY_REVIEW',observations:[]});
console.log(JSON.stringify({first:[code(first),first.warningSignScreen?.reason??null],dupBefore:[code(dupBefore),dupBefore.duplicate??false,dupBefore.warningSignScreen?.reason??null],
 erase:code(e),dupAfter:[code(dupAfter),dupAfter.duplicate??false,dupAfter.warningSignScreen?.reason??null],plainReview:[code(plain),plain.warningSignScreen?.reason??null]}));
