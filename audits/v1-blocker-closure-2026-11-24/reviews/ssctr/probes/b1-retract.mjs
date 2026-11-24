// SSCTR BC R1 probe b1: C-O1-3 superset reading vs the athlete's own retraction inside an unresolved dispute. Synthetic. Read-only.
// Usage: node b1-retract.mjs <CoachingCore root>
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2];const H=await import(pathToFileURL(path.join(root,'test/v1int-helpers.mjs')).href);
const {athlete,spy,ELIG,U}=H;const code=r=>r.ok?'OK':r.error.code;
function run(label,order,fix){
 const sp=spy(),t=athlete({id:'b1-'+label,engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');t.screen(ELIG(run.date));
 const base=t.form(run).actual.minutes;
 const watch=()=>t.import([t.watch(run)]);
 const form=()=>t.weekly(run.date,[t.form(run,{actual:{minutes:base+20},response:{recovery:'ADVERSE',effort:'HARDER'}})]);
 let head=null;const steps=order==='device first'?[watch,form]:[form,watch];const out=[];for(const f of steps){t.clock+=60e3;const r=f();out.push(code(r));if(f===form)head=r.recorded?.[0]??null;}
 if(fix){t.clock+=60e3;const r=t.weekly(run.date,[{...t.form(run),correctionOf:head,...fix(base)}]);out.push(code(r)+(r.ok?'':JSON.stringify(r.error)));}
 t.clock+=60e3;out.push(code(t.weekly(run.date,[])));
 const ev=sp.calls.filter(c=>c.op==='evaluate').at(-1).out.weekEvidence,row=t.live(run.id)[0];
 const voices=Object.entries(row?.provenance?.parts??{}).map(([k,p])=>[k.slice(0,10),p?.response?.recovery,p?.actual?.minutes]);
 console.log(JSON.stringify({label,order,steps:out,flagged:row?.conflicted===true,rowRecovery:row?.response?.recovery,voices,adverseSessions:ev?.adverseSessions,status:ev?.rows?.find(r=>r.sessionId===run.id)?.status,kind:ev?.rows?.find(r=>r.sessionId===run.id)?.kind}));
}
for(const order of ['device first','athlete first']){
 run('no-fix',order,null);
 run('nonresolving-keep-adverse',order,b=>({actual:{completed:true,minutes:b+25},response:{...U,recovery:'ADVERSE'}}));
 run('nonresolving-impaired-only',order,b=>({actual:{completed:true,minutes:b+25},response:{...U,nextDayFunction:'IMPAIRED'}}));
 run('retract-recovery-keep-amount',order,b=>({actual:{completed:true,minutes:b+20},response:{...U,recovery:'COMPATIBLE'}}));
 run('retract-to-unknown-keep-amount',order,b=>({actual:{completed:true,minutes:b+20},response:{...U}}));
 run('agree-amount-and-retract',order,b=>({actual:{completed:true,minutes:b},response:{...U,recovery:'COMPATIBLE'}}));
 run('agree-amount-keep-adverse',order,b=>({actual:{completed:true,minutes:b},response:{...U,recovery:'ADVERSE'}}));
}
