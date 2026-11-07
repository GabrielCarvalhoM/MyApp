// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q2/Q4): the mutants of qre3-p35-mutants.mjs on the rebuilt candidate 33d3181.
// Directed mode: each mutant is a lean copy of the rebuild in a NEW directory (never deleted, never restored in place) with its exact text edits, and
// the five R7-D directed files (3.1 to 3.5) are run on it; the failing tests are listed (the witnesses). Full mode: one full copy of the rebuild in a NEW
// directory; each listed mutant's source is written into it, the whole suite is run, and the original bytes are written back and checked by hash.
//   node qre3-p35-mutation.mjs --root <rebuild> --work <new dir> [--only id,id] [--jobs n] [--out <file>]
//   node qre3-p35-mutation.mjs --full --root <rebuild> --work <new dir> --only id,id [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {MUTANTS} from './qre3-p35-mutants.mjs';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--root'),work=arg('--work'),outFile=arg('--out'),only=arg('--only')?.split(',')??null,full=process.argv.includes('--full'),jobs=Number(arg('--jobs')??6);
if(!root||!work)throw Error('--root <rebuild> --work <new dir>');
if(fs.existsSync(work))throw Error('--work must be a new directory: '+work);
fs.mkdirSync(work,{recursive:true});
const RECORDS=['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json','audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json','audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'];
const LEAN=['CoachingCore/src','CoachingCore/test','CoachingCore/r7','CoachingCore/r6/fixtures','CoachingCore/r6/PROGRAM_POLICY_R6.json','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','CoachingCore/r3/BOUNDED_POLICY_CANDIDATES_R3.json','CoachingCore/package.json','CoachingCore/POLICY_REGISTRY_RUNTIME_BINDINGS.json','CoachingCore/SHADOW_DECISION_SCHEMA.json','CoachingCore/SHADOW_INPUT_SCHEMA.json','CoachingCore/node_modules',...RECORDS];
const F='CoachingCore/src/r6-adaptation.mjs';
const FILES=['test/r7d-phase35.test.mjs','test/r7d-phase34.test.mjs','test/r7d-phase33.test.mjs','test/r7d-phase32.test.mjs','test/r7d-phase31.test.mjs'];
const sha=b=>createHash('sha256').update(b).digest('hex');
const run=(cc,files)=>new Promise(res=>{const p=spawn(process.execPath,['--test',...files],{cwd:cc});let out='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
 p.on('close',status=>res({status,tests:Number(out.match(/ℹ tests (\d+)/)?.[1]??NaN),pass:Number(out.match(/ℹ pass (\d+)/)?.[1]??NaN),fail:Number(out.match(/ℹ fail (\d+)/)?.[1]??NaN),failed:[...new Set([...out.matchAll(/^✖ (.*?) \(\d[\d.]*ms\)$/gm)].map(m=>m[1].slice(0,140)))].filter(x=>x!=='failing tests:')}));});
const mutate=(src,m)=>{for(const [a,b] of [[m.from,m.to],...(m.then?[m.then]:[])]){const n=src.split(a).length-1;if(n!==1||a===b)return {applied:false,occurrences:n,identical:a===b,edit:a.slice(0,90)};src=src.replace(a,b);}return {applied:true,src};};
const buildOnly=process.argv.includes('--build-only');
const list=MUTANTS.filter(m=>(buildOnly||!m.harnessOnly)&&(!only||only.includes(m.id)));
const results=[];
if(buildOnly){
 // --build-only: the lean mutant copies only (harness-only mutants included), for the harness and runtime probes.
 for(const m of list){const dir=path.join(work,m.id);for(const p of LEAN){const s=path.join(root,p);if(!fs.existsSync(s))continue;const d=path.join(dir,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(s,d,{recursive:true});}
  const f=path.join(dir,F),x=mutate(fs.readFileSync(f,'utf8'),m);if(x.applied)fs.writeFileSync(f,x.src);results.push({id:m.id,what:m.what,dir,applied:x.applied,...(x.applied?{mutatedSha256:sha(fs.readFileSync(f))}:{occurrences:x.occurrences})});}
}else if(!full){
 const build=dir=>{for(const p of LEAN){const s=path.join(root,p);if(!fs.existsSync(s))continue;const d=path.join(dir,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(s,d,{recursive:true});}};
 const bdir=path.join(work,'baseline');build(bdir);results.push({id:'baseline',...await run(path.join(bdir,'CoachingCore'),FILES)});
 const queue=[...list];
 const worker=async()=>{while(queue.length){const m=queue.shift(),dir=path.join(work,m.id);build(dir);const f=path.join(dir,F),x=mutate(fs.readFileSync(f,'utf8'),m);
  if(!x.applied){results.push({id:m.id,what:m.what,...x,src:undefined});continue;}
  fs.writeFileSync(f,x.src);const t=await run(path.join(dir,'CoachingCore'),FILES);results.push({id:m.id,what:m.what,applied:true,mutatedSha256:sha(fs.readFileSync(f)),directed:{tests:t.tests,pass:t.pass,fail:t.fail,failed:t.failed},killed:t.fail>0});}};
 await Promise.all(Array.from({length:jobs},worker));
}else{
 for(const p of ['CoachingCore',...RECORDS]){const d=path.join(work,p);fs.mkdirSync(path.dirname(d),{recursive:true});fs.cpSync(path.join(root,p),d,{recursive:true});}
 const cc=path.join(work,'CoachingCore'),f=path.join(cc,'src/r6-adaptation.mjs'),orig=fs.readFileSync(f);
 results.push({id:'baseline',...await run(cc,[])});
 for(const m of list){const x=mutate(orig.toString('utf8'),m);if(!x.applied){results.push({id:m.id,...x,src:undefined});continue;}
  fs.writeFileSync(f,x.src);const r=await run(cc,[]);fs.writeFileSync(f,orig);results.push({id:m.id,what:m.what,...r,killed:r.fail>0,restored:sha(fs.readFileSync(f))===sha(orig)});}
}
const order=new Map(['baseline',...list.map(m=>m.id)].map((id,i)=>[id,i]));results.sort((a,b)=>order.get(a.id)-order.get(b.id));
const text=JSON.stringify({probe:'QRE3-P35-MUTATION-1',mode:buildOnly?'BUILD_ONLY':full?'FULL_SUITE':'DIRECTED',root,work,sourceSha256:sha(fs.readFileSync(path.join(root,F))),results},null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify(results.map(r=>({id:r.id,applied:r.applied,killed:r.killed,d:r.directed?`${r.directed.pass}/${r.directed.fail}`:r.pass!==undefined?`${r.pass}/${r.fail}`:undefined,failed:(r.directed?.failed??r.failed)?.slice(0,3)}))));
