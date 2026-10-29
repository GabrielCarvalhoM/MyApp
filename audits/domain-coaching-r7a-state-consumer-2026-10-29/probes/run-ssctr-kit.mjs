// Author runner (state model consumer closure): re-runs, unchanged, the SSCTR's own regression kit — every instrument its R7ASM-SSCTR-r1 runner ran
// on the live tree (audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs/RUNS.json: same script, same environment), except
// the predecessor variants (.PRED) and the literature search — on the CoachingCore tree R7ASC_CC selects (default: the live tree; SSCTR_CC is set
// to it for the instruments that read it). Outputs go to <outDir>/<name>.out.json, never into a reviewer's folder; the one instrument that writes
// a data file (R7A_PROBE_OUT) writes it into <outDir>. TEMP/TMP point at R7ASC_TMP when set. The source digest of the tree is recorded before and
// after every job (<outDir>/RUNS.json). Usage: node run-ssctr-kit.mjs <outDir> [name-or-prefix ...]   (CONC, default 8)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),out=path.resolve(process.argv[2]??path.join(here,'kit'));
const cc=process.env.R7ASC_CC?path.resolve(process.env.R7ASC_CC):path.join(root,'CoachingCore');
const canonical=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
const hash=v=>createHash('sha256').update(canonical(v)).digest('hex'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const digestOf=tree=>hash(Object.fromEntries(fs.readdirSync(path.join(tree,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(path.join(tree,'src',f))])));
const kit=JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs/RUNS.json'),'utf8')).runs.filter(r=>!r.name.endsWith('.PRED')&&r.name!=='literature');
const want=process.argv.slice(3),jobs=kit.filter(r=>!want.length||want.some(w=>r.name===w||r.name.startsWith(w)));
fs.mkdirSync(out,{recursive:true});
const env0={...process.env,...(process.env.R7ASC_TMP?{TEMP:process.env.R7ASC_TMP,TMP:process.env.R7ASC_TMP}:{}),...(process.env.R7ASC_CC?{SSCTR_CC:cc}:{})};
const record=fs.existsSync(path.join(out,'RUNS.json'))?JSON.parse(fs.readFileSync(path.join(out,'RUNS.json'),'utf8')):{revision:'R7ASC-SSCTR-KIT-RUNS',runs:[]};
const run=job=>new Promise(resolve=>{
 // The instrument joins R7A_PROBE_OUT to its own folder, so the data file's path is given relative to that folder.
 const env={...env0,...job.env};if('R7A_PROBE_OUT' in job.env)env.R7A_PROBE_OUT=path.relative(path.dirname(path.join(root,job.script)),path.join(out,job.name+'.data.json'));
 const start=digestOf(cc),t0=Date.now(),o=fs.openSync(path.join(out,job.name+'.out.json'),'w'),e=fs.openSync(path.join(out,job.name+'.err.txt'),'w');
 const p=spawn(process.execPath,[path.join(root,job.script)],{cwd:path.dirname(path.join(root,job.script)),env,stdio:['ignore',o,e]});
 p.on('close',code=>{fs.closeSync(o);fs.closeSync(e);const end=digestOf(cc);resolve({name:job.name,script:job.script,scriptSha256:sha(path.join(root,job.script)),env:job.env,exit:code,seconds:Math.round((Date.now()-t0)/1000),sourceDigestStart:start,sourceDigestEnd:end,outSha256:sha(path.join(out,job.name+'.out.json')),stderrBytes:fs.statSync(path.join(out,job.name+'.err.txt')).size});});
});
const queue=[...jobs].sort((a,b)=>(b.seconds??0)-(a.seconds??0)),done=[],CONC=Number(process.env.CONC??8);
await Promise.all(Array.from({length:CONC},async()=>{while(queue.length){const j=queue.shift();done.push(await run(j));}}));
const names=new Set(done.map(r=>r.name));record.runs=[...record.runs.filter(r=>!names.has(r.name)),...done].sort((a,b)=>a.name<b.name?-1:1);record.updatedAt=new Date().toISOString();record.tree=cc;record.node=process.version;
fs.writeFileSync(path.join(out,'RUNS.json'),JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({out,jobs:done.length,failed:done.filter(r=>r.exit!==0).map(r=>r.name),unbound:done.filter(r=>r.sourceDigestStart!==r.sourceDigestEnd).map(r=>r.name)}));
