// QRE BC R2 probe 6 (cycle 1 on 220c005): (a) after an erasure, the re-sent duplicate now goes to the engine: does it record anything twice,
// is it idempotent under the same request id, and does the next duplicate take the shortcut again; (b) the SEC-INT-04 / SEC-BC-01 clock with
// lastAt read from where it is stored (doc().carried.lastAt; carried() does not expose it). Synthetic. Read-only.
// Usage: node p06-cycle1-edges.mjs <CoachingCore dir>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(process.argv[2]),H=await import(pathToFileURL(path.join(CC,'test/v1int-helpers.mjs')).href);
const {athlete,ELIG,U,notFeeling100WithSign}=H,code=r=>r.ok?'OK':r.error.code,out=(k,v)=>console.log(k.padEnd(70),JSON.stringify(v));
const STOP={completed:false,minutes:12,stop:{reason:'SYMPTOM'}};
{const t=athlete({id:'p6a'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 const f={...t.form(s),actual:STOP,response:U};t.weekly(s.date,[f]);t.set(s.date,'20:30');
 const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-p6a',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
 t.set(s.date,'21:00');t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()});
 const rows0=t.rows().filter(o=>!o.fact&&o.sessionId===s.id).length,live0=t.live(s.id).length,facts0=t.carried().runFormatRecord.length,v0=t.version();
 t.set(s.date,'21:10');const req={kind:'WEEKLY_REVIEW',observations:[f]},a=t.submit(req,{rid:'dup-after-erase',expectedVersion:v0}),v1=t.version();
 const b=t.submit(req,{rid:'dup-after-erase',expectedVersion:v0});
 out('(a) re-send after erasure: code / duplicate / duplicates / screen',[code(a),a.duplicate??false,a.duplicates??null,a.warningSignScreen?.reason??null]);
 out('(a) rows of the session, live rows, run-format facts: before -> after',[[rows0,live0,facts0],[t.rows().filter(o=>!o.fact&&o.sessionId===s.id).length,t.live(s.id).length,t.carried().runFormatRecord.length]]);
 out('(a) version step; same request id again: code / same answer / version',[v1-v0,code(b),JSON.stringify({...a,version:0})===JSON.stringify({...b,version:0}),t.version()-v1]);
 t.set(s.date,'21:20');const c=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});out('(a) the next duplicate (readings stored again): duplicate / screen',[c.duplicate??false,c.warningSignScreen?.reason??null]);}
{const t=athlete({id:'p6b'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'08:00');
 const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-p6b',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});t.set(s.date,'21:00');t.weekly(s.date,[t.form(s)]);
 const viaCarried=t.it.carried({actor:t.actor}).lastAt,stored=t.doc().carried?.lastAt;out('(b) lastAt via carried() / via doc().carried',[viaCarried??'undefined',stored]);
 t.clock-=86400e3;const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()});
 out('(b) erase at clock -1 day: code / stored lastAt unchanged',[code(e),t.doc().carried?.lastAt===stored]);
 t.clock+=2*86400e3;out('(b) clock restored: next review',code(t.weekly(s.date,[])));}
