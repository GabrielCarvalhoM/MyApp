// QRE R7-D Phase 3.5 check (QRE-R7D-PHASE35-CHECK-r1, Q2/Q4): targeted mutants of the Phase 3.5 runtime delta, independent of the author's
// P35-M01..M12. Each mutant is a lean copy of the rebuilt candidate in a NEW directory (never deleted, never restored in place) with one exact text
// edit (each `from` must occur once), then the five R7-D directed files (3.1 to 3.5) are run on it; a survivor is re-run on the full suite.
//   node qre2-p35-mutation.mjs --root <candidate archive> --work <new scratch dir> [--only id,id] [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--root'),work=arg('--work'),outFile=arg('--out'),only=arg('--only')?.split(',')??null,full=process.argv.includes('--full');
if(!root||!work)throw Error('--root <archive> --work <new dir>');
if(fs.existsSync(work))throw Error('--work must be a new directory: '+work);
fs.mkdirSync(work,{recursive:true});
const LEAN=['CoachingCore/src','CoachingCore/test','CoachingCore/r7','CoachingCore/r6/fixtures','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','CoachingCore/r3/BOUNDED_POLICY_CANDIDATES_R3.json','CoachingCore/package.json','CoachingCore/POLICY_REGISTRY_RUNTIME_BINDINGS.json','CoachingCore/SHADOW_DECISION_SCHEMA.json','CoachingCore/SHADOW_INPUT_SCHEMA.json','CoachingCore/node_modules',
 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const F='CoachingCore/src/r6-adaptation.mjs';
const FILES=['test/r7d-phase35.test.mjs','test/r7d-phase34.test.mjs','test/r7d-phase33.test.mjs','test/r7d-phase32.test.mjs','test/r7d-phase31.test.mjs'];
import {MUTANTS} from './qre2-p35-mutants.mjs';
const literal=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const runTests=(cc,files)=>{const r=spawnSync(process.execPath,['--test',...files],{cwd:cc,encoding:'utf8',maxBuffer:1<<27,timeout:3600000});
 return {status:r.status,pass:Number(r.stdout.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(r.stdout.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...r.stdout.matchAll(/^✖ (.*?) \(\d[\d.]*ms\)$/gm)].map(m=>m[1].slice(0,120)))]};};
const build=(dir,m)=>{for(const p of LEAN){const s=path.join(root,p);if(!fs.existsSync(s))continue;const d=path.join(dir,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(s,d,{recursive:true});}
 if(!m)return {applied:true};const f=path.join(dir,F);let src=fs.readFileSync(f,'utf8');
 for(const [a,b] of [[m.from,m.to],...(m.then?[m.then]:[])]){const n=src.split(a).length-1;if(n!==1)return {applied:false,occurrences:n,edit:a.slice(0,80)};src=src.replace(a,b);}
 fs.writeFileSync(f,src);return {applied:true};};
const results=[];
if(process.argv.includes('--build-only')){for(const m of MUTANTS.filter(x=>!only||only.includes(x.id))){const dir=path.join(work,m.id);results.push({id:m.id,dir,...build(dir,m)});}}
else{
 const bdir=path.join(work,'baseline');build(bdir,null);const baseline=runTests(path.join(bdir,'CoachingCore'),FILES);results.push({id:'baseline',...baseline});
 for(const m of MUTANTS.filter(x=>!x.harnessOnly&&(!only||only.includes(x.id)))){
  const dir=path.join(work,m.id),b=build(dir,m);if(!b.applied){results.push({id:m.id,what:m.what,...b});continue;}
  const t=runTests(path.join(dir,'CoachingCore'),FILES),killed=t.fail>0;
  const suite=!killed&&full?runTests(path.join(dir,'CoachingCore'),[]):null;
  results.push({id:m.id,what:m.what,directed:{pass:t.pass,fail:t.fail,failed:t.failed},killed,fullSuite:suite?{pass:suite.pass,fail:suite.fail,failed:suite.failed}:null});
 }
}
const text=JSON.stringify({probe:'QRE2-P35-MUTATION-1',root,work,results},null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify(results.map(r=>({id:r.id,applied:r.applied,killed:r.killed,directed:r.directed?`${r.directed.pass}/${r.directed.fail}`:undefined,failed:r.directed?.failed?.slice(0,3),full:r.fullSuite?`${r.fullSuite.pass}/${r.fullSuite.fail}`:undefined,base:r.pass!==undefined?`${r.pass}/${r.fail}`:undefined}))));
