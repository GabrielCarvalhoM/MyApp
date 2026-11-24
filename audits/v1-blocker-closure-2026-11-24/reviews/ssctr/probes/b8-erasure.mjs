// SSCTR BC R1 probe b8 (G07): what an erasure of health facts leaves the coach with. (1) a symptom stop, then a NOT_FEELING_100 with a warning
// sign, erased; (2) the same without the stop. Status, warning-sign screen and deliveries after the erasure, then after a new screen.
// Usage: node b8-erasure.mjs <CoachingCore root>. Synthetic; read-only.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2];const H=await import(pathToFileURL(path.join(root,'test/v1int-helpers.mjs')).href);
const {athlete,ELIG,U,notFeeling100WithSign,addDays}=H;const code=r=>r.ok?'OK':r.error.code;
function go(label,withStop){
 const t=athlete({id:'b8-'+(withStop?1:0)});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 if(withStop)t.weekly(s.date,[{...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U}]);else t.weekly(s.date,[t.form(s)]);
 t.set(s.date,'21:00');const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
 t.set(s.date,'21:10');const before=t.submit({kind:'WEEKLY_REVIEW',observations:[]});
 t.set(s.date,'21:30');const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()});
 t.set(s.date,'21:40');const after=t.submit({kind:'WEEKLY_REVIEW',observations:[]});
 const run=t.sessions(0).find(x=>x.id==='w0-run-d3');t.set(run.date,'20:00');const imp=t.it.importActivities({actor:t.actor,clientRequestId:'hk',expectedVersion:t.version(),activities:[t.watch(run)]});
 t.set(run.date,'20:10');const sc=t.weekly(run.date,[]);
 console.log(label.padEnd(16),'NF:',nf.ok?nf.status??'ok':nf.error?.code,'| before erase:',before.ok?before.status:code(before),before.warningSignScreen?.reason??'-',
  '| erase:',code(e),'| after:',after.ok?after.status:code(after),after.warningSignScreen?.reason??'-','| delivery:',code(imp),'| new screen:',sc.ok?sc.status:code(sc),sc.warningSignScreen?.reason??'-');
}
go('stop + NF sign',true);go('NF sign only',false);
