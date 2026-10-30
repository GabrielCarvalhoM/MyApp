// Exact SELF-01 reproduction with historical controls. Scratch tree contains git blobs, never modified runtime.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'../../..'),audit='audits/domain-coaching-r7a-residual-authority-2026-10-30/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const serial=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(serial).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+serial(v[k])).join(',')+'}';
function digest(cc){return sha(serial(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(fs.readFileSync(path.join(cc,'src',f)))]))));}
if(process.argv.includes('--controls')){
 const F=JSON.parse(fs.readFileSync(path.join(repo,'CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json'),'utf8'));
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'codex-r7ara-self01-')),cc=path.join(scratch,'CoachingCore'),revision='f373b6c';
 for(const p of Object.keys(F.files).filter(p=>!p.startsWith('test/'))){const dest=path.join(cc,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,execFileSync('git',['show',revision+':CoachingCore/'+p],{cwd:repo}));}
 const trees={freeze:path.join(repo,'CoachingCore'),predecessor:path.join(repo,audit,'decision-authority-freeze-source/CoachingCore'),superseded:cc},results={};
 for(const [name,tree] of Object.entries(trees)){const r=spawnSync(process.execPath,[import.meta.filename],{cwd:repo,env:{...process.env,QE_ROOT:tree},encoding:'utf8',maxBuffer:10*1024*1024});if(r.status!==0)throw Error(name+': '+r.stderr);results[name]={sourceDigest:digest(tree),...JSON.parse(r.stdout)};}
 if(results.superseded.sourceDigest!=='259ab3eff431d2381d50904be7594d9fa122c7d8d2fc369e20d67b5419f84cb6')throw Error('superseded source digest mismatch');
 console.log(JSON.stringify({probe:'codex-self01-controls',revision,results},null,2));
 // The only removed directory is the exact fresh mkdtemp result under the OS temporary directory.
 const resolved=path.resolve(scratch),prefix=path.resolve(os.tmpdir())+path.sep;if(!resolved.toLowerCase().startsWith(prefix.toLowerCase())||!path.basename(resolved).startsWith('codex-r7ara-self01-'))throw Error('scratch cleanup path');fs.rmSync(resolved,{recursive:true});
}else{
 process.env.QE_ROOT??=path.join(repo,'CoachingCore');const L=await import('../probes/judges/qe/qe-r7ada-lib.mjs');
 const pause=(t,k,days)=>{const start=t.p.weeks[k].startDate,end=L.addDays(start,days-1),report=L.addDays(end,1),w=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=L.addDays(x.startDate,6));const r=L.step(t,L.at(t.p,w,0,'06:00:00',L.brk(start,end)));const d=r.proposal?.decisions.at(-1);if(d?.action!=='REESTABLISH')throw Error(r.reason);return {entry:d.interruption.entry.run,fromWeek:d.fromWeek,rows:t.p.weeks[d.fromWeek].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>({role:s.role,minutes:s.prescription.durationMinutes,dim:s.progression?.dimension,value:s.progression?.value}))};};
 L.resetIds();const t=L.gen({id:'codex-SELF01'});for(let w=0;w<3;w++)L.weekly(t,w);const first=pause(t,3,14);L.weekly(t,5);L.weekly(t,6);
 const history=L.history(t,7).state.run,executed=t.ledger.filter(o=>!o.superseded&&!o.conflicted&&!o.partial&&o.context?.sport==='RUN'&&o.context.weekIndex>=5).map(o=>{const s=t.p.weeks.flatMap(w=>w.sessions).find(s=>s.id===o.sessionId);return {week:o.context.weekIndex,role:s.role,minutes:s.prescription.durationMinutes,dimension:s.progression?.dimension,value:s.progression?.value};});
 const second=pause(t,7,14),defect=second.entry.mode!=='RETURN'||second.entry.returnStep!==0||second.entry.returnFrom.easy>15||second.entry.returnFrom.long>20;
 console.log(JSON.stringify({first,executed,historyBeforeSecond:{mode:history.mode,easy:history.easy,long:history.long},second,SELF_01_REPRODUCED:defect},null,2));
}
