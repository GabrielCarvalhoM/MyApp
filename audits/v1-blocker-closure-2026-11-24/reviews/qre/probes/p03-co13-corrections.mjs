// QRE BC R1 probe 3: C-O1-3 after the athlete's own corrections of a disputed run (the focal test covers only a device re-sync), and the
// reading's determinism across a JSON round trip of the record. Synthetic. Read-only. Usage: node p03-co13-corrections.mjs <CoachingCore dir>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(process.argv[2]),H=await import(pathToFileURL(path.join(CC,'test/v1int-helpers.mjs')).href);
const {athlete,spy,ELIG,U}=H,code=r=>r.ok?'OK':r.error.code;
function scenario(order,fix){
 const sp=spy(),t=athlete({id:`p3-${order[0]}-${fix}`,engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');t.screen(ELIG(run.date));const minutes=t.form(run).actual.minutes+20;
 const watch=()=>t.import([t.watch(run,{endTime:'07:45'})]);
 let own=null;const form=()=>{const r=t.weekly(run.date,[t.form(run,{actual:{minutes},response:{recovery:'ADVERSE',effort:'HARDER'}})]);own=r.recorded?.[0]??own;return r;};
 for(const f of order==='device first'?[watch,form]:[form,watch]){t.clock+=60e3;f();}
 if(!own){const o=Object.entries(t.it.carried({actor:t.actor}).origins??{}).find(([,m])=>m.ch==='A'&&m.s===run.id);own=o?.[0]??null;}
 let fixCode=null;
 if(fix!=='none'){t.clock+=60e3;const base=t.form(run);
  const obs=fix==='amount only'?{...base,correctionOf:own,actual:{...base.actual,minutes:minutes+5},response:{...U,recovery:'ADVERSE',effort:'HARDER'}}
   :fix==='adverse withdrawn'?{...base,correctionOf:own,actual:{...base.actual,minutes:minutes+5},response:{...U,recovery:'COMPATIBLE'}}
   :/* agrees with the watch */{...base,correctionOf:own,response:{...U,recovery:'ADVERSE'}};
  fixCode=code(t.weekly(run.date,[obs]));}
 t.clock+=60e3;t.weekly(run.date,[]);const out=sp.calls.filter(c=>c.op==='evaluate').at(-1).out,row=t.live(run.id)[0];
 const voices=Object.values(row?.provenance?.parts??{}).map(p=>p?.response?.recovery??'-');
 return {order,fix,fixCode,flagged:row?.conflicted===true,rowRecovery:row?.response?.recovery,voices,adverse:out.weekEvidence?.adverseSessions,status:out.weekEvidence?.rows?.find(r=>r.sessionId===run.id)?.status};
}
for(const order of ['device first','athlete first'])for(const fix of ['none','amount only','adverse withdrawn','agrees with the watch'])console.log(JSON.stringify(scenario(order,fix)));
