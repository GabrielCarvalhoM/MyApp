// QRE BC R1 probe 1: edges of the boundary fixes (SSCTR-INT-R2-01, G07, SEC-INT-04 rest, SEC-INT-06, SEC-INT-07), synthetic athletes only.
// Read-only against the tree it is pointed at. Usage: node p01-boundary-edges.mjs <CoachingCore dir>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(process.argv[2]),imp=f=>import(pathToFileURL(path.join(CC,f)).href);
const H=await imp('test/v1int-helpers.mjs'),{LIMITS}=await imp('src/boundary/admission.mjs');
const {athlete,ELIG,U,addDays,at,fileStore,scratchDir,notFeeling100WithSign}=H;
const code=r=>r.ok?'OK':r.error.code,out=(k,v)=>console.log(k.padEnd(64),JSON.stringify(v));
const STOP={completed:false,minutes:12,stop:{reason:'SYMPTOM'}};

// (a) SSCTR-INT-R2-01 x G07: after an erasure of health facts the stop is retained and the screen is still required (G07), but the
// duplicate-only answer reads presentation.readings, which the erasure set to null.
{const t=athlete({id:'p1a'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 const f={...t.form(s),actual:STOP,response:U};const first=t.weekly(s.date,[f]);out('(a) stop sent: screen',first.warningSignScreen?.reason??null);
 t.set(s.date,'20:30');const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-p1a',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
 t.set(s.date,'21:00');const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()});out('(a) erase',code(e));
 t.set(s.date,'21:10');const dupNoElig=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});
 out('(a) duplicate-only re-send (no eligibility): duplicate / screen',[dupNoElig.duplicate??false,dupNoElig.warningSignScreen?.reason??null,code(dupNoElig)]);
 t.set(s.date,'21:20');const empty=t.submit({kind:'WEEKLY_REVIEW',observations:[]});out('(a) empty review right after (engine call): screen',[code(empty),empty.warningSignScreen?.reason??null]);
 t.set(s.date,'21:30');const dup2=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});out('(a) duplicate-only after that engine call: screen',[dup2.duplicate??false,dup2.warningSignScreen?.reason??null]);}

// (a2) Same without erasure, but before any review: the duplicate answer right after the first send (control of the fix).
{const t=athlete({id:'p1a2'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 const f={...t.form(s),actual:STOP,response:U};t.weekly(s.date,[f]);t.set(s.date,'20:10');const d=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});
 out('(a2) control: duplicate-only, no erasure: screen',[d.duplicate??false,d.warningSignScreen?.reason??null]);}

// (b) G07 + SEC-INT-04 rest: a failed erasure keeps the screen; an erasure under a behind clock, then the clock restored: reviews and
// deliveries continue, the record survives a restore from a file store, and lastAt never moved back.
{const dir=scratchDir('p1b'),t=athlete({id:'p1b',store:fileStore(dir)});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'08:00');
 t.screen(ELIG(s.date));const scr0=t.it.carried({actor:t.actor}).screen;
 const bad=t.it.eraseHealthFacts({actor:t.actor,eventIds:['no-such-id'],expectedVersion:t.version()});
 out('(b) erasure of an unknown id: code / screen kept',[code(bad),JSON.stringify(t.it.carried({actor:t.actor}).screen)===JSON.stringify(scr0)]);
 const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-p1b',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
 t.set(s.date,'21:00');t.weekly(s.date,[t.form(s)]);const lastAt=t.it.carried({actor:t.actor}).lastAt,v0=t.version();t.clock-=86400e3;
 const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:v0});out('(b) erase under clock -1 day',[code(e),t.it.carried({actor:t.actor}).lastAt===lastAt]);
 const retry=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:v0});out('(b) the same erasure retried (stale version)',code(retry));
 const u=athlete({id:'p1b',store:fileStore(dir)});u.clock=t.clock+2*86400e3;
 out('(b) restored from the file store: lastAt / screen',[u.it.carried({actor:u.actor}).lastAt===lastAt,u.it.carried({actor:u.actor}).screen??null]);
 const run=u.sessions(0).find(x=>x.id==='w0-run-d3');u.set(run.date,'20:00');
 out('(b) delivery after restore, no screen',code(u.import([u.watch(run)])));
 out('(b) delivery after the athlete answers a screen',code(u.import([u.watch(run)],{eligibility:ELIG(run.date)})));}

// (c) SEC-INT-07, athlete channel per day: 8 unplanned athlete reports on a day, then a plain 9th refused, three with a stop admitted,
// then a 4th with a stop refused. (The focal test exercises only the device per-day path.)
{const t=athlete({id:'p1c'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'23:00');t.screen(ELIG(s.date));
 const free=(k,extra={})=>({occurrenceDate:s.date,actual:{completed:true,minutes:20+k,...(extra.actual??{})},response:{...U,...(extra.response??{})}});
 const seq=[];for(let k=0;k<LIMITS.reportsPerDayPerChannel;k++){t.clock+=60e3;seq.push(code(t.weekly(s.date,[free(k)])));}
 t.clock+=60e3;seq.push('plain:'+code(t.weekly(s.date,[free(50)])));
 for(let k=0;k<4;k++){t.clock+=60e3;seq.push('stop:'+code(t.weekly(s.date,[free(60+k,{actual:{completed:false,minutes:5,stop:{reason:'SYMPTOM'}}})])));}
 out('(c) athlete per-day: 8 plain, plain, 4 with a stop',seq);
 const u=athlete({id:'p1c2'});u.enroll();const s2=u.sessions(0).find(x=>x.id==='w0-run-d1');u.set(s2.date,'23:00');u.screen(ELIG(s2.date));
 const seq2=[];for(let k=0;k<LIMITS.reportsPerDayPerChannel;k++){u.clock+=60e3;seq2.push(code(u.weekly(s2.date,[free(k)])));}
 for(const r of [{recovery:'ADVERSE'},{nextDayFunction:'IMPAIRED'},{effort:'TOO_HARD'}]){u.clock+=60e3;seq2.push(Object.keys(r)[0]+':'+code(u.weekly(s2.date,[free(70,{response:r})])));}
 out('(c) athlete per-day past the limit: ADVERSE, IMPAIRED, TOO_HARD',seq2.slice(-3));}

// (d) SEC-INT-07 idempotency: the same request id sent again past the limit returns the stored answer, admits nothing new.
{const t=athlete({id:'p1d'});t.enroll();const str=t.sessions(0).find(s=>s.sport==='STRENGTH');t.set(str.date,'08:00');let head=t.weekly(str.date,[t.form(str)]).recorded[0];
 for(let k=1;k<=LIMITS.correctionsPerReport;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:20+k}}]);head=r.recorded[0];}
 t.clock+=60e3;const v=t.version(),req={kind:'WEEKLY_REVIEW',eligibility:ELIG(str.date),observations:[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,stop:{reason:'SYMPTOM'},minutes:5}}]};
 const a=t.submit(req,{rid:'excess-1',expectedVersion:v});const b=t.submit(req,{rid:'excess-1',expectedVersion:v});
 out('(d) excess correction, then the same request id again',[code(a),code(b),JSON.stringify(a.recorded)===JSON.stringify(b.recorded),t.version()-v]);}

// (e) SEC-INT-06: the refusal names the index and the first day; a correction of a report from the first day is admitted; a request
// mixing an old and a new report is refused whole (the native queue sets the named index aside).
{const t=athlete({id:'p1e'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');const first=t.doc().createdAt.slice(0,10);t.set(run.date,'21:00');t.screen(ELIG(run.date));
 const w=t.watch(run);delete w.sessionId;
 const mix=t.import([{...w,activityId:'HK-new',observedAt:at(run.date,'06:00')},{...w,activityId:'HK-old',observedAt:at(addDays(first,-1),'07:00')}]);
 out('(e) mixed request',[code(mix),mix.error?.index,mix.error?.firstDay??mix.error?.details?.firstDay??null]);
 const day0=t.import([{...w,activityId:'HK-d0',observedAt:at(first,'06:00')}]);out('(e) a workout on the enrollment day before the enrollment instant',code(day0));}

// (f) SEC-INT-06 x safety: an athlete report with a stop dated the day before the record began is refused; the refusal names the safety
// fields it carried (so the app keeps the draft), as every admission refusal does.
{const t=athlete({id:'p1f'});t.enroll();const first=t.doc().createdAt.slice(0,10);t.set(first,'20:00');
 const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(first),observations:[{occurrenceDate:addDays(first,-1),actual:{completed:false,minutes:10,stop:{reason:'SYMPTOM'}},response:{...U,recovery:'ADVERSE'}}]});
 out('(f) stop dated before the record began: code / safetyFields',[code(r),r.safetyFields??null]);}
