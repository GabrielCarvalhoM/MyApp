// QRE R7-D Phase 3.5 check (QRE-R7D-PHASE35-CHECK-r1, Q4): the full suite on the survivors of qre2-p35-mutation.mjs. One full copy of the rebuilt
// candidate in a NEW directory (the lean copies lack the r2-r5 artifacts some older suites read); each mutant's source is written into that copy, the
// whole suite run, and the original bytes written back (verified by hash) before the next one. Nothing is deleted.
//   node qre2-p35-fullsuite.mjs --root <candidate archive with node_modules> --work <new dir> --ids Q01,Q10,... [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--root'),work=arg('--work'),ids=(arg('--ids')??'').split(',').filter(Boolean),outFile=arg('--out');
if(!root||!work||!ids.length)throw Error('--root --work --ids');
if(fs.existsSync(work))throw Error('--work must be a new directory');
import {MUTANTS} from './qre2-p35-mutants.mjs';
fs.mkdirSync(work,{recursive:true});
for(const p of ['CoachingCore','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json']){const d=path.join(work,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(path.join(root,p),d,{recursive:true});}
const cc=path.join(work,'CoachingCore'),f=path.join(cc,'src/r6-adaptation.mjs'),orig=fs.readFileSync(f),sha=b=>createHash('sha256').update(b).digest('hex');
const suite=()=>{const r=spawnSync(process.execPath,['--test'],{cwd:cc,encoding:'utf8',maxBuffer:1<<28,timeout:3600000});return {tests:Number(r.stdout.match(/ℹ tests (\d+)/)?.[1]??NaN),pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...r.stdout.matchAll(/^✖ (.*?) \(\d[\d.]*ms\)$/gm)].map(m=>m[1].slice(0,140)))].slice(0,12)};};
const results=[{id:'baseline',...suite()}];
for(const id of ids){
 const m=MUTANTS.find(x=>x.id===id);if(!m){results.push({id,error:'unknown'});continue;}
 let src=orig.toString('utf8');let ok=true;for(const [a,b] of [[m.from,m.to],...(m.then?[m.then]:[])]){if(src.split(a).length!==2){ok=false;break;}src=src.replace(a,b);}
 if(!ok){results.push({id,applied:false});continue;}
 fs.writeFileSync(f,src);const r=suite();fs.writeFileSync(f,orig);
 results.push({id,what:m.what,...r,restored:sha(fs.readFileSync(f))===sha(orig)});
}
const text=JSON.stringify({probe:'QRE2-P35-FULLSUITE-1',root,work,results},null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify(results.map(r=>({id:r.id,tests:r.tests,pass:r.pass,fail:r.fail,restored:r.restored}))));
